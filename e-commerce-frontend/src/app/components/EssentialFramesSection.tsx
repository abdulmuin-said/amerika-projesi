"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { getPromotionForProduct } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import type { ProductPreview } from "@/types/domains/product";
import { useLocalization } from "@/lib/useLocalization";

type EssentialFramesSectionProps = {
    products: ProductPreview[];
    isLoading?: boolean;
};

export default function EssentialFramesSection({ products, isLoading = false }: EssentialFramesSectionProps) {
    const promotions = useAppSelector((state) => state.promotions.items);
    const displayProducts = products.slice(0, 4);
    const { t } = useLocalization();

    return (
        <section className="w-full py-14 sm:py-16 lg:py-20">
            {/* Heading */}
            <div className="mb-10 text-center sm:mb-12">
                <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a84c]">
                    {t("home.essentialFrames.badge")}
                </p>
                <h2 className="font-display inline-block border-b-2 border-foreground pb-2 text-3xl tracking-tight text-foreground sm:text-4xl font-bold">
                    {t("home.essentialFrames.title")}
                </h2>
                <p className="mt-4 mx-auto max-w-md text-sm text-muted-foreground">
                    {t("home.essentialFrames.subtitle")}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}

                {!isLoading &&
                    displayProducts.length > 0 &&
                    displayProducts.map((product) => {
                        const promo = getPromotionForProduct(product, promotions);
                        return (
                            <ProductCard key={product.productId} product={product} promo={promo} />
                        );
                    })}

                {!isLoading && displayProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-muted/30 px-6 py-14 text-center">
                        <p className="text-sm font-medium text-foreground">{t("catalog.noProductsFound")}</p>
                        <Link
                            href="/products"
                            className="text-sm font-semibold tracking-widest text-[#c9a84c] uppercase hover:text-[#b8960c] transition-colors"
                        >
                            {t("home.essentialFrames.viewAll")}
                        </Link>
                    </div>
                )}
            </div>

            {/* View All button */}
            <div className="mt-12 text-center">
                <Link
                    href="/products?sort=MOST_REVIEWED"
                    className="inline-block border border-foreground/30 px-8 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                    {t("home.essentialFrames.viewAll")}
                </Link>
            </div>
        </section>
    );
}
