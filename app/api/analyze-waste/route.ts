import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_PRESETS_LIST } from "@/components/ecoscan-ui/data/samplePresets";
import { buildMultiCriteriaAnalysis } from "@/lib/recycling-adapter";
import { analyzeWasteImageWithGemini } from "@/services/ai-vision-service";
import { matchCatalogItemByNameOrSynonym } from "@/services/classification-engine";
import { MaterialType, WasteConditionState } from "@/types/ecoscan";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      sampleId,
      queryName,
      primaryMaterial,
      conditionState,
      municipality = "Bogotá, Colombia",
    } = body as {
      imageBase64?: string;
      sampleId?: string;
      queryName?: string;
      primaryMaterial?: MaterialType;
      conditionState?: WasteConditionState;
      municipality?: string;
    };

    // 1. Si el usuario eligió una muestra rápida (preset)
    if (sampleId) {
      const preset = SAMPLE_PRESETS_LIST.find((s) => s.id === sampleId);
      if (preset) {
        const analysis = buildMultiCriteriaAnalysis({
          objectName: preset.queryName,
          primaryMaterial: preset.primaryMaterial,
          conditionState: conditionState || preset.defaultCondition,
          municipality,
          imageUrl: preset.imageThumbnail,
        });

        return NextResponse.json({
          success: true,
          data: analysis,
          source: "preset_multicriteria",
        });
      }
    }

    // 2. Si el usuario consultó por nombre del catálogo o re-evaluó el estado/condición de un residuo
    if (queryName || primaryMaterial) {
      const matched = queryName
        ? matchCatalogItemByNameOrSynonym(queryName)
        : null;

      const resolvedMaterial: MaterialType =
        primaryMaterial || matched?.primaryMaterial || "plastico_pet";
      const resolvedCondition: WasteConditionState =
        conditionState || matched?.defaultCondition || "limpio_seco";

      const analysis = buildMultiCriteriaAnalysis({
        objectName: matched?.name || queryName || "Residuo consultado",
        primaryMaterial: resolvedMaterial,
        conditionState: resolvedCondition,
        requiresSpecialManagement: matched?.requiresSpecialManagement,
        matchedWasteItemId: matched?.id,
        municipality,
      });

      return NextResponse.json({
        success: true,
        data: analysis,
        source: "catalog_multicriteria",
      });
    }

    // 3. Si el usuario capturó o subió una fotografía (Visión Artificial + Motor Multicriterio)
    if (imageBase64) {
      const match = imageBase64.match(
        /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/
      );
      const mimeType = (match?.[1] || "image/jpeg") as
        | "image/jpeg"
        | "image/png"
        | "image/webp";

      const visionResponse = await analyzeWasteImageWithGemini({
        imageBase64,
        mimeType,
      });

      if (visionResponse.configured && visionResponse.analysis) {
        const ai = visionResponse.analysis;
        const effectiveCondition: WasteConditionState =
          conditionState || ai.detectedCondition || "limpio_seco";

        const analysis = buildMultiCriteriaAnalysis({
          objectName: ai.probableObjectName,
          primaryMaterial: ai.primaryMaterial,
          secondaryMaterials: ai.secondaryMaterials,
          conditionState: effectiveCondition,
          hasContamination: ai.hasContaminationWarning,
          requiresSpecialManagement:
            ai.suggestedCategory === "posconsumo_especial",
          aiConfidence: ai.confidenceScore,
          municipality,
        });

        return NextResponse.json({
          success: true,
          data: analysis,
          source: "gemini_vision_multicriteria",
        });
      }

      // Fallback demostrativo si no hay GEMINI_API_KEY configurada aún en el servidor
      const fallbackPreset = SAMPLE_PRESETS_LIST[0];
      const fallbackAnalysis = buildMultiCriteriaAnalysis({
        objectName: fallbackPreset.queryName,
        primaryMaterial: fallbackPreset.primaryMaterial,
        conditionState: conditionState || fallbackPreset.defaultCondition,
        municipality,
      });

      return NextResponse.json({
        success: true,
        data: fallbackAnalysis,
        source: "fallback_multicriteria",
        note: visionResponse.error,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Debes proporcionar una imagen, muestra o residuo a evaluar.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[/api/analyze-waste error]:", error);
    const fallbackPreset = SAMPLE_PRESETS_LIST[0];
    const fallbackAnalysis = buildMultiCriteriaAnalysis({
      objectName: fallbackPreset.queryName,
      primaryMaterial: fallbackPreset.primaryMaterial,
      conditionState: fallbackPreset.defaultCondition,
      municipality: "Bogotá, Colombia",
    });

    return NextResponse.json({
      success: true,
      data: fallbackAnalysis,
      source: "error_fallback",
    });
  }
}
