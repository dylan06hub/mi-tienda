// Catálogo completo de productos con filtros.

import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";
import { FiltrosCatalogo } from "./FiltrosCatalogo";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Toda la colección: camisetas, camisas, chaquetas, pantalones y accesorios.",
};

type SearchParams = {
  categoria?: string | string[];
  talle?: string | string[];
  color?: string | string[];
  min?: string;
  max?: string;
  disponible?: string;
};

function aArray(valor?: string | string[]) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.filter(Boolean);
  return valor.split(",").filter(Boolean);
}

function normalizar(valor: string) {
  return valor.trim().toLowerCase();
}

async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categoriasActivas = aArray(params.categoria).map((v) => v.trim());
  const tallesActivos = aArray(params.talle).map((v) => v.trim());
  const coloresActivos = aArray(params.color).map((v) => v.trim());
  const min = params.min ? Number(params.min) : NaN;
  const max = params.max ? Number(params.max) : NaN;
  const soloStock = params.disponible === "1";

  const productos = await getProductos();

  const categoriasSet = new Set(
    categoriasActivas.filter((v) => v).map(normalizar),
  );
  const tallesSet = new Set(tallesActivos.filter((v) => v).map(normalizar));
  const coloresSet = new Set(coloresActivos.filter((v) => v).map(normalizar));

  const filtrados = productos.filter((producto) => {
    if (categoriasSet.size > 0) {
      if (!categoriasSet.has(normalizar(producto.categoria))) return false;
    }
    if (soloStock) {
      if (!producto.variantes.some((variante) => variante.stock > 0)) {
        return false;
      }
    }
    if (tallesSet.size > 0) {
      const tieneTalle = producto.variantes.some(
        (variante) => tallesSet.has(normalizar(variante.talle)),
      );
      if (!tieneTalle) return false;
    }
    if (coloresSet.size > 0) {
      const tieneColor = producto.variantes.some(
        (variante) => coloresSet.has(normalizar(variante.color)),
      );
      if (!tieneColor) return false;
    }
    if (!Number.isNaN(min) && producto.precio < min) return false;
    if (!Number.isNaN(max) && producto.precio > max) return false;
    return true;
  });

  const conteos = {
    categoria: {} as Record<string, number>,
    talle: {} as Record<string, number>,
    color: {} as Record<string, number>,
  };

  const base = soloStock
    ? productos.filter((producto) =>
        producto.variantes.some((variante) => variante.stock > 0),
      )
    : productos;

  for (const producto of base) {
    conteos.categoria[producto.categoria] =
      (conteos.categoria[producto.categoria] ?? 0) + 1;
    for (const variante of producto.variantes) {
      if (soloStock && variante.stock <= 0) continue;
      conteos.talle[variante.talle] =
        (conteos.talle[variante.talle] ?? 0) + 1;
      conteos.color[variante.color] =
        (conteos.color[variante.color] ?? 0) + 1;
    }
  }

  const precios = productos.reduce(
    (acc, producto) => ({
      min: Math.min(acc.min, producto.precio),
      max: Math.max(acc.max, producto.precio),
    }),
    { min: productos[0]?.precio ?? 0, max: productos[0]?.precio ?? 0 },
  );

  const hayFiltros =
    categoriasActivas.length > 0 ||
    tallesActivos.length > 0 ||
    coloresActivos.length > 0 ||
    !Number.isNaN(min) ||
    !Number.isNaN(max) ||
    soloStock;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
      <FiltrosCatalogo conteos={conteos} precios={precios} />
      <div>
        <p className="text-sm text-stone-600">
          {filtrados.length}{" "}
          {filtrados.length === 1 ? "prenda encontrada" : "prendas encontradas"}
          {hayFiltros ? " con los filtros seleccionados." : "."}
        </p>
        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-stone-600">
              No hay productos que coincidan con esos filtros.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Probá quitando algún filtro o cambiando los criterios.
            </p>
          </div>
        ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.slice(0, 50).map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

function CatalogoSkeleton() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
      <div className="hidden space-y-6 lg:block">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="animate-pulse">
            <div className="h-3 w-24 rounded bg-stone-200" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="animate-pulse">
        <div className="h-4 w-40 rounded bg-stone-200" />
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <div key={indice}>
              <div className="aspect-[3/4] rounded-xl bg-stone-200" />
              <div className="mt-3 h-3 w-24 rounded bg-stone-200" />
              <div className="mt-2 h-4 w-40 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Catálogo
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Toda la colección
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600">
        Prendas atemporales pensadas para combinarse entre sí y durar temporada
        tras temporada.
      </p>

      <Suspense fallback={<CatalogoSkeleton />}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
