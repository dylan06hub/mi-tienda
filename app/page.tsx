// Página de inicio: carrusel, productos destacados y ventajas de la tienda.

import Link from "next/link";
import { Suspense } from "react";
import { HomeCarousel } from "@/components/HomeCarousel";
import { ProductCard } from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

const IDS_DESTACADOS = [
  "camiseta-esencial",
  "camisa-lino",
  "buzo-norte",
  "chaqueta-cuero",
];

async function ProductosDestacados() {
  const productos = await getProductos();
  const destacados = IDS_DESTACADOS.flatMap((id) => {
    const producto = productos.find((item) => item.id === id);
    return producto ? [producto] : [];
  });

  return (
    <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {destacados.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

function ProductosDestacadosSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {IDS_DESTACADOS.map((id) => (
        <div key={id} className="animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-stone-200" />
          <div className="mt-3 h-3 w-24 rounded bg-stone-200" />
          <div className="mt-2 h-4 w-40 rounded bg-stone-200" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <HomeCarousel />

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              Selección
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Los imprescindibles
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-sm underline underline-offset-4 hover:text-stone-600"
          >
            Ver todo
          </Link>
        </div>

        <Suspense fallback={<ProductosDestacadosSkeleton />}>
          <ProductosDestacados />
        </Suspense>
      </section>

      {/* Ventajas */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 rounded-2xl bg-stone-900 px-8 py-10 text-white sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium">
              Envío gratis desde {formatearPrecio(ENVIO_GRATIS_DESDE)}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Entrega en 2–4 días hábiles en todo el país.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">30 días de devolución</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Si no te convence, lo devuelves sin preguntas.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Tejidos que duran</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Materiales naturales y proveedores cercanos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
