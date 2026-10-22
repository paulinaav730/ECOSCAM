"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  VERIFIED_CLASSIFICATION_RULES,
  VERIFIED_SOURCES,
  VERIFIED_WASTE_ITEMS,
} from "@/lib/data/verified-environmental-data";
import { useEcoScan } from "@/components/providers/ecoscan-provider";

export default function SeparationGuidePage() {
  const { municipality } = useEcoScan();
  const [activeTab, setActiveTab] = useState<
    "colores" | "posconsumo" | "motor_reglas"
  >("colores");

  const posconsumoItems = VERIFIED_WASTE_ITEMS.filter(
    (item) => item.requiresSpecialManagement && item.specialManagementDetails
  );

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
          <Layers className="h-4 w-4" />
          Referencia Normativa Vigente • {municipality}, Colombia
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Guía de Separación, Gestión Posconsumo y Motor de Reglas
        </h1>
        <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-300">
          Basada en la{" "}
          <strong className="text-white">
            Resolución 2184 de 2019 del Ministerio de Ambiente y Desarrollo
            Sostenible
          </strong>{" "}
          y en la reglamentación colombiana de programas posconsumo. Recuerda
          que separar bien exige mucho más que conocer tres colores: requiere
          evaluar el estado de limpieza y aislar los residuos de manejo
          diferenciado.
        </p>
      </div>

      {/* Selector de pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("colores")}
          className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
            activeTab === "colores"
              ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227] shadow-glow"
              : "border border-white/10 bg-[#131832] text-slate-300 hover:text-white"
          }`}
        >
          1. Código de Colores (Res. 2184 de 2019)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posconsumo")}
          className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
            activeTab === "posconsumo"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-[#0E1227]"
              : "border border-white/10 bg-[#131832] text-slate-300 hover:text-white"
          }`}
        >
          2. Gestión Diferenciada y Posconsumo ({posconsumoItems.length} rutas)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("motor_reglas")}
          className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
            activeTab === "motor_reglas"
              ? "bg-gradient-to-r from-[#2DD4BF] to-[#10B981] text-[#0E1227]"
              : "border border-white/10 bg-[#131832] text-slate-300 hover:text-white"
          }`}
        >
          3. Reglas Ambientales Verificadas ({VERIFIED_CLASSIFICATION_RULES.length})
        </button>
      </div>

      {/* PESTAÑA 1: CÓDIGO DE COLORES Y MÁS ALLÁ DE LAS 3 CANECAS */}
      {activeTab === "colores" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Blanco */}
            <div className="rounded-2xl border border-white/30 bg-[#131832] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0E1227]">
                  COLOR BLANCO
                </span>
                <span className="text-xs text-slate-400">
                  Res. 2184 de 2019
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Residuos Aprovechables
              </h2>
              <p className="text-xs leading-relaxed text-slate-300">
                Plástico, vidrio de envase, metales (aluminio y hojalata), papel,
                cartón y envases multicapa (Tetra Pak), siempre que se entreguen{" "}
                <strong className="text-white">limpios y secos</strong>.
              </p>
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <p className="font-semibold text-[#22C55E] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Condición indispensable:
                </p>
                <p className="text-slate-300">
                  Vaciar líquidos, enjuagar ligeramente envases de bebidas o
                  lácteos, dejar escurrir y compactar antes de depositar.
                </p>
              </div>
            </div>

            {/* Verde */}
            <div className="rounded-2xl border border-[#22C55E]/40 bg-[#131832] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-[#22C55E] px-3 py-1 text-xs font-extrabold text-[#0E1227]">
                  COLOR VERDE
                </span>
                <span className="text-xs text-slate-400">
                  Res. 2184 de 2019
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#22C55E]">
                Residuos Orgánicos Aprovechables
              </h2>
              <p className="text-xs leading-relaxed text-slate-300">
                Restos de comida cruda (cáscaras de frutas y verduras, borra de
                café, cáscaras de huevo trituradas) y desechos agrícolas o de
                corte de césped y jardín.
              </p>
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <p className="font-semibold text-[#22C55E] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Condición local:
                </p>
                <p className="text-slate-300">
                  Su aprovechamiento efectivo requiere compostaje casero, paca
                  digestora comunitaria o ruta selectiva de orgánicos en{" "}
                  {municipality}.
                </p>
              </div>
            </div>

            {/* Negro */}
            <div className="rounded-2xl border border-slate-500/40 bg-[#131832] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full border border-slate-500 bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                  COLOR NEGRO
                </span>
                <span className="text-xs text-slate-400">
                  Res. 2184 de 2019
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                Residuos No Aprovechables
              </h2>
              <p className="text-xs leading-relaxed text-slate-300">
                Papel higiénico, servilletas usadas, papeles y cartones
                contaminados con comida o grasa, papeles metalizados sucios y
                residuos sanitarios domésticos.
              </p>
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Advertencia crítica:
                </p>
                <p className="text-slate-300">
                  La bolsa negra NO es para pilas, medicamentos, bombillas ni
                  aceite de cocina. Esos residuos requieren ruta posconsumo.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
              <ShieldAlert className="h-5 w-5" />
              <h3>¿Por qué el sistema no se reduce a tres canecas?</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-100">
              Las canecas blanca, verde y negra aplican únicamente a los
              residuos ordinarios gestionados a través del servicio público de
              aseo y las organizaciones de recicladores. Los residuos peligrosos
              domésticos o de manejo especial (pilas, medicamentos vencidos,
              computadores, celulares, bombillas, llantas, envases de
              plaguicidas y aceite de cocina usado) tienen normativas
              específicas y deben entregarse en puntos de recolección
              posconsumo.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("posconsumo")}
              className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-[#0E1227] hover:bg-amber-300"
            >
              Ver guía detallada de residuos Posconsumo →
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN DIFERENCIADA Y POSCONSUMO (Sección 9) */}
      {activeTab === "posconsumo" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#131832] p-5">
            <h2 className="text-lg font-bold text-white">
              Orientación Específica para Residuos de Gestión Diferenciada y
              Posconsumo
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Cada categoría posconsumo cuenta con su propia regulación y
              condiciones de recepción en Colombia. Nunca improvises
              instrucciones caseras ni desarmes baterías o bombillas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {posconsumoItems.map((item) => {
              const details = item.specialManagementDetails!;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-500/30 bg-[#131832] p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                        {details.programName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {details.regulation}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {item.name}
                    </h3>

                    <div className="space-y-2 text-xs text-slate-300">
                      <p>
                        <strong className="text-[#2DD4BF]">¿Qué es?:</strong>{" "}
                        {details.whatIsIt}
                      </p>
                      <p>
                        <strong className="text-amber-300">
                          ¿Por qué requiere gestión particular?:
                        </strong>{" "}
                        {details.whySpecial}
                      </p>
                      <p>
                        <strong className="text-[#22C55E]">
                          ¿Cómo prepararlo para la entrega?:
                        </strong>{" "}
                        {item.preparationInstructions.join(" ")}
                      </p>
                      <p>
                        <strong className="text-red-300">
                          ¿Qué debe evitar hacer el usuario?:
                        </strong>{" "}
                        {item.warnings.join(" ")}
                      </p>
                      <p>
                        <strong className="text-white">
                          ¿Qué programa o gestor lo recibe?:
                        </strong>{" "}
                        {details.authorizedReceiver}
                      </p>
                      <p>
                        <strong className="text-slate-400">
                          Restricciones aplicables:
                        </strong>{" "}
                        {details.restrictions}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <Link
                      href={`/explorador/${item.slug}`}
                      className="text-xs font-semibold text-[#22C55E] hover:underline"
                    >
                      Abrir ficha interactiva →
                    </Link>
                    {item.source && (
                      <a
                        href={item.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#2DD4BF] hover:underline"
                      >
                        <span>Fuente oficial ({item.source.entityName})</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: MOTOR DE REGLAS AMBIENTALES VERIFICADAS */}
      {activeTab === "motor_reglas" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2DD4BF]">
              <Sparkles className="h-4 w-4" />
              <h2>Reglas Determinísticas Almacenadas en EcoScan</h2>
            </div>
            <p className="text-xs text-slate-300">
              Las recomendaciones de EcoScan no son inventadas libremente por un
              modelo generativo: cada resultado pasa por estas reglas
              jerárquicas verificadas, ordenadas por prioridad de seguridad
              ambiental.
            </p>
          </div>

          <div className="space-y-4">
            {VERIFIED_CLASSIFICATION_RULES.map((rule) => {
              const src =
                VERIFIED_SOURCES[rule.sourceId] ??
                VERIFIED_SOURCES["src-res-2184-2019"];
              return (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#2DD4BF]/15 px-2.5 py-1 text-xs font-bold text-[#2DD4BF]">
                        Código: {rule.code}
                      </span>
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                        Prioridad #{rule.priority}
                      </span>
                      <span className="rounded-lg bg-[#22C55E]/15 px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
                        Estado: {rule.validationStatus.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Ámbito: {rule.geographicScope} • Revisión:{" "}
                      {rule.reviewedAt}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {rule.name}
                  </h3>
                  <p className="text-xs text-slate-200">
                    <strong>Recomendación:</strong> {rule.recommendation}
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Explicación técnica:</strong> {rule.explanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="h-3.5 w-3.5 text-[#2DD4BF]" />
                      Fuente: {src.entityName} — {src.resourceTitle}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2DD4BF] hover:underline"
                    >
                      <span>Ver documento oficial</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
