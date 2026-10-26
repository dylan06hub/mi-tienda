import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  EstadoPedido,
  ItemPedidoAdmin,
  PedidoAdmin,
  PedidoDetalleAdmin,
} from "@/types";

const CAMPOS_PEDIDO =
  "id, estado, total, nombre, email, telefono, direccion, creado_en, mp_payment_id";

type PedidoFila = {
  id: string;
  estado: string;
  total: number | string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  creado_en: string;
  mp_payment_id: string | null;
};

type ItemPedidoFila = {
  producto_id: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: number | string;
};

type ProductoFila = {
  id: string;
  nombre: string;
  variantes: { id: string; talle: string; color: string }[] | null;
};

function aPedido(fila: PedidoFila): PedidoAdmin {
  return {
    id: fila.id,
    estado: fila.estado as EstadoPedido,
    total: Number(fila.total),
    nombre: fila.nombre,
    email: fila.email,
    telefono: fila.telefono ?? "",
    direccion: fila.direccion ?? "",
    creadoEn: fila.creado_en,
  };
}

export const getPedidosAdmin = cache(async (): Promise<PedidoAdmin[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(CAMPOS_PEDIDO)
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);
  }

  return ((data ?? []) as PedidoFila[]).map(aPedido);
});

export const getPedidoAdmin = cache(
  async (id: string): Promise<PedidoDetalleAdmin | undefined> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("pedidos")
      .select(CAMPOS_PEDIDO)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo cargar el pedido: ${error.message}`);
    }

    if (!data) return undefined;

    const { data: itemsData, error: itemsError } = await supabase
      .from("items_pedido")
      .select("producto_id, variante_id, cantidad, precio_unitario")
      .eq("pedido_id", id)
      .order("producto_id");

    if (itemsError) {
      throw new Error(
        `No se pudieron cargar los items del pedido: ${itemsError.message}`,
      );
    }

    const items = (itemsData ?? []) as ItemPedidoFila[];
    const productoIds = [...new Set(items.map((item) => item.producto_id))];
    let productos: ProductoFila[] = [];

    if (productoIds.length > 0) {
      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select("id, nombre, variantes(id, talle, color)")
        .in("id", productoIds);

      if (productosError) {
        throw new Error(
          `No se pudieron cargar los productos del pedido: ${productosError.message}`,
        );
      }

      productos = (productosData ?? []) as ProductoFila[];
    }

    const productosPorId = new Map(
      productos.map((producto) => [producto.id, producto]),
    );

    const itemsDetalle: ItemPedidoAdmin[] = items.map((item) => {
      const producto = productosPorId.get(item.producto_id);
      const variante = producto?.variantes?.find(
        (dato) => dato.id === item.variante_id,
      );
      const precioUnitario = Number(item.precio_unitario);

      return {
        productoId: item.producto_id,
        productoNombre: producto?.nombre ?? item.producto_id,
        varianteId: item.variante_id,
        talle: variante?.talle ?? "",
        color: variante?.color ?? "",
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: precioUnitario * item.cantidad,
      };
    });

    return {
      ...aPedido(data as PedidoFila),
      mpPaymentId: (data as PedidoFila).mp_payment_id,
      items: itemsDetalle,
    };
  },
);
