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
  Award,
  Trees,
  Waves,
  Building2,
  Flower2,
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
    timeLimitSeconds: 75,
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
    timeLimitSeconds: 80,
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
    timeLimitSeconds: 85,
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
    timeLimitSeconds: 90,
    badgeId: 'ecoworld-ciudad',
    badgeTitle: 'Arquitecto Circular',
    badgeIcon: '🏙️',
  },
];

type GameBinType = 'blanco' | 'verde' | 'negro' | 'posconsumo';

interface SpawnableWasteTemplate {
  name: string;
  shortLabel: string;
  bin: GameBinType;
  emoji: string;
  color: string;
  hint: string;
}

const WASTE_TEMPLATES: SpawnableWasteTemplate[] = [
  {
    name: 'Botella PET Limpia',
    shortLabel: 'PET Limpio',
    bin: 'blanco',
    emoji: '🧴',
    color: '#38BDF8',
    hint: 'Aprovechable limpio y seco → Caneca Blanca',
  },
  {
    name: 'Lata de Aluminio',
    shortLabel: 'Lata Metal',
    bin: 'blanco',
    emoji: '🥫',
    color: '#E2E8F0',
    hint: 'Metal limpio → Caneca Blanca',
  },
  {
    name: 'Caja de Cartón Seca',
    shortLabel: 'Cartón Seco',
    bin: 'blanco',
    emoji: '📦',
    color: '#FBBF24',
    hint: 'Cartón sin grasa → Caneca Blanca',
  },
  {
    name: 'Cáscara de Banano',
    shortLabel: 'Orgánico',
    bin: 'verde',
    emoji: '🍌',
    color: '#4ADE80',
    hint: 'Orgánico compostable → Caneca Verde',
  },
  {
    name: 'Restos de Manzana',
    shortLabel: 'Fruta Orgánica',
    bin: 'verde',
    emoji: '🍎',
    color: '#22C55E',
    hint: 'Restos vegetales → Caneca Verde',
  },
  {
    name: 'Servilleta con Grasa',
    shortLabel: 'Con Grasa',
    bin: 'negro',
    emoji: '🧻',
    color: '#94A3B8',
    hint: 'Papel contaminado con grasa → Caneca Negra',
  },
  {
    name: 'Caja de Pizza Engrasada',
    shortLabel: 'Cartón Grasoso',
    bin: 'negro',
    emoji: '🍕',
    color: '#64748B',
    hint: 'Cartón con grasa no reciclable → Caneca Negra',
  },
  {
    name: 'Pila Alcalina Usada',
    shortLabel: 'Pila AA',
    bin: 'posconsumo',
    emoji: '🔋',
    color: '#F59E0B',
    hint: 'Residuo Posconsumo → Contenedor Posconsumo',
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
  x: number;
  y: number;
  fillColor: string;
  strokeColor: string;
  textColor: string;
}[] = [
  {
    id: 'blanco',
    label: 'BLANCA',
    sublabel: 'Aprovechable',
    x: 110,
    y: 72,
    fillColor: '#F8FAFC',
    strokeColor: '#38BDF8',
    textColor: '#0F172A',
  },
  {
    id: 'verde',
    label: 'VERDE',
    sublabel: 'Orgánico',
    x: 265,
    y: 72,
    fillColor: '#16A34A',
    strokeColor: '#4ADE80',
    textColor: '#FFFFFF',
  },
  {
    id: 'negro',
    label: 'NEGRA',
    sublabel: 'No Aprovechable',
    x: 420,
    y: 72,
    fillColor: '#1E293B',
    strokeColor: '#94A3B8',
    textColor: '#F8FAFC',
  },
  {
    id: 'posconsumo',
    label: 'POSCONSUMO',
    sublabel: 'Especial',
    x: 575,
    y: 72,
    fillColor: '#D97706',
    strokeColor: '#FDE047',
    textColor: '#FFFFFF',
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
  const [timeLeft, setTimeLeft] = useState(75);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [heldWaste, setHeldWaste] = useState<ActiveWasteEntity | null>(null);
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

  // Canvas & Game Loop Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({
    x: 340,
    y: 260,
    vx: 0,
    vy: 0,
    speed: 3.4,
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

  // Inicializar una partida nueva en el ecosistema elegido
  const startMission = useCallback((ecosystem: EcosystemMetadata) => {
    setActiveEcosystem(ecosystem);
    setIsPaused(false);
    setTimeLeft(ecosystem.timeLimitSeconds);
    setScore(0);
    setCorrectCount(0);
    setMistakesCount(0);
    setCollectedCount(0);
    setHeldWaste(null);
    heldWasteRef.current = null;
    feedbacksRef.current = [];
    particlesRef.current = [];

    playerRef.current = {
      x: 340,
      y: 250,
      vx: 0,
      vy: 0,
      speed: 3.5,
      facing: 1,
      stepFrame: 0,
      targetX: null,
      targetY: null,
    };

    // Generar los residuos distribuidos en el escenario evitando los contenedores superiores
    const spawned: ActiveWasteEntity[] = [];
    for (let i = 0; i < ecosystem.targetItems; i++) {
      const tpl = WASTE_TEMPLATES[i % WASTE_TEMPLATES.length];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 95 + col * 155 + ((i * 37) % 45) - 20;
      const y = 175 + row * 115 + ((i * 29) % 40);
      spawned.push({
        ...tpl,
        id: `waste-${i}-${Date.now()}`,
        x: Math.max(55, Math.min(625, x)),
        y: Math.max(155, Math.min(375, y)),
        collected: false,
        bobOffset: i * 0.9,
      });
    }
    wastesRef.current = spawned;

    statsRef.current = {
      score: 0,
      correct: 0,
      mistakes: 0,
      collected: 0,
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

        // Si completó la misión, desbloquear el siguiente ecosistema en el mapa
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

      if (e.code === 'KeyP') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Suscripción al módulo Wokwi ESP32
    const unsubscribeWokwi = wokwiBridge.onInput((packet) => {
      if (typeof packet.axisX === 'number') {
        touchDirRef.current.dx = packet.axisX;
      }
      if (typeof packet.axisY === 'number') {
        touchDirRef.current.dy = packet.axisY;
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
  }, [viewMode]);

  // Motor 2D en Canvas con transformación ecológica del escenario en tiempo real
  useEffect(() => {
    if (viewMode !== 'play') return;
    let animationFrameId: number;

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        const speed = 1.5 + Math.random() * 2.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 3 + Math.random() * 3,
          life: 1,
        });
      }
    };

    const addFloatingFeedback = (
      x: number,
      y: number,
      text: string,
      color: string
    ) => {
      feedbacksRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        text,
        color,
        alpha: 1,
      });
    };

    const renderLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width; // 680
      const H = canvas.height; // 420

      // 1. ACTUALIZACIÓN DE FÍSICA Y COLISIONES (si no está en pausa)
      if (!isPausedRef.current && !statsRef.current.finished) {
        const p = playerRef.current;
        let dx = touchDirRef.current.dx;
        let dy = touchDirRef.current.dy;

        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) dx -= 1;
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) dx += 1;
        if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) dy -= 1;
        if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) dy += 1;

        // Si el usuario tocó un punto del canvas en móvil/PC
        if (dx === 0 && dy === 0 && p.targetX !== null && p.targetY !== null) {
          const distX = p.targetX - p.x;
          const distY = p.targetY - p.y;
          const dist = Math.hypot(distX, distY);
          if (dist > 6) {
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
          p.stepFrame += 0.22;
        }

        // Límites del escenario
        p.x = Math.max(32, Math.min(W - 32, p.x));
        p.y = Math.max(85, Math.min(H - 30, p.y));

        // Colisión para recoger residuo (si no lleva uno en la mano)
        if (!heldWasteRef.current) {
          for (const w of wastesRef.current) {
            if (!w.collected && Math.hypot(p.x - w.x, p.y - w.y) < 34) {
              w.collected = true;
              heldWasteRef.current = w;
              setHeldWaste(w);
              statsRef.current.collected += 1;
              setCollectedCount(statsRef.current.collected);
              addFloatingFeedback(p.x, p.y - 24, `¡Recogido: ${w.shortLabel}!`, '#38BDF8');
              break;
            }
          }
        } else {
          // Colisión con los 4 contenedores superiores para clasificar el residuo
          for (const bin of BINS_LAYOUT) {
            if (Math.hypot(p.x - bin.x, p.y - (bin.y + 18)) < 42) {
              const currentItem = heldWasteRef.current;
              if (currentItem.bin === bin.id) {
                // ¡CLASIFICACIÓN CORRECTA!
                statsRef.current.correct += 1;
                statsRef.current.score += 100;
                setCorrectCount(statsRef.current.correct);
                setScore(statsRef.current.score);
                heldWasteRef.current = null;
                setHeldWaste(null);
                spawnParticles(bin.x, bin.y + 10, '#22C55E');
                addFloatingFeedback(
                  bin.x,
                  bin.y + 30,
                  '+100 pts ¡Clasificación Correcta!',
                  '#4ADE80'
                );

                // Comprobar si ya se clasificaron todos los residuos del escenario
                const remaining = wastesRef.current.filter(
                  (w) => !w.collected
                ).length;
                if (remaining === 0 && !heldWasteRef.current) {
                  setTimeout(() => finishMission(), 700);
                }
              } else {
                // ERROR DE CLASIFICACIÓN: rebota suavemente hacia abajo y explica en qué contenedor va
                statsRef.current.mistakes += 1;
                statsRef.current.score = Math.max(
                  0,
                  statsRef.current.score - 25
                );
                setMistakesCount(statsRef.current.mistakes);
                setScore(statsRef.current.score);
                p.y = Math.min(H - 40, bin.y + 72);
                p.targetX = null;
                p.targetY = null;
                spawnParticles(bin.x, bin.y + 20, '#EF4444');
                addFloatingFeedback(
                  p.x,
                  p.y - 15,
                  `¡Error (-25)! ${currentItem.hint}`,
                  '#FCA5A5'
                );
              }
              break;
            }
          }
        }
      }

      // 2. CÁLCULO DEL PROGRESO DE RECUPERACIÓN VISUAL (0.0 = Contaminado -> 1.0 = Recuperado y lleno de vida)
      const recoveryRatio = Math.min(
        1,
        statsRef.current.correct / Math.max(1, activeEcosystem.targetItems)
      );

      // Función auxiliar para interpolar colores RGB según el porcentaje de recuperación
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

      // 3. DIBUJADO DEL ESCENARIO 2D CON TRANSFORMACIÓN AMBIENTAL EN TIEMPO REAL
      // Cielo / Franja superior de estación de reciclaje
      const skyTop = lerpColor([45, 48, 56], [14, 116, 144], recoveryRatio);
      const skyBottom = lerpColor([68, 64, 60], [6, 95, 70], recoveryRatio);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 115);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, 115);

      // Césped del Parque (pasa de tierra grisácea/marrón contaminada a pradera esmeralda vibrante)
      const grassTop = lerpColor([75, 70, 58], [16, 185, 129], recoveryRatio);
      const grassBottom = lerpColor([52, 49, 42], [5, 150, 105], recoveryRatio);
      const grassGrad = ctx.createLinearGradient(0, 115, 0, H);
      grassGrad.addColorStop(0, grassTop);
      grassGrad.addColorStop(1, grassBottom);
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 115, W, H - 115);

      // Senderos del parque
      ctx.fillStyle = lerpColor([90, 86, 78], [214, 211, 209], recoveryRatio);
      ctx.fillRect(0, 108, W, 14);
      ctx.beginPath();
      ctx.roundRect(310, 115, 60, H - 115, 8);
      ctx.fill();

      // Laguna / Estanque lateral del ecosistema (pasa de agua turbia a azul turquesa cristalino)
      ctx.fillStyle = lerpColor([87, 83, 78], [45, 212, 191], recoveryRatio);
      ctx.beginPath();
      ctx.ellipse(575, 345, 75, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lerpColor(
        [120, 113, 108],
        [153, 246, 228],
        recoveryRatio
      );
      ctx.lineWidth = 3;
      ctx.stroke();

      // Árboles del escenario (recuperan su follaje verde y frutos según recoveryRatio)
      const treePositions = [
        { x: 55, y: 165 },
        { x: 625, y: 170 },
        { x: 65, y: 345 },
        { x: 235, y: 365 },
      ];
      treePositions.forEach((t, idx) => {
        // Tronco
        ctx.fillStyle = '#78350F';
        ctx.fillRect(t.x - 6, t.y, 12, 28);

        // Copa del árbol (crece y reverdece con la recuperación)
        const radius = 16 + recoveryRatio * 14;
        ctx.fillStyle = lerpColor(
          [100, 90, 75],
          idx % 2 === 0 ? [34, 197, 94] : [16, 185, 129],
          recoveryRatio
        );
        ctx.beginPath();
        ctx.arc(t.x, t.y - 6, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(t.x - 12, t.y + 2, radius * 0.75, 0, Math.PI * 2);
        ctx.arc(t.x + 12, t.y + 2, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });

      // Flores que brotan progresivamente cuando la recuperación supera el 25%
      if (recoveryRatio >= 0.25) {
        const flowerCount = Math.floor(recoveryRatio * 18);
        const flowerColors = ['#F472B6', '#FACC15', '#FB7185', '#38BDF8', '#A78BFA'];
        for (let i = 0; i < flowerCount; i++) {
          const fx = 45 + ((i * 97) % 580);
          const fy = 145 + ((i * 67) % 245);
          ctx.fillStyle = flowerColors[i % flowerColors.length];
          ctx.beginPath();
          ctx.arc(fx, fy, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Mariposas y aves animadas cuando la recuperación supera el 50%
      if (recoveryRatio >= 0.5) {
        const butterflyCount = Math.floor((recoveryRatio - 0.3) * 8);
        for (let b = 0; b < butterflyCount; b++) {
          const bx =
            120 +
            b * 95 +
            Math.sin(timestamp * 0.0025 + b * 1.7) * 45;
          const by =
            165 +
            (b % 3) * 65 +
            Math.cos(timestamp * 0.0035 + b) * 22;
          const wingSpread = Math.abs(Math.sin(timestamp * 0.015 + b)) * 6 + 2;

          ctx.fillStyle = b % 2 === 0 ? '#FDE047' : '#38BDF8';
          ctx.beginPath();
          ctx.ellipse(bx - 3, by, wingSpread, 4, 0.3, 0, Math.PI * 2);
          ctx.ellipse(bx + 3, by, wingSpread, 4, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. DIBUJAR LAS 4 ESTACIONES DE CONTENEDORES OFICIALES
      BINS_LAYOUT.forEach((bin) => {
        const isTargetBin =
          heldWasteRef.current && heldWasteRef.current.bin === bin.id;

        ctx.save();
        // Resplandor sutil si el jugador lleva un residuo en la mano
        if (heldWasteRef.current) {
          ctx.shadowColor = bin.strokeColor;
          ctx.shadowBlur = isTargetBin ? 14 : 6;
        }

        // Cuerpo de la caneca
        ctx.fillStyle = bin.fillColor;
        ctx.strokeStyle = bin.strokeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bin.x - 54, bin.y - 26, 108, 56, 12);
        ctx.fill();
        ctx.stroke();

        // Textos del contenedor
        ctx.fillStyle = bin.textColor;
        ctx.font = '900 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bin.label, bin.x, bin.y - 4);
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillText(bin.sublabel, bin.x, bin.y + 11);

        // Indicador de entrega
        ctx.font = '700 8px Inter, sans-serif';
        ctx.fillStyle = bin.id === 'blanco' ? '#0284C7' : '#A7F3D0';
        ctx.fillText('▼ ENTREGAR AQUÍ', bin.x, bin.y + 24);
        ctx.restore();
      });

      // 5. DIBUJAR LOS RESIDUOS INTERACTIVOS EN EL SUELO
      wastesRef.current.forEach((w) => {
        if (w.collected) return;
        const bob = Math.sin(timestamp * 0.005 + w.bobOffset) * 3;

        // Sombra
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.beginPath();
        ctx.ellipse(w.x, w.y + 14, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Burbuja del residuo
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(w.x, w.y + bob, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Emoji del residuo
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.emoji, w.x, w.y + bob + 1);

        // Etiqueta inferior
        ctx.font = '700 9px Inter, sans-serif';
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(w.shortLabel, w.x, w.y + 25);
      });

      // 6. DIBUJAR EL PERSONAJE (ECOGUARDIÁN)
      const p = playerRef.current;
      const walkBob = Math.sin(p.stepFrame) * 2.5;

      // Sombra del personaje
      ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 18, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Halo circular del jugador
      ctx.strokeStyle = heldWasteRef.current ? '#38BDF8' : '#22C55E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y + walkBob, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Cuerpo y traje ecológico
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(p.x - 11, p.y - 6 + walkBob, 22, 20, 6);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 13 + walkBob, 10, 0, Math.PI * 2);
      ctx.fill();

      // Gorra verde de guardián ambiental
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 16 + walkBob, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        p.facing > 0 ? p.x : p.x - 13,
        p.y - 18 + walkBob,
        13,
        4
      );

      // Ojos
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(p.x + p.facing * 4, p.y - 13 + walkBob, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Si lleva un residuo, mostrarlo sobre el personaje con su etiqueta
      if (heldWasteRef.current) {
        const hw = heldWasteRef.current;
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hw.emoji, p.x, p.y - 34 + walkBob);

        // Etiqueta flotante del residuo en mano
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(p.x - 68, p.y - 62 + walkBob, 136, 18, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = '700 9px Inter, sans-serif';
        ctx.fillText(`Llevas: ${hw.name}`, p.x, p.y - 51 + walkBob);
      }

      // 7. PARTÍCULAS Y RETROALIMENTACIÓN FLOTANTE
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
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
        fb.y -= 0.7;
        fb.alpha -= 0.016;
        if (fb.alpha <= 0) {
          feedbacksRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = fb.alpha;
        ctx.font = '800 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#020617';
        ctx.fillText(fb.text, fb.x + 1, fb.y + 1);
        ctx.fillStyle = fb.color;
        ctx.fillText(fb.text, fb.x, fb.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, activeEcosystem, finishMission]);

  // Permitir tocar o hacer clic directamente en el Canvas para mover al personaje
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
    playerRef.current.targetX = clickX;
    playerRef.current.targetY = clickY;
  };

  const currentRecoveryInGame = Math.min(
    100,
    Math.round((correctCount / Math.max(1, activeEcosystem.targetItems)) * 100)
  );

  // ============================================================================
  // VISTA A: INICIO DE ECO WORLD
  // ============================================================================
  if (viewMode === 'home') {
    return (
      <div className="space-y-5 pb-20 animate-fadeIn">
        {/* Hero Ilustrado de ECO WORLD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1227] via-emerald-950 to-slate-900 border border-emerald-500/40 p-5 text-white shadow-2xl">
          {/* Ilustración SVG 2D Ambiental de Fondo */}
          <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-emerald-500/30 mb-4 bg-gradient-to-b from-cyan-950 via-emerald-900 to-emerald-950">
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
              {/* Sol / Halo */}
              <circle cx="330" cy="42" r="22" fill="#FACC15" opacity="0.85" />
              <circle cx="330" cy="42" r="32" fill="#FDE047" opacity="0.2" />
              {/* Montañas y praderas */}
              <path
                d="M0 130 Q90 80 200 125 T400 115 L400 170 L0 170 Z"
                fill="#047857"
              />
              <path
                d="M0 142 Q130 105 260 138 T400 130 L400 170 L0 170 Z"
                fill="url(#hillGrad)"
              />
              {/* Río cristalino */}
              <path
                d="M170 132 Q210 150 185 170 L235 170 Q255 150 215 132 Z"
                fill="#2DD4BF"
              />
              {/* Árboles ilustrados */}
              <g transform="translate(55, 88)">
                <rect x="11" y="24" width="6" height="18" fill="#78350F" />
                <circle cx="14" cy="18" r="16" fill="#22C55E" />
                <circle cx="6" cy="23" r="11" fill="#10B981" />
                <circle cx="22" cy="23" r="11" fill="#10B981" />
              </g>
              <g transform="translate(295, 82)">
                <rect x="11" y="26" width="6" height="20" fill="#78350F" />
                <circle cx="14" cy="18" r="18" fill="#10B981" />
                <circle cx="24" cy="24" r="12" fill="#22C55E" />
              </g>
              {/* Flores y mariposas */}
              <circle cx="110" cy="148" r="3.5" fill="#F472B6" />
              <circle cx="135" cy="154" r="3.5" fill="#FACC15" />
              <circle cx="275" cy="148" r="3.5" fill="#38BDF8" />
              <circle cx="150" cy="62" r="3" fill="#FDE047" />
              <circle cx="156" cy="60" r="2.5" fill="#2DD4BF" />
            </svg>

            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Videojuego Educativo 2D Integrado</span>
            </div>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-teal-400/40 text-teal-300 text-[10px] font-bold">
              Recuperación Global: {globalRecoveryPct}%
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  ECO WORLD
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  +{progress.totalEcoWorldPoints} Pts Extra
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-300 mt-0.5">
                «Cada acción transforma el planeta»
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Recorre ecosistemas contaminados, recoge los residuos y clasifícalos en los contenedores oficiales de Colombia para devolverles la vida y ganar <strong>Puntos Eco adicionales</strong> en tu perfil.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => startMission(ECOSYSTEMS_CATALOG[0])}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Jugar Ahora</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className="flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold py-3.5 px-4 rounded-2xl text-xs transition-all"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Mapa de Ecosistemas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta de Estadísticas Unificadas del Jugador */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-white">
                Progreso del Jugador ({userProfile.levelName} • Nivel{' '}
                {userProfile.levelNumber})
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400">
              Total Perfil: {userProfile.totalPoints} pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">
                Pts Eco World
              </p>
              <p className="text-base font-black text-emerald-400">
                +{progress.totalEcoWorldPoints}
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">
                Misiones Listas
              </p>
              <p className="text-base font-black text-cyan-400">
                {progress.missionsCompleted} / 4
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">
                Recuperación
              </p>
              <p className="text-base font-black text-teal-300">
                {globalRecoveryPct}%
              </p>
            </div>
          </div>

          {/* Barra de progreso de recuperación ambiental */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Progreso de Recuperación Ambiental</span>
              <span className="text-emerald-400">{globalRecoveryPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${globalRecoveryPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vista rápida de los 4 Ecosistemas */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Misiones y Ecosistemas
            </h2>
            <button
              onClick={() => setViewMode('map')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Ver mapa completo →
            </button>
          </div>

          <div className="space-y-2.5">
            {ECOSYSTEMS_CATALOG.map((eco) => {
              const state = progress.ecosystems[eco.id];
              return (
                <div
                  key={eco.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    state.unlocked
                      ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-400/60'
                      : 'bg-slate-900/50 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                          state.completed
                            ? 'bg-emerald-500/20 border-emerald-400'
                            : state.unlocked
                            ? 'bg-slate-950 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800 grayscale'
                        }`}
                      >
                        {eco.badgeIcon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-white truncate">
                            {eco.name}
                          </h3>
                          {state.completed && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Recuperado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {eco.subtitle}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-emerald-400 font-bold">
                          <span>Recuperación: {state.recoveryPct}%</span>
                          <span>•</span>
                          <span>Hasta +15 pts extra</span>
                        </div>
                      </div>
                    </div>

                    {state.unlocked ? (
                      <button
                        onClick={() => startMission(eco)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex-shrink-0 transition-transform active:scale-95"
                      >
                        Jugar
                      </button>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1 flex-shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bloqueado</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de Control Hardware Wokwi ESP32 (Opcional) */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-white">
                Control Hardware Wokwi ESP32 (Opcional)
              </span>
            </div>
            <button
              onClick={toggleWokwiSync}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                wokwiSyncEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              {wokwiSyncEnabled ? '● Escuchando ESP32 (Activo)' : 'Conectar Wokwi ESP32'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Puedes jugar directamente con el <strong>teclado (WASD / Flechas)</strong> o <strong>pantalla táctil</strong>. Si deseas usar el circuito simulado en Wokwi (Potenciómetro + 2 Botones), activa el botón superior y dale Play a tu proyecto en Wokwi.
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
      <div className="space-y-4 pb-20 animate-fadeIn">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Mapa Interactivo de Eco World
            </h2>
            <p className="text-[11px] text-slate-400">
              Completa cada misión para desbloquear el siguiente ecosistema
            </p>
          </div>
          <button
            onClick={() => setViewMode('home')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Inicio
          </button>
        </div>

        {/* Mapa Ilustrado Conectado */}
        <div className="relative bg-gradient-to-b from-[#0E1227] via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-3xl p-5 space-y-4 shadow-2xl">
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
                className={`relative rounded-3xl border p-4 transition-all ${
                  state.completed
                    ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-400/60 shadow-lg shadow-emerald-950/50'
                    : state.unlocked
                    ? 'bg-slate-900/95 border-teal-400/50 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border-2 ${
                        state.completed
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : state.unlocked
                          ? 'bg-teal-500/15 border-teal-400 text-teal-300'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-[9px] font-black mt-0.5">
                        NV. {eco.order}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-white">
                          {eco.name}
                        </h3>
                        {state.completed ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                            ✓ Completado
                          </span>
                        ) : state.unlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/40">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                            🔒 Bloqueado
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {eco.description}
                      </p>

                      {/* Barra de recuperación individual */}
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-400">
                            Recuperación del ecosistema: {state.recoveryPct}%
                          </span>
                          <span className="text-yellow-400 flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  state.stars >= s
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${state.recoveryPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Hitos de puntos */}
                      <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-md border ${
                            state.rewardedCompletion
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {state.rewardedCompletion ? '✓' : '○'} Completar (+5
                          pts)
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md border ${
                            state.rewardedObjectives
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {state.rewardedObjectives ? '✓' : '○'} Objetivos (+5
                          pts)
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md border ${
                            state.rewardedPerfect
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {state.rewardedPerfect ? '✓' : '○'} Perfecta (+5 pts)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Mejor puntuación: <strong className="text-white">{state.bestScore}</strong>
                  </span>

                  {state.unlocked ? (
                    <button
                      onClick={() => startMission(eco)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>
                        {state.completed ? 'Mejorar Marca' : 'Iniciar Misión'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-400/90 font-semibold">
                      Completa el nivel anterior para desbloquear
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
  // VISTA C y D: VIDEOJUEGO 2D JUGABLE Y TRANSFORMACIÓN DEL ECOSISTEMA
  // ============================================================================
  if (viewMode === 'play') {
    return (
      <div className="space-y-3 pb-20 animate-fadeIn select-none">
        {/* Barra Superior HUD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('map')}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Volver al mapa"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-xs font-black text-white leading-tight">
                  {activeEcosystem.name}
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  Clasificados: {correctCount} / {activeEcosystem.targetItems} •
                  Errores: {mistakesCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black text-yellow-400">
                {score} pts
              </div>
              <div
                className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 ${
                  timeLeft <= 15
                    ? 'bg-red-950/80 border-red-500/50 text-red-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-cyan-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Barra de progreso de recuperación del escenario en vivo */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-300">
                🌱 Recuperación del Ecosistema en Vivo
              </span>
              <span className="text-emerald-400">{currentRecoveryInGame}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${currentRecoveryInGame}%` }}
              />
            </div>
          </div>
        </div>

        {/* Indicador del residuo que lleva el jugador */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs">
          {heldWaste ? (
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <span className="text-base">{heldWaste.emoji}</span>
              <div>
                <p className="text-white text-xs font-extrabold">
                  Llevas: {heldWaste.name}
                </p>
                <p className="text-[10px] text-emerald-400">{heldWaste.hint}</p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-300">
              👣 Camina hacia un residuo (con flechas, controles táctiles o
              tocando el escenario) para recogerlo.
            </p>
          )}
        </div>

        {/* Lienzo 2D Jugable */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={680}
            height={420}
            onPointerDown={handleCanvasPointerDown}
            className="w-full h-auto block touch-none cursor-pointer"
          />

          {/* Modal de Pausa */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h3 className="text-xl font-black text-white">Juego en Pausa</h3>
              <p className="text-xs text-slate-300 max-w-xs">
                Lleva cada residuo al contenedor que le corresponde según su
                material y estado de limpieza.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Continuar
                </button>
                <button
                  onClick={() => startMission(activeEcosystem)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controles Táctiles para Móvil y Estado de Hardware Wokwi */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 flex items-center justify-between gap-3">
          {/* Cruceta Táctil (D-Pad) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onPointerDown={() => (touchDirRef.current.dx = -1)}
              onPointerUp={() => (touchDirRef.current.dx = 0)}
              onPointerLeave={() => (touchDirRef.current.dx = 0)}
              className="w-11 h-11 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border border-slate-700 flex items-center justify-center text-slate-200 shadow-inner"
              aria-label="Mover a la izquierda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onPointerDown={() => (touchDirRef.current.dy = -1)}
                onPointerUp={() => (touchDirRef.current.dy = 0)}
                onPointerLeave={() => (touchDirRef.current.dy = 0)}
                className="w-11 h-11 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border border-slate-700 flex items-center justify-center text-slate-200 shadow-inner"
                aria-label="Mover arriba"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button
                type="button"
                onPointerDown={() => (touchDirRef.current.dy = 1)}
                onPointerUp={() => (touchDirRef.current.dy = 0)}
                onPointerLeave={() => (touchDirRef.current.dy = 0)}
                className="w-11 h-11 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border border-slate-700 flex items-center justify-center text-slate-200 shadow-inner"
                aria-label="Mover abajo"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onPointerDown={() => (touchDirRef.current.dx = 1)}
              onPointerUp={() => (touchDirRef.current.dx = 0)}
              onPointerLeave={() => (touchDirRef.current.dx = 0)}
              className="w-11 h-11 rounded-2xl bg-slate-950 active:bg-emerald-500 active:text-slate-950 border border-slate-700 flex items-center justify-center text-slate-200 shadow-inner"
              aria-label="Mover a la derecha"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info de Controles y Preparación Wokwi ESP32 */}
          <div className="flex-1 text-right space-y-1">
            <p className="text-[11px] font-bold text-white">
              Controles Táctiles / Teclado
            </p>
            <p className="text-[10px] text-slate-400">
              También puedes tocar cualquier residuo o caneca directamente en el
              mapa.
            </p>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[9px] text-slate-400">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Módulo Wokwi ESP32 preparado</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VISTA E: RESULTADOS, RECOMPENSAS Y PROGRESO
  // ============================================================================
  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {isSubmittingResult || !lastResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm font-bold text-white">
            Validando recompensas de la misión...
          </p>
        </div>
      ) : (
        <>
          {/* Encabezado de celebración */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 p-6 text-center space-y-3 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
              {lastResult.completedMission
                ? lastResult.ecosystem.badgeIcon
                : '🌱'}
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lastResult.ecosystem.name}
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                {lastResult.completedMission
                  ? '¡Ecosistema Recuperado!'
                  : '¡Buen Intento Ambiental!'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {lastResult.completedMission
                  ? 'El escenario ha recuperado sus colores, flores y biodiversidad.'
                  : 'Clasifica al menos el 75% de los residuos correctamente para completar la misión.'}
              </p>
            </div>

            {/* Puntos Eco ganados para el perfil general de ECOSCAM */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-sm font-black">
              <Sparkles className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                +{lastResult.pointsAwarded} Puntos Eco sumados a tu Perfil
              </span>
            </div>
          </div>

          {/* Métricas de la partida */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resumen de la Partida
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400">Puntuación</p>
                <p className="text-base font-black text-white">
                  {lastResult.score}
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400">Recogidos</p>
                <p className="text-base font-black text-cyan-400">
                  {lastResult.itemsCollected} /{' '}
                  {lastResult.ecosystem.targetItems}
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400">Correctos</p>
                <p className="text-base font-black text-emerald-400">
                  {lastResult.correctClassifications}
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400">
                  Errores / Tiempo
                </p>
                <p className="text-base font-black text-amber-300">
                  {lastResult.mistakes} err • {lastResult.durationSeconds}s
                </p>
              </div>
            </div>

            {/* Desglose de Puntos Adicionales de ECO WORLD */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Desglose de Recompensas (Validadas en Servidor):
              </p>

              {lastResult.breakdown.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  Aún no alcanzaste el mínimo de residuos clasificados para
                  reclamar los puntos de la misión. ¡Juega otra vez!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {lastResult.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200 font-medium flex items-center gap-2">
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

            {/* Insignia desbloqueada */}
            {lastResult.unlockedBadge && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl">
                  {lastResult.unlockedBadge.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    ¡Nueva Insignia Desbloqueada!
                  </p>
                  <p className="text-xs font-extrabold text-white">
                    {lastResult.unlockedBadge.title}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2.5">
            <button
              onClick={() => startMission(lastResult.ecosystem)}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Jugar Otra Vez</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Volver al Mapa</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
