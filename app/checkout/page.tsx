// Checkout: datos de contacto y creación del pedido contra la base.

import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Checkout
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Finalizá tu compra
      </h1>
      <CheckoutForm />
    </div>
  );
}
