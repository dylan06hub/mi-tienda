import type { Metadata } from "next";
import Link from "next/link";
import { FormularioConsulta } from "./FormularioConsulta";

export const metadata: Metadata = {
  title: "Contacto | norte.",
  description: "Ponete en contacto con norte. para consultas, dudas o pedidos.",
};

const PREGUNTAS = [
  {
    pregunta: "¿Hacen envíos a todo el país?",
    respuesta:
      "Sí, enviamos a todo el territorio argentino. El envío es gratis a partir del monto mínimo indicado en el carrito.",
  },
  {
    pregunta: "¿Puedo cambiar o cancelar mi pedido?",
    respuesta:
      "Si tu pedido aún no fue enviado, escribinos con el número de pedido y te ayudamos a gestionarlo. Los pedidos pagados y enviados siguen la política de devolución.",
  },
  {
    pregunta: "¿Cómo sé si hay stock de una prenda?",
    respuesta:
      "El stock se actualiza en tiempo real en cada producto. Si una variante aparece habilitada, hay unidades disponibles; si está agotada o no aparece, no hay stock.",
  },
  {
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta:
      "Aceptamos pagos con Mercado Pago. Al finalizar la compra te redirigimos a su plataforma para completar el pago de forma segura.",
  },
  {
    pregunta: "¿Cuánto tarda en llegar mi pedido?",
    respuesta:
      "Los tiempos de entrega dependen de tu ubicación y del correo asignado. Generalmente entre 2 y 5 días hábiles después de que el pago sea aprobado.",
  },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <Link
        href="/"
        className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Volver al inicio
      </Link>

      <header className="mt-6">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
          Contacto
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Hablemos
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          Si tenés alguna consulta sobre un producto, el estado de tu pedido o
          cualquier duda, completá el formulario o escribinos por los canales
          disponibles.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
          <h2 className="text-sm font-medium text-stone-900">
            Enviar consulta
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Los campos marcados con * son obligatorios.
          </p>
          <div className="mt-6">
            <FormularioConsulta />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-900">Email</h2>
            <p className="mt-2 text-sm text-stone-600">
              Respondemos dentro de 24 a 48 horas hábiles.
            </p>
            <a
              href="mailto:contacto@norte.com.ar"
              className="mt-4 inline-flex text-sm font-medium text-stone-900 underline-offset-4 hover:underline"
            >
              contacto@norte.com.ar
            </a>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-900">WhatsApp</h2>
            <p className="mt-2 text-sm text-stone-600">
              Para consultas rápidas sobre stock o pedidos.
            </p>
            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-stone-900 underline-offset-4 hover:underline"
            >
              +54 9 11 0000 0000
            </a>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-900">Horario</h2>
            <p className="mt-2 text-sm text-stone-600">
              Lunes a viernes de 9:00 a 18:00 hs.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-stone-900">
          Preguntas frecuentes
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Las respuestas más comunes antes de escribirnos.
        </p>
        <div className="mt-6 divide-y divide-stone-100">
          {PREGUNTAS.map((pregunta) => (
            <details
              key={pregunta.pregunta}
              className="group py-5"
              open={pregunta.pregunta === PREGUNTAS[0].pregunta}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-stone-900">
                <span>{pregunta.pregunta}</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-2 pr-8 text-sm leading-6 text-stone-600">
                {pregunta.respuesta}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
