import type { Metadata } from "next";
import Link from "next/link";
import { FormularioConsulta } from "./FormularioConsulta";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponete en contacto con norte. para consultas, dudas o pedidos.",
};

const PREGUNTAS = [
  {
    pregunta: "¿Hacen envíos a todo el país?",
    respuesta:
      "El carrito calcula el costo de envío y el monto para acceder al envío gratis. La cobertura y los plazos de entrega están pendientes de confirmación para esta tienda de prueba.",
  },
  {
    pregunta: "¿Puedo cambiar o cancelar mi pedido?",
    respuesta:
      "Escribinos desde el formulario con el número de pedido. Las condiciones de cambios, cancelaciones y devoluciones deben confirmarse antes de una compra real.",
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
      "Esta tienda usa un catálogo ficticio. Todavía no hay plazos de entrega confirmados; consultanos desde el formulario antes de coordinar un envío.",
  },
];

export default function ContactoPage() {
  return (
    <div className="site-shell py-12 md:py-16">
      <Link
        href="/"
        className="text-sm text-street-muted underline-offset-4 hover:text-street-foreground hover:underline"
      >
        ← Volver al inicio
      </Link>

      <header className="mt-6">
        <h1 className="street-title text-5xl sm:text-6xl">
          Hablemos
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-street-muted">
          Si tenés alguna consulta sobre un producto, el estado de tu pedido o
          cualquier duda, completá el formulario.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-street border border-street-border bg-street-surface p-6 md:p-8">
          <h2 className="text-sm font-medium text-street-foreground">
            Enviar consulta
          </h2>
          <p className="mt-1 text-sm text-street-muted">
            Los campos marcados con * son obligatorios.
          </p>
          <div className="mt-6">
            <FormularioConsulta />
          </div>
        </section>

        <aside className="self-start rounded-street bg-street-surface p-6 md:p-8">
          <h2 className="text-lg font-semibold tracking-tight">Antes de escribirnos</h2>
          <p className="mt-3 text-sm leading-6 text-street-muted">
            Si consultás por una prenda, incluí su nombre, el talle y el color.
            Si es por una compra, agregá el número de pedido.
          </p>
          <p className="mt-4 text-sm leading-6 text-street-muted">
            Esta es una tienda de demostración con productos ficticios. Las
            consultas del formulario se guardan en el panel de administración.
            Los canales de atención y las condiciones comerciales definitivas
            todavía no están confirmados.
          </p>
        </aside>
      </div>

      <section id="preguntas-frecuentes" className="mt-10 scroll-mt-24 rounded-street border border-street-border bg-street-surface p-6 md:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-street-foreground">
          Preguntas frecuentes
        </h2>
        <p className="mt-1 text-sm text-street-muted">
          Las respuestas más comunes antes de escribirnos.
        </p>
        <div className="mt-6 divide-y divide-street-border">
          {PREGUNTAS.map((pregunta) => (
            <details
              key={pregunta.pregunta}
              className="group py-5"
              open={pregunta.pregunta === PREGUNTAS[0].pregunta}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-street-foreground">
                <span>{pregunta.pregunta}</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-street-muted transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-2 pr-8 text-sm leading-6 text-street-muted">
                {pregunta.respuesta}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
