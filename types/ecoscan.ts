export type WasteManagementCategory =
  | "aprovechable"
  | "organico_aprovechable"
  | "no_aprovechable"
  | "posconsumo_especial"
  | "requiere_verificacion";

export type ContainerColorCode =
  | "blanco"
  | "verde"
  | "negro"
  | "punto_posconsumo"
  | "verificacion";

export type WasteConditionState =
  | "limpio_seco"
  | "contaminado_comida"
  | "contaminado_grasa"
  | "parcialmente_contaminado"
  | "contaminado_quimico"
  | "riesgo_biologico"
  | "organico_fresco"
  | "liquido_especial"
  | "desconocido";

export type MaterialType =
  | "plastico_pet"
  | "plastico_pead"
  | "plastico_otro"
  | "vidrio"
  | "aluminio"
  | "metal"
  | "papel"
  | "carton"
  | "multicapa"
  | "organico"
  | "metal_quimico"
  | "farmaceutico"
  | "raee"
  | "iluminacion_raee"
  | "textil"
  | "aceite_vegetal"
  | "compuesto_desconocido";

export type ValidationStatus =
  | "verificado"
  | "pendiente"
  | "desactualizado"
  | "borrador";

export interface EnvironmentalSource {
  id: string;
  entityName: string;
  resourceTitle: string;
  url: string;
  sourceType:
    | "normativa_nacional"
    | "programa_posconsumo"
    | "operador_aseo"
    | "guia_tecnica";
  geographicScope: string;
  consultedAt: string;
  reviewedAt: string;
}

export interface CircularAlternative {
  type:
    | "reparar"
    | "reutilizar"
    | "donar"
    | "rellenar"
    | "compostar"
    | "programa_especial"
    | "reducir"
    | "aprovechar";
  title: string;
  description: string;
  safetyNote: string;
}

export interface SpecialManagementDetails {
  programName: string;
  regulation: string;
  whatIsIt: string;
  whySpecial: string;
  authorizedReceiver: string;
  restrictions: string;
}

export interface WasteItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  synonyms: string[];
  mainCategory: WasteManagementCategory;
  containerColor: ContainerColorCode;
  primaryMaterial: MaterialType;
  secondaryMaterials: string[];
  defaultCondition: WasteConditionState;
  requiresSpecialManagement: boolean;
  preparationInstructions: string[];
  warnings: string[];
  whyExplanation: string;
  circularAlternatives: CircularAlternative[];
  specialManagementDetails?: SpecialManagementDetails | null;
  sourceId: string;
  source?: EnvironmentalSource;
  geographicScope: string;
  publicationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface ClassificationRuleConditions {
  materials?: MaterialType[];
  conditions?: WasteConditionState[];
  requiresSpecialManagement?: boolean;
  municipalities?: string[];
  hasContamination?: boolean;
}

export interface ClassificationRule {
  id: string;
  code: string;
  name: string;
  priority: number;
  conditions: ClassificationRuleConditions;
  targetCategory: WasteManagementCategory;
  containerColor: ContainerColorCode;
  recommendation: string;
  preparationSteps: string[];
  explanation: string;
  mistakesToAvoid: string[];
  sourceId: string;
  geographicScope: string;
  validationStatus: "verificado" | "pendiente" | "desactualizado";
  reviewedAt: string;
}

export interface RuleEngineInput {
  objectName: string;
  primaryMaterial: MaterialType;
  secondaryMaterials?: string[];
  conditionState: WasteConditionState;
  hasContamination?: boolean;
  requiresSpecialManagement?: boolean;
  municipality?: string;
  aiConfidence?: number;
  matchedWasteItemId?: string;
}

