import {
  VERIFIED_CLASSIFICATION_RULES,
  VERIFIED_SOURCES,
  VERIFIED_WASTE_ITEMS,
} from "@/lib/data/verified-environmental-data";
import {
  ClassificationRule,
  ContainerColorCode,
  RuleEngineEvaluationResult,
  RuleEngineInput,
  WasteItem,
} from "@/types/ecoscan";

export function getContainerLabel(color: ContainerColorCode): string {
  switch (color) {
    case "blanco":
      return "Recipiente / Bolsa BLANCA — Residuos Aprovechables (Res. 2184 de 2019)";
    case "verde":
      return "Recipiente / Bolsa VERDE — Orgánicos Aprovechables (Res. 2184 de 2019)";
    case "negro":
      return "Recipiente / Bolsa NEGRA — Residuos No Aprovechables (Res. 2184 de 2019)";
    case "punto_posconsumo":
      return "Punto Posconsumo / Gestión Diferenciada Especial (PROHIBIDO en canecas domésticas)";
    case "verificacion":
      return "Separación Condicionada / Requiere Verificación de Estado o Ruta Local";
  }
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchCatalogItemByNameOrSynonym(
  query: string,
  catalog: WasteItem[] = VERIFIED_WASTE_ITEMS
): WasteItem | null {
  const q = normalizeText(query);
  if (!q) return null;

  // 1. Coincidencia exacta por ID, slug o nombre
  for (const item of catalog) {
    if (
      item.id === query ||
      item.slug === q ||
      normalizeText(item.name) === q
    ) {
      return item;
    }
  }

  // 2. Coincidencia exacta en sinónimos
  for (const item of catalog) {
    if (item.synonyms.some((syn) => normalizeText(syn) === q)) {
      return item;
    }
  }

  // 3. Coincidencia parcial por nombre, sinónimos o palabras clave relevantes
  const queryTokens = q.split(/\s+/).filter((w) => w.length >= 3);
  for (const item of catalog) {
    const itemNameNorm = normalizeText(item.name);
    if (
      itemNameNorm.includes(q) ||
      q.includes(itemNameNorm) ||
      item.synonyms.some(
        (syn) => normalizeText(syn).includes(q) || q.includes(normalizeText(syn))
      )
    ) {
      return item;
    }

    if (
      queryTokens.length > 0 &&
      item.synonyms.some((syn) => {
        const synTokens = normalizeText(syn)
          .split(/\s+/)
          .filter((w) => w.length >= 2);
        return (
          synTokens.length > 0 &&
          synTokens.every((st) => q.includes(st))
        );
      })
    ) {
      return item;
    }
  }

  return null;
}

/**
 * Motor determinístico de reglas ambientales de EcoScan.
 * La IA nunca decide libremente la normativa ni la ruta final: este motor
 * contrasta el material, estado, contaminación, necesidad posconsumo y municipio
 * contra las reglas verificadas almacenadas.
 */
export function evaluateWasteClassification(
  input: RuleEngineInput,
  customRules: ClassificationRule[] = VERIFIED_CLASSIFICATION_RULES,
  catalog: WasteItem[] = VERIFIED_WASTE_ITEMS
): RuleEngineEvaluationResult {
  const municipality = input.municipality?.trim() || "Medellín";
  const matchedByText =
    (input.matchedWasteItemId
      ? catalog.find((i) => i.id === input.matchedWasteItemId)
      : null) ?? matchCatalogItemByNameOrSynonym(input.objectName, catalog);

  const matchedItem =
    matchedByText ??
    catalog.find(
      (i) =>
        i.primaryMaterial === input.primaryMaterial &&
        i.requiresSpecialManagement
    ) ??
    null;

  const effectiveMaterial = input.primaryMaterial;
  const effectiveCondition = input.conditionState;
  const isSpecialPosconsumo =
    Boolean(input.requiresSpecialManagement) ||
    Boolean(matchedItem?.requiresSpecialManagement) ||
    [
      "metal_quimico",
      "farmaceutico",
      "raee",
      "iluminacion_raee",
      "aceite_vegetal",
      "textil",
    ].includes(effectiveMaterial);

  const hasLowConfidence =
    typeof input.aiConfidence === "number" && input.aiConfidence < 0.65;
  const isAmbiguousMaterial =
    effectiveMaterial === "compuesto_desconocido" ||
    effectiveMaterial === "plastico_otro";
  const isUnknownCondition = effectiveCondition === "desconocido";

  const clarificationQuestions: string[] = [];

  if (isUnknownCondition) {
    clarificationQuestions.push(
      "¿El residuo se encuentra completamente limpio y seco, o tiene restos de comida, grasa o sustancias químicas?"
    );
  }
  if (isAmbiguousMaterial) {
    clarificationQuestions.push(
      "¿El envase tiene número de identificación de resina plástica (ej. #1 PET, #2 PEAD, #5 PP) o es un empaque flexible metalizado?"
    );
  }
  if (
    effectiveMaterial === "carton" &&
    normalizeText(input.objectName).includes("pizza") &&
    effectiveCondition === "limpio_seco"
  ) {
    clarificationQuestions.push(
      "¿La base inferior de la caja de pizza tiene manchas de grasa o queso adherido? Recuerda separar la tapa limpia (Blanco) de la base engrasada (Negro)."
    );
  }
  if (hasLowConfidence) {
    clarificationQuestions.push(
      "La certeza visual del reconocimiento es moderada/baja. ¿Confirmas que el objeto y su material principal son los indicados?"
    );
  }

  const sortedRules = [...customRules].sort((a, b) => a.priority - b.priority);

  let selectedRule: ClassificationRule | undefined;

  // Evaluación por prioridad jerárquica (Biomimética: reglas locales de aislamiento de riesgo primero)
  for (const rule of sortedRules) {
    const cond = rule.conditions;

    // Regla 1: Posconsumo / Manejo Especial
    if (cond.requiresSpecialManagement && isSpecialPosconsumo) {
      selectedRule = rule;
      break;
    }

    // Regla 2: Contaminación química o biológica
    if (
      cond.conditions &&
      (effectiveCondition === "contaminado_quimico" ||
        effectiveCondition === "riesgo_biologico") &&
      cond.conditions.includes(effectiveCondition)
    ) {
      selectedRule = rule;
      break;
    }

    // Regla 3: Parcialmente contaminado (ej. Caja de pizza)
    if (
      cond.conditions?.includes("parcialmente_contaminado") &&
      effectiveCondition === "parcialmente_contaminado" &&
      (!cond.materials || cond.materials.includes(effectiveMaterial))
    ) {
      selectedRule = rule;
      break;
    }

    // Regla 4: Contaminado con grasa o comida en materiales porosos (papel/cartón)
    if (
      (effectiveCondition === "contaminado_grasa" ||
        effectiveCondition === "contaminado_comida" ||
        input.hasContamination) &&
      cond.conditions?.some((c) =>
        ["contaminado_grasa", "contaminado_comida"].includes(c)
      ) &&
      (!cond.materials || cond.materials.includes(effectiveMaterial))
    ) {
      selectedRule = rule;
      break;
    }

    // Regla 5: Orgánico aprovechable
    if (
      effectiveMaterial === "organico" &&
      cond.materials?.includes("organico") &&
      cond.conditions?.includes(effectiveCondition)
    ) {
      selectedRule = rule;
      break;
    }

    // Regla 6: Aprovechable limpio y seco
    if (
      effectiveCondition === "limpio_seco" &&
      !input.hasContamination &&
      !isSpecialPosconsumo &&
      cond.conditions?.includes("limpio_seco") &&
      cond.materials?.includes(effectiveMaterial)
    ) {
      selectedRule = rule;
      break;
    }
  }

  // Si hay incertidumbre crítica o no hubo regla específica, usar regla de verificación (COL-VER-099)
  if (!selectedRule || isAmbiguousMaterial || isUnknownCondition) {
    selectedRule =
      sortedRules.find((r) => r.id === "rule-verificacion-material-ambiguo") ??
      sortedRules[sortedRules.length - 1];
  }

  const source =
    (matchedItem?.sourceId ? VERIFIED_SOURCES[matchedItem.sourceId] : null) ??
    VERIFIED_SOURCES[selectedRule.sourceId] ??
    VERIFIED_SOURCES["src-res-2184-2019"];

  // Si existe ficha específica verificada y el estado coincide con la condición por defecto, enriquecer los pasos de preparación
  const useItemSpecificPrep =
    matchedItem &&
    (effectiveCondition === matchedItem.defaultCondition || isSpecialPosconsumo);

  const preparationSteps = useItemSpecificPrep
    ? matchedItem.preparationInstructions
    : selectedRule.preparationSteps;

  const mistakesToAvoid = useItemSpecificPrep
    ? matchedItem.warnings
    : selectedRule.mistakesToAvoid;

  const whyExplanation = useItemSpecificPrep
    ? `${matchedItem.whyExplanation} (${selectedRule.explanation})`
    : selectedRule.explanation;

  const circularAlternatives = matchedItem?.circularAlternatives?.length
    ? matchedItem.circularAlternatives
    : [
        {
          type: "reducir" as const,
          title: "Prevención y consumo responsable",
          description:
            "Antes de adquirir un producto, verifica si existe una alternativa reutilizable, recargable o de menor impacto de empaque.",
          safetyNote:
            "Nunca reutilices envases que hayan contenido sustancias químicas, solventes o medicamentos.",
        },
      ];

  const municipalityContext =
    municipality.toLowerCase().includes("medell") ||
    [
      "bello",
      "envigado",
      "itagüí",
      "itagui",
      "sabaneta",
      "la estrella",
      "caldas",
      "copacabana",
      "girardota",
      "barbosa",
    ].includes(normalizeText(municipality))
      ? `Contexto ${municipality} (Valle de Aburrá): Aplica el código nacional Resolución 2184 de 2019. Verifica los horarios de la ruta de aprovechamiento de tu sector (ej. Emvarias Grupo EPM en Medellín o el operador de tu municipio) y las estaciones o contenedores posconsumo autorizados.`
      : `Contexto ${municipality} (Colombia): Aplica el código nacional Resolución 2184 de 2019 (Blanco, Verde y Negro) y los programas posconsumo nacionales acreditados ante la ANLA. Confirma con el operador de aseo de ${municipality} las frecuencias de recolección selectiva.`;

  const requiresClarification =
    hasLowConfidence ||
    isAmbiguousMaterial ||
    isUnknownCondition ||
    selectedRule.targetCategory === "requiere_verificacion";

  const uncertaintyNotice = requiresClarification
    ? "Atención: Una fotografía o descripción general no siempre permite determinar con certeza absoluta la composición exacta del polímero ni su grado de contaminación interna. Revisa las preguntas de verificación antes de depositar el residuo."
    : undefined;

  return {
    ruleId: selectedRule.id,
    ruleCode: selectedRule.code,
    ruleName: selectedRule.name,
    finalCategory: selectedRule.targetCategory,
    containerColor: selectedRule.containerColor,
    containerLabel: getContainerLabel(selectedRule.containerColor),
    recommendation: selectedRule.recommendation,
    preparationSteps,
    whyExplanation,
    mistakesToAvoid,
    circularAlternatives,
    specialManagementDetails: matchedItem?.specialManagementDetails ?? null,
    requiresClarification,
    clarificationQuestions,
    uncertaintyNotice,
    municipalityContext,
    source,
    validationStatus: selectedRule.validationStatus,
    reviewedAt: selectedRule.reviewedAt,
    matchedWasteItem: matchedItem,
  };
}
