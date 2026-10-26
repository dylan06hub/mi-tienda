// Ficha de producto: imagen, datos, selector de variantes y agregar al carrito.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { getProducto, productos } from "@/lib/productos";
import { ENVIO_GRATIS_DESDE, formatearPrecio } from "@/lib/utils";

export function generateStaticParams() {
  return productos.map((producto) => ({ id: producto.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const producto = getProducto(id);

  return {
    title: producto?.nombre ?? "Producto no encontrado",
    description: producto?.descripcion,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = getProducto(id);

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
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
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
