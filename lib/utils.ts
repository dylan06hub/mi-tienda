// Utilidades de precios, variantes y envío compartidas por la tienda.

import type { ItemCarrito } from "@/types";

export const ENVIO_GRATIS_DESDE = 80000;
export const COSTE_ENVIO = 4995;

export function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(precio);
}

export function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(fecha));
}

export function costeEnvio(subtotal: number): number {
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTE_ENVIO;
}

// Normalización estructural del carrito guardado. La validación de IDs,
// precios y stock se hace contra la base en /api/carrito.
export function normalizarCarrito(items: unknown): ItemCarrito[] {
  if (!Array.isArray(items)) return [];

  const normalizados = new Map<string, ItemCarrito>();

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const guardado = item as Partial<ItemCarrito>;

    if (
      typeof guardado.productoId !== "string" ||
      typeof guardado.varianteId !== "string" ||
      !guardado.productoId ||
      !guardado.varianteId ||
      typeof guardado.cantidad !== "number" ||
      !Number.isFinite(guardado.cantidad)
    ) {
      continue;
    }

    const cantidad = Math.floor(guardado.cantidad);
    if (cantidad < 1) continue;

    const clave = JSON.stringify([guardado.productoId, guardado.varianteId]);
    const previo = normalizados.get(clave);

    normalizados.set(clave, {
      productoId: guardado.productoId,
      varianteId: guardado.varianteId,
      cantidad: (previo?.cantidad ?? 0) + cantidad,
    });
  }

  return [...normalizados.values()];
}
