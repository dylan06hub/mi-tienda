// Página de inicio: colección disponible, destacados y ayuda.

import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { HomeHero } from "@/components/HomeHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductCard } from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

async function ColeccionInicio({ campo }: { campo: "destacado" | "oferta" }) {
  // El cliente Supabase lee la sesión de las cookies y usa Date.now(), que
  // bloquea el prerender: se difiere a tiempo de request.
  await connection();
  const productos = await getProductos();
  const seleccion = productos.filter((producto) => producto[campo]);
  const ofertas = campo === "oferta";

  // Sin productos en la sección no se muestra el bloque vacío.
  if (seleccion.length === 0) return null;

  return (
    <section id={ofertas ? "ofertas" : "destacados"} className={`home-collection site-shell scroll-mt-32 py-10 md:py-14 ${ofertas ? "home-collection--offers" : "home-collection--featured"}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-street-secondary">{ofertas ? "Selección en oferta" : "Selección norte."}</p>
          <h2 className="street-title text-4xl sm:text-6xl">
            {ofertas ? "Ofertas" : "Los imprescindibles"}
          </h2>
        </div>
        <Link
          href="/productos"
          className="shrink-0 text-sm underline underline-offset-4 hover:text-street-secondary"
        >
          {ofertas ? "Ver catálogo" : "Ver todo"}
        </Link>
      </div>

      <ProductCarousel label={ofertas ? "Prendas en oferta" : "Prendas destacadas"}>
        {seleccion.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </ProductCarousel>
    </section>
  );
}

function SeccionSkeleton() {
  return (
    <div className="site-shell animate-pulse py-8 md:py-12">
      <div className="h-3 w-24 rounded bg-street-surface" />
      <div className="mt-3 h-12 w-64 rounded bg-street-surface" />
      <div className="mt-8 grid auto-cols-[78%] grid-flow-col gap-4 overflow-hidden sm:auto-cols-[calc((100%_-_16px)/2)] lg:auto-cols-[calc((100%_-_48px)/4)]">
        {[0, 1, 2, 3].map((indice) => (
          <div key={indice}>
            <div className="aspect-[4/5] rounded-street bg-street-surface" />
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
    <div className="home-future">
      <Suspense fallback={<div className="h-[840px] animate-pulse md:h-[648px] bg-street-background" aria-label="Cargando la colección" role="status" />}>
        <HomeHero />
      </Suspense>

      {/* Los imprescindibles */}
      <Suspense fallback={<SeccionSkeleton />}>
        <ColeccionInicio campo="destacado" />
      </Suspense>

      <Suspense fallback={<SeccionSkeleton />}>
        <ColeccionInicio campo="oferta" />
      </Suspense>

      {/* Ventajas */}
      <section className="site-shell py-12 md:py-16">
        <div className="home-benefits grid gap-8 border-y border-street-border py-10 sm:grid-cols-3">
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
              <Link href="/contacto" className="underline underline-offset-4 hover:text-street-secondary">
                Escribinos desde el formulario de contacto.
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
