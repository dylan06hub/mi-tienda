"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EstadoFormulario = { error: string } | null;

type VarianteEntrada = {
  id: string | null;
  talle: string;
  color: string;
  stock: number;
};

const BUCKET_IMAGENES = "productos";
const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const EXTENSION_IMAGEN: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type ImagenEntrada = {
  archivo: File;
  extension: string;
  contentType: string;
} | null;

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function slugificar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function leerImagen(
  formData: FormData,
): { error: string } | { imagen: ImagenEntrada } {
  const valor = formData.get("imagen_archivo");

  if (!valor || typeof valor === "string" || valor.size === 0) {
    return { imagen: null };
  }

  const tipo = valor.type.toLowerCase();
  const extension = EXTENSION_IMAGEN[tipo];

  if (!extension) {
    return { error: "La imagen debe ser JPG, PNG o WebP." };
  }

  if (valor.size > MAX_IMAGEN_BYTES) {
    return { error: "La imagen no puede superar los 5 MB." };
  }

  return { imagen: { archivo: valor, extension, contentType: tipo } };
}

async function borrarImagen(ruta: string) {
  await createSupabaseAdminClient()
    .storage.from(BUCKET_IMAGENES)
    .remove([ruta]);
}

function leerVariantes(
  formData: FormData,
): { error: string } | { variantes: VarianteEntrada[] } {
  const talles = formData.getAll("variante_talle");
  const colores = formData.getAll("variante_color");
  const stocks = formData.getAll("variante_stock");
  const ids = formData.getAll("variante_id");

  if (
    talles.length !== colores.length ||
    talles.length !== stocks.length ||
    talles.length !== ids.length
  ) {
    return { error: "Las variantes enviadas no son válidas." };
  }

  const variantes: VarianteEntrada[] = [];
  const vistas = new Set<string>();

  for (let indice = 0; indice < talles.length; indice += 1) {
    const talleValor = talles[indice];
    const colorValor = colores[indice];
    const stockValor = stocks[indice];
    const idValor = ids[indice];
    const talle =
      typeof talleValor === "string" ? talleValor.trim() : "";
    const color =
      typeof colorValor === "string" ? colorValor.trim() : "";
    const stockTexto =
      typeof stockValor === "string" ? stockValor.trim() : "";
    const id = typeof idValor === "string" ? idValor.trim() : "";

    if (!talle && !color && !stockTexto) continue;

    if (!talle || !color) {
      return { error: "Completá talle y color en todas las variantes." };
    }

    if (!stockTexto) {
      return { error: "Completá el stock de todas las variantes." };
    }

    const stock = Number(stockTexto);

    if (!Number.isInteger(stock) || stock < 0) {
      return {
        error: "El stock debe ser un entero mayor o igual a 0.",
      };
    }

    const clave = `${talle.toLowerCase()}\u0000${color.toLowerCase()}`;

    if (vistas.has(clave)) {
      return {
        error: `La variante ${talle} / ${color} está repetida.`,
      };
    }

    vistas.add(clave);
    variantes.push({ id: id || null, talle, color, stock });
  }

  if (variantes.length === 0) {
    return { error: "Agregá al menos una variante." };
  }

  return { variantes };
}

async function generarId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  base: string,
): Promise<{ id: string } | { error: string }> {
  let id = base;
  let sufijo = 2;

  while (true) {
    const { data, error } = await supabase
      .from("productos")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { error: "No se pudo generar el ID del producto." };
    }

    if (!data) return { id };

    id = `${base}-${sufijo}`;
    sufijo += 1;
  }
}

function revalidarCatalogo(id?: string) {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin/productos");

  if (id) {
    revalidatePath(`/productos/${id}`);
    revalidatePath(`/admin/productos/${id}`);
  }
}

