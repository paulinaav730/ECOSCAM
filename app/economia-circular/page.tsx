"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Recycle,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { VERIFIED_WASTE_ITEMS } from "@/lib/data/verified-environmental-data";
import { useEcoScan } from "@/components/providers/ecoscan-provider";

export default function CircularEconomyPage() {
  const { registerUserAction, municipality } = useEcoScan();
  const [selectedItemSlug, setSelectedItemSlug] = useState<string>(
    VERIFIED_WASTE_ITEMS[0].slug
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const selectedItem =
    VERIFIED_WASTE_ITEMS.find((i) => i.slug === selectedItemSlug) ??
    VERIFIED_WASTE_ITEMS[0];

  async function handleDeclareCircularHabit(title: string) {
    await registerUserAction({
      wasteItemId: selectedItem.id,
      actionType: "reutilizacion_declarada",
      verificationState: "declarada_usuario",
      description: `Práctica de economía circular declarada: ${title} (${selectedItem.name} en ${municipality})`,
      ecoPoints: 20,
    });
    setFeedbackMsg(
      `¡Excelente hábito! Se registró '${title}' como acción declarada por el usuario (+20 EcoPuntos).`
    );
  }

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
          <Recycle className="h-4 w-4" />
          Prevención en Origen Antes de la Disposición Final
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Reutilización Segura y Economía Circular
        </h1>
        <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-300">
          El reciclaje no es el primer paso: antes de desechar un objeto, evalúa
          si es posible reducir su consumo, repararlo, reutilizarlo de manera
          higiénica y segura, donarlo o compostarlo.
        </p>
      </div>

      {/* Selector de objeto para consultar sus rutas de economía circular */}
      <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Consulta qué hacer con un objeto antes de desecharlo
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona un residuo del catálogo para ver sus alternativas
              seguras y restricciones sanitarias:
            </p>
          </div>

          <select
            value={selectedItemSlug}
            onChange={(e) => {
              setSelectedItemSlug(e.target.value);
              setFeedbackMsg(null);
            }}
            aria-label="Seleccionar objeto para alternativas de economía circular"
            className="rounded-xl border border-[#2DD4BF]/40 bg-[#0E1227] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none"
          >
            {VERIFIED_WASTE_ITEMS.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {feedbackMsg && (
          <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3.5 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {selectedItem.circularAlternatives.map((alt, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0E1227] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <span className="inline-block rounded-lg bg-[#22C55E]/15 px-2.5 py-1 text-[11px] font-bold uppercase text-[#22C55E]">
                  Estrategia: {alt.type}
                </span>
                <h3 className="text-base font-bold text-white">{alt.title}</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  {alt.description}
                </p>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <strong className="text-amber-300">
                    Criterio de higiene y seguridad:
                  </strong>{" "}
                  {alt.safetyNote}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => handleDeclareCircularHabit(alt.title)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-3.5 py-2 text-xs font-bold text-[#0E1227]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Declarar que apliqué esta alternativa (+20 pts)</span>
                </button>
                <Link
                  href={`/explorador/${selectedItem.slug}`}
                  className="text-xs font-semibold text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
                >
                  <span>Ver ficha</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reglas de seguridad para la reutilización responsable */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#131832] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#22C55E] font-bold text-base">
            <Wrench className="h-5 w-5" />
            <h3>Prácticas seguras recomendadas</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
              <span>
                <strong>Frascos de vidrio de alimentos:</strong> Excelentes para
                conservar granos secos o especias tras lavarlos y esterilizarlos
                con agua caliente, verificando que no tengan fisuras en el
                borde.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
              <span>
                <strong>Reparación de aparatos (RAEE) y prendas:</strong>{" "}
                Acudir a servicio técnico calificado para reemplazar baterías o
                conectores evita descartar equipos completos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
              <span>
                <strong>Envases retornables:</strong> Utilizar botellas de
                vidrio retornables reduce la huella energética de fundir nuevos
                envases en cada compra.
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-[#131832] p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-base">
            <ShieldAlert className="h-5 w-5" />
            <h3>Lo que NUNCA debes reutilizar (Riesgos sanitarios y químicos)</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>
                <strong>Envases de plaguicidas, solventes o pinturas:</strong>{" "}
                Jamás los reutilices para guardar agua, bebidas, alimentos ni
                jabones caseros. Las paredes plásticas absorben compuestos
                tóxicos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>
                <strong>Envases de medicamentos vencidos:</strong> No deben
                reutilizarse en el hogar; deben inutilizarse y entregarse en
                contenedores Punto Azul.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>
                <strong>Botellas PET de un solo uso con líquidos calientes:</strong>{" "}
                Están diseñadas para un único ciclo en frío; el calor o el
                desgaste mecánico repetido favorece la migración de antimonio y
                el crecimiento bacteriano en microfisuras.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
