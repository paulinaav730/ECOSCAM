import { describe, expect, it } from "vitest";
import {
  evaluateWasteClassification,
  matchCatalogItemByNameOrSynonym,
} from "@/services/classification-engine";
import {
  filterWasteCatalog,
  getWasteItemBySlugOrId,
} from "@/services/waste-catalog-service";
import {
  analyzeWasteImageWithGemini,
  checkAIRateLimit,
} from "@/services/ai-vision-service";
import { filterCollectionPoints } from "@/services/collection-points-service";
import {
  AdminWasteItemUpdateSchema,
  FeedbackReportInputSchema,
  ImageAnalysisRequestSchema,
  RuleEvaluationInputSchema,
} from "@/lib/validations/schemas";
import { WokwiESP32ControllerBridge } from "@/lib/wokwi/esp32-controller";
import { ECOWORLD_REWARD_CONFIG } from "@/components/ecoscan-ui/types";
import { INITIAL_ECOWORLD_PROGRESS } from "@/components/ecoscan-ui/EcoWorldScreen";

describe("EcoScan — Motor de Reglas de Clasificación Ambiental (Res. 2184 de 2019 y Posconsumo)", () => {
  it("clasifica botella PET limpia y seca en recipiente BLANCO (Aprovechable)", () => {
    const result = evaluateWasteClassification({
      objectName: "Botella de agua",
      primaryMaterial: "plastico_pet",
      conditionState: "limpio_seco",
      municipality: "Medellín",
    });

    expect(result.finalCategory).toBe("aprovechable");
    expect(result.containerColor).toBe("blanco");
    expect(result.ruleCode).toBe("COL-APR-005");
    expect(result.requiresClarification).toBe(false);
    expect(result.source.id).toBe("src-res-2184-2019");
  });

  it("clasifica servilleta o papel contaminado con comida/grasa en recipiente NEGRO (No aprovechable)", () => {
    const result = evaluateWasteClassification({
      objectName: "Servilleta usada con grasa",
      primaryMaterial: "papel",
      conditionState: "contaminado_comida",
      municipality: "Medellín",
    });

    expect(result.finalCategory).toBe("no_aprovechable");
    expect(result.containerColor).toBe("negro");
    expect(result.ruleCode).toBe("COL-CONT-002");
  });

  it("evalúa caja de pizza parcialmente contaminada exigiendo separación por partes (Tapa limpia vs. Base engrasada)", () => {
    const result = evaluateWasteClassification({
      objectName: "Caja de pizza",
      primaryMaterial: "carton",
      conditionState: "parcialmente_contaminado",
      municipality: "Envigado",
    });

    expect(result.finalCategory).toBe("requiere_verificacion");
    expect(result.containerColor).toBe("verificacion");
    expect(result.ruleCode).toBe("COL-PART-002A");
    expect(result.recommendation).toContain("BLANCA");
    expect(result.recommendation).toContain("NEGRA");
  });

  it("prioriza gestión posconsumo para pilas, medicamentos, bombillas y RAEE fuera de las 3 canecas domésticas", () => {
    const pilaResult = evaluateWasteClassification({
      objectName: "Pila alcalina AA",
      primaryMaterial: "metal_quimico",
      conditionState: "limpio_seco",
      requiresSpecialManagement: true,
    });

    expect(pilaResult.finalCategory).toBe("posconsumo_especial");
    expect(pilaResult.containerColor).toBe("punto_posconsumo");
    expect(pilaResult.ruleCode).toBe("COL-POS-001");
    expect(pilaResult.specialManagementDetails?.programName).toContain(
      "Pilas con el Ambiente"
    );

    const medResult = evaluateWasteClassification({
      objectName: "Pastillas vencidas",
      primaryMaterial: "farmaceutico",
      conditionState: "contaminado_quimico",
      requiresSpecialManagement: true,
    });

    expect(medResult.finalCategory).toBe("posconsumo_especial");
    expect(medResult.specialManagementDetails?.programName).toContain(
      "Punto Azul"
    );
  });

  it("bloquea el reciclaje ordinario si un envase plástico contuvo plaguicidas o químicos peligrosos", () => {
    const chemResult = evaluateWasteClassification({
      objectName: "Tarro plástico de veneno",
      primaryMaterial: "plastico_pead",
      conditionState: "contaminado_quimico",
    });

    expect(chemResult.finalCategory).toBe("posconsumo_especial");
    expect(chemResult.containerColor).toBe("punto_posconsumo");
    expect(chemResult.ruleCode).toBe("COL-CONT-003");
  });

  it("evita recomendaciones definitivas cuando el material es ambiguo o la confianza de IA es baja (< 0.65)", () => {
    const uncertainResult = evaluateWasteClassification({
      objectName: "Empaque desconocido",
      primaryMaterial: "compuesto_desconocido",
      conditionState: "desconocido",
      aiConfidence: 0.42,
    });

    expect(uncertainResult.requiresClarification).toBe(true);
    expect(uncertainResult.uncertaintyNotice).toBeDefined();
    expect(uncertainResult.clarificationQuestions.length).toBeGreaterThan(0);
  });
});

