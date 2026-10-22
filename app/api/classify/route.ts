import { NextRequest, NextResponse } from "next/server";
import { RuleEvaluationInputSchema } from "@/lib/validations/schemas";
import { evaluateWasteClassification } from "@/services/classification-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RuleEvaluationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos de entrada inválidos para el motor de clasificación.",
        },
        { status: 400 }
      );
    }

    const evaluation = evaluateWasteClassification(parsed.data);

    return NextResponse.json({
      classification: evaluation,
    });
  } catch (err) {
    console.error("[API /api/classify Error]:", err);
    return NextResponse.json(
      {
        error: "Error interno al evaluar las reglas de clasificación ambiental.",
      },
      { status: 500 }
    );
  }
}
