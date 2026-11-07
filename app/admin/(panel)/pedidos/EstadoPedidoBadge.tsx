import type { EstadoPedido } from "@/types";

const ETIQUETAS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente de pago",
  pagado: "Pagado · por enviar",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const ESTILOS: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-950/50 text-amber-200",
  pagado: "bg-emerald-950/50 text-emerald-200",
  enviado: "bg-sky-950/50 text-sky-200",
  cancelado: "bg-street-background text-street-muted",
};

export function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex rounded-street px-2.5 py-1 text-xs font-medium ${ESTILOS[estado]}`}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
