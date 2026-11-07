"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { crearPedido } from "@/app/checkout/actions";
import { useCart } from "@/components/CartProvider";
import { formatearPrecio } from "@/lib/utils";
import type { ResultadoCheckout } from "@/types";

const CAMPOS = [
  {
    name: "nombre",
    label: "Nombre y apellido",
    type: "text",
    autoComplete: "name",
    maxLength: 120,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "telefono",
    label: "Teléfono",
    type: "tel",
    autoComplete: "tel",
    maxLength: 40,
  },
  {
    name: "direccion",
    label: "Dirección de entrega",
    type: "text",
    autoComplete: "street-address",
    maxLength: 500,
  },
] as const;

export function CheckoutForm() {
  const { items, lineas, subtotal, envio, total, cargando, error, registrarPedido } =
    useCart();
  const [estado, setEstado] = useState<ResultadoCheckout | null>(null);
  const [pendiente, startTransition] = useTransition();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (pendiente || cargando || lineas.length === 0) return;

    const formData = new FormData(evento.currentTarget);

    startTransition(async () => {
      const resultado = await crearPedido(formData);
      setEstado(resultado);

      if ("pedido" in resultado) {
        await registrarPedido(resultado.pedido.id, lineas.map(({ producto, variante, cantidad }) => ({
          productoId: producto.id, varianteId: variante.id, cantidad,
        })));
        window.location.assign(resultado.pedido.initPoint);
      }
    });
  }

  if (estado && "pedido" in estado) {
    const { pedido } = estado;

    return (
      <div className="mt-10 max-w-2xl rounded-street border border-street-border bg-street-surface p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-street-muted">
          Pedido {pedido.id.slice(0, 8)}
        </p>
        <h2 className="mt-3 street-title text-4xl sm:text-5xl">
          Redirigiendo a Mercado Pago
        </h2>
        <p className="mt-3 text-sm leading-6 text-street-muted">
          Total a pagar: {formatearPrecio(pedido.total)}. Si la redirección
          no ocurre, usá el siguiente enlace.
        </p>

        <a
          href={pedido.initPoint}
          className="street-button mt-8"
        >
          Ir a Mercado Pago
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-street border border-street-border bg-street-surface px-6 py-16 text-center">
        <p className="text-sm text-street-muted">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="street-button mt-4"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const listo = !cargando && lineas.length > 0;
  const sinStock = lineas.some((linea) => linea.cantidad > linea.variante.stock);
  const itemsPedido = lineas.map(({ producto, variante, cantidad }) => ({
    productoId: producto.id,
    varianteId: variante.id,
    cantidad,
  }));

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={enviar} className="space-y-5">
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(itemsPedido)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {CAMPOS.map((campo) => (
            <div
              key={campo.name}
              className={campo.name === "direccion" ? "sm:col-span-2" : ""}
            >
              <label
                htmlFor={campo.name}
                className="text-sm font-medium text-street-foreground"
              >
                {campo.label}
              </label>
              <input
                id={campo.name}
                name={campo.name}
                type={campo.type}
                autoComplete={campo.autoComplete}
                maxLength={campo.maxLength}
                required
                className="mt-2 h-11 w-full rounded-street border border-street-muted bg-street-surface px-4 text-base text-street-foreground transition focus:border-street-secondary"
              />
            </div>
          ))}
        </div>

        {(error || (estado && "error" in estado)) && (
          <p
            role="alert"
            className="rounded-street bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {estado && "error" in estado ? estado.error : error}
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente || !listo || sinStock}
          className="street-button w-full"
        >
          {pendiente ? "Creando pago…" : "Pagar con Mercado Pago"}
        </button>

        <p className="text-xs leading-5 text-street-muted">
          Reservamos tus prendas durante 30 minutos para completar el pago.
          Si vence la reserva, las unidades vuelven a estar disponibles.
        </p>
        {sinStock && <p role="alert" className="text-sm text-amber-300">Revisá el carrito: alguna cantidad supera el stock disponible.</p>}
      </form>

      <aside className="h-fit rounded-street border border-street-border bg-street-surface p-6">
        <h2 className="text-sm font-medium text-street-foreground">Resumen</h2>

        {!listo ? (
          <p className="mt-5 text-sm text-street-muted">
            Actualizando precios y stock…
          </p>
        ) : (
          <>
            <ul className="mt-5 space-y-4 text-sm">
              {lineas.map(({ producto, variante, cantidad, subtotal: linea }) => (
                <li
                  key={JSON.stringify([producto.id, variante.id])}
                  className="flex justify-between gap-4"
                >
                  <span className="text-street-muted">
                    {cantidad} × {producto.nombre}
                    <span className="block text-xs text-street-muted">
                      {variante.talle} · {variante.color}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-street-foreground">
                    {formatearPrecio(linea)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-street-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-street-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatearPrecio(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-street-muted">Envío</dt>
                <dd className="tabular-nums">
                  {envio === 0 ? "Gratis" : formatearPrecio(envio)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-street-border pt-3 font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatearPrecio(total)}</dd>
              </div>
            </dl>
          </>
        )}

        <Link
          href="/carrito"
          className="mt-6 block text-xs text-street-muted underline-offset-2 hover:text-street-foreground hover:underline"
        >
          Volver al carrito
        </Link>
      </aside>
    </div>
  );
}
