/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useMemo, useEffect } from 'react';
import ProductCard from '@/app/components/ProductCard';
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import { ProductPreview, ProductQueryOptions, SortOption } from "@/types/domains/product";
import * as productServices from "@/services/product";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface BestSellerProps {
    products?: ProductPreview[];
    selectedCategoryId: number | null;
}

const BestSeller = ({ products: productsProp = [], selectedCategoryId }: BestSellerProps) => {
    const productsData = useDataFetch(productServices.getAllProducts);
    const promotions = useAppSelector((state) => state.promotions.items);

    useEffect(() => {
        const filters: ProductQueryOptions = { sortOption: SortOption.POPULAR, status: true };
        if (selectedCategoryId !== null) filters.categoryId = selectedCategoryId;
        productsData.request(filters);
    }, [selectedCategoryId]);

    const products = (productsData.data || productsProp || []).filter((p) => p.status !== false);

    const bestSellerProducts = useMemo(() => {
        if (!products?.length) return [];
        return products.slice(0, 5);
    }, [products]);

    return (
        <section className="border-t border-border py-14">
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10">

                <div className="mb-8">
                    <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-2">
                        Top Picks
                    </p>
                    <h2 className="font-display text-3xl font-medium text-foreground">
                        {selectedCategoryId !== null ? "Category Best Sellers" : "Best Sellers"}
                    </h2>
                </div>

                {productsData.isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
                        {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : bestSellerProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
                        {bestSellerProducts.map((product) => {
                            const promo = getPromotionForProduct(product, promotions);
                            return <ProductCard key={product.productId} product={product} promo={promo} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p className="font-display text-2xl font-light">No featured works yet</p>
                    </div>
                )}

            </div>
        </section>
    );
};

export default BestSeller;
