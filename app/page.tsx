"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  History,
  Layers,
  MapPin,
  Recycle,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  VERIFIED_EDUCATIONAL_ARTICLES,
  VERIFIED_WASTE_ITEMS,
} from "@/lib/data/verified-environmental-data";
import { filterWasteCatalog, MATERIAL_LABELS } from "@/services/waste-catalog-service";
import { useEcoScan } from "@/components/providers/ecoscan-provider";

export default function HomePage() {
  const router = useRouter();
  const { municipality, scanHistory, userActions, userProfile } = useEcoScan();
  const [searchQuery, setSearchQuery] = useState("");

  const quickSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return filterWasteCatalog({ query: searchQuery }).slice(0, 5);
  }, [searchQuery]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/explorador");
      return;
    }
    router.push(`/explorador?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  const declaredActionsCount = userActions.filter(
    (a) => a.verificationState === "declarada_usuario"
  ).length;
  const totalEcoPoints = userActions.reduce((acc, a) => acc + a.ecoPoints, 0);

  return (
    <div className="space-y-12">
      {/* HERO PRINCIPAL — Propuesta de valor, Escáner y Buscador */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171D3B] via-[#131832] to-[#0E1227] p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#22C55E]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3.5 py-1.5 text-xs font-medium text-[#2DD4BF]">
              <Compass className="h-3.5 w-3.5" />
              <span>EcoScan • Escanea hoy, transforma el mañana</span>
              <span className="text-slate-400">|</span>
              <span className="text-white">Municipio activo: {municipality}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Decide qué hacer con cada residuo,{" "}
              <span className="bg-gradient-to-r from-[#22C55E] via-[#10B981] to-[#2DD4BF] bg-clip-text text-transparent">
                mucho más allá de elegir una caneca.
              </span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
              EcoScan identifica materiales, evalúa el estado real de limpieza o
              contaminación, explica cómo preparar cada objeto antes de
              entregarlo, prioriza alternativas de reutilización y distingue los
              residuos ordinarios (Resolución 2184 de 2019) de los programas
              posconsumo en Colombia.
            </p>

            {/* Buscador central con el texto requerido */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué residuo quieres consultar?"
                    aria-label="¿Qué residuo quieres consultar?"
                    className="w-full rounded-2xl border border-white/15 bg-[#0E1227]/90 py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-[#2DD4BF] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <span>Consultar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sugerencias instantáneas del catálogo */}
              {quickSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-white/15 bg-[#131832] p-2 shadow-2xl">
                  <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Coincidencias verificadas en el catálogo
                  </p>
                  {quickSuggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/explorador/${item.slug}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="ml-2 text-slate-400">
                          ({MATERIAL_LABELS[item.primaryMaterial]})
                        </span>
                      </div>
                      <span className="text-[#2DD4BF] font-medium">
                        Ver ficha →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            {/* Botón principal "Escanear residuo" y accesos rápidos */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/escaner"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-6 py-3.5 text-sm font-bold text-[#0E1227] shadow-glow transition hover:scale-[1.01]"
              >
                <Camera className="h-5 w-5" />
                <span>Escanear residuo</span>
              </Link>

              <Link
                href="/guia"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0E1227]/70 px-4 py-3.5 text-sm font-medium text-slate-200 transition hover:border-[#2DD4BF]/40 hover:text-white"
              >
                <Layers className="h-4 w-4 text-[#2DD4BF]" />
                <span>Guía de separación</span>
              </Link>

              <Link
                href="/puntos"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0E1227]/70 px-4 py-3.5 text-sm font-medium text-slate-200 transition hover:border-[#2DD4BF]/40 hover:text-white"
              >
                <MapPin className="h-4 w-4 text-[#22C55E]" />
                <span>Puntos de recolección</span>
              </Link>
            </div>
          </div>

          {/* Tarjeta lateral: Analogía Biomimética + Flujo de decisión de EcoScan */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0E1227]/85 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
                  <Sparkles className="h-4 w-4 text-[#22C55E]" />
                  Diseño inspirado en biomimética
                </span>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                  Analogía funcional
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">
                Al igual que las colonias de hormigas organizan recursos y
                aíslan elementos de riesgo aplicando{" "}
                <strong className="text-white">reglas locales sencillas</strong>{" "}
                según las señales de su entorno, EcoScan evalúa cada residuo en
                4 pasos antes de asignarle un destino:
              </p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#131832] p-3">
                  <span className="text-[11px] font-bold text-amber-400">
                    1. Filtro Posconsumo
                  </span>
                  <p className="mt-1 text-xs text-slate-300">
                    Aísla pilas, medicamentos, bombillas, aceite y RAEE fuera de
                    las canecas domésticas.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#131832] p-3">
                  <span className="text-[11px] font-bold text-[#2DD4BF]">
                    2. Estado y Limpieza
                  </span>
                  <p className="mt-1 text-xs text-slate-300">
                    Distingue el cartón o papel limpio del que está impregnado
                    con grasa o comida.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#131832] p-3">
                  <span className="text-[11px] font-bold text-[#22C55E]">
                    3. Prevención Circular
                  </span>
                  <p className="mt-1 text-xs text-slate-300">
                    Prioriza reparar, donar, compostar o reutilizar con
                    seguridad antes de desechar.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#131832] p-3">
                  <span className="text-[11px] font-bold text-blue-400">
                    4. Ruta Verificada
                  </span>
                  <p className="mt-1 text-xs text-slate-300">
                    Contrasta la decisión con la Resolución 2184 de 2019 y la
                    ruta de {municipality}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESUMEN PERSONAL E HISTORIAL RECIENTE */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Resumen de últimos residuos consultados */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#2DD4BF]" />
                <h2 className="text-lg font-bold text-white">
                  Últimos residuos consultados
                </h2>
              </div>
              <Link
                href="/historial"
                className="text-xs font-semibold text-[#2DD4BF] hover:underline"
              >
                Ver historial completo →
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Tus consultas recientes para verificar preparación y ruta de
              separación.
            </p>

            {scanHistory.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-[#0E1227]/60 p-5 text-center">
                <p className="text-xs text-slate-300">
                  Aún no has registrado consultas en esta sesión. Prueba el
                  escáner o selecciona un residuo frecuente abajo.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {VERIFIED_WASTE_ITEMS.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/explorador/${item.slug}`}
                      className="rounded-lg border border-white/10 bg-[#131832] px-3 py-1.5 text-xs text-slate-200 hover:border-[#22C55E]/40 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {scanHistory.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0E1227] p-3.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {rec.identifiedObject}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {rec.recommendation}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#2DD4BF]">
                      {rec.municipality}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumen personal de progreso y trazabilidad transparente */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-lg font-bold text-white">
                  {userProfile
                    ? `Progreso de ${userProfile.alias}`
                    : "Tu seguimiento de hábitos"}
                </h2>
              </div>
              <Link
                href="/mi-impacto"
                className="text-xs font-semibold text-[#22C55E] hover:underline"
              >
                Abrir Mi Impacto →
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Separamos con transparencia las consultas informativas de las
              acciones declaradas.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-[#0E1227] p-3 text-center">
                <span className="block text-xl font-extrabold text-white">
                  {scanHistory.length}
                </span>
                <span className="text-[11px] text-slate-400">
                  1. Consultados
                </span>
              </div>
              <div className="rounded-xl border border-[#22C55E]/30 bg-[#0E1227] p-3 text-center">
                <span className="block text-xl font-extrabold text-[#22C55E]">
                  {declaredActionsCount}
                </span>
                <span className="text-[11px] text-slate-300">
                  2. Declaradas
                </span>
              </div>
              <div className="rounded-xl border border-[#2DD4BF]/30 bg-[#0E1227] p-3 text-center">
                <span className="block text-xl font-extrabold text-[#2DD4BF]">
                  {totalEcoPoints}
                </span>
                <span className="text-[11px] text-slate-300">EcoPuntos</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#0E1227]/60 px-3.5 py-2.5 text-xs">
            <span className="text-slate-300">
              {userProfile
                ? `Sesión activa (${userProfile.email})`
                : "Inicia sesión para sincronizar tu historial entre dispositivos"}
            </span>
            <Link
              href="/perfil"
              className="font-semibold text-[#2DD4BF] hover:underline"
            >
              {userProfile ? "Configurar" : "Acceder"}
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESO RÁPIDO A CASOS FRECUENTES Y GESTIÓN DIFERENCIADA */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
              Catálogo Verificado
            </span>
            <h2 className="text-xl font-bold text-white">
              Residuos frecuentes y casos que generan dudas
            </h2>
          </div>
          <Link
            href="/explorador"
            className="text-xs font-semibold text-[#2DD4BF] hover:underline"
          >
            Explorar los {VERIFIED_WASTE_ITEMS.length} residuos del catálogo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            VERIFIED_WASTE_ITEMS.find((i) => i.id === "item-caja-pizza")!,
            VERIFIED_WASTE_ITEMS.find((i) => i.id === "item-pilas")!,
            VERIFIED_WASTE_ITEMS.find((i) => i.id === "item-aceite-cocina-usado")!,
            VERIFIED_WASTE_ITEMS.find((i) => i.id === "item-envase-multicapa")!,
          ].map((item) => (
            <Link
              key={item.id}
              href={`/explorador/${item.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131832] p-5 transition hover:-translate-y-0.5 hover:border-[#2DD4BF]/40"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      item.requiresSpecialManagement
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : item.containerColor === "verificacion"
                        ? "bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {item.requiresSpecialManagement
                      ? "Posconsumo Especial"
                      : item.containerColor === "verificacion"
                      ? "Separación por Partes"
                      : "Bolsa Blanca (Limpio)"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2DD4BF] transition">
                  {item.name}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400 line-clamp-3">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-medium text-[#22C55E]">
                <span>Ver cómo prepararlo</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CONSEJOS DE SOSTENIBILIDAD Y CONTENIDO EDUCATIVO DESTACADO */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#2DD4BF]" />
              <h2 className="text-lg font-bold text-white">
                Contenido educativo destacado
              </h2>
            </div>
            <Link
              href="/aprende"
              className="text-xs font-semibold text-[#2DD4BF] hover:underline"
            >
              Ir a Aprende y Descubre →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VERIFIED_EDUCATIONAL_ARTICLES.slice(0, 2).map((article) => (
              <Link
                key={article.id}
                href={`/aprende#${article.slug}`}
                className="rounded-xl border border-white/10 bg-[#0E1227] p-4 transition hover:border-[#2DD4BF]/40 space-y-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E]">
                  {article.category.replace("_", " ")} • {article.readingTimeMin}{" "}
                  min lectura
                </span>
                <h3 className="text-sm font-bold text-white">{article.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {article.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Consejos prácticos de prevención y economía circular */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-gradient-to-br from-[#131832] to-[#0E1227] p-6 lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-[#22C55E]" />
              <h2 className="text-lg font-bold text-white">
                Consejos de sostenibilidad
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
                <span>
                  <strong>Regla Limpio y Seco:</strong> Nunca mezcles restos de
                  líquidos ni servilletas usadas en la bolsa blanca.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
                <span>
                  <strong>Cuidado con el sifón:</strong> El aceite de cocina
                  usado se enfría, se cuela y se envasa en botella plástica
                  cerrada para puntos ACU.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Protege al reciclador:</strong> Envuelve siempre el
                  vidrio roto en cartón grueso y rotúlalo claramente.
                </span>
              </li>
            </ul>
          </div>

          <Link
            href="/economia-circular"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/15 px-4 py-2.5 text-xs font-semibold text-[#22C55E] hover:bg-[#22C55E]/25"
          >
            <span>Explorar guía de reutilización segura</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
