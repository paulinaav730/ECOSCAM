"use client";

import React from 'react';
import {
  Home,
  Camera,
  CheckCircle2,
  History,
  User,
  Gamepad2,
} from 'lucide-react';
import { TabType } from './types';

interface BottomNavigationProps {
  currentTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasScanResult: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setActiveTab,
  hasScanResult,
}) => {
  const tabs = [
    { id: 'inicio' as TabType, label: 'Inicio', icon: Home },
    { id: 'ecoworld' as TabType, label: 'Eco World', icon: Gamepad2 },
    {
      id: 'escanear' as TabType,
      label: 'Escanear',
      icon: Camera,
      isCenter: true,
    },
    {
      id: 'resultado' as TabType,
      label: 'Resultado',
      icon: CheckCircle2,
      badge: hasScanResult,
    },
    { id: 'historial' as TabType, label: 'Historial', icon: History },
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:sticky md:bottom-0 bg-slate-950 border-t-2 border-emerald-500/35 shadow-[0_-10px_30px_rgba(2,6,23,0.95)] pb-safe">
      <div className="max-w-lg mx-auto px-1.5 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none px-1"
              >
                <div
                  className={`w-13 h-13 w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform group-active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-400 to-cyan-400 text-slate-950 shadow-emerald-500/40 ring-4 ring-slate-950'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30 hover:scale-105 ring-4 ring-slate-950'
                  }`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-black mt-0.5 ${
                    isActive ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all focus:outline-none ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 whitespace-nowrap ${
                  isActive ? 'font-black text-emerald-400' : 'font-semibold text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
