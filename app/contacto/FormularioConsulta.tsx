"use client";

import { useActionState } from "react";
import { enviarConsulta } from "./actions";

const CLASE_INPUT =
  "mt-2 h-11 w-full rounded-street border border-street-fog bg-street-surface px-4 text-base text-street-foreground transition focus:border-street-secondary";
const CLASE_TEXTAREA =
  "mt-2 w-full rounded-street border border-street-fog bg-street-surface px-4 py-3 text-base text-street-foreground transition focus:border-street-secondary";

export function FormularioConsulta() {
  const [estado, action, pendiente] = useActionState(enviarConsulta, null);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-street-foreground">
            Nombre y apellido *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            className={CLASE_INPUT}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-street-foreground">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={120}
            className={CLASE_INPUT}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="telefono"
            className="text-sm font-medium text-street-foreground"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className={CLASE_INPUT}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label htmlFor="asunto" className="text-sm font-medium text-street-foreground">
            Asunto *
          </label>
          <input
            id="asunto"
            name="asunto"
            type="text"
            required
            maxLength={120}
            className={CLASE_INPUT}
            placeholder="Consulta, pedido, devolución..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="text-sm font-medium text-street-foreground">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={6}
          maxLength={1000}
          className={CLASE_TEXTAREA}
          placeholder="Escribí tu consulta con el mayor detalle posible"
        />
        <p className="mt-1 text-xs text-street-muted">Máximo 1000 caracteres.</p>
      </div>

      {estado && "error" in estado && (
        <p role="alert" className="rounded-street bg-street-danger px-4 py-3 text-sm text-street-foreground">
          {estado.error}
        </p>
      )}
      {estado && "ok" in estado && (
        <p role="status" className="rounded-street bg-street-surface px-4 py-3 text-sm text-street-foreground">
          {estado.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="street-button"
      >
        {pendiente ? "Enviando…" : "Enviar consulta"}
      </button>
    </form>
  );
}
