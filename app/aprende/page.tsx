"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { VERIFIED_EDUCATIONAL_ARTICLES } from "@/lib/data/verified-environmental-data";

export default function LearnAndDiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  const categories = [
    { id: "todas", label: "Todos los módulos" },
    { id: "biomimetica", label: "Biomimética (Hormigas)" },
    { id: "separacion", label: "Separación y Normativa" },
    { id: "mitos", label: "Reciclable vs. Reciclado y Mitos" },
    { id: "materiales", label: "Compuestos y Contaminados" },
    { id: "economia_circular", label: "Reducción, Compostaje y Universidad" },
    { id: "posconsumo", label: "Gestión Posconsumo" },
  ];

  const articles =
    selectedCategory === "todas"
      ? VERIFIED_EDUCATIONAL_ARTICLES
      : VERIFIED_EDUCATIONAL_ARTICLES.filter(
          (a) => a.category === selectedCategory
        );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
          <BookOpen className="h-4 w-4" />
          Educación Ambiental Verificada con Fuentes Oficiales
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Aprende y Descubre
        </h1>
        <p className="max-w-3xl text-xs sm:text-sm text-slate-300">
          Guías breves, visuales y prácticas para comprender qué sucede después
          de entregar un material, cómo distinguir entre potencialmente
          reciclable y efectivamente reciclado, y cómo aplicar la economía
          circular en casa y en la universidad.
        </p>
      </div>

      {/* Filtros por categoría temática */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-[#0E1227] shadow-glow"
                : "border border-white/10 bg-[#131832] text-slate-300 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Artículos educativos */}
      <div className="space-y-6">
        {articles.map((article) => (
          <article
            key={article.id}
            id={article.slug}
            className="rounded-2xl border border-white/10 bg-[#131832] p-6 sm:p-8 space-y-5 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#22C55E]/15 px-3 py-1 text-xs font-bold uppercase text-[#22C55E]">
                  {article.category.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-400">
                  Lectura de {article.readingTimeMin} min
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Revisión editorial: {article.reviewedAt} • Estado:{" "}
                <strong className="text-[#2DD4BF]">
                  {article.validationStatus.toUpperCase()}
                </strong>
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {article.title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-300">{article.summary}</p>
            </div>

            {/* Ideas clave */}
            <div className="rounded-xl border border-white/10 bg-[#0E1227] p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
                Puntos clave para recordar
              </h3>
              <ul className="space-y-1.5">
                {article.keyTakeaways.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Secciones de contenido */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {article.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/5 bg-[#0E1227]/60 p-4 space-y-2"
                >
                  <h4 className="text-sm font-bold text-white">
                    {sec.heading}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {article.biomimicryInsight && (
              <div className="rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-[#2DD4BF] mt-0.5" />
                <p className="text-xs text-teal-100">
                  <strong>Enfoque Biomimético:</strong>{" "}
                  {article.biomimicryInsight}
                </p>
              </div>
            )}

            {/* Fuente */}
            {article.source && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-[#22C55E]" />
                  <span>
                    Fuente de respaldo: {article.source.entityName} (
                    {article.source.resourceTitle})
                  </span>
                </span>
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#2DD4BF] hover:underline"
                >
                  <span>Consultar referencia oficial</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
