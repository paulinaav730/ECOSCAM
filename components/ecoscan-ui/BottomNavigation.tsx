"use client";

import React from 'react';
import { Home, Camera, CheckCircle2, History, User } from 'lucide-react';
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
    { id: 'escanear' as TabType, label: 'Escanear', icon: Camera, isCenter: true },
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
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform group-active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-400 to-cyan-400 text-slate-950 shadow-emerald-500/40 ring-4 ring-slate-900'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30 hover:scale-105'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-0.5 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
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
              className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all focus:outline-none ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium mt-1 ${
                  isActive ? 'font-bold text-emerald-400' : 'text-slate-400'
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
