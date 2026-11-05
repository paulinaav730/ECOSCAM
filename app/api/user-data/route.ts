import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HistoryItem } from "@/components/ecoscan-ui/types";

/**
 * GET /api/user-data
 * Consulta el historial de escaneos, puntos acumulados y progreso de Eco World
 * del usuario autenticado directamente desde PostgreSQL en Supabase (protegido por RLS).
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        authenticated: false,
        supabaseConfigured: false,
        history: [],
        ecoWorldProgress: null,
        profile: null,
      });
    }

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({
        authenticated: false,
        supabaseConfigured: true,
        history: [],
        ecoWorldProgress: null,
        profile: null,
      });
    }

    // 1. Obtener perfil del usuario
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Obtener historial de escaneos del usuario autenticado (RLS: user_id = auth.uid())
    const { data: scanRows } = await supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const historyItems: HistoryItem[] = (scanRows || []).map(
      (row: Record<string, unknown>) => {
        const payload = (row.analysis_payload || {}) as Partial<HistoryItem>;
        const containerRaw = String(row.container_color || "blanco");
        const defaultBinColor =
          containerRaw === "verde"
            ? "Verde"
            : containerRaw === "negro"
            ? "Negro"
            : containerRaw === "punto_posconsumo"
            ? "Posconsumo"
            : "Blanco";

        return {
          id: String(row.id),
          userId: String(row.user_id),
          scannedAt: String(row.created_at || new Date().toISOString()),
          scanFingerprint:
            (row.scan_fingerprint as string | undefined) ||
            payload.scanFingerprint,
          wasteName:
            payload.wasteName ||
            String(row.identified_object || "Residuo Escaneado"),
          category: payload.category || "plástico",
          binColor: payload.binColor || defaultBinColor,
          binHexColor:
            payload.binHexColor ||
            (defaultBinColor === "Verde"
              ? "#16A34A"
              : defaultBinColor === "Negro"
              ? "#1E293B"
              : defaultBinColor === "Posconsumo"
              ? "#F59E0B"
              : "#FFFFFF"),
          binDescription:
            payload.binDescription ||
            String(row.recommendation || "Separación normativa Colombia"),
          preparationSteps: payload.preparationSteps || [
            "Verificar que el residuo esté limpio y seco antes de entregarlo.",
          ],
          derivedProducts: payload.derivedProducts || [
            "Aprovechamiento en cadenas de economía circular.",
          ],
          environmentalImpact:
            payload.environmentalImpact ||
            "Contribuye a reducir el entierro de materiales aprovechables en rellenos sanitarios.",
          ecoPoints:
            typeof row.eco_points === "number"
              ? row.eco_points
              : payload.ecoPoints || 20,
          tips: payload.tips || String(row.municipality || "Colombia"),
          imageUrl: (row.image_url as string | undefined) || payload.imageUrl,
          primaryMaterial: payload.primaryMaterial,
          primaryMaterialLabel: payload.primaryMaterialLabel,
          separationCategoryLabel: payload.separationCategoryLabel,
          disposalInstructions: payload.disposalInstructions,
          conditionEvaluated: payload.conditionEvaluated,
          ruleCode: payload.ruleCode,
          ruleName: payload.ruleName,
          requiresSpecialManagement: payload.requiresSpecialManagement,
          circularAlternatives: payload.circularAlternatives,
          specialManagementDetails: payload.specialManagementDetails,
          verifiedSource: payload.verifiedSource,
        };
      }
    );

    // 3. Obtener progreso de Eco World
    const { data: ecoWorldRow } = await supabase
      .from("ecoworld_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      supabaseConfigured: true,
      user: {
        id: user.id,
        email: user.email,
        name:
          profileData?.alias ||
          user.user_metadata?.alias ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Usuario EcoScan",
        city:
          profileData?.preferred_municipality ||
          user.user_metadata?.municipality ||
          "Bogotá, Colombia",
      },
      history: historyItems,
      ecoWorldProgress: ecoWorldRow
        ? {
            totalEcoWorldPoints: ecoWorldRow.total_ecoworld_points || 0,
            missionsCompleted: ecoWorldRow.missions_completed || 0,
            ecosystems: ecoWorldRow.ecosystem_states,
            unlockedGameBadges: ecoWorldRow.unlocked_game_badges || [],
          }
        : null,
      profile: profileData,
    });
  } catch (error) {
    console.error("[GET /api/user-data error]:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "No se pudo consultar la sesión en el servidor.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-data
 * Guarda inmediatamente un escaneo válido en public.scan_history, acredita los puntos
 * en public.user_actions y actualiza el perfil del usuario en public.profiles,
 * evitando duplicados mediante scan_fingerprint.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        savedInSupabase: false,
        reason: "supabase_not_configured",
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          savedInSupabase: false,
          reason: "unauthenticated",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, scanItem, scanId } = body as {
      action: "save_scan" | "update_scan" | "delete_scan" | "clear_history";
      scanItem?: HistoryItem;
      scanId?: string;
    };

    if (action === "delete_scan" && scanId) {
      await supabase
        .from("scan_history")
        .delete()
        .eq("id", scanId)
        .eq("user_id", user.id);

      await recalculateAndSyncProfilePoints(supabase, user.id);
      return NextResponse.json({ savedInSupabase: true });
    }

    if (action === "clear_history") {
      await supabase.from("scan_history").delete().eq("user_id", user.id);
      await recalculateAndSyncProfilePoints(supabase, user.id);
      return NextResponse.json({ savedInSupabase: true });
    }

    if ((action === "save_scan" || action === "update_scan") && scanItem) {
      const fingerprint =
        scanItem.scanFingerprint ||
        `${scanItem.wasteName}-${scanItem.conditionEvaluated || "limpio_seco"}-${scanItem.id}`;

      const containerColorDb =
        scanItem.binColor === "Verde"
          ? "verde"
          : scanItem.binColor === "Negro"
          ? "negro"
          : scanItem.binColor === "Posconsumo"
          ? "punto_posconsumo"
          : "blanco";

      const resultCategoryDb =
        scanItem.binColor === "Verde"
          ? "organico_aprovechable"
          : scanItem.binColor === "Negro"
          ? "no_aprovechable"
          : scanItem.binColor === "Posconsumo"
          ? "posconsumo_especial"
          : "aprovechable";

      // Comprobar si ya existe un escaneo con el mismo scan_fingerprint para este usuario
      const { data: existingRows } = await supabase
        .from("scan_history")
        .select("id, eco_points")
        .eq("user_id", user.id)
        .eq("scan_fingerprint", fingerprint)
        .limit(1);

      let insertedId = scanItem.id;
      let duplicatePrevented = false;

      if (existingRows && existingRows.length > 0) {
        duplicatePrevented = action === "save_scan";
        insertedId = String(existingRows[0].id);

        if (action === "update_scan") {
          await supabase
            .from("scan_history")
            .update({
              condition_state: scanItem.conditionEvaluated || "limpio_seco",
              result_category: resultCategoryDb,
              container_color: containerColorDb,
              recommendation:
                scanItem.disposalInstructions || scanItem.binDescription,
              eco_points: scanItem.ecoPoints || 15,
              analysis_payload: scanItem,
            })
            .eq("id", insertedId)
            .eq("user_id", user.id);
        }
      } else {
        // Insertar nuevo registro en scan_history
        const { data: inserted, error: insertErr } = await supabase
          .from("scan_history")
          .insert({
            user_id: user.id,
            identified_object: scanItem.wasteName,
            probable_material:
              scanItem.primaryMaterial || scanItem.category || "plastico_pet",
            condition_state: scanItem.conditionEvaluated || "limpio_seco",
            result_category: resultCategoryDb,
            container_color: containerColorDb,
            confidence_level: scanItem.confidenceScore ?? 0.92,
            recommendation:
              scanItem.disposalInstructions || scanItem.binDescription,
            municipality: scanItem.municipalityContext || "Medellín",
            scan_fingerprint: fingerprint,
            image_url: scanItem.imageUrl || null,
            eco_points: scanItem.ecoPoints || 15,
            analysis_payload: scanItem,
          })
          .select("id")
          .single();

        if (insertErr) {
          // Fallback compatible si la migración 003 aún no se ha ejecutado en un proyecto antiguo
          const { data: basicInserted } = await supabase
            .from("scan_history")
            .insert({
              user_id: user.id,
              identified_object: scanItem.wasteName,
              probable_material:
                scanItem.primaryMaterial || scanItem.category || "plastico_pet",
              condition_state: scanItem.conditionEvaluated || "limpio_seco",
              result_category: resultCategoryDb,
              container_color: containerColorDb,
              confidence_level: 0.92,
              recommendation: JSON.stringify(scanItem),
              municipality: "Medellín",
            })
            .select("id")
            .single();

          if (basicInserted?.id) {
            insertedId = String(basicInserted.id);
          }
        } else if (inserted?.id) {
          insertedId = String(inserted.id);
        }

        // Registrar también la acción acreditada en public.user_actions
        await supabase.from("user_actions").insert({
          user_id: user.id,
          action_type:
            scanItem.binColor === "Posconsumo"
              ? "entrega_posconsumo_declarada"
              : "separacion_declarada",
          verification_state: "declarada_usuario",
          description: `Escaneo y clasificación: ${scanItem.wasteName} (${scanItem.binColor})`,
          eco_points: scanItem.ecoPoints || 15,
        });
      }

      const totals = await recalculateAndSyncProfilePoints(supabase, user.id);

      return NextResponse.json({
        savedInSupabase: true,
        recordId: insertedId,
        duplicatePrevented,
        totals,
      });
    }

    return NextResponse.json(
      { savedInSupabase: false, error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[POST /api/user-data error]:", err);
    return NextResponse.json(
      {
        savedInSupabase: false,
        error: "Error al guardar en Supabase",
      },
      { status: 500 }
    );
  }
}

async function recalculateAndSyncProfilePoints(
  supabase: any,
  userId: string
) {
  const { data: scans } = await supabase
    .from("scan_history")
    .select("eco_points, recommendation")
    .eq("user_id", userId);

  const scanPoints = (scans || []).reduce(
    (sum: number, row: { eco_points?: number; recommendation?: string }) => {
      if (typeof row.eco_points === "number") return sum + row.eco_points;
      try {
        const parsed = JSON.parse(row.recommendation || "{}");
        if (typeof parsed.ecoPoints === "number") return sum + parsed.ecoPoints;
      } catch {
        // Ignore
      }
      return sum + 20;
    },
    0
  );

  const { data: ecoRow } = await supabase
    .from("ecoworld_progress")
    .select("total_ecoworld_points")
    .eq("user_id", userId)
    .single();

  const ecoWorldPoints = ecoRow?.total_ecoworld_points || 0;
  const totalPoints = scanPoints + ecoWorldPoints;
  const scannedCount = (scans || []).length;

  await supabase.from("profiles").upsert(
    {
      id: userId,
      scan_points: scanPoints,
      ecoworld_points: ecoWorldPoints,
      total_points: totalPoints,
      scanned_count: scannedCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  return {
    scanPoints,
    ecoWorldPoints,
    totalPoints,
    scannedCount,
  };
}
