"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Resultado = { error: string } | { ok: string } | null;

export async function cambiarEstadoPedido(
  _resultado: Resultado,
  formData: FormData,
): Promise<Resultado> {
  await requireAdmin();

  const id = formData.get("id");
  const estado = formData.get("estado");

  if (
    typeof id !== "string" ||
    !UUID.test(id) ||
    (estado !== "enviado" && estado !== "cancelado")
  ) {
    return { error: "Datos del pedido inválidos." };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("cambiar_estado_pedido", {
    p_pedido_id: id,
    p_estado: estado,
  });

  if (error) {
    console.error("No se pudo cambiar el estado del pedido:", error);
    return { error: "No se pudo actualizar el pedido." };
  }

  const resultado = data as {
    estado?: string;
    stock_devuelto?: boolean;
  } | null;

  if (resultado?.estado === "no_encontrado") {
    return { error: "El pedido no existe." };
  }

  if (resultado?.estado === "no_modificable") {
    return { error: "El pedido ya está enviado o cancelado." };
  }

  if (resultado?.estado === "transicion_invalida") {
    return { error: "Solo se puede enviar un pedido pagado." };
  }

  if (resultado?.estado !== "enviado" && resultado?.estado !== "cancelado") {
    return { error: "No se pudo actualizar el pedido." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[id]", "page");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/[id]", "page");

  return {
    ok:
      resultado.estado === "enviado"
        ? "Pedido marcado como enviado."
        : resultado.stock_devuelto
          ? "Pedido cancelado y stock devuelto."
          : "Pedido cancelado.",
  };
}
