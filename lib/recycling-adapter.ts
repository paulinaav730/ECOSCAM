import { evaluateWasteClassification } from "@/services/classification-engine";
import {
  MaterialType,
  RuleEngineInput,
  WasteConditionState,
} from "@/types/ecoscan";
import {
  BinColorType,
  CategoryType,
  WasteAnalysis,
} from "@/components/ecoscan-ui/types";

function mapMaterialToCategoryType(
  material: MaterialType,
  requiresSpecialManagement: boolean,
  finalCategory: string
): CategoryType {
  if (requiresSpecialManagement || finalCategory === "posconsumo_especial") {
    return "posconsumo";
  }
  switch (material) {
    case "plastico_pet":
    case "plastico_pead":
    case "plastico_otro":
      return "plástico";
    case "papel":
    case "carton":
      return finalCategory === "no_aprovechable" ? "no_aprovechable" : "papel_cartón";
    case "vidrio":
      return "vidrio";
    case "aluminio":
    case "metal":
      return "metal";
    case "multicapa":
      return "multicapa";
    case "organico":
      return "orgánico";
    case "metal_quimico":
    case "farmaceutico":
    case "raee":
    case "iluminacion_raee":
    case "aceite_vegetal":
      return "posconsumo";
    default:
      return finalCategory === "no_aprovechable" ? "no_aprovechable" : "plástico";
  }
}

function getDerivedProductsForEvaluation(
  material: MaterialType,
  finalCategory: string
): string[] {
  if (finalCategory === "no_aprovechable") {
    return [
      "Al estar contaminado con grasa, comida o fluidos, sus fibras o polímeros no pueden reprocesarse industrialmente.",
      "Separarlo a tiempo en ruta No Aprovechable evita arruinar lotes enteros de material limpio de los recicladores de oficio.",
    ];
  }

  if (finalCategory === "posconsumo_especial") {
    switch (material) {
      case "metal_quimico":
        return [
          "Recuperación metalúrgica controlada de zinc, manganeso, acero y níquel.",
          "Neutralización segura de electrolitos para proteger acuíferos colombianos.",
        ];
      case "farmaceutico":
        return [
          "Termodestrucción controlada en hornos autorizados (Corporación Punto Azul).",
          "Prevención de contaminación farmacéutica en ríos y falsificación de medicamentos.",
        ];
      case "aceite_vegetal":
        return [
          "Transformación en biodiésel de segunda generación con menor huella de carbono.",
          "Insumos industriales para jabonería ecológica y ceras técnicas.",
        ];
      case "iluminacion_raee":
      case "raee":
        return [
          "Recuperación de cobre, aluminio, oro, plata y plásticos de ingeniería.",
          "Captura hermética de vapor de mercurio (en bombillos fluorescentes).",
        ];
      default:
        return [
          "Valorización técnica especializada en plantas autorizadas por la ANLA.",
          "Aislamiento seguro de componentes peligrosos fuera del relleno sanitario.",
        ];
    }
  }

  switch (material) {
    case "plastico_pet":
    case "plastico_pead":
    case "plastico_otro":
      return [
        "Nuevas botellas y envases de grado alimenticio (rPET).",
        "Fibras textiles de poliéster para camisetas, chaquetas y morrales.",
        "Madera plástica para parques infantiles, estibas y mobiliario urbano.",
        "Cerdas para escobas, cepillos y filamento para impresión 3D.",
      ];
    case "papel":
    case "carton":
      return [
        "Nuevas cajas de cartón corrugado para embalaje nacional.",
        "Bandejas moldeadas de pulpa para huevos y portavasos.",
        "Papel kraft, cuadernos ecológicos y tubos de cartón industrial.",
      ];
    case "vidrio":
      return [
        "Nuevas botellas y frascos de vidrio con 100% de reciclabilidad infinita.",
        "Vitrificados cerámicos y agregados ecológicos para construcción.",
      ];
    case "aluminio":
    case "metal":
      return [
        "Nuevas latas de aluminio en menos de 60 días sin pérdida de calidad.",
        "Componentes para bicicletas, marcos de ventanas y autopartes.",
        "Perfiles de acero y láminas metalmecánicas.",
      ];
    case "multicapa":
      return [
        "Láminas acanaladas y tejas termoacústicas de polialuminio (Tectán).",
        "Pulpa de celulosa de alta resistencia para cajas y mobiliario escolar.",
      ];
    case "organico":
      return [
        "Compost y abono orgánico rico en nutrientes para huertas y suelos.",
        "Humus de lombriz y biofertilizantes regenerativos.",
        "Biogás mediante biodigestión anaerobia.",
      ];
    default:
      return [
        "Materia prima secundaria para cadenas de economía circular en Colombia.",
      ];
  }
}

