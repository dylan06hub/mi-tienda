// Ficha de producto: imagen, datos, selector de variantes y agregar al carrito.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const producto = await getProducto(id);

  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      {/* Migas de pan */}
      <nav className="text-sm text-stone-500">
        <Link href="/productos" className="hover:text-stone-900">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{producto.categoria}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Imagen del producto */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información y compra */}
        <div className="md:py-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
            {producto.categoria}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {producto.nombre}
          </h1>
          <p className="mt-3 text-xl tabular-nums text-stone-900">
            {formatearPrecio(producto.precio)}
          </p>
          <p className="mt-6 max-w-md text-sm leading-6 text-stone-600">
            {producto.descripcion}
          </p>

          <div className="mt-8">
            <AddToCart producto={producto} />
          </div>

          <dl className="mt-10 space-y-4 border-t border-stone-200 pt-6 text-sm">
            <div>
              <dt className="font-medium text-stone-900">Envío</dt>
              <dd className="mt-1 text-stone-600">
                Gratis a partir de {formatearPrecio(ENVIO_GRATIS_DESDE)}.
                Entrega en 2–4 días hábiles.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-stone-900">Devoluciones</dt>
              <dd className="mt-1 text-stone-600">
                30 días para devolverlo, sin preguntas.
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
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-10 md:py-16">
      <div className="h-4 w-40 rounded bg-stone-200" />
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/5] rounded-2xl bg-stone-200" />
        <div className="md:py-6">
          <div className="h-3 w-20 rounded bg-stone-200" />
          <div className="mt-4 h-9 w-64 max-w-full rounded bg-stone-200" />
          <div className="mt-4 h-6 w-32 rounded bg-stone-200" />
          <div className="mt-6 h-4 w-full rounded bg-stone-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-stone-200" />
          <div className="mt-8 h-40 rounded-2xl bg-stone-200" />
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
