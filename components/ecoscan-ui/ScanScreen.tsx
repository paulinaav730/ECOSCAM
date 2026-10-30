"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Zap,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { WasteAnalysis } from './types';
import { SAMPLE_PRESETS_LIST } from './data/samplePresets';
import { VERIFIED_WASTE_ITEMS } from '@/lib/data/verified-environmental-data';
import { WasteConditionState } from '@/types/ecoscan';

interface ScanScreenProps {
  onAnalysisComplete: (result: WasteAnalysis, imageUrl?: string) => void;
  selectedPresetId?: string | null;
  clearPresetId?: () => void;
  selectedCatalogQuery?: string | null;
  clearCatalogQuery?: () => void;
  city?: string;
}

const CONDITION_OPTIONS: {
  id: WasteConditionState;
  label: string;
  badge: string;
}[] = [
  { id: 'limpio_seco', label: '✨ Limpio y seco', badge: 'Ideal aprovechamiento' },
  {
    id: 'parcialmente_contaminado',
    label: '🍕 Parcialmente engrasado',
    badge: 'Separar por partes',
  },
  {
    id: 'contaminado_grasa',
    label: '🛢️ Con grasa o comida',
    badge: 'Contaminado',
  },
  {
    id: 'contaminado_quimico',
    label: '⚠️ Químico / Posconsumo',
    badge: 'Manejo especial',
  },
];

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onAnalysisComplete,
  selectedPresetId,
  clearPresetId,
  selectedCatalogQuery,
  clearCatalogQuery,
  city = 'Bogotá, Colombia',
}) => {
  const [scanMode, setScanMode] = useState<
    'camera' | 'upload' | 'preset' | 'catalog'
  >('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<
    WasteConditionState | undefined
  >(undefined);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>(
    'Iniciando escáner...'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedPresetId) {
      handlePresetScan(selectedPresetId);
      if (clearPresetId) clearPresetId();
    }
  }, [selectedPresetId]);

  useEffect(() => {
    if (selectedCatalogQuery) {
      executeAnalysis({
        queryName: selectedCatalogQuery,
        conditionState: selectedCondition,
      });
      if (clearCatalogQuery) clearCatalogQuery();
    }
  }, [selectedCatalogQuery]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access failed or denied:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Puedes subir una foto desde tu galería, elegir una muestra o buscar en el catálogo.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanMode]);

  const handleCaptureCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        analyzeImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        analyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetScan = async (sampleId: string) => {
    const sample = SAMPLE_PRESETS_LIST.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedImage(sample.imageThumbnail);
    }
    executeAnalysis({
      sampleId,
      conditionState: selectedCondition,
    });
  };

  const analyzeImage = (imageBase64: string) => {
    executeAnalysis({
      imageBase64,
      conditionState: selectedCondition,
    });
  };

  const executeAnalysis = async (payload: {
    imageBase64?: string;
    sampleId?: string;
    queryName?: string;
    conditionState?: WasteConditionState;
  }) => {
    setIsAnalyzing(true);
    setAnalysisStep('Identificando material y composición...');

    const steps = [
      'Analizando textura, material y estado de limpieza...',
      'Evaluando filtro de Gestión Especial Posconsumo...',
      'Contrastando con motor multicriterio (Res. 2184/2019)...',
      'Generando pasos de preparación y economía circular...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setAnalysisStep(steps[stepIdx]);
        stepIdx++;
      }
    }, 550);

    try {
      const res = await fetch('/api/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          municipality: city,
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success && data.data) {
        const resultWithImage: WasteAnalysis = {
          ...data.data,
          imageUrl: payload.imageBase64 || data.data.imageUrl || selectedImage || undefined,
        };
        onAnalysisComplete(
          resultWithImage,
          payload.imageBase64 || data.data.imageUrl || selectedImage || undefined
        );
      } else {
        throw new Error('Error al procesar el residuo');
      }
    } catch (error) {
      console.error('Scan error:', error);
      clearInterval(interval);
      const fallbackSample = SAMPLE_PRESETS_LIST[0];
      onAnalysisComplete({
        wasteName: 'Botella de Plástico PET',
        category: 'plástico',
        binColor: 'Blanco',
        binHexColor: '#FFFFFF',
        binDescription:
          'En Colombia (Res. 2184/2019), la ruta Blanca es para plástico limpio y seco.',
        preparationSteps: [
          'Vacía todo el líquido.',
          'Enjuaga ligeramente y deja secar.',
          'Aplasta la botella para reducir el volumen antes de entregarla.',
        ],
        derivedProducts: [
          'Fibras sintéticas para poliéster',
          'Nuevas botellas recicladas (rPET)',
          'Madera plástica y mobiliario',
        ],
        environmentalImpact:
          'Reciclar esta botella ahorra hasta un 70% de energía frente a producir plástico virgen.',
        ecoPoints: 20,
        tips: 'Entrega siempre el plástico limpio y seco a los recicladores de oficio de tu zona.',
        imageUrl: selectedImage || fallbackSample.imageThumbnail,
        primaryMaterial: 'plastico_pet',
        conditionEvaluated: 'limpio_seco',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredCatalog = VERIFIED_WASTE_ITEMS.filter(
    (item) =>
      !catalogSearch.trim() ||
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.synonyms.some((s) =>
        s.toLowerCase().includes(catalogSearch.toLowerCase())
      )
  );

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Hidden Canvas for Camera Snap */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mode Switcher */}
      <div className="grid grid-cols-4 bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setScanMode('camera')}
          className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
            scanMode === 'camera'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Cámara</span>
        </button>

        <button
          onClick={() => {
            setScanMode('upload');
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
            scanMode === 'upload'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Galería</span>
        </button>

        <button
          onClick={() => setScanMode('preset')}
          className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
            scanMode === 'preset'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Muestras</span>
        </button>

        <button
          onClick={() => setScanMode('catalog')}
          className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
            scanMode === 'catalog'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Catálogo</span>
        </button>
      </div>

      {/* Selector Multicriterio de Estado / Limpieza */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Estado del residuo (Motor Multicriterio):
          </p>
          {selectedCondition && (
            <button
              onClick={() => setSelectedCondition(undefined)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Automático
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CONDITION_OPTIONS.map((opt) => {
            const active = selectedCondition === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setSelectedCondition(active ? undefined : opt.id)
                }
                className={`px-2.5 py-1.5 rounded-xl text-left border transition-all ${
                  active
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <p className="text-[11px] font-bold leading-tight">
                  {opt.label}
                </p>
                <p className="text-[9px] text-slate-400">{opt.badge}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Viewfinder Box */}
      {scanMode === 'camera' && (
        <div className="relative w-full aspect-[3/4] max-h-[420px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {!isCameraActive && (
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                <Camera className="w-8 h-8 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                {cameraError ||
                  'Permite el acceso a tu cámara o selecciona Muestras / Catálogo para evaluar al instante.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition-colors"
                >
                  Reintentar Cámara
                </button>
                <button
                  onClick={() => setScanMode('preset')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors"
                >
                  Ver Muestras 1-Clic
                </button>
              </div>
            </div>
          )}

          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-44 h-44 border border-emerald-400/30 rounded-2xl flex items-center justify-center">
                  <div className="w-12 h-12 border border-teal-400/50 rounded-full animate-ping opacity-30" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
              </div>

              <div className="absolute top-4 left-0 right-0 text-center">
                <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                  Encuadra el residuo al centro
                </span>
              </div>
            </div>
          )}

          {isCameraActive && (
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center z-10">
              <button
                onClick={handleCaptureCamera}
                disabled={isAnalyzing}
                className="w-16 h-16 rounded-full bg-emerald-400 p-1.5 shadow-xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group focus:outline-none"
              >
                <div className="w-full h-full rounded-full border-2 border-slate-950 flex items-center justify-center bg-emerald-300 group-hover:bg-white">
                  <Camera className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Mode UI */}
      {scanMode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] bg-slate-900/80 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Upload className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">
              Haz clic para subir una foto
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Soporta JPG, PNG o WebP con evaluación multicriterio
            </p>
          </div>
        </div>
      )}

      {/* Preset Samples Mode UI */}
      {scanMode === 'preset' && (
        <div className="space-y-3">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300">
            <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              Modo de Demostración Multicriterio
            </p>
            <p>
              Selecciona cualquier residuo (incluyendo casos con grasa o
              Posconsumo) para ver cómo decide el motor inteligente:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_PRESETS_LIST.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handlePresetScan(sample.id)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-3 text-left flex flex-col gap-2 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none"
              >
                <div className="h-28 rounded-xl overflow-hidden bg-slate-950 relative">
                  <img
                    src={sample.imageThumbnail}
                    alt={sample.title}
                    className="w-full h-full object-cover"
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
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">
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
      )}

      {/* Catalog Search Mode UI */}
      {scanMode === 'catalog' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Filtrar los 17+ residuos del catálogo colombiano..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  executeAnalysis({
                    queryName: item.name,
                    conditionState: selectedCondition || item.defaultCondition,
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.requiresSpecialManagement
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.containerColor === 'blanco'
                          ? 'bg-white text-slate-950'
                          : item.containerColor === 'verde'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {item.requiresSpecialManagement
                        ? 'Posconsumo'
                        : item.containerColor}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      Estado base: {item.defaultCondition.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex-shrink-0">
                  Analizar →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Loading Screen Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <div
              className="absolute inset-2 rounded-full border-4 border-teal-500/20 border-b-cyan-400 animate-spin"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            />

            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Procesando"
                className="w-18 h-18 rounded-2xl object-cover shadow-lg border border-emerald-400/40"
              />
            ) : (
              <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Evaluando con <span className="text-emerald-400">Motor EcoScan</span>
          </h3>

          <p className="text-xs text-emerald-300 font-medium mt-2 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/30">
            {analysisStep}
          </p>

          <p className="text-[11px] text-slate-400 max-w-xs mt-6 leading-relaxed">
            Contrastando material, estado de contaminación, programas Posconsumo y Resolución 2184 de 2019.
          </p>
        </div>
      )}
    </div>
  );
};
