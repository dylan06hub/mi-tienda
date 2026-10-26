import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductosAdmin } from "@/lib/productos";
import { formatearPrecio } from "@/lib/utils";
import { DeleteProductButton } from "./DeleteProductButton";

export const metadata: Metadata = {
  title: "Productos | Administración",
  robots: { index: false, follow: false },
};

export default async function AdminProductosPage() {
  await requireAdmin();
  const productos = await getProductosAdmin();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <Link
        href="/admin"
        className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Panel
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            Administración
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Productos
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {productos.length} productos en el catálogo.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-11 items-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Nuevo producto
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-600">
            Todavía no hay productos cargados.
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 font-medium">Variantes</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {productos.map((producto) => {
                const stock = producto.variantes.reduce(
                  (total, variante) => total + variante.stock,
                  0,
                );

                return (
                  <tr key={producto.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">
                        {producto.nombre}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {producto.id} · {producto.categoria}
                      </p>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-stone-700">
                      {formatearPrecio(producto.precio)}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-stone-700">
                      {producto.variantes.length}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-stone-700">
                      {stock}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          producto.activo
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {producto.activo ? "Publicado" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start justify-end gap-5">
                        <Link
                          href={`/admin/productos/${producto.id}`}
                          className="text-sm text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteProductButton
                          id={producto.id}
                          nombre={producto.nombre}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
