// Página del carrito: líneas, cantidades y resumen del pedido.

import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Tu carrito
      </h1>
      <CartView />
    </div>
  );
}
