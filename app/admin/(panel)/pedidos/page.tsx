import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getPedidosAdmin, getIncidenciasPago } from "@/lib/pedidos";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import { resolverIncidenciaPago } from "./actions";

export const metadata: Metadata = {
  title: "Pedidos | Administración",
  robots: { index: false, follow: false },
};

export default async function AdminPedidosPage({ searchParams }: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  await requireAdmin();
  const pedidos = await getPedidosAdmin();
  const incidencias = await getIncidenciasPago();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const estado = typeof params.estado === "string" ? params.estado : "";
  const filtrados = pedidos.filter((pedido) =>
    (!estado || pedido.estado === estado) &&
    `${pedido.id} ${pedido.nombre} ${pedido.email}`.toLocaleLowerCase("es").includes(q.toLocaleLowerCase("es")),
  );
  const pendientes = incidencias.filter((incidencia) => !incidencia.resuelta_en);
  const resueltas = incidencias.filter((incidencia) => incidencia.resuelta_en);
  const motivos: Record<string, string> = {
    reserva_vencida: "Pago recibido después del vencimiento de la reserva",
    no_pendiente: "Pago recibido para un pedido cancelado",
    pago_duplicado: "Otro pago aprobado para el mismo pedido",
    importe_o_moneda_incorrectos: "El importe o la moneda no coinciden",
    pedido_inexistente: "No se encontró el pedido del pago",
    referencia_invalida: "El pago no identifica un pedido válido",
    stock_insuficiente: "Pago recibido sin stock suficiente",
    producto_no_disponible: "El producto del pago ya no está disponible",
    pedido_cancelado_revisar_reembolso: "Pedido pagado cancelado: revisar reembolso",
  };

  return (
    <div className="py-6 md:py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
      <p className="mt-2 text-sm text-stone-600">Buscá un pedido o elegí un estado. Abrí el detalle para preparar el envío o gestionar una cancelación.</p>

      <form key={`${q}-${estado}`} method="get" className="mt-6 grid items-end gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <div>
          <label htmlFor="buscar-pedidos" className="text-sm font-medium">Buscar pedido</label>
          <input id="buscar-pedidos" name="q" type="search" defaultValue={q} placeholder="Número, cliente o email" className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-base" />
        </div>
        <div>
          <label htmlFor="estado-pedidos" className="text-sm font-medium">Estado</label>
          <select id="estado-pedidos" name="estado" defaultValue={estado} className="mt-2 h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente de pago</option>
            <option value="pagado">Pagado · por enviar</option>
            <option value="enviado">Enviado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button className="min-h-11 rounded-lg border border-stone-900 px-5 text-sm font-medium hover:bg-stone-100">Buscar</button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p role="status">{filtrados.length} de {pedidos.length} pedidos</p>
        {(q || estado) && <Link href="/admin/pedidos" className="inline-flex min-h-11 items-center underline underline-offset-4">Limpiar filtros</Link>}
      </div>

      {pendientes.length > 0 && (
        <section id="incidencias" className="mt-6 scroll-mt-24 space-y-4" aria-label="Incidencias de pago">
          <h2 className="text-xl font-semibold">Revisión de pagos</h2>
          <p className="text-sm text-stone-600">Los reembolsos se gestionan en Mercado Pago. Registrá aquí la resolución después de comprobar cada caso.</p>
          {pendientes.map((incidencia) => (
            <article key={incidencia.mp_payment_id} className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-medium">{motivos[incidencia.motivo] ?? "Pago que requiere revisión"}</h3>
              <p className="mt-2 break-all text-sm">Pago: <span className="font-mono">{incidencia.mp_payment_id}</span> · {incidencia.monto == null ? "Importe no informado" : `${incidencia.monto} ${incidencia.moneda ?? ""}`}</p>
              <p className="mt-1 text-xs text-stone-600">{formatearFecha(incidencia.creado_en)}</p>
              {incidencia.pedido_id && <Link className="mt-2 inline-block text-sm underline" href={`/admin/pedidos/${incidencia.pedido_id}`}>Ver pedido</Link>}
                <form action={resolverIncidenciaPago} className="mt-4 flex flex-wrap gap-3">
                  <input type="hidden" name="pago_id" value={incidencia.mp_payment_id} />
                  <label className="min-w-0 flex-1 text-sm">
                    Resolución
                    <input name="resolucion" required maxLength={500} className="mt-1 block h-11 w-full rounded-lg border border-amber-300 bg-white px-3" />
                  </label>
                  <button className="self-end rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Marcar como resuelta</button>
                </form>
            </article>
          ))}
        </section>
      )}

      {pendientes.length === 0 && <p id="incidencias" className="mt-5 scroll-mt-24 text-sm text-stone-600">No hay pagos pendientes de revisión.</p>}
      {resueltas.length > 0 && (
        <details className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-medium">Historial de incidencias resueltas ({resueltas.length})</summary>
          <div className="mt-4 space-y-5">
            {resueltas.map((incidencia) => (
              <article key={incidencia.mp_payment_id} className="border-t border-stone-200 pt-4 text-sm">
                <h3 className="font-medium">{motivos[incidencia.motivo] ?? "Pago revisado"}</h3>
                <p className="mt-2 break-all">Pago: {incidencia.mp_payment_id} · {incidencia.monto == null ? "Importe no informado" : `${incidencia.monto} ${incidencia.moneda ?? ""}`}</p>
                <p className="mt-1 text-xs text-stone-600">Registrada: {formatearFecha(incidencia.creado_en)}</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-stone-700">Resolución: {incidencia.resolucion}</p>
                <p className="mt-1 text-xs text-stone-600">Resuelta: {formatearFecha(incidencia.resuelta_en!)}</p>
                {incidencia.pedido_id && <Link href={`/admin/pedidos/${incidencia.pedido_id}`} className="mt-2 inline-flex min-h-11 items-center underline">Ver pedido</Link>}
              </article>
            ))}
          </div>
        </details>
      )}
      {filtrados.length === 0 ? (
        <p className="mt-5 rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-600">{pedidos.length === 0 ? "Todavía no hay pedidos." : "No encontramos pedidos. Probá otra búsqueda o limpiá los filtros."}</p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {filtrados.map((pedido) => (
            <li key={pedido.id} className="grid items-center gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <Link href={`/admin/pedidos/${pedido.id}`} className="font-medium underline-offset-4 hover:underline">Pedido #{pedido.id.slice(0, 8)}</Link>
                <p className="mt-1 break-words text-sm text-stone-600">{pedido.nombre} · {pedido.email}</p>
                <p className="mt-1 text-xs text-stone-600">{formatearFecha(pedido.creadoEn)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end"><span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatearPrecio(pedido.total)}</span><EstadoPedidoBadge estado={pedido.estado} /></div>
              <Link href={`/admin/pedidos/${pedido.id}`} aria-label={`Abrir pedido ${pedido.id.slice(0, 8)}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-4 text-sm font-medium hover:border-stone-900">Ver pedido</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
