// Retorno desde Mercado Pago: el webhook es quien confirma el pago.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getResultadoPedido } from "@/lib/resultado-pedido";
import { ActualizarEstado } from "./ActualizarEstado";
import { LimpiarCarrito } from "./LimpiarCarrito";

export const metadata: Metadata = {
  title: "Resultado del pago",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const MENSAJES = {
  exito: {
    etiqueta: "Pago recibido",
    titulo: "Gracias por tu compra",
    texto:
      "El pago fue confirmado y tu pedido está en preparación.",
  },
  falla: {
    etiqueta: "Pago no completado",
    titulo: "El pedido está cancelado",
    texto:
      "La reserva fue liberada. Si realizaste un pago, contactanos para revisar su estado antes de volver a pagar.",
  },
  pendiente: {
    etiqueta: "Pago pendiente",
    titulo: "Estamos esperando la confirmación",
    texto:
      "Mercado Pago todavía no confirmó el pago. Te recomendamos no volver a pagar el mismo pedido.",
  },
} as const;


async function Resultado({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; comprobante?: string }>;
}) {
  const { pedido, comprobante } = await searchParams;
  await connection();
  const resultado = await getResultadoPedido(pedido, comprobante);
  if (!resultado) {
    return (
      <>
        <h1 className="street-title text-5xl">No pudimos identificar tu pedido</h1>
        <p className="mt-4 text-sm text-street-muted">Usá el enlace privado del pago para consultar su estado. Tu carrito no se modificó.</p>
        <Link href="/carrito" className="mt-6 inline-block underline">Volver al carrito</Link>
      </>
    );
  }
  const confirmado = resultado.estado === "pagado" || resultado.estado === "enviado";
  const clave = confirmado ? "exito" : resultado.estado === "cancelado" ? "falla" : "pendiente";
  const mensaje = MENSAJES[clave];

  return (
    <>
      {confirmado && <LimpiarCarrito pedidoId={resultado.id} items={resultado.items} />}

      <p className="text-xs uppercase tracking-[0.25em] text-street-muted">
        {mensaje.etiqueta}
      </p>
      <h1 className="mt-3 street-title text-5xl sm:text-6xl">
        {mensaje.titulo}
      </h1>
      <p className="mt-4 text-sm leading-6 text-street-muted">
        {mensaje.texto}
      </p>

      {resultado.revision && (
        <p role="status" className="mt-6 rounded-street bg-amber-50 p-4 text-sm text-amber-900">
          Recibimos un pago que requiere revisión. Contactanos con el número de pedido y no vuelvas a pagar mientras lo comprobamos.
        </p>
      )}
      {clave === "pendiente" && <ActualizarEstado />}

      {pedido && (
        <p className="mt-6 rounded-street bg-street-surface px-4 py-3 text-sm text-street-muted ring-1 ring-street-border">
          Pedido: <span className="font-mono">{pedido}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={clave === "falla" ? "/carrito" : "/productos"}
          className="street-button"
        >
          {clave === "falla" ? "Volver al carrito" : "Seguir comprando"}
        </Link>
        {clave !== "falla" && (
          <Link
            href="/carrito"
            className="inline-flex h-11 items-center rounded-street border border-street-muted px-6 text-sm font-medium text-street-foreground transition hover:border-street-accent"
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
  searchParams: Promise<{ pedido?: string; comprobante?: string }>;
}) {
  return (
    <div className="site-shell py-16 md:py-24">
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-28 rounded bg-street-surface" />
            <div className="h-9 w-72 max-w-full rounded bg-street-surface" />
            <div className="h-4 w-full rounded bg-street-surface" />
          </div>
        }
      >
        <Resultado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
