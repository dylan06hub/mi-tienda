"use client";

// Estado global del carrito, persistido en localStorage y sincronizado entre pestañas.

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProducto } from "@/lib/productos";
import type { ItemCarrito } from "@/types";

const CLAVE = "norte-carrito";
const VACIO: ItemCarrito[] = [];
const oyentes = new Set<() => void>();

let estado: ItemCarrito[] = [];
let hidratado = false;

function leerGuardado(): ItemCarrito[] {
  try {
    const guardado = localStorage.getItem(CLAVE);
    const datos = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (!hidratado) {
    hidratado = true;
    estado = leerGuardado();
  }
  return estado;
}

function getServerSnapshot() {
  return VACIO;
}

function subscribe(oyente: () => void) {
  oyentes.add(oyente);

  function alCambiarOtraPestana(evento: StorageEvent) {
    if (evento.key === CLAVE) {
      estado = leerGuardado();
      avisar();
    }
  }

  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function guardar(siguientes: ItemCarrito[]) {
  estado = siguientes;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(siguientes));
  } catch {
    // Sin persistencia el carrito sigue funcionando en memoria.
  }
  avisar();
}

interface CartContextValue {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  quitar: (productoId: string, varianteId: string) => void;
  cambiarCantidad: (
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function agregar(item: ItemCarrito) {
    const stock =
      getProducto(item.productoId)?.variantes.find(
        (variante) => variante.id === item.varianteId,
      )?.stock ?? 0;

    if (stock <= 0) return;

    const existente = estado.find(
      (previo) =>
        previo.productoId === item.productoId &&
        previo.varianteId === item.varianteId,
    );

    if (!existente) {
      guardar([
        ...estado,
        { ...item, cantidad: Math.min(item.cantidad, stock) },
      ]);
      return;
    }

    guardar(
      estado.map((previo) =>
        previo === existente
          ? {
              ...previo,
              cantidad: Math.min(previo.cantidad + item.cantidad, stock),
            }
          : previo,
      ),
    );
  }

  function quitar(productoId: string, varianteId: string) {
    guardar(
      estado.filter(
        (item) =>
          item.productoId !== productoId || item.varianteId !== varianteId,
      ),
    );
  }

  function cambiarCantidad(
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) {
    guardar(
      estado.map((item) =>
        item.productoId === productoId && item.varianteId === varianteId
          ? { ...item, cantidad: Math.max(1, cantidad) }
          : item,
      ),
    );
  }

  return (
    <CartContext.Provider
      value={{ items, agregar, quitar, cambiarCantidad }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return contexto;
}
