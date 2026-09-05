/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useAppSelector } from "@/store/hooks";
import { categoriesUnionSelector } from "@/store/selectors";
import React, { useEffect, useState } from "react";
import * as productServices from "@/services/product";
import * as shippingServices from "@/services/shippingMethod";
import { getCategoryById } from "@/services/category";
import useDataFetch from "@/hooks/use-data-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import ProductForm from "../components/ProductForm";
import { ProductDetails } from "@/types/domains/product";

export default function AddProductPage() {
    const router = useRouter();
    const createProduct = useDataFetch(productServices.createProduct);
    const getCategoryDetails = useDataFetch(getCategoryById);
    const getShippingMethods = useDataFetch(shippingServices.getAllShippingMethods);
    const { categories, variations, attributes, loading } = useAppSelector(categoriesUnionSelector);
    const [copiedProduct, setCopiedProduct] = useState<ProductDetails | undefined>();

    useEffect(() => {
        getShippingMethods.request();
        // Read copied product from localStorage
        const readClipboard = () => {
            const raw = localStorage.getItem("copiedProduct");
            if (!raw) {
                setCopiedProduct(undefined);
                return;
            }
            try {
                setCopiedProduct(JSON.parse(raw) as ProductDetails);
            } catch {
                setCopiedProduct(undefined);
            }
        };

        readClipboard();

        // Keep clipboard usable across navigation; also refresh when tab regains focus.
        window.addEventListener("focus", readClipboard);
        window.addEventListener("storage", readClipboard);
        return () => {
            window.removeEventListener("focus", readClipboard);
            window.removeEventListener("storage", readClipboard);
        };
    }, []);

    return <div className="h-full space-y-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <div className="flex-1 py-2">
            <Card>
                <CardContent>
                    <ProductForm
                        categories={categories}
                        variations={variations}
                        attributes={attributes}
                        shippingMethods={getShippingMethods.data || []}
                        loading={createProduct.isLoading}
                        categoriesLoading={loading || getCategoryDetails.isLoading}
                        shippingMethodsLoading={getShippingMethods.isLoading}
                        fetchCategoryDetails={getCategoryDetails.request}
                        copiedProduct={copiedProduct}
                        onSubmit={data => {
                            createProduct.request({
                                ...data,
                                title: data.title ?? "",
                                code: data.code ?? "",
                                description: data.description ?? "",
                                starred: data.starred ?? false,
                                status: data.status !== false,
                                categoryId: data.categoryId ?? 0,
                                shippingMethodId: data.shippingMethodId ?? 0,
                                images: data.images ?? [],
                                variants: data.variants ?? [],
                                attributes: (data.attributes ?? []).filter(attr => attr.value)
                            }).onSuccess(() => {
                                router.replace("/admin/products");
                            });
                        }} />
                </CardContent>
            </Card>
        </div>
    </div>
};
