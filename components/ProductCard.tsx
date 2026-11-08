// Una misma tarjeta para el catálogo y el carrusel de destacados.
import Image from "next/image";
import Link from "next/link";
import { formatearPrecio } from "@/lib/utils";
import type { Producto } from "@/types";

export function ProductCard({ producto }: { producto: Producto }) {
  const talles = [...new Set(producto.variantes.filter((variante) => variante.stock > 0).map((variante) => variante.talle))];
  const agotado = talles.length === 0;

  return (
    <Link href={`/productos/${producto.id}`} className="street-product group">
      <div className="street-product-image relative aspect-[4/5] overflow-hidden bg-street-background">
        {producto.imagen ? (
          <Image src={producto.imagen} alt={producto.nombre} fill sizes="(min-width: 1600px) 420px, (min-width: 1280px) 32vw, (min-width: 768px) 50vw, 78vw" className="street-product-photo h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-street-muted">Sin imagen</div>
        )}
        <span className="street-product-category">{producto.categoria}</span>
        {(producto.oferta || agotado) && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
            {producto.oferta && <span className="bg-street-accent px-2 py-1.5 text-xs font-semibold text-street-on-accent">Oferta</span>}
            {agotado && <span className="bg-street-background px-2 py-1.5 text-xs font-semibold text-street-foreground">Agotado</span>}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="street-product-name font-display text-2xl font-black uppercase leading-none text-street-foreground sm:text-3xl">{producto.nombre}</h3>
        <p className="mt-2 text-xs leading-5 text-street-muted">{agotado ? "Sin stock disponible" : `Talles: ${talles.join(" / ")}`}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-street-border pt-3">
          <p className="street-product-price text-sm font-semibold tabular-nums text-street-accent sm:text-base">{formatearPrecio(producto.precio)}</p>
          <span aria-hidden="true" className="street-product-arrow">↗</span>
        </div>
      </div>
    </Link>
  );
}