describe("EcoScan — Catálogo y Buscador de Residuos", () => {
  it("encuentra fichas por sinónimos cotidianos colombianos", () => {
    const tetra = matchCatalogItemByNameOrSynonym("caja de leche");
    expect(tetra).not.toBeNull();
    expect(tetra?.id).toBe("item-envase-multicapa");

    const acu = matchCatalogItemByNameOrSynonym("aceite quemado");
    expect(acu).not.toBeNull();
    expect(acu?.id).toBe("item-aceite-cocina-usado");
  });

  it("filtra correctamente por gestión especial posconsumo y categoría", () => {
    const specialOnly = filterWasteCatalog({ onlySpecialManagement: true });
    expect(specialOnly.length).toBeGreaterThanOrEqual(7);
    expect(specialOnly.every((item) => item.requiresSpecialManagement)).toBe(
      true
    );

    const organicos = filterWasteCatalog({ category: "organico_aprovechable" });
    expect(organicos.length).toBeGreaterThanOrEqual(2);
    expect(
      organicos.every((item) => item.containerColor === "verde")
    ).toBe(true);
  });

  it("recupera ficha detallada por slug con fuente verificada", () => {
    const item = getWasteItemBySlugOrId("medicamentos-vencidos");
    expect(item).not.toBeNull();
    expect(item?.source?.entityName).toContain("Punto Azul");
  });
});

describe("EcoScan — Validación de Entradas y Seguridad", () => {
  it("valida tipos MIME permitidos y rechaza formatos no soportados en el escáner", () => {
    const valid = ImageAnalysisRequestSchema.safeParse({
      imageBase64: "data:image/jpeg;base64," + "A".repeat(100),
      mimeType: "image/jpeg",
      municipality: "Medellín",
    });
    expect(valid.success).toBe(true);

    const invalidMime = ImageAnalysisRequestSchema.safeParse({
      imageBase64: "A".repeat(100),
      mimeType: "application/pdf",
    });
    expect(invalidMime.success).toBe(false);
  });

  it("valida reportes de usuarios y esquemas administrativos", () => {
    const shortFeedback = FeedbackReportInputSchema.safeParse({
      reportType: "correccion_clasificacion",
      content: "Corto",
    });
    expect(shortFeedback.success).toBe(false);

    const validFeedback = FeedbackReportInputSchema.safeParse({
      reportType: "actualizacion_punto",
      content:
        "El punto posconsumo del centro comercial actualizó su horario de atención.",
      municipality: "Medellín",
    });
    expect(validFeedback.success).toBe(true);

    const validAdmin = AdminWasteItemUpdateSchema.safeParse({
      id: "item-botella-plastico",
      name: "Botella de plástico (PET)",
      description: "Envase plástico transparente para bebidas.",
      mainCategory: "aprovechable",
      primaryMaterial: "plastico_pet",
      defaultCondition: "limpio_seco",
      requiresSpecialManagement: false,
      publicationStatus: "verificado",
    });
    expect(validAdmin.success).toBe(true);

    const validRuleInput = RuleEvaluationInputSchema.safeParse({
      objectName: "Frasco de mermelada",
      primaryMaterial: "vidrio",
      conditionState: "limpio_seco",
    });
    expect(validRuleInput.success).toBe(true);
  });
});

describe("EcoScan — Servicio de IA y Puntos de Recolección", () => {
  it("informa honestamente cuando falta GEMINI_API_KEY sin simular resultados de IA", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await analyzeWasteImageWithGemini({
      imageBase64: "A".repeat(120),
      mimeType: "image/jpeg",
    });

    expect(res.configured).toBe(false);
    expect(res.analysis).toBeUndefined();
    expect(res.error).toContain("no está configurado");

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  it("aplica límite de tasa (rate limit) para proteger el endpoint de IA", () => {
    const testIp = "test-client-ip-rate-limit";
    let lastCheck = { allowed: true };
    for (let i = 0; i < 15; i++) {
      lastCheck = checkAIRateLimit(testIp);
    }
    expect(lastCheck.allowed).toBe(false);
  });

  it("filtra puntos de recolección verificados sin inventar coordenadas ficticias", () => {
    const points = filterCollectionPoints({
      municipality: "Medellín",
      wasteCategory: "posconsumo_especial",
    });
    expect(points.length).toBeGreaterThan(0);
    expect(
      points.every((p) =>
        p.materialsAccepted.some((m) => m.wasteCategory === "posconsumo_especial")
      )
    ).toBe(true);
  });
});

describe("EcoScan — Integración ECO WORLD 2D y Wokwi ESP32", () => {
  it("inicializa los 4 ecosistemas con Parque Olvidado desbloqueado y los demás bloqueados en cero", () => {
    expect(INITIAL_ECOWORLD_PROGRESS.totalEcoWorldPoints).toBe(0);
    expect(INITIAL_ECOWORLD_PROGRESS.missionsCompleted).toBe(0);
    expect(INITIAL_ECOWORLD_PROGRESS.ecosystems.parque_olvidado.unlocked).toBe(true);
    expect(INITIAL_ECOWORLD_PROGRESS.ecosystems.rio_contaminado.unlocked).toBe(false);
    expect(INITIAL_ECOWORLD_PROGRESS.ecosystems.bosque_perdido.unlocked).toBe(false);
    expect(INITIAL_ECOWORLD_PROGRESS.ecosystems.ciudad_verde.unlocked).toBe(false);
  });

  it("configura recompensas oficiales de ECO WORLD (+5 misión, +5 objetivos, +5 perfecta)", () => {
    expect(ECOWORLD_REWARD_CONFIG.completeMission).toBe(5);
    expect(ECOWORLD_REWARD_CONFIG.completeAllObjectives).toBe(5);
    expect(ECOWORLD_REWARD_CONFIG.perfectMission).toBe(5);
  });

  it("normaliza lecturas ADC de potenciómetro ESP32 (0..4095) a eje [-1..1] sin simular conexión falsa", () => {
    const bridge = new WokwiESP32ControllerBridge();
    expect(bridge.connectionStatus).toBe("disconnected");
    expect(WokwiESP32ControllerBridge.normalizePotentiometerADC(0)).toBe(-1);
    expect(WokwiESP32ControllerBridge.normalizePotentiometerADC(2048)).toBe(0);
    expect(WokwiESP32ControllerBridge.normalizePotentiometerADC(4095)).toBe(1);
  });
});
