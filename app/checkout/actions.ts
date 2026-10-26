"use server";

import { headers } from "next/headers";
import { normalizarIdProducto } from "@/lib/productos";
import { mercadopagoFetch } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { COSTE_ENVIO, ENVIO_GRATIS_DESDE } from "@/lib/utils";
import type { ItemCarrito, ResultadoCheckout } from "@/types";

const MAX_ITEMS = 100;
const MAX_CANTIDAD = 9999;
const MAX_NOMBRE = 120;
const MAX_EMAIL = 254;
const MAX_TELEFONO = 40;
const MAX_DIRECCION = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ItemPedido = {
  producto_id: string;
  variante_id: string;
  cantidad: number;
};

type LineaPedido = ItemPedido & {
  precio_unitario: number;
};

type CatalogoFila = {
  id: string;
  nombre: string;
  variantes: { id: string; talle: string; color: string }[] | null;
};

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function leerItems(valor: FormDataEntryValue | null): ItemPedido[] | null {
  if (typeof valor !== "string") return null;

  let datos: unknown;

  try {
    datos = JSON.parse(valor);
  } catch {
    return null;
  }

  if (
    !Array.isArray(datos) ||
    datos.length === 0 ||
    datos.length > MAX_ITEMS
  ) {
    return null;
  }

  const items: ItemPedido[] = [];

  for (const dato of datos) {
    if (!dato || typeof dato !== "object") return null;

    const { productoId, varianteId, cantidad } =
      dato as Partial<ItemCarrito>;

    if (
      typeof productoId !== "string" ||
      typeof varianteId !== "string" ||
      !productoId ||
      !varianteId ||
      productoId.length > 100 ||
      varianteId.length > 100 ||
      typeof cantidad !== "number" ||
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > MAX_CANTIDAD
    ) {
      return null;
    }

    items.push({
      producto_id: normalizarIdProducto(productoId),
      variante_id: varianteId,
      cantidad,
    });
  }

  return items;
}

function leerLineas(valor: unknown): LineaPedido[] | null {
  if (!Array.isArray(valor) || valor.length === 0) return null;

  const lineas: LineaPedido[] = [];

  for (const dato of valor) {
    if (!dato || typeof dato !== "object") return null;

    const {
      producto_id,
      variante_id,
      cantidad,
      precio_unitario,
    } = dato as Record<string, unknown>;
    const precio = Number(precio_unitario);

    if (
      typeof producto_id !== "string" ||
      typeof variante_id !== "string" ||
      !producto_id ||
      !variante_id ||
      typeof cantidad !== "number" ||
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      return null;
    }

    lineas.push({
      producto_id,
      variante_id,
      cantidad,
      precio_unitario: precio,
    });
  }

  return lineas;
}

async function borrarPedido(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  id: string,
) {
  const { error } = await supabase.from("pedidos").delete().eq("id", id);

  if (error) {
    console.error(`No se pudo borrar el pedido ${id} sin preferencia:`, error);
  }
}

function mensajeError(mensaje: string) {
  const codigo = mensaje.toUpperCase();

  if (codigo.includes("STOCK_INSUFICIENTE")) {
    return "No hay stock suficiente de una prenda de tu carrito. Actualizá las cantidades e intentá de nuevo.";
  }

  if (codigo.includes("PRODUCTO_NO_DISPONIBLE")) {
    return "Una prenda de tu carrito ya no está disponible. Volvé al carrito para actualizarlo.";
  }

  if (codigo.includes("CARRITO_INVALIDO")) {
    return "Tu carrito no es válido. Volvé al carrito para actualizarlo.";
  }

  if (codigo.includes("DATOS_INVALIDOS")) {
    return "Revisá los datos de contacto.";
  }

  return "No pudimos crear el pedido. Intentá de nuevo en unos minutos.";
}

async function urlBase() {
  const configurada = process.env.APP_URL?.trim().replace(/\/+$/, "");

  if (configurada) return configurada;

  const cabeceras = await headers();
  const host =
    cabeceras.get("x-forwarded-host") ?? cabeceras.get("host");
  const protocolo = cabeceras.get("x-forwarded-proto") ?? "http";

  return host ? `${protocolo}://${host}` : "http://localhost:3000";
}

function esUrlPublica(url: string) {
  return (
    /^https:\/\//i.test(url) &&
    !/^https:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::|\/|$)/i.test(url)
  );
}

