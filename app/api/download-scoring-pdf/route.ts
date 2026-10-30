import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const pdfPath = path.join(
      process.cwd(),
      "public",
      "Sistema_Puntuacion_EcoScan_IA.pdf"
    );
    if (fs.existsSync(pdfPath)) {
      const buffer = fs.readFileSync(pdfPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="Sistema_Puntuacion_EcoScan_IA.pdf"',
        },
      });
    }
    return NextResponse.json(
      { error: "El documento PDF no se encontró en el servidor." },
      { status: 404 }
    );
  } catch (err) {
    console.error("[download-scoring-pdf error]:", err);
    return NextResponse.json(
      { error: "Error al descargar el documento PDF." },
      { status: 500 }
    );
  }
}
