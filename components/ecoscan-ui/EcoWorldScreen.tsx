"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Star,
  Cpu,
  Trees,
  Waves,
  Building2,
  Flower2,
  Flame,
  Hand,
} from 'lucide-react';
import {
  UserProfile,
  EcosystemId,
  EcoWorldMissionMilestoneState,
} from './types';
import { wokwiBridge } from '@/lib/wokwi/esp32-controller';

export interface EcoWorldProgressData {
  totalEcoWorldPoints: number;
  missionsCompleted: number;
  ecosystems: Record<EcosystemId, EcoWorldMissionMilestoneState>;
  unlockedGameBadges: string[];
}

export const INITIAL_ECOWORLD_PROGRESS: EcoWorldProgressData = {
  totalEcoWorldPoints: 0,
  missionsCompleted: 0,
  ecosystems: {
    parque_olvidado: {
      unlocked: true,
      completed: false,
      recoveryPct: 0,
      bestScore: 0,
      stars: 0,
      rewardedCompletion: false,
      rewardedObjectives: false,
      rewardedPerfect: false,
    },
    rio_contaminado: {
      unlocked: false,
      completed: false,
      recoveryPct: 0,
      bestScore: 0,
      stars: 0,
      rewardedCompletion: false,
      rewardedObjectives: false,
      rewardedPerfect: false,
    },
    bosque_perdido: {
      unlocked: false,
      completed: false,
      recoveryPct: 0,
      bestScore: 0,
      stars: 0,
      rewardedCompletion: false,
      rewardedObjectives: false,
      rewardedPerfect: false,
    },
    ciudad_verde: {
      unlocked: false,
      completed: false,
      recoveryPct: 0,
      bestScore: 0,
      stars: 0,
      rewardedCompletion: false,
      rewardedObjectives: false,
      rewardedPerfect: false,
    },
  },
  unlockedGameBadges: [],
};

interface EcosystemMetadata {
  id: EcosystemId;
  order: number;
  name: string;
  subtitle: string;
  description: string;
  targetItems: number;
  timeLimitSeconds: number;
  badgeId: string;
  badgeTitle: string;
  badgeIcon: string;
}

export const ECOSYSTEMS_CATALOG: EcosystemMetadata[] = [
  {
    id: 'parque_olvidado',
    order: 1,
    name: '1. Parque Olvidado',
    subtitle: 'Restauración de praderas, árboles y senderos urbanos',
    description:
      'El parque central del barrio ha quedado cubierto de botellas, latas, cajas engrasadas y pilas. Recoge y clasifica cada residuo en su contenedor oficial para devolverle las flores, hojas y mariposas.',
    targetItems: 8,
    timeLimitSeconds: 85,
    badgeId: 'ecoworld-parque',
    badgeTitle: 'Restaurador del Parque',
    badgeIcon: '🦋',
  },
  {
    id: 'rio_contaminado',
    order: 2,
    name: '2. Río Contaminado',
    subtitle: 'Limpieza de riberas y protección de fuentes hídricas',
    description:
      'Evita que plásticos, aceites usados y empaques lleguen a la corriente del río. Clasifica a tiempo para que el agua recupere su pureza cristalina y regresen los peces y aves.',
    targetItems: 9,
    timeLimitSeconds: 90,
    badgeId: 'ecoworld-rio',
    badgeTitle: 'Guardián del Agua',
    badgeIcon: '💧',
  },
  {
    id: 'bosque_perdido',
    order: 3,
    name: '3. Bosque Perdido',
    subtitle: 'Regeneración de biodiversidad y suelos',
    description:
      'Separa los residuos orgánicos para compostar y aísla los residuos peligrosos abandonados en el sendero forestal para regenerar el bosque.',
    targetItems: 10,
    timeLimitSeconds: 95,
    badgeId: 'ecoworld-bosque',
    badgeTitle: 'Protector del Bosque',
    badgeIcon: '🌳',
  },
  {
    id: 'ciudad_verde',
    order: 4,
    name: '4. Ciudad Verde',
    subtitle: 'Economía circular y ciudadanía sostenible',
    description:
      'La misión maestra: coordina la separación multicriterio (Blanco, Verde, Negro y Punto Posconsumo) para transformar la metrópoli en una Ciudad Verde modelo en Colombia.',
    targetItems: 10,
    timeLimitSeconds: 100,
    badgeId: 'ecoworld-ciudad',
    badgeTitle: 'Arquitecto Circular',
    badgeIcon: '🏙️',
  },
];

type GameBinType = 'blanco' | 'verde' | 'negro' | 'posconsumo';

interface SpawnableWasteTemplate {
  name: string;
  shortLabel: string;
  materialDesc: string;
  bin: GameBinType;
  emoji: string;
  color: string;
  hint: string;
}

const WASTE_TEMPLATES: SpawnableWasteTemplate[] = [
  {
    name: 'Botella Plástica PET Limpia',
    shortLabel: 'PET Limpio',
    materialDesc: 'Plástico PET • Limpio y seco',
    bin: 'blanco',
    emoji: '🧴',
    color: '#38BDF8',
    hint: 'Plástico limpio y seco → Caneca Blanca (Aprovechable)',
  },
  {
    name: 'Lata de Aluminio Vacía',
    shortLabel: 'Lata Aluminio',
    materialDesc: 'Metal Aluminio • Limpio y seco',
    bin: 'blanco',
    emoji: '🥫',
    color: '#E2E8F0',
    hint: 'Metal limpio → Caneca Blanca (Aprovechable)',
  },
  {
    name: 'Caja de Cartón Seca',
    shortLabel: 'Cartón Seco',
    materialDesc: 'Cartón corrugado • Sin grasa',
    bin: 'blanco',
    emoji: '📦',
    color: '#FBBF24',
    hint: 'Cartón limpio sin grasa → Caneca Blanca (Aprovechable)',
  },
  {
    name: 'Botella de Vidrio Transparente',
    shortLabel: 'Vidrio Limpio',
    materialDesc: 'Vidrio de envase • Enjuagado y seco',
    bin: 'blanco',
    emoji: '🍾',
    color: '#67E8F9',
    hint: 'Vidrio limpio → Caneca Blanca (Aprovechable)',
  },
  {
    name: 'Cáscara de Banano',
    shortLabel: 'Cáscara Fruta',
    materialDesc: 'Materia orgánica biodegradable',
    bin: 'verde',
    emoji: '🍌',
    color: '#4ADE80',
    hint: 'Orgánico compostable → Caneca Verde (Orgánicos)',
  },
  {
    name: 'Restos de Manzana y Verdura',
    shortLabel: 'Resto Orgánico',
    materialDesc: 'Residuo vegetal crudo',
    bin: 'verde',
    emoji: '🍎',
    color: '#22C55E',
    hint: 'Restos vegetales → Caneca Verde (Orgánicos)',
  },
  {
    name: 'Servilleta Usada con Grasa',
    shortLabel: 'Servilleta Sucia',
    materialDesc: 'Papel contaminado con comida/grasa',
    bin: 'negro',
    emoji: '🧻',
    color: '#94A3B8',
    hint: 'Papel con grasa no es reciclable → Caneca Negra (No Aprovechable)',
  },
  {
    name: 'Base de Caja de Pizza Engrasada',
    shortLabel: 'Cartón con Grasa',
    materialDesc: 'Cartón impregnado de aceite/queso',
    bin: 'negro',
    emoji: '🍕',
    color: '#64748B',
    hint: 'Cartón engrasado contamina el papel → Caneca Negra (No Aprovechable)',
  },
  {
    name: 'Pila Alcalina Descargada',
    shortLabel: 'Pila Usada',
    materialDesc: 'Metal químico / Peligroso',
    bin: 'posconsumo',
    emoji: '🔋',
    color: '#F59E0B',
    hint: 'Residuo peligroso → Punto Posconsumo Especial (Nunca en canecas domésticas)',
  },
  {
    name: 'Medicamento Vencido (Blíster)',
    shortLabel: 'Fármaco Vencido',
    materialDesc: 'Compuesto farmacéutico • Punto Azul',
    bin: 'posconsumo',
    emoji: '💊',
    color: '#FB923C',
    hint: 'Medicamento vencido → Punto Posconsumo (Punto Azul)',
  },
];

