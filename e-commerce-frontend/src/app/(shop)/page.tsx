/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EssentialFramesSection from '../components/EssentialFramesSection';
import FramesManifestoSection from '../components/FramesManifestoSection';
import JoinTheCollectiveSection from '../components/JoinTheCollectiveSection';
import Banner from '../components/Banner';
import ValuePropositionBar from '../components/ValuePropositionBar';
import ShopByCategorySection from '../components/ShopByCategorySection';
import PromoBannerCard from '../components/PromoBannerCard';
import { FeatureProducts } from '../components/FeatureProducts';
import useDataFetch from '@/hooks/use-data-fetch';
import * as categoryServices from "@/services/category";
import * as productServices from "@/services/product";

export default function LandingPage() {
    const router = useRouter();
    // const { items: categories } = useAppSelector(state => state.categories);
    // const { items: promotions } = useAppSelector(state => state.promotions);
    const allProductsData = useDataFetch(productServices.getAllProducts);
    const allCategories = useDataFetch(categoryServices.getAllCategories);

    useEffect(() => {
        // useAppDispatch(fetchCategories());
        // useAppDispatch(fetchPromotions());
        allProductsData.request({ status: true });
        allCategories.request();
    }, []);

    // const products = productsData.response;
    const categoriesData = allCategories.data;
    const productsData = (allProductsData.data || []).filter((p) => p.status !== false);
    const bestSellerFrames = useMemo(
        () =>
            [...productsData]
                .sort((a, b) => {
                    const star = Number(b.starred) - Number(a.starred);
                    if (star !== 0) return star;
                    return b.rating - a.rating;
                })
                .slice(0, 4),
        [productsData]
    );
    return (
        <div className="lg:pt-[4rem]">
            <section>
                <Banner />
            </section>
            <ValuePropositionBar />
            <ShopByCategorySection
                categories={categoriesData}
                isLoading={allCategories.isLoading}
                onSelectCategory={(categoryId) =>
                    router.push(`/products?categoryId=${categoryId}`)
                }
            />
            <div className='responsive-container'>
                <section>
                    <EssentialFramesSection
                        products={bestSellerFrames}
                        isLoading={allProductsData.isLoading}
                    />

                    <div className="mt-14 sm:mt-16 lg:mt-20">
                        <div className="mb-10 text-center sm:mb-12">
                            <h2 className="font-display inline-block border-b-2 border-foreground pb-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Featured products
                            </h2>
                        </div>
                        <FeatureProducts products={productsData} />
                    </div>
                </section>
            </div>
            <div className='bg-[#F1F3E7] my-10 sm:my-16'>
                <PromoBannerCard />
            </div>
            <FramesManifestoSection />
            <JoinTheCollectiveSection />
        </div>
    );
}