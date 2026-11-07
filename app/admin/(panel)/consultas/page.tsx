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
      <h1 className="street-title text-5xl sm:text-6xl">Consultas</h1>
      <p className="mt-2 text-sm text-street-muted">Mensajes del formulario de contacto, del más reciente al más antiguo. Abrí una consulta para leerla y responder por email.</p>
      <form key={q} method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-street border border-street-border bg-street-surface p-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="buscar-consultas" className="text-sm font-medium">Buscar consulta</label>
          <input id="buscar-consultas" type="search" name="q" defaultValue={q} placeholder="Nombre, email, asunto o mensaje" className="mt-2 h-11 w-full rounded-street border border-street-muted px-3 text-base bg-street-background" />
        </div>
        <button className="min-h-11 rounded-street border border-street-accent px-5 text-sm font-medium hover:bg-street-background">Buscar</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-street-muted">
        <p role="status">{filtradas.length} de {consultas.length} consultas</p>
        {q && <Link href="/admin/consultas" className="inline-flex min-h-11 items-center underline underline-offset-4">Limpiar búsqueda</Link>}
      </div>

      {filtradas.length === 0 ? (
        <p className="mt-8 rounded-street border border-street-border bg-street-surface p-8 text-sm text-street-muted">{consultas.length === 0 ? "Todavía no hay consultas." : "No encontramos consultas. Probá otra búsqueda."}</p>
      ) : (
        <div className="mt-8 space-y-5">
          {filtradas.map((consulta, indice) => (
            <details key={consulta.id} open={indice === 0} className="rounded-street border border-street-border bg-street-surface p-5">
              <summary className="cursor-pointer break-words font-medium">{consulta.asunto} <span className="font-normal text-street-muted">· {consulta.nombre}</span></summary>
              <p className="mt-2 break-words text-sm text-street-muted">{consulta.nombre} · <a href={`mailto:${encodeURIComponent(consulta.email)}`} className="underline underline-offset-4">{consulta.email}</a></p>
              {consulta.telefono && <p className="mt-1 break-words text-sm text-street-muted">Teléfono: {consulta.telefono}</p>}
              <p className="mt-2 text-xs text-street-muted">{formatearFecha(consulta.creado_en)}</p>
              <p className="mt-5 whitespace-pre-wrap break-words border-t border-street-border pt-5 text-sm leading-6 text-street-muted">{consulta.mensaje}</p>
              <a href={`mailto:${encodeURIComponent(consulta.email)}?subject=${encodeURIComponent(`Re: ${consulta.asunto}`)}`} className="mt-4 inline-flex min-h-11 items-center rounded-street border border-street-muted px-4 text-sm font-medium hover:border-street-accent">Responder por email</a>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
