// Checkout: datos de contacto y creación del pedido contra la base.

import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-street-muted">
        Checkout
      </p>
      <h1 className="mt-3 street-title text-5xl sm:text-6xl">
        Finalizá tu compra
      </h1>
      <CheckoutForm />
    </div>
  );
}
