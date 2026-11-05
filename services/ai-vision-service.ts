import { GoogleGenAI } from "@google/genai";
import { AIVisionAnalysisResult } from "@/types/ecoscan";

export function getGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ];
  for (const key of candidates) {
    if (
      key &&
      key.trim().length > 15 &&
      key.trim() !== "tu_gemini_api_key_privada_aqui"
    ) {
      return key.trim();
    }
  }
  return undefined;
}

export function isGeminiVisionConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

// Control básico de tasa por memoria en el servidor para proteger el endpoint de IA frente a usos abusivos
const rateLimitWindowMs = 60_000;
const maxRequestsPerMinute = 15;
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
    const retryAfterSeconds = Math.ceil(
      (rateLimitWindowMs - (now - oldest)) / 1000
    );
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
        "Nombre exacto del objeto o residuo en español cotidiano de Colombia (ej. Botella de plástico PET, Caja de cartón corrugado, Cáscara de banano, Lata de aluminio, Vaso de papel, Servilleta usada, Pila alcalina, Blíster de medicamentos). Si no se distingue un residuo claro, responde 'Imagen no concluyente'.",
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
      description:
        "Nivel de certeza entre 0.0 y 1.0. Si la imagen es borrosa, oscura o no muestra un residuo reconocible, debe ser menor a 0.45.",
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
      description:
        "Descripción breve de lo que se observa físicamente en la imagen (textura, forma, limpieza o por qué no es concluyente).",
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
 * Nunca simula un análisis de IA ni inventa "Botella PET" cuando falta GEMINI_API_KEY o cuando la imagen no es clara.
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
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      configured: false,
      error:
        "El servicio de visión artificial no está configurado todavía (falta GEMINI_API_KEY en .env.local o Vercel). Por favor confirma abajo qué residuo aparece en tu foto o usa el buscador del catálogo.",
    };
  }

  try {
    const cleanBase64 = params.imageBase64.replace(
      /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
      ""
    );

    const client = new GoogleGenAI({
      apiKey,
    });

    const systemPrompt = `Eres el sistema experto de visión artificial de EcoScan Colombia (Resolución 2184 de 2019 y Programas Posconsumo).
Examina con máxima precisión la fotografía y clasifica el objeto o residuo real que aparece en ella:
1. IDENTIFICACIÓN PRECISA DE MATERIALES:
   - Si es una fruta, cáscara (ej. banano, naranja, huevo), verdura, restos de comida cruda o poda: usa primaryMaterial="organico", detectedCondition="organico_fresco", suggestedCategory="organico_aprovechable".
   - Si es una caja de cartón, empaque de cartón o cubeta de huevos: usa primaryMaterial="carton". Si tiene grasa (como caja de pizza usada), usa detectedCondition="parcialmente_contaminado" o "contaminado_grasa".
   - Si es una hoja de papel, cuaderno, factura o periódico limpio: usa primaryMaterial="papel", detectedCondition="limpio_seco".
   - Si es una servilleta usada, papel higiénico, pañuelo facial o papel engrasado: usa primaryMaterial="papel", detectedCondition="contaminado_comida", suggestedCategory="no_aprovechable".
   - Si es una botella transparente de agua/gaseosa: usa primaryMaterial="plastico_pet". Si es un envase rígido opaco de champú/detergente/yogur: usa primaryMaterial="plastico_pead". Si es un paquete metalizado de mecato/papitas o bolsa plástica: usa primaryMaterial="plastico_otro".
   - Si es una caja de leche o jugo tipo Tetra Pak: usa primaryMaterial="multicapa".
   - Si es una botella o frasco de vidrio: usa primaryMaterial="vidrio".
   - Si es una lata de bebida (aluminio) o lata de conserva/atún (hojalata): usa primaryMaterial="aluminio" o "metal".
   - Si es una pila/batería ("metal_quimico"), medicamento/pastilla/blíster ("farmaceutico"), celular/cable/computador ("raee"), bombillo ("iluminacion_raee") o botella con aceite de cocina usado ("aceite_vegetal"): usa suggestedCategory="posconsumo_especial".
2. NO INVENTAR IDENTIFICACIONES:
   - NUNCA digas por defecto que es una botella de plástico si no ves claramente una botella de plástico.
   - Si la foto está muy borrosa, totalmente oscura, muestra solo un rostro/persona/pared sin ningún residuo identificable, asigna probableObjectName="Imagen no concluyente — Objeto no distinguible", primaryMaterial="compuesto_desconocido", detectedCondition="desconocido", suggestedCategory="requiere_verificacion" y confidenceScore menor a 0.40.
3. Responde exclusivamente en español siguiendo el esquema JSON.`;

    const promptText = params.userHint
      ? `${systemPrompt}\n\nPista proporcionada por el usuario: "${params.userHint}".`
      : systemPrompt;

    let rawText: string | null | undefined = null;

    try {
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
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: VISION_RESPONSE_JSON_SCHEMA,
        } as unknown as Record<string, unknown>,
      });
      rawText = interaction.output_text;
    } catch (interactionErr) {
      console.warn(
        "[EcoScan AI Vision] Fallback to models.generateContent:",
        interactionErr instanceof Error ? interactionErr.message : interactionErr
      );
      const genResult = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: params.mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: VISION_RESPONSE_JSON_SCHEMA as unknown as Record<
            string,
            unknown
          >,
        },
      });
      rawText = genResult.text;
    }

    if (!rawText) {
      return {
        configured: true,
        error:
          "El modelo no pudo extraer un resultado concluyente de esta fotografía. Intenta tomar otra foto más enfocada o selecciona el material manualmente.",
      };
    }

    const cleanedJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleanedJson) as AIVisionAnalysisResult;

    return {
      configured: true,
      analysis: {
        ...parsed,
        confidenceScore: Math.max(
          0,
          Math.min(1, Number(parsed.confidenceScore) || 0.5)
        ),
      },
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error inesperado en el proveedor de visión.";
    console.error("[EcoScan AI Vision Error]:", message);
    return {
      configured: true,
      error:
        "No se pudo identificar el residuo con suficiente confianza en la imagen. Por favor intenta con otra fotografía más iluminada o confirma el material del residuo a continuación.",
    };
  }
}
