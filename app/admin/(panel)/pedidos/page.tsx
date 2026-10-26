import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getPedidosAdmin } from "@/lib/pedidos";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";

export const metadata: Metadata = {
  title: "Pedidos | Administración",
  robots: { index: false, follow: false },
};

export default async function AdminPedidosPage() {
  await requireAdmin();
  const pedidos = await getPedidosAdmin();

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
