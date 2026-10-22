"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Info,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { VERIFIED_CHALLENGES } from "@/lib/data/verified-environmental-data";
import { CATEGORY_LABELS } from "@/services/waste-catalog-service";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { WasteManagementCategory } from "@/types/ecoscan";

export default function MyImpactPage() {
  const {
    scanHistory,
    userActions,
    registerUserAction,
    municipality,
    userProfile,
  } = useEcoScan();

  const [newActionType, setNewActionType] = useState<
    | "separacion_declarada"
    | "reutilizacion_declarada"
    | "entrega_posconsumo_declarada"
  >("separacion_declarada");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Tres niveles estrictamente diferenciados (Sección 14)
  const tier1Consultations = useMemo(
    () =>
      userActions.filter(
        (a) => a.verificationState === "consulta_informativa"
      ),
    [userActions]
  );

  const tier2DeclaredActions = useMemo(
    () =>
      userActions.filter((a) => a.verificationState === "declarada_usuario"),
    [userActions]
  );

  const tier3VerifiedActions = useMemo(
    () =>
      userActions.filter((a) => a.verificationState === "verificada_entidad"),
    [userActions]
  );

  const totalEcoPoints = useMemo(
    () => userActions.reduce((sum, a) => sum + a.ecoPoints, 0),
    [userActions]
  );

  // Categorías más frecuentes en el historial
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rec of scanHistory) {
      counts[rec.resultCategory] = (counts[rec.resultCategory] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scanHistory]);

  // Cálculo de progreso real en retos
  const challengesWithProgress = useMemo(() => {
    return VERIFIED_CHALLENGES.map((chal) => {
      let current = 0;
      if (chal.id === "chal-5-consultas") {
        current = scanHistory.length;
      } else if (chal.id === "chal-ruta-pila") {
        const consultedPila = scanHistory.some(
          (s) =>
            s.wasteItemId === "item-pilas" ||
            s.identifiedObject.toLowerCase().includes("pila")
        );
        current = consultedPila ? 1 : 0;
      } else if (chal.id === "chal-evitar-desechable") {
        current = tier2DeclaredActions.filter(
          (a) => a.actionType === "reutilizacion_declarada"
        ).length;
      } else if (chal.id === "chal-reparar-objeto") {
        current = tier2DeclaredActions.filter(
          (a) => a.actionType === "reutilizacion_declarada"
        ).length;
      } else if (chal.id === "chal-ruta-local") {
        current =
          tier2DeclaredActions.length > 0 || scanHistory.length > 0 ? 1 : 0;
      }

      const progress = Math.min(chal.targetCount, current);
      const completed = progress >= chal.targetCount;
      return {
        ...chal,
        progress,
        completed,
      };
    });
  }, [scanHistory, tier2DeclaredActions]);

  async function handleAddDeclaredAction(e: React.FormEvent) {
    e.preventDefault();
    if (newActionDesc.trim().length < 5) return;

    const points =
      newActionType === "entrega_posconsumo_declarada"
        ? 25
        : newActionType === "reutilizacion_declarada"
        ? 20
        : 15;

    await registerUserAction({
      actionType: newActionType,
      verificationState: "declarada_usuario",
      description: `${newActionDesc.trim()} (${municipality})`,
      ecoPoints: points,
    });

    setNewActionDesc("");
    setActionFeedback(
      `Acción registrada en Nivel 2 (Declarada por el usuario) • +${points} EcoPuntos.`
    );
  }

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
            <Trophy className="h-4 w-4" />
            Seguimiento de Hábitos sin Cifras Inventadas
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Mi Impacto, Retos y EcoPuntos
          </h1>
          <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-300">
            EcoScan distingue rigurosamente entre una consulta informativa, una
            acción declarada por ti y una entrega verificada por un gestor. No
            presentamos una simple consulta como si fueran kilos reciclados.
          </p>
        </div>

        <div className="rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/15 px-5 py-3 text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#22C55E]">
            Total Acumulado
          </span>
          <span className="text-2xl font-extrabold text-white">
            {totalEcoPoints} EcoPuntos
          </span>
        </div>
      </div>

      {/* Los 3 Estados de Trazabilidad (Sección 14) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-200">
              ESTADO 1 • Informativo
            </span>
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {Math.max(scanHistory.length, tier1Consultations.length)}
          </p>
          <h2 className="text-sm font-bold text-white">
            Residuos consultados
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Búsquedas o escaneos realizados para aprender cómo preparar y
            clasificar un residuo (+5 EcoPuntos por consulta).
          </p>
        </div>

        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#131832] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#22C55E]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#22C55E]">
              ESTADO 2 • Autodeclarado
            </span>
            <ClipboardCheck className="h-4 w-4 text-[#22C55E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#22C55E]">
            {tier2DeclaredActions.length}
          </p>
          <h2 className="text-sm font-bold text-white">
            Acciones declaradas por el usuario
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Separaciones en origen, reparaciones o reutilizaciones que declaras
            haber completado (+15 a +25 EcoPuntos).
          </p>
        </div>

        <div className="rounded-2xl border border-[#2DD4BF]/30 bg-[#131832] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#2DD4BF]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#2DD4BF]">
              ESTADO 3 • Verificado
            </span>
            <ShieldCheck className="h-4 w-4 text-[#2DD4BF]" />
          </div>
          <p className="text-3xl font-extrabold text-[#2DD4BF]">
            {tier3VerifiedActions.length}
          </p>
          <h2 className="text-sm font-bold text-white">
            Entregas verificadas por entidad
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acciones validadas mediante convenio, jornada ambiental o sello de
            un gestor autorizado en {municipality}.
          </p>
        </div>
      </div>

      {/* Retos de Hábitos Sostenibles y Registro de Acciones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Retos */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#22C55E]" />
              <h2 className="text-lg font-bold text-white">
                Retos de Hábitos Reales
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {challengesWithProgress.filter((c) => c.completed).length} de{" "}
              {challengesWithProgress.length} completados
            </span>
          </div>

          <div className="space-y-3">
            {challengesWithProgress.map((chal) => {
              const pct = Math.round((chal.progress / chal.targetCount) * 100);
              return (
                <div
                  key={chal.id}
                  className={`rounded-xl border p-4 space-y-2.5 ${
                    chal.completed
                      ? "border-[#22C55E]/40 bg-[#22C55E]/10"
                      : "border-white/10 bg-[#0E1227]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {chal.completed && (
                          <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                        )}
                        <span>{chal.title}</span>
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {chal.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-[#2DD4BF]">
                      +{chal.ecoPointsReward} pts
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{chal.criteriaDescription}</span>
                      <span>
                        {chal.progress} / {chal.targetCount} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#22C55E] to-[#2DD4BF] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registrar acción declarada y Categorías frecuentes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#2DD4BF]" />
              <span>Registrar acción sostenible (Estado 2)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Registra una acción real que hayas realizado hoy en casa o en la
              universidad. Tu progreso es privado por defecto.
            </p>

            <form onSubmit={handleAddDeclaredAction} className="space-y-3">
              <div>
                <label
                  htmlFor="impact-action-type"
                  className="block text-xs font-medium text-slate-300"
                >
                  Tipo de acción realizada
                </label>
                <select
                  id="impact-action-type"
                  value={newActionType}
                  onChange={(e) =>
                    setNewActionType(e.target.value as typeof newActionType)
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2 text-xs text-white"
                >
                  <option value="separacion_declarada">
                    Separación limpia y seca en fuente (+15 EcoPuntos)
                  </option>
                  <option value="reutilizacion_declarada">
                    Prevención, reparación o reutilización segura (+20 EcoPuntos)
                  </option>
                  <option value="entrega_posconsumo_declarada">
                    Entrega en contenedor posconsumo (+25 EcoPuntos)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="impact-action-desc"
                  className="block text-xs font-medium text-slate-300"
                >
                  ¿Qué hiciste exactamente?
                </label>
                <input
                  id="impact-action-desc"
                  type="text"
                  required
                  minLength={5}
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="Ej. Llevé pilas agotadas al contenedor posconsumo..."
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2.5 text-xs font-bold text-[#0E1227] shadow-glow"
              >
                Registrar acción declarada
              </button>
            </form>

            {actionFeedback && (
              <p className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-xs text-emerald-200">
                {actionFeedback}
              </p>
            )}
          </div>

          {/* Categorías más frecuentes y recomendaciones personalizadas */}
          <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#22C55E]" />
              <span>Categorías más consultadas y recomendaciones</span>
            </h2>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400">
                Realiza consultas en el escáner o explorador para ver la
                distribución de tus categorías más frecuentes y recibir
                recomendaciones personalizadas.
              </p>
            ) : (
              <div className="space-y-2">
                {categoryBreakdown.map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0E1227] px-3.5 py-2 text-xs"
                  >
                    <span className="text-slate-200">
                      {CATEGORY_LABELS[cat as WasteManagementCategory] || cat}
                    </span>
                    <span className="font-bold text-[#2DD4BF]">
                      {count} consulta(s)
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-[#0E1227]/70 p-3 text-[11px] text-slate-400">
              <strong className="text-slate-200">
                Nota metodológica sobre indicadores:
              </strong>{" "}
              EcoScan no calcula ni inventa kilogramos de residuos, litros de
              agua ni emisiones de CO₂ evitadas a partir de consultas digitales,
              ya que la reducción real de huella depende del pesaje efectivo en
              Estaciones de Clasificación y Aprovechamiento (ECA).
            </div>

            {!userProfile && (
              <Link
                href="/perfil"
                className="block text-center text-xs font-semibold text-[#2DD4BF] hover:underline pt-1"
              >
                Inicia sesión para respaldar tu progreso en tu cuenta →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
