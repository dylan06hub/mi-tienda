"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export function ProductCarousel({ children, label = "Prendas destacadas" }: { children: ReactNode[]; label?: string }) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [range, setRange] = useState({ first: 1, last: 1, start: true, end: children.length <= 1 });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function update() {
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const visible = Array.from(element.children).flatMap((child, index) => {
        const rect = child.getBoundingClientRect();
        return rect.right > bounds.left + 2 && rect.left < bounds.right - 2 ? [index + 1] : [];
      });
      setRange({
        first: visible[0] ?? 1,
        last: visible.at(-1) ?? 1,
        start: element.scrollLeft <= 2,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    }
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [children.length]);

  function move(direction: number, keyboard = false) {
    const element = track.current;
    if (!element) return;
    const cards = element.children;
    const step = cards.length > 1
      ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
      : element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: keyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function navigate(event: KeyboardEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1, true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      track.current?.scrollTo({ left: event.key === "Home" ? 0 : track.current.scrollWidth, behavior: "instant" });
    }
  }

  return (
    <div className="street-carousel mt-7" role="region" aria-roledescription="carrusel" aria-label={label}>
      <ul id={id} ref={track} tabIndex={0} onKeyDown={navigate} aria-label="Usá las flechas del teclado o deslizá para explorar" className="street-carousel-track">
        {children.map((child, index) => <li key={index} className="street-carousel-slide">{child}</li>)}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-street-muted" role="status" aria-live="polite" aria-atomic="true">
          <span className="text-street-secondary">{String(range.first).padStart(2, "0")}–{String(range.last).padStart(2, "0")}</span> / {String(children.length).padStart(2, "0")} prendas
        </p>
        <div className="flex gap-2">
          <button type="button" aria-label="Ver prendas anteriores" aria-controls={id} disabled={range.start} onClick={() => move(-1)} className="street-carousel-arrow"><span aria-hidden="true">←</span></button>
          <button type="button" aria-label="Ver prendas siguientes" aria-controls={id} disabled={range.end} onClick={() => move(1)} className="street-carousel-arrow"><span aria-hidden="true">→</span></button>
        </div>
      </div>
    </div>
  );
}
