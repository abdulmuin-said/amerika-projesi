"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { getPromotionForProduct } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import type { ProductPreview } from "@/types/domains/product";

type EssentialFramesSectionProps = {
    products: ProductPreview[];
    isLoading?: boolean;
};

export default function EssentialFramesSection({ products, isLoading = false }: EssentialFramesSectionProps) {
    const promotions = useAppSelector((state) => state.promotions.items);
    const displayProducts = products.slice(0, 4);

    return (
        <section className="w-full py-14 sm:py-16 lg:py-20">
            {/* Heading */}
            <div className="mb-10 text-center sm:mb-12">
                <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a84c]">
                    Customer Favourites
                </p>
                <h2 className="font-display inline-block border-b-2 border-foreground pb-2 text-3xl tracking-tight text-foreground sm:text-4xl">
                    Best Seller Frames
                </h2>
                <p className="mt-4 mx-auto max-w-sm text-sm text-muted-foreground">
                    Top-rated picks curated from real stars and reviews.
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
                        <p className="text-sm font-medium text-foreground">No best sellers to show yet</p>
                        <Link
                            href="/products"
                            className="text-sm font-semibold tracking-widest text-[#c9a84c] uppercase hover:text-[#b8960c] transition-colors"
                        >
                            Browse all products →
                        </Link>
                    </div>
                )}
            </div>

            {/* CTA */}
            {!isLoading && displayProducts.length > 0 && (
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/products?sort=MOST_REVIEWED"
                        className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                    >
                        View All Bestsellers
                    </Link>
                </div>
            )}
        </section>
    );
}
