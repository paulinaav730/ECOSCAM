"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ecoscan-ui/Header';
import { BottomNavigation } from '@/components/ecoscan-ui/BottomNavigation';
import { HomeScreen } from '@/components/ecoscan-ui/HomeScreen';
import { ScanScreen } from '@/components/ecoscan-ui/ScanScreen';
import { ResultScreen } from '@/components/ecoscan-ui/ResultScreen';
import { HistoryScreen } from '@/components/ecoscan-ui/HistoryScreen';
import { ProfileScreen } from '@/components/ecoscan-ui/ProfileScreen';
import {
  EcoWorldScreen,
  EcoWorldProgressData,
  INITIAL_ECOWORLD_PROGRESS,
} from '@/components/ecoscan-ui/EcoWorldScreen';
import {
  AuthScreen,
  SCIENTIFIC_ECO_FACTS,
} from '@/components/ecoscan-ui/AuthScreen';
import {
  TabType,
  WasteAnalysis,
  HistoryItem,
  UserProfile,
  Badge,
} from '@/components/ecoscan-ui/types';
import { buildMultiCriteriaAnalysis } from '@/lib/recycling-adapter';
import { WasteConditionState } from '@/types/ecoscan';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Primer Escaneo',
    description:
      'Comenzaste tu camino hacia la economía circular en Colombia.',
    icon: '🌱',
    category: 'Primeros Pasos',
    rarity: 'Común',
    rewardPoints: 20,
    howToUnlock:
      'Escanea y guarda tu primer residuo en tu historial personal de EcoScan.',
    unlocked: false,
    progress: { current: 0, total: 1 },
  },
  {
    id: 'badge-2',
    title: 'Maestro del Blanco',
    description:
      'Clasificaste correctamente 2 o más residuos reciclables secos (plástico, papel, cartón o metal).',
    icon: '♻️',
    category: 'Materiales',
    rarity: 'Raro',
    rewardPoints: 30,
    howToUnlock:
      'Guarda al menos 2 residuos limpios y secos en la ruta de aprovechamiento (Blanco).',
    unlocked: false,
    progress: { current: 0, total: 2 },
  },
  {
    id: 'badge-3',
    title: 'Compostador Verde',
    description:
      'Separaste residuos orgánicos de cocina o jardín para generar abono.',
    icon: '🍌',
    category: 'Materiales',
    rarity: 'Raro',
    rewardPoints: 25,
    howToUnlock:
      'Guarda al menos 1 residuo orgánico para aprovechamiento en compostaje (Verde).',
    unlocked: false,
    progress: { current: 0, total: 1 },
  },
  {
    id: 'badge-4',
    title: 'Coleccionista de PET',
    description: 'Identificaste botellas y envases de plástico PET reciclables.',
    icon: '🧴',
    category: 'Materiales',
    rarity: 'Común',
    rewardPoints: 20,
    howToUnlock:
      'Escanea y guarda 1 o más productos de plástico o PET en EcoScan.',
    unlocked: false,
    progress: { current: 0, total: 1 },
  },
  {
    id: 'badge-5',
    title: 'Guardián del Aluminio',
    description:
      'Evitaste la minería extractiva al reciclar latas y envases de metal.',
    icon: '🥫',
    category: 'Materiales',
    rarity: 'Raro',
    rewardPoints: 35,
    howToUnlock:
      'Escanea y guarda latas de conservas o bebidas (categoría metal).',
    unlocked: false,
    progress: { current: 0, total: 1 },
  },
  {
    id: 'badge-6',
    title: 'Cero Contaminación',
    description:
      'Aislaste un residuo contaminado con grasa o de ruta Posconsumo especial.',
    icon: '🛑',
    category: 'Hábitos Eco',
    rarity: 'Épico',
    rewardPoints: 40,
    howToUnlock:
      'Registra un residuo de ruta Negra o Posconsumo (evitando contaminar la bolsa blanca).',
    unlocked: false,
    progress: { current: 0, total: 1 },
  },
  {
    id: 'badge-7',
    title: 'Ciudadano Res. 2184',
    description:
      'Dominas la separación multicriterio y el código unificado de Colombia.',
    icon: '🇨🇴',
    category: 'Especiales Colombia',
    rarity: 'Épico',
    rewardPoints: 50,
    howToUnlock:
      'Acumula al menos 3 residuos escaneados y guardados en tu historial.',
    unlocked: false,
    progress: { current: 0, total: 3 },
  },
  {
    id: 'badge-8',
    title: 'Eco Peso Pesado',
    description:
      'Has aportado la separación estimada de más de 0.5 kg de residuos.',
    icon: '⚖️',
    category: 'Hábitos Eco',
    rarity: 'Épico',
    rewardPoints: 60,
    howToUnlock:
      'Alcanza una cifra estimada de 0.5 kg o más reciclados en tu historial.',
    unlocked: false,
    progress: { current: 0, total: 0.5 },
  },
  {
    id: 'badge-9',
    title: 'Explorador Circular',
    description: 'Clasificaste residuos en al menos 2 categorías distintas.',
    icon: '🔍',
    category: 'Primeros Pasos',
    rarity: 'Raro',
    rewardPoints: 35,
    howToUnlock:
      'Guarda residuos de al menos 2 materiales diferentes (plástico, orgánico, metal, posconsumo, etc.).',
    unlocked: false,
    progress: { current: 0, total: 2 },
  },
  {
    id: 'badge-10',
    title: 'Héroe del Planeta',
    description: 'Llegaste a los 100 Puntos Eco acumulados en tu perfil.',
    icon: '🏆',
    category: 'Especiales Colombia',
    rarity: 'Legendario',
    rewardPoints: 100,
    howToUnlock: 'Alcanza 100 o más Puntos Eco totales con tus registros y misiones.',
    unlocked: false,
    progress: { current: 0, total: 100 },
  },
];

