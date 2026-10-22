import { NextRequest, NextResponse } from "next/server";
import { FeedbackReportInputSchema } from "@/lib/validations/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FeedbackReportInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Por favor completa los datos del reporte correctamente.",
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("feedback_reports").insert({
        user_id: user?.id ?? null,
        waste_item_id: parsed.data.wasteItemId ?? null,
        collection_point_id: parsed.data.collectionPointId ?? null,
        report_type: parsed.data.reportType,
        content: parsed.data.content,
        municipality: parsed.data.municipality,
        status: "pendiente",
      });

      if (error) {
        console.warn("[Supabase feedback_reports warning]:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Reporte recibido para revisión ambiental. Nuestro equipo contrastará la observación con las fuentes oficiales.",
      report: {
        id: `rep-${Date.now()}`,
        ...parsed.data,
        status: "pendiente",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[API /api/feedback Error]:", err);
    return NextResponse.json(
      { error: "No se pudo registrar el reporte en este momento." },
      { status: 500 }
    );
  }
}
