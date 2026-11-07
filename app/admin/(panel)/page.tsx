import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductosAdmin } from "@/lib/productos";
import { getPedidosAdmin, getIncidenciasPago } from "@/lib/pedidos";
import { getConsultasAdmin } from "@/lib/consultas";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import { EstadoPedidoBadge } from "./pedidos/EstadoPedidoBadge";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdmin();
  const [productos, pedidos, consultas, incidencias] = await Promise.all([
    getProductosAdmin(), getPedidosAdmin(), getConsultasAdmin(), getIncidenciasPago(),
  ]);
  const publicados = productos.filter((producto) => producto.activo).length;
  const sinStock = productos.filter((producto) => !producto.variantes.some((variante) => variante.stock > 0)).length;
  const porEnviar = pedidos.filter((pedido) => pedido.estado === "pagado").length;
  const revisar = incidencias.filter((incidencia) => !incidencia.resuelta_en).length;

  return (
    <div className="py-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resumen de tu tienda</h1>
          <p className="mt-2 text-sm text-stone-600">Revisá lo pendiente y accedé a tus tareas habituales.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="inline-flex min-h-11 items-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700">Crear producto</Link>
      </div>

      <div className="mt-6 grid divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Link href="/admin/productos" className="rounded-xl p-5 hover:bg-stone-50">
          <h2 className="font-medium">Productos</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{productos.length}</p>
          <p className="mt-2 text-sm text-stone-600">{publicados} publicados · {productos.length - publicados} ocultos</p>
        </Link>
        <Link href="/admin/pedidos" className="rounded-xl p-5 hover:bg-stone-50">
          <h2 className="font-medium">Pedidos</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{pedidos.length}</p>
          <p className="mt-2 text-sm text-stone-600">Consultá pagos, clientes y envíos.</p>
        </Link>
        <Link href="/admin/consultas" className="rounded-xl p-5 hover:bg-stone-50">
          <h2 className="font-medium">Consultas</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{consultas.length}</p>
          <p className="mt-2 text-sm text-stone-600">Mensajes recibidos desde la tienda.</p>
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Pendiente de atención</h2>
        <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          <li><Link href="/admin/pedidos?estado=pagado" className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50"><span>Pedidos pagados por enviar</span><span className="rounded-md bg-emerald-50 px-3 py-1 font-medium tabular-nums text-emerald-800">{porEnviar}</span></Link></li>
          <li><Link href="/admin/pedidos#incidencias" className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50"><span>Pagos que necesitan revisión</span><span className={`rounded-md px-3 py-1 font-medium tabular-nums ${revisar > 0 ? "bg-amber-50 text-amber-800" : "bg-stone-100 text-stone-600"}`}>{revisar}</span></Link></li>
          <li><Link href="/admin/productos?estado=sin-stock" className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50"><span>Productos sin stock</span><span className="rounded-md bg-stone-100 px-3 py-1 font-medium tabular-nums">{sinStock}</span></Link></li>
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Ver todos los pedidos</Link>
        </div>
        {pedidos.length === 0 ? <p className="mt-3 rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-600">Todavía no hay pedidos. Cuando llegue el primero, lo vas a encontrar acá.</p> : (
          <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {pedidos.slice(0, 5).map((pedido) => (
              <li key={pedido.id}>
                <Link href={`/admin/pedidos/${pedido.id}`} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-stone-50">
                  <div className="min-w-0"><p className="break-words font-medium">{pedido.nombre}</p><p className="mt-1 text-xs text-stone-600">#{pedido.id.slice(0, 8)} · {formatearFecha(pedido.creadoEn)}</p></div>
                  <div className="flex flex-wrap items-center gap-3"><span className="text-sm tabular-nums">{formatearPrecio(pedido.total)}</span><EstadoPedidoBadge estado={pedido.estado} /></div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
