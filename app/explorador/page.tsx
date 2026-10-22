"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  Layers,
  Recycle,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  filterWasteCatalog,
  MATERIAL_LABELS,
} from "@/services/waste-catalog-service";
import {
  MaterialType,
  WasteConditionState,
  WasteManagementCategory,
} from "@/types/ecoscan";

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = (searchParams.get("category") ?? "todas") as
    | WasteManagementCategory
    | "todas";

  const [query, setQuery] = useState(initialQuery);
  const [selectedMaterial, setSelectedMaterial] = useState<
    MaterialType | "todos"
  >("todos");
  const [selectedCategory, setSelectedCategory] = useState<
    WasteManagementCategory | "todas"
  >(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState<
    WasteConditionState | "todas"
  >("todas");
  const [onlySpecial, setOnlySpecial] = useState(false);

  const filteredItems = useMemo(() => {
    return filterWasteCatalog({
      query,
      material: selectedMaterial,
      category: selectedCategory,
      condition: selectedCondition,
      onlySpecialManagement: onlySpecial,
    });
  }, [
    query,
    selectedMaterial,
    selectedCategory,
    selectedCondition,
    onlySpecial,
  ]);

  function handleResetFilters() {
    setQuery("");
    setSelectedMaterial("todos");
    setSelectedCategory("todas");
    setSelectedCondition("todas");
    setOnlySpecial(false);
  }

  const colorBadges = {
    blanco: "bg-white text-[#0E1227] border-white",
    verde: "bg-[#22C55E] text-[#0E1227] border-[#22C55E]",
    negro: "bg-slate-900 text-white border-slate-600",
    punto_posconsumo: "bg-amber-500 text-[#0E1227] border-amber-400",
    verificacion: "bg-[#2DD4BF] text-[#0E1227] border-[#2DD4BF]",
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
            <Search className="h-4 w-4" />
            Catálogo Público Verificado • Sin necesidad de escanear
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Explorador y Buscador de Residuos
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300">
            Busca por nombre o sinónimos cotidianos (ej. &quot;icopor&quot;,
            &quot;tetra pak&quot;, &quot;blíster&quot;, &quot;tarro&quot;,
            &quot;servilleta&quot;) y filtra por material, estado o gestión
            posconsumo.
          </p>
        </div>

        <Link
          href="/escaner"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2.5 text-xs font-bold text-[#0E1227] shadow-glow"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ir al Escáner IA</span>
        </Link>
      </div>

      {/* Barra de búsqueda y filtros multicriterio */}
      <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o sinónimo (ej. pila, pizza, botella, medicamento)..."
              aria-label="Buscar residuo por nombre o sinónimo"
              className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-[#2DD4BF] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="filter-material" className="sr-only">
              Filtrar por material
            </label>
            <select
              id="filter-material"
              value={selectedMaterial}
              onChange={(e) =>
                setSelectedMaterial(e.target.value as MaterialType | "todos")
              }
              className="w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#2DD4BF] focus:outline-none"
            >
              <option value="todos">Todos los materiales</option>
              {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="filter-category" className="sr-only">
              Filtrar por categoría de gestión
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value as WasteManagementCategory | "todas"
                )
              }
              className="w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#2DD4BF] focus:outline-none"
            >
              <option value="todas">Todas las categorías de gestión</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[#2DD4BF]" />
              <label
                htmlFor="filter-condition"
                className="text-xs text-slate-300"
              >
                Estado/Condición:
              </label>
              <select
                id="filter-condition"
                value={selectedCondition}
                onChange={(e) =>
                  setSelectedCondition(
                    e.target.value as WasteConditionState | "todas"
                  )
                }
                className="rounded-lg border border-white/15 bg-[#0E1227] px-2.5 py-1.5 text-xs text-white"
              >
                <option value="todas">Cualquier condición</option>
                {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
              <input
                type="checkbox"
                checked={onlySpecial}
                onChange={(e) => setOnlySpecial(e.target.checked)}
                className="rounded border-amber-400 text-amber-500 focus:ring-0"
              />
              <span>Solo gestión especial / posconsumo</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Mostrando <strong className="text-white">{filteredItems.length}</strong>{" "}
              fichas
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estado vacío si no hay resultados */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#131832]/60 p-10 text-center space-y-4">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">
              No encontramos residuos con esa combinación exacta de filtros
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Intenta limpiar los filtros o utiliza el clasificador por material
              y estado en el Escáner Inteligente para evaluar tu objeto.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0E1227]"
            >
              Ver todos los residuos del catálogo
            </button>
            <Link
              href="/escaner"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
            >
              Usar clasificador por reglas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/explorador/${item.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131832] p-5 transition hover:-translate-y-0.5 hover:border-[#2DD4BF]/40 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      colorBadges[item.containerColor]
                    }`}
                  >
                    {item.containerColor === "blanco"
                      ? "Blanco • Aprovechable"
                      : item.containerColor === "verde"
                      ? "Verde • Orgánico"
                      : item.containerColor === "negro"
                      ? "Negro • No Aprovechable"
                      : item.containerColor === "punto_posconsumo"
                      ? "Posconsumo Especial"
                      : "Separación por Estado"}
                  </span>

                  <span className="rounded-md bg-[#0E1227] px-2 py-0.5 text-[11px] text-slate-300 border border-white/10">
                    {MATERIAL_LABELS[item.primaryMaterial]}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-[#2DD4BF] transition">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Sinónimos */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.synonyms.slice(0, 3).map((syn) => (
                    <span
                      key={syn}
                      className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    {item.requiresSpecialManagement ? (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-amber-300">
                          Requiere punto posconsumo
                        </span>
                      </>
                    ) : (
                      <>
                        <Recycle className="h-3.5 w-3.5 text-[#22C55E]" />
                        <span>
                          {item.circularAlternatives.length} alternativa(s)
                          circular(es)
                        </span>
                      </>
                    )}
                  </span>
                  <span className="font-semibold text-[#2DD4BF] group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                    Ficha completa <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-8 text-center text-sm text-slate-300">
          Cargando catálogo verificado de residuos...
        </div>
      }
    >
      <ExplorerContent />
    </Suspense>
  );
}
