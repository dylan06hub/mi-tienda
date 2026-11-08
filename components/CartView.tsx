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
    <div>
      {error && items.length > 0 && (
        <p className="mt-6 rounded-street bg-street-danger px-4 py-3 text-sm text-street-foreground">
          {error}
        </p>
      )}

      {cargando && items.length > 0 && (
        <p className="mt-2 text-xs text-street-muted">
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
                <div className="aspect-[3/4] w-20 shrink-0 rounded-street bg-street-surface sm:w-24" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-40 max-w-full rounded bg-street-surface" />
                  <div className="h-3 w-24 rounded bg-street-surface" />
                  <div className="h-9 w-28 rounded-street bg-street-surface" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-street bg-street-surface" />
        </div>
      ) : lineas.length === 0 ? (
        <div className="mt-10 rounded-street border border-street-border bg-street-surface px-6 py-16 text-center">
          <p className="text-sm text-street-muted">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="street-button mt-4"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Líneas del carrito */}
          <ul className="divide-y divide-street-border border-y border-street-border">
            {lineas.map(
              ({ producto, variante, cantidad, subtotal: subtotalLinea }) => {
                const clave = JSON.stringify([
                  producto.id,
                  variante.id,
                ]);
                const bloqueada = ocupada === clave;

                return (
                  <li key={clave} className="flex gap-4 py-5 sm:gap-6">
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-street bg-street-surface sm:w-24">
                      {producto.imagen ? (
                        <Image
                          src={producto.imagen}
                          alt={producto.nombre}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-street-muted">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/productos/${producto.id}`}
                            className="text-sm font-medium text-street-foreground hover:underline"
                          >
                            {producto.nombre}
                          </Link>
                          <p className="mt-1 text-xs text-street-muted">
                            {variante.talle} · {variante.color}
                          </p>
                          <p className="mt-1 text-xs text-street-muted">
                            Stock: {variante.stock}
                          </p>
                          {cantidad > variante.stock && (
                            <p className="mt-1 text-xs text-street-foreground">La cantidad supera el stock disponible.</p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums text-street-foreground">
                          {formatearPrecio(subtotalLinea)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-street border border-street-fog">
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
                            className="flex h-11 w-11 items-center justify-center text-street-muted transition-colors hover:text-street-foreground disabled:opacity-30 disabled:hover:text-street-muted"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums text-street-foreground">
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
                            className="flex h-11 w-11 items-center justify-center text-street-muted transition-colors hover:text-street-foreground disabled:opacity-30 disabled:hover:text-street-muted"
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
                          className="min-h-11 text-sm text-street-muted underline underline-offset-2 transition-colors hover:text-street-foreground disabled:opacity-50"
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
          <aside className="h-fit rounded-street border border-street-border bg-street-surface p-6">
            <h2 className="text-sm font-medium text-street-foreground">Resumen</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-street-muted">Subtotal</dt>
                <dd className="tabular-nums text-street-foreground">
                  {formatearPrecio(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-street-muted">Envío</dt>
                <dd className="tabular-nums text-street-foreground">
                  {envio === 0 ? "Gratis" : formatearPrecio(envio)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-street-border pt-3 font-medium text-street-foreground">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatearPrecio(total)}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-street-border pt-5">
              <p className="text-xs text-street-muted">
                {restante === 0
                  ? "Tenés envío gratis."
                  : `Te faltan ${formatearPrecio(restante)} para el envío gratis.`}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-street bg-street-border">
                <div
                  className="h-full rounded-street bg-street-accent transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>

            <Link
              href="/checkout"
              className="street-button mt-6 w-full"
            >
              Finalizar compra
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
