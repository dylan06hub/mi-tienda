// Ficha de producto: imagen, datos, selector de variantes y agregar al carrito.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AddToCart } from "@/components/AddToCart";
import { getProducto } from "@/lib/productos";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await connection();
  const producto = await getProducto(id);

  return {
    title: producto?.nombre ?? "Producto no encontrado",
    description: producto?.descripcion,
  };
}

async function FichaProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();
  const producto = await getProducto(id);

  if (!producto) notFound();

  return (
    <div className="site-shell py-10 md:py-16">
      {/* Migas de pan */}
      <nav className="text-sm text-street-muted">
        <Link href="/productos" className="hover:text-street-foreground">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-street-muted">{producto.categoria}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Imagen del producto */}
        <div className="relative aspect-[4/5] overflow-hidden bg-street-surface">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-street-muted">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información y compra */}
        <div className="md:py-6">
          <p className="text-xs uppercase tracking-[0.18em] text-street-muted">
            {producto.categoria}
          </p>
          <h1 className="mt-2 street-title text-5xl sm:text-6xl">
            {producto.nombre}
          </h1>
          <p className="mt-3 text-xl tabular-nums text-street-foreground">
            {formatearPrecio(producto.precio)}
          </p>
          <p className="mt-6 max-w-md text-sm leading-6 text-street-muted">
            {producto.descripcion}
          </p>

          <div className="mt-8">
            <AddToCart producto={producto} />
          </div>

          <dl className="mt-10 space-y-4 border-t border-street-border pt-6 text-sm">
            <div>
              <dt className="font-medium text-street-foreground">Envío</dt>
              <dd className="mt-1 text-street-muted">
                Gratis a partir de {formatearPrecio(ENVIO_GRATIS_DESDE)}.
                El costo se calcula en el carrito.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-street-foreground">Devoluciones</dt>
              <dd className="mt-1 text-street-muted">
                <Link href="/contacto#preguntas-frecuentes" className="underline underline-offset-4 hover:text-street-foreground">
                  Consultá las condiciones de cambios y devoluciones.
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function FichaProductoSkeleton() {
  return (
    <div className="site-shell animate-pulse py-10 md:py-16">
      <div className="h-4 w-40 rounded bg-street-surface" />
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/5] rounded-street bg-street-surface" />
        <div className="md:py-6">
          <div className="h-3 w-20 rounded bg-street-surface" />
          <div className="mt-4 h-9 w-64 max-w-full rounded bg-street-surface" />
          <div className="mt-4 h-6 w-32 rounded bg-street-surface" />
          <div className="mt-6 h-4 w-full rounded bg-street-surface" />
          <div className="mt-2 h-4 w-5/6 rounded bg-street-surface" />
          <div className="mt-8 h-40 rounded-street bg-street-surface" />
        </div>
      </div>
    </div>
  );
}

export default function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<FichaProductoSkeleton />}>
      <FichaProducto params={params} />
    </Suspense>
  );
}