function getHistoryStorageKey(email?: string): string {
  const cleanEmail = (email || 'anon').trim().toLowerCase();
  return `ecoScan_personalHistory_v3_${cleanEmail}`;
}

function getEcoWorldStorageKey(email?: string): string {
  const cleanEmail = (email || 'anon').trim().toLowerCase();
  return `ecoScan_ecoWorld_v1_${cleanEmail}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [activeAnalysis, setActiveAnalysis] = useState<WasteAnalysis | null>(
    null
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedCatalogQuery, setSelectedCatalogQuery] = useState<
    string | null
  >(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Por defecto al entrar por primera vez sin sesión abierta: isLoggedIn = false
  const [userAccount, setUserAccount] = useState<{
    name: string;
    email: string;
    city: string;
    isLoggedIn: boolean;
  }>({
    name: '',
    email: '',
    city: 'Bogotá, Colombia',
    isLoggedIn: false,
  });

  // Todo usuario nuevo empieza con historial vacío (0 puntos, 0 escaneados, 0 medallas)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ecoWorldProgress, setEcoWorldProgress] =
    useState<EcoWorldProgressData>(INITIAL_ECOWORLD_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate account, personal history, and Eco World progress from localStorage on client mount
  useEffect(() => {
    try {
      const savedAccount = localStorage.getItem('ecoScan_authSession_v2');
      if (savedAccount) {
        const parsedAccount = JSON.parse(savedAccount);
        setUserAccount(parsedAccount);
        if (parsedAccount?.email) {
          const userHistoryRaw = localStorage.getItem(
            getHistoryStorageKey(parsedAccount.email)
          );
          setHistory(userHistoryRaw ? JSON.parse(userHistoryRaw) : []);

          const userEcoWorldRaw = localStorage.getItem(
            getEcoWorldStorageKey(parsedAccount.email)
          );
          setEcoWorldProgress(
            userEcoWorldRaw
              ? JSON.parse(userEcoWorldRaw)
              : INITIAL_ECOWORLD_PROGRESS
          );
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    setHydrated(true);
  }, []);

  // Save account session
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        'ecoScan_authSession_v2',
        JSON.stringify(userAccount)
      );
    } catch (e) {
      console.error('Error saving user account:', e);
    }
  }, [userAccount, hydrated]);

  // Save personal history scoped by the logged-in user's email
  useEffect(() => {
    if (!hydrated || !userAccount.isLoggedIn || !userAccount.email) return;
    try {
      localStorage.setItem(
        getHistoryStorageKey(userAccount.email),
        JSON.stringify(history)
      );
    } catch (e) {
      console.error('Error saving personal history:', e);
    }
  }, [history, userAccount.isLoggedIn, userAccount.email, hydrated]);

  // Save Eco World progress scoped by the logged-in user's email
  useEffect(() => {
    if (!hydrated || !userAccount.isLoggedIn || !userAccount.email) return;
    try {
      localStorage.setItem(
        getEcoWorldStorageKey(userAccount.email),
        JSON.stringify(ecoWorldProgress)
      );
    } catch (e) {
      console.error('Error saving Eco World progress:', e);
    }
  }, [ecoWorldProgress, userAccount.isLoggedIn, userAccount.email, hydrated]);

  // Sistema unificado de puntos: Puntos de Escaneo ECOSCAM + Puntos Extra ECO WORLD
  const scanPoints = history.reduce(
    (acc, curr) => acc + (curr.ecoPoints || 15),
    0
  );
  const ecoWorldPoints = ecoWorldProgress.totalEcoWorldPoints || 0;
  const calculatedPoints = scanPoints + ecoWorldPoints;

  const scannedCount = history.length;
  const kgEstimate = Number((scannedCount * 0.35).toFixed(1));
  const levelNumber = Math.floor(calculatedPoints / 100) + 1;

  const levelNames = [
    'Eco Novato',
    'Eco Aprendiz',
    'Eco Guardián',
    'Eco Maestro',
    'Eco Héroe',
  ];
  const levelName =
    levelNames[Math.min(levelNumber - 1, levelNames.length - 1)];

  const whiteBinCount = history.filter((h) => h.binColor === 'Blanco').length;
  const greenBinCount = history.filter((h) => h.binColor === 'Verde').length;
  const blackOrPosconsumoCount = history.filter(
    (h) => h.binColor === 'Negro' || h.binColor === 'Posconsumo'
  ).length;
  const plasticCount = history.filter((h) => h.category === 'plástico').length;
  const metalCount = history.filter((h) => h.category === 'metal').length;
  const uniqueCategories = new Set(history.map((h) => h.category)).size;

  const badges = INITIAL_BADGES.map((b) => {
    let unlocked = false;
    let progress = b.progress;

    if (b.id === 'badge-1') {
      unlocked = scannedCount >= 1;
      progress = { current: Math.min(scannedCount, 1), total: 1 };
    } else if (b.id === 'badge-2') {
      unlocked = whiteBinCount >= 2;
      progress = { current: Math.min(whiteBinCount, 2), total: 2 };
    } else if (b.id === 'badge-3') {
      unlocked = greenBinCount >= 1;
      progress = { current: Math.min(greenBinCount, 1), total: 1 };
    } else if (b.id === 'badge-4') {
      unlocked = plasticCount >= 1;
      progress = { current: Math.min(plasticCount, 1), total: 1 };
    } else if (b.id === 'badge-5') {
      unlocked = metalCount >= 1;
      progress = { current: Math.min(metalCount, 1), total: 1 };
    } else if (b.id === 'badge-6') {
      unlocked = blackOrPosconsumoCount >= 1;
      progress = { current: Math.min(blackOrPosconsumoCount, 1), total: 1 };
    } else if (b.id === 'badge-7') {
      unlocked = scannedCount >= 3;
      progress = { current: Math.min(scannedCount, 3), total: 3 };
    } else if (b.id === 'badge-8') {
      unlocked = kgEstimate >= 0.5;
      progress = { current: kgEstimate, total: 0.5 };
    } else if (b.id === 'badge-9') {
      unlocked = uniqueCategories >= 2;
      progress = { current: Math.min(uniqueCategories, 2), total: 2 };
    } else if (b.id === 'badge-10') {
      unlocked = calculatedPoints >= 100;
      progress = { current: Math.min(calculatedPoints, 100), total: 100 };
    }

    return {
      ...b,
      unlocked,
      unlockedAt: unlocked ? new Date().toISOString() : undefined,
      progress,
    };
  });

  const userProfile: UserProfile = {
    name: userAccount.name || 'Usuario EcoScan',
    email: userAccount.email,
    city: userAccount.city || 'Bogotá, Colombia',
    isLoggedIn: userAccount.isLoggedIn,
    levelName,
    levelNumber,
    totalPoints: calculatedPoints,
    scanPoints,
    ecoWorldPoints,
    ecoWorldMissionsCompleted: ecoWorldProgress.missionsCompleted,
    pointsToNextLevel: 100,
    scannedCount,
    kgRecycledEstimate: kgEstimate,
    badges,
  };

  const handleLoginSuccess = (userData: {
    name: string;
    email: string;
    city: string;
  }) => {
    let personalHistory: HistoryItem[] = [];
    let personalEcoWorld: EcoWorldProgressData = INITIAL_ECOWORLD_PROGRESS;
    try {
      const savedUserHistory = localStorage.getItem(
        getHistoryStorageKey(userData.email)
      );
      if (savedUserHistory) {
        personalHistory = JSON.parse(savedUserHistory);
      }
      const savedUserEcoWorld = localStorage.getItem(
        getEcoWorldStorageKey(userData.email)
      );
      if (savedUserEcoWorld) {
        personalEcoWorld = JSON.parse(savedUserEcoWorld);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }

    setHistory(personalHistory);
    setEcoWorldProgress(personalEcoWorld);
    setActiveAnalysis(null);
    setUserAccount({
      name: userData.name,
      email: userData.email,
      city: userData.city,
      isLoggedIn: true,
    });
    setActiveTab('inicio');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserAccount({
      name: '',
      email: '',
      city: 'Bogotá, Colombia',
      isLoggedIn: false,
    });
    setHistory([]);
    setEcoWorldProgress(INITIAL_ECOWORLD_PROGRESS);
    setActiveAnalysis(null);
    setIsAuthModalOpen(false);
  };

  const handleAnalysisComplete = (result: WasteAnalysis, imageUrl?: string) => {
    const finalResult = { ...result, imageUrl: imageUrl || result.imageUrl };
    setActiveAnalysis(finalResult);
    setActiveTab('resultado');
  };

  const handleReevaluateCondition = (newCondition: WasteConditionState) => {
    if (!activeAnalysis) return;
    const updated = buildMultiCriteriaAnalysis({
      objectName: activeAnalysis.wasteName,
      primaryMaterial: activeAnalysis.primaryMaterial || 'plastico_pet',
      conditionState: newCondition,
      requiresSpecialManagement: activeAnalysis.requiresSpecialManagement,
      municipality: userProfile.city,
      imageUrl: activeAnalysis.imageUrl,
    });
    setActiveAnalysis(updated);
  };

  const handleSaveToHistory = (analysis: WasteAnalysis) => {
    const newItem: HistoryItem = {
      ...analysis,
      id: 'scan-' + Date.now(),
      scannedAt: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (
      window.confirm('¿Seguro que deseas borrar tu historial de reciclaje?')
    ) {
      setHistory([]);
      setActiveAnalysis(null);
    }
  };

  const handleSelectPresetFromHome = (presetId: string) => {
    setSelectedPresetId(presetId);
    setActiveTab('escanear');
  };

  const handleSelectCatalogQueryFromHome = (queryName: string) => {
    setSelectedCatalogQuery(queryName);
    setActiveTab('escanear');
  };

  const handleSelectHistoryDetail = (item: HistoryItem) => {
    setActiveAnalysis(item);
    setActiveTab('resultado');
  };

  const handleResetData = () => {
    if (userAccount.email) {
      localStorage.removeItem(getHistoryStorageKey(userAccount.email));
      localStorage.removeItem(getEcoWorldStorageKey(userAccount.email));
    }
    setHistory([]);
    setEcoWorldProgress(INITIAL_ECOWORLD_PROGRESS);
    setActiveAnalysis(null);
  };

  // Si aún no ha iniciado sesión ni se ha registrado, mostrar directamente la pantalla de bienvenida/registro rodeada de datos científicos y ambientales
  if (!userAccount.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden flex items-center justify-center p-4 md:p-8">
        {/* Ambient Gradient Background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-60 z-0"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, #064e3b 0%, transparent 50%), radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column (Desktop): Scientific & Environmental Insights */}
          <div className="hidden lg:flex lg:col-span-4 flex-col space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black tracking-wider uppercase w-fit">
              <span>🇨🇴 Ciencia y Sostenibilidad</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight text-white">
              Datos científicos que transforman hábitos.
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cada residuo tiene una huella química y energética distinta.
              Conoce por qué el estado de limpieza y la separación en la fuente
              son decisivos:
            </p>

            <div className="space-y-3 pt-1">
              {SCIENTIFIC_ECO_FACTS.slice(0, 3).map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1.5 shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-emerald-400">
                      <IconComp className="w-4 h-4" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {item.fact}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Auth Screen Card */}
          <div className="lg:col-span-4 w-full max-w-md mx-auto">
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          </div>

          {/* Right Column (Desktop): More Environmental & Circular Economy Facts */}
          <div className="hidden lg:flex lg:col-span-4 flex-col space-y-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 space-y-3 shadow-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/15 px-2.5 py-1 rounded-full border border-teal-500/30">
                Economía Circular en Colombia
              </span>
              <h3 className="text-base font-black text-white leading-snug">
                Más allá del color de la caneca
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                En Colombia se generan cerca de 12 millones de toneladas de
                residuos al año. Cuando entregas tus envases limpios y secos,
                dignificas la labor de más de 60.000 recicladores de oficio.
              </p>
            </div>

            {SCIENTIFIC_ECO_FACTS.slice(3, 5).map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1.5 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-teal-400">
                    <IconComp className="w-4 h-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {item.fact}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Geometric Balance Ambient Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60 z-0"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, #064e3b 0%, transparent 50%), radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex items-center justify-center p-0 md:p-6 gap-8">
        {/* Desktop Side Hero Panel (Geometric Balance Theme) */}
        <div className="hidden md:flex flex-col flex-1 max-w-sm space-y-6 text-left py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black tracking-wider uppercase w-fit">
            <span>🇨🇴 EcoScan AI + Eco World 2D</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight leading-tight text-white">
            Reciclar nunca fue tan inteligente.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Identifica tus residuos con Inteligencia Artificial, evalúa su{' '}
            <strong>estado de limpieza y ruta Posconsumo</strong>, y juega{' '}
            <strong className="text-emerald-400">ECO WORLD</strong> para
            recuperar ecosistemas virtuales y ganar puntos extra.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <p className="text-2xl font-black text-emerald-400">
                {userProfile.totalPoints}
              </p>
              <p className="text-xs font-bold text-slate-400">
                Puntos Eco Totales
              </p>
              <p className="text-[10px] text-slate-500">
                {scanPoints} escaneo + {ecoWorldPoints} Eco World
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <p className="text-2xl font-black text-teal-300">
                {userProfile.badges.filter((b) => b.unlocked).length} /{' '}
                {userProfile.badges.length}
              </p>
              <p className="text-xs font-bold text-slate-400">
                Medallas Desbloqueadas
              </p>
              <p className="text-[10px] text-slate-500">
                {ecoWorldProgress.missionsCompleted} / 4 ecosistemas
              </p>
            </div>
          </div>
        </div>

        {/* Central Mobile Frame Container */}
        <div className="w-full max-w-md min-h-screen md:min-h-[740px] md:h-[780px] flex flex-col relative shadow-2xl bg-slate-950 md:border md:border-slate-800 md:rounded-[40px] overflow-hidden">
          {/* Header Bar */}
          <Header
            currentTab={activeTab}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Main Screen Content View */}
          <main className="flex-1 px-4 pt-4 overflow-y-auto scrollbar-none">
            {activeTab === 'inicio' && (
              <HomeScreen
                setActiveTab={setActiveTab}
                userProfile={userProfile}
                onSelectPreset={handleSelectPresetFromHome}
                onSelectCatalogQuery={handleSelectCatalogQueryFromHome}
              />
            )}

            {activeTab === 'ecoworld' && (
              <EcoWorldScreen
                userProfile={userProfile}
                progress={ecoWorldProgress}
                onUpdateProgress={setEcoWorldProgress}
              />
            )}

            {activeTab === 'escanear' && (
              <ScanScreen
                onAnalysisComplete={handleAnalysisComplete}
                selectedPresetId={selectedPresetId}
                clearPresetId={() => setSelectedPresetId(null)}
                selectedCatalogQuery={selectedCatalogQuery}
                clearCatalogQuery={() => setSelectedCatalogQuery(null)}
                city={userProfile.city}
              />
            )}

            {activeTab === 'resultado' && (
              <ResultScreen
                analysis={activeAnalysis}
                onSaveToHistory={handleSaveToHistory}
                setActiveTab={setActiveTab}
                onReevaluateCondition={handleReevaluateCondition}
              />
            )}

            {activeTab === 'historial' && (
              <HistoryScreen
                history={history}
                onDeleteItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                setActiveTab={setActiveTab}
                onSelectHistoryDetail={handleSelectHistoryDetail}
              />
            )}

            {activeTab === 'perfil' && (
              <ProfileScreen
                userProfile={userProfile}
                onResetData={handleResetData}
                onAddSampleHistory={() => {}}
                setActiveTab={setActiveTab}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation
            currentTab={activeTab}
            setActiveTab={setActiveTab}
            hasScanResult={activeAnalysis !== null}
          />
        </div>
      </div>

      {/* Auth Screen Modal Overlay (when changing account while logged in) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-none">
            <AuthScreen
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
