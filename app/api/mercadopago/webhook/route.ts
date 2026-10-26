import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { mercadopagoFetch } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Notificacion = {
  type?: string;
  topic?: string;
  data?: { id?: string | number };
};

type Pago = {
  id?: string | number;
  status?: string;
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  currency_id?: string;
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function responder(status = 200) {
  return new Response(null, { status });
}

function firmaValida(request: Request, dataId: string) {
  const secreto = process.env.MP_WEBHOOK_SECRET?.trim();

  if (!secreto) {
    console.warn(
      "MP_WEBHOOK_SECRET no configurado: se valida el pago contra la API de Mercado Pago.",
    );
    return true;
  }

  const firma = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const partes = Object.fromEntries(
    firma.split(",").map((parte) => {
      const [clave, ...resto] = parte.split("=");
      return [clave?.trim(), resto.join("=").trim()];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;

  if (!ts || !v1 || !requestId) return false;

  const esperado = createHmac("sha256", secreto)
    .update(`id:${dataId};request-id:${requestId};ts:${ts};`)
    .digest("hex");
  const recibido = Buffer.from(v1.toLowerCase(), "hex");
  const calculado = Buffer.from(esperado, "hex");

  return (
    recibido.length === calculado.length &&
    timingSafeEqual(recibido, calculado)
  );
}

function revalidarCatalogo() {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[id]", "page");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/[id]", "page");
}

export async function POST(request: Request) {
  let notificacion: Notificacion;

  try {
    notificacion = (await request.json()) as Notificacion;
  } catch {
    return responder(400);
  }

  const url = new URL(request.url);
  const tipo =
    notificacion.type ??
    notificacion.topic ??
    url.searchParams.get("type") ??
    url.searchParams.get("topic");
  const idBruto =
    notificacion.data?.id ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id");

  if (tipo !== "payment") return responder();

  const pagoId = String(idBruto ?? "");

  if (!/^\d+$/.test(pagoId)) {
    console.warn("Webhook de Mercado Pago sin id de pago válido.");
    return responder(400);
  }

  if (!firmaValida(request, pagoId)) {
    console.warn(`Firma inválida en webhook de Mercado Pago (pago ${pagoId}).`);
    return responder(401);
  }

  let pago: Pago;

  try {
    const respuesta = await mercadopagoFetch(
      `/v1/payments/${encodeURIComponent(pagoId)}`,
    );

    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        console.warn(`Mercado Pago no encontró el pago ${pagoId}.`);
        return responder();
      }

      console.error(
        `Error ${respuesta.status} al consultar el pago ${pagoId} en Mercado Pago.`,
      );
      return responder(500);
    }

    pago = (await respuesta.json()) as Pago;
  } catch (error) {
    console.error(`No se pudo consultar el pago ${pagoId}:`, error);
    return responder(500);
  }

  if (pago.status !== "approved") return responder();

  const pedidoId = pago.external_reference;

  if (typeof pedidoId !== "string" || !UUID.test(pedidoId)) {
    console.warn(
      `Pago ${pagoId} aprobado sin external_reference de pedido válido.`,
    );
    return responder();
  }

  const supabase = createSupabaseAdminClient();
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .select("total")
    .eq("id", pedidoId)
    .maybeSingle();

  if (pedidoError) {
    console.error(`No se pudo leer el pedido ${pedidoId}:`, pedidoError);
    return responder(500);
  }

  if (!pedido) {
    console.warn(`Pago ${pagoId} apunta a un pedido inexistente: ${pedidoId}.`);
    return responder();
  }

  const total = Number(pedido.total);
  const monto = Number(pago.transaction_amount);

  if (
    pago.currency_id !== "ARS" ||
    !Number.isFinite(total) ||
    !Number.isFinite(monto) ||
    Math.abs(total - monto) > 0.009
  ) {
    console.error(
      `Pago ${pagoId} no coincide con el pedido ${pedidoId}: ${monto} ${pago.currency_id} vs ${total} ARS.`,
    );
    return responder();
  }

  const { data, error } = await supabase.rpc("confirmar_pago_pedido", {
    p_pedido_id: pedidoId,
    p_payment_id: pagoId,
  });

  if (error) {
    console.error(`No se pudo confirmar el pedido ${pedidoId}:`, error);
    return responder(500);
  }

  const estado = (data as { estado?: string } | null)?.estado;

  if (estado === "pagado" || estado === "ya_pagado") {
    revalidarCatalogo();
    return responder();
  }

  console.error(
    `Pago ${pagoId} aprobado, pero el pedido ${pedidoId} quedó en estado "${estado}". Requiere revisión y posible reembolso.`,
  );

  return responder();
}
