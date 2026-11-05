"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Zap,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { WasteAnalysis } from './types';
import { SAMPLE_PRESETS_LIST } from './data/samplePresets';
import { VERIFIED_WASTE_ITEMS } from '@/lib/data/verified-environmental-data';
import { MaterialType, WasteConditionState } from '@/types/ecoscan';

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

const QUICK_MATERIAL_CONFIRMATIONS: {
  label: string;
  queryName: string;
  primaryMaterial: MaterialType;
  conditionState: WasteConditionState;
  icon: string;
}[] = [
  {
    label: 'Botella o Envase Plástico (PET/PEAD)',
    queryName: 'Botella de plástico (PET)',
    primaryMaterial: 'plastico_pet',
    conditionState: 'limpio_seco',
    icon: '🧴',
  },
  {
    label: 'Caja de Cartón / Empaque Plegadizo',
    queryName: 'Caja de cartón corrugado',
    primaryMaterial: 'carton',
    conditionState: 'limpio_seco',
    icon: '📦',
  },
  {
    label: 'Papel, Hoja de Cuaderno o Periódico',
    queryName: 'Papel de oficina y archivo',
    primaryMaterial: 'papel',
    conditionState: 'limpio_seco',
    icon: '📄',
  },
  {
    label: 'Frasco o Botella de Vidrio',
    queryName: 'Botella o frasco de vidrio',
    primaryMaterial: 'vidrio',
    conditionState: 'limpio_seco',
    icon: '🍾',
  },
  {
    label: 'Lata de Aluminio o Conserva Metálica',
    queryName: 'Lata de aluminio (bebidas)',
    primaryMaterial: 'aluminio',
    conditionState: 'limpio_seco',
    icon: '🥫',
  },
  {
    label: 'Residuo Orgánico (Fruta, Verdura, Cáscara)',
    queryName: 'Restos de frutas y verduras crudas',
    primaryMaterial: 'organico',
    conditionState: 'organico_fresco',
    icon: '🍌',
  },
  {
    label: 'Servilleta Usada o Cartón con Grasa',
    queryName: 'Servilleta o papel higiénico usado',
    primaryMaterial: 'papel',
    conditionState: 'contaminado_comida',
    icon: '🧻',
  },
  {
    label: 'Caja de Leche o Jugo (Tetra Pak)',
    queryName: 'Envase multicapa (Tetra Pak)',
    primaryMaterial: 'multicapa',
    conditionState: 'limpio_seco',
    icon: '🧃',
  },
  {
    label: 'Pila, Medicamento, Bombillo o RAEE',
    queryName: 'Pilas y baterías domésticas',
    primaryMaterial: 'metal_quimico',
    conditionState: 'limpio_seco',
    icon: '🔋',
  },
];

/**
 * Redimensiona y comprime una imagen en el navegador para asegurar que llegue rápido
 * al modelo de IA y pueda almacenarse en el historial de Supabase sin exceder límites.
 */
