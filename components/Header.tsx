"use client";

// Cabecera común: marca, navegación y contador de unidades del carrito.

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { items } = useCart();
  const unidades = items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f7f5f0]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Marca */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-stone-900"
        >
          norte<span className="text-orange-700">.</span>
        </Link>

        {/* Navegación */}
        <nav aria-label="Principal" className="flex items-center gap-2 text-sm text-stone-700 sm:gap-5">
          <Link href="/productos" className="inline-flex min-h-11 items-center transition-colors hover:text-stone-950">
            Productos
          </Link>
          <Link href="/contacto" className="inline-flex min-h-11 items-center transition-colors hover:text-stone-950">
            Contacto
          </Link>
          <Link
            href="/carrito"
            aria-label={
              unidades > 0 ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}` : "Carrito"
            }
            className="flex min-h-11 items-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-white transition-colors hover:bg-stone-700 sm:px-4"
          >
            Carrito
            {unidades > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs tabular-nums">
                {unidades}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
