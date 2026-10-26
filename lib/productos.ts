import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Producto, ProductoAdmin, Variante } from "@/types";

const ALIAS_PRODUCTOS: Record<string, string> = {
  "sudadera-norte": "buzo-norte",
};

const CAMPOS_PRODUCTO =
  "id, nombre, descripcion, precio, categoria, imagen, variantes(id, talle, color, stock)";

const CAMPOS_PRODUCTO_ADMIN =
  "id, nombre, descripcion, precio, categoria, imagen, activo, variantes(id, talle, color, stock)";

type VarianteFila = {
  id: string;
  talle: string;
  color: string;
  stock: number;
};

type ProductoFila = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  categoria: string;
  imagen: string | null;
  variantes: VarianteFila[] | null;
};

type ProductoAdminFila = ProductoFila & { activo: boolean };

function aProducto(fila: ProductoFila): Producto {
  const variantes: Variante[] = (fila.variantes ?? []).map((variante) => ({
    id: variante.id,
    talle: variante.talle,
    color: variante.color,
    stock: variante.stock,
  }));

  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? "",
    precio: Number(fila.precio),
    categoria: fila.categoria,
    imagen: fila.imagen ?? "",
    variantes,
  };
}

function aProductoAdmin(fila: ProductoAdminFila): ProductoAdmin {
  return { ...aProducto(fila), activo: fila.activo };
}

export function normalizarIdProducto(id: string) {
  return ALIAS_PRODUCTOS[id] ?? id;
}

export const getProductos = cache(async (): Promise<Producto[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("productos")
    .select(CAMPOS_PRODUCTO)
    .eq("activo", true)
    .order("nombre");

  if (error) {
    throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  }

  return ((data ?? []) as ProductoFila[]).map(aProducto);
});

export const getProducto = cache(
  async (id: string): Promise<Producto | undefined> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("productos")
      .select(CAMPOS_PRODUCTO)
      .eq("id", normalizarIdProducto(id))
      .eq("activo", true)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo cargar el producto: ${error.message}`);
    }

    return data ? aProducto(data as ProductoFila) : undefined;
  },
);

export const getProductosAdmin = cache(
  async (): Promise<ProductoAdmin[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("productos")
      .select(CAMPOS_PRODUCTO_ADMIN)
      .order("nombre");

    if (error) {
      throw new Error(
        `No se pudo cargar el catálogo administrable: ${error.message}`,
      );
    }

    return ((data ?? []) as ProductoAdminFila[]).map(aProductoAdmin);
  },
);

export const getProductoAdmin = cache(
  async (id: string): Promise<ProductoAdmin | undefined> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("productos")
      .select(CAMPOS_PRODUCTO_ADMIN)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(
        `No se pudo cargar el producto administrable: ${error.message}`,
      );
    }

    return data ? aProductoAdmin(data as ProductoAdminFila) : undefined;
  },
);
