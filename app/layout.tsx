import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EcoScanProvider } from "@/components/providers/ecoscan-provider";
import { NavigationShell } from "@/components/layout/navigation-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoScan Colombia | Escanea hoy, transforma el mañana",
  description:
    "Asistente inteligente para la identificación, preparación, clasificación normativa (Resolución 2184 de 2019), economía circular y gestión posconsumo de residuos en Colombia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0E1227] font-sans antialiased selection:bg-[#22C55E]/30 selection:text-white">
        <EcoScanProvider>
          <NavigationShell>{children}</NavigationShell>
        </EcoScanProvider>
      </body>
    </html>
  );
}