function getEnvironmentalImpactMessage(
  material: MaterialType,
  finalCategory: string
): string {
  if (finalCategory === "posconsumo_especial") {
    return "Entregar este residuo en un Punto Posconsumo oficial evita la contaminación de hasta miles de litros de agua subterránea por metales pesados, fármacos o aceites.";
  }
  if (finalCategory === "no_aprovechable") {
    return "Aislar los residuos engrasados o contaminados en la caneca negra protege la calidad del material reciclable limpio que recolectan los recicladores de oficio.";
  }
  switch (material) {
    case "aluminio":
    case "metal":
      return "Reciclar aluminio ahorra hasta el 95% de la energía eléctrica frente a extraer bauxita virgen y evita emisiones críticas de CO2.";
    case "carton":
    case "papel":
      return "Cada tonelada de cartón y papel limpio recuperado evita la tala de ~17 árboles adultos y ahorra más de 26.000 litros de agua.";
    case "plastico_pet":
    case "plastico_pead":
    case "plastico_otro":
      return "Aprovechar envases plásticos limpios reduce hasta un 70% el consumo energético frente a producir resina virgen derivada del petróleo.";
    case "vidrio":
      return "El vidrio es 100% reciclable infinitas veces; cada envase fundido ahorra un 30% de energía y evita la extracción de arena sílice.";
    case "organico":
      return "Compostar o separar orgánicos evita que se descompongan sin oxígeno en rellenos sanitarios generando gas metano (28 veces más potente que el CO2).";
    default:
      return "La separación multicriterio en la fuente reduce la presión sobre los rellenos sanitarios de Colombia e impulsa la economía circular.";
  }
}

function calculateEcoPoints(
  material: MaterialType,
  finalCategory: string,
  conditionState: WasteConditionState
): number {
  if (finalCategory === "posconsumo_especial") return 35;
  if (material === "aluminio" || material === "vidrio") return 30;
  if (material === "carton" || material === "multicapa") {
    return conditionState === "parcialmente_contaminado" ? 25 : 25;
  }
  if (finalCategory === "aprovechable") return 20;
  if (finalCategory === "organico_aprovechable") return 15;
  return 15; // Reconocer aislamiento correcto de no aprovechable para no contaminar
}

export function buildMultiCriteriaAnalysis(
  input: RuleEngineInput & { imageUrl?: string }
): WasteAnalysis {
  const evaluation = evaluateWasteClassification(input);

  let binColor: BinColorType = "Blanco";
  let binHexColor = "#FFFFFF";

  if (evaluation.containerColor === "blanco") {
    binColor = "Blanco";
    binHexColor = "#FFFFFF";
  } else if (evaluation.containerColor === "verde") {
    binColor = "Verde";
    binHexColor = "#16A34A";
  } else if (evaluation.containerColor === "negro") {
    binColor = "Negro";
    binHexColor = "#1E293B";
  } else if (evaluation.containerColor === "punto_posconsumo") {
    binColor = "Posconsumo";
    binHexColor = "#F59E0B";
  } else {
    // verificacion / parcialmente_contaminado
    if (input.conditionState === "parcialmente_contaminado") {
      binColor = "Negro";
      binHexColor = "#1E293B";
    } else {
      binColor = "Blanco";
      binHexColor = "#FFFFFF";
    }
  }

  const wasteName =
    evaluation.matchedWasteItem?.name || input.objectName || "Residuo Analizado";

  const category = mapMaterialToCategoryType(
    input.primaryMaterial,
    Boolean(evaluation.specialManagementDetails) ||
      evaluation.finalCategory === "posconsumo_especial",
    evaluation.finalCategory
  );

  const derivedProducts = getDerivedProductsForEvaluation(
    input.primaryMaterial,
    evaluation.finalCategory
  );

  const environmentalImpact = getEnvironmentalImpactMessage(
    input.primaryMaterial,
    evaluation.finalCategory
  );

  const ecoPoints = calculateEcoPoints(
    input.primaryMaterial,
    evaluation.finalCategory,
    input.conditionState
  );

  return {
    wasteName,
    category,
    binColor,
    binHexColor,
    binDescription: `${evaluation.recommendation} — ${evaluation.whyExplanation}`,
    preparationSteps: evaluation.preparationSteps,
    derivedProducts,
    environmentalImpact,
    ecoPoints,
    tips: evaluation.municipalityContext,
    imageUrl: input.imageUrl,

    // Campos enriquecidos del motor multicriterio EcoScan
    ruleCode: evaluation.ruleCode,
    ruleName: evaluation.ruleName,
    primaryMaterial: input.primaryMaterial,
    conditionEvaluated: input.conditionState,
    containerLabel: evaluation.containerLabel,
    recommendation: evaluation.recommendation,
    whyExplanation: evaluation.whyExplanation,
    requiresSpecialManagement:
      evaluation.finalCategory === "posconsumo_especial" ||
      Boolean(evaluation.specialManagementDetails),
    requiresClarification: evaluation.requiresClarification,
    clarificationQuestions: evaluation.clarificationQuestions,
    uncertaintyNotice: evaluation.uncertaintyNotice,
    commonMistakesToAvoid: evaluation.mistakesToAvoid,
    circularAlternatives: evaluation.circularAlternatives,
    specialManagementDetails: evaluation.specialManagementDetails,
    verifiedSource: evaluation.source,
    municipalityContext: evaluation.municipalityContext,
  };
}
