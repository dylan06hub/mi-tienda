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

export default async function AdminPedidosPage() {
  await requireAdmin();
  const pedidos = await getPedidosAdmin();
  const incidencias = await getIncidenciasPago();
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
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <Link
        href="/admin"
        className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Panel
      </Link>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
          Administración
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Pedidos
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {pedidos.length} pedidos registrados.
        </p>
      </div>

      {incidencias.length > 0 && (
        <section className="mt-8 space-y-4" aria-label="Incidencias de pago">
          <h2 className="text-xl font-semibold">Revisión de pagos</h2>
          <p className="text-sm text-stone-600">Los reembolsos se gestionan en Mercado Pago. Registrá aquí la resolución después de comprobar cada caso.</p>
          {incidencias.map((incidencia) => (
            <article key={incidencia.mp_payment_id} className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-medium">{motivos[incidencia.motivo] ?? "Pago que requiere revisión"}</h3>
              <p className="mt-2 text-sm">Pago: <span className="font-mono">{incidencia.mp_payment_id}</span> · {incidencia.monto == null ? "Importe no informado" : `${incidencia.monto} ${incidencia.moneda ?? ""}`}</p>
              <p className="mt-1 text-xs text-stone-600">{formatearFecha(incidencia.creado_en)}</p>
              {incidencia.pedido_id && <Link className="mt-2 inline-block text-sm underline" href={`/admin/pedidos/${incidencia.pedido_id}`}>Ver pedido</Link>}
              {incidencia.resuelta_en ? (
                <p className="mt-3 text-sm">Resuelta: {incidencia.resolucion} · {formatearFecha(incidencia.resuelta_en)}</p>
              ) : (
                <form action={resolverIncidenciaPago} className="mt-4 flex flex-wrap gap-3">
                  <input type="hidden" name="pago_id" value={incidencia.mp_payment_id} />
                  <label className="flex-1 text-sm">
                    Resolución
                    <input name="resolucion" required maxLength={500} className="mt-1 block h-10 w-full min-w-48 rounded-lg border border-amber-300 bg-white px-3" />
                  </label>
                  <button className="self-end rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Marcar como resuelta</button>
                </form>
              )}
            </article>
          ))}
        </section>
      )}

      {pedidos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-600">
            Todavía no hay pedidos.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-medium text-stone-900">
                      {pedido.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatearFecha(pedido.creadoEn)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">
                      {pedido.nombre}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {pedido.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-stone-700">
                    {formatearPrecio(pedido.total)}
                  </td>
                  <td className="px-5 py-4">
                    <EstadoPedidoBadge estado={pedido.estado} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="text-sm text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
