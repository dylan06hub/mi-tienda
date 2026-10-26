// Catálogo completo de productos.

import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Toda la colección: camisetas, camisas, chaquetas, pantalones y accesorios.",
};

async function Catalogo() {
  const productos = await getProductos();

  return (
    <>
      <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600">
        {productos.length} prendas pensadas para combinarse entre sí y durar
        temporada tras temporada.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </>
  );
}

function CatalogoSkeleton() {
  return (
    <div className="mt-4 animate-pulse">
      <div className="h-4 w-80 max-w-full rounded bg-stone-200" />
      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indice) => (
          <div key={indice}>
            <div className="aspect-[3/4] rounded-xl bg-stone-200" />
            <div className="mt-3 h-3 w-24 rounded bg-stone-200" />
            <div className="mt-2 h-4 w-40 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Catálogo
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Toda la colección
      </h1>

      <Suspense fallback={<CatalogoSkeleton />}>
        <Catalogo />
      </Suspense>
    </div>
  );
}
