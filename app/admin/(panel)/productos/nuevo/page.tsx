import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { ProductoForm } from "../ProductoForm";

export const metadata: Metadata = {
  title: "Nuevo producto | Administración",
  robots: { index: false, follow: false },
};

export default async function NuevoProductoPage() {
  await requireAdmin();

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
        Nuevo producto
      </h1>

      <ProductoForm />
    </div>
  );
}
