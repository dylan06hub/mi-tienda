import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getPedidoAdmin } from "@/lib/pedidos";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import type { AccionPedido } from "@/types";
import { AccionesPedido } from "../AccionesPedido";
import { EstadoPedidoBadge } from "../EstadoPedidoBadge";

export const metadata: Metadata = {
  title: "Detalle del pedido | Administración",
  robots: { index: false, follow: false },
};

function accionesDisponibles(estado: string): AccionPedido[] {
  if (estado === "pendiente") {
    return [
      {
        estado: "cancelado",
        label: "Cancelar pedido",
        confirmar:
          "¿Cancelar este pedido? El stock no se modifica porque todavía no fue pagado.",
      },
    ];
  }

  if (estado === "pagado") {
    return [
      { estado: "enviado", label: "Marcar como enviado" },
      {
        estado: "cancelado",
        label: "Cancelar y devolver stock",
        confirmar:
          "¿Cancelar este pedido y devolver el stock de sus variantes?",
      },
    ];
  }

  return [];
}

export default async function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const pedido = await getPedidoAdmin(id);

  if (!pedido) notFound();

  const acciones = accionesDisponibles(pedido.estado);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link
        href="/admin/pedidos"
        className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Pedidos
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            Pedido
          </p>
          <h1 className="mt-3 break-all font-mono text-2xl font-semibold tracking-tight">
            {pedido.id}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {formatearFecha(pedido.creadoEn)}
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} />
      </div>

      {acciones.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-medium text-stone-900">Acciones</h2>
          <div className="mt-4">
            <AccionesPedido id={pedido.id} acciones={acciones} />
          </div>
        </section>
      ) : (
        <p className="mt-8 rounded-2xl border border-stone-200 bg-white px-6 py-5 text-sm text-stone-600">
          {pedido.estado === "enviado"
            ? "El pedido ya fue enviado."
            : "El pedido está cancelado."}
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-medium text-stone-900">Cliente</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Nombre
              </dt>
              <dd className="mt-1 text-stone-700">{pedido.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Email
              </dt>
              <dd className="mt-1 break-all text-stone-700">
                {pedido.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Teléfono
              </dt>
              <dd className="mt-1 text-stone-700">
                {pedido.telefono || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Dirección
              </dt>
              <dd className="mt-1 whitespace-pre-line text-stone-700">
                {pedido.direccion || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-medium text-stone-900">Pago</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Total
              </dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-stone-900">
                {formatearPrecio(pedido.total)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">
                ID de Mercado Pago
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-stone-700">
                {pedido.mpPaymentId || "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-stone-900">Items</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Variante</th>
                <th className="px-5 py-3 font-medium">Cantidad</th>
                <th className="px-5 py-3 font-medium">Precio unit.</th>
                <th className="px-5 py-3 text-right font-medium">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pedido.items.map((item) => (
                <tr
                  key={`${item.productoId}-${item.varianteId}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">
                      {item.productoNombre}
                    </p>
                    <p className="mt-1 font-mono text-xs text-stone-500">
                      {item.productoId}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-stone-700">
                    {[item.talle, item.color].filter(Boolean).join(" · ") ||
                      item.varianteId}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-stone-700">
                    {item.cantidad}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-stone-700">
                    {formatearPrecio(item.precioUnitario)}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-stone-900">
                    {formatearPrecio(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
