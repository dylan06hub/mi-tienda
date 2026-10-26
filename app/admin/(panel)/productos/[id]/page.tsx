import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductoAdmin } from "@/lib/productos";
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
  const { id } = await params;
  const producto = await getProductoAdmin(id);

  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <Link
        href="/admin/productos"
        className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Productos
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-stone-500">
        Administración
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Editar producto
      </h1>

      <ProductoForm producto={producto} />

      <div className="mt-12 border-t border-stone-200 pt-6">
        <p className="text-sm font-medium text-stone-900">
          Eliminar producto
        </p>
        <p className="mt-1 text-xs text-stone-500">
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
