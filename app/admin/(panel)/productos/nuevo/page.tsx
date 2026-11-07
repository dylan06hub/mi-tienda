import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductosAdmin } from "@/lib/productos";
import { ProductoForm } from "../ProductoForm";

export const metadata: Metadata = {
  title: "Nuevo producto | Administración",
  robots: { index: false, follow: false },
};

export default async function NuevoProductoPage() {
  await requireAdmin();
  const categorias = [...new Set((await getProductosAdmin()).map((item) => item.categoria))].sort();

  return (
    <div className="max-w-3xl py-6 md:py-8">
      <Link
        href="/admin/productos"
        className="text-sm text-street-muted underline-offset-4 hover:text-street-foreground hover:underline"
      >
        ← Productos
      </Link>

      <h1 className="mt-3 street-title text-5xl sm:text-6xl">
        Nuevo producto
      </h1>

      <p className="mt-3 text-sm text-street-muted">Cargá los datos de la prenda, agregá sus talles y elegí si querés publicarla.</p>
      <ProductoForm categorias={categorias} />
    </div>
  );
}
