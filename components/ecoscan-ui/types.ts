import type {
  WasteConditionState,
  MaterialType,
  CircularAlternative,
  SpecialManagementDetails,
  EnvironmentalSource,
} from "@/types/ecoscan";

export type TabType =
  | 'inicio'
  | 'escanear'
  | 'ecoworld'
  | 'resultado'
  | 'historial'
  | 'perfil';

export type CategoryType =
  | 'plástico'
  | 'papel_cartón'
  | 'vidrio'
  | 'metal'
  | 'multicapa'
  | 'orgánico'
  | 'no_aprovechable'
  | 'posconsumo'
  | 'peligroso';

export type BinColorType = 'Blanco' | 'Verde' | 'Negro' | 'Rojo' | 'Posconsumo';

export interface WasteAnalysis {
  wasteName: string;
  category: CategoryType;
  binColor: BinColorType;
  binHexColor: string;
  binDescription: string;
  preparationSteps: string[];
  derivedProducts: string[];
  environmentalImpact: string;
  ecoPoints: number;
  tips: string;
  imageUrl?: string;

  // Campos del Sistema Inteligente de Reciclaje Multicriterio (EcoScan Engine)
  ruleCode?: string;
  ruleName?: string;
  primaryMaterial?: MaterialType;
  primaryMaterialLabel?: string;
  separationCategoryLabel?: string;
  disposalInstructions?: string;
  conditionEvaluated?: WasteConditionState;
  containerLabel?: string;
  recommendation?: string;
  whyExplanation?: string;
  requiresSpecialManagement?: boolean;
  requiresClarification?: boolean;
  clarificationQuestions?: string[];
  uncertaintyNotice?: string;
  commonMistakesToAvoid?: string[];
  circularAlternatives?: CircularAlternative[];
  specialManagementDetails?: SpecialManagementDetails | null;
  verifiedSource?: EnvironmentalSource;
  municipalityContext?: string;
  confidenceScore?: number;
  isConclusive?: boolean;
  visualObservations?: string;
  scanFingerprint?: string;
}

export interface HistoryItem extends WasteAnalysis {
  id: string;
  scannedAt: string; // ISO date string
  userId?: string;
  userNotes?: string;
}

export interface UserProfile {
  userId?: string;
  name: string;
  email?: string;
  city: string;
  levelName: string;
  levelNumber: number;
  totalPoints: number;
  scanPoints?: number;
  ecoWorldPoints?: number;
  ecoWorldMissionsCompleted?: number;
  pointsToNextLevel: number;
  scannedCount: number;
  kgRecycledEstimate: number;
  badges: Badge[];
  isLoggedIn?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Primeros Pasos' | 'Materiales' | 'Hábitos Eco' | 'Especiales Colombia';
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  rewardPoints: number;
  howToUnlock: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; total: number };
}

export interface PresetSample {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  binColor: BinColorType;
  binHexColor: string;
  defaultCondition: WasteConditionState;
  primaryMaterial: MaterialType;
  queryName: string;
  imageThumbnail: string;
}

export const ECOWORLD_REWARD_CONFIG = {
  completeMission: 5,
  completeAllObjectives: 5,
  perfectMission: 5,
} as const;

export const VALID_ECOSYSTEMS = [
  'parque_olvidado',
  'rio_contaminado',
  'bosque_perdido',
  'ciudad_verde',
] as const;

export type EcosystemId = (typeof VALID_ECOSYSTEMS)[number];

export interface EcoWorldMissionMilestoneState {
  unlocked: boolean;
  completed: boolean;
  recoveryPct: number;
  bestScore: number;
  stars: number;
  rewardedCompletion: boolean;
  rewardedObjectives: boolean;
  rewardedPerfect: boolean;
}
