"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type HistoryStep = { year: string; title: string; text: string; image: { src: string; alt: string } };

export function HistoryTimeline({ steps }: { steps: HistoryStep[] }) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setVisible(document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.2), { threshold: 0.2 });
    preference();
    visibility();
    if (container.current) observer.observe(container.current);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const playing = !reduced && inView && visible && !focused && steps.length > 1;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % steps.length), 6500);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  const step = steps[index];
  if (!step) return null;

  return (
    <div ref={container} className="history-timeline" onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <ol className="history-stops" aria-label="Etapas de nuestra historia">
        <li className="history-progress" aria-hidden="true" style={{ transform: `scaleX(${steps.length > 1 ? index / (steps.length - 1) : 0})` }} />
        {steps.map((item, position) => <li key={item.year} className="history-stop">
          <button type="button" aria-current={position === index ? "step" : undefined} aria-controls={id} aria-label={`${item.year}: ${item.title}`} onClick={() => setIndex(position)} className="history-step">
            <span className="history-dot" aria-hidden="true" />
            <span className="history-step-year font-display font-black">{item.year}</span>
            <span className="history-step-title">{item.title}</span>
          </button>
        </li>)}
      </ol>
      <div id={id} aria-live={focused ? "polite" : "off"} aria-atomic="true">
        <article key={step.year} className="history-panel" data-animate={playing} aria-label={`${step.year}: ${step.title}`}>
          <figure className="history-photo"><Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 1600px) 752px, (min-width: 768px) 50vw, 100vw" className="object-cover" /><figcaption>Historia de muestra / imagen creada con IA</figcaption></figure>
          <div className="history-copy"><p className="about-eyebrow">Capítulo {String(index + 1).padStart(2, "0")}</p><p className="history-year font-display font-black">{step.year}</p><h3 className="street-title text-4xl sm:text-5xl">{step.title}</h3><p className="mt-5 max-w-md text-sm leading-7 text-street-fog">{step.text}</p></div>
        </article>
      </div>
      <p className="mt-4 text-xs leading-6 text-street-fog">El recorrido avanza por etapas. Tocá un año para explorar su historia.</p>
    </div>
  );
}
