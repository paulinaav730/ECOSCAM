"use client";

import React, { useState } from 'react';
import {
  User,
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  BookOpen,
  Map,
  Lock,
  X,
  Camera,
  HelpCircle,
  LogIn,
  LogOut,
  Mail,
  UserCheck,
  FileText,
  Download,
} from 'lucide-react';
import { UserProfile, Badge, TabType } from './types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onResetData: () => void;
  onAddSampleHistory: () => void;
  setActiveTab?: (tab: TabType) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onResetData,
  onAddSampleHistory,
  setActiveTab,
  onOpenAuth,
  onLogout,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const pointsToNext =
    userProfile.pointsToNextLevel -
    (userProfile.totalPoints % userProfile.pointsToNextLevel);
  const progressPercent = Math.min(
    100,
    Math.round(
      ((userProfile.totalPoints % userProfile.pointsToNextLevel) /
        userProfile.pointsToNextLevel) *
        100
    )
  );

  const categories = [
    'Todas',
    'Primeros Pasos',
    'Materiales',
    'Hábitos Eco',
    'Especiales Colombia',
  ];

  const filteredBadges =
    selectedCategory === 'Todas'
      ? userProfile.badges
      : userProfile.badges.filter((b) => b.category === selectedCategory);

  const unlockedCount = userProfile.badges.filter((b) => b.unlocked).length;

  const getRarityBadgeStyle = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'Común':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Raro':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Épico':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Legendario':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getRarityBgGradient = (rarity: Badge['rarity'], unlocked: boolean) => {
    if (!unlocked) return 'from-slate-900 to-slate-950';
    switch (rarity) {
      case 'Común':
        return 'from-slate-800 to-slate-900';
      case 'Raro':
        return 'from-emerald-950/80 to-slate-900';
      case 'Épico':
        return 'from-purple-950/80 to-slate-900';
      case 'Legendario':
        return 'from-amber-950/90 to-slate-900';
      default:
        return 'from-slate-900 to-slate-950';
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 font-black text-xl">
              <User className="w-8 h-8 text-emerald-400 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">
                {userProfile.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                COL 🇨🇴
              </span>
            </div>

            {userProfile.email && (
              <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 font-mono truncate">
                <Mail className="w-3 h-3 text-emerald-400" />
                {userProfile.email}
              </p>
            )}

            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {userProfile.city}
            </p>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 fill-yellow-400" />
              <span>
                {userProfile.levelName} (Nivel {userProfile.levelNumber})
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-5 space-y-1.5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Progreso de Nivel</span>
            <span className="text-emerald-400 font-mono">
              {userProfile.totalPoints} pts
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400 text-right">
            Faltan{' '}
            <span className="text-emerald-300 font-bold">
              {pointsToNext} pts
            </span>{' '}
            para el siguiente nivel
          </p>
        </div>
      </div>

      {/* Badges / Medallas Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400 stroke-[2.2]" />
              Medallas y Logros Ecológicos
            </h3>
            <p className="text-[11px] text-slate-400">
              Toca cualquier medalla para ver detalles y cómo desbloquearla
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            {unlockedCount} / {userProfile.badges.length} Desbloqueadas
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-emerald-500/40 hover:border-emerald-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              {!badge.unlocked && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
              )}

              <div className="absolute bottom-2 right-2">
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${getRarityBadgeStyle(
                    badge.rarity
                  )}`}
                >
                  +{badge.rewardPoints} pts
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110 shadow-inner ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="min-w-0 pr-4 space-y-1">
                  <p
                    className={`text-xs font-bold leading-snug line-clamp-1 ${
                      badge.unlocked ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {badge.title}
                  </p>

                  <span
                    className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getRarityBadgeStyle(
                      badge.rarity
                    )}`}
                  >
                    {badge.rarity}
                  </span>

                  {badge.progress && (
                    <div className="pt-1">
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            badge.unlocked ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (badge.progress.current / badge.progress.total) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-3xl border border-slate-700 p-6 space-y-5 shadow-2xl bg-gradient-to-b ${getRarityBgGradient(
              selectedBadge.rarity,
              selectedBadge.unlocked
            )} text-white relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="relative inline-block">
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 ${
                    selectedBadge.unlocked
                      ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-500 grayscale'
                  }`}
                >
                  {selectedBadge.icon}
                </div>

                {selectedBadge.unlocked ? (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-5 h-5 fill-slate-950 stroke-emerald-500" />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-400 p-1.5 rounded-full border border-slate-700">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-1.5 ${getRarityBadgeStyle(
                    selectedBadge.rarity
                  )}`}
                >
                  {selectedBadge.rarity} • {selectedBadge.category}
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedBadge.title}
                </h3>

                {selectedBadge.unlocked ? (
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    ✓ Desbloqueada y añadida a tu perfil
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Logro
                    Bloqueado
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-3 text-xs leading-relaxed">
              <p className="text-slate-300 font-medium text-center italic">
                &ldquo;{selectedBadge.description}&rdquo;
              </p>

              {selectedBadge.progress && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Progreso del Logro</span>
                    <span className="text-emerald-400">
                      {selectedBadge.progress.current} /{' '}
                      {selectedBadge.progress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedBadge.unlocked ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedBadge.progress.current /
                            selectedBadge.progress.total) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <p className="font-bold text-yellow-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo desbloquear esta
                  medalla?
                </p>
                <p className="text-slate-400 text-[11px] leading-normal">
                  {selectedBadge.howToUnlock}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-bold">
                  Recompensa Eco:
                </span>
                <span className="font-black text-emerald-400 text-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  +{selectedBadge.rewardPoints} Puntos Eco
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!selectedBadge.unlocked && setActiveTab && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setActiveTab('escanear');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  Ir a Escanear
                </button>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                className={`py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition-colors ${
                  !selectedBadge.unlocked && setActiveTab ? 'px-4' : 'w-full'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Colombia Res. 2184 + Motor Multicriterio Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          Motor Multicriterio y Resolución 2184 de 2019
        </h3>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <p>
            EcoScan evalúa primero si el residuo es <strong>Posconsumo</strong>,
            luego verifica su <strong>estado real de limpieza o grasa</strong> y
            finalmente asigna su ruta normativa en Colombia:
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-white border border-slate-400 flex-shrink-0" />
              <span>
                <span className="font-bold">Blanco:</span> Plástico, vidrio,
                metal, papel, cartón y Tetra Pak{' '}
                <strong className="text-emerald-400">limpios y secos</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>
                <span className="font-bold">Verde:</span> Orgánicos
                aprovechables (restos de fruta, verdura, café, poda).
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600 flex-shrink-0" />
              <span>
                <span className="font-bold">Negro:</span> Papel higiénico,
                servilletas usadas y cartones{' '}
                <strong className="text-rose-400">contaminados con grasa</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                <span className="font-bold">Posconsumo:</span> Pilas,
                medicamentos, bombillos, aceite usado y electrónicos.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Puntos Posconsumo Colombia */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Map className="w-4 h-4 text-cyan-400" />
          Programas Posconsumo Oficiales en Colombia
        </h3>

        <div className="space-y-2 text-xs">
          {[
            {
              name: 'Corporación Punto Azul',
              desc: 'Medicamentos humanos/veterinarios vencidos y blísteres.',
              target: 'Droguerías y supermercados',
            },
            {
              name: 'Pilas con el Ambiente',
              desc: 'Pilas AA, AAA, botón y baterías recargables.',
              target: 'Centros comerciales y almacenes de cadena',
            },
            {
              name: 'Lúmina Colombia',
              desc: 'Bombillos ahorradores y tubos fluorescentes.',
              target: 'Puntos de recolección urbanos',
            },
            {
              name: 'Puntos ACU (Aceite de Cocina Usado)',
              desc: 'Aceite vegetal frío y colado en botella plástica sellada.',
              target: 'Puntos limpios municipales y supermercados',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-start justify-between"
            >
              <div>
                <p className="font-bold text-emerald-400">{item.name}</p>
                <p className="text-[11px] text-slate-300">{item.desc}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ubícalos en: {item.target}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cuenta y Sesión */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Cuenta de Usuario
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Sesión Activa
          </span>
        </h3>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{userProfile.name}</p>
              <p className="text-[11px] text-slate-400">
                {userProfile.email || 'paulina.avendano@ecoscan.co'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-400 block">
                {userProfile.city}
              </span>
              <span className="text-[10px] text-slate-400">
                {userProfile.scannedCount} residuos registrados
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex gap-2">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex-1 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Cambiar o Crear Cuenta
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="py-2 px-3 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-slate-300 hover:text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Descarga de Especificación Técnica en PDF */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Documentos Técnicos Oficiales
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                PDF Oficial
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Descarga el sistema de puntuación/medallas y el documento de contexto arquitectónico y ambiental de EcoScan Colombia.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href="/api/download-scoring-pdf"
            download="Sistema_Puntuacion_EcoScan_IA.pdf"
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Descargar PDF Sistema de Puntuación</span>
          </a>

          <a
            href="/Documento_Contexto_EcoScan_Colombia.pdf"
            download="Documento_Contexto_EcoScan_Colombia.pdf"
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF Contexto y Motor de Reciclaje</span>
          </a>
        </div>
      </div>

      {/* Gestión del Historial Personal */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-3xl space-y-2 text-center">
        <p className="text-xs font-bold text-slate-300">
          Privacidad y Mi Historial Personal
        </p>
        <button
          onClick={onResetData}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-xs transition-colors"
        >
          Reiniciar mi historial y puntos a cero
        </button>
      </div>
    </div>
  );
};
