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
          "¿Cancelar este pedido y liberar las unidades reservadas, si tiene una reserva activa?",
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
          "¿Cancelar este pedido y devolver el stock? El reembolso se gestiona en Mercado Pago y quedará pendiente de revisión.",
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
    <div className="max-w-4xl py-6 md:py-8">
      <Link
        href="/admin/pedidos"
        className="text-sm text-street-muted underline-offset-4 hover:text-street-foreground hover:underline"
      >
        ← Pedidos
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="street-title text-4xl sm:text-5xl">Pedido #{pedido.id.slice(0, 8)}</h1>
          <p className="mt-2 break-all text-xs text-street-muted">Identificador completo: {pedido.id}</p>
          <p className="mt-2 text-sm text-street-muted">
            {formatearFecha(pedido.creadoEn)}
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} />
      </div>

      {acciones.length > 0 ? (
        <section className="mt-8 rounded-street border border-street-border bg-street-surface p-6">
          <h2 className="text-sm font-medium text-street-foreground">Qué hacer con este pedido</h2>
          <div className="mt-4">
            <AccionesPedido id={pedido.id} acciones={acciones} />
          </div>
        </section>
      ) : (
        <p className="mt-8 rounded-street border border-street-border bg-street-surface px-6 py-5 text-sm text-street-muted">
          {pedido.estado === "enviado"
            ? "El pedido ya fue enviado."
            : "El pedido está cancelado."}
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-street border border-street-border bg-street-surface p-6">
          <h2 className="text-sm font-medium text-street-foreground">Cliente</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                Nombre
              </dt>
              <dd className="mt-1 break-words text-street-muted">{pedido.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                Email
              </dt>
              <dd className="mt-1 break-all text-street-muted">
                {pedido.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                Teléfono
              </dt>
              <dd className="mt-1 break-words text-street-muted">
                {pedido.telefono || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                Dirección
              </dt>
              <dd className="mt-1 whitespace-pre-line break-words text-street-muted">
                {pedido.direccion || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-street border border-street-border bg-street-surface p-6">
          <h2 className="text-sm font-medium text-street-foreground">Pago</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                Total
              </dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-street-foreground">
                {formatearPrecio(pedido.total)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-street-muted">
                ID de Mercado Pago
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-street-muted">
                {pedido.mpPaymentId || "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-street-foreground">Prendas del pedido</h2>
        <div className="mt-3 overflow-x-auto rounded-street border border-street-border bg-street-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-street-border bg-street-background text-xs uppercase tracking-[0.12em] text-street-muted">
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
            <tbody className="divide-y divide-street-border">
              {pedido.items.map((item) => (
                <tr
                  key={`${item.productoId}-${item.varianteId}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-street-foreground">
                      {item.productoNombre}
                    </p>
                    <p className="mt-1 font-mono text-xs text-street-muted">
                      {item.productoId}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-street-muted">
                    {[item.talle, item.color].filter(Boolean).join(" · ") ||
                      item.varianteId}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-street-muted">
                    {item.cantidad}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-street-muted">
                    {formatearPrecio(item.precioUnitario)}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-street-foreground">
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
