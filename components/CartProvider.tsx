"use client";

// Estado global del carrito, persistido en localStorage y sincronizado entre pestañas.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { costeEnvio, normalizarCarrito } from "@/lib/utils";
import { descontarCompra } from "@/lib/carrito";
import type {
  CarritoValidado,
  ItemCarrito,
  LineaCarrito,
  ProductoCarrito,
  Variante,
} from "@/types";

const CLAVE = "norte-carrito";
const VACIO: ItemCarrito[] = [];
const oyentes = new Set<() => void>();

let estado: ItemCarrito[] = [];
let hidratado = false;
let pedidosAplicados: string[] = [];
let comprasPendientes: Record<string, ItemCarrito[]> = {};

type DatosLinea = {
  producto: ProductoCarrito;
  variante: Variante;
};

function claveItem(productoId: string, varianteId: string) {
  return JSON.stringify([productoId, varianteId]);
}

function mismosItems(actuales: ItemCarrito[], siguientes: ItemCarrito[]) {
  if (actuales.length !== siguientes.length) return false;

  const cantidades = new Map(
    actuales.map((item) => [
      claveItem(item.productoId, item.varianteId),
      item.cantidad,
    ]),
  );

  return siguientes.every(
    (item) =>
      cantidades.get(claveItem(item.productoId, item.varianteId)) ===
      item.cantidad,
  );
}

