// Catálogo completo de productos.

import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { productos } from "@/lib/productos";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Toda la colección: camisetas, camisas, chaquetas, pantalones y accesorios.",
};

export default function ProductosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Catálogo
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Toda la colección
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600">
        {productos.length} prendas pensadas para combinarse entre sí y durar
        temporada tras temporada.
      </p>

      {/* Grid de productos */}
      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
