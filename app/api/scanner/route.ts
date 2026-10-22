import { NextRequest, NextResponse } from "next/server";
import { ImageAnalysisRequestSchema } from "@/lib/validations/schemas";
import {
  analyzeWasteImageWithGemini,
  checkAIRateLimit,
  isGeminiVisionConfigured,
} from "@/services/ai-vision-service";
import { evaluateWasteClassification } from "@/services/classification-engine";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    aiConfigured: isGeminiVisionConfigured(),
    supabaseConfigured: isSupabaseServerConfigured(),
    model: "gemini-3.8-flash",
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";

    const rateCheck = checkAIRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite temporal de escaneos por minuto. Intenta nuevamente en ${rateCheck.retryAfterSeconds} segundos o usa el buscador por texto.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ImageAnalysisRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos de imagen no válidos. Asegúrate de subir una imagen JPEG, PNG o WebP menor a 5 MB.",
        },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType, municipality, userHint } = parsed.data;

    const visionResult = await analyzeWasteImageWithGemini({
      imageBase64,
      mimeType,
      userHint,
    });

    if (!visionResult.configured) {
      return NextResponse.json(
        {
          aiConfigured: false,
          error: visionResult.error,
        },
        { status: 503 }
      );
    }

    if (!visionResult.analysis) {
      return NextResponse.json(
        {
          aiConfigured: true,
          error:
            visionResult.error ||
            "No se pudo interpretar la imagen. Intenta con otra toma o usa el buscador por texto.",
        },
        { status: 422 }
      );
    }

    const ai = visionResult.analysis;

    // Contrastar SIEMPRE la salida de la IA con el motor determinístico de reglas ambientales
    const ruleEvaluation = evaluateWasteClassification({
      objectName: ai.probableObjectName,
      primaryMaterial: ai.primaryMaterial,
      secondaryMaterials: ai.secondaryMaterials,
      conditionState: ai.detectedCondition,
      hasContamination: ai.hasContaminationWarning,
      requiresSpecialManagement: ai.suggestedCategory === "posconsumo_especial",
      municipality,
      aiConfidence: ai.confidenceScore,
    });

    // Combinar preguntas de seguimiento de la IA y del motor de reglas
    const combinedQuestions = Array.from(
      new Set([
        ...(ai.followUpQuestions || []),
        ...(ruleEvaluation.clarificationQuestions || []),
      ])
    );

    return NextResponse.json({
      aiConfigured: true,
      visionAnalysis: ai,
      classification: {
        ...ruleEvaluation,
        clarificationQuestions: combinedQuestions,
      },
    });
  } catch (err) {
    console.error("[API /api/scanner Error]:", err);
    return NextResponse.json(
      {
        error:
          "Ocurrió un error al procesar la solicitud de análisis. Usa la clasificación asistida o búsqueda por texto.",
      },
      { status: 500 }
    );
  }
}
