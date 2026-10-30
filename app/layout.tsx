import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EcoScanProvider } from "@/components/providers/ecoscan-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoScan Colombia | Reciclaje Inteligente y Economía Circular",
  description:
    "Asistente inteligente para la identificación, evaluación por estado de limpieza, clasificación normativa (Resolución 2184 de 2019), economía circular y gestión posconsumo de residuos en Colombia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        <EcoScanProvider>{children}</EcoScanProvider>
      </body>
    </html>
  );
}
