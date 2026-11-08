// Página del carrito: líneas, cantidades y resumen del pedido.

import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CarritoPage() {
  return (
    <div className="site-shell py-12 md:py-16">
      <h1 className="street-title text-5xl sm:text-6xl">
        Tu carrito
      </h1>
      <CartView />
    </div>
  );
}
