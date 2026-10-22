"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Info,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { COLOMBIAN_MUNICIPALITIES } from "@/lib/data/verified-environmental-data";
import { filterCollectionPoints } from "@/services/collection-points-service";
import { CATEGORY_LABELS } from "@/services/waste-catalog-service";
import { CollectionPoint, WasteManagementCategory } from "@/types/ecoscan";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { ModalDialog } from "@/components/ui/modal-dialog";

function CollectionPointsContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "todas") as
    | WasteManagementCategory
    | "todas";

  const { municipality, setMunicipality, openReportModal } = useEcoScan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    WasteManagementCategory | "todas"
  >(initialCategory);
  const [activePoint, setActivePoint] = useState<CollectionPoint | null>(null);

  const filteredPoints = useMemo(() => {
    return filterCollectionPoints({
      municipality,
      wasteCategory: selectedCategory,
      searchQuery,
    });
  }, [municipality, selectedCategory, searchQuery]);

  const pointsWithVerifiedCoords = filteredPoints.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
          <MapPin className="h-4 w-4" />
          Medellín, Valle de Aburrá y Red Posconsumo Nacional
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Mapa y Directorio de Puntos de Recolección
        </h1>
        <p className="max-w-3xl text-xs sm:text-sm text-slate-300">
          Consulta los canales oficiales, operadores de aprovechamiento y redes
          posconsumo según tu municipio y tipo de residuo. EcoScan muestra
          únicamente referencias respaldadas y nunca inventa direcciones,
          coordenadas ni horarios ficticios.
        </p>
      </div>

      {/* Filtros de ciudad, dirección/lugar y tipo de residuo */}
      <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-3">
          <label
            htmlFor="points-municipality-select"
            className="block text-xs font-medium text-slate-300"
          >
            Ciudad o municipio
          </label>
          <select
            id="points-municipality-select"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#2DD4BF] focus:outline-none"
          >
            {COLOMBIAN_MUNICIPALITIES.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-5">
          <label
            htmlFor="points-search-input"
            className="block text-xs font-medium text-slate-300"
          >
            Buscar por entidad, programa, dirección o material
          </label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="points-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej. Emvarias, Punto Azul, pilas, medicamentos, bombillas..."
              className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-[#2DD4BF] focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="points-category-select"
            className="block text-xs font-medium text-slate-300"
          >
            Filtrar por tipo de residuo
          </label>
          <select
            id="points-category-select"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value as WasteManagementCategory | "todas"
              )
            }
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#2DD4BF] focus:outline-none"
          >
            <option value="todas">Todos los tipos de residuo</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Panel de Mapa Interactivo y Estado de Verificación Geográfica (Cumplimiento estricto Sección 11) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#2DD4BF]/30 bg-[#131832] p-6 lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2DD4BF]/15 px-3 py-1 text-xs font-bold text-[#2DD4BF]">
                <ShieldCheck className="h-4 w-4" />
                Estado de Cartografía Verificada
              </span>
              <span className="text-xs text-slate-400">{municipality}</span>
            </div>

            <h2 className="text-lg font-bold text-white">
              Visor Geográfico de Puntos ({municipality})
            </h2>

            {pointsWithVerifiedCoords.length === 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-[#0E1227] p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1.5 text-xs text-slate-200">
                    <p className="font-semibold text-amber-300">
                      Aviso de transparencia geográfica: Sin coordenadas
                      puntuales cargadas en base de datos para esta vista
                    </p>
                    <p className="leading-relaxed text-slate-300">
                      Para evitar mostrar ubicaciones, direcciones u horarios
                      ficticios como si fueran reales, EcoScan no genera pines
                      simulados en el mapa hasta que una fuente georreferenciada
                      oficial (ej. API abierta municipal o tabla{" "}
                      <code>collection_points</code> verificada con latitud y
                      longitud) esté conectada para {municipality}.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#131832] p-3 text-[11px] text-slate-300 space-y-1">
                  <p className="font-semibold text-[#2DD4BF]">
                    ¿Cómo consultar el contenedor exacto hoy?
                  </p>
                  <p>
                    Utiliza las fichas institucionales verificadas a la derecha
                    para abrir los buscadores oficiales vigentes de{" "}
                    <strong>Emvarias Grupo EPM</strong>,{" "}
                    <strong>Punto Azul</strong>,{" "}
                    <strong>Pilas con el Ambiente</strong>,{" "}
                    <strong>EcoCómputo</strong> y <strong>Lúmina</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#0E1227] p-4">
                <p className="text-xs text-emerald-300">
                  Mostrando {pointsWithVerifiedCoords.length} puntos con
                  coordenadas verificadas en {municipality}.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              openReportModal({
                contextLabel: `Sugerir punto de recolección verificado en ${municipality}`,
              })
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/15 px-4 py-2.5 text-xs font-semibold text-[#22C55E] hover:bg-[#22C55E]/25"
          >
            <Flag className="h-4 w-4" />
            <span>Aportar datos verificables de un punto en {municipality}</span>
          </button>
        </div>

        {/* Lista de canales y puntos disponibles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Canales y programas verificados disponibles ({filteredPoints.length})
            </h2>
            <span className="text-xs text-slate-400">
              Haz clic en cada punto para ver qué recibe exactamente
            </span>
          </div>

          {filteredPoints.map((point) => (
            <div
              key={point.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-4 transition hover:border-[#2DD4BF]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#2DD4BF]">
                    <CheckCircle2 className="h-3 w-3" />
                    {point.verificationStatus === "referencia_institucional"
                      ? "Referencia Institucional Verificada"
                      : "Punto Verificado"}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white">
                    {point.name}
                  </h3>
                  <p className="text-xs font-medium text-[#22C55E]">
                    Operador / Entidad: {point.entityOperator}
                  </p>
                </div>

                <span className="text-[11px] text-slate-400">
                  Verificado: {point.lastVerifiedAt}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">
                {point.description}
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-slate-300 bg-[#0E1227] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#2DD4BF] mt-0.5" />
                  <span>
                    <strong>Ubicación / Cobertura:</strong> {point.address}
                  </span>
                </div>
                {point.schedule && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
                    <span>
                      <strong>Horarios:</strong> {point.schedule}
                    </span>
                  </div>
                )}
              </div>

              {/* Materiales aceptados */}
              <div className="flex flex-wrap gap-1.5">
                {point.materialsAccepted.map((mat, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200"
                  >
                    {mat.materialName}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setActivePoint(point)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2 text-xs font-bold text-[#0E1227]"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Abrir ficha y requisitos de entrega</span>
                </button>

                {point.officialUrl && (
                  <a
                    href={point.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    <span>Portal oficial de consulta</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal con ficha detallada del punto de recolección */}
      <ModalDialog
        open={Boolean(activePoint)}
        onClose={() => setActivePoint(null)}
        title={activePoint?.name || "Detalle del punto de recolección"}
        subtitle={
          activePoint
            ? `${activePoint.entityOperator} • Última verificación: ${activePoint.lastVerifiedAt}`
            : undefined
        }
      >
        {activePoint && (
          <div className="space-y-4 text-xs text-slate-200">
            <p className="leading-relaxed text-slate-300">
              {activePoint.description}
            </p>

            <div className="rounded-xl border border-white/10 bg-[#0E1227] p-3.5 space-y-2">
              <p>
                <strong className="text-[#2DD4BF]">Dirección / Canal:</strong>{" "}
                {activePoint.address}
              </p>
              {activePoint.schedule && (
                <p>
                  <strong className="text-[#2DD4BF]">Horarios:</strong>{" "}
                  {activePoint.schedule}
                </p>
              )}
              {activePoint.contactInfo && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span>
                    <strong>Contacto:</strong> {activePoint.contactInfo}
                  </span>
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm">
                Materiales que recibe exactamente y condiciones
              </h3>
              <ul className="mt-2 space-y-2">
                {activePoint.materialsAccepted.map((mat, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-white/10 bg-[#0E1227]/70 p-3"
                  >
                    <p className="font-semibold text-[#22C55E]">
                      {mat.materialName}
                    </p>
                    <p className="mt-0.5 text-slate-300">
                      Condición de recepción: {mat.acceptanceConditions}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm">
                Requisitos obligatorios de entrega
              </h3>
              <ul className="mt-2 list-disc pl-4 space-y-1 text-slate-300">
                {activePoint.deliveryRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
              {activePoint.officialUrl && (
                <a
                  href={activePoint.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 font-bold text-[#0E1227]"
                >
                  <span>Abrir mapa/directorio oficial de la entidad</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  const pointId = activePoint.id;
                  const pointName = activePoint.name;
                  setActivePoint(null);
                  openReportModal({
                    collectionPointId: pointId,
                    contextLabel: `Actualización sobre punto: ${pointName}`,
                  });
                }}
                className="rounded-xl border border-white/15 px-3 py-2 text-slate-300 hover:bg-white/5"
              >
                Reportar cambio en este punto
              </button>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}

export default function CollectionPointsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-8 text-center text-sm text-slate-300">
          Cargando puntos de recolección...
        </div>
      }
    >
      <CollectionPointsContent />
    </Suspense>
  );
}
