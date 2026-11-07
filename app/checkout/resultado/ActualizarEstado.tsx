"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ActualizarEstado() {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() => startTransition(() => router.refresh())}
      className="mt-6 text-sm underline underline-offset-4 disabled:opacity-50"
    >
      {pendiente ? "Consultando…" : "Actualizar estado del pago"}
    </button>
  );
}
