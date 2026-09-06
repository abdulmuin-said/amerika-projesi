"use client";
import { useLocalization } from "@/lib/useLocalization";

export default function BannerSection() {
  const { t } = useLocalization();

  return (
    <section className="bg-[oklch(0.92_0.022_75)] border-b border-border/60">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-3">
          NovaLux Studios
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-foreground tracking-wide mb-3">
          {t("catalog.title")}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {t("catalog.subtitle")}
        </p>
      </div>
    </section>
  );
}
