// Utilidades de precios, variantes y envío compartidas por la tienda.

import type { Variante } from "@/types";
import { getProducto } from "./productos";

export const ENVIO_GRATIS_DESDE = 80;
export const COSTE_ENVIO = 4.95;

export function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
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
