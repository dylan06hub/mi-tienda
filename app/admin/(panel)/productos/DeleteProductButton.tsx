"use client";

import { useActionState } from "react";
import { eliminarProducto } from "./actions";

export function DeleteProductButton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  const [estado, action, pendiente] = useActionState(
    eliminarProducto,
    null,
  );

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pendiente}
        aria-label={`Eliminar ${nombre}`}
        className="min-h-11 w-full rounded-street border border-street-danger bg-street-danger px-4 text-sm font-medium text-street-foreground transition hover:border-street-fog disabled:opacity-50"
      >
        {pendiente ? "Eliminando…" : "Eliminar"}
      </button>
      {estado?.error && (
        <p role="alert" className="mt-2 max-w-56 text-xs text-street-foreground">
          {estado.error}
        </p>
      )}
    </form>
  );
}
