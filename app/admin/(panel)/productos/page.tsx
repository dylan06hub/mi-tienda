import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductosAdmin } from "@/lib/productos";
import { formatearPrecio } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Productos | Administración",
  robots: { index: false, follow: false },
};

type Filtros = { q?: string; estado?: string; categoria?: string };

export default async function AdminProductosPage({ searchParams }: { searchParams: Promise<Filtros> }) {
  await requireAdmin();
  const productos = await getProductosAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const estado = typeof params.estado === "string" ? params.estado : "";
  const categoria = typeof params.categoria === "string" ? params.categoria : "";
  const categorias = [...new Set(productos.map((producto) => producto.categoria))].sort();
  const filtrados = productos.filter((producto) => {
    const coincide = `${producto.nombre} ${producto.id} ${producto.categoria}`.toLocaleLowerCase("es").includes(q.toLocaleLowerCase("es"));
    const stock = producto.variantes.reduce((total, variante) => total + variante.stock, 0);
    return coincide && (!categoria || producto.categoria === categoria)
      && (estado !== "publicados" || producto.activo)
      && (estado !== "ocultos" || !producto.activo)
      && (estado !== "sin-stock" || stock === 0);
  });

  return (
    <div className="py-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-2 text-sm text-stone-600">Buscá una prenda para cambiar su precio, foto, talles o publicación.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="inline-flex min-h-11 items-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700">
          Crear producto
        </Link>
      </div>

      <form key={`${q}-${estado}-${categoria}`} method="get" className="mt-6 grid items-end gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <div>
          <label htmlFor="buscar-productos" className="text-sm font-medium">Buscar producto</label>
          <input id="buscar-productos" type="search" name="q" defaultValue={q} placeholder="Nombre, categoría o código" className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-base" />
        </div>
        <div>
          <label htmlFor="categoria-productos" className="text-sm font-medium">Categoría</label>
          <select id="categoria-productos" name="categoria" defaultValue={categoria} className="mt-2 h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base">
            <option value="">Todas</option>
            {categorias.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="estado-productos" className="text-sm font-medium">Mostrar</label>
          <select id="estado-productos" name="estado" defaultValue={estado} className="mt-2 h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base">
            <option value="">Todos</option>
            <option value="publicados">Publicados</option>
            <option value="ocultos">Ocultos</option>
            <option value="sin-stock">Sin stock</option>
          </select>
        </div>
        <button className="min-h-11 rounded-lg border border-stone-900 px-5 text-sm font-medium hover:bg-stone-100">Buscar</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p role="status">{filtrados.length} de {productos.length} productos</p>
        {(q || estado || categoria) && <Link href="/admin/productos" className="inline-flex min-h-11 items-center underline underline-offset-4">Limpiar filtros</Link>}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium">{productos.length === 0 ? "Todavía no hay productos" : "No encontramos productos"}</h2>
          <p className="mt-2 text-sm text-stone-600">{productos.length === 0 ? "Creá tu primera prenda para empezar a armar el catálogo." : "Probá con otro nombre o limpiá los filtros."}</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {filtrados.map((producto) => {
            const stock = producto.variantes.reduce((total, variante) => total + variante.stock, 0);
            return (
              <li key={producto.id} className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_140px_110px] lg:items-center lg:p-5">
                <div className="flex min-w-0 gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {producto.imagen ? <Image src={producto.imagen} alt="" fill sizes="64px" className="object-cover" /> : <span className="flex h-full items-center px-2 text-center text-xs text-stone-500">Sin foto</span>}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/productos/${producto.id}`} className="break-words font-medium text-stone-900 underline-offset-4 hover:underline">{producto.nombre}</Link>
                    <p className="mt-1 break-words text-sm text-stone-600">{producto.categoria}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-md px-2 py-1 ${producto.activo ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{producto.activo ? "Publicado" : "Oculto"}</span>
                      {producto.destacado && <span className="rounded-md bg-orange-50 px-2 py-1 text-orange-800">{producto.activo ? "En el inicio" : "Destacado al publicar"}</span>}
                    </div>
                  </div>
                </div>
                <p className="whitespace-nowrap text-sm font-medium tabular-nums">{formatearPrecio(producto.precio)}</p>
                <div className="text-sm">
                  <p className={stock === 0 ? "font-medium text-red-700" : "text-stone-900"}>{stock === 0 ? "Sin stock" : `${stock} ${stock === 1 ? "unidad" : "unidades"}`}</p>
                  <p className="mt-1 text-xs text-stone-600">{producto.variantes.length} {producto.variantes.length === 1 ? "combinación" : "combinaciones"}</p>
                </div>
                <Link href={`/admin/productos/${producto.id}`} aria-label={`Editar ${producto.nombre}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-4 text-sm font-medium hover:border-stone-900">Editar</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
