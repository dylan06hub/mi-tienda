"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ProductoAdmin } from "@/types";
import { guardarProducto } from "./actions";

type VarianteForm = {
  key: string;
  id?: string;
  talle: string;
  color: string;
  stock: string;
};

function variantesIniciales(producto?: ProductoAdmin): VarianteForm[] {
  if (producto && producto.variantes.length > 0) {
    return producto.variantes.map((variante) => ({
      key: variante.id,
      id: variante.id,
      talle: variante.talle,
      color: variante.color,
      stock: String(variante.stock),
    }));
  }

  return [
    {
      key: "nueva-0",
      talle: "",
      color: "",
      stock: "0",
    },
  ];
}

export function ProductoForm({ producto }: { producto?: ProductoAdmin }) {
  const [estado, action, pendiente] = useActionState(guardarProducto, null);
  const [variantes, setVariantes] = useState<VarianteForm[]>(() =>
    variantesIniciales(producto),
  );

  function actualizarVariante(
    key: string,
    campo: "talle" | "color" | "stock",
    valor: string,
  ) {
    setVariantes((previas) =>
      previas.map((variante) =>
        variante.key === key ? { ...variante, [campo]: valor } : variante,
      ),
    );
  }

  function agregarVariante() {
    setVariantes((previas) => [
      ...previas,
      {
        key: crypto.randomUUID(),
        talle: "",
        color: "",
        stock: "0",
      },
    ]);
  }

  function quitarVariante(key: string) {
    setVariantes((previas) =>
      previas.filter((variante) => variante.key !== key),
    );
  }

  return (
    <form action={action} className="mt-8 space-y-8">
      {producto && <input type="hidden" name="id" value={producto.id} />}

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="nombre"
            className="text-sm font-medium text-stone-900"
          >
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            defaultValue={producto?.nombre}
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-stone-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="descripcion"
            className="text-sm font-medium text-stone-900"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={4}
            defaultValue={producto?.descripcion}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="precio"
            className="text-sm font-medium text-stone-900"
          >
            Precio (ARS)
          </label>
          <input
            id="precio"
            name="precio"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={producto?.precio}
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm tabular-nums outline-none transition focus:border-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="categoria"
            className="text-sm font-medium text-stone-900"
          >
            Categoría
          </label>
          <input
            id="categoria"
            name="categoria"
            required
            defaultValue={producto?.categoria}
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-stone-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="imagen_archivo"
            className="text-sm font-medium text-stone-900"
          >
            Imagen
          </label>
          {producto?.imagen && (
            <p className="mt-2 text-xs text-stone-500">
              Imagen actual:{" "}
              <a
                href={producto.imagen}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-stone-900"
              >
                ver
              </a>
            </p>
          )}
          <input
            id="imagen_archivo"
            name="imagen_archivo"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="mt-2 block w-full text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-stone-700"
          />
          <p className="mt-2 text-xs text-stone-500">
            JPG, PNG o WebP. Máximo 5 MB.{" "}
            {producto?.imagen
              ? "Si elegís un archivo, reemplaza la imagen actual."
              : "Si no subís una, se muestra un placeholder en la tienda."}
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-stone-700 sm:col-span-2">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto?.activo ?? true}
            className="size-4 rounded border-stone-300 accent-stone-900"
          />
          Publicar en la tienda
        </label>

        {producto && (
          <p className="text-xs text-stone-500 sm:col-span-2">
            ID: <span className="font-mono">{producto.id}</span>
          </p>
        )}
      </section>

      <section className="border-t border-stone-200 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-stone-900">
              Variantes
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Talle, color y stock disponible.
            </p>
          </div>
          <button
            type="button"
            onClick={agregarVariante}
            className="h-10 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 transition hover:border-stone-900"
          >
            Agregar variante
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {variantes.map((variante, indice) => (
            <div
              key={variante.key}
              className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end"
            >
              <input
                type="hidden"
                name="variante_id"
                value={variante.id ?? ""}
              />

              <div>
                <label
                  htmlFor={`talle-${variante.key}`}
                  className="text-xs font-medium text-stone-600"
                >
                  Talle
                </label>
                <input
                  id={`talle-${variante.key}`}
                  name="variante_talle"
                  required
                  value={variante.talle}
                  onChange={(event) =>
                    actualizarVariante(
                      variante.key,
                      "talle",
                      event.target.value,
                    )
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none transition focus:border-stone-900"
                />
              </div>

              <div>
                <label
                  htmlFor={`color-${variante.key}`}
                  className="text-xs font-medium text-stone-600"
                >
                  Color
                </label>
                <input
                  id={`color-${variante.key}`}
                  name="variante_color"
                  required
                  value={variante.color}
                  onChange={(event) =>
                    actualizarVariante(
                      variante.key,
                      "color",
                      event.target.value,
                    )
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none transition focus:border-stone-900"
                />
              </div>

              <div>
                <label
                  htmlFor={`stock-${variante.key}`}
                  className="text-xs font-medium text-stone-600"
                >
                  Stock
                </label>
                <input
                  id={`stock-${variante.key}`}
                  name="variante_stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={variante.stock}
                  onChange={(event) =>
                    actualizarVariante(
                      variante.key,
                      "stock",
                      event.target.value,
                    )
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-stone-300 px-3 text-sm tabular-nums outline-none transition focus:border-stone-900"
                />
              </div>

              <button
                type="button"
                onClick={() => quitarVariante(variante.key)}
                aria-label={`Quitar variante ${indice + 1}`}
                className="h-10 rounded-full px-3 text-sm text-stone-500 transition hover:text-stone-900"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {estado.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
        <button
          type="submit"
          disabled={pendiente}
          className="h-11 rounded-full bg-stone-900 px-6 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {pendiente ? "Guardando…" : "Guardar producto"}
        </button>
        <Link
          href="/admin/productos"
          className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
