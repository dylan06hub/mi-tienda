"use client";

import { useActionState } from "react";
import type { AccionPedido } from "@/types";
import { cambiarEstadoPedido } from "./actions";

const ESTILO_PRIMARIO =
  "street-button";
const ESTILO_PELIGRO =
  "min-h-11 rounded-street border border-red-700 px-5 text-sm font-medium text-red-200 transition hover:bg-red-950/50 disabled:opacity-50";

export function AccionesPedido({
  id,
  acciones,
}: {
  id: string;
  acciones: AccionPedido[];
}) {
  const [resultado, action, pendiente] = useActionState(
    cambiarEstadoPedido,
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-3">
        {acciones.map((accion) => (
          <button
            key={accion.estado}
            type="submit"
            name="estado"
            value={accion.estado}
            disabled={pendiente}
            onClick={(evento) => {
              if (
                accion.confirmar &&
                !window.confirm(accion.confirmar)
              ) {
                evento.preventDefault();
              }
            }}
            className={
              accion.estado === "cancelado"
                ? ESTILO_PELIGRO
                : ESTILO_PRIMARIO
            }
          >
            {accion.label}
          </button>
        ))}
        {pendiente && (
          <span className="text-sm text-street-muted">Guardando…</span>
        )}
      </div>
      {resultado && "error" in resultado && (
        <p role="alert" className="mt-3 text-sm text-red-200">
          {resultado.error}
        </p>
      )}
      {resultado && "ok" in resultado && (
        <p role="status" className="mt-3 text-sm text-emerald-200">
          {resultado.ok}
        </p>
      )}
    </form>
  );
}
