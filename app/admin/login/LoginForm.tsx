"use client";

import { useActionState } from "react";
import { iniciarSesionAdmin } from "./actions";

export function LoginForm() {
  const [estado, action, pendiente] = useActionState(
    iniciarSesionAdmin,
    null,
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium text-street-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-11 w-full rounded-street border border-street-muted bg-street-surface px-4 text-base text-street-foreground transition focus:border-street-secondary"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-street-foreground"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-11 w-full rounded-street border border-street-muted bg-street-surface px-4 text-base text-street-foreground transition focus:border-street-secondary"
        />
      </div>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-street bg-amber-950/50 px-4 py-3 text-sm text-amber-200"
        >
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="street-button w-full"
      >
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
