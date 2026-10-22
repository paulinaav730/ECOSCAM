"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  History,
  Home,
  Layers,
  MapPin,
  Menu,
  Recycle,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  X,
} from "lucide-react";
import { COLOMBIAN_MUNICIPALITIES } from "@/lib/data/verified-environmental-data";
import { useEcoScan } from "@/components/providers/ecoscan-provider";
import { ModalDialog } from "@/components/ui/modal-dialog";

const PRIMARY_NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/escaner", label: "Escáner IA", icon: Camera, highlight: true },
  { href: "/explorador", label: "Explorador", icon: Search },
  { href: "/guia", label: "Guía 2184", icon: Layers },
  { href: "/puntos", label: "Puntos", icon: MapPin },
];

const SECONDARY_NAV = [
  { href: "/aprende", label: "Aprende y Descubre", icon: BookOpen },
  { href: "/economia-circular", label: "Reutilización y Circularidad", icon: Recycle },
  { href: "/mi-impacto", label: "Mi Impacto y Retos", icon: Trophy },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/perfil", label: "Perfil y Cuenta", icon: User },
  { href: "/admin", label: "Administración", icon: ShieldCheck },
];

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    municipality,
    setMunicipality,
    userProfile,
    reportModalTarget,
    closeReportModal,
    openReportModal,
  } = useEcoScan();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [reportType, setReportType] = useState<
    | "correccion_clasificacion"
    | "actualizacion_punto"
    | "nuevo_residuo"
    | "error_ia"
    | "otro"
  >("correccion_clasificacion");
  const [reportContent, setReportContent] = useState("");
  const [reportStatus, setReportStatus] = useState<{
    loading: boolean;
    error?: string;
    successMessage?: string;
  }>({ loading: false });

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReportStatus({ loading: true });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wasteItemId: reportModalTarget.wasteItemId,
          collectionPointId: reportModalTarget.collectionPointId,
          reportType,
          content: reportContent,
          municipality,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setReportStatus({
          loading: false,
          error: data.error || "No se pudo enviar el reporte.",
        });
        return;
      }

      setReportStatus({
        loading: false,
        successMessage: data.message,
      });
      setReportContent("");
    } catch {
      setReportStatus({
        loading: false,
        error: "Error de conexión al enviar el reporte.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0E1227] text-slate-100 flex flex-col">
      {/* Barra superior tecnológica y ambiental */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0E1227]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] via-[#10B981] to-[#2DD4BF] text-[#0E1227] shadow-glow transition group-hover:scale-105">
                <Compass className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    EcoScan
                  </span>
                  <span className="hidden rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2DD4BF] sm:inline-block">
                    Colombia
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Escanea hoy, transforma el mañana
                </p>
              </div>
            </Link>
          </div>

          {/* Navegación principal en escritorio */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-1"
          >
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    item.highlight
                      ? isActive
                        ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227] font-semibold shadow-glow"
                        : "border border-[#22C55E]/40 bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/25"
                      : isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Selector de Municipio y Perfil */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131832] px-2.5 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#2DD4BF]" />
              <label htmlFor="global-municipality-select" className="sr-only">
                Seleccionar municipio en Colombia
              </label>
              <select
                id="global-municipality-select"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {COLOMBIAN_MUNICIPALITIES.map((muni) => (
                  <option
                    key={muni}
                    value={muni}
                    className="bg-[#131832] text-white"
                  >
                    {muni}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/perfil"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-[#2DD4BF]/40 hover:bg-white/10"
            >
              <User className="h-3.5 w-3.5 text-[#22C55E]" />
              <span>{userProfile ? userProfile.alias : "Cuenta"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Abrir menú completo de secciones"
              aria-expanded={mobileDrawerOpen}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
            >
              {mobileDrawerOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Sub-barra de secciones complementarias en escritorio */}
        <div className="hidden border-t border-white/5 bg-[#0A0D1D]/80 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto">
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? "bg-[#2DD4BF]/15 text-[#2DD4BF]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                openReportModal({
                  contextLabel: "Sugerencia o reporte ambiental general",
                })
              }
              className="text-[11px] font-medium text-slate-400 hover:text-[#2DD4BF] transition"
            >
              ¿Encontraste un dato por actualizar? Reportar aquí
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil / compacto */}
        {mobileDrawerOpen && (
          <div className="border-t border-white/10 bg-[#131832] px-4 py-4 shadow-2xl">
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#2DD4BF]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
        {children}
      </main>

      {/* Pie de página informativo y transparente */}
      <footer className="border-t border-white/10 bg-[#0A0D1D] py-8 pb-24 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#22C55E]" />
                <span className="font-semibold text-white">
                  EcoScan Colombia
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Asistente inteligente para la identificación, preparación y
                gestión responsable de residuos. Basado en la Resolución 2184 de
                2019 (MinAmbiente) y programas posconsumo acreditados.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Enfoque Biomimético
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Inspirado funcionalmente en la organización descentralizada de
                las colonias de hormigas: reglas locales claras en origen
                (evaluar material, estado y riesgo) para lograr coordinación
                ambiental colectiva sin contaminación cruzada.
              </p>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Transparencia de Datos
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  La clasificación final se valida con reglas normativas
                  verificadas. Las consultas informativas se distinguen de las
                  acciones declaradas y entregas verificadas.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openReportModal({
                    contextLabel: "Reporte desde el pie de página",
                  })
                }
                className="mt-3 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#2DD4BF] hover:bg-white/10"
              >
                Reportar error o sugerir actualización
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Barra de navegación inferior fija para dispositivos móviles */}
      <nav
        aria-label="Navegación móvil inferior"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#0E1227]/95 px-2 py-2 backdrop-blur-lg lg:hidden"
      >
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition ${
                item.highlight
                  ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227] font-semibold shadow-glow"
                  : isActive
                  ? "text-[#2DD4BF]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Diálogo modal accesible para reportar errores o sugerir correcciones */}
      <ModalDialog
        open={reportModalTarget.open}
        onClose={() => {
          setReportStatus({ loading: false });
          closeReportModal();
        }}
        title="Reportar error o sugerir corrección"
        subtitle={
          reportModalTarget.contextLabel ||
          `Municipio actual: ${municipality} — Tu observación ayuda a mantener las reglas verificadas.`
        }
      >
        {reportStatus.successMessage ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <p>{reportStatus.successMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportStatus({ loading: false });
                closeReportModal();
              }}
              className="w-full rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-[#0E1227] hover:bg-[#10B981]"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="report-type-select"
                className="block text-xs font-medium text-slate-300"
              >
                Tipo de novedad
              </label>
              <select
                id="report-type-select"
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value as typeof reportType)
                }
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3 py-2 text-sm text-white focus:border-[#2DD4BF] focus:outline-none"
              >
                <option value="correccion_clasificacion">
                  Corrección en regla o ficha de clasificación
                </option>
                <option value="actualizacion_punto">
                  Actualización de punto o ruta de recolección
                </option>
                <option value="error_ia">
                  Identificación imprecisa en el escáner
                </option>
                <option value="nuevo_residuo">
                  Solicitar inclusión de un nuevo residuo
                </option>
                <option value="otro">Otra observación ambiental</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="report-content-textarea"
                className="block text-xs font-medium text-slate-300"
              >
                Descripción detallada (incluye fuente o detalle local si lo conoces)
              </label>
              <textarea
                id="report-content-textarea"
                rows={4}
                required
                minLength={10}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Ej. En mi municipio el operador recibe este material bajo estas condiciones..."
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0E1227] p-3 text-sm text-white placeholder-slate-500 focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>

            {reportStatus.error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                {reportStatus.error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeReportModal}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={reportStatus.loading}
                className="rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2 text-xs font-semibold text-[#0E1227] hover:opacity-95 disabled:opacity-50"
              >
                {reportStatus.loading ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </div>
  );
}
