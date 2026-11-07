import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getProductos } from "@/lib/productos";

export async function HomeHero() {
  await connection();
  const productos = await getProductos();
  const disponibles = productos.filter(
    (producto) => producto.imagen && producto.variantes.some((variante) => variante.stock > 0),
  );
  const producto = disponibles.find((item) => item.destacado && item.categoria === "Buzos")
    ?? disponibles.find((item) => item.destacado)
    ?? disponibles[0];

  return (
    <section className="street-hero bg-street-background text-street-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-2 md:gap-12 md:py-16">
        <div>
          <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-street-secondary"><span aria-hidden="true" className="h-2 w-2 bg-street-secondary" />norte. / Streetwear</p>
          <h1 className="street-title max-w-lg text-7xl sm:text-8xl md:text-7xl lg:text-[112px]">
            TU CALLE.<br /><span className="text-street-accent">TU FORMA.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-street-muted md:text-base md:leading-7">
            Prendas para moverte a tu manera. Encontrá tu próxima combinación y elegí tu talle.
          </p>
          <Link
            href="/productos"
            className="street-button mt-6"
          >
            Ver la colección <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {producto && (
          <Link
            href={`/productos/${producto.id}`}
            aria-label={`Ver ${producto.nombre}`}
            className="street-hero-photo relative block h-96 bg-street-surface md:h-[520px]"
          >
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1152px) 528px, (min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 bg-street-accent px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-street-on-accent">{producto.categoria}</span>
            <span className="street-hero-caption absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-street-background p-4">
              <span><span className="block font-mono text-xs uppercase tracking-wider text-street-muted">Explorá la prenda</span><span className="mt-1 block font-display text-3xl font-black uppercase leading-none">{producto.nombre}</span></span>
              <span aria-hidden="true" className="text-3xl text-street-secondary">↗</span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
