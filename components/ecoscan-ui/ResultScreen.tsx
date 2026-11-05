"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Trash2,
  Sparkles,
  ListChecks,
  PackageCheck,
  Leaf,
  ChevronRight,
  Info,
  RotateCcw,
  ShieldAlert,
  Recycle,
  SlidersHorizontal,
  ExternalLink,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { WasteAnalysis, TabType } from './types';
import { WasteConditionState } from '@/types/ecoscan';

interface ResultScreenProps {
  analysis: WasteAnalysis | null;
  onSaveToHistory: (analysis: WasteAnalysis) => void;
  setActiveTab: (tab: TabType) => void;
  onReevaluateCondition?: (condition: WasteConditionState) => void;
  isSaved?: boolean;
}

const LIVE_CONDITION_BUTTONS: {
  id: WasteConditionState;
  label: string;
}[] = [
  { id: 'limpio_seco', label: '✨ Limpio y seco' },
  { id: 'parcialmente_contaminado', label: '🍕 Parcialmente sucio' },
  { id: 'contaminado_grasa', label: '🛢️ Con grasa / comida' },
  { id: 'contaminado_quimico', label: '⚠️ Químico / Peligroso' },
];

export const ResultScreen: React.FC<ResultScreenProps> = ({
  analysis,
  setActiveTab,
  onReevaluateCondition,
  isSaved = true,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCheckedSteps({});
  }, [analysis?.wasteName, analysis?.conditionEvaluated]);

  if (!analysis) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Trash2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">
          No hay ningún resultado activo
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Toma una foto de un residuo, elige una muestra o consulta el catálogo para ver su evaluación multicriterio.
        </p>
        <button
          onClick={() => setActiveTab('escanear')}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
        >
          Ir al Escáner
        </button>
      </div>
    );
  }

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getBinBadgeStyle = (binColor: string) => {
    switch (binColor) {
      case 'Blanco':
        return {
          bg: 'bg-slate-100 text-slate-950 border-slate-300',
          badgeText: 'CANECA BLANCA — Residuos Aprovechables (Limpio y Seco)',
        };
      case 'Verde':
        return {
          bg: 'bg-emerald-600 text-white border-emerald-400',
          badgeText: 'CANECA VERDE — Orgánicos Aprovechables / Compostables',
        };
      case 'Negro':
        return {
          bg: 'bg-slate-900 text-white border-slate-700',
          badgeText: 'CANECA NEGRA — No Aprovechables / Contaminados con Grasa',
        };
      case 'Posconsumo':
        return {
          bg: 'bg-amber-500 text-slate-950 border-amber-300',
          badgeText:
            'PUNTO POSCONSUMO OFICIAL — Prohibido en Canecas Domésticas',
        };
      case 'Rojo':
        return {
          bg: 'bg-red-600 text-white border-red-400',
          badgeText: 'RUTA ESPECIAL / ROJA — Residuos Peligrosos',
        };
      default:
        return {
          bg: 'bg-emerald-500 text-slate-950 border-emerald-400',
          badgeText: `RUTA ${binColor.toUpperCase()}`,
        };
    }
  };

  const binStyle = getBinBadgeStyle(analysis.binColor);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header Banner con Confirmación de Acreditación Automática de Puntos e Historial */}
      <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-500/40 p-3.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-white">
              {isSaved
                ? '¡Guardado automáticamente en tu Historial!'
                : 'Evaluación Multicriterio Completada'}
            </p>
            <p className="text-[10px] text-emerald-300">
              {analysis.ruleCode
                ? `Regla aplicada: ${analysis.ruleCode} • Res. 2184/2019`
                : 'Norma Colombia Resolución 2184 de 2019'}
            </p>
          </div>
        </div>
        <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 fill-yellow-300" />
          <span>+{analysis.ecoPoints} Pts Eco</span>
        </div>
      </div>

      {/* Main Identified Item Card (Incluye explícitamente los 7 datos del reconocimiento) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-start gap-4">
          {analysis.imageUrl ? (
            <img
              src={analysis.imageUrl}
              alt={analysis.wasteName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-700 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Recycle className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
                {analysis.category.replace('_', ' ')}
              </span>
              {analysis.conditionEvaluated && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-teal-300 border border-emerald-500/30">
                  Estado: {analysis.conditionEvaluated.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            {/* 1. Nombre del residuo identificado */}
            <h2 className="text-lg font-extrabold text-white leading-tight">
              {analysis.wasteName}
            </h2>
            {analysis.visualObservations && (
              <p className="text-[11px] text-slate-400 leading-snug">
                {analysis.visualObservations}
              </p>
            )}
          </div>
        </div>

        {/* DIFERENCIACIÓN EXPLÍCITA: 2. MATERIAL PRINCIPAL vs 3. CATEGORÍA DE SEPARACIÓN vs 4. RECIPIENTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Material Principal del Objeto
            </span>
            <p className="text-xs font-bold text-white leading-snug">
              {analysis.primaryMaterialLabel ||
                analysis.category.replace('_', ' ').toUpperCase()}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Recycle className="w-3 h-3" />
              Categoría de Disposición (Colombia)
            </span>
            <p className="text-xs font-bold text-white leading-snug">
              {analysis.separationCategoryLabel ||
                `Ruta ${analysis.binColor}`}
            </p>
          </div>
        </div>

        {/* SIMULADOR INTERACTIVO DE ESTADO EN VIVO */}
        {onReevaluateCondition && !analysis.requiresSpecialManagement && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2">
            <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ¿En qué estado real está tu residuo? (Actualiza la ruta en vivo):
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {LIVE_CONDITION_BUTTONS.map((btn) => {
                const isCurrent = analysis.conditionEvaluated === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => onReevaluateCondition(btn.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left border transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. COLOR DEL RECIPIENTE Y 5. INSTRUCCIONES PARA DESECHARLO CORRECTAMENTE */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-300">
            Recipiente Oficial e Instrucciones de Disposición:
          </p>

          <div
            className={`p-4 rounded-2xl border ${binStyle.bg} shadow-lg space-y-1.5`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {binStyle.badgeText}
              </span>
              <div
                className="w-5 h-5 rounded-full border border-black/30 shadow-inner flex-shrink-0"
                style={{ backgroundColor: analysis.binHexColor }}
              />
            </div>
            <p className="text-xs leading-relaxed opacity-95 font-medium">
              {analysis.binDescription}
            </p>
          </div>
        </div>
      </div>

      {/* PROGRAMA POSCONSUMO OFICIAL (SI APLICA) */}
      {analysis.specialManagementDetails && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Ruta Posconsumo: {analysis.specialManagementDetails.programName}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {analysis.specialManagementDetails.regulation}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {analysis.specialManagementDetails.whySpecial}
          </p>
          <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 space-y-1 text-xs">
            <p className="text-amber-300 font-bold">
              📍 ¿Dónde entregarlo?:{' '}
              <span className="text-slate-200 font-normal">
                {analysis.specialManagementDetails.authorizedReceiver}
              </span>
            </p>
            <p className="text-rose-300 font-bold">
              🚫 Restricción:{' '}
              <span className="text-slate-300 font-normal">
                {analysis.specialManagementDetails.restrictions}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* 6. RECOMENDACIONES DE LIMPIEZA O PREPARACIÓN PASO A PASO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
            Recomendaciones de Limpieza y Preparación
          </h3>
          <span className="text-[10px] text-slate-400">Checklist interactivo</span>
        </div>

        <div className="space-y-2">
          {analysis.preparationSteps.map((step, idx) => {
            const isChecked = !!checkedSteps[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-200'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {isChecked && (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isChecked ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {step}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ALTERNATIVAS DE ECONOMÍA CIRCULAR Y REUTILIZACIÓN SEGURA */}
      {analysis.circularAlternatives && analysis.circularAlternatives.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
            Economía Circular y Reutilización antes de Desechar
          </h3>

          <div className="space-y-2">
            {analysis.circularAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    {alt.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {alt.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {alt.description}
                </p>
                {alt.safetyNote && (
                  <p className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800">
                    🛡️ Seg. Sanitaria: {alt.safetyNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUÉ PRODUCTOS PUEDEN FABRICARSE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
          Transformación y Aprovechamiento Industrial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.derivedProducts.map((product, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 stroke-[2]" />
              </div>
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {product}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ERRORES FRECUENTES A EVITAR */}
      {analysis.commonMistakesToAvoid &&
        analysis.commonMistakesToAvoid.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Errores Frecuentes que Debes Evitar
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {analysis.commonMistakesToAvoid.map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* IMPACTO AMBIENTAL, CONTEXTO Y FUENTE VERIFICADA */}
      <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-2.5">
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-4 h-4" />
          Impacto Ambiental y Trazabilidad Normativa
        </p>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {analysis.environmentalImpact}
        </p>
        {analysis.tips && (
          <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-teal-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <span>{analysis.tips}</span>
          </div>
        )}
        {analysis.verifiedSource && (
          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              Fuente: {analysis.verifiedSource.entityName} (
              {analysis.verifiedSource.resourceTitle})
            </span>
            {analysis.verifiedSource.url && (
              <a
                href={analysis.verifiedSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-bold"
              >
                Oficial <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* BOTONES DE NAVEGACIÓN (El escaneo ya quedó guardado automáticamente) */}
      <div className="space-y-2 pt-2">
        <div className="w-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Escaneo registrado automáticamente en tu Historial (+{analysis.ecoPoints} Pts Eco acreditados)
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('escanear')}
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Escanear Otro Residuo</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
          >
            <span>Ver en Mi Historial</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
