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
          className="text-sm font-medium text-stone-900"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-900"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-stone-900"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-900"
        />
      </div>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="h-11 w-full rounded-full bg-stone-900 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