interface ActiveWasteEntity extends SpawnableWasteTemplate {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
}

interface FloatingFeedback {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface GameResultSummary {
  ecosystem: EcosystemMetadata;
  score: number;
  itemsCollected: number;
  correctClassifications: number;
  mistakes: number;
  durationSeconds: number;
  completedMission: boolean;
  completedAllObjectives: boolean;
  perfectRun: boolean;
  pointsAwarded: number;
  breakdown: { label: string; points: number; newlyEarned: boolean }[];
  unlockedBadge?: { title: string; icon: string } | null;
}

interface EcoWorldScreenProps {
  userProfile: UserProfile;
  progress: EcoWorldProgressData;
  onUpdateProgress: (newProgress: EcoWorldProgressData) => void;
}

const BINS_LAYOUT: {
  id: GameBinType;
  label: string;
  sublabel: string;
  shortRule: string;
  emoji: string;
  x: number;
  y: number;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  buttonBg: string;
}[] = [
  {
    id: 'blanco',
    label: 'CANECA BLANCA',
    sublabel: 'Aprovechables',
    shortRule: 'Plástico, Cartón, Vidrio, Metal limpios',
    emoji: '⚪',
    x: 130,
    y: 80,
    fillColor: '#F8FAFC',
    strokeColor: '#38BDF8',
    textColor: '#0F172A',
    buttonBg:
      'bg-white hover:bg-slate-100 text-slate-950 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20',
  },
  {
    id: 'verde',
    label: 'CANECA VERDE',
    sublabel: 'Orgánicos',
    shortRule: 'Frutas, Verduras, Cáscaras, Compost',
    emoji: '🟢',
    x: 335,
    y: 80,
    fillColor: '#16A34A',
    strokeColor: '#4ADE80',
    textColor: '#FFFFFF',
    buttonBg:
      'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300 shadow-lg shadow-emerald-500/25',
  },
  {
    id: 'negro',
    label: 'CANECA NEGRA',
    sublabel: 'No Aprovechables',
    shortRule: 'Servilletas, Grasa, Contaminados',
    emoji: '⚫',
    x: 545,
    y: 80,
    fillColor: '#1E293B',
    strokeColor: '#94A3B8',
    textColor: '#F8FAFC',
    buttonBg:
      'bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-500 shadow-lg shadow-slate-950/50',
  },
  {
    id: 'posconsumo',
    label: 'POSCONSUMO',
    sublabel: 'Especiales',
    shortRule: 'Pilas, Medicamentos, Bombillos, RAEE',
    emoji: '🟡',
    x: 750,
    y: 80,
    fillColor: '#D97706',
    strokeColor: '#FDE047',
    textColor: '#FFFFFF',
    buttonBg:
      'bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-yellow-300 shadow-lg shadow-amber-500/25',
  },
];

export const EcoWorldScreen: React.FC<EcoWorldScreenProps> = ({
  userProfile,
  progress,
  onUpdateProgress,
}) => {
  const [viewMode, setViewMode] = useState<'home' | 'map' | 'play' | 'result'>(
    'home'
  );
  const [activeEcosystem, setActiveEcosystem] = useState<EcosystemMetadata>(
    ECOSYSTEMS_CATALOG[0]
  );
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(85);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [heldWaste, setHeldWaste] = useState<ActiveWasteEntity | null>(null);
  const [nextWastePreview, setNextWastePreview] =
    useState<ActiveWasteEntity | null>(null);
  const [liveFeedbackBanner, setLiveFeedbackBanner] = useState<{
    type: 'correct' | 'mistake' | 'pickup';
    title: string;
    subtitle: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<GameResultSummary | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [wokwiSyncEnabled, setWokwiSyncEnabled] = useState(false);

  const toggleWokwiSync = () => {
    if (wokwiSyncEnabled) {
      wokwiBridge.disconnect();
      setWokwiSyncEnabled(false);
    } else {
      wokwiBridge.startCloudSync('ECOSCAM');
      setWokwiSyncEnabled(true);
    }
  };

  // Canvas & Game Loop Refs (Escenario gigante 880x520)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({
    x: 440,
    y: 310,
    vx: 0,
    vy: 0,
    speed: 4.5,
    facing: 1,
    stepFrame: 0,
    targetX: null as number | null,
    targetY: null as number | null,
  });
  const keysRef = useRef<Record<string, boolean>>({});
  const touchDirRef = useRef({ dx: 0, dy: 0 });
  const wastesRef = useRef<ActiveWasteEntity[]>([]);
  const heldWasteRef = useRef<ActiveWasteEntity | null>(null);
  const feedbacksRef = useRef<FloatingFeedback[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const statsRef = useRef({
    score: 0,
    correct: 0,
    mistakes: 0,
    collected: 0,
    streak: 0,
    startTime: Date.now(),
    finished: false,
  });
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const globalRecoveryPct = Math.round(
    (Object.values(progress.ecosystems).reduce(
      (acc, curr) => acc + (curr.recoveryPct || 0),
      0
    ) /
      (ECOSYSTEMS_CATALOG.length * 100)) *
      100
  );

  const spawnBurstParticles = useCallback(
    (x: number, y: number, color: string) => {
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const speed = 2.0 + Math.random() * 3.8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 4 + Math.random() * 4,
          life: 1,
        });
      }
    },
    []
  );

  const addCanvasFeedback = useCallback(
    (x: number, y: number, text: string, color: string) => {
      feedbacksRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        text,
        color,
        alpha: 1,
      });
    },
    []
  );

  // Inicializar una partida nueva en el ecosistema elegido
  const startMission = useCallback((ecosystem: EcosystemMetadata) => {
    setActiveEcosystem(ecosystem);
    setIsPaused(false);
    setTimeLeft(ecosystem.timeLimitSeconds);
    setScore(0);
    setCorrectCount(0);
    setMistakesCount(0);
    setCollectedCount(0);
    setStreakCount(0);
    setHeldWaste(null);
    setLiveFeedbackBanner(null);
    heldWasteRef.current = null;
    feedbacksRef.current = [];
    particlesRef.current = [];

    playerRef.current = {
      x: 440,
      y: 310,
      vx: 0,
      vy: 0,
      speed: 4.5,
      facing: 1,
      stepFrame: 0,
      targetX: null,
      targetY: null,
    };

    const spawned: ActiveWasteEntity[] = [];
    for (let i = 0; i < ecosystem.targetItems; i++) {
      const tpl = WASTE_TEMPLATES[i % WASTE_TEMPLATES.length];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 125 + col * 205 + ((i * 41) % 50) - 25;
      const y = 215 + row * 125 + ((i * 31) % 45);
      spawned.push({
        ...tpl,
        id: `waste-${i}-${Date.now()}`,
        x: Math.max(80, Math.min(800, x)),
        y: Math.max(195, Math.min(455, y)),
        collected: false,
        bobOffset: i * 0.9,
      });
    }
    wastesRef.current = spawned;
    setNextWastePreview(spawned[0] || null);

    statsRef.current = {
      score: 0,
      correct: 0,
      mistakes: 0,
      collected: 0,
      streak: 0,
      startTime: Date.now(),
      finished: false,
    };

    setViewMode('play');
  }, []);

  // Finalizar misión y validar recompensas en el servidor (/api/ecoworld)
  const finishMission = useCallback(async () => {
    if (statsRef.current.finished) return;
    statsRef.current.finished = true;
    setIsSubmittingResult(true);

    const elapsedSeconds = Math.max(
      4,
      Math.round((Date.now() - statsRef.current.startTime) / 1000)
    );
    const sessionNonce = `ecoworld-${activeEcosystem.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const prevMilestones = progress.ecosystems[activeEcosystem.id];

    try {
      const res = await fetch('/api/ecoworld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionNonce,
          ecosystemId: activeEcosystem.id,
          itemsCollected: statsRef.current.collected,
          targetItems: activeEcosystem.targetItems,
          correctClassifications: statsRef.current.correct,
          mistakes: statsRef.current.mistakes,
          durationSeconds: elapsedSeconds,
          previousMilestones: prevMilestones,
        }),
      });

      const payload = await res.json();

      if (payload.success && payload.data) {
        const d = payload.data;
        const updatedEcosystems = {
          ...progress.ecosystems,
          [activeEcosystem.id]: d.updatedMilestoneState,
        };

        const currentIdx = ECOSYSTEMS_CATALOG.findIndex(
          (e) => e.id === activeEcosystem.id
        );
        if (
          d.completedMission &&
          currentIdx >= 0 &&
          currentIdx + 1 < ECOSYSTEMS_CATALOG.length
        ) {
          const nextEcoId = ECOSYSTEMS_CATALOG[currentIdx + 1].id;
          updatedEcosystems[nextEcoId] = {
            ...updatedEcosystems[nextEcoId],
            unlocked: true,
          };
        }

        const newBadges = [...progress.unlockedGameBadges];
        let newlyUnlockedBadge: { title: string; icon: string } | null = null;
        if (
          d.completedMission &&
          !newBadges.includes(activeEcosystem.badgeId)
        ) {
          newBadges.push(activeEcosystem.badgeId);
          newlyUnlockedBadge = {
            title: activeEcosystem.badgeTitle,
            icon: activeEcosystem.badgeIcon,
          };
        }

        const completedMissionsCount = Object.values(updatedEcosystems).filter(
          (e) => e.completed
        ).length;

        const nextProgress: EcoWorldProgressData = {
          totalEcoWorldPoints:
            progress.totalEcoWorldPoints + (Number(d.pointsAwarded) || 0),
          missionsCompleted: completedMissionsCount,
          ecosystems: updatedEcosystems,
          unlockedGameBadges: newBadges,
        };

        onUpdateProgress(nextProgress);

        setLastResult({
          ecosystem: activeEcosystem,
          score: d.verifiedScore,
          itemsCollected: statsRef.current.collected,
          correctClassifications: statsRef.current.correct,
          mistakes: statsRef.current.mistakes,
          durationSeconds: elapsedSeconds,
          completedMission: d.completedMission,
          completedAllObjectives: d.completedAllObjectives,
          perfectRun: d.perfectRun,
          pointsAwarded: d.pointsAwarded,
          breakdown: d.breakdown,
          unlockedBadge: newlyUnlockedBadge,
        });
      }
    } catch (err) {
      console.error('Error submitting Eco World session:', err);
    } finally {
      setIsSubmittingResult(false);
      setViewMode('result');
    }
  }, [activeEcosystem, onUpdateProgress, progress]);

  // Función central para clasificar un residuo en un contenedor (por colisión 2D o por botón gigante móvil)
  const evaluateBinDelivery = useCallback(
    (targetBinId: GameBinType) => {
      if (isPausedRef.current || statsRef.current.finished) return;

      const binInfo = BINS_LAYOUT.find((b) => b.id === targetBinId);
      if (!binInfo) return;

      // Si el jugador aún no tiene un residuo en la mano pero tocó un botón de caneca,
      // recoger automáticamente el siguiente residuo disponible en el mapa
      let currentItem = heldWasteRef.current;
      if (!currentItem) {
        const nextUncollected = wastesRef.current.find((w) => !w.collected);
        if (!nextUncollected) return;
        nextUncollected.collected = true;
        currentItem = nextUncollected;
        heldWasteRef.current = nextUncollected;
        statsRef.current.collected += 1;
        setCollectedCount(statsRef.current.collected);
      }

      // Mover visualmente al personaje hacia esa caneca
      playerRef.current.x = binInfo.x;
      playerRef.current.y = binInfo.y + 52;
      playerRef.current.targetX = null;
      playerRef.current.targetY = null;

      if (currentItem.bin === targetBinId) {
        // ¡ACIERTO!
        statsRef.current.streak += 1;
        const streakBonus = statsRef.current.streak >= 2 ? 25 : 0;
        const gained = 100 + streakBonus;
        statsRef.current.correct += 1;
        statsRef.current.score += gained;
        setCorrectCount(statsRef.current.correct);
        setScore(statsRef.current.score);
        setStreakCount(statsRef.current.streak);

        heldWasteRef.current = null;
        setHeldWaste(null);

        const nextAvailable =
          wastesRef.current.find((w) => !w.collected) || null;
        setNextWastePreview(nextAvailable);

        spawnBurstParticles(binInfo.x, binInfo.y + 15, '#22C55E');
        addCanvasFeedback(
          binInfo.x,
          binInfo.y + 35,
          `+${gained} PTS ¡CORRECTO!`,
          '#4ADE80'
        );

        setLiveFeedbackBanner({
          type: 'correct',
          title: `¡ACIERTO! +${gained} Puntos${
            statsRef.current.streak >= 2
              ? ` (🔥 Racha x${statsRef.current.streak})`
              : ''
          }`,
          subtitle: `${currentItem.name} clasificado correctamente en ${binInfo.label}.`,
        });

        wokwiBridge.sendTelemetryToDevice({
          ecosystemId: activeEcosystem.id,
          isPlaying: true,
          isPaused: false,
          score: statsRef.current.score,
          timeRemainingSeconds: timeLeft,
          recoveryPercentage: Math.round(
            (statsRef.current.correct / activeEcosystem.targetItems) * 100
          ),
          holdingWasteCategory: null,
          lastClassificationResult: 'correct',
        });

        const remaining = wastesRef.current.filter((w) => !w.collected).length;
        if (remaining === 0 && !heldWasteRef.current) {
          setTimeout(() => finishMission(), 650);
        }
      } else {
        // ¡ERROR DE CLASIFICACIÓN!
        statsRef.current.streak = 0;
        statsRef.current.mistakes += 1;
        statsRef.current.score = Math.max(0, statsRef.current.score - 25);
        setMistakesCount(statsRef.current.mistakes);
        setScore(statsRef.current.score);
        setStreakCount(0);

        // Asegurar que el residuo quede en mano para que el jugador lo deposite en la caneca correcta
        setHeldWaste(currentItem);
        playerRef.current.y = binInfo.y + 92;

        spawnBurstParticles(binInfo.x, binInfo.y + 20, '#EF4444');
        addCanvasFeedback(
          binInfo.x,
          binInfo.y + 45,
          `✕ ¡CANECA INCORRECTA! (-25)`,
          '#FCA5A5'
        );

        setLiveFeedbackBanner({
          type: 'mistake',
          title: `¡Cuidado! Ahí no va ${currentItem.name}`,
          subtitle: currentItem.hint,
        });

        wokwiBridge.sendTelemetryToDevice({
          ecosystemId: activeEcosystem.id,
          isPlaying: true,
          isPaused: false,
          score: statsRef.current.score,
          timeRemainingSeconds: timeLeft,
          recoveryPercentage: Math.round(
            (statsRef.current.correct / activeEcosystem.targetItems) * 100
          ),
          holdingWasteCategory: currentItem.bin,
          lastClassificationResult: 'mistake',
        });
      }
    },
    [
      activeEcosystem,
      addCanvasFeedback,
      finishMission,
      spawnBurstParticles,
      timeLeft,
    ]
  );

  // Recoger el siguiente residuo con 1 toque (ideal para celulares)
  const handleQuickPickupNextWaste = useCallback(() => {
    if (heldWasteRef.current) return;
    const nextW = wastesRef.current.find((w) => !w.collected);
    if (!nextW) return;
    playerRef.current.x = nextW.x;
    playerRef.current.y = nextW.y;
    nextW.collected = true;
    heldWasteRef.current = nextW;
    setHeldWaste(nextW);
    statsRef.current.collected += 1;
    setCollectedCount(statsRef.current.collected);
    setNextWastePreview(wastesRef.current.find((w) => !w.collected) || null);
    addCanvasFeedback(
      nextW.x,
      nextW.y - 25,
      `¡Recogido: ${nextW.shortLabel}!`,
      '#38BDF8'
    );
    setLiveFeedbackBanner({
      type: 'pickup',
      title: `En tus manos: ${nextW.name}`,
      subtitle: `Selecciona abajo la caneca correcta (${nextW.materialDesc}).`,
    });
  }, [addCanvasFeedback]);

  // Temporizador de cuenta regresiva durante la partida
  useEffect(() => {
    if (viewMode !== 'play') return;

    const timer = setInterval(() => {
      if (isPausedRef.current || statsRef.current.finished) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishMission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, finishMission]);

  // Teclado y puente Wokwi ESP32
  useEffect(() => {
    if (viewMode !== 'play') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;
      playerRef.current.targetX = null;
      playerRef.current.targetY = null;

      if (e.code === 'Space' || e.code === 'Enter') {
        if (!heldWasteRef.current) {
          handleQuickPickupNextWaste();
        }
      }
      if (e.code === 'Digit1') evaluateBinDelivery('blanco');
      if (e.code === 'Digit2') evaluateBinDelivery('verde');
      if (e.code === 'Digit3') evaluateBinDelivery('negro');
      if (e.code === 'Digit4') evaluateBinDelivery('posconsumo');
      if (e.code === 'KeyP') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const unsubscribeWokwi = wokwiBridge.onInput((packet) => {
      if (typeof packet.axisX === 'number') {
        touchDirRef.current.dx = packet.axisX;
      }
      if (typeof packet.axisY === 'number') {
        touchDirRef.current.dy = packet.axisY;
      }
      if (packet.buttonPrimaryPressed) {
        if (!heldWasteRef.current) {
          handleQuickPickupNextWaste();
        }
      }
      if (packet.buttonSecondaryPressed) {
        setIsPaused((p) => !p);
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      unsubscribeWokwi();
    };
  }, [viewMode, evaluateBinDelivery, handleQuickPickupNextWaste]);

  // Motor 2D en Canvas de Alta Resolución (880x520) con elementos grandes tipo juego móvil
  useEffect(() => {
    if (viewMode !== 'play') return;
    let animationFrameId: number;

    const renderLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width; // 880
      const H = canvas.height; // 520

      // 1. ACTUALIZACIÓN DE FÍSICA Y COLISIONES
      if (!isPausedRef.current && !statsRef.current.finished) {
        const p = playerRef.current;
        let dx = touchDirRef.current.dx;
        let dy = touchDirRef.current.dy;

        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) dx -= 1;
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) dx += 1;
        if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) dy -= 1;
        if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) dy += 1;

        if (dx === 0 && dy === 0 && p.targetX !== null && p.targetY !== null) {
          const distX = p.targetX - p.x;
          const distY = p.targetY - p.y;
          const dist = Math.hypot(distX, distY);
          if (dist > 8) {
            dx = distX / dist;
            dy = distY / dist;
          } else {
            p.targetX = null;
            p.targetY = null;
          }
        }

        if (dx !== 0 || dy !== 0) {
          const mag = Math.hypot(dx, dy) || 1;
          p.x += (dx / mag) * p.speed;
          p.y += (dy / mag) * p.speed;
          if (dx < -0.1) p.facing = -1;
          if (dx > 0.1) p.facing = 1;
          p.stepFrame += 0.24;
        }

        p.x = Math.max(45, Math.min(W - 45, p.x));
        p.y = Math.max(100, Math.min(H - 40, p.y));

        // Colisión amplia para recoger residuo fácilmente
        if (!heldWasteRef.current) {
          for (const w of wastesRef.current) {
            if (!w.collected && Math.hypot(p.x - w.x, p.y - w.y) < 48) {
              w.collected = true;
              heldWasteRef.current = w;
              setHeldWaste(w);
              statsRef.current.collected += 1;
              setCollectedCount(statsRef.current.collected);
              setNextWastePreview(
                wastesRef.current.find((item) => !item.collected) || null
              );
              addCanvasFeedback(
                p.x,
                p.y - 32,
                `¡Recogido: ${w.shortLabel}!`,
                '#38BDF8'
              );
              setLiveFeedbackBanner({
                type: 'pickup',
                title: `Recogiste: ${w.name}`,
                subtitle: `Toca abajo la caneca correcta o llévalo caminando (${w.materialDesc}).`,
              });
              break;
            }
          }
        } else {
          // Colisión amplia con cualquiera de los 4 contenedores superiores
          for (const bin of BINS_LAYOUT) {
            if (Math.hypot(p.x - bin.x, p.y - (bin.y + 24)) < 58) {
              evaluateBinDelivery(bin.id);
              break;
            }
          }
        }
      }

      // 2. CÁLCULO DE RECUPERACIÓN VISUAL DEL ECOSISTEMA
      const recoveryRatio = Math.min(
        1,
        statsRef.current.correct / Math.max(1, activeEcosystem.targetItems)
      );

      const lerpColor = (
        c1: [number, number, number],
        c2: [number, number, number],
        t: number
      ) => {
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
        return `rgb(${r}, ${g}, ${b})`;
      };

      // 3. DIBUJAR ESCENARIO GIGANTE 2D
      const skyTop = lerpColor([42, 46, 55], [14, 116, 144], recoveryRatio);
      const skyBottom = lerpColor([68, 64, 60], [6, 95, 70], recoveryRatio);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 145);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, 145);

      const grassTop = lerpColor([75, 70, 58], [16, 185, 129], recoveryRatio);
      const grassBottom = lerpColor([50, 47, 40], [5, 150, 105], recoveryRatio);
      const grassGrad = ctx.createLinearGradient(0, 145, 0, H);
      grassGrad.addColorStop(0, grassTop);
      grassGrad.addColorStop(1, grassBottom);
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 145, W, H - 145);

      // Senderos grandes del parque
      ctx.fillStyle = lerpColor([92, 87, 79], [214, 211, 209], recoveryRatio);
      ctx.fillRect(0, 136, W, 18);
      ctx.beginPath();
      ctx.roundRect(405, 145, 70, H - 145, 10);
      ctx.fill();

      // Laguna cristalina grande
      ctx.fillStyle = lerpColor([87, 83, 78], [45, 212, 191], recoveryRatio);
      ctx.beginPath();
      ctx.ellipse(735, 430, 95, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lerpColor(
        [120, 113, 108],
        [153, 246, 228],
        recoveryRatio
      );
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Árboles grandes que reverdecen
      const treePositions = [
        { x: 68, y: 210 },
        { x: 810, y: 215 },
        { x: 75, y: 430 },
        { x: 300, y: 450 },
      ];
      treePositions.forEach((t, idx) => {
        ctx.fillStyle = '#78350F';
        ctx.fillRect(t.x - 8, t.y, 16, 36);

        const radius = 22 + recoveryRatio * 18;
        ctx.fillStyle = lerpColor(
          [100, 90, 75],
          idx % 2 === 0 ? [34, 197, 94] : [16, 185, 129],
          recoveryRatio
        );
        ctx.beginPath();
        ctx.arc(t.x, t.y - 8, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(t.x - 16, t.y + 2, radius * 0.78, 0, Math.PI * 2);
        ctx.arc(t.x + 16, t.y + 2, radius * 0.78, 0, Math.PI * 2);
        ctx.fill();
      });

      // Flores que brotan
      if (recoveryRatio >= 0.2) {
        const flowerCount = Math.floor(recoveryRatio * 24);
        const flowerColors = [
          '#F472B6',
          '#FACC15',
          '#FB7185',
          '#38BDF8',
          '#A78BFA',
        ];
        for (let i = 0; i < flowerCount; i++) {
          const fx = 55 + ((i * 127) % 760);
          const fy = 180 + ((i * 83) % 305);
          ctx.fillStyle = flowerColors[i % flowerColors.length];
          ctx.beginPath();
          ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Mariposas animadas
      if (recoveryRatio >= 0.4) {
        const butterflyCount = Math.floor((recoveryRatio - 0.2) * 10);
        for (let b = 0; b < butterflyCount; b++) {
          const bx =
            140 + b * 110 + Math.sin(timestamp * 0.0025 + b * 1.7) * 55;
          const by =
            200 + (b % 3) * 80 + Math.cos(timestamp * 0.0035 + b) * 28;
          const wingSpread = Math.abs(Math.sin(timestamp * 0.015 + b)) * 8 + 3;

          ctx.fillStyle = b % 2 === 0 ? '#FDE047' : '#38BDF8';
          ctx.beginPath();
          ctx.ellipse(bx - 4, by, wingSpread, 5.5, 0.3, 0, Math.PI * 2);
          ctx.ellipse(bx + 4, by, wingSpread, 5.5, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. DIBUJAR LOS 4 CONTENEDORES EN TAMAÑO GRANDE
      BINS_LAYOUT.forEach((bin) => {
        ctx.save();
        if (heldWasteRef.current) {
          ctx.shadowColor = bin.strokeColor;
          ctx.shadowBlur = 14;
        }

        ctx.fillStyle = bin.fillColor;
        ctx.strokeStyle = bin.strokeColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(bin.x - 84, bin.y - 42, 168, 84, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = bin.textColor;
        ctx.font = '900 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bin.label, bin.x, bin.y - 10);
        ctx.font = '700 12px Inter, sans-serif';
        ctx.fillText(bin.sublabel, bin.x, bin.y + 10);

        ctx.font = '800 10px Inter, sans-serif';
        ctx.fillStyle = bin.id === 'blanco' ? '#0284C7' : '#A7F3D0';
        ctx.fillText('▼ TOCA PARA ENTREGAR', bin.x, bin.y + 30);
        ctx.restore();
      });

      // 5. DIBUJAR LOS RESIDUOS INTERACTIVOS EN TAMAÑO GRANDE
      const firstUncollectedId = wastesRef.current.find(
        (item) => !item.collected
      )?.id;

      wastesRef.current.forEach((w) => {
        if (w.collected) return;
        const bob = Math.sin(timestamp * 0.005 + w.bobOffset) * 4;
        const isHighlighted =
          !heldWasteRef.current && w.id === firstUncollectedId;

        // Sombra
        ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
        ctx.beginPath();
        ctx.ellipse(w.x, w.y + 22, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Anillo pulsante para el siguiente residuo sugerido
        if (isHighlighted) {
          const pulse = 31 + Math.sin(timestamp * 0.008) * 5;
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(w.x, w.y + bob, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Burbuja grande del residuo
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = isHighlighted ? '#FACC15' : w.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(w.x, w.y + bob, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Emoji grande
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.emoji, w.x, w.y + bob + 2);

        // Etiqueta legible con pastilla oscura
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.beginPath();
        ctx.roundRect(w.x - 48, w.y + 26, 96, 20, 6);
        ctx.fill();

        ctx.font = '800 11px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(w.shortLabel, w.x, w.y + 37);
      });

      // 6. DIBUJAR EL PERSONAJE (ECOGUARDIÁN) EN TAMAÑO GRANDE
      const p = playerRef.current;
      const walkBob = Math.sin(p.stepFrame) * 3.5;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 24, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = heldWasteRef.current ? '#38BDF8' : '#22C55E';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y + walkBob, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(p.x - 15, p.y - 8 + walkBob, 30, 26, 8);
      ctx.fill();

      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 17 + walkBob, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 21 + walkBob, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        p.facing > 0 ? p.x : p.x - 17,
        p.y - 23 + walkBob,
        17,
        5
      );

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(p.x + p.facing * 5, p.y - 17 + walkBob, 2.4, 0, Math.PI * 2);
      ctx.fill();

      if (heldWasteRef.current) {
        const hw = heldWasteRef.current;
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hw.emoji, p.x, p.y - 45 + walkBob);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x - 95, p.y - 82 + walkBob, 190, 24, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = '800 12px Inter, sans-serif';
        ctx.fillText(`En mano: ${hw.shortLabel}`, p.x, p.y - 69 + walkBob);
      }

      // 7. PARTÍCULAS Y TEXTO FLOTANTE GRANDE
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.028;
        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (let i = feedbacksRef.current.length - 1; i >= 0; i--) {
        const fb = feedbacksRef.current[i];
        fb.y -= 0.9;
        fb.alpha -= 0.015;
        if (fb.alpha <= 0) {
          feedbacksRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = fb.alpha;
        ctx.font = '900 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#020617';
        ctx.fillText(fb.text, fb.x + 2, fb.y + 2);
        ctx.fillStyle = fb.color;
        ctx.fillText(fb.text, fb.x, fb.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    viewMode,
    activeEcosystem,
    addCanvasFeedback,
    evaluateBinDelivery,
    finishMission,
  ]);

  // Al tocar el Canvas: si toca un contenedor superior, entrega de inmediato; si toca un residuo, lo recoge; o camina hacia el punto
  const handleCanvasPointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // 1. ¿Tocó directamente una de las 4 canecas superiores?
    for (const bin of BINS_LAYOUT) {
      if (
        Math.abs(clickX - bin.x) <= 88 &&
        Math.abs(clickY - bin.y) <= 48
      ) {
        evaluateBinDelivery(bin.id);
        return;
      }
    }

    // 2. ¿Tocó directamente un residuo del escenario?
    if (!heldWasteRef.current) {
      for (const w of wastesRef.current) {
        if (!w.collected && Math.hypot(clickX - w.x, clickY - w.y) <= 44) {
          playerRef.current.x = w.x;
          playerRef.current.y = w.y;
          w.collected = true;
          heldWasteRef.current = w;
          setHeldWaste(w);
          statsRef.current.collected += 1;
          setCollectedCount(statsRef.current.collected);
          setNextWastePreview(
            wastesRef.current.find((item) => !item.collected) || null
          );
          addCanvasFeedback(
            w.x,
            w.y - 30,
            `¡Recogido: ${w.shortLabel}!`,
            '#38BDF8'
          );
          setLiveFeedbackBanner({
            type: 'pickup',
            title: `Recogiste: ${w.name}`,
            subtitle: `Toca abajo la caneca donde debes depositarlo (${w.materialDesc}).`,
          });
          return;
        }
      }
    }

    playerRef.current.targetX = clickX;
    playerRef.current.targetY = clickY;
  };

  const currentRecoveryInGame = Math.min(
    100,
    Math.round((correctCount / Math.max(1, activeEcosystem.targetItems)) * 100)
  );

  // ============================================================================
  // VISTA A: INICIO DE ECO WORLD (INTERFAZ GRANDE ESTILO JUEGO MÓVIL)
  // ============================================================================
  if (viewMode === 'home') {
    return (
      <div className="space-y-6 pb-24 animate-fadeIn">
        {/* Hero Ilustrado Gigante de ECO WORLD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1227] via-emerald-950 to-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 text-white shadow-2xl">
          {/* Ilustración SVG 2D Ambiental Grande */}
          <div className="relative h-56 sm:h-64 w-full rounded-3xl overflow-hidden border border-emerald-500/40 mb-6 bg-gradient-to-b from-cyan-950 via-emerald-900 to-emerald-950 shadow-inner">
            <svg
              viewBox="0 0 400 170"
              className="w-full h-full object-cover"
              aria-label="Ilustración del mundo virtual Eco World"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E1227" />
                  <stop offset="100%" stopColor="#065F46" />
                </linearGradient>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <rect width="400" height="170" fill="url(#skyGrad)" />
              <circle cx="330" cy="42" r="24" fill="#FACC15" opacity="0.9" />
              <circle cx="330" cy="42" r="36" fill="#FDE047" opacity="0.22" />
              <path
                d="M0 130 Q90 80 200 125 T400 115 L400 170 L0 170 Z"
                fill="#047857"
              />
              <path
                d="M0 142 Q130 105 260 138 T400 130 L400 170 L0 170 Z"
                fill="url(#hillGrad)"
              />
              <path
                d="M170 132 Q210 150 185 170 L235 170 Q255 150 215 132 Z"
                fill="#2DD4BF"
              />
              <g transform="translate(55, 84) scale(1.1)">
                <rect x="11" y="24" width="6" height="18" fill="#78350F" />
                <circle cx="14" cy="18" r="16" fill="#22C55E" />
                <circle cx="6" cy="23" r="11" fill="#10B981" />
                <circle cx="22" cy="23" r="11" fill="#10B981" />
              </g>
              <g transform="translate(290, 78) scale(1.1)">
                <rect x="11" y="26" width="6" height="20" fill="#78350F" />
                <circle cx="14" cy="18" r="18" fill="#10B981" />
                <circle cx="24" cy="24" r="12" fill="#22C55E" />
              </g>
              <circle cx="110" cy="148" r="4" fill="#F472B6" />
              <circle cx="135" cy="154" r="4" fill="#FACC15" />
              <circle cx="275" cy="148" r="4" fill="#38BDF8" />
              <circle cx="150" cy="62" r="3.5" fill="#FDE047" />
              <circle cx="156" cy="60" r="3" fill="#2DD4BF" />
            </svg>

            <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Juego Móvil Educativo 2D</span>
            </div>

            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-2xl bg-slate-950/90 border border-teal-400/50 text-teal-300 text-xs sm:text-sm font-black">
              🌱 Recuperación Global: {globalRecoveryPct}%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  ECO WORLD
                </h1>
                <p className="text-sm sm:text-base font-bold text-emerald-300 mt-1">
                  «Cada acción transforma el planeta»
                </p>
              </div>
              <span className="px-4 py-2 rounded-2xl text-sm sm:text-base font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-lg">
                +{progress.totalEcoWorldPoints} Pts Extra Ganados
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              Recoge los residuos del mapa o selecciónalos con un toque y clasifícalos en los <strong>4 contenedores oficiales de Colombia</strong> antes de que termine el tiempo para restaurar los ecosistemas y sumar <strong>Puntos Eco reales</strong> a tu perfil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => startMission(ECOSYSTEMS_CATALOG[0])}
                className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-base shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>¡JUGAR AHORA!</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className="flex items-center justify-center gap-2.5 bg-slate-900/95 hover:bg-slate-800 text-emerald-300 border-2 border-emerald-500/40 font-black py-4 px-6 rounded-2xl text-base transition-all"
              >
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Mapa de 4 Ecosistemas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta Grande de Estadísticas Unificadas del Jugador */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm sm:text-base font-black text-white">
                Progreso del Jugador ({userProfile.levelName} • Nivel{' '}
                {userProfile.levelNumber})
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              Total Perfil: {userProfile.totalPoints} Pts Eco
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-bold">
                Pts Eco World
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                +{progress.totalEcoWorldPoints}
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-bold">
                Misiones Listas
              </p>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
                {progress.missionsCompleted} / 4
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-bold">
                Recuperación
              </p>
              <p className="text-2xl sm:text-3xl font-black text-teal-300 mt-1">
                {globalRecoveryPct}%
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-bold">
              <span>Progreso de Recuperación Ambiental</span>
              <span className="text-emerald-400">{globalRecoveryPct}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${globalRecoveryPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjetas Grandes de los 4 Ecosistemas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Selecciona un Ecosistema para Jugar
            </h2>
            <button
              onClick={() => setViewMode('map')}
              className="text-xs sm:text-sm font-black text-emerald-400 hover:underline"
            >
              Ver mapa detallado →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ECOSYSTEMS_CATALOG.map((eco) => {
              const state = progress.ecosystems[eco.id];
              return (
                <div
                  key={eco.id}
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    state.unlocked
                      ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-400 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 ${
                          state.completed
                            ? 'bg-emerald-500/20 border-emerald-400'
                            : state.unlocked
                            ? 'bg-slate-950 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800 grayscale'
                        }`}
                      >
                        {eco.badgeIcon}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-white">
                            {eco.name}
                          </h3>
                          {state.completed && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ✓ Recuperado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {eco.subtitle}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-emerald-400 font-extrabold">
                          <span>Recuperación: {state.recoveryPct}%</span>
                          <span>•</span>
                          <span>Hasta +15 Pts Eco</span>
                        </div>
                      </div>
                    </div>

                    {state.unlocked ? (
                      <button
                        onClick={() => startMission(eco)}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm flex-shrink-0 shadow-md transition-transform active:scale-95"
                      >
                        ¡Jugar!
                      </button>
                    ) : (
                      <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                        <Lock className="w-4 h-4" />
                        <span>Bloqueado</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de Control Hardware Wokwi ESP32 */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-black text-white">
                Control Hardware Wokwi ESP32 (Opcional)
              </span>
            </div>
            <button
              onClick={toggleWokwiSync}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                wokwiSyncEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              {wokwiSyncEnabled
                ? '● Escuchando ESP32 (Activo)'
                : 'Conectar Wokwi ESP32'}
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Puedes jugar tocando las canecas gigantes en tu celular, usando el teclado (<strong>WASD / Flechas / 1-4</strong>) o conectando el circuito ESP32 simulado en Wokwi.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VISTA B: MAPA INTERACTIVO DE LOS 4 ECOSISTEMAS
  // ============================================================================
  if (viewMode === 'map') {
    return (
      <div className="space-y-5 pb-24 animate-fadeIn">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Mapa Interactivo de Eco World
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Completa cada misión para desbloquear el siguiente ecosistema
            </p>
          </div>
          <button
            onClick={() => setViewMode('home')}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-black text-slate-200 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-b from-[#0E1227] via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl">
          {ECOSYSTEMS_CATALOG.map((eco, idx) => {
            const state = progress.ecosystems[eco.id];
            const IconComponent =
              idx === 0
                ? Flower2
                : idx === 1
                ? Waves
                : idx === 2
                ? Trees
                : Building2;

            return (
              <div
                key={eco.id}
                className={`relative rounded-3xl border-2 p-5 flex flex-col justify-between transition-all ${
                  state.completed
                    ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-400/60 shadow-lg shadow-emerald-950/50'
                    : state.unlocked
                    ? 'bg-slate-900/95 border-teal-400/50 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border-2 ${
                      state.completed
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : state.unlocked
                        ? 'bg-teal-500/15 border-teal-400 text-teal-300'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-7 h-7" />
                    <span className="text-[10px] font-black mt-0.5">
                      NV. {eco.order}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {eco.name}
                      </h3>
                      {state.completed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                          ✓ Completado
                        </span>
                      ) : state.unlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          Disponible
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          🔒 Bloqueado
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {eco.description}
                    </p>

                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">
                          Recuperación: {state.recoveryPct}%
                        </span>
                        <span className="text-yellow-400 flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                state.stars >= s
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${state.recoveryPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Mejor puntaje:{' '}
                    <strong className="text-white">{state.bestScore}</strong>
                  </span>

                  {state.unlocked ? (
                    <button
                      onClick={() => startMission(eco)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>
                        {state.completed ? 'Mejorar Marca' : '¡Jugar Misión!'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-400/90 font-bold">
                      Supera el nivel anterior para desbloquear
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VISTA C y D: EXPERIENCIA DE JUEGO MÓVIL GIGANTE E INTERACTIVA
  // ============================================================================
  if (viewMode === 'play') {
    const activeTargetWaste = heldWaste || nextWastePreview;

    return (
      <div className="space-y-3.5 pb-24 animate-fadeIn select-none">
        {/* 1. BARRA SUPERIOR HUD ESTILO JUEGO MÓVIL (ELEMENTOS GRANDES Y CLAROS) */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setViewMode('map')}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                title="Volver al mapa"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-white leading-tight">
                  {activeEcosystem.name}
                </h3>
                <p className="text-xs text-emerald-400 font-bold">
                  Meta: {activeEcosystem.targetItems} residuos clasificados
                </p>
              </div>
            </div>

            {/* Indicadores Grandes de Aciertos, Errores, Puntaje y Tiempo */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-xs sm:text-sm font-black text-emerald-300">
                ✓ Aciertos: {correctCount}/{activeEcosystem.targetItems}
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs sm:text-sm font-black text-rose-300">
                ✕ Errores: {mistakesCount}
              </div>
              {streakCount >= 2 && (
                <div className="px-3 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1 animate-bounce">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>x{streakCount}</span>
                </div>
              )}
              <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-yellow-500/40 text-xs sm:text-sm font-black text-yellow-300">
                ⭐ {score} pts
              </div>
              <div
                className={`px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                  timeLeft <= 15
                    ? 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                    : 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Barra Grande de Recuperación del Ecosistema en Vivo */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-slate-200">
                🌱 Transformación Ambiental del Ecosistema en Vivo
              </span>
              <span className="text-emerald-400">{currentRecoveryInGame}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${currentRecoveryInGame}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. BANNER ANIMADO DE RETROALIMENTACIÓN VISUAL AL RESPONDER */}
        {liveFeedbackBanner && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all animate-fadeIn shadow-lg ${
              liveFeedbackBanner.type === 'correct'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : liveFeedbackBanner.type === 'mistake'
                ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
            }`}
          >
            <div className="space-y-0.5">
              <p className="text-sm sm:text-base font-black text-white">
                {liveFeedbackBanner.title}
              </p>
              <p className="text-xs sm:text-sm font-semibold opacity-95">
                {liveFeedbackBanner.subtitle}
              </p>
            </div>
            <span className="text-2xl flex-shrink-0">
              {liveFeedbackBanner.type === 'correct'
                ? '🎉'
                : liveFeedbackBanner.type === 'mistake'
                ? '⚠️'
                : '🧤'}
            </span>
          </div>
        )}

        {/* 3. TARJETA INTERACTIVA GIGANTE DEL RESIDUO ACTUAL + 4 BOTONES GIGANTES DE CANECAS (ESTILO JUEGO DE CELULAR) */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl">
          {activeTargetWaste ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-emerald-400/50 flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                  {activeTargetWaste.emoji}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {heldWaste ? 'En tus manos ahora' : 'Siguiente residuo en el parque'}
                  </span>
                  <h4 className="text-base sm:text-xl font-black text-white mt-1">
                    {activeTargetWaste.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-cyan-300 font-semibold">
                    {activeTargetWaste.materialDesc}
                  </p>
                </div>
              </div>

              {!heldWaste && (
                <button
                  type="button"
                  onClick={handleQuickPickupNextWaste}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Hand className="w-4 h-4" />
                  <span>Recoger Residuo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-2 text-sm font-black text-emerald-400">
              ¡Todos los residuos fueron clasificados!
            </div>
          )}

          {/* 4 BOTONES GIGANTES DE CONTENEDORES COLOMBIANOS */}
          <div>
            <p className="text-xs sm:text-sm font-black text-slate-300 mb-2.5 text-center sm:text-left">
              👇 Toca el contenedor correcto para clasificar el residuo al instante:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {BINS_LAYOUT.map((bin) => (
                <button
                  key={bin.id}
                  type="button"
                  onClick={() => evaluateBinDelivery(bin.id)}
                  className={`${bin.buttonBg} rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between min-h-[96px] sm:min-h-[112px] transition-all hover:scale-[1.02] active:scale-95`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xl sm:text-2xl">{bin.emoji}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/20">
                      {bin.sublabel}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs sm:text-sm font-black leading-tight">
                      {bin.label}
                    </p>
                    <p className="text-[10px] sm:text-[11px] opacity-90 font-semibold leading-tight mt-0.5">
                      {bin.shortRule}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ESCENARIO 2D GIGANTE E INTERACTIVO */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={880}
            height={520}
            onPointerDown={handleCanvasPointerDown}
            className="w-full min-h-[300px] sm:min-h-[420px] md:min-h-[480px] h-auto block touch-none cursor-pointer object-cover"
          />

          {/* Modal de Pausa */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h3 className="text-2xl font-black text-white">Juego en Pausa</h3>
              <p className="text-sm text-slate-300 max-w-sm">
                Toca cualquiera de los 4 contenedores gigantes o camina con tu personaje por el parque para clasificar cada residuo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Continuar Partida
                </button>
                <button
                  onClick={() => startMission(activeEcosystem)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. CONTROLES DIRECCIONALES GRANDES PARA MOVER AL PERSONAJE EN EL ESCENARIO */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => (touchDirRef.current.dx = -1)}
              onPointerUp={() => (touchDirRef.current.dx = 0)}
              onPointerLeave={() => (touchDirRef.current.dx = 0)}
              className="w-14 h-14 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border-2 border-slate-700 flex items-center justify-center text-white shadow-md"
              aria-label="Mover a la izquierda"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onPointerDown={() => (touchDirRef.current.dy = -1)}
                onPointerUp={() => (touchDirRef.current.dy = 0)}
                onPointerLeave={() => (touchDirRef.current.dy = 0)}
                className="w-14 h-14 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border-2 border-slate-700 flex items-center justify-center text-white shadow-md"
                aria-label="Mover arriba"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <button
                type="button"
                onPointerDown={() => (touchDirRef.current.dy = 1)}
                onPointerUp={() => (touchDirRef.current.dy = 0)}
                onPointerLeave={() => (touchDirRef.current.dy = 0)}
                className="w-14 h-14 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border-2 border-slate-700 flex items-center justify-center text-white shadow-md"
                aria-label="Mover abajo"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>
            <button
              type="button"
              onPointerDown={() => (touchDirRef.current.dx = 1)}
              onPointerUp={() => (touchDirRef.current.dx = 0)}
              onPointerLeave={() => (touchDirRef.current.dx = 0)}
              className="w-14 h-14 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border-2 border-slate-700 flex items-center justify-center text-white shadow-md"
              aria-label="Mover a la derecha"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 min-w-[200px] text-right space-y-1">
            <p className="text-xs sm:text-sm font-black text-white">
              Modo Híbrido: Táctil Directo + Movimiento 2D
            </p>
            <p className="text-xs text-slate-400">
              Toca los botones gigantes de las canecas, toca sobre el escenario o usa las flechas / Wokwi ESP32.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VISTA E: RESULTADOS, RECOMPENSAS Y PROGRESO (TAMAÑO GRANDE)
  // ============================================================================
  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {isSubmittingResult || !lastResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <p className="text-base font-black text-white">
            Validando y guardando tus recompensas de la misión...
          </p>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-7 text-center space-y-4 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl mx-auto shadow-lg">
              {lastResult.completedMission
                ? lastResult.ecosystem.badgeIcon
                : '🌱'}
            </div>

            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lastResult.ecosystem.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {lastResult.completedMission
                  ? '¡Ecosistema Recuperado!'
                  : '¡Buen Intento Ambiental!'}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {lastResult.completedMission
                  ? 'El escenario ha recuperado sus colores, flores y biodiversidad.'
                  : 'Clasifica al menos el 75% de los residuos correctamente para completar la misión.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-base font-black">
              <Sparkles className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>
                +{lastResult.pointsAwarded} Puntos Eco sumados a tu Perfil
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
              Resumen de la Partida
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold">Puntuación</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {lastResult.score}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold">Recogidos</p>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                  {lastResult.itemsCollected} /{' '}
                  {lastResult.ecosystem.targetItems}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold">Aciertos</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  {lastResult.correctClassifications}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold">
                  Errores / Tiempo
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  {lastResult.mistakes} • {lastResult.durationSeconds}s
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <p className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Desglose de Recompensas (Validadas en Servidor):
              </p>

              {lastResult.breakdown.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  Aún no alcanzaste el mínimo de residuos clasificados para
                  reclamar los puntos de la misión. ¡Juega otra vez!
                </p>
              ) : (
                <div className="space-y-2">
                  {lastResult.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs sm:text-sm"
                    >
                      <span className="text-slate-200 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {item.label}
                      </span>
                      <span
                        className={`font-black ${
                          item.newlyEarned
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.newlyEarned
                          ? `+${item.points} pts`
                          : 'Reclamado antes'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lastResult.unlockedBadge && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-3xl">
                  {lastResult.unlockedBadge.icon}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    ¡Nueva Insignia Desbloqueada!
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-white">
                    {lastResult.unlockedBadge.title}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startMission(lastResult.ecosystem)}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>Jugar Otra Vez</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className="flex-1 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Volver al Mapa</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
