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
  const producto = disponibles.find((item) => item.destacado) ?? disponibles[0];

  return (
    <section className="bg-stone-950 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-8 md:grid-cols-2 md:gap-12 md:py-12">
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
            Ropa para todos los días.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-stone-300 md:text-base md:leading-7">
            Encontrá tu próxima prenda. Elegí el talle y combiná remeras,
            camisas, pantalones y abrigos a tu manera.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition-colors hover:bg-stone-200 active:bg-stone-300"
          >
            Ver la colección
          </Link>
        </div>
        {producto && (
          <Link
            href={`/productos/${producto.id}`}
            aria-label={`Ver ${producto.nombre}`}
            className="relative block h-52 overflow-hidden rounded-xl bg-stone-800 sm:h-72 md:h-[440px]"
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
