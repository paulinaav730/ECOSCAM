import { NextRequest, NextResponse } from "next/server";
import { filterWasteCatalog } from "@/services/waste-catalog-service";
import {
  MaterialType,
  WasteConditionState,
  WasteManagementCategory,
} from "@/types/ecoscan";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const material = (searchParams.get("material") ?? "todos") as
    | MaterialType
    | "todos";
  const category = (searchParams.get("category") ?? "todas") as
    | WasteManagementCategory
    | "todas";
  const condition = (searchParams.get("condition") ?? "todas") as
    | WasteConditionState
    | "todas";
  const onlySpecialManagement = searchParams.get("special") === "true";

  const results = filterWasteCatalog({
    query,
    material,
    category,
    condition,
    onlySpecialManagement,
  });

  return NextResponse.json({
    count: results.length,
    items: results,
  });
}
