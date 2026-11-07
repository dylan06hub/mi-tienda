// Tarjeta de producto reutilizable en la portada y el catálogo.

import Image from "next/image";
import Link from "next/link";
import { formatearPrecio } from "@/lib/utils";
import type { Producto } from "@/types";

export function ProductCard({ producto }: { producto: Producto }) {
  const agotado = !producto.variantes.some((variante) => variante.stock > 0);

  return (
    <Link href={`/productos/${producto.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-street-surface">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none lg:group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-street-muted">
            Sin imagen
          </div>
        )}
        {agotado && (
          <span className="absolute left-3 top-3 rounded-street bg-street-surface/90 px-3 py-1 text-xs font-medium text-street-muted">
            Agotado
          </span>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-street-muted">
            {producto.categoria}
          </p>
          <h3 className="mt-1 text-sm font-medium text-street-foreground">
            {producto.nombre}
          </h3>
        </div>
        <p className="shrink-0 whitespace-nowrap text-sm tabular-nums text-street-foreground">
          {formatearPrecio(producto.precio)}
        </p>
      </div>
    </Link>
  );
}
