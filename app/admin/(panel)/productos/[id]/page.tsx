import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductoAdmin, getProductosAdmin } from "@/lib/productos";
import { DeleteProductButton } from "../DeleteProductButton";
import { ProductoForm } from "../ProductoForm";

export const metadata: Metadata = {
  title: "Editar producto | Administración",
  robots: { index: false, follow: false },
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const categorias = [...new Set((await getProductosAdmin()).map((item) => item.categoria))].sort();
  const { id } = await params;
  const producto = await getProductoAdmin(id);

  if (!producto) notFound();

  return (
    <div className="max-w-3xl py-6 md:py-8">
      <Link
        href="/admin/productos"
        className="text-sm text-street-muted underline-offset-4 hover:text-street-foreground hover:underline"
      >
        ← Productos
      </Link>

      <h1 className="mt-3 street-title text-5xl sm:text-6xl">
        Editar producto
      </h1>

      <p className="mt-3 break-words text-sm text-street-muted">{producto.nombre} · {producto.activo ? "Publicado en la tienda" : "Oculto al público"}</p>
      <ProductoForm producto={producto} categorias={categorias} />

      <div className="mt-12 border-t border-street-border pt-6">
        <p className="text-sm font-medium text-street-foreground">
          Eliminar producto
        </p>
        <p className="mt-1 text-xs text-street-muted">
          También se eliminarán sus variantes. No se puede deshacer.
        </p>
        <div className="mt-3">
          <DeleteProductButton
            id={producto.id}
            nombre={producto.nombre}
          />
        </div>
      </div>
    </div>
  );
}
