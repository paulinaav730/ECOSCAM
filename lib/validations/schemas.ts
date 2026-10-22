import { z } from "zod";

export const MaterialTypeSchema = z.enum([
  "plastico_pet",
  "plastico_pead",
  "plastico_otro",
  "vidrio",
  "aluminio",
  "metal",
  "papel",
  "carton",
  "multicapa",
  "organico",
  "metal_quimico",
  "farmaceutico",
  "raee",
  "iluminacion_raee",
  "textil",
  "aceite_vegetal",
  "compuesto_desconocido",
]);

export const WasteConditionStateSchema = z.enum([
  "limpio_seco",
  "contaminado_comida",
  "contaminado_grasa",
  "parcialmente_contaminado",
  "contaminado_quimico",
  "riesgo_biologico",
  "organico_fresco",
  "liquido_especial",
  "desconocido",
]);

export const WasteManagementCategorySchema = z.enum([
  "aprovechable",
  "organico_aprovechable",
  "no_aprovechable",
  "posconsumo_especial",
  "requiere_verificacion",
]);

export const RuleEvaluationInputSchema = z.object({
  objectName: z.string().min(2, "El nombre del objeto debe tener al menos 2 caracteres").max(120),
  primaryMaterial: MaterialTypeSchema,
  secondaryMaterials: z.array(z.string()).optional().default([]),
  conditionState: WasteConditionStateSchema,
  hasContamination: z.boolean().optional().default(false),
  requiresSpecialManagement: z.boolean().optional().default(false),
  municipality: z.string().min(2).max(80).optional().default("Medellín"),
  aiConfidence: z.number().min(0).max(1).optional(),
  matchedWasteItemId: z.string().optional(),
});

export const ImageAnalysisRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(50, "La imagen proporcionada no es válida")
    .max(7_500_000, "La imagen supera el límite máximo permitido (5 MB)"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Formato no permitido. Usa JPEG, PNG o WebP." }),
  }),
  municipality: z.string().optional().default("Medellín"),
  userHint: z.string().max(200).optional(),
});

export const FeedbackReportInputSchema = z.object({
  wasteItemId: z.string().optional().nullable(),
  collectionPointId: z.string().optional().nullable(),
  reportType: z.enum([
    "correccion_clasificacion",
    "actualizacion_punto",
    "nuevo_residuo",
    "error_ia",
    "otro",
  ]),
  content: z
    .string()
    .min(10, "Describe el reporte con al menos 10 caracteres para poder verificarlo.")
    .max(1000, "El reporte no puede exceder 1000 caracteres."),
  municipality: z.string().max(80).optional().default("Medellín"),
});

export const UserActionInputSchema = z.object({
  wasteItemId: z.string().optional().nullable(),
  actionType: z.enum([
    "residuo_consultado",
    "separacion_declarada",
    "reutilizacion_declarada",
    "entrega_posconsumo_declarada",
  ]),
  description: z.string().min(4).max(300),
});

export const ProfileUpdateSchema = z.object({
  alias: z.string().min(2, "El alias debe tener al menos 2 caracteres").max(50),
  preferredMunicipality: z.string().min(2).max(80),
  publicProfile: z.boolean().default(false),
  shareAnonymousStats: z.boolean().default(false),
  storeImages: z.boolean().default(false),
});

export const AdminWasteItemUpdateSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(600),
  mainCategory: WasteManagementCategorySchema,
  primaryMaterial: MaterialTypeSchema,
  defaultCondition: WasteConditionStateSchema,
  requiresSpecialManagement: z.boolean(),
  publicationStatus: z.enum(["verificado", "pendiente", "desactualizado", "borrador"]),
});
