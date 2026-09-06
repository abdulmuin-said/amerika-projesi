/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link';
import { useLocalization } from '@/lib/useLocalization';

const PROMO_IMAGES = [
    "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/gold01.webp",
    "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon01.webp",
    "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon01.webp",
    "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp",
] as const;

export default function PromoBannerCard() {
    const { t } = useLocalization();

    return (
        <div className="responsive-container w-full py-10 sm:py-14 md:py-16">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">

                {/* Text side */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-2/5 shrink-0">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c]">
                        {t("home.promoBanner.badge")}
                    </p>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
                        {t("home.promoBanner.title")}
                    </h2>
                    <p className="mt-4 mb-8 text-sm text-muted-foreground max-w-sm leading-relaxed">
                        {t("home.promoBanner.description")}
                    </p>
                    <Link
                        href="/products"
                        className="inline-block border border-foreground/30 px-10 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                    >
                        {t("home.promoBanner.cta")}
                    </Link>
                </div>

                {/* Images side */}
                <div className="w-full md:flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                    <img
                        src={PROMO_IMAGES[0]}
                        alt="NovaLux Fine Art 1"
                        className="w-full aspect-[3/4] object-cover shadow-md"
                    />
                    <img
                        src={PROMO_IMAGES[1]}
                        alt="NovaLux Fine Art 2"
                        className="w-full aspect-[3/4] object-cover mt-6 sm:mt-10 shadow-md"
                    />
                    <img
                        src={PROMO_IMAGES[2]}
                        alt="NovaLux Fine Art 3"
                        className="w-full aspect-[3/4] object-cover -mt-6 sm:-mt-10 shadow-md"
                    />
                    <img
                        src={PROMO_IMAGES[3]}
                        alt="NovaLux Fine Art 4"
                        className="w-full aspect-[3/4] object-cover shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}
