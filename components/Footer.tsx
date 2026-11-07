// Pie de página: marca, enlaces y datos de ayuda.

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-street-border bg-street-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2">
        <div>
          <p className="font-display text-4xl font-black tracking-tight">
            norte<span className="text-street-accent">.</span>
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-street-muted">
            Ropa para todos los días. Encontrá tu talle y armá tus combinaciones.
          </p>
        </div>

        <div className="flex gap-12 sm:justify-end">
          <div className="text-sm">
            <p className="font-medium">Tienda</p>
            <ul className="mt-3 space-y-2 text-street-muted">
              <li>
                <Link href="/productos" className="hover:text-street-foreground">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-street-foreground">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-medium">Ayuda</p>
            <ul className="mt-3 space-y-2 text-street-muted">
              <li><Link href="/contacto#preguntas-frecuentes" className="hover:text-street-foreground">Envíos y devoluciones</Link></li>
              <li><Link href="/contacto" className="hover:text-street-foreground">Contactanos</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-street-border">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs leading-5 text-street-muted">
          © norte. Tienda de demostración. Productos, fotos y stock ilustrativos;
          las condiciones comerciales están pendientes de confirmación.
        </p>
      </div>
    </footer>
  );
}
