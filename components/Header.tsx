"use client";

// Cabecera común: marca, navegación y contador de unidades del carrito.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnnouncementRibbon } from "./AnnouncementRibbon";
import { useCart } from "./CartProvider";

export function Header() {
  const { items } = useCart();
  const pathname = usePathname();
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
      <div className="site-shell flex min-h-16 flex-wrap items-center justify-between gap-x-1 gap-y-2 py-2 sm:gap-x-3 lg:flex-nowrap">
        {/* Marca */}
        <Link
          href="/"
          className="font-display text-3xl font-black tracking-tight sm:text-4xl text-street-foreground"
        >
          norte<span className="text-street-accent">.</span>
        </Link>

        <form action="/productos" method="get" role="search" aria-label="Buscar en el catálogo" className="header-search order-last flex w-full items-center rounded-street border border-street-fog bg-street-surface lg:order-none lg:mx-6 lg:max-w-lg">
          <label htmlFor="buscar-catalogo" className="sr-only">Buscar productos</label>
          <input id="buscar-catalogo" name="q" type="search" placeholder="Buscar prendas o categorías" maxLength={100} className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-street-foreground" />
          <button type="submit" aria-label="Buscar" className="header-nav-link flex h-11 w-11 shrink-0 items-center justify-center">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          </button>
        </form>

        {/* Navegación */}
        <nav aria-label="Principal" className="flex items-center gap-2 text-xs text-street-muted sm:gap-5 sm:text-sm">
          <Link href="/productos" className="header-nav-link header-nav-text inline-flex min-h-11 items-center font-semibold">
            Catálogo
          </Link>
          <Link href="/nosotros" className="header-nav-link header-nav-text inline-flex min-h-11 items-center font-semibold">
            Nosotros
          </Link>
          <Link href="/contacto" className="header-nav-link header-nav-text inline-flex min-h-11 items-center font-semibold">
            Contacto
          </Link>
          <Link
            href="/carrito"
            aria-label={
              unidades > 0 ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}` : "Carrito"
            }
            className="header-nav-link flex min-h-11 items-center gap-2 rounded-street bg-street-accent px-2 py-2 font-semibold text-street-on-accent hover:bg-street-accent-hover sm:px-4"
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
      {pathname === "/" && <AnnouncementRibbon />}
    </header>
  );
}
