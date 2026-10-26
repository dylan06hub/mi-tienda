import { NextResponse } from "next/server";
import { getProductos, normalizarIdProducto } from "@/lib/productos";
import { costeEnvio } from "@/lib/utils";
import type { CarritoValidado, ItemCarrito, LineaCarrito } from "@/types";

const MAX_ITEMS = 100;
const MAX_CANTIDAD = 9999;

function parsearItems(value: unknown): ItemCarrito[] | null {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return null;

  const items: ItemCarrito[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;

    const { productoId, varianteId, cantidad } = item as Partial<ItemCarrito>;

    if (
      typeof productoId !== "string" ||
      typeof varianteId !== "string" ||
      !productoId ||
      !varianteId ||
      productoId.length > 100 ||
      varianteId.length > 100 ||
      typeof cantidad !== "number" ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      return null;
    }

    items.push({
      productoId,
      varianteId,
      cantidad: Math.min(cantidad, MAX_CANTIDAD),
    });
  }

  return items;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const items = parsearItems(
    (body as { items?: unknown } | null)?.items,
  );

  if (!items) {
    return NextResponse.json(
      { error: "Carrito inválido" },
      { status: 400 },
    );
  }

  if (items.length === 0) {
    return NextResponse.json<CarritoValidado>({
      items: [],
      lineas: [],
      subtotal: 0,
      envio: 0,
      total: 0,
    });
  }

  try {
    const productos = await getProductos();
    const productosPorId = new Map(
      productos.map((producto) => [producto.id, producto]),
    );
    const agrupados = new Map<string, LineaCarrito>();

    for (const item of items) {
      const producto = productosPorId.get(
        normalizarIdProducto(item.productoId),
      );
      if (!producto) continue;

      const variante =
        producto.variantes.find(
          (opcion) => opcion.id === item.varianteId,
        ) ??
        producto.variantes.find((opcion) =>
          opcion.id.startsWith(`${item.varianteId}-`),
        );

      if (!variante || variante.stock <= 0) continue;

      const clave = JSON.stringify([producto.id, variante.id]);
      const previo = agrupados.get(clave);
      const cantidad = Math.min(
        (previo?.cantidad ?? 0) + item.cantidad,
        variante.stock,
      );

      agrupados.set(clave, {
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          categoria: producto.categoria,
        },
        variante,
        cantidad,
        subtotal: producto.precio * cantidad,
      });
    }

    const lineas = [...agrupados.values()];
    const itemsNormalizados: ItemCarrito[] = lineas.map((linea) => ({
      productoId: linea.producto.id,
      varianteId: linea.variante.id,
      cantidad: linea.cantidad,
    }));
    const subtotal = lineas.reduce(
      (total, linea) => total + linea.subtotal,
      0,
    );
    const envio = lineas.length === 0 ? 0 : costeEnvio(subtotal);
    const total = subtotal + envio;

    return NextResponse.json<CarritoValidado>({
      items: itemsNormalizados,
      lineas,
      subtotal,
      envio,
      total,
    });
  } catch (error) {
    console.error("Error al validar el carrito:", error);
    return NextResponse.json(
      { error: "No se pudo validar el carrito" },
      { status: 500 },
    );
  }
}
