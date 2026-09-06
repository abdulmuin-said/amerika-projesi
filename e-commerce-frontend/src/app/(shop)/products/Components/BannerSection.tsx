"use client";
import { useLocalization } from "@/lib/useLocalization";
import { LUXURY_PILLARS } from "@/lib/categories";

interface BannerSectionProps {
  selectedCategoryId?: number | null;
}

export default function BannerSection({ selectedCategoryId }: BannerSectionProps) {
  const { t, locale } = useLocalization();

  let badge = "NovaLux Studios";
  let title = t("catalog.title");
  let subtitle = t("catalog.subtitle");

  if (selectedCategoryId) {
    // Check if matching pillar
    const pillar = LUXURY_PILLARS.find((p) => p.id === selectedCategoryId);
    if (pillar) {
      badge = locale === "tr" ? pillar.sublineTr : pillar.sublineEn;
      title = locale === "tr" ? pillar.nameTr : pillar.nameEn;
      subtitle = locale === "tr" ? pillar.taglineTr : pillar.taglineEn;
    } else {
      // Check subcategories
      for (const p of LUXURY_PILLARS) {
        const sub = p.subcategories.find((s) => s.id === selectedCategoryId);
        if (sub) {
          badge = locale === "tr" ? p.nameTr : p.nameEn;
          title = locale === "tr" ? sub.nameTr : sub.nameEn;
          subtitle = (locale === "tr" ? sub.descriptionTr : sub.descriptionEn) || (locale === "tr" ? p.taglineTr : p.taglineEn);
          break;
        }
      }
    }
  }

  return (
    <section className="bg-[oklch(0.92_0.022_75)] border-b border-border/60">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-3">
          {badge}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-foreground tracking-wide mb-3">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

