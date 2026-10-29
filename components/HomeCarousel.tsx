"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  alt: string;
  badge?: string;
};

const SLIDES: Slide[] = [
  {
    id: "coleccion",
    title: "Ropa que no pasa de moda",
    subtitle: "Prendas atemporales, tejidos honestos y cortes que sientan bien. Menos cosas, mejores.",
    ctaLabel: "Ver la colección",
    ctaHref: "/productos?disponible=1",
    image: "/productos/abrigo.jpg",
    alt: "Abrigo largo de lana en tono camel",
    badge: "Otoño / Invierno",
  },
  {
    id: "camisas",
    title: "Lino para todo el año",
    subtitle: "Ligero, fresco y con esa caída que mejora con el uso.",
    ctaLabel: "Ver camisas",
    ctaHref: "/productos?categoria=Camisas",
    image: "/productos/camisa.jpg",
    alt: "Camisa de lino en tono arena",
    badge: "Camisas",
  },
  {
    id: "denim",
    title: "El jean que no falla",
    subtitle: "Tiro alto, pernera recta y denim rígido que envejece como debe.",
    ctaLabel: "Ver pantalones",
    ctaHref: "/productos?categoria=Pantalones",
    image: "/productos/vaqueros.jpg",
    alt: "Vaqueros straight en tono azul",
    badge: "Denim",
  },
  {
    id: "accesorios",
    title: "Los detalles que cuentan",
    subtitle: "Gorras, gafas y bolsos para completar el look sin exagerar.",
    ctaLabel: "Ver accesorios",
    ctaHref: "/productos?categoria=Accesorios",
    image: "/productos/bolso.jpg",
    alt: "Bolso tote de lona encerada",
    badge: "Accesorios",
  },
];

export function HomeCarousel() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = SLIDES.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const irA = useCallback((siguiente: number) => {
    setIndice(() => {
      const valor = ((siguiente % total) + total) % total;
      return valor;
    });
  }, [total]);

  const siguiente = useCallback(() => irA(indice + 1), [indice, irA]);
  const anterior = useCallback(() => irA(indice - 1), [indice, irA]);

  useEffect(() => {
    if (pausado) return;
    timer.current = setInterval(siguiente, 1500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [pausado, siguiente]);

  useEffect(() => {
    const onVisibility = () => setPausado(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onTouchStart = (evento: React.TouchEvent) => {
    touchStartX.current = evento.touches[0].clientX;
    touchDeltaX.current = 0;
    setPausado(true);
  };

  const onTouchMove = (evento: React.TouchEvent) => {
    touchDeltaX.current = evento.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current > 0) {
        anterior();
      } else {
        siguiente();
      }
    }
    touchDeltaX.current = 0;
    setPausado(false);
  };

  const slide = SLIDES[indice];

  return (
    <section
      className="relative w-full bg-black py-10 md:py-16"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Destacados de la tienda"
        aria-roledescription="carrusel"
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${indice * 100}%)` }}
        >
          {SLIDES.map((item) => (
            <article
              key={item.id}
              className="relative grid min-w-full items-center gap-8 px-6 py-10 md:grid-cols-2 md:gap-12 md:px-12 md:py-16 lg:px-16"
              aria-hidden={item.id !== slide.id}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority={item.id === SLIDES[0].id}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/10 to-transparent" />
              </div>

              <div className="relative z-10">
                {item.badge && (
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-300">
                    {item.badge}
                  </p>
                )}
                <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {item.title}
                </h2>
                <p className="mt-6 max-w-md text-base leading-7 text-stone-300">
                  {item.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={item.ctaHref}
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
                  >
                    {item.ctaLabel}
                  </Link>
                  <Link
                    href="/productos"
                    className="rounded-full border border-stone-400 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white"
                  >
                    Ver todo
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={anterior}
          className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-sm transition hover:bg-white md:inline-flex"
          aria-label="Diapositiva anterior"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={siguiente}
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-sm transition hover:bg-white md:inline-flex"
          aria-label="Diapositiva siguiente"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => irA(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === indice
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === indice ? "true" : undefined}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
