"use client";

import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  ChevronRight,
  Calendar,
  Leaf,
  X,
} from 'lucide-react';
import { HistoryItem, TabType } from './types';

interface HistoryScreenProps {
  history: HistoryItem[];
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  setActiveTab: (tab: TabType) => void;
  onSelectHistoryDetail: (item: HistoryItem) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onDeleteItem,
  onClearHistory,
  setActiveTab,
  onSelectHistoryDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBin, setFilterBin] = useState<string>('todos');
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<HistoryItem | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.wasteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBin =
      filterBin === 'todos' ||
      item.binColor.toLowerCase() === filterBin.toLowerCase();
    return matchesSearch && matchesBin;
  });

  const totalPoints = history.reduce(
    (sum, item) => sum + (item.ecoPoints || 15),
    0
  );
  const totalKg = (history.length * 0.25).toFixed(1);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title & Stats Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
              Mi Historial de Reciclaje
            </h2>
            <p className="text-xs text-slate-400">
              Residuos evaluados y clasificados
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Registros</p>
            <p className="text-base font-black text-white">{history.length}</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">
              Puntos Ganados
            </p>
            <p className="text-base font-black text-emerald-400">
              {totalPoints}
            </p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">
              Kg Est. Reciclados
            </p>
            <p className="text-base font-black text-teal-400">{totalKg} kg</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por residuo o categoría..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'blanco', label: 'Blanco (Aprovechable)' },
            { id: 'verde', label: 'Verde (Orgánico)' },
            { id: 'negro', label: 'Negro (No Aprovechable)' },
            { id: 'posconsumo', label: 'Posconsumo (Especial)' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterBin(chip.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs ${
                filterBin === chip.id
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-white">
            No hay residuos en tu historial
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {searchTerm || filterBin !== 'todos'
              ? 'No se encontraron residuos con ese filtro.'
              : 'Empieza a escanear tus empaques y residuos para acumular Puntos Eco.'}
          </p>
          <button
            onClick={() => setActiveTab('escanear')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Escanear un Residuo
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredHistory.map((item) => {
            const dateFormatted = new Date(item.scannedAt).toLocaleDateString(
              'es-CO',
              {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all group"
              >
                <button
                  onClick={() => {
                    onSelectHistoryDetail(item);
                    setSelectedDetailItem(item);
                  }}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.wasteName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Leaf className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                        style={{
                          backgroundColor:
                            item.binHexColor === '#FFFFFF'
                              ? '#FFFFFF'
                              : item.binHexColor,
                          color:
                            item.binHexColor === '#FFFFFF' ||
                            item.binColor === 'Posconsumo'
                              ? '#0F172A'
                              : '#FFFFFF',
                        }}
                      >
                        {item.binColor}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateFormatted}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white truncate">
                      {item.wasteName}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      +{item.ecoPoints} Pts Eco
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Eliminar de mi historial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectHistoryDetail(item);
                      setSelectedDetailItem(item);
                    }}
                    className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Detail Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400">
                Detalle del Registro
              </h3>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                {selectedDetailItem.imageUrl && (
                  <img
                    src={selectedDetailItem.imageUrl}
                    alt={selectedDetailItem.wasteName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {selectedDetailItem.wasteName}
                  </h4>
                  <p className="text-emerald-400 font-bold">
                    Ruta {selectedDetailItem.binColor} (Colombia)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {selectedDetailItem.binDescription}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-white mb-1">
                  Pasos de preparación:
                </p>
                {selectedDetailItem.preparationSteps.map((step, i) => (
                  <p key={i} className="text-slate-300">
                    • {step}
                  </p>
                ))}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-white mb-1">
                  Productos fabricados / Destino:
                </p>
                {selectedDetailItem.derivedProducts.map((prod, i) => (
                  <p key={i} className="text-slate-300">
                    • {prod}
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedDetailItem(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