export async function crearPedido(
  formData: FormData,
): Promise<ResultadoCheckout> {
  const items = leerItems(formData.get("items"));

  if (!items) {
    return { error: "Tu carrito no es válido. Volvé al carrito y actualizalo." };
  }

  const nombre = texto(formData, "nombre");
  const email = texto(formData, "email").toLowerCase();
  const telefono = texto(formData, "telefono");
  const direccion = texto(formData, "direccion");

  if (
    !nombre ||
    nombre.length > MAX_NOMBRE ||
    !email ||
    email.length > MAX_EMAIL ||
    !EMAIL.test(email) ||
    !telefono ||
    telefono.length > MAX_TELEFONO ||
    !direccion ||
    direccion.length > MAX_DIRECCION
  ) {
    return { error: "Revisá los datos de contacto." };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("crear_pedido", {
    p_items: items,
    p_nombre: nombre,
    p_email: email,
    p_telefono: telefono,
    p_direccion: direccion,
    p_envio_gratis_desde: ENVIO_GRATIS_DESDE,
    p_coste_envio: COSTE_ENVIO,
  });

  if (error) {
    console.error("Error al crear el pedido:", error);
    return { error: mensajeError(error.message) };
  }

  const resultado = data as {
    pedido_id?: unknown;
    subtotal?: unknown;
    envio?: unknown;
    total?: unknown;
    items?: unknown;
  } | null;
  const id = resultado?.pedido_id;
  const subtotal = Number(resultado?.subtotal);
  const envio = Number(resultado?.envio);
  const total = Number(resultado?.total);
  const lineas = leerLineas(resultado?.items);

  if (
    typeof id !== "string" ||
    !Number.isFinite(subtotal) ||
    !Number.isFinite(envio) ||
    !Number.isFinite(total) ||
    !lineas
  ) {
    console.error("Respuesta inválida de crear_pedido:", data);

    if (typeof id === "string") await borrarPedido(supabase, id);

    return { error: "No pudimos crear el pedido. Intentá de nuevo." };
  }

  const productosIds = [...new Set(lineas.map((linea) => linea.producto_id))];
  const { data: catalogo, error: catalogoError } = await supabase
    .from("productos")
    .select("id, nombre, variantes(id, talle, color)")
    .in("id", productosIds);

  if (catalogoError) {
    console.error("Error al leer el catálogo para Mercado Pago:", catalogoError);
    await borrarPedido(supabase, id);

    return { error: "No pudimos iniciar el pago. Intentá de nuevo." };
  }

  const porProducto = new Map(
    ((catalogo ?? []) as CatalogoFila[]).map((producto) => [
      producto.id,
      producto,
    ]),
  );
  const porVariante = new Map<
    string,
    { talle: string; color: string }
  >();

  for (const producto of porProducto.values()) {
    for (const variante of producto.variantes ?? []) {
      porVariante.set(
        `${producto.id}\u0000${variante.id}`,
        variante,
      );
    }
  }

  const itemsPreferencia = lineas.map((linea) => {
    const producto = porProducto.get(linea.producto_id);
    const variante = porVariante.get(
      `${linea.producto_id}\u0000${linea.variante_id}`,
    );
    const titulo = `${producto?.nombre ?? "Producto"}${
      variante ? ` — ${variante.talle} / ${variante.color}` : ""
    }`.slice(0, 250);

    return {
      id: `${linea.producto_id}-${linea.variante_id}`,
      title: titulo,
      quantity: linea.cantidad,
      unit_price: linea.precio_unitario,
      currency_id: "ARS",
    };
  });

  if (envio > 0) {
    itemsPreferencia.push({
      id: "envio",
      title: "Envío",
      quantity: 1,
      unit_price: envio,
      currency_id: "ARS",
    });
  }

  const base = await urlBase();
  const preferencia = {
    items: itemsPreferencia,
    payer: { email },
    external_reference: id,
    back_urls: {
      success: `${base}/checkout/resultado?estado=exito&pedido=${id}`,
      failure: `${base}/checkout/resultado?estado=falla&pedido=${id}`,
      pending: `${base}/checkout/resultado?estado=pendiente&pedido=${id}`,
    },
    ...(esUrlPublica(base)
      ? {
          auto_return: "approved",
          notification_url: `${base}/api/mercadopago/webhook`,
        }
      : {}),
    statement_descriptor: "NORTE",
    metadata: { pedido_id: id },
  };

  try {
    const respuesta = await mercadopagoFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(preferencia),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error(
        `Mercado Pago respondió ${respuesta.status} al crear la preferencia: ${detalle.slice(0, 500)}`,
      );
      await borrarPedido(supabase, id);

      return { error: "No pudimos iniciar el pago con Mercado Pago." };
    }

    const creada = (await respuesta.json()) as { init_point?: unknown };

    if (typeof creada.init_point !== "string") {
      console.error("Mercado Pago no devolvió init_point:", creada);
      await borrarPedido(supabase, id);

      return { error: "No pudimos iniciar el pago con Mercado Pago." };
    }

    return {
      pedido: {
        id,
        subtotal,
        envio,
        total,
        initPoint: creada.init_point,
      },
    };
  } catch (error) {
    console.error("Error al crear la preferencia de Mercado Pago:", error);
    await borrarPedido(supabase, id);

    return { error: "No pudimos iniciar el pago con Mercado Pago." };
  }
}
