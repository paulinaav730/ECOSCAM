import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { SAMPLE_PRESETS_LIST } from "@/components/ecoscan-ui/data/samplePresets";
import { buildMultiCriteriaAnalysis } from "@/lib/recycling-adapter";
import { analyzeWasteImageWithGemini } from "@/services/ai-vision-service";
import { matchCatalogItemByNameOrSynonym } from "@/services/classification-engine";
import { MaterialType, WasteConditionState } from "@/types/ecoscan";

function createScanFingerprint(parts: string[]): string {
  const raw = parts.join("|");
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      sampleId,
      queryName,
      primaryMaterial,
      conditionState,
      userHint,
      scanNonce,
      municipality = "Bogotá, Colombia",
    } = body as {
      imageBase64?: string;
      sampleId?: string;
      queryName?: string;
      primaryMaterial?: MaterialType;
      conditionState?: WasteConditionState;
      userHint?: string;
      scanNonce?: string;
      municipality?: string;
    };

    // 1. Si el usuario eligió una muestra rápida verificada (preset)
    if (sampleId) {
      const preset = SAMPLE_PRESETS_LIST.find((s) => s.id === sampleId);
      if (preset) {
        const effectiveCond = conditionState || preset.defaultCondition;
        const fingerprint = createScanFingerprint([
          "preset",
          preset.id,
          effectiveCond,
          scanNonce || String(Math.floor(Date.now() / 10000)),
        ]);
        const analysis = buildMultiCriteriaAnalysis({
          objectName: preset.queryName,
          primaryMaterial: preset.primaryMaterial,
          conditionState: effectiveCond,
          municipality,
          imageUrl: preset.imageThumbnail,
          scanFingerprint: fingerprint,
        });

        return NextResponse.json({
          success: true,
          conclusive: true,
          data: analysis,
          source: "preset_multicriteria",
        });
      }
    }

    // 2. Si el usuario consultó por nombre del catálogo, confirmó el material de su foto o re-evaluó el estado
    if (queryName || primaryMaterial) {
      const matched = queryName
        ? matchCatalogItemByNameOrSynonym(queryName)
        : null;

      const resolvedMaterial: MaterialType =
        primaryMaterial || matched?.primaryMaterial || "plastico_pet";
      const resolvedCondition: WasteConditionState =
        conditionState ||
        matched?.defaultCondition ||
        (resolvedMaterial === "organico" ? "organico_fresco" : "limpio_seco");

      const fingerprint = createScanFingerprint([
        "catalog",
        matched?.id || queryName || resolvedMaterial,
        resolvedCondition,
        imageBase64 ? imageBase64.slice(-64) : "",
        scanNonce || String(Math.floor(Date.now() / 10000)),
      ]);

      const analysis = buildMultiCriteriaAnalysis({
        objectName: matched?.name || queryName || "Residuo clasificado",
        primaryMaterial: resolvedMaterial,
        conditionState: resolvedCondition,
        requiresSpecialManagement: matched?.requiresSpecialManagement,
        matchedWasteItemId: matched?.id,
        municipality,
        scanFingerprint: fingerprint,
      });

      return NextResponse.json({
        success: true,
        conclusive: true,
        data: analysis,
        source: "catalog_multicriteria",
      });
    }

    // 3. Si el usuario capturó o subió una fotografía (Visión Artificial Gemini + Motor Multicriterio)
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
        userHint,
      });

      if (visionResponse.configured && visionResponse.analysis) {
        const ai = visionResponse.analysis;

        // Si la imagen no es clara o la IA no tiene suficiente confianza (< 0.50 o material desconocido),
        // NO inventar una identificación: solicitar otra foto o confirmación del usuario.
        if (
          ai.confidenceScore < 0.5 ||
          ai.primaryMaterial === "compuesto_desconocido" ||
          ai.probableObjectName.toLowerCase().includes("no concluyente")
        ) {
          return NextResponse.json({
            success: false,
            conclusive: false,
            requiresConfirmation: true,
            aiConfigured: true,
            confidenceScore: ai.confidenceScore,
            visualObservations:
              ai.visualObservations ||
              "La imagen no es suficientemente nítida o no se distingue un residuo con certeza.",
            followUpQuestions:
              ai.followUpQuestions?.length > 0
                ? ai.followUpQuestions
                : [
                    "¿Puedes tomar otra fotografía más cerca y con buena iluminación?",
                    "¿De qué material principal está hecho el objeto (plástico, cartón, papel, vidrio, metal u orgánico)?",
                  ],
            error:
              "El resultado no es concluyente: la fotografía no permite identificar el residuo con suficiente confianza. Por favor toma otra foto más clara o selecciona el material abajo.",
          });
        }

        const effectiveCondition: WasteConditionState =
          conditionState ||
          (ai.detectedCondition !== "desconocido"
            ? ai.detectedCondition
            : ai.primaryMaterial === "organico"
            ? "organico_fresco"
            : "limpio_seco");

        const fingerprint = createScanFingerprint([
          "vision",
          ai.probableObjectName,
          ai.primaryMaterial,
          effectiveCondition,
          imageBase64.slice(-80),
        ]);

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
          visualObservations: ai.visualObservations,
          scanFingerprint: fingerprint,
        });

        return NextResponse.json({
          success: true,
          conclusive: true,
          data: analysis,
          visionAnalysis: ai,
          source: "gemini_vision_multicriteria",
        });
      }

      // Si el usuario escribió una pista (userHint) y la clave de IA no está activa, clasificar por esa pista
      if (userHint && userHint.trim().length > 1) {
        const matched = matchCatalogItemByNameOrSynonym(userHint.trim());
        const resolvedMaterial: MaterialType =
          matched?.primaryMaterial || "plastico_pet";
        const resolvedCondition: WasteConditionState =
          conditionState || matched?.defaultCondition || "limpio_seco";
        const fingerprint = createScanFingerprint([
          "hint",
          userHint.trim(),
          resolvedCondition,
          imageBase64.slice(-64),
        ]);
        const analysis = buildMultiCriteriaAnalysis({
          objectName: matched?.name || userHint.trim(),
          primaryMaterial: resolvedMaterial,
          conditionState: resolvedCondition,
          requiresSpecialManagement: matched?.requiresSpecialManagement,
          matchedWasteItemId: matched?.id,
          municipality,
          scanFingerprint: fingerprint,
        });
        return NextResponse.json({
          success: true,
          conclusive: true,
          data: analysis,
          source: "assisted_photo_multicriteria",
        });
      }

      // NUNCA inventar "Botella de Plástico PET" si falla o no está configurada la IA:
      // solicitar confirmación honesta o nueva toma
      return NextResponse.json({
        success: false,
        conclusive: false,
        requiresConfirmation: true,
        aiConfigured: visionResponse.configured,
        error:
          visionResponse.error ||
          "No se pudo identificar automáticamente la imagen con suficiente confianza. Por favor indica qué residuo o material aparece en tu fotografía o toma otra foto.",
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
    return NextResponse.json(
      {
        success: false,
        conclusive: false,
        requiresConfirmation: true,
        error:
          "Ocurrió un error al procesar la imagen. Por favor intenta con una foto más clara o selecciona el material del residuo.",
      },
      { status: 500 }
    );
  }
}
