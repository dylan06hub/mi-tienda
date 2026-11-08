"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import type { HomeCampaign } from "@/lib/home-campaigns";

export function BannerCarousel({ banners }: { banners: HomeCampaign[] }) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const swiped = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setVisible(document.visibilityState === "visible");
    preference();
    visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || reduced || !visible || banners.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % banners.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, reduced, visible, banners.length]);

  function select(next: number) {
    setIndex((next + banners.length) % banners.length);
    setPaused(true);
  }

  function swipe(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "touch" || !touch.current) return;
    const dx = event.clientX - touch.current.x;
    const dy = event.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped.current = true;
      select(index + (dx < 0 ? 1 : -1));
    }
  }

  const banner = banners[index];
  if (!banner) return null;
  const playing = !paused && !reduced;

  return (
    <section className={`campaign campaign--${banner.id}`} aria-roledescription="carrusel" aria-label="Campañas de norte." onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setPaused(true)} onClickCapture={(event) => { if (swiped.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}>
      <div id={id} aria-live={playing ? "off" : "polite"} aria-atomic="true">
        <div key={banner.id} className="campaign-panel site-shell" data-animate={playing} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de ${banners.length}: ${banner.label}`} onPointerDown={(event) => { swiped.current = false; if (event.pointerType === "touch") touch.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={swipe} onPointerCancel={() => { touch.current = null; }}>
          <div className="campaign-copy">
            <p className="campaign-eyebrow font-mono">{banner.eyebrow}</p>
            <h1 className="campaign-title street-title">{banner.title}<br /><span>{banner.highlight}</span></h1>
            <p className="campaign-description">{banner.description}</p>
            <Link href={banner.href} className="campaign-action">{banner.action}<span aria-hidden="true">↗</span></Link>
          </div>
          {banner.product ? (
            <Link href={`/productos/${banner.product.id}`} aria-label={`Ver ${banner.product.nombre}`} className="campaign-visual">
              <Image src={banner.product.imagen} alt={banner.product.nombre} fill loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} sizes="(min-width: 1600px) 752px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              <span className="campaign-category font-mono">{banner.product.categoria}</span>
              <span className="campaign-caption"><span><span className="block font-mono text-xs uppercase tracking-wider text-street-muted">Explorá la prenda</span><span className="mt-1 block font-display text-3xl font-black uppercase leading-none">{banner.product.nombre}</span></span><span aria-hidden="true">↗</span></span>
            </Link>
          ) : <div className="campaign-visual campaign-wordmark" aria-hidden="true">{banner.id === "ofertas" ? "OFERTAS" : "norte."}</div>}
        </div>
      </div>
      <div className="campaign-controls site-shell">
        <div className="campaign-selectors" aria-label="Elegir campaña">
          {banners.map((item, number) => <button key={item.id} type="button" aria-pressed={index === number} aria-controls={id} onClick={() => select(number)}><span className="font-mono">0{number + 1}</span>{item.label}</button>)}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="campaign-control" aria-label="Banner anterior" aria-controls={id} onClick={() => select(index - 1)}>←</button>
          <button type="button" className="campaign-control" aria-label="Banner siguiente" aria-controls={id} onClick={() => select(index + 1)}>→</button>
          {!reduced && <button type="button" className="campaign-control" aria-label={paused ? "Reanudar banners" : "Pausar banners"} onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>}
        </div>
      </div>
    </section>
  );
}
