// Tarjeta de producto reutilizable en la portada y el catálogo.

import Image from "next/image";
import Link from "next/link";
import { formatearPrecio } from "@/lib/utils";
import type { Producto } from "@/types";

export function ProductCard({ producto }: { producto: Producto }) {
  const agotado = !producto.variantes.some((variante) => variante.stock > 0);

  return (
    <Link href={`/productos/${producto.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-200">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none lg:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            Sin imagen
          </div>
        )}
        {agotado && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700">
            Agotado
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
            {producto.categoria}
          </p>
          <h3 className="mt-1 text-sm font-medium text-stone-900">
            {producto.nombre}
          </h3>
        </div>
        <p className="text-sm tabular-nums text-stone-900">
          {formatearPrecio(producto.precio)}
        </p>
      </div>
    </Link>
  );
}
