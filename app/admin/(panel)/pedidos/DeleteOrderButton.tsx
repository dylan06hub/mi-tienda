"use client";

import { useActionState } from "react";
import { eliminarPedido } from "./actions";

export function DeleteOrderButton({ id }: { id: string }) {
  const [resultado, action, pendiente] = useActionState(eliminarPedido, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pendiente} aria-label={`Eliminar pedido ${id.slice(0, 8)}`} className="min-h-11 w-full rounded-street border border-street-danger bg-street-danger px-4 text-sm font-medium text-street-foreground transition hover:border-street-fog disabled:opacity-50">
        {pendiente ? "Eliminando…" : "Eliminar"}
      </button>
      {resultado && "error" in resultado && <p role="alert" className="mt-2 max-w-56 text-xs text-street-foreground">{resultado.error}</p>}
    </form>
  );
}
