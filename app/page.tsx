// Página de inicio: colección disponible, destacados y ayuda.

import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { HomeHero } from "@/components/HomeHero";
import { ProductCard } from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

async function Destacados() {
  // El cliente Supabase lee la sesión de las cookies y usa Date.now(), que
  // bloquea el prerender: se difiere a tiempo de request.
  await connection();
  const productos = await getProductos();
  const seleccion = productos.filter((producto) => producto.destacado);

  // Sin productos en la sección no se muestra el bloque vacío.
  if (seleccion.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="street-title text-4xl sm:text-5xl">
            Los imprescindibles
          </h2>
        </div>
        <Link
          href="/productos"
          className="shrink-0 text-sm underline underline-offset-4 hover:text-street-accent"
        >
          Ver todo
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {seleccion.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
}

function SeccionSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-8 md:py-12">
      <div className="h-3 w-24 rounded bg-street-surface" />
      <div className="mt-3 h-7 w-56 rounded bg-street-surface" />
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((indice) => (
          <div key={indice}>
            <div className="aspect-[3/4] rounded-street bg-street-surface" />
            <div className="mt-3 h-3 w-24 rounded bg-street-surface" />
            <div className="mt-2 h-4 w-3/4 rounded bg-street-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div className="h-[556px] animate-pulse bg-street-background" aria-label="Cargando la colección" role="status" />}>
        <HomeHero />
      </Suspense>

      {/* Los imprescindibles */}
      <Suspense fallback={<SeccionSkeleton />}>
        <Destacados />
      </Suspense>

      {/* Ventajas */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 border-y border-street-border py-10 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium">
              Envío gratis desde {formatearPrecio(ENVIO_GRATIS_DESDE)}
            </p>
            <p className="mt-2 text-sm leading-6 text-street-muted">
              El costo se calcula en el carrito antes de continuar.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Elegí tu talle</p>
            <p className="mt-2 text-sm leading-6 text-street-muted">
              Consultá los talles y el stock disponible en cada prenda.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">¿Necesitás una mano?</p>
            <p className="mt-2 text-sm leading-6 text-street-muted">
              <Link href="/contacto" className="underline underline-offset-4 hover:text-street-accent">
                Escribinos desde el formulario de contacto.
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
