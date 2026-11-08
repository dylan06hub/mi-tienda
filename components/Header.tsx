"use client";

// Cabecera común: marca, navegación y contador de unidades del carrito.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnnouncementRibbon } from "./AnnouncementRibbon";
import { useCart } from "./CartProvider";

export function Header() {
  const { items } = useCart();
  const header = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let previous = Math.max(0, window.scrollY);
    const onScroll = () => {
      const current = Math.max(0, window.scrollY);
      if (current <= (header.current?.offsetHeight ?? 96)) {
        setHidden(false);
        previous = current;
      } else if (Math.abs(current - previous) >= 8) {
        setHidden(current > previous);
        previous = current;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const unidades = items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <header ref={header} data-hidden={hidden} className="street-header sticky top-0 z-50 border-b border-street-border/80 bg-street-background/95 backdrop-blur">
      <div className="site-shell flex min-h-16 items-center justify-between gap-2">
        {/* Marca */}
        <Link
          href="/"
          className="font-display text-4xl font-black tracking-tight text-street-foreground"
        >
          norte<span className="text-street-accent">.</span>
        </Link>

        {/* Navegación */}
        <nav aria-label="Principal" className="flex items-center gap-2 text-sm text-street-muted sm:gap-5">
          <Link href="/productos" className="inline-flex min-h-11 items-center transition-colors hover:text-street-foreground">
            Productos
          </Link>
          <Link href="/contacto" className="inline-flex min-h-11 items-center transition-colors hover:text-street-foreground">
            Contacto
          </Link>
          <Link
            href="/carrito"
            aria-label={
              unidades > 0 ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}` : "Carrito"
            }
            className="flex min-h-11 items-center gap-2 rounded-street bg-street-accent px-3 py-2 font-semibold text-street-on-accent hover:bg-street-accent-hover sm:px-4"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 sm:hidden"><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></svg>
            <span className="hidden sm:inline">Carrito</span>
            {unidades > 0 && (
              <span className="rounded-street bg-black/10 px-1.5 py-0.5 text-xs tabular-nums">
                {unidades}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <AnnouncementRibbon />
    </header>
  );
}
