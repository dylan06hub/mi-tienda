"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export function LimpiarCarrito() {
  const { vaciar } = useCart();

  useEffect(() => {
    void vaciar();
  }, [vaciar]);

  return null;
}
