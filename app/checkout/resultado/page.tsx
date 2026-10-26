// Retorno desde Mercado Pago: el webhook es quien confirma el pago.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LimpiarCarrito } from "./LimpiarCarrito";

export const metadata: Metadata = {
  title: "Resultado del pago",
};

const MENSAJES = {
  exito: {
    etiqueta: "Pago recibido",
    titulo: "Gracias por tu compra",
    texto:
      "Estamos confirmando el pago con Mercado Pago. Cuando quede aprobado, el pedido se marca como pagado y se descuenta el stock.",
  },
  falla: {
    etiqueta: "Pago no completado",
    titulo: "No se pudo procesar el pago",
    texto:
      "Tu carrito sigue disponible para que puedas intentarlo de nuevo con otro medio de pago.",
  },
  pendiente: {
    etiqueta: "Pago pendiente",
    titulo: "Estamos esperando la confirmación",
    texto:
      "Mercado Pago todavía no confirmó el pago. Te recomendamos no volver a pagar el mismo pedido.",
  },
} as const;

type ClaveMensaje = keyof typeof MENSAJES;

async function Resultado({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pedido?: string }>;
}) {
  const { estado, pedido } = await searchParams;
  const clave: ClaveMensaje =
    estado === "falla" || estado === "pendiente" ? estado : "exito";
  const mensaje = MENSAJES[clave];

  return (
    <>
      {clave === "exito" && <LimpiarCarrito />}

      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        {mensaje.etiqueta}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {mensaje.titulo}
      </h1>
      <p className="mt-4 text-sm leading-6 text-stone-600">
        {mensaje.texto}
      </p>

      {pedido && (
        <p className="mt-6 rounded-xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
          Pedido: <span className="font-mono">{pedido}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={clave === "falla" ? "/carrito" : "/productos"}
          className="inline-flex h-11 items-center rounded-full bg-stone-900 px-6 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          {clave === "falla" ? "Volver al carrito" : "Seguir comprando"}
        </Link>
        {clave !== "falla" && (
          <Link
            href="/carrito"
            className="inline-flex h-11 items-center rounded-full border border-stone-300 px-6 text-sm font-medium text-stone-900 transition hover:border-stone-900"
          >
            Ver carrito
          </Link>
        )}
      </div>
    </>
  );
}

export default function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pedido?: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-28 rounded bg-stone-200" />
            <div className="h-9 w-72 max-w-full rounded bg-stone-200" />
            <div className="h-4 w-full rounded bg-stone-200" />
          </div>
        }
      >
        <Resultado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
