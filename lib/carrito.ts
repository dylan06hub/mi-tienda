import type { ItemCarrito } from "@/types";

export function descontarCompra(actuales: ItemCarrito[], comprados: ItemCarrito[]) {
  const porVariante = new Map<string, number>();
  for (const item of comprados) {
    const clave = JSON.stringify([item.productoId, item.varianteId]);
    porVariante.set(clave, (porVariante.get(clave) ?? 0) + item.cantidad);
  }
  return actuales.flatMap((item) => {
    const cantidad = item.cantidad - (porVariante.get(JSON.stringify([item.productoId, item.varianteId])) ?? 0);
    return cantidad > 0 ? [{ ...item, cantidad }] : [];
  });
}
