"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useRouter } from "next/navigation";
import { ProductPreview, ProductQueryOptions, SortOption } from "@/types/domains/product";
import * as productServices from "@/services/product";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface FeatureProductsProps {
    products?: ProductPreview[];
}

// Map tab to SortOption
const getSortOptionForTab = (tab: string): SortOption => {
    switch (tab) {
        case "new":
            return SortOption.NEWEST;
        case "bestsellers":
            return SortOption.POPULAR;
        case "discounted":
            return SortOption.POPULAR;
        default:
            return SortOption.POPULAR;
    }
};

export const FeatureProducts = ({ products: productsProp = [] }: FeatureProductsProps) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("new");
    const productsData = useDataFetch(productServices.getAllProducts);
    const promotions = useAppSelector((state) => state.promotions.items);

    // Fetch products when tab changes
    useEffect(() => {
        const filters: ProductQueryOptions = {
            sortOption: getSortOptionForTab(activeTab),
            status: true,
        };
        productsData.request(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Use products from API (already sorted on server) or fallback to prop
    // Extra safety: if backend doesn't filter by status yet, hide inactive products in UI.
    const filteredProducts = (productsData.data || productsProp || [])
        .filter((p) => p.status !== false)
        .slice(0, 8);

    const visibleProducts = useMemo(() => {
        if (activeTab !== "discounted") return filteredProducts;
        return filteredProducts.filter((p) => {
            const promo = getPromotionForProduct(p, promotions);
            if (!promo) return false;
            if (promo.promotionType === "PERCENTAGE") return promo.discountValue > 0;
            return promo.discountValue > 0;
        });
    }, [activeTab, filteredProducts, promotions]);

    const gridClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="mb-6">
                    <TabsList className="w-full bg-muted/50 rounded-full p-1 flex items-center justify-start gap-1 overflow-x-auto thin-scrollbar sm:grid sm:max-w-md sm:mx-auto sm:grid-cols-3 sm:overflow-x-visible">
                        <TabsTrigger
                            value="new"
                            className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-[oklch(0.16_0.02_55)] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm px-3 sm:px-5"
                        >
                            NEW
                        </TabsTrigger>
                        <TabsTrigger
                            value="bestsellers"
                            className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-[oklch(0.16_0.02_55)] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm px-3 sm:px-5"
                        >
                            BEST SELLERS
                        </TabsTrigger>
                        <TabsTrigger
                            value="discounted"
                            className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-[oklch(0.16_0.02_55)] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm px-3 sm:px-5"
                        >
                            DISCOUNTED
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="new" className="mt-0">
                    <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
                        {
                            productsData.isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))
                            ) : visibleProducts.length > 0 ? (
                                visibleProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-10">
                        <button
                            onClick={() => router.push('/products')}
                            className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                        >
                            All Products
                        </button>
                    </div>
                </TabsContent>

                <TabsContent value="bestsellers" className="mt-0">
                    <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
                        {
                            productsData.isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))
                            ) : visibleProducts.length > 0 ? (
                                visibleProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-10">
                        <button
                            onClick={() => router.push('/products')}
                            className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                        >
                            All Products
                        </button>
                    </div>
                </TabsContent>

                <TabsContent value="discounted" className="mt-0">
                    <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
                        {
                            productsData.isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))
                            ) : visibleProducts.length > 0 ? (
                                visibleProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-10">
                        <button
                            onClick={() => router.push('/products')}
                            className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                        >
                            All Products
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
