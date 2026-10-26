"use client";

// Selector de variante y botón para añadir el producto al carrito.

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Producto } from "@/types";

export function AddToCart({ producto }: { producto: Producto }) {
  const { agregar } = useCart();
  const [varianteId, setVarianteId] = useState(
    producto.variantes.find((variante) => variante.stock > 0)?.id ??
      producto.variantes[0].id,
  );
  const [agregado, setAgregado] = useState(false);

  const variante = producto.variantes.find((item) => item.id === varianteId);
  const sinStock = !variante || variante.stock === 0;

  function handleAgregar() {
    if (!variante) return;
    agregar({
      productoId: producto.id,
      varianteId: variante.id,
      cantidad: 1,
    });
    setAgregado(true);
  }

  return (
    <div>
      {/* Selector de talla */}
      <p className="text-sm font-medium text-stone-900">Talla</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {producto.variantes.map((opcion) => {
          const seleccionada = opcion.id === varianteId;
          return (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={seleccionada}
              disabled={opcion.stock === 0}
              onClick={() => {
                setVarianteId(opcion.id);
                setAgregado(false);
              }}
              className={`min-w-11 rounded-full border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:line-through ${
                seleccionada
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-800 hover:border-stone-900"
              }`}
            >
              {opcion.talla}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-stone-500">
        {variante?.color} ·{" "}
        {sinStock ? "Sin stock" : `${variante.stock} disponibles`}
      </p>

      {/* Añadir y confirmación */}
      <button
        type="button"
        onClick={handleAgregar}
        disabled={sinStock}
        className="mt-6 w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {sinStock ? "Agotado" : agregado ? "Añadido al carrito" : "Añadir al carrito"}
      </button>

      <div aria-live="polite" className="mt-3 min-h-5 text-sm">
        {agregado && (
          <Link
            href="/carrito"
            className="font-medium text-stone-900 underline underline-offset-4"
          >
            Ver carrito
          </Link>
        )}
      </div>
    </div>
  );
}
