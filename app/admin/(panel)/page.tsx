import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { cerrarSesionAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Administración
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Panel
      </h1>
      <p className="mt-4 text-sm text-stone-600">
        Sesión iniciada como {admin.email || "administrador"}.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/productos"
          className="inline-flex h-11 items-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Administrar productos
        </Link>
        <Link
          href="/admin/pedidos"
          className="inline-flex h-11 items-center rounded-full border border-stone-300 px-5 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
        >
          Administrar pedidos
        </Link>
      </div>

      <form action={cerrarSesionAdmin} className="mt-8">
        <button
          type="submit"
          className="h-10 rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
