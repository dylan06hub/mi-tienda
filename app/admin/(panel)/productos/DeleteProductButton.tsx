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
        className="text-sm text-red-700 underline-offset-4 transition hover:text-red-900 hover:underline disabled:opacity-50"
      >
        {pendiente ? "Eliminando…" : "Eliminar"}
      </button>
      {estado?.error && (
        <p role="alert" className="mt-2 max-w-56 text-xs text-red-700">
          {estado.error}
        </p>
      )}
    </form>
  );
}
