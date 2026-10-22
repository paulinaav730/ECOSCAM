"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Flag,
  HelpCircle,
  Info,
  MapPin,
  Recycle,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  MATERIAL_LABELS,
} from "@/services/waste-catalog-service";
import {
  MaterialType,
  RuleEngineEvaluationResult,
  WasteConditionState,
} from "@/types/ecoscan";
import { useEcoScan } from "@/components/providers/ecoscan-provider";

interface ClassificationResultCardProps {
  objectName: string;
  primaryMaterial: MaterialType;
  secondaryMaterials?: string[];
  conditionState: WasteConditionState;
  confidenceScore?: number;
  imagePreviewUrl?: string | null;
  evaluation: RuleEngineEvaluationResult;
  onRecalculate?: (updated: {
    objectName: string;
    primaryMaterial: MaterialType;
    conditionState: WasteConditionState;
  }) => void;
  onResetScanner?: () => void;
}

export function ClassificationResultCard({
  objectName,
  primaryMaterial,
  secondaryMaterials = [],
  conditionState,
  confidenceScore,
  imagePreviewUrl,
  evaluation,
  onRecalculate,
  onResetScanner,
}: ClassificationResultCardProps) {
  const { addScanRecord, registerUserAction, municipality, openReportModal } =
    useEcoScan();

  const [isEditingIdentification, setIsEditingIdentification] = useState(false);
  const [editedName, setEditedName] = useState(objectName);
  const [editedMaterial, setEditedMaterial] =
    useState<MaterialType>(primaryMaterial);
  const [editedCondition, setEditedCondition] =
    useState<WasteConditionState>(conditionState);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [declaredActionMessage, setDeclaredActionMessage] = useState<
    string | null
  >(null);

  const colorVisuals = {
    blanco: {
      badgeBg: "bg-white text-[#0E1227] border-white",
      cardBorder: "border-white/30",
      accentText: "text-white",
      shortTitle: "Recipiente o Bolsa BLANCA — Aprovechables",
    },
    verde: {
      badgeBg: "bg-[#22C55E] text-[#0E1227] border-[#22C55E]",
      cardBorder: "border-[#22C55E]/40",
      accentText: "text-[#22C55E]",
      shortTitle: "Recipiente o Bolsa VERDE — Orgánicos Aprovechables",
    },
    negro: {
      badgeBg: "bg-slate-900 text-white border-slate-600",
      cardBorder: "border-slate-500/40",
      accentText: "text-slate-200",
      shortTitle: "Recipiente o Bolsa NEGRA — No Aprovechables",
    },
    punto_posconsumo: {
      badgeBg: "bg-amber-500 text-[#0E1227] border-amber-400",
      cardBorder: "border-amber-500/40",
      accentText: "text-amber-400",
      shortTitle:
        "GESTIÓN DIFERENCIADA / PUNTO POSCONSUMO (No va en canecas domésticas)",
    },
    verificacion: {
      badgeBg: "bg-[#2DD4BF] text-[#0E1227] border-[#2DD4BF]",
      cardBorder: "border-[#2DD4BF]/40",
      accentText: "text-[#2DD4BF]",
      shortTitle: "SEPARACIÓN CONDICIONADA / REQUIERE VERIFICACIÓN DE ESTADO",
    },
  }[evaluation.containerColor];

  async function handleSaveToHistory() {
    await addScanRecord({
      wasteItemId: evaluation.matchedWasteItem?.id ?? null,
      identifiedObject: objectName,
      probableMaterial: primaryMaterial,
      secondaryMaterials,
      conditionState,
      resultCategory: evaluation.finalCategory,
      containerColor: evaluation.containerColor,
      confidenceLevel: typeof confidenceScore === "number" ? confidenceScore : 1,
      ruleAppliedId: evaluation.ruleId,
      recommendation: evaluation.recommendation,
      municipality,
    });
    setSavedToHistory(true);
  }

  async function handleDeclareUserAction(
    type:
      | "separacion_declarada"
      | "reutilizacion_declarada"
      | "entrega_posconsumo_declarada",
    label: string,
    points: number
  ) {
    await registerUserAction({
      wasteItemId: evaluation.matchedWasteItem?.id ?? null,
      actionType: type,
      verificationState: "declarada_usuario",
      description: `${label}: ${objectName} (${municipality})`,
      ecoPoints: points,
    });
    setDeclaredActionMessage(
      `Acción declarada registrada (+${points} EcoPuntos en estado 'Declarada por el usuario').`
    );
  }

  function handleApplyCorrection(e: React.FormEvent) {
    e.preventDefault();
    if (onRecalculate) {
      onRecalculate({
        objectName: editedName,
        primaryMaterial: editedMaterial,
        conditionState: editedCondition,
      });
    }
    setIsEditingIdentification(false);
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado de Identificación y Nivel de Certeza */}
      <div
        className={`rounded-2xl border ${colorVisuals.cardBorder} bg-[#131832] p-5 sm:p-6 shadow-xl`}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {imagePreviewUrl && (
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-[#0E1227]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviewUrl}
                  alt={`Vista previa de ${objectName}`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${colorVisuals.badgeBg}`}
                >
                  {colorVisuals.shortTitle}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                  Regla: {evaluation.ruleCode}
                </span>
                {typeof confidenceScore === "number" && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      confidenceScore >= 0.8
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : confidenceScore >= 0.65
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    Certeza visual: {Math.round(confidenceScore * 100)}%
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white">{objectName}</h2>

              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-lg bg-[#0E1227] px-2.5 py-1 border border-white/10">
                  <strong className="text-[#2DD4BF]">Material principal:</strong>{" "}
                  {MATERIAL_LABELS[primaryMaterial]}
                </span>
                <span className="rounded-lg bg-[#0E1227] px-2.5 py-1 border border-white/10">
                  <strong className="text-[#2DD4BF]">Estado evaluado:</strong>{" "}
                  {CONDITION_LABELS[conditionState]}
                </span>
                {secondaryMaterials.length > 0 && (
                  <span className="rounded-lg bg-[#0E1227] px-2.5 py-1 border border-white/10">
                    <strong className="text-slate-400">
                      Materiales secundarios:
                    </strong>{" "}
                    {secondaryMaterials.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {onRecalculate && (
            <button
              type="button"
              onClick={() => setIsEditingIdentification(!isEditingIdentification)}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-3.5 py-2 text-xs font-semibold text-[#2DD4BF] transition hover:bg-[#2DD4BF]/20"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>
                {isEditingIdentification
                  ? "Cerrar ajuste"
                  : "Corregir objeto o estado"}
              </span>
            </button>
          )}
        </div>

        {/* Formulario interactivo para corregir el resultado o cambiar condición del residuo */}
        {isEditingIdentification && onRecalculate && (
          <form
            onSubmit={handleApplyCorrection}
            className="mt-5 rounded-xl border border-[#2DD4BF]/30 bg-[#0E1227] p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
                Ajustar identificación o condición del residuo
              </h3>
              <span className="text-[11px] text-slate-400">
                El motor de reglas recalculará la ruta automáticamente
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-object-name"
                  className="block text-xs text-slate-300"
                >
                  Nombre del objeto
                </label>
                <input
                  id="edit-object-name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#131832] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-material"
                  className="block text-xs text-slate-300"
                >
                  Material principal
                </label>
                <select
                  id="edit-material"
                  value={editedMaterial}
                  onChange={(e) =>
                    setEditedMaterial(e.target.value as MaterialType)
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#131832] px-3 py-2 text-xs text-white"
                >
                  {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-condition"
                  className="block text-xs text-slate-300"
                >
                  Estado o condición real
                </label>
                <select
                  id="edit-condition"
                  value={editedCondition}
                  onChange={(e) =>
                    setEditedCondition(e.target.value as WasteConditionState)
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#131832] px-3 py-2 text-xs text-white"
                >
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#22C55E] px-4 py-2 text-xs font-semibold text-[#0E1227] hover:bg-[#10B981]"
              >
                Recalcular con reglas ambientales
              </button>
            </div>
          </form>
        )}

        {/* Aviso de incertidumbre y preguntas de seguimiento */}
        {(evaluation.uncertaintyNotice ||
          evaluation.clarificationQuestions.length > 0) && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-2 text-xs text-amber-100">
                {evaluation.uncertaintyNotice && (
                  <p className="font-medium">{evaluation.uncertaintyNotice}</p>
                )}
                {evaluation.clarificationQuestions.length > 0 && (
                  <div>
                    <p className="font-semibold text-amber-300">
                      Preguntas clave antes de separar este residuo:
                    </p>
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      {evaluation.clarificationQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Clasificación, Preparación y ¿Por qué? */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Columna izquierda: Clasificación y Preparación */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 sm:p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
              Ruta de Gestión Recomendada
            </span>
            <h3 className={`mt-1 text-lg font-bold ${colorVisuals.accentText}`}>
              {CATEGORY_LABELS[evaluation.finalCategory]}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {evaluation.recommendation}
            </p>
            <p className="mt-2 rounded-lg border border-white/10 bg-[#0E1227] p-2.5 text-[11px] text-slate-400">
              <strong className="text-slate-200">Nota importante:</strong> Las
              categorías de gestión (Aprovechables, Orgánicos, No aprovechables y
              Posconsumo) no son intercambiables. La efectividad real de la ruta
              depende de preparar el residuo y de las condiciones de recolección
              de {municipality}.
            </p>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span>Cómo preparar el residuo paso a paso</span>
            </h4>
            <ol className="mt-3 space-y-2">
              {evaluation.preparationSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#0E1227]/70 p-3 text-xs leading-relaxed text-slate-200"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[11px] font-bold text-[#22C55E]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Columna derecha: ¿Por qué?, Errores a evitar y Posconsumo si aplica */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 sm:p-6 space-y-5">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Info className="h-4 w-4 text-[#2DD4BF]" />
              <span>¿Por qué se clasifica así?</span>
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {evaluation.whyExplanation}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {evaluation.municipalityContext}
            </p>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>¿Qué errores debes evitar?</span>
            </h4>
            <ul className="mt-2.5 space-y-2">
              {evaluation.mistakesToAvoid.map((errItem, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-200"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{errItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {evaluation.specialManagementDetails && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Programa Posconsumo / Gestión Especial
                </span>
                <span className="text-[11px] text-amber-200">
                  {evaluation.specialManagementDetails.regulation}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                {evaluation.specialManagementDetails.programName}
              </p>
              <p className="text-xs text-amber-100">
                <strong>Receptor autorizado:</strong>{" "}
                {evaluation.specialManagementDetails.authorizedReceiver}
              </p>
              <p className="text-xs text-amber-200/90">
                <strong>Restricción:</strong>{" "}
                {evaluation.specialManagementDetails.restrictions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. ¿Qué puedes hacer antes de desecharlo? (Economía Circular) */}
      <div className="rounded-2xl border border-[#10B981]/30 bg-gradient-to-br from-[#131832] to-[#0E1227] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Recycle className="h-5 w-5 text-[#22C55E]" />
          <h3 className="text-base font-bold text-white">
            ¿Qué puedes hacer antes de desecharlo? (Economía Circular y Prevención)
          </h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {evaluation.circularAlternatives.map((alt, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#0E1227]/90 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-[#22C55E]">
                  {alt.type}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{alt.title}</h4>
              <p className="text-xs leading-relaxed text-slate-300">
                {alt.description}
              </p>
              <p className="text-[11px] text-amber-300/90">
                <strong>Criterio de seguridad e higiene:</strong>{" "}
                {alt.safetyNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Fuente verificada, fecha de revisión y Botones de acción funcional */}
      <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2DD4BF]">
              <FileCheck2 className="h-4 w-4" />
              <span>Fuente de referencia y vigencia normativa</span>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {evaluation.source.entityName} — {evaluation.source.resourceTitle}
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span>Ámbito: {evaluation.source.geographicScope}</span>
              <span>•</span>
              <span>Última revisión: {evaluation.reviewedAt}</span>
              <span>•</span>
              <span className="text-[#22C55E] font-medium">
                Estado: {evaluation.validationStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <a
            href={evaluation.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <span>Consultar fuente oficial</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mensajes de confirmación de acciones */}
        {savedToHistory && (
          <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-xs text-emerald-200">
            Consulta guardada en tu historial (registrada como{" "}
            <strong>Estado 1: Residuo consultado</strong>).
          </div>
        )}
        {declaredActionMessage && (
          <div className="rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-3 text-xs text-teal-200">
            {declaredActionMessage}
          </div>
        )}

        {/* Botonera funcional requerida en Sección 7 */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveToHistory}
            disabled={savedToHistory}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2.5 text-xs font-semibold text-[#0E1227] shadow-glow transition hover:opacity-95 disabled:opacity-60"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>
              {savedToHistory ? "Guardado en historial" : "Guardar en historial"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDeclareUserAction(
                evaluation.finalCategory === "posconsumo_especial"
                  ? "entrega_posconsumo_declarada"
                  : "separacion_declarada",
                evaluation.finalCategory === "posconsumo_especial"
                  ? "Alistamiento posconsumo declarado"
                  : "Separación en origen declarada",
                15
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/15 px-4 py-2.5 text-xs font-semibold text-[#22C55E] transition hover:bg-[#22C55E]/25"
          >
            <Sparkles className="h-4 w-4" />
            <span>Declarar que separé/reutilicé este residuo (+15 EcoPuntos)</span>
          </button>

          <Link
            href={`/puntos?category=${evaluation.finalCategory}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-4 py-2.5 text-xs font-semibold text-[#2DD4BF] transition hover:bg-[#2DD4BF]/20"
          >
            <MapPin className="h-4 w-4" />
            <span>Encontrar punto de recolección</span>
          </Link>

          <Link
            href="/explorador"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Consultar otros residuos</span>
          </Link>

          {evaluation.matchedWasteItem && (
            <Link
              href={`/explorador/${evaluation.matchedWasteItem.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Info className="h-4 w-4" />
              <span>Consultar ficha completa</span>
            </Link>
          )}

          {onResetScanner && (
            <button
              type="button"
              onClick={onResetScanner}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <span>Analizar otro objeto</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              openReportModal({
                wasteItemId: evaluation.matchedWasteItem?.id ?? null,
                contextLabel: `Reporte sobre resultado de: ${objectName} (Regla ${evaluation.ruleCode})`,
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Reportar un error</span>
          </button>
        </div>
      </div>
    </div>
  );
}
