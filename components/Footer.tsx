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
          <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">
            Prendas atemporales, tejidos honestos y cortes que sientan bien.
            Sin ruido.
          </p>
        </div>

        <div className="flex gap-12 sm:justify-end">
          <div className="text-sm">
            <p className="font-medium">Tienda</p>
            <ul className="mt-3 space-y-2 text-stone-500">
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
            <ul className="mt-3 space-y-2 text-stone-500">
              <li>Envíos en 2–4 días</li>
              <li>Devoluciones en 30 días</li>
              <li>hola@norte.demo</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-stone-400">
          © norte. Proyecto de demostración.
        </p>
      </div>
    </footer>
  );
}
