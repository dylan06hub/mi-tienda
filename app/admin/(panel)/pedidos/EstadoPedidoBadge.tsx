import type { EstadoPedido } from "@/types";

const ETIQUETAS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const ESTILOS: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-50 text-amber-700",
  pagado: "bg-emerald-50 text-emerald-700",
  enviado: "bg-sky-50 text-sky-700",
  cancelado: "bg-stone-100 text-stone-500",
};

export function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ESTILOS[estado]}`}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
