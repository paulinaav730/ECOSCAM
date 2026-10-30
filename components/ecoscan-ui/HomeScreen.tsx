"use client";

import React, { useState, useMemo } from 'react';
import {
  Camera,
  Sparkles,
  Award,
  Scale,
  Info,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Search,
  Gamepad2,
} from 'lucide-react';
import { TabType, UserProfile, BinColorType } from './types';
import { COLOMBIA_BINS, COLOMBIA_ECO_TIPS } from './data/colombiaBins';
import { SAMPLE_PRESETS_LIST } from './data/samplePresets';
import { VERIFIED_WASTE_ITEMS } from '@/lib/data/verified-environmental-data';

interface HomeScreenProps {
  setActiveTab: (tab: TabType) => void;
  userProfile: UserProfile;
  onSelectPreset: (presetId: string) => void;
  onSelectCatalogQuery?: (queryName: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setActiveTab,
  userProfile,
  onSelectPreset,
  onSelectCatalogQuery,
}) => {
  const [selectedBinModal, setSelectedBinModal] = useState<BinColorType | null>(null);
  const [quickQuery, setQuickQuery] = useState('');

  const matchingCatalogItems = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return [];
    return VERIFIED_WASTE_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.synonyms.some((s) => s.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [quickQuery]);

  const todayTip = COLOMBIA_ECO_TIPS[0];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-6 text-white border border-emerald-500/30 shadow-xl shadow-emerald-950/40">
        {/* Background glow effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>Motor Multicriterio + Posconsumo</span>
            </div>
            <div className="text-xs font-bold text-emerald-300/90 bg-slate-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              👋 ¡Hola, {userProfile.name}!
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            ¿No sabes qué hacer{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              con tu residuo hoy?
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            EcoScan analiza el material y su <strong>estado real de limpieza o contaminación</strong>, evalúa si requiere ruta <strong>Posconsumo</strong>, cómo prepararlo y cómo reutilizarlo.
          </p>

          {/* Buscador rápido del catálogo inteligente */}
          {onSelectCatalogQuery && (
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Buscar residuo (ej. caja de pizza, pila, aceite, PET)..."
                  className="w-full bg-slate-950/80 border border-emerald-500/30 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              {matchingCatalogItems.length > 0 && (
                <div className="mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl space-y-1">
                  {matchingCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setQuickQuery('');
                        onSelectCatalogQuery(item.name);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.requiresSpecialManagement
                            ? 'Gestión Especial Posconsumo'
                            : `Estado base: ${item.defaultCondition.replace('_', ' ')}`}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                        Evaluar →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-1 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('escanear')}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Escanear Residuo Ahora</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Nivel Actual</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                {userProfile.levelName}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                  Nivel {userProfile.levelNumber}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('perfil')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            Ver medallas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> Puntos Eco
            </p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {userProfile.totalPoints}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Escaneados
            </p>
            <p className="text-lg font-black text-cyan-400 mt-0.5">
              {userProfile.scannedCount}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Scale className="w-3 h-3 text-teal-400" /> Kg Ahorrados
            </p>
            <p className="text-lg font-black text-teal-400 mt-0.5">
              {userProfile.kgRecycledEstimate} kg
            </p>
          </div>
        </div>
      </div>

      {/* Acceso Destacado a ECO WORLD (Videojuego 2D Integrado) */}
      <div className="bg-gradient-to-r from-[#0E1227] via-emerald-950/90 to-slate-900 border border-emerald-500/40 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Gamepad2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                ECO WORLD 2D
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +{userProfile.ecoWorldPoints || 0} pts extra
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              Cada acción transforma el planeta • Recupera ecosistemas y gana
              puntos
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('ecoworld')}
          className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap transition-transform active:scale-95"
        >
          Jugar Ahora
        </button>
      </div>

      {/* Quick Presets / Try right now */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Prueba rápida (Casos Reales y Posconsumo)
          </h2>
          <span className="text-xs text-slate-400">1-Clic</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {SAMPLE_PRESETS_LIST.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectPreset(sample.id)}
              className="flex-shrink-0 w-36 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.03] group focus:outline-none"
            >
              <div className="relative h-24 overflow-hidden bg-slate-950">
                <img
                  src={sample.imageThumbnail}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
                  style={{
                    backgroundColor:
                      sample.binHexColor === '#FFFFFF'
                        ? '#FFFFFF'
                        : sample.binHexColor,
                    color:
                      sample.binHexColor === '#FFFFFF' ||
                      sample.binColor === 'Posconsumo'
                        ? '#0F172A'
                        : '#FFFFFF',
                  }}
                >
                  {sample.binColor}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-bold text-slate-100 line-clamp-1">
                  {sample.title}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {sample.subtitle || sample.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sistema de Rutas Colombia (Res. 2184 + Posconsumo) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Rutas de Gestión en Colombia
            </h2>
            <p className="text-xs text-slate-400">
              Separación por estado de limpieza y programas Posconsumo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {(['Blanco', 'Verde', 'Negro', 'Posconsumo'] as BinColorType[]).map(
            (colorKey) => {
              const bin = COLOMBIA_BINS[colorKey];
              return (
                <button
                  key={colorKey}
                  onClick={() => setSelectedBinModal(colorKey)}
                  className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between h-32 relative overflow-hidden ${
                    colorKey === 'Blanco'
                      ? 'bg-slate-100 text-slate-900 border-slate-300'
                      : colorKey === 'Verde'
                      ? 'bg-emerald-950/70 text-emerald-100 border-emerald-500/50'
                      : colorKey === 'Negro'
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-amber-950/70 text-amber-100 border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-5 h-5 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: bin.hex }}
                    />
                    <Info className="w-4 h-4 opacity-60" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">
                      {colorKey === 'Posconsumo'
                        ? 'Punto Oficial'
                        : 'Res. 2184 / Estado'}
                    </p>
                    <p className="text-sm font-black leading-tight mt-0.5">
                      {bin.title}
                    </p>
                    <p className="text-[10px] line-clamp-1 opacity-80 mt-1">
                      {bin.subtitle}
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Daily Eco Tip */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex gap-3 items-start">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-300">
          <Lightbulb className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Criterio Inteligente EcoScan...
          </p>
          <p className="text-xs text-slate-200 leading-relaxed">{todayTip}</p>
        </div>
      </div>

      {/* Modal detail for Colombia Route */}
      {selectedBinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-white space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border border-slate-400 shadow-md"
                  style={{ backgroundColor: COLOMBIA_BINS[selectedBinModal].hex }}
                />
                <div>
                  <h3 className="text-lg font-bold">
                    {COLOMBIA_BINS[selectedBinModal].title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {COLOMBIA_BINS[selectedBinModal].subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBinModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-emerald-400 mb-1.5 text-sm">
                  ✅ ¿Qué aplica en esta ruta?
                </p>
                <ul className="space-y-1 text-slate-300">
                  {COLOMBIA_BINS[selectedBinModal].allowedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-rose-400 mb-1.5 text-sm">
                  ❌ ¿Qué NO debes mezclar aquí?
                </p>
                <ul className="space-y-1 text-slate-300">
                  {COLOMBIA_BINS[selectedBinModal].forbiddenItems.map(
                    (item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-yellow-400 mb-1 text-xs">
                  💡 Reglas del motor de reciclaje:
                </p>
                {COLOMBIA_BINS[selectedBinModal].tips.map((tip, i) => (
                  <p key={i} className="text-slate-300 mt-1">
                    • {tip}
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedBinModal(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
