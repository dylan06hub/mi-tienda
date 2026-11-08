import type { EstadoPedido } from "@/types";

const ETIQUETAS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente de pago",
  pagado: "Pagado · por enviar",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const ESTILOS: Record<EstadoPedido, string> = {
  pendiente: "bg-street-danger text-street-foreground",
  pagado: "bg-street-background text-street-foreground",
  enviado: "bg-street-surface text-street-foreground",
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
