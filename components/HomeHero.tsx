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
    <section className="bg-street-background text-street-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 md:grid-cols-2 md:gap-12 md:py-14">
        <div>
          <h1 className="street-title max-w-lg text-6xl sm:text-7xl lg:text-8xl">
            TU CALLE.<br /><span className="text-street-accent">TU FORMA.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-street-muted md:text-base md:leading-7">
            Prendas para moverte a tu manera. Encontrá tu próxima combinación y elegí tu talle.
          </p>
          <Link
            href="/productos"
            className="street-button mt-6"
          >
            Ver la colección
          </Link>
        </div>
        {producto && (
          <Link
            href={`/productos/${producto.id}`}
            aria-label={`Ver ${producto.nombre}`}
            className="relative block h-72 overflow-hidden bg-street-surface sm:h-96 md:h-[480px]"
          >
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1152px) 528px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Link>
        )}
      </div>
    </section>
  );
}