export async function guardarProducto(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireAdmin();

  const idExistente = texto(formData, "id");
  const nombre = texto(formData, "nombre");

  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }

  const categoria = texto(formData, "categoria");

  if (!categoria) {
    return { error: "La categoría es obligatoria." };
  }

  const precioTexto = texto(formData, "precio");
  const precio = Number(precioTexto);
  const precioFinal = Number(precio.toFixed(2));

  if (
    !precioTexto ||
    !Number.isFinite(precio) ||
    precio <= 0 ||
    precioFinal <= 0
  ) {
    return { error: "El precio debe ser un número mayor que 0." };
  }

  if (precioFinal > 9_999_999_999.99) {
    return { error: "El precio es demasiado alto." };
  }

  const variantesResultado = leerVariantes(formData);

  if ("error" in variantesResultado) {
    return { error: variantesResultado.error };
  }

  const imagenResultado = leerImagen(formData);

  if ("error" in imagenResultado) {
    return { error: imagenResultado.error };
  }

  const supabase = await createSupabaseServerClient();
  let id = idExistente;
  let imagenActual = "";

  if (id) {
    if (!/^[a-z0-9-]+$/.test(id)) {
      return { error: "El ID del producto no es válido." };
    }

    const { data: existente, error } = await supabase
      .from("productos")
      .select("id, imagen")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { error: "No se pudo comprobar el producto." };
    }

    if (!existente) {
      return { error: "El producto ya no existe." };
    }

    imagenActual = existente.imagen ?? "";
  } else {
    const generado = await generarId(
      supabase,
      slugificar(nombre) || "producto",
    );

    if ("error" in generado) return generado;

    id = generado.id;
  }

  const { data: actuales, error: actualesError } = await supabase
    .from("variantes")
    .select("id, talle, color")
    .eq("producto_id", id);

  if (actualesError) {
    return { error: "No se pudieron comprobar las variantes actuales." };
  }

  const existentes = (actuales ?? []) as {
    id: string;
    talle: string;
    color: string;
  }[];
  const porId = new Map(existentes.map((variante) => [variante.id, variante]));
  const porClave = new Map(
    existentes.map((variante) => [
      `${variante.talle.toLowerCase()}\u0000${variante.color.toLowerCase()}`,
      variante.id,
    ]),
  );
  const idsUsados = new Set<string>();

  const filasVariantes = variantesResultado.variantes.map((variante) => {
    const clave = `${variante.talle.toLowerCase()}\u0000${variante.color.toLowerCase()}`;
    const actual = variante.id ? porId.get(variante.id) : undefined;
    const mismaIdentidad =
      actual !== undefined &&
      actual.talle.toLowerCase() === variante.talle.toLowerCase() &&
      actual.color.toLowerCase() === variante.color.toLowerCase();

    // Cambiar talle/color crea otra variante; borrar la vieja falla si tiene pedidos.
    const idVariante = mismaIdentidad
      ? actual.id
      : (porClave.get(clave) ?? crypto.randomUUID());

    idsUsados.add(idVariante);

    return {
      id: idVariante,
      producto_id: id,
      talle: variante.talle,
      color: variante.color,
      stock: variante.stock,
    };
  });

  const idsAEliminar = existentes
    .filter((variante) => !idsUsados.has(variante.id))
    .map((variante) => variante.id);

  if (idsAEliminar.length > 0) {
    const { count, error } = await supabase
      .from("items_pedido")
      .select("pedido_id", { count: "exact", head: true })
      .eq("producto_id", id)
      .in("variante_id", idsAEliminar);

    if (error) {
      return { error: "No se pudieron comprobar los pedidos asociados." };
    }

    if ((count ?? 0) > 0) {
      return {
        error: "No se pueden eliminar variantes con pedidos asociados.",
      };
    }
  }

  let imagen = imagenActual;
  let imagenSubida: string | null = null;

  if (imagenResultado.imagen) {
    const ruta = `${id}/${crypto.randomUUID()}.${imagenResultado.imagen.extension}`;
    const admin = createSupabaseAdminClient();
    const { error: subidaError } = await admin.storage
      .from(BUCKET_IMAGENES)
      .upload(ruta, imagenResultado.imagen.archivo, {
        contentType: imagenResultado.imagen.contentType,
        upsert: false,
      });

    if (subidaError) {
      return {
        error:
          "No se pudo subir la imagen. Verificá el bucket público productos y la service role.",
      };
    }

    const { data } = admin.storage.from(BUCKET_IMAGENES).getPublicUrl(ruta);
    imagen = data.publicUrl;
    imagenSubida = ruta;
  }

  const datos = {
    nombre,
    descripcion: texto(formData, "descripcion") || null,
    precio: precioFinal,
    categoria,
    imagen: imagen || null,
    activo: formData.get("activo") === "on",
  };

  const { error: guardarError } = idExistente
    ? await supabase.from("productos").update(datos).eq("id", id)
    : await supabase.from("productos").insert({ id, ...datos });

  if (guardarError) {
    if (imagenSubida) await borrarImagen(imagenSubida);

    return { error: "No se pudo guardar el producto." };
  }

  const { error: variantesError } = await supabase
    .from("variantes")
    .upsert(filasVariantes, { onConflict: "producto_id,id" });

  if (variantesError) {
    if (!idExistente) {
      const { error: limpiezaError } = await supabase
        .from("productos")
        .delete()
        .eq("id", id);

      if (!limpiezaError && imagenSubida) {
        await borrarImagen(imagenSubida);
      }
    }

    return { error: "No se pudieron guardar las variantes." };
  }

  if (idsAEliminar.length > 0) {
    const { error: borrarError } = await supabase
      .from("variantes")
      .delete()
      .eq("producto_id", id)
      .in("id", idsAEliminar);

    if (borrarError) {
      return {
        error:
          "El producto se guardó, pero no se pudieron eliminar algunas variantes.",
      };
    }
  }

  revalidarCatalogo(id);
  redirect("/admin/productos");
}

export async function eliminarProducto(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireAdmin();

  const id = texto(formData, "id");

  if (!id) return { error: "Producto inválido." };

  const supabase = await createSupabaseServerClient();
  const { count, error: pedidosError } = await supabase
    .from("items_pedido")
    .select("pedido_id", { count: "exact", head: true })
    .eq("producto_id", id);

  if (pedidosError) {
    return { error: "No se pudo comprobar si el producto tiene pedidos." };
  }

  if ((count ?? 0) > 0) {
    return { error: "No se puede eliminar: tiene pedidos asociados." };
  }

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "No se pudo eliminar el producto." };
  }

  revalidarCatalogo(id);
  redirect("/admin/productos");
}
