"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, SlidersHorizontal } from "lucide-react";
import {
  CONDITION_LABELS,
  getWasteItemBySlugOrId,
} from "@/services/waste-catalog-service";
import { evaluateWasteClassification } from "@/services/classification-engine";
import { MaterialType, WasteConditionState } from "@/types/ecoscan";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { ClassificationResultCard } from "@/components/waste/classification-result-card";

export default function WasteItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { municipality } = useEcoScan();
  const item = getWasteItemBySlugOrId(slug);

  const [simulatedCondition, setSimulatedCondition] =
    useState<WasteConditionState>(item?.defaultCondition ?? "limpio_seco");
  const [simulatedMaterial, setSimulatedMaterial] = useState<MaterialType>(
    item?.primaryMaterial ?? "plastico_pet"
  );
  const [simulatedName, setSimulatedName] = useState<string>(
    item?.name ?? "Residuo"
  );

  if (!item) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#131832] p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">
          No encontramos la ficha solicitada
        </h1>
        <p className="text-xs text-slate-400">
          Es posible que el enlace haya cambiado. Consulta el catálogo completo
          de residuos.
        </p>
        <Link
          href="/explorador"
          className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0E1227]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Explorador</span>
        </Link>
      </div>
    );
  }

  const evaluation = evaluateWasteClassification({
    objectName: simulatedName,
    primaryMaterial: simulatedMaterial,
    secondaryMaterials: item.secondaryMaterials,
    conditionState: simulatedCondition,
    requiresSpecialManagement:
      item.requiresSpecialManagement &&
      simulatedMaterial === item.primaryMaterial,
    municipality,
    matchedWasteItemId: item.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/explorador"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al catálogo de residuos</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers className="h-4 w-4 text-[#2DD4BF]" />
          <span>Sinónimos reconocidos: {item.synonyms.join(", ")}</span>
        </div>
      </div>

      {/* Simulador interactivo de condición del residuo */}
      <div className="rounded-2xl border border-[#2DD4BF]/30 bg-[#131832] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2DD4BF]">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Simulador de condición en tiempo real
            </span>
            <p className="text-xs text-slate-300">
              La ruta de un residuo cambia según su estado. Prueba cambiar la
              condición (ej. limpio y seco vs. engrasado o con químicos) para
              ver cómo responde el motor de reglas:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="detail-condition-sim" className="sr-only">
              Cambiar estado del residuo
            </label>
            <select
              id="detail-condition-sim"
              value={simulatedCondition}
              onChange={(e) =>
                setSimulatedCondition(e.target.value as WasteConditionState)
              }
              className="rounded-xl border border-[#2DD4BF]/40 bg-[#0E1227] px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  Estado: {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ClassificationResultCard
        objectName={simulatedName}
        primaryMaterial={simulatedMaterial}
        secondaryMaterials={item.secondaryMaterials}
        conditionState={simulatedCondition}
        evaluation={evaluation}
        onRecalculate={(updated) => {
          setSimulatedName(updated.objectName);
          setSimulatedMaterial(updated.primaryMaterial);
          setSimulatedCondition(updated.conditionState);
        }}
      />
    </div>
  );
}
