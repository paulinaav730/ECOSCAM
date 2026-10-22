import { GoogleGenAI } from "@google/genai";
import { AIVisionAnalysisResult } from "@/types/ecoscan";

export function isGeminiVisionConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(
    key &&
      key.trim().length > 15 &&
      key !== "tu_gemini_api_key_privada_aqui"
  );
}

// Control básico de tasa por memoria en el servidor para proteger el endpoint de IA frente a usos abusivos
const rateLimitWindowMs = 60_000;
const maxRequestsPerMinute = 12;
const ipRequestTimestamps = new Map<string, number[]>();

export function checkAIRateLimit(clientIdentifier: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(clientIdentifier) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < rateLimitWindowMs);

  if (validTimestamps.length >= maxRequestsPerMinute) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((rateLimitWindowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  validTimestamps.push(now);
  ipRequestTimestamps.set(clientIdentifier, validTimestamps);
  return { allowed: true };
}

const VISION_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    probableObjectName: {
      type: "string",
      description:
        "Nombre probable en español cotidiano de Colombia (ej. Botella de plástico PET, Caja de pizza, Pila alcalina, Medicamento vencido).",
    },
    primaryMaterial: {
      type: "string",
      enum: [
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
      ],
    },
    secondaryMaterials: {
      type: "array",
      items: { type: "string" },
    },
    suggestedCategory: {
      type: "string",
      enum: [
        "aprovechable",
        "organico_aprovechable",
        "no_aprovechable",
        "posconsumo_especial",
        "requiere_verificacion",
      ],
    },
    detectedCondition: {
      type: "string",
      enum: [
        "limpio_seco",
        "contaminado_comida",
        "contaminado_grasa",
        "parcialmente_contaminado",
        "contaminado_quimico",
        "riesgo_biologico",
        "organico_fresco",
        "liquido_especial",
        "desconocido",
      ],
    },
    confidenceScore: {
      type: "number",
      description: "Nivel de certeza entre 0.0 y 1.0.",
    },
    hasContaminationWarning: {
      type: "boolean",
    },
    contaminationNotes: {
      type: "array",
      items: { type: "string" },
    },
    missingInformation: {
      type: "array",
      items: { type: "string" },
    },
    followUpQuestions: {
      type: "array",
      items: { type: "string" },
    },
    visualObservations: {
      type: "string",
    },
  },
  required: [
    "probableObjectName",
    "primaryMaterial",
    "secondaryMaterials",
    "suggestedCategory",
    "detectedCondition",
    "confidenceScore",
    "hasContaminationWarning",
    "contaminationNotes",
    "missingInformation",
    "followUpQuestions",
    "visualObservations",
  ],
};

/**
 * Analiza una imagen de residuo utilizando Google Gemini (gemini-3.8-flash) mediante la Interactions API.
 * Nunca simula un análisis de IA cuando falta GEMINI_API_KEY.
 */
export async function analyzeWasteImageWithGemini(params: {
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  userHint?: string;
}): Promise<{
  configured: boolean;
  analysis?: AIVisionAnalysisResult;
  error?: string;
}> {
  if (!isGeminiVisionConfigured()) {
    return {
      configured: false,
      error:
        "El reconocimiento por imágenes no está configurado en este entorno (falta GEMINI_API_KEY en el servidor). Puedes clasificar el residuo inmediatamente usando el buscador por texto o el selector de materiales y estado.",
    };
  }

  try {
    const cleanBase64 = params.imageBase64.replace(
      /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
      ""
    );

    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const systemPrompt = `Eres el módulo de visión artificial de EcoScan Colombia.
Tu tarea es examinar la fotografía de un residuo y extraer sus características físicas observables (objeto probable, material principal, materiales secundarios, condición de limpieza/contaminación e incertidumbre).
Reglas estrictas:
1. Una fotografía NO siempre permite conocer la composición química exacta ni si el interior de un envase contiene trazas peligrosas. Sé prudente con el confidenceScore.
2. Si ves manchas de grasa, líquidos restantes, restos de comida o etiquetas de productos químicos/medicamentos, repórtalo en detectedCondition y contaminationNotes.
3. Si la imagen es borrosa, ambigua o no muestra un residuo claro, asigna confidenceScore menor a 0.50, primaryMaterial "compuesto_desconocido" y formula preguntas de seguimiento claras en followUpQuestions.
4. Responde exclusivamente en español y siguiendo el esquema JSON solicitado.`;

    const promptText = params.userHint
      ? `${systemPrompt}\n\nNota adicional del usuario sobre el objeto: "${params.userHint}".`
      : systemPrompt;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      store: false,
      input: [
        {
          type: "image",
          mime_type: params.mimeType,
          data: cleanBase64,
        },
        {
          type: "text",
          text: promptText,
        },
      ],
      response_format: [
        {
          type: "text",
          mime_type: "application/json",
          schema: VISION_RESPONSE_JSON_SCHEMA,
        },
      ],
    });

    const rawText = interaction.output_text;
    if (!rawText) {
      return {
        configured: true,
        error:
          "El servicio de visión no devolvió un análisis estructurado para esta imagen. Intenta con una fotografía más iluminada o usa la búsqueda por texto.",
      };
    }

    const parsed = JSON.parse(rawText) as AIVisionAnalysisResult;

    return {
      configured: true,
      analysis: {
        ...parsed,
        confidenceScore: Math.max(0, Math.min(1, Number(parsed.confidenceScore) || 0.5)),
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error inesperado en el proveedor de visión.";
    console.error("[EcoScan AI Vision Error]:", message);
    return {
      configured: true,
      error:
        "No fue posible completar el análisis visual en este momento. Puedes seleccionar el objeto manualmente o usar el buscador del catálogo.",
    };
  }
}
