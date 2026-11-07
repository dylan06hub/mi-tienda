import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getConsultasAdmin } from "@/lib/consultas";
import { formatearFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Consultas | Administración",
  robots: { index: false, follow: false },
};

export default async function AdminConsultasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const consultas = await getConsultasAdmin();

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const filtradas = consultas.filter((consulta) =>
    `${consulta.nombre} ${consulta.email} ${consulta.asunto} ${consulta.mensaje}`.toLocaleLowerCase("es").includes(q.toLocaleLowerCase("es")),
  );

  return (
    <div className="max-w-4xl py-6 md:py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Consultas</h1>
      <p className="mt-2 text-sm text-stone-600">Mensajes del formulario de contacto, del más reciente al más antiguo. Abrí una consulta para leerla y responder por email.</p>
      <form key={q} method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="buscar-consultas" className="text-sm font-medium">Buscar consulta</label>
          <input id="buscar-consultas" type="search" name="q" defaultValue={q} placeholder="Nombre, email, asunto o mensaje" className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-base" />
        </div>
        <button className="min-h-11 rounded-lg border border-stone-900 px-5 text-sm font-medium hover:bg-stone-100">Buscar</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p role="status">{filtradas.length} de {consultas.length} consultas</p>
        {q && <Link href="/admin/consultas" className="inline-flex min-h-11 items-center underline underline-offset-4">Limpiar búsqueda</Link>}
      </div>

      {filtradas.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">{consultas.length === 0 ? "Todavía no hay consultas." : "No encontramos consultas. Probá otra búsqueda."}</p>
      ) : (
        <div className="mt-8 space-y-5">
          {filtradas.map((consulta, indice) => (
            <details key={consulta.id} open={indice === 0} className="rounded-xl border border-stone-200 bg-white p-5">
              <summary className="cursor-pointer break-words font-medium">{consulta.asunto} <span className="font-normal text-stone-600">· {consulta.nombre}</span></summary>
              <p className="mt-2 break-words text-sm text-stone-700">{consulta.nombre} · <a href={`mailto:${encodeURIComponent(consulta.email)}`} className="underline underline-offset-4">{consulta.email}</a></p>
              {consulta.telefono && <p className="mt-1 break-words text-sm text-stone-600">Teléfono: {consulta.telefono}</p>}
              <p className="mt-2 text-xs text-stone-500">{formatearFecha(consulta.creado_en)}</p>
              <p className="mt-5 whitespace-pre-wrap break-words border-t border-stone-100 pt-5 text-sm leading-6 text-stone-700">{consulta.mensaje}</p>
              <a href={`mailto:${encodeURIComponent(consulta.email)}?subject=${encodeURIComponent(`Re: ${consulta.asunto}`)}`} className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-medium hover:border-stone-900">Responder por email</a>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
