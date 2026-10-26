"use client";

// Contenido interactivo del carrito: líneas, cantidades y resumen.

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProducto } from "@/lib/productos";
import {
  buscarVariante,
  costeEnvio,
  formatearPrecio,
} from "@/lib/utils";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, cambiarCantidad, quitar } = useCart();
  const [aviso, setAviso] = useState(false);

  const lineas = items.flatMap((item) => {
    const producto = getProducto(item.productoId);
    const variante = buscarVariante(item.productoId, item.varianteId);
    return producto && variante ? [{ item, producto, variante }] : [];
  });

  if (lineas.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-500">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const subtotal = lineas.reduce(
    (total, linea) => total + linea.producto.precio * linea.item.cantidad,
    0,
  );
  const envio = costeEnvio(subtotal);
  const total = subtotal + envio;

  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_360px]">
      {/* Líneas del carrito */}
      <div className="divide-y divide-stone-200 border-y border-stone-200">
        {lineas.map(({ item, producto, variante }) => (
          <div
            key={`${item.productoId}-${item.varianteId}`}
            className="flex gap-4 py-5"
          >
            <Link
              href={`/productos/${producto.id}`}
              className="relative h-28 w-22 flex-none overflow-hidden rounded-lg bg-stone-200"
            >
              <Image
                src={producto.imagen}
                alt={producto.nombre}
                fill
                sizes="88px"
                className="object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex justify-between gap-4">
                <div>
                  <Link
                    href={`/productos/${producto.id}`}
                    className="text-sm font-medium text-stone-900 hover:underline"
                  >
                    {producto.nombre}
                  </Link>
                  <p className="mt-1 text-sm text-stone-500">
                    Talla {variante.talla} · {variante.color}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-stone-900">
                  {formatearPrecio(producto.precio * item.cantidad)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-full border border-stone-300">
                  <button
                    type="button"
                    aria-label="Quitar una unidad"
                    disabled={item.cantidad <= 1}
                    onClick={() =>
                      cambiarCantidad(
                        item.productoId,
                        item.varianteId,
                        item.cantidad - 1,
                      )
                    }
                    className="px-3 py-1 text-stone-700 disabled:text-stone-300"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    aria-label="Añadir una unidad"
                    disabled={item.cantidad >= variante.stock}
                    onClick={() =>
                      cambiarCantidad(
                        item.productoId,
                        item.varianteId,
                        item.cantidad + 1,
                      )
                    }
                    className="px-3 py-1 text-stone-700 disabled:text-stone-300"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => quitar(item.productoId, item.varianteId)}
                  className="text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del pedido */}
      <aside className="rounded-xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="text-base font-semibold">Resumen</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Subtotal</dt>
            <dd className="tabular-nums">{formatearPrecio(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Envío</dt>
            <dd className="tabular-nums">
              {envio === 0 ? "Gratis" : formatearPrecio(envio)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatearPrecio(total)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setAviso(true)}
          className="mt-6 w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Finalizar compra
        </button>

        <div aria-live="polite" className="mt-3 min-h-5">
          {aviso && (
            <p className="text-xs text-stone-500">
              Demostración: la pasarela de pago no está conectada.
            </p>
          )}
        </div>

        <p className="mt-2 text-xs text-stone-400">
          Envío gratis a partir de 80 €.
        </p>
      </aside>
    </div>
  );
}
