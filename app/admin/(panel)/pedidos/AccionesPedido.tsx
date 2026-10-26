"use client";

import { useActionState } from "react";
import type { AccionPedido } from "@/types";
import { cambiarEstadoPedido } from "./actions";

const ESTILO_PRIMARIO =
  "h-10 rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50";
const ESTILO_PELIGRO =
  "h-10 rounded-full border border-red-200 px-5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50";

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
          <span className="text-sm text-stone-500">Guardando…</span>
        )}
      </div>
      {resultado && "error" in resultado && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {resultado.error}
        </p>
      )}
      {resultado && "ok" in resultado && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {resultado.ok}
        </p>
      )}
    </form>
  );
}
