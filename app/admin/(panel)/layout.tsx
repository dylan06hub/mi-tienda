import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "./AdminNav";
import { cerrarSesionAdmin } from "./actions";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <section aria-label="Panel de administración" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-3xl font-black tracking-tight">Administración de norte.</p>
          <p className="mt-1 break-all text-xs text-street-muted">{admin.email || "Sesión de administrador"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">Ver tienda</Link>
          <form action={cerrarSesionAdmin}>
            <button className="min-h-11 rounded-street border border-street-muted px-4 hover:bg-street-background">Cerrar sesión</button>
          </form>
        </div>
      </div>
      <Suspense fallback={<div className="mt-5 h-16" />}><AdminNav /></Suspense>
      {children}
    </section>
  );
}
