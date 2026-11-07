"use client";

import Link from "next/link";
import Image from "next/image";
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

export function ProductoForm({
  producto,
  categorias = [],
}: {
  producto?: ProductoAdmin;
  categorias?: string[];
}) {
  const [estado, action, pendiente] = useActionState(guardarProducto, null);
  const [variantes, setVariantes] = useState<VarianteForm[]>(() =>
    variantesIniciales(producto),
  );
  const [variantesOriginales] = useState(() =>
    JSON.stringify(producto?.variantes ?? []),
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
      <input
        type="hidden"
        name="variantes_originales"
        value={variantesOriginales}
      />

      <section className="grid gap-5 rounded-xl border border-stone-200 bg-white p-5 sm:grid-cols-2 md:p-6">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold">Datos de la prenda</h2>
          <p className="mt-1 text-sm text-stone-600">Completá el nombre, el precio y la foto que van a ver tus clientes.</p>
        </div>
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
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm transition-colors focus:border-stone-900"
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
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition-colors focus:border-stone-900"
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
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm tabular-nums transition-colors focus:border-stone-900"
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
            list="categorias-existentes"
            name="categoria"
            required
            defaultValue={producto?.categoria}
            className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm transition-colors focus:border-stone-900"
          />
          <datalist id="categorias-existentes">
            {categorias.map((categoria) => <option key={categoria} value={categoria} />)}
          </datalist>
          <p className="mt-2 text-xs text-stone-600">Elegí una categoría existente o escribí una nueva.</p>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="imagen_archivo"
            className="text-sm font-medium text-stone-900"
          >
            Imagen
          </label>
          {producto?.imagen && (
            <div className="mt-3 flex items-center gap-4">
              <Image src={producto.imagen} alt={`Foto actual de ${producto.nombre}`} width={80} height={100} className="h-24 w-20 rounded-lg object-cover" />
              <a
                href={producto.imagen}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900"
              >
                Abrir foto actual
              </a>
            </div>
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
              : "Si no subís una, la prenda aparece sin foto en la tienda."}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-stone-900">
              Talles, colores y stock
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Cada combinación es una opción de compra. Cargá las unidades disponibles; usá 0 si está agotada.
            </p>
          </div>
          <button
            type="button"
            onClick={agregarVariante}
            className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 transition hover:border-stone-900"
          >
            Agregar talle y color
          </button>
        </div>

        {producto && <p className="mt-4 text-xs leading-5 text-stone-600">En las combinaciones existentes podés cambiar el stock. Para usar otro talle o color, agregá una combinación nueva. Las que tienen pedidos no se pueden eliminar.</p>}
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
                  readOnly={Boolean(variante.id)}
                  placeholder="Ej.: M"
                  required
                  value={variante.talle}
                  onChange={(event) =>
                    actualizarVariante(
                      variante.key,
                      "talle",
                      event.target.value,
                    )
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm transition-colors read-only:bg-stone-50 read-only:text-stone-600 focus:border-stone-900"
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
                  readOnly={Boolean(variante.id)}
                  placeholder="Ej.: Negro"
                  required
                  value={variante.color}
                  onChange={(event) =>
                    actualizarVariante(
                      variante.key,
                      "color",
                      event.target.value,
                    )
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm transition-colors read-only:bg-stone-50 read-only:text-stone-600 focus:border-stone-900"
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
                  className="mt-1 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm tabular-nums transition-colors focus:border-stone-900"
                />
              </div>

              <button
                type="button"
                onClick={() => quitarVariante(variante.key)}
                aria-label={`Quitar variante ${indice + 1}`}
                disabled={variantes.length === 1 || pendiente}
                className="min-h-11 rounded-lg px-3 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-stone-400"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-5 md:p-6">
        <h2 className="text-lg font-semibold">Dónde se muestra</h2>
        <p className="text-sm text-stone-600">Si desmarcás «Publicar en la tienda», queda guardado y solo lo ves en este panel. Los cambios se aplican al guardar.</p>
        <label className="flex min-h-11 items-center gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto?.activo ?? true}
            className="size-4 rounded border-stone-300 accent-stone-900"
          />
          Publicar en la tienda
        </label>

        <label className="flex min-h-11 items-center gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            name="destacado"
            defaultChecked={producto?.destacado ?? false}
            className="size-4 rounded border-stone-300 accent-stone-900"
          />
          Destacar en el inicio de la tienda
        </label>

        <details className="text-sm text-stone-600">
          <summary className="cursor-pointer py-3">Opciones avanzadas</summary>
          <label className="flex min-h-11 items-center gap-3 text-sm text-stone-700">
            <input
              type="checkbox"
              name="oferta"
              defaultChecked={producto?.oferta ?? false}
              className="size-4 rounded border-stone-300 accent-stone-900"
            />
            Marcar como oferta interna (todavía no se muestra en la tienda)
          </label>
        </details>

        {producto && (
          <p className="text-xs text-stone-500 sm:col-span-2">
            ID: <span className="font-mono">{producto.id}</span>
          </p>
        )}
      </section>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {estado.error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-4 border-t border-stone-200 bg-[#f7f5f0] py-4">
        <button
          type="submit"
          disabled={pendiente}
          className="h-11 rounded-full bg-stone-900 px-6 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {pendiente ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
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
