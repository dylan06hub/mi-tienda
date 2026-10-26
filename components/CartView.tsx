"use client";

// Vista del carrito: líneas, cantidades y resumen de compra.

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

export function CartView() {
  const {
    items,
    lineas,
    subtotal,
    envio,
    total,
    cargando,
    error,
    quitar,
    cambiarCantidad,
  } = useCart();
  const [ocupada, setOcupada] = useState<string | null>(null);

  const progreso =
    Math.min(subtotal / ENVIO_GRATIS_DESDE, 1) * 100;
  const restante = Math.max(0, ENVIO_GRATIS_DESDE - subtotal);

  async function eliminar(productoId: string, varianteId: string) {
    const clave = JSON.stringify([productoId, varianteId]);
    setOcupada(clave);
    try {
      await quitar(productoId, varianteId);
    } finally {
      setOcupada(null);
    }
  }

  async function actualizarCantidad(
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) {
    const clave = JSON.stringify([productoId, varianteId]);
    setOcupada(clave);
    try {
      await cambiarCantidad(productoId, varianteId, cantidad);
    } finally {
      setOcupada(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Carrito
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Tu selección
      </h1>

      {error && items.length > 0 && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {cargando && items.length > 0 && (
        <p className="mt-2 text-xs text-stone-500">
          Actualizando precios y stock…
        </p>
      )}

      {cargando && items.length > 0 && lineas.length === 0 ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {items.map((item) => (
              <div
                key={JSON.stringify([
                  item.productoId,
                  item.varianteId,
                ])}
                className="flex animate-pulse gap-4 py-5 sm:gap-6"
              >
                <div className="aspect-[3/4] w-20 shrink-0 rounded-xl bg-stone-200 sm:w-24" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-40 max-w-full rounded bg-stone-200" />
                  <div className="h-3 w-24 rounded bg-stone-200" />
                  <div className="h-9 w-28 rounded-full bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      ) : lineas.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-600">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Líneas del carrito */}
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {lineas.map(
              ({ producto, variante, cantidad, subtotal: subtotalLinea }) => {
                const clave = JSON.stringify([
                  producto.id,
                  variante.id,
                ]);
                const bloqueada = ocupada === clave;

                return (
                  <li key={clave} className="flex gap-4 py-5 sm:gap-6">
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200 sm:w-24">
                      {producto.imagen ? (
                        <Image
                          src={producto.imagen}
                          alt={producto.nombre}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-stone-400">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/productos/${producto.id}`}
                            className="text-sm font-medium text-stone-900 hover:underline"
                          >
                            {producto.nombre}
                          </Link>
                          <p className="mt-1 text-xs text-stone-500">
                            {variante.talle} · {variante.color}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Stock: {variante.stock}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums text-stone-900">
                          {formatearPrecio(subtotalLinea)}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="inline-flex items-center rounded-full border border-stone-300">
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCantidad(
                                producto.id,
                                variante.id,
                                cantidad - 1,
                              )
                            }
                            disabled={bloqueada || cantidad <= 1}
                            aria-label={`Quitar una unidad de ${producto.nombre}`}
                            className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-500"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums text-stone-900">
                            {cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCantidad(
                                producto.id,
                                variante.id,
                                cantidad + 1,
                              )
                            }
                            disabled={
                              bloqueada || cantidad >= variante.stock
                            }
                            aria-label={`Agregar una unidad de ${producto.nombre}`}
                            className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-500"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            eliminar(producto.id, variante.id)
                          }
                          disabled={bloqueada}
                          className="text-xs text-stone-500 underline-offset-2 transition hover:text-stone-900 hover:underline disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              },
            )}
          </ul>

          {/* Resumen */}
          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-900">Resumen</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600">Subtotal</dt>
                <dd className="tabular-nums text-stone-900">
                  {formatearPrecio(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600">Envío</dt>
                <dd className="tabular-nums text-stone-900">
                  {envio === 0 ? "Gratis" : formatearPrecio(envio)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 font-medium text-stone-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatearPrecio(total)}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-stone-200 pt-5">
              <p className="text-xs text-stone-500">
                {restante === 0
                  ? "Tenés envío gratis."
                  : `Te faltan ${formatearPrecio(restante)} para el envío gratis.`}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-900 transition-[width] duration-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Finalizar compra
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
