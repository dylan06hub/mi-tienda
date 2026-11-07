"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/admin", nombre: "Resumen" },
  { href: "/admin/productos", nombre: "Productos" },
  { href: "/admin/pedidos", nombre: "Pedidos" },
  { href: "/admin/consultas", nombre: "Consultas" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración" className="mt-5 grid grid-cols-2 gap-2 border-b border-street-border pb-5 sm:flex">
      {SECCIONES.map(({ href, nombre }) => {
        const actual = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={actual ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-center rounded-street px-5 text-sm font-medium transition-colors ${actual ? "bg-street-accent text-street-on-accent" : "text-street-muted hover:bg-street-surface hover:text-street-foreground"}`}
          >
            {nombre}
          </Link>
        );
      })}
    </nav>
  );
}
