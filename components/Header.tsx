"use client";

// Cabecera común: marca, navegación y contador de unidades del carrito.

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { items } = useCart();
  const unidades = items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f7f5f0]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Marca */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-stone-900"
        >
          norte<span className="text-orange-700">.</span>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-6 text-sm text-stone-700">
          <Link href="/productos" className="transition-colors hover:text-stone-950">
            Productos
          </Link>
          <Link
            href="/carrito"
            aria-label={
              unidades > 0 ? `Carrito, ${unidades} artículos` : "Carrito"
            }
            className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-white transition-colors hover:bg-stone-700"
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

// Componente de la cabecera: marca, navegación y contador de unidades del carrito.