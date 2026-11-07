import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getConsultasAdmin } from "@/lib/consultas";
import { formatearFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Consultas | Administración",
  robots: { index: false, follow: false },
};

export default async function AdminConsultasPage() {
  await requireAdmin();
  const consultas = await getConsultasAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link href="/admin" className="text-sm text-stone-500 hover:underline">← Panel</Link>
      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-stone-500">Administración</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Consultas</h1>
      <p className="mt-2 text-sm text-stone-600">{consultas.length} consultas recibidas. Las más recientes aparecen primero.</p>

      {consultas.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">Todavía no hay consultas.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {consultas.map((consulta) => (
            <article key={consulta.id} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="break-words text-lg font-medium">{consulta.asunto}</h2>
              <p className="mt-2 break-words text-sm text-stone-700">{consulta.nombre} · <a href={`mailto:${encodeURIComponent(consulta.email)}`} className="underline underline-offset-4">{consulta.email}</a></p>
              {consulta.telefono && <p className="mt-1 break-words text-sm text-stone-600">Teléfono: {consulta.telefono}</p>}
              <p className="mt-2 text-xs text-stone-500">{formatearFecha(consulta.creado_en)}</p>
              <p className="mt-5 whitespace-pre-wrap break-words border-t border-stone-100 pt-5 text-sm leading-6 text-stone-700">{consulta.mensaje}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
