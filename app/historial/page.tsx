"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ClipboardList,
  History,
  Trash2,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  MATERIAL_LABELS,
} from "@/services/waste-catalog-service";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { WasteManagementCategory } from "@/types/ecoscan";

export default function HistoryPage() {
  const { scanHistory, userActions, clearLocalHistory, userProfile } =
    useEcoScan();
  const [activeTab, setActiveTab] = useState<"escaneos" | "acciones">(
    "escaneos"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
            <History className="h-4 w-4" />
            Registro Personal de Consultas y Acciones
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Historial de EcoScan
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300">
            Revisa los residuos que has analizado o consultado y las acciones
            sostenibles declaradas.{" "}
            {userProfile
              ? `Sincronizado con tu cuenta (${userProfile.email}).`
              : "Guardado en tu sesión actual (inicia sesión en Perfil para sincronizar entre dispositivos)."}
          </p>
        </div>

        {scanHistory.length > 0 && (
          <button
            type="button"
            onClick={clearLocalHistory}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Limpiar historial de consultas</span>
          </button>
        )}
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("escaneos")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "escaneos"
              ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227]"
              : "border border-white/10 bg-[#131832] text-slate-300"
          }`}
        >
          Consultas y Escaneos ({scanHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("acciones")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "acciones"
              ? "bg-gradient-to-r from-[#2DD4BF] to-[#10B981] text-[#0E1227]"
              : "border border-white/10 bg-[#131832] text-slate-300"
          }`}
        >
          Registro de Acciones por Estado ({userActions.length})
        </button>
      </div>

      {activeTab === "escaneos" ? (
        scanHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#131832]/60 p-10 text-center space-y-4">
            <Camera className="mx-auto h-8 w-8 text-[#2DD4BF]" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                Tu historial de consultas está vacío
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Cuando analices un residuo en el escáner o guardes una ficha de
                clasificación, aparecerá aquí con su regla aplicable y
                recomendación.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Link
                href="/escaner"
                className="rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0E1227]"
              >
                Ir al Escáner
              </Link>
              <Link
                href="/explorador"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {scanHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#131832] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#22C55E]">
                      {CATEGORY_LABELS[
                        item.resultCategory as WasteManagementCategory
                      ] || item.resultCategory}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString("es-CO")} •{" "}
                      {item.municipality}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {item.identifiedObject}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {item.recommendation}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                    <span>
                      Material:{" "}
                      {MATERIAL_LABELS[item.probableMaterial] ||
                        item.probableMaterial}
                    </span>
                    <span>•</span>
                    <span>
                      Estado:{" "}
                      {CONDITION_LABELS[item.conditionState] ||
                        item.conditionState}
                    </span>
                  </div>
                </div>

                <Link
                  href="/explorador"
                  className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-[#2DD4BF] hover:bg-white/10"
                >
                  <span>Consultar catálogo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )
      ) : userActions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#131832]/60 p-10 text-center space-y-3">
          <ClipboardList className="mx-auto h-8 w-8 text-[#22C55E]" />
          <p className="text-xs text-slate-300">
            Aún no tienes acciones registradas. Puedes declarar tus acciones de
            separación o reutilización en la sección Mi Impacto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userActions.map((act) => (
            <div
              key={act.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      act.verificationState === "verificada_entidad"
                        ? "bg-[#2DD4BF]/20 text-[#2DD4BF]"
                        : act.verificationState === "declarada_usuario"
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {act.verificationState === "verificada_entidad"
                      ? "Estado 3: Verificada"
                      : act.verificationState === "declarada_usuario"
                      ? "Estado 2: Declarada por usuario"
                      : "Estado 1: Consulta informativa"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(act.createdAt).toLocaleString("es-CO")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-white">
                  {act.description}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-[#0E1227] px-3 py-1.5 text-xs font-bold text-[#22C55E] border border-white/10">
                +{act.ecoPoints} EcoPuntos
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
