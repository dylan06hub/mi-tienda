"use client";

// Estado global del carrito, persistido en localStorage y sincronizado entre pestañas.

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProducto } from "@/lib/productos";
import { normalizarCarrito } from "@/lib/utils";
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
    return Array.isArray(datos) ? normalizarCarrito(datos) : [];
  } catch {
    return estado;
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

function stockDe(productoId: string, varianteId: string) {
  return (
    getProducto(productoId)?.variantes.find(
      (variante) => variante.id === varianteId,
    )?.stock ?? 0
  );
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

// Serializa lectura y escritura para no pisar cambios de otra pestaña.
async function actualizar(
  aplicar: (items: ItemCarrito[]) => ItemCarrito[],
): Promise<ItemCarrito[]> {
  const ejecutar = () => {
    const siguientes = aplicar(leerGuardado());
    guardar(siguientes);
    return siguientes;
  };

  if (!navigator.locks) return ejecutar();

  try {
    return await navigator.locks.request(CLAVE, ejecutar);
  } catch {
    return ejecutar();
  }
}

interface CartContextValue {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => Promise<boolean>;
  quitar: (productoId: string, varianteId: string) => Promise<void>;
  cambiarCantidad: (
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  async function agregar(item: ItemCarrito): Promise<boolean> {
    let cambio = false;

    await actualizar((items) => {
      const stock = stockDe(item.productoId, item.varianteId);
      if (stock <= 0) return items;

      const existente = items.find(
        (previo) =>
          previo.productoId === item.productoId &&
          previo.varianteId === item.varianteId,
      );

      if (!existente) {
        cambio = true;
        return [
          ...items,
          { ...item, cantidad: Math.min(item.cantidad, stock) },
        ];
      }

      const cantidad = Math.min(existente.cantidad + item.cantidad, stock);
      if (cantidad === existente.cantidad) return items;

      cambio = true;
      return items.map((previo) =>
        previo === existente ? { ...previo, cantidad } : previo,
      );
    });

    return cambio;
  }

  async function quitar(productoId: string, varianteId: string) {
    await actualizar((items) =>
      items.filter(
        (item) =>
          item.productoId !== productoId || item.varianteId !== varianteId,
      ),
    );
  }

  async function cambiarCantidad(
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) {
    await actualizar((items) => {
      const stock = stockDe(productoId, varianteId);

      if (stock <= 0) {
        return items.filter(
          (item) =>
            item.productoId !== productoId || item.varianteId !== varianteId,
        );
      }

      return items.map((item) =>
        item.productoId === productoId && item.varianteId === varianteId
          ? {
              ...item,
              cantidad: Math.min(Math.max(1, cantidad), stock),
            }
          : item,
      );
    });
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
