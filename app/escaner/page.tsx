"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImagePlus,
  Info,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { VERIFIED_WASTE_ITEMS } from "@/lib/data/verified-environmental-data";
import { evaluateWasteClassification } from "@/services/classification-engine";
import {
  CONDITION_LABELS,
  MATERIAL_LABELS,
} from "@/services/waste-catalog-service";
import {
  AIVisionAnalysisResult,
  MaterialType,
  RuleEngineEvaluationResult,
  WasteConditionState,
} from "@/types/ecoscan";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { ClassificationResultCard } from "@/components/waste/classification-result-card";

export default function ScannerPage() {
  const { municipality } = useEcoScan();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [aiStatus, setAiStatus] = useState<{
    checked: boolean;
    configured: boolean;
  }>({ checked: false, configured: false });

  // Estado de imagen cargada
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [userHint, setUserHint] = useState("");

  // Estado de procesamiento y errores
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resultados
  const [visionResult, setVisionResult] =
    useState<AIVisionAnalysisResult | null>(null);
  const [ruleResult, setRuleResult] =
    useState<RuleEngineEvaluationResult | null>(null);
  const [activeInputState, setActiveInputState] = useState<{
    objectName: string;
    primaryMaterial: MaterialType;
    secondaryMaterials: string[];
    conditionState: WasteConditionState;
    confidenceScore?: number;
  } | null>(null);

  // Estado del clasificador asistido por texto/reglas (alternativa siempre disponible)
  const [manualQuery, setManualQuery] = useState("");
  const [manualMaterial, setManualMaterial] =
    useState<MaterialType>("plastico_pet");
  const [manualCondition, setManualCondition] =
    useState<WasteConditionState>("limpio_seco");

  useEffect(() => {
    fetch("/api/scanner")
      .then((r) => r.json())
      .then((data) => {
        setAiStatus({
          checked: true,
          configured: Boolean(data.aiConfigured),
        });
      })
      .catch(() => {
        setAiStatus({ checked: true, configured: false });
      });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage(
        "Formato de archivo no válido. Selecciona una imagen JPEG, PNG o WebP."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "La imagen supera el tamaño máximo de 5 MB. Por favor elige una imagen más liviana."
      );
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageBase64(null);
    setVisionResult(null);
    setRuleResult(null);
    setActiveInputState(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function handleAnalyzeImage() {
    if (!imageBase64 || !selectedFile) {
      setErrorMessage("Primero selecciona o toma una fotografía del residuo.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: selectedFile.type,
          municipality,
          userHint: userHint.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "No fue posible analizar la imagen. Utiliza el clasificador por texto abajo."
        );
        setIsAnalyzing(false);
        return;
      }

      const ai = data.visionAnalysis as AIVisionAnalysisResult;
      const classification = data.classification as RuleEngineEvaluationResult;

      setVisionResult(ai);
      setRuleResult(classification);
      setActiveInputState({
        objectName: ai.probableObjectName,
        primaryMaterial: ai.primaryMaterial,
        secondaryMaterials: ai.secondaryMaterials,
        conditionState: ai.detectedCondition,
        confidenceScore: ai.confidenceScore,
      });
    } catch {
      setErrorMessage(
        "Error de red al conectar con el servidor de análisis. Puedes usar el clasificador manual por reglas inmediatamente."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleManualRuleClassify(e: React.FormEvent) {
    e.preventDefault();
    const nameToUse =
      manualQuery.trim() || MATERIAL_LABELS[manualMaterial] || "Residuo consultado";

    const evaluation = evaluateWasteClassification({
      objectName: nameToUse,
      primaryMaterial: manualMaterial,
      conditionState: manualCondition,
      municipality,
    });

    setVisionResult(null);
    setRuleResult(evaluation);
    setActiveInputState({
      objectName: evaluation.matchedWasteItem?.name || nameToUse,
      primaryMaterial: manualMaterial,
      secondaryMaterials:
        evaluation.matchedWasteItem?.secondaryMaterials || [],
      conditionState: manualCondition,
    });
  }

  function handleQuickSelectCatalogItem(itemId: string) {
    const item = VERIFIED_WASTE_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    const evaluation = evaluateWasteClassification({
      objectName: item.name,
      primaryMaterial: item.primaryMaterial,
      secondaryMaterials: item.secondaryMaterials,
      conditionState: item.defaultCondition,
      requiresSpecialManagement: item.requiresSpecialManagement,
      municipality,
      matchedWasteItemId: item.id,
    });

    setManualQuery(item.name);
    setManualMaterial(item.primaryMaterial);
    setManualCondition(item.defaultCondition);
    setVisionResult(null);
    setRuleResult(evaluation);
    setActiveInputState({
      objectName: item.name,
      primaryMaterial: item.primaryMaterial,
      secondaryMaterials: item.secondaryMaterials,
      conditionState: item.defaultCondition,
    });
  }

  function handleRecalculateFromCard(updated: {
    objectName: string;
    primaryMaterial: MaterialType;
    conditionState: WasteConditionState;
  }) {
    const evaluation = evaluateWasteClassification({
      objectName: updated.objectName,
      primaryMaterial: updated.primaryMaterial,
      conditionState: updated.conditionState,
      municipality,
    });

    setRuleResult(evaluation);
    setActiveInputState((prev) => ({
      objectName: updated.objectName,
      primaryMaterial: updated.primaryMaterial,
      secondaryMaterials: prev?.secondaryMaterials || [],
      conditionState: updated.conditionState,
      confidenceScore: prev?.confidenceScore,
    }));
  }

  return (
    <div className="space-y-8">
      {/* Encabezado de la sección */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
            <Camera className="h-4 w-4" />
            Identificación + Motor de Reglas Normativas
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Escáner Inteligente de Residuos
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300">
            Toma o sube una fotografía para identificar el material y su estado,
            o utiliza el clasificador asistido por texto. La ruta final siempre
            se contrasta con las reglas ambientales de Colombia ({municipality}).
          </p>
        </div>

        {/* Estado transparente de configuración de IA */}
        {aiStatus.checked && (
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium ${
              aiStatus.configured
                ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            {aiStatus.configured ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Visión IA Gemini activa</span>
              </>
            ) : (
              <>
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Reconocimiento por imagen sin clave API — Clasificador por
                  texto activo
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Aviso explícito si falta GEMINI_API_KEY (Nunca simula IA) */}
      {aiStatus.checked && !aiStatus.configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                El reconocimiento por imágenes no está configurado en este
                entorno (`GEMINI_API_KEY` no detectada en el servidor).
              </p>
              <p className="text-amber-100/90">
                Siguiendo nuestros principios de transparencia, EcoScan no
                simula respuestas de inteligencia artificial. Puedes usar ahora
                mismo el{" "}
                <strong>Clasificador Asistido por Texto y Estado</strong> (a la
                derecha) o consultar cualquier ficha del catálogo verificado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Panel dual: 1. Captura de Imagen IA | 2. Clasificador Asistido por Texto y Estado */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Columna 1: Captura y previsualización de fotografía */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#22C55E]" />
                <span>Opción A: Analizar fotografía</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                JPEG, PNG o WebP (máx. 5 MB)
              </span>
            </div>

            {/* Inputs ocultos para cámara móvil y galería */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#0E1227]/70 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/15 text-[#22C55E]">
                  <Camera className="h-7 w-7" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  Captura o selecciona una imagen del residuo
                </p>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Enfoca el objeto y, si es un envase, procura que sea visible
                  su estado de limpieza o etiqueta. Las fotos no se almacenan
                  permanentemente sin tu consentimiento.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2.5 text-xs font-bold text-[#0E1227] shadow-glow hover:opacity-95"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Tomar fotografía</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <ImagePlus className="h-4 w-4 text-[#2DD4BF]" />
                    <span>Cargar desde dispositivo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0E1227]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Previsualización del residuo a clasificar"
                    className="max-h-64 w-full object-contain"
                  />
                  <div className="flex items-center justify-between border-t border-white/10 bg-[#131832]/90 px-4 py-2.5">
                    <span className="truncate text-xs text-slate-300">
                      {selectedFile?.name} (
                      {Math.round((selectedFile?.size || 0) / 1024)} KB)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Reemplazar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="scanner-user-hint"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Contexto opcional (ej. &quot;Tiene restos de aceite&quot; o
                    &quot;Es un frasco de medicamento&quot;)
                  </label>
                  <input
                    id="scanner-user-hint"
                    type="text"
                    value={userHint}
                    onChange={(e) => setUserHint(e.target.value)}
                    placeholder="Añade un detalle si no se aprecia en la foto..."
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#2DD4BF] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-5 py-3 text-sm font-bold text-[#0E1227] shadow-glow transition hover:opacity-95 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analizando imagen y contrastando reglas...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Analizar residuo con IA</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">{errorMessage}</p>
                  <p className="text-red-300/80">
                    Puedes clasificar el residuo inmediatamente en el panel de
                    búsqueda y reglas de al lado.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 border-t border-white/10 pt-3">
            Nota técnica: Una fotografía no siempre permite determinar la
            resina exacta de un polímero ni la ausencia de contaminantes
            químicos. La decisión final siempre pasa por el motor de reglas.
          </p>
        </div>

        {/* Columna 2: Clasificador Asistido por Texto, Material y Estado */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#2DD4BF]" />
                <span>Opción B: Clasificador por texto y estado</span>
              </h2>
              <span className="rounded-md bg-[#2DD4BF]/10 px-2 py-0.5 text-[11px] font-medium text-[#2DD4BF]">
                100% Operativo sin cámara
              </span>
            </div>

            <form onSubmit={handleManualRuleClassify} className="space-y-3.5">
              <div>
                <label
                  htmlFor="manual-waste-name"
                  className="block text-xs font-medium text-slate-300"
                >
                  Nombre del residuo u objeto
                </label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="manual-waste-name"
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="Ej. Caja de pizza, botella PET, pila AA, medicamento vencido..."
                    className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#2DD4BF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="manual-material-select"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Material principal
                  </label>
                  <select
                    id="manual-material-select"
                    value={manualMaterial}
                    onChange={(e) =>
                      setManualMaterial(e.target.value as MaterialType)
                    }
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs text-white focus:border-[#2DD4BF] focus:outline-none"
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
                    htmlFor="manual-condition-select"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Estado o condición del residuo
                  </label>
                  <select
                    id="manual-condition-select"
                    value={manualCondition}
                    onChange={(e) =>
                      setManualCondition(e.target.value as WasteConditionState)
                    }
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2.5 text-xs text-white focus:border-[#2DD4BF] focus:outline-none"
                  >
                    {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-4 py-2.5 text-xs font-bold text-[#2DD4BF] transition hover:bg-[#2DD4BF]/25"
              >
                <Sparkles className="h-4 w-4" />
                <span>Evaluar con motor de reglas ambientales</span>
              </button>
            </form>

            {/* Botones rápidos de prueba con objetos cotidianos */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                O selecciona un residuo frecuente para simular su evaluación:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {VERIFIED_WASTE_ITEMS.slice(0, 9).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQuickSelectCatalogItem(item.id)}
                    className="rounded-lg border border-white/10 bg-[#0E1227] px-2.5 py-1.5 text-[11px] text-slate-300 transition hover:border-[#22C55E]/40 hover:text-white"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-slate-400">
              ¿Prefieres explorar todo el catálogo con filtros?
            </span>
            <Link
              href="/explorador"
              className="font-semibold text-[#22C55E] hover:underline"
            >
              Abrir Explorador →
            </Link>
          </div>
        </div>
      </div>

      {/* RESULTADO DEL ESCANEO / EVALUACIÓN: FICHA COMPLETA (Sección 7) */}
      {ruleResult && activeInputState && (
        <section id="resultado-escaneo" className="pt-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                Ficha de Diagnóstico Ambiental
              </span>
              <h2 className="text-xl font-bold text-white">
                Resultado de Clasificación y Ruta de Gestión
              </h2>
            </div>
            {visionResult && (
              <span className="rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3 py-1 text-xs text-[#2DD4BF]">
                Observación IA: {visionResult.visualObservations}
              </span>
            )}
          </div>

          <ClassificationResultCard
            objectName={activeInputState.objectName}
            primaryMaterial={activeInputState.primaryMaterial}
            secondaryMaterials={activeInputState.secondaryMaterials}
            conditionState={activeInputState.conditionState}
            confidenceScore={activeInputState.confidenceScore}
            imagePreviewUrl={previewUrl}
            evaluation={ruleResult}
            onRecalculate={handleRecalculateFromCard}
            onResetScanner={handleClearImage}
          />
        </section>
      )}
    </div>
  );
}
