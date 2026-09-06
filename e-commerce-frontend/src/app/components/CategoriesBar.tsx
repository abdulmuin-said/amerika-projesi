"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";
import { CategoryTree } from "@/types/domains/category";
import { CATEGORY_BAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/lib/useLocalization";
import { buildPillarCategoryTree, LUXURY_PILLARS } from "@/lib/categories";

function CircleImage({ src, alt, size }: { src: string; alt: string; size: number }) {
    const [errored, setErrored] = useState(false);
    if (errored) {
        return (
            <div
                className="shrink-0 rounded-full bg-[oklch(0.88_0.022_75)] border border-border/40 flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                <span className="w-2 h-2 rounded-full bg-[#c9a84c]/60" />
            </div>
        );
    }
    return (
        <div className="relative shrink-0 rounded-full overflow-hidden border border-border/40 shadow-sm" style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                sizes={`${size}px`}
                className="object-cover"
                onError={() => setErrored(true)}
            />
        </div>
    );
}

const linkClass = "text-[0.95rem] md:text-base font-medium text-foreground/85 hover:text-foreground transition-colors whitespace-nowrap";

function PillarDropdownItem({
    pillar,
    subcategories,
    pillarIndex
}: {
    pillar: CategoryTree;
    subcategories: CategoryTree[];
    pillarIndex: number;
}) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const { locale, t } = useLocalization();

    const luxuryMeta = LUXURY_PILLARS[pillarIndex] || LUXURY_PILLARS[0];
    const tagline = locale === "tr" ? luxuryMeta.taglineTr : luxuryMeta.taglineEn;
    const subline = locale === "tr" ? luxuryMeta.sublineTr : luxuryMeta.sublineEn;

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 140);
    };

    const cols = subcategories.length > 4 ? 3 : subcategories.length > 2 ? 2 : 1;

    return (
        <div
            ref={triggerRef}
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className={cn(linkClass, "flex items-center gap-2 outline-none h-full py-3 group cursor-pointer")}>
                {pillar.imageUrl && (
                    <CircleImage src={pillar.imageUrl} alt={pillar.name} size={32} />
                )}
                <span className="group-hover:text-[#c9a84c] transition-colors font-semibold tracking-wide">
                    {pillar.name}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-transform duration-200", open && "rotate-180 text-[#c9a84c]")} />
            </button>

            {open && (
                <div
                    className={cn(
                        "absolute top-full z-50 bg-white border-t-2 border-[#c9a84c] shadow-2xl rounded-b-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150",
                        pillarIndex === 2 ? "right-0" : "left-0"
                    )}
                    style={{
                        minWidth: cols === 3 ? "680px" : cols === 2 ? "480px" : "320px",
                    }}
                >
                    {/* Header */}
                    <div className="px-7 pt-5 pb-3 border-b border-border/40 bg-[oklch(0.98_0.01_75)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c9a84c]">
                                    {subline}
                                </p>
                                <h3 className="font-display text-xl font-bold text-stone-900 mt-0.5">
                                    {pillar.name}
                                </h3>
                            </div>
                            <span className="text-xs text-stone-500 font-medium">
                                {subcategories.length} {locale === "tr" ? "koleksiyon" : "collections"}
                            </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 max-w-md leading-relaxed">
                            {tagline}
                        </p>
                    </div>

                    {/* Subcategories grid */}
                    <div className={cn(
                        "grid px-7 py-5 gap-y-3 gap-x-6",
                        cols === 3 && "grid-cols-3",
                        cols === 2 && "grid-cols-2",
                        cols === 1 && "grid-cols-1"
                    )}>
                        {subcategories.map((sub) => (
                            <Link
                                key={sub.categoryId}
                                href={`/products?categoryId=${sub.categoryId}`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 text-[0.92rem] text-stone-800 hover:text-stone-950 transition-all group/sub border border-transparent hover:border-border/50"
                            >
                                {sub.imageUrl ? (
                                    <div className="group-hover/sub:ring-2 group-hover/sub:ring-[#c9a84c] rounded-full transition-all shrink-0">
                                        <CircleImage src={sub.imageUrl} alt={sub.name} size={42} />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-border/40 group-hover/sub:border-[#c9a84c] flex items-center justify-center shrink-0">
                                        <span className="w-2 h-2 rounded-full bg-[#c9a84c] opacity-70" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <span className="font-medium block truncate group-hover/sub:text-[#c9a84c] transition-colors">
                                        {sub.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Shop All footer */}
                    <div className="px-7 py-3.5 bg-[oklch(0.97_0.012_75)] border-t border-border/30 flex items-center justify-between">
                        <Link
                            href={`/products?categoryId=${pillar.categoryId}`}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] uppercase text-[#c9a84c] hover:text-[#b8960c] transition-colors"
                        >
                            <span>{t("header.shopAll", { name: pillar.name })}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CategoriesBar({ categories }: { categories: CategoryTree[] }) {
    const { locale, t } = useLocalization();
    const pillarCategories = buildPillarCategoryTree(categories, locale);

    const pinnedLinks = [
        { label: t("header.newArrivals"), href: "/products?sort=NEWEST" },
        { label: t("header.bestsellers"), href: "/products?sort=MOST_REVIEWED" },
    ];

    return (
        <div
            className="w-full bg-[oklch(0.97_0.012_75)] border-b border-border/60 shadow-sm relative z-40"
            style={{ height: CATEGORY_BAR_HEIGHT }}
        >
            {/* Mobile horizontal category scroll */}
            <div className="sm:hidden h-full flex items-center gap-5 px-4 overflow-x-auto scrollbar-none">
                {pinnedLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold text-primary whitespace-nowrap shrink-0"
                    >
                        {link.label}
                    </Link>
                ))}
                <span className="h-3 w-px bg-border/60 shrink-0" />
                {pillarCategories.map((pillar) => (
                    <Link
                        key={pillar.categoryId}
                        href={`/products?categoryId=${pillar.categoryId}`}
                        className="text-xs font-semibold text-foreground/80 hover:text-foreground whitespace-nowrap shrink-0 transition-colors"
                    >
                        {pillar.name}
                    </Link>
                ))}
            </div>

            {/* Desktop: 3 Pillars + Pinned links */}
            <div className="hidden sm:flex h-full items-center justify-center gap-10 max-w-6xl mx-auto w-full px-6 md:px-10">
                {pinnedLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-[0.95rem] md:text-base font-semibold text-primary hover:text-primary/70 transition-colors whitespace-nowrap shrink-0"
                    >
                        {link.label}
                    </Link>
                ))}

                <span className="h-4 w-px bg-border/80 shrink-0" />

                {/* The 3 Main Luxury Pillars */}
                {pillarCategories.map((pillar, idx) => (
                    <div key={pillar.categoryId} className="shrink-0 h-full flex items-center">
                        <PillarDropdownItem
                            pillar={pillar}
                            subcategories={pillar.subcategories}
                            pillarIndex={idx}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
