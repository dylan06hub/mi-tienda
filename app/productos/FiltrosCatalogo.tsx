"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
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
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        checked={activa}
        onChange={(e) => actualizar(e.target.checked)}
        disabled={pendiente}
        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
      />
      <span className="flex-1">{etiqueta}</span>
      <span className="text-xs text-stone-400">{conteo}</span>
    </label>
  );
}

export function FiltrosCatalogo({ conteos, precios }: Props) {
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

  const activos = Array.from(searchParams.keys()).filter(
    (k) => k !== "pagina",
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
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-900">Filtros</p>
        {activos.length > 0 && (
          <button
            type="button"
            onClick={limpiar}
            disabled={pendiente}
            className="text-xs text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline disabled:opacity-50"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">
          Disponibilidad
        </h2>
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={soloStock}
              onChange={(e) => actualizarDisponible(e.target.checked)}
              disabled={pendiente}
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>Solo con stock</span>
          </label>
        </div>
      </section>

      {categorias.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">
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
          <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Talle
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {talles.map(([talle, conteo]) => {
              const activa = searchParams.getAll("talle").includes(talle);
              return (
                <button
                  key={talle}
                  type="button"
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
                  className={`inline-flex h-9 items-center rounded-full border px-3 text-xs transition ${
                    activa
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 text-stone-700 hover:border-stone-900"
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
          <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">
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
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">
          Precio
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-stone-500" htmlFor="filtro-min">
              Mínimo
            </label>
            <input
              id="filtro-min"
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
              className="mt-1 h-9 w-full rounded-lg border border-stone-300 px-2 text-sm tabular-nums text-stone-900 outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500" htmlFor="filtro-max">
              Máximo
            </label>
            <input
              id="filtro-max"
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
              className="mt-1 h-9 w-full rounded-lg border border-stone-300 px-2 text-sm tabular-nums text-stone-900 outline-none focus:border-stone-900"
            />
          </div>
        </div>
      </section>
    </aside>
  );
}