function leerGuardado(): ItemCarrito[] {
  try {
    const guardado = localStorage.getItem(CLAVE);
    const datos = guardado ? JSON.parse(guardado) : [];
    if (Array.isArray(datos)) {
      pedidosAplicados = [];
      comprasPendientes = {};
      return normalizarCarrito(datos);
    }
    pedidosAplicados = Array.isArray(datos?.pedidosAplicados)
      ? datos.pedidosAplicados.filter((id: unknown): id is string => typeof id === "string")
      : [];
    comprasPendientes = Object.fromEntries(
      Object.entries(datos?.comprasPendientes ?? {}).map(([id, compra]) => [id, normalizarCarrito(compra)]),
    );
    return normalizarCarrito(datos?.items);
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

function guardar(siguientes: ItemCarrito[]) {
  estado = siguientes;
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ items: siguientes, pedidosAplicados, comprasPendientes }));
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
  lineas: LineaCarrito[];
  subtotal: number;
  envio: number;
  total: number;
  cargando: boolean;
  error: string | null;
  agregar: (item: ItemCarrito, datos?: DatosLinea) => Promise<boolean>;
  quitar: (productoId: string, varianteId: string) => Promise<void>;
  cambiarCantidad: (
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) => Promise<void>;
  vaciar: () => Promise<void>;
  aplicarPedido: (pedidoId: string, comprados: ItemCarrito[]) => Promise<void>;
  registrarPedido: (pedidoId: string, comprados: ItemCarrito[]) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [conocidas, setConocidas] = useState(
    () => new Map<string, DatosLinea>(),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const controller = new AbortController();
    let activo = true;

    fetch("/api/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      signal: controller.signal,
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudo validar el carrito");
        }
        return (await respuesta.json()) as CarritoValidado;
      })
      .then((datos) => {
        if (!activo || getSnapshot() !== items) return;

        setConocidas(() => {
          const siguientes = new Map<string, DatosLinea>();
          for (const linea of datos.lineas) {
            siguientes.set(
              claveItem(linea.producto.id, linea.variante.id),
              {
                producto: linea.producto,
                variante: linea.variante,
              },
            );
          }
          return siguientes;
        });

        if (!mismosItems(items, datos.items)) {
          guardar(datos.items);
        }

        setError(null);
      })
      .catch((err: unknown) => {
        if (!activo) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError("No pudimos actualizar precios y stock.");
      });

    return () => {
      activo = false;
      controller.abort();
    };
  }, [items]);

  const cargando =
    items.length > 0 &&
    !error &&
    items.some(
      (item) =>
        !conocidas.has(
          claveItem(item.productoId, item.varianteId),
        ),
    );

  const lineas: LineaCarrito[] = items.flatMap((item) => {
    const datos = conocidas.get(
      claveItem(item.productoId, item.varianteId),
    );
    if (!datos) return [];

    return [
      {
        producto: datos.producto,
        variante: datos.variante,
        cantidad: item.cantidad,
        subtotal: datos.producto.precio * item.cantidad,
      },
    ];
  });

  const subtotal = lineas.reduce(
    (total, linea) => total + linea.subtotal,
    0,
  );
  const envio = lineas.length === 0 ? 0 : costeEnvio(subtotal);
  const total = subtotal + envio;

  async function agregar(
    item: ItemCarrito,
    datos?: DatosLinea,
  ): Promise<boolean> {
    setError(null);

    if (datos) {
      setConocidas((previas) =>
        new Map(previas).set(
          claveItem(item.productoId, item.varianteId),
          datos,
        ),
      );
    }

    let cambio = false;
    const cantidad = Number.isFinite(item.cantidad)
      ? Math.max(1, Math.floor(item.cantidad))
      : 1;

    await actualizar((items) => {
      const existente = items.find(
        (previo) =>
          previo.productoId === item.productoId &&
          previo.varianteId === item.varianteId,
      );

      if (!existente) {
        cambio = true;
        return [...items, { ...item, cantidad }];
      }

      cambio = true;
      return items.map((previo) =>
        previo === existente
          ? { ...previo, cantidad: previo.cantidad + cantidad }
          : previo,
      );
    });

    return cambio;
  }

  async function quitar(productoId: string, varianteId: string) {
    setError(null);

    await actualizar((items) => {
      for (const id of Object.keys(comprasPendientes)) {
        comprasPendientes[id] = comprasPendientes[id].filter(
          (item) => item.productoId !== productoId || item.varianteId !== varianteId,
        );
      }
      return items.filter(
        (item) =>
          item.productoId !== productoId ||
          item.varianteId !== varianteId,
      );
    });
  }

  const vaciar = useCallback(async () => {
    setError(null);
    await actualizar(() => {
      comprasPendientes = {};
      return [];
    });
  }, []);

  const aplicarPedido = useCallback(async (pedidoId: string, comprados: ItemCarrito[]) => {
    await actualizar((actuales) => {
      if (pedidosAplicados.includes(pedidoId)) return actuales;
      pedidosAplicados = [...pedidosAplicados, pedidoId];
      const pendiente = comprasPendientes[pedidoId] ?? [];
      delete comprasPendientes[pedidoId];
      const aQuitar = comprados.map((item) => ({
        ...item,
        cantidad: Math.min(item.cantidad,
          pendiente.find((previo) => previo.productoId === item.productoId && previo.varianteId === item.varianteId)?.cantidad ?? 0,
          actuales.find((previo) => previo.productoId === item.productoId && previo.varianteId === item.varianteId)?.cantidad ?? 0),
      }));
      for (const compra of Object.values(comprasPendientes)) {
        for (const item of compra) {
          const quitado = aQuitar.find((otro) => otro.productoId === item.productoId && otro.varianteId === item.varianteId);
          item.cantidad = Math.max(0, item.cantidad - (quitado?.cantidad ?? 0));
        }
      }
      return descontarCompra(actuales, aQuitar);
    });
  }, []);

  const registrarPedido = useCallback(async (pedidoId: string, comprados: ItemCarrito[]) => {
    await actualizar((actuales) => {
      comprasPendientes[pedidoId] = comprados;
      return actuales;
    });
  }, []);

  async function cambiarCantidad(
    productoId: string,
    varianteId: string,
    cantidad: number,
  ) {
    setError(null);

    const siguiente = Number.isFinite(cantidad)
      ? Math.max(1, Math.floor(cantidad))
      : 1;

    await actualizar((items) => {
      for (const compra of Object.values(comprasPendientes)) {
        for (const item of compra) {
          if (item.productoId === productoId && item.varianteId === varianteId) {
            item.cantidad = Math.min(item.cantidad, siguiente);
          }
        }
      }
      return items.map((item) =>
        item.productoId === productoId &&
        item.varianteId === varianteId
          ? { ...item, cantidad: siguiente }
          : item,
      );
    });
  }

  return (
    <CartContext.Provider
      value={{
        items,
        lineas,
        subtotal,
        envio,
        total,
        cargando,
        error,
        agregar,
        quitar,
        cambiarCantidad,
        vaciar,
        aplicarPedido,
        registrarPedido,
      }}
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
