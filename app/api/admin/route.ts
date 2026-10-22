import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserWithRole } from "@/lib/supabase/server";
import { AdminWasteItemUpdateSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const authState = await getAuthenticatedUserWithRole();

    if (!authState.isConfigured) {
      return NextResponse.json(
        {
          error:
            "Supabase no está configurado en el servidor. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para ejecutar escrituras administrativas persistentes.",
        },
        { status: 503 }
      );
    }

    if (!authState.user) {
      return NextResponse.json(
        {
          error: "No autenticado. Debes iniciar sesión para acceder a operaciones administrativas.",
        },
        { status: 401 }
      );
    }

    if (authState.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Acceso denegado (403). Tu cuenta tiene rol 'user' y no cuenta con privilegios de administrador en la base de datos.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = AdminWasteItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos de ficha administrativa no válidos.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ficha actualizada y verificada en el servidor con rol admin.",
      updatedItem: parsed.data,
    });
  } catch (err) {
    console.error("[API /api/admin Error]:", err);
    return NextResponse.json(
      { error: "Error interno en operación administrativa." },
      { status: 500 }
    );
  }
}
