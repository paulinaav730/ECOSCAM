import {
  VERIFIED_SOURCES,
  VERIFIED_WASTE_ITEMS,
} from "@/lib/data/verified-environmental-data";
import { normalizeText } from "@/services/classification-engine";
import {
  MaterialType,
  WasteConditionState,
  WasteItem,
  WasteManagementCategory,
} from "@/types/ecoscan";

export interface CatalogFilterOptions {
  query?: string;
  material?: MaterialType | "todos";
  category?: WasteManagementCategory | "todas";
  condition?: WasteConditionState | "todas";
  onlySpecialManagement?: boolean;
}

export function filterWasteCatalog(
  filters: CatalogFilterOptions = {},
  items: WasteItem[] = VERIFIED_WASTE_ITEMS
): WasteItem[] {
  const q = normalizeText(filters.query ?? "");

  return items.filter((item) => {
    if (item.publicationStatus === "borrador") {
      return false;
    }

    if (filters.material && filters.material !== "todos") {
      if (item.primaryMaterial !== filters.material) {
        return false;
      }
    }

    if (filters.category && filters.category !== "todas") {
      if (item.mainCategory !== filters.category) {
        return false;
      }
    }

    if (filters.condition && filters.condition !== "todas") {
      if (item.defaultCondition !== filters.condition) {
        return false;
      }
    }

    if (filters.onlySpecialManagement) {
      if (!item.requiresSpecialManagement) {
        return false;
      }
    }

    if (q) {
      const matchesName = normalizeText(item.name).includes(q);
      const matchesDescription = normalizeText(item.description).includes(q);
      const matchesSynonyms = item.synonyms.some((syn) =>
        normalizeText(syn).includes(q)
      );
      const matchesMaterial = normalizeText(item.primaryMaterial).includes(q);
      if (
        !matchesName &&
        !matchesDescription &&
        !matchesSynonyms &&
        !matchesMaterial
      ) {
        return false;
      }
    }

    return true;
  });
}

export function getWasteItemBySlugOrId(
  slugOrId: string,
  items: WasteItem[] = VERIFIED_WASTE_ITEMS
): WasteItem | null {
  const target = slugOrId.trim().toLowerCase();
  const found = items.find(
    (item) => item.id.toLowerCase() === target || item.slug.toLowerCase() === target
  );
  if (!found) return null;
  return {
    ...found,
    source: found.source ?? VERIFIED_SOURCES[found.sourceId],
  };
}

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  plastico_pet: "Plástico PET (#1)",
  plastico_pead: "Plástico PEAD (#2)",
  plastico_otro: "Otro Plástico / Flexible",
  vidrio: "Vidrio de Envase",
  aluminio: "Aluminio / Lata",
  metal: "Metal / Hojalata",
  papel: "Papel",
  carton: "Cartón",
  multicapa: "Multicapa (Tetra Pak)",
  organico: "Orgánico Biodegradable",
  metal_quimico: "Pilas y Acumuladores",
  farmaceutico: "Medicamento / Farmacéutico",
  raee: "Electrónico / RAEE",
  iluminacion_raee: "Bombilla / Luminaria",
  textil: "Textil / Prenda",
  aceite_vegetal: "Aceite de Cocina Usado (ACU)",
  compuesto_desconocido: "Compuesto / Requiere Revisión",
};

export const CONDITION_LABELS: Record<WasteConditionState, string> = {
  limpio_seco: "Limpio y seco",
  contaminado_comida: "Contaminado con restos de comida",
  contaminado_grasa: "Impregnado de grasa o aceite",
  parcialmente_contaminado: "Parcialmente limpio y parcialmente engrasado",
  contaminado_quimico: "Con trazas químicas, plaguicidas o fármacos",
  riesgo_biologico: "Con riesgo biológico o sanitario",
  organico_fresco: "Orgánico crudo / biodegradable",
  liquido_especial: "Líquido especial (ej. aceite vegetal frío en botella)",
  desconocido: "No estoy seguro del estado",
};

export const CATEGORY_LABELS: Record<WasteManagementCategory, string> = {
  aprovechable: "Aprovechable (Recipiente Blanco)",
  organico_aprovechable: "Orgánico Aprovechable (Recipiente Verde)",
  no_aprovechable: "No Aprovechable (Recipiente Negro)",
  posconsumo_especial: "Gestión Diferenciada / Posconsumo",
  requiere_verificacion: "Requiere Verificación de Estado o Ruta",
};
