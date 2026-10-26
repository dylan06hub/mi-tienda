// Utilidades de precios, variantes y envío compartidas por la tienda.

import type { ItemCarrito, Variante } from "@/types";
import { getProducto } from "./productos";

export const ENVIO_GRATIS_DESDE = 80000;
export const COSTE_ENVIO = 4995;

export function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(precio);
}

export function buscarVariante(
  productoId: string,
  varianteId: string,
): Variante | undefined {
  return getProducto(productoId)?.variantes.find(
    (variante) => variante.id === varianteId,
  );
}

export function costeEnvio(subtotal: number): number {
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTE_ENVIO;
}

// Adapta carritos guardados con IDs de variante antiguos (solo talle) o con
// el ID viejo del producto, valida cantidades y descarta líneas sin stock.
export function normalizarCarrito(items: unknown): ItemCarrito[] {
  if (!Array.isArray(items)) return [];

  const normalizados = new Map<string, ItemCarrito>();

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const guardado = item as Partial<ItemCarrito>;

    if (
      typeof guardado.productoId !== "string" ||
      typeof guardado.varianteId !== "string" ||
      typeof guardado.cantidad !== "number" ||
      !Number.isFinite(guardado.cantidad)
    ) {
      continue;
    }

    const producto = getProducto(guardado.productoId);
    if (!producto) continue;

    const variante =
      producto.variantes.find((opcion) => opcion.id === guardado.varianteId) ??
      producto.variantes.find((opcion) =>
        opcion.id.startsWith(`${guardado.varianteId}-`),
      );

    if (!variante || variante.stock <= 0) continue;

    const clave = `${producto.id}-${variante.id}`;
    const previo = normalizados.get(clave);
    const suma = Math.floor((previo?.cantidad ?? 0) + guardado.cantidad);

    normalizados.set(clave, {
      productoId: producto.id,
      varianteId: variante.id,
      cantidad: Math.min(Math.max(1, suma), variante.stock),
    });
  }

  return [...normalizados.values()];
}
