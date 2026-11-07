"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import type { ItemCarrito } from "@/types";

export function LimpiarCarrito({ pedidoId, items }: { pedidoId: string; items: ItemCarrito[] }) {
  const { aplicarPedido } = useCart();

  useEffect(() => {
    void aplicarPedido(pedidoId, items);
  }, [aplicarPedido, pedidoId, items]);

  return null;
}
