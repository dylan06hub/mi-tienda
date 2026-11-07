"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { formatearPrecio } from "@/lib/utils";

type Conteo = {
  categoria: Record<string, number>;
  talle: Record<string, number>;
  color: Record<string, number>;
};

type Props = {
  conteos: Conteo;
  precios: { min: number; max: number };
};

function Checkbox({
  nombre,
  valor,
  etiqueta,
  conteo,
  activa,
}: {
  nombre: string;
  valor: string;
  etiqueta: string;
  conteo: number;
  activa: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendiente, startTransition] = useTransition();

  const actualizar = useCallback(
    (marcado: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const valores = params.getAll(nombre);
      if (marcado) {
        if (!valores.includes(valor)) {
          params.append(nombre, valor);
        }
      } else {
        const filtrados = valores.filter((v) => v !== valor);
        params.delete(nombre);
        filtrados.forEach((v) => params.append(nombre, v));
      }
      params.set("pagina", "1");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [nombre, valor, searchParams, pathname, router],
  );

  return (
    <label className="flex min-h-9 items-center gap-2 text-sm text-street-muted">
      <input
        type="checkbox"
        checked={activa}
        onChange={(e) => actualizar(e.target.checked)}
        disabled={pendiente}
        className="h-4 w-4 accent-street-accent rounded border-street-muted text-street-foreground focus:ring-street-secondary"
      />
      <span className="flex-1">{etiqueta}</span>
      <span className="text-xs text-street-muted">{conteo}</span>
    </label>
  );
}

export function FiltrosCatalogo({ conteos, precios }: Props) {
  const [abiertos, setAbiertos] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendiente, startTransition] = useTransition();

  const categorias = Object.entries(conteos.categoria).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  const talles = Object.entries(conteos.talle).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  const colores = Object.entries(conteos.color).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const activos = Array.from(searchParams.entries()).filter(
    ([clave, valor]) =>
      (["categoria", "talle", "color", "min", "max"].includes(clave) && valor.trim() !== "") ||
      (clave === "disponible" && valor === "1"),
  );

  const limpiar = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const soloStock = searchParams.get("disponible") === "1";
  const minPrecio = searchParams.get("min") ?? "";
  const maxPrecio = searchParams.get("max") ?? "";

  const actualizarDisponible = useCallback(
    (marcado: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (marcado) {
        params.set("disponible", "1");
      } else {
        params.delete("disponible");
      }
      params.set("pagina", "1");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  const actualizarPrecio = useCallback(
    (clave: "min" | "max", valor: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor && valor !== "") {
        params.set(clave, valor);
      } else {
        params.delete(clave);
      }
      params.set("pagina", "1");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  return (
    <aside aria-label="Filtros del catálogo">
      <div className="flex items-center justify-between">
        <p className="hidden text-sm font-medium text-street-foreground lg:block">Filtros {activos.length > 0 && `(${activos.length})`}</p>
        <button
          type="button"
          aria-expanded={abiertos}
          aria-controls="filtros-catalogo"
          onClick={() => setAbiertos(!abiertos)}
          className="inline-flex min-h-11 items-center rounded-street border border-street-muted px-5 text-sm font-medium text-street-foreground hover:border-street-accent lg:hidden"
        >
          {abiertos ? "Cerrar filtros" : "Filtrar"}{activos.length > 0 ? ` (${activos.length})` : ""}
        </button>
        {activos.length > 0 && (
          <button
            type="button"
            onClick={limpiar}
            disabled={pendiente}
            className="min-h-11 text-sm text-street-muted underline underline-offset-4 hover:text-street-foreground disabled:opacity-50"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div id="filtros-catalogo" className={`mt-6 space-y-6 ${abiertos ? "" : "hidden lg:block"}`}>
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-street-muted">
            Disponibilidad
          </h2>
          <div className="mt-3">
            <label className="flex min-h-9 items-center gap-2 text-sm text-street-muted">
              <input
                type="checkbox"
                checked={soloStock}
                onChange={(e) => actualizarDisponible(e.target.checked)}
                disabled={pendiente}
                className="h-4 w-4 accent-street-accent rounded border-street-muted text-street-foreground focus:ring-street-secondary"
              />
              <span>Solo con stock</span>
            </label>
          </div>
        </section>

        {categorias.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.18em] text-street-muted">
              Categoría
            </h2>
            <div className="mt-3 space-y-2">
              {categorias.map(([categoria, conteo]) => (
                <Checkbox
                  key={categoria}
                  nombre="categoria"
                  valor={categoria}
                  etiqueta={categoria}
                  conteo={conteo}
                  activa={searchParams.getAll("categoria").includes(categoria)}
                />
              ))}
            </div>
          </section>
        )}

        {talles.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.18em] text-street-muted">
              Talle
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {talles.map(([talle, conteo]) => {
                const activa = searchParams.getAll("talle").includes(talle);
                return (
                  <button
                    key={talle}
                    type="button"
                    aria-pressed={activa}
                    disabled={pendiente}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      const valores = params.getAll("talle");
                      if (activa) {
                        const filtrados = valores.filter((v) => v !== talle);
                        params.delete("talle");
                        filtrados.forEach((v) => params.append("talle", v));
                      } else {
                        params.append("talle", talle);
                      }
                      params.set("pagina", "1");
                      startTransition(() => {
                        router.replace(
                          `${pathname}?${params.toString()}`,
                          { scroll: false },
                        );
                      });
                    }}
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-street border px-3 text-sm transition-colors ${
                      activa
                        ? "border-street-accent bg-street-accent text-street-on-accent"
                        : "border-street-muted text-street-muted hover:border-street-accent"
                    } disabled:opacity-50`}
                    title={`${conteo} producto${conteo === 1 ? "" : "s"}`}
                  >
                    {talle}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {colores.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.18em] text-street-muted">
              Color
            </h2>
            <div className="mt-3 space-y-2">
              {colores.map(([color, conteo]) => (
                <Checkbox
                  key={color}
                  nombre="color"
                  valor={color}
                  etiqueta={color}
                  conteo={conteo}
                  activa={searchParams.getAll("color").includes(color)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-street-muted">
            Precio
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-street-muted" htmlFor="filtro-min">
                Mínimo
              </label>
              <input
                id="filtro-min"
                key={minPrecio}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={formatearPrecio(precios.min)}
                defaultValue={minPrecio}
                onBlur={(e) => actualizarPrecio("min", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    actualizarPrecio("min", e.currentTarget.value);
                  }
                }}
                className="mt-1 h-11 w-full rounded-street border border-street-muted bg-street-surface px-2 text-base tabular-nums text-street-foreground focus:border-street-secondary"
              />
            </div>
            <div>
              <label className="text-xs text-street-muted" htmlFor="filtro-max">
                Máximo
              </label>
              <input
                id="filtro-max"
                key={maxPrecio}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={formatearPrecio(precios.max)}
                defaultValue={maxPrecio}
                onBlur={(e) => actualizarPrecio("max", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    actualizarPrecio("max", e.currentTarget.value);
                  }
                }}
                className="mt-1 h-11 w-full rounded-street border border-street-muted bg-street-surface px-2 text-base tabular-nums text-street-foreground focus:border-street-secondary"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
