import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EstadoPedido, ItemCarrito } from "@/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getResultadoPedido(id: unknown, token: unknown) {
  if (typeof id !== "string" || typeof token !== "string" || !UUID.test(id) || !UUID.test(token)) {
    return null;
  }

  const { data, error } = await createSupabaseAdminClient()
    .from("pedidos")
    .select("id, estado, items_pedido(producto_id, variante_id, cantidad), incidencias_pago(resuelta_en)")
    .eq("id", id)
    .eq("token_comprobante", token)
    .maybeSingle();

  if (error) throw new Error("No se pudo comprobar el estado del pedido.");
  if (!data) return null;

  const items: ItemCarrito[] = data.items_pedido.map((item) => ({
    productoId: item.producto_id,
    varianteId: item.variante_id,
    cantidad: item.cantidad,
  }));

  return {
    id: data.id as string,
    estado: data.estado as EstadoPedido,
    revision: data.incidencias_pago.some((incidencia) => !incidencia.resuelta_en),
    items,
  };
}