export interface RuleEngineEvaluationResult {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  finalCategory: WasteManagementCategory;
  containerColor: ContainerColorCode;
  containerLabel: string;
  recommendation: string;
  preparationSteps: string[];
  whyExplanation: string;
  mistakesToAvoid: string[];
  circularAlternatives: CircularAlternative[];
  specialManagementDetails?: SpecialManagementDetails | null;
  requiresClarification: boolean;
  clarificationQuestions: string[];
  uncertaintyNotice?: string;
  municipalityContext: string;
  source: EnvironmentalSource;
  validationStatus: "verificado" | "pendiente" | "desactualizado";
  reviewedAt: string;
  matchedWasteItem?: WasteItem | null;
}

export interface AIVisionAnalysisResult {
  probableObjectName: string;
  primaryMaterial: MaterialType;
  secondaryMaterials: string[];
  suggestedCategory: WasteManagementCategory;
  detectedCondition: WasteConditionState;
  confidenceScore: number;
  hasContaminationWarning: boolean;
  contaminationNotes: string[];
  missingInformation: string[];
  followUpQuestions: string[];
  visualObservations: string;
}

export interface CollectionPointMaterial {
  wasteCategory: WasteManagementCategory;
  materialName: string;
  acceptanceConditions: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  entityOperator: string;
  description: string;
  address: string;
  municipality: string;
  department: string;
  latitude: number | null;
  longitude: number | null;
  schedule: string | null;
  contactInfo: string | null;
  officialUrl: string | null;
  deliveryRequirements: string[];
  materialsAccepted: CollectionPointMaterial[];
  sourceId: string;
  source?: EnvironmentalSource;
  verificationStatus:
    | "verificado"
    | "referencia_institucional"
    | "pendiente_verificacion_geografica"
    | "desactualizado";
  lastVerifiedAt: string;
}

export interface EducationalArticle {
  id: string;
  slug: string;
  title: string;
  category:
    | "separacion"
    | "materiales"
    | "posconsumo"
    | "economia_circular"
    | "compostaje"
    | "biomimetica"
    | "mitos";
  summary: string;
  readingTimeMin: number;
  keyTakeaways: string[];
  sections: {
    heading: string;
    body: string;
  }[];
  biomimicryInsight?: string;
  sourceId: string;
  source?: EnvironmentalSource;
  validationStatus: "verificado" | "pendiente" | "desactualizado";
  reviewedAt: string;
}

export type ActionVerificationState =
  | "consulta_informativa"
  | "declarada_usuario"
  | "verificada_entidad";

export interface UserActionRecord {
  id: string;
  userId: string;
  wasteItemId?: string | null;
  actionType:
    | "residuo_consultado"
    | "separacion_declarada"
    | "reutilizacion_declarada"
    | "entrega_posconsumo_declarada"
    | "entrega_verificada";
  verificationState: ActionVerificationState;
  description: string;
  ecoPoints: number;
  createdAt: string;
}

export interface ScanHistoryRecord {
  id: string;
  userId?: string;
  wasteItemId?: string | null;
  identifiedObject: string;
  probableMaterial: MaterialType;
  secondaryMaterials: string[];
  conditionState: WasteConditionState;
  resultCategory: WasteManagementCategory;
  containerColor: ContainerColorCode;
  confidenceLevel: number;
  ruleAppliedId: string;
  recommendation: string;
  municipality: string;
  createdAt: string;
}

export interface SustainabilityChallenge {
  id: string;
  title: string;
  description: string;
  category:
    | "separacion"
    | "posconsumo"
    | "prevencion"
    | "reutilizacion"
    | "aprendizaje";
  targetCount: number;
  ecoPointsReward: number;
  status: "activo" | "inactivo" | "finalizado";
  criteriaDescription: string;
}

export interface FeedbackReport {
  id: string;
  userId?: string | null;
  wasteItemId?: string | null;
  collectionPointId?: string | null;
  reportType:
    | "correccion_clasificacion"
    | "actualizacion_punto"
    | "nuevo_residuo"
    | "error_ia"
    | "otro";
  content: string;
  municipality?: string;
  status: "pendiente" | "en_revision" | "resuelto" | "descartado";
  createdAt: string;
}