function resizeImageDataUrl(
  dataUrl: string,
  maxDimension = 960,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width || 640;
      let height = img.height || 480;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

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
  const [userHintText, setUserHintText] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>(
    'Iniciando escáner...'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Estado cuando la imagen no es concluyente o requiere confirmación del usuario
  const [inconclusiveState, setInconclusiveState] = useState<{
    message: string;
    observations?: string;
    questions?: string[];
    imageBase64?: string;
  } | null>(null);

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
    if (scanMode === 'camera' && !inconclusiveState) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanMode, inconclusiveState]);

  const handleCaptureCamera = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        const optimizedUrl = await resizeImageDataUrl(rawDataUrl, 960, 0.82);
        setSelectedImage(optimizedUrl);
        analyzeImage(optimizedUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawResult = event.target?.result as string;
        const optimizedUrl = await resizeImageDataUrl(rawResult, 960, 0.82);
        setSelectedImage(optimizedUrl);
        analyzeImage(optimizedUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetScan = async (sampleId: string) => {
    const sample = SAMPLE_PRESETS_LIST.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedImage(sample.imageThumbnail);
    }
    setInconclusiveState(null);
    executeAnalysis({
      sampleId,
      conditionState: selectedCondition,
    });
  };

  const analyzeImage = (imageBase64: string) => {
    setInconclusiveState(null);
    executeAnalysis({
      imageBase64,
      userHint: userHintText.trim() || undefined,
      conditionState: selectedCondition,
    });
  };

  const executeAnalysis = async (payload: {
    imageBase64?: string;
    sampleId?: string;
    queryName?: string;
    primaryMaterial?: MaterialType;
    userHint?: string;
    conditionState?: WasteConditionState;
  }) => {
    setIsAnalyzing(true);
    setInconclusiveState(null);
    setAnalysisStep('Enviando imagen al motor de reconocimiento IA...');

    const steps = [
      'Identificando objeto y material principal (plástico, cartón, vidrio, metal, orgánico)...',
      'Evaluando filtro de Gestión Especial Posconsumo...',
      'Contrastando con motor multicriterio (Res. 2184/2019)...',
      'Guardando en tu historial y acreditando Puntos Eco...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setAnalysisStep(steps[stepIdx]);
        stepIdx++;
      }
    }, 500);

    try {
      const res = await fetch('/api/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          scanNonce: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          municipality: city,
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success && data.data) {
        // Comprimir miniatura para el historial (máx 380px) si es una foto en base64
        let historyImage =
          payload.imageBase64 || data.data.imageUrl || selectedImage || undefined;
        if (historyImage && historyImage.startsWith('data:image/')) {
          historyImage = await resizeImageDataUrl(historyImage, 380, 0.76);
        }

        const resultWithImage: WasteAnalysis = {
          ...data.data,
          imageUrl: historyImage,
        };
        onAnalysisComplete(resultWithImage, historyImage);
      } else {
        // El resultado no es concluyente o requiere confirmación: NO inventar "Botella PET"
        setInconclusiveState({
          message:
            data.error ||
            'No se pudo identificar el residuo con suficiente confianza en la imagen.',
          observations: data.visualObservations,
          questions: data.followUpQuestions,
          imageBase64: payload.imageBase64 || selectedImage || undefined,
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      clearInterval(interval);
      setInconclusiveState({
        message:
          'No se pudo procesar la fotografía con suficiente certeza. Por favor toma otra foto más clara o confirma el material del residuo abajo.',
        imageBase64: payload.imageBase64 || selectedImage || undefined,
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
          onClick={() => {
            setInconclusiveState(null);
            setScanMode('camera');
          }}
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
            setInconclusiveState(null);
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
          onClick={() => {
            setInconclusiveState(null);
            setScanMode('preset');
          }}
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
          onClick={() => {
            setInconclusiveState(null);
            setScanMode('catalog');
          }}
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

      {/* PANEL CUANDO EL RESULTADO NO ES CONCLUYENTE O REQUIERE CONFIRMACIÓN (NUNCA INVENTA DATOS) */}
      {inconclusiveState && (
        <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-3xl p-4 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex items-start gap-3">
            {inconclusiveState.imageBase64 ? (
              <img
                src={inconclusiveState.imageBase64}
                alt="Foto capturada"
                className="w-20 h-20 rounded-2xl object-cover border border-amber-400/40 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1 flex-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3 h-3" />
                Resultado No Concluyente
              </span>
              <h3 className="text-sm font-black text-white leading-snug">
                Se requiere una toma más clara o confirmar el material
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {inconclusiveState.message}
              </p>
              {inconclusiveState.observations && (
                <p className="text-[11px] text-amber-200/90 italic">
                  Observación: {inconclusiveState.observations}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setInconclusiveState(null);
                setScanMode('camera');
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tomar Otra Fotografía</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Subir Otra Foto</span>
            </button>
          </div>

          {/* Confirmación rápida asistida para no inventar jamás un residuo incorrecto */}
          <div className="pt-3 border-t border-amber-500/30 space-y-2.5">
            <p className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ¿Qué residuo aparece en tu foto? Selecciónalo para clasificarlo con precisión:
            </p>

            {/* Buscador rápido por nombre */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={userHintText}
                onChange={(e) => setUserHintText(e.target.value)}
                placeholder="Ej. Caja de leche, cáscara de banano, vaso de cartón..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                disabled={!userHintText.trim()}
                onClick={() =>
                  executeAnalysis({
                    queryName: userHintText.trim(),
                    imageBase64: inconclusiveState.imageBase64,
                    conditionState: selectedCondition,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-500 disabled:opacity-40 text-slate-950 font-black text-xs"
              >
                Clasificar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {QUICK_MATERIAL_CONFIRMATIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    executeAnalysis({
                      queryName: item.queryName,
                      primaryMaterial: item.primaryMaterial,
                      conditionState: selectedCondition || item.conditionState,
                      imageBase64: inconclusiveState.imageBase64,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/60 text-left flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-bold text-white truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-400 flex-shrink-0">
                    Elegir →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera Viewfinder Box */}
      {scanMode === 'camera' && !inconclusiveState && (
        <div className="space-y-2.5">
          {/* Pista opcional para mejorar aún más la precisión de la cámara */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={userHintText}
              onChange={(e) => setUserHintText(e.target.value)}
              placeholder="Pista opcional (ej. caja de pizza, lata, cáscara, vaso)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

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
                    'Permite el acceso a tu cámara o selecciona Galería / Muestras / Catálogo para evaluar al instante.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    Reintentar Cámara
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors"
                  >
                    Subir Foto
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
                    Encuadra el residuo con buena iluminación
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
        </div>
      )}

      {/* Upload Mode UI */}
      {scanMode === 'upload' && !inconclusiveState && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] bg-slate-900/80 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Upload className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">
              Haz clic para tomar o subir una fotografía
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Analiza plástico, papel, cartón, vidrio, metal, orgánicos y posconsumo
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
              Muestras Verificadas de Residuos Colombianos
            </p>
            <p>
              Selecciona cualquier residuo para analizarlo, guardarlo automáticamente en tu historial y acreditar sus Puntos Eco:
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
              placeholder="Buscar residuo por nombre o sinónimo colombiano..."
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
                    primaryMaterial: item.primaryMaterial,
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
            Analizando con <span className="text-emerald-400">Motor EcoScan</span>
          </h3>

          <p className="text-xs text-emerald-300 font-medium mt-2 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/30">
            {analysisStep}
          </p>

          <p className="text-[11px] text-slate-400 max-w-xs mt-6 leading-relaxed">
            Contrastando material principal, categoría de separación, programas Posconsumo y Resolución 2184 de 2019.
          </p>
        </div>
      )}
    </div>
  );
};
