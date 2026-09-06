"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CategoryTree } from "@/types/domains/category";
import { useLocalization } from "@/lib/useLocalization";
import { LUXURY_PILLARS, buildPillarCategoryTree } from "@/lib/categories";

type ShopByCategorySectionProps = {
  categories: CategoryTree[] | undefined;
  isLoading: boolean;
  onSelectCategory: (categoryId: number) => void;
};

export default function ShopByCategorySection({
  categories,
  onSelectCategory,
}: ShopByCategorySectionProps) {
  const { locale, t } = useLocalization();
  const pillarCategories = buildPillarCategoryTree(categories, locale);

  return (
    <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-stone-100/80 via-stone-50 to-background">
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl md:h-96 md:w-96"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-stone-300/25 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 responsive-container">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-3 inline-block font-semibold text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#c9a84c]">
            {t("home.shopByCategory.badge")}
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {t("home.shopByCategory.title")}
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3 md:mt-6">
            <span className="h-px w-10 bg-stone-300 sm:w-12" aria-hidden />
            <div className="h-1 w-20 rounded-full bg-[#c9a84c] sm:w-24" />
            <span className="h-px w-10 bg-stone-300 sm:w-12" aria-hidden />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-stone-600 sm:text-base md:mt-7">
            {t("home.shopByCategory.description")}
          </p>
        </div>

        {/* 3 Main Luxury Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 sm:gap-8 lg:gap-10">
          {pillarCategories.map((pillar, index) => {
            const luxuryMeta = LUXURY_PILLARS[index] || LUXURY_PILLARS[0];
            const tagline = locale === "tr" ? luxuryMeta.taglineTr : luxuryMeta.taglineEn;
            const subline = locale === "tr" ? luxuryMeta.sublineTr : luxuryMeta.sublineEn;
            const indexLabel = String(index + 1).padStart(2, "0");

            return (
              <div
                key={pillar.categoryId}
                className="group relative flex flex-col bg-white border border-stone-200/80 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Image Container with Luxury Overlay */}
                <div
                  onClick={() => onSelectCategory(pillar.categoryId)}
                  className="relative h-[340px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden cursor-pointer bg-stone-900"
                >
                  <Image
                    src={pillar.imageUrl || luxuryMeta.imageUrl}
                    alt={pillar.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Index badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[11px] font-mono tracking-widest text-[#c9a84c] border border-white/10 uppercase">
                      Pillar {indexLabel}
                    </span>
                  </div>

                  {/* Arrow action button */}
                  <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#c9a84c] group-hover:text-black transition-colors duration-300">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Text on image */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                    <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-semibold text-[#c9a84c] block mb-1">
                      {subline}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-wide leading-tight">
                      {pillar.name}
                    </h3>
                  </div>
                </div>

                {/* Content description & subcategory tags */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
                      {tagline}
                    </p>

                    {/* Subcategories pill tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {pillar.subcategories.map((sub) => (
                        <Link
                          key={sub.categoryId}
                          href={`/products?categoryId=${sub.categoryId}`}
                          className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-[#c9a84c]/15 hover:text-stone-900 border border-stone-200/70 text-stone-700 transition-colors font-medium"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => onSelectCategory(pillar.categoryId)}
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-[#c9a84c] text-white hover:text-stone-950 text-xs font-semibold tracking-[0.2em] uppercase transition-colors duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    <span>{t("home.shopByCategory.exploreCollection")}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
