"use client";

// Selector de color y talle, y botón para agregar el producto al carrito.

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Producto } from "@/types";

export function AddToCart({ producto }: { producto: Producto }) {
  const { items, agregar } = useCart();
  const colores = [...new Set(producto.variantes.map((item) => item.color))];
  const inicial =
    producto.variantes.find((variante) => variante.stock > 0) ??
    producto.variantes[0];
  const [color, setColor] = useState(inicial.color);
  const [talle, setTalle] = useState(inicial.talle);
  const [agregado, setAgregado] = useState(false);

  const variante = producto.variantes.find(
    (item) => item.color === color && item.talle === talle,
  );
  const talles = producto.variantes.filter((item) => item.color === color);
  const sinStock = !variante || variante.stock === 0;
  const enCarrito = variante
    ? (items.find(
        (item) =>
          item.productoId === producto.id &&
          item.varianteId === variante.id,
      )?.cantidad ?? 0)
    : 0;
  const maximo = !!variante && enCarrito >= variante.stock;

  function elegirColor(nuevoColor: string) {
    setColor(nuevoColor);
    const opcion =
      producto.variantes.find(
        (item) =>
          item.color === nuevoColor && item.talle === talle && item.stock > 0,
      ) ??
      producto.variantes.find(
        (item) => item.color === nuevoColor && item.stock > 0,
      );
    if (opcion) setTalle(opcion.talle);
    setAgregado(false);
  }

  async function handleAgregar() {
    if (!variante || maximo) return;
    const cambio = await agregar({
      productoId: producto.id,
      varianteId: variante.id,
      cantidad: 1,
    });
    if (cambio) setAgregado(true);
  }

  return (
    <div>
      {/* Selector de color */}
      <p className="text-sm font-medium text-stone-900">Color</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {colores.map((opcion) => {
          const disponible = producto.variantes.some(
            (item) => item.color === opcion && item.stock > 0,
          );
          const seleccionado = opcion === color;
          return (
            <button
              key={opcion}
              type="button"
              aria-pressed={seleccionado}
              disabled={!disponible}
              onClick={() => elegirColor(opcion)}
              className={`rounded-full border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:line-through ${
                seleccionado
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-800 hover:border-stone-900"
              }`}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {/* Selector de talle */}
      <p className="mt-5 text-sm font-medium text-stone-900">Talle</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {talles.map((opcion) => {
          const seleccionado = opcion.talle === talle;
          return (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={seleccionado}
              disabled={opcion.stock === 0}
              onClick={() => {
                setTalle(opcion.talle);
                setAgregado(false);
              }}
              className={`min-w-11 rounded-full border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:line-through ${
                seleccionado
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-800 hover:border-stone-900"
              }`}
            >
              {opcion.talle}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-stone-500">
        {sinStock ? "Sin stock" : `${variante.stock} disponibles`}
      </p>

      {/* Agregar y confirmación */}
      <button
        type="button"
        onClick={handleAgregar}
        disabled={sinStock || maximo}
        className="mt-6 w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {sinStock
          ? "Agotado"
          : maximo
            ? "Máximo en carrito"
            : agregado
              ? "Agregado al carrito"
              : "Agregar al carrito"}
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
