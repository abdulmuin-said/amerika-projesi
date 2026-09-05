/* eslint-disable react-hooks/exhaustive-deps */

"use client"

import React, { useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CategoryDetails } from "@/types/domains/category";
import { Variation } from "@/types/domains/variation";
import { ProductPreview } from "@/types/domains/product";
import { Button } from "@/components/ui/button";
import ProductCard from "../../components/ProductCard";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface ProductBrowsePageProps {
    categoryDetails: CategoryDetails
    variations: Variation[]
    allProducts: ProductPreview[]
}

export function ProductBrowsePage({
    categoryDetails,
    variations,
    allProducts,
}: ProductBrowsePageProps) {
    const [filteredProducts, setFilteredProducts] = useState<ProductPreview[]>([])
    const [visibleCount, setVisibleCount] = useState(12)
    const [sortBy, setSortBy] = useState("newest")
    const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({})
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const promotions = useAppSelector((state) => state.promotions.items)

    // Filtering
    useEffect(() => {
        let result = [...allProducts]

        for (const key in selectedFilters) {
            const values = selectedFilters[key]
            if (values.length) {
                result = result.filter((product) =>
                    values.includes(product[`${key}` as keyof ProductPreview] as unknown as string)
                )
            }
        }

        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.price - b.price)
                break
            case "price-high":
                result.sort((a, b) => b.price - a.price)
                break
            case "rating":
                result.sort((a, b) => b.rating - a.rating)
                break
            case "newest":
            default:
                result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                break
        }

        setFilteredProducts(result.slice(0, visibleCount))
    }, [selectedFilters, sortBy, allProducts, visibleCount])

    const toggleFilter = (group: string, value: string) => {
        setSelectedFilters((prev) => {
            const current = prev[group] || []
            return {
                ...prev,
                [group]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            }
        })
    }

    const clearFilters = () => setSelectedFilters({})

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount((prev) => prev + 12)
            }
        })

        if (loadMoreRef.current) observer.observe(loadMoreRef.current)

        return () => {
            if (loadMoreRef.current) observer.disconnect()
        }
    }, [])

    return (
        <div className="flex flex-col lg:flex-row gap-6 px-4 py-8 max-w-7xl mx-auto">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex flex-col border rounded-md shadow-sm bg-white sticky top-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear
                    </Button>
                </div>

                <div className="p-4 space-y-6 flex-1">
                    {/* Variations */}
                    {categoryDetails.variations.map((variation) => {
                        const variationOptions =
                            variations.find((v) => v.variationId === variation.variationId)
                                ?.variationOptions || []

                        return (
                            <div key={variation.variationId}>
                                <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                                    {variation.name}
                                </h3>
                                <div className="space-y-2">
                                    {variationOptions.map((opt) => {
                                        const checkboxId = `checkbox-${variation.variationId}-${opt.variationOptionId}`
                                        return (
                                            <div key={opt.variationOptionId} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={checkboxId}
                                                    checked={
                                                        selectedFilters[variation.name]?.includes(opt.name) ||
                                                        false
                                                    }
                                                    onCheckedChange={() =>
                                                        toggleFilter(variation.name, opt.name)
                                                    }
                                                />
                                                <label
                                                    htmlFor={checkboxId}
                                                    className="text-sm leading-none cursor-pointer"
                                                >
                                                    {opt.name}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    {/* Attributes */}
                    {categoryDetails.attributes.map((attr) => (
                        <div key={attr.attributeId}>
                            <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                                {attr.name}
                            </h3>
                            {attr.type === "CUSTOM" ? (
                                <input
                                    type="text"
                                    placeholder={`Enter ${attr.name.toLowerCase()}`}
                                    value={selectedFilters[attr.name]?.[0] || ""}
                                    onChange={(e) =>
                                        setSelectedFilters((prev) => ({
                                            ...prev,
                                            [attr.name]: e.target.value ? [e.target.value] : [],
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {attr.allowedValues.map((val) => {
                                        const checkboxId = `checkbox-${attr.attributeId}-${val}`
                                        return (
                                            <div key={val} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={checkboxId}
                                                    checked={
                                                        selectedFilters[attr.name]?.includes(val) || false
                                                    }
                                                    onCheckedChange={() => toggleFilter(attr.name, val)}
                                                />
                                                <label
                                                    htmlFor={checkboxId}
                                                    className="text-sm leading-none cursor-pointer"
                                                >
                                                    {val}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="border-t p-4">
                    <Button className="w-full" onClick={() => setVisibleCount(12)}>
                        Apply Filters
                    </Button>
                </div>
            </aside>

            {/* Product Grid + Sort */}
            <main className="flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">{categoryDetails.name}</h1>
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                        const promo = getPromotionForProduct(product, promotions);
                        return (
                            <ProductCard key={product.productId} product={product} promo={promo} />
                        );
                    })}
                </div>

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="h-10" />
            </main>
        </div>
    )
}
