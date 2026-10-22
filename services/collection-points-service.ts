import { VERIFIED_COLLECTION_POINTS } from "@/lib/data/verified-environmental-data";
import { normalizeText } from "@/services/classification-engine";
import { CollectionPoint, WasteManagementCategory } from "@/types/ecoscan";

export interface CollectionPointFilter {
  municipality?: string;
  wasteCategory?: WasteManagementCategory | "todas";
  searchQuery?: string;
}

export function filterCollectionPoints(
  filter: CollectionPointFilter = {},
  points: CollectionPoint[] = VERIFIED_COLLECTION_POINTS
): CollectionPoint[] {
  const query = normalizeText(filter.searchQuery ?? "");
  const muni = normalizeText(filter.municipality ?? "");

  return points.filter((point) => {
    if (muni && muni !== "todos") {
      const pointMuni = normalizeText(point.municipality);
      const isNationalNetwork = point.id.startsWith("cp-nac-");
      if (pointMuni !== muni && !isNationalNetwork) {
        return false;
      }
    }

    if (filter.wasteCategory && filter.wasteCategory !== "todas") {
      const acceptsCategory = point.materialsAccepted.some(
        (m) => m.wasteCategory === filter.wasteCategory
      );
      if (!acceptsCategory) {
        return false;
      }
    }

    if (query) {
      const matchesName = normalizeText(point.name).includes(query);
      const matchesOperator = normalizeText(point.entityOperator).includes(query);
      const matchesDesc = normalizeText(point.description).includes(query);
      const matchesMaterials = point.materialsAccepted.some((m) =>
        normalizeText(m.materialName).includes(query)
      );
      if (
        !matchesName &&
        !matchesOperator &&
        !matchesDesc &&
        !matchesMaterials
      ) {
        return false;
      }
    }

    return true;
  });
}
