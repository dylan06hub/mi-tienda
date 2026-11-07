// Pie de página: marca, enlaces y datos de ayuda.

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            norte<span className="text-orange-700">.</span>
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
            Ropa para todos los días. Encontrá tu talle y armá tus combinaciones.
          </p>
        </div>

        <div className="flex gap-12 sm:justify-end">
          <div className="text-sm">
            <p className="font-medium">Tienda</p>
            <ul className="mt-3 space-y-2 text-stone-600">
              <li>
                <Link href="/productos" className="hover:text-stone-900">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-stone-900">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-medium">Ayuda</p>
            <ul className="mt-3 space-y-2 text-stone-600">
              <li><Link href="/contacto#preguntas-frecuentes" className="hover:text-stone-900">Envíos y devoluciones</Link></li>
              <li><Link href="/contacto" className="hover:text-stone-900">Contactanos</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs leading-5 text-stone-600">
          © norte. Tienda de demostración. Productos, fotos y stock ilustrativos;
          las condiciones comerciales están pendientes de confirmación.
        </p>
      </div>
    </footer>
  );
}
