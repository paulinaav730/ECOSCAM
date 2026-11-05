"use client";

import React from 'react';
import { Camera, Sparkles, UserCheck } from 'lucide-react';
import { TabType, UserProfile } from './types';

interface HeaderProps {
  currentTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userProfile: UserProfile;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setActiveTab,
  userProfile,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-emerald-500/20 px-4 py-2.5 text-white">
      <div className="w-full mx-auto flex items-center justify-between gap-2">
        {/* Logo Oficial EcoScan */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2.5 text-left focus:outline-none group min-w-0"
        >
          <img
            src="/images/ecoscan-logo.png"
            alt="EcoScan Colombia"
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(16,185,129,0.25)] group-hover:scale-[1.03] transition-transform"
          />
          <span className="hidden xs:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shrink-0">
            COL 🇨🇴
          </span>
        </button>

        {/* Quick actions & stats */}
        <div className="flex items-center gap-1.5">
          {/* User Points Badge */}
          <button
            onClick={() => setActiveTab('perfil')}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 px-2.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 transition-colors"
            title="Ver mi perfil y nivel"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{userProfile.totalPoints} pts</span>
          </button>

          {/* User Account / Auth Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={
                userProfile.isLoggedIn
                  ? `Cuenta: ${userProfile.name}`
                  : 'Iniciar Sesión / Crear Cuenta'
              }
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Quick Scan Button */}
          {currentTab !== 'escanear' && (
            <button
              onClick={() => setActiveTab('escanear')}
              className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-full text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
