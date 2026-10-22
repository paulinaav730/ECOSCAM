"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  VERIFIED_CLASSIFICATION_RULES,
  VERIFIED_COLLECTION_POINTS,
  VERIFIED_EDUCATIONAL_ARTICLES,
  VERIFIED_SOURCES,
  VERIFIED_WASTE_ITEMS,
} from "@/lib/data/verified-environmental-data";
import { CATEGORY_LABELS, MATERIAL_LABELS } from "@/services/waste-catalog-service";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { ValidationStatus, WasteItem } from "@/types/ecoscan";

export default function AdminPanelPage() {
  const { userProfile, scanHistory, userActions } = useEcoScan();
  const [activeTab, setActiveTab] = useState<
    "fichas" | "reglas" | "puntos" | "fuentes" | "reportes"
  >("fichas");

  const [catalogItems, setCatalogItems] =
    useState<WasteItem[]>(VERIFIED_WASTE_ITEMS);
  const [serverResponse, setServerResponse] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const isAdmin = userProfile?.role === "admin";

  async function handleStatusChange(
    item: WasteItem,
    newStatus: ValidationStatus
  ) {
    setServerResponse(null);

    // Verificar autorización real en el servidor (/api/admin comprueba sesión y rol en BD)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          description: item.description,
          mainCategory: item.mainCategory,
          primaryMaterial: item.primaryMaterial,
          defaultCondition: item.defaultCondition,
          requiresSpecialManagement: item.requiresSpecialManagement,
          publicationStatus: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerResponse({
          ok: false,
          message:
            data.error ||
            "Operación bloqueada por el servidor: se requiere rol 'admin' autenticado en Supabase.",
        });
        return;
      }

      setCatalogItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, publicationStatus: newStatus } : i
        )
      );
      setServerResponse({
        ok: true,
        message: data.message,
      });
    } catch {
      setServerResponse({
        ok: false,
        message: "Error de conexión al verificar permisos en el servidor.",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Encabezado y estado de autorización de servidor */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
            <ShieldCheck className="h-4 w-4" />
            Gobernanza Ambiental y Verificación de Fuentes
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Panel de Administración de EcoScan
          </h1>
          <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-300">
            Gestión de fichas de residuos, reglas determinísticas de
            clasificación, fuentes normativas, puntos de recolección y reportes
            ciudadanos.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
            isAdmin
              ? "border-[#22C55E]/40 bg-[#22C55E]/15 text-[#22C55E]"
              : "border-amber-500/40 bg-amber-500/15 text-amber-300"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>
            {isAdmin
              ? "Rol Administrador Verificado"
              : "Vista de Auditoría (Escritura protegida en servidor / RLS)"}
          </span>
        </div>
      </div>

      {/* Aviso de seguridad de roles (Sección 16) */}
      {!isAdmin && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Protección de Servidor y Row Level Security (RLS) Activa
            </p>
            <p>
              Por seguridad, EcoScan no incluye cuentas de administrador con
              contraseñas predecibles ni permite escalar privilegios desde el
              frontend. Todas las mutaciones llaman a{" "}
              <code>POST /api/admin</code> y a la función PostgreSQL{" "}
              <code>public.is_admin()</code>. Si intentas modificar un estado
              sin rol <code>admin</code> en Supabase, el servidor rechazará la
              operación con código 401/403.
            </p>
          </div>
        </div>
      )}

      {serverResponse && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-center gap-2.5 ${
            serverResponse.ok
              ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {serverResponse.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{serverResponse.message}</span>
        </div>
      )}

      {/* Indicadores básicos de uso y catálogo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-4">
          <span className="text-[11px] text-slate-400">
            Fichas en Catálogo
          </span>
          <p className="mt-1 text-2xl font-extrabold text-white">
            {catalogItems.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-4">
          <span className="text-[11px] text-slate-400">
            Reglas Determinísticas
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#2DD4BF]">
            {VERIFIED_CLASSIFICATION_RULES.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-4">
          <span className="text-[11px] text-slate-400">
            Fuentes Oficiales
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#22C55E]">
            {Object.keys(VERIFIED_SOURCES).length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-4">
          <span className="text-[11px] text-slate-400">
            Consultas / Acciones Sesión
          </span>
          <p className="mt-1 text-2xl font-extrabold text-white">
            {scanHistory.length} / {userActions.length}
          </p>
        </div>
      </div>

      {/* Pestañas de administración */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "fichas", label: "Fichas de Residuos" },
          { id: "reglas", label: "Reglas de Clasificación" },
          { id: "puntos", label: "Puntos de Recolección" },
          { id: "fuentes", label: "Fuentes y Vigencia" },
          { id: "reportes", label: "Contenido Educativo y Reportes" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === t.id
                ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227]"
                : "border border-white/10 bg-[#131832] text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "fichas" && (
        <div className="space-y-3">
          {catalogItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {item.name}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-[#2DD4BF]">
                    {MATERIAL_LABELS[item.primaryMaterial]}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Categoría: {CATEGORY_LABELS[item.mainCategory]} • Revisión:{" "}
                  {item.reviewedAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor={`status-${item.id}`}
                  className="text-xs text-slate-400"
                >
                  Estado:
                </label>
                <select
                  id={`status-${item.id}`}
                  value={item.publicationStatus}
                  onChange={(e) =>
                    handleStatusChange(
                      item,
                      e.target.value as ValidationStatus
                    )
                  }
                  className="rounded-xl border border-white/15 bg-[#0E1227] px-3 py-1.5 text-xs text-white"
                >
                  <option value="verificado">Verificado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="desactualizado">Desactualizado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reglas" && (
        <div className="space-y-3">
          {VERIFIED_CLASSIFICATION_RULES.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2DD4BF]">
                  {rule.code} — {rule.name}
                </span>
                <span className="rounded bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                  {rule.validationStatus.toUpperCase()} (Rev: {rule.reviewedAt})
                </span>
              </div>
              <p className="text-xs text-slate-300">{rule.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "puntos" && (
        <div className="space-y-3">
          {VERIFIED_COLLECTION_POINTS.map((cp) => (
            <div
              key={cp.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{cp.name}</span>
                <span className="rounded bg-[#2DD4BF]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#2DD4BF]">
                  {cp.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Operador: {cp.entityOperator} • Municipio: {cp.municipality} •
                Última verificación: {cp.lastVerifiedAt}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "fuentes" && (
        <div className="space-y-3">
          {Object.values(VERIFIED_SOURCES).map((src) => (
            <div
              key={src.id}
              className="rounded-2xl border border-white/10 bg-[#131832] p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[#22C55E]" />
                  <span>{src.entityName}</span>
                </p>
                <p className="text-xs text-slate-300">{src.resourceTitle}</p>
                <p className="text-[11px] text-slate-400">
                  Ámbito: {src.geographicScope} • Revisión: {src.reviewedAt}
                </p>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-[#2DD4BF] hover:bg-white/5"
              >
                URL Oficial
              </a>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reportes" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#131832] p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-[#2DD4BF]" />
              <span>
                Artículos Educativos Publicados ({VERIFIED_EDUCATIONAL_ARTICLES.length})
              </span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {VERIFIED_EDUCATIONAL_ARTICLES.map((art) => (
                <li
                  key={art.id}
                  className="flex items-center justify-between border-b border-white/5 pb-1.5"
                >
                  <span>{art.title}</span>
                  <span className="text-[#22C55E] font-medium">
                    {art.validationStatus} ({art.reviewedAt})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
