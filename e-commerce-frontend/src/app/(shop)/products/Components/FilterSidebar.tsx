"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { CategoryTree } from "@/types/domains/category";

const normalizeRange = (raw: [number, number]): [number, number] => {
    const min = Number.isFinite(raw[0]) ? raw[0] : 0;
    const max = Number.isFinite(raw[1]) ? raw[1] : 0;
    const a = Math.max(0, Math.min(100000, Math.round(min)));
    const b = Math.max(0, Math.min(100000, Math.round(max)));
    return a <= b ? [a, b] : [b, a];
};

interface FilterSidebarProps {
    categories: CategoryTree[];
    onCategoryChange: (categoryId: number | null) => void;
    selectedCategoryId?: number | null;
    priceRange?: [number, number];
    onPriceRangeChange?: (range: [number, number]) => void;
    mobile?: boolean;
    onClose?: () => void;
}

const FilterSidebar = ({
    categories,
    onCategoryChange,
    selectedCategoryId: selectedCategoryIdProp,
    priceRange: priceRangeProp,
    onPriceRangeChange,
    mobile = false,
    onClose,
}: FilterSidebarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [priceRange, setPriceRange] = useState<[number, number]>(priceRangeProp ?? [0, 100000]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategoryIdProp || null);
    const [openSections, setOpenSections] = useState({ category: true, price: true });

    useEffect(() => {
        if (selectedCategoryIdProp !== undefined) setSelectedCategoryId(selectedCategoryIdProp);
    }, [selectedCategoryIdProp]);

    useEffect(() => {
        if (priceRangeProp) setPriceRange(priceRangeProp);
    }, [priceRangeProp]);

    useEffect(() => {
        const minParam = searchParams.get("minPrice");
        const maxParam = searchParams.get("maxPrice");
        if (minParam == null && maxParam == null) return;
        setPriceRange((prev) => {
            const min = minParam != null ? Number(minParam) : (priceRangeProp?.[0] ?? prev[0]);
            const max = maxParam != null ? Number(maxParam) : (priceRangeProp?.[1] ?? prev[1]);
            return normalizeRange([min, max]);
        });
    }, [searchParams, priceRangeProp]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (value: string) => {
        const categoryId = value === "" ? null : parseInt(value, 10);
        setSelectedCategoryId(categoryId);
        onCategoryChange(categoryId);
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId !== null) params.set("categoryId", String(categoryId));
        else params.delete("categoryId");
        router.push(params.toString() ? `/products?${params.toString()}` : "/products");
        onClose?.();
    };

    const applyFilters = () => {
        const normalizedRange = normalizeRange(priceRange);
        const params = new URLSearchParams(searchParams.toString());
        params.set("minPrice", String(normalizedRange[0]));
        params.set("maxPrice", String(normalizedRange[1]));
        router.push(params.toString() ? `/products?${params.toString()}` : "/products");
        onPriceRangeChange?.(normalizedRange);
        onClose?.();
    };

    const flattenCategories = (cats: CategoryTree[]): CategoryTree[] => {
        const result: CategoryTree[] = [];
        cats.forEach(cat => {
            result.push(cat);
            if (cat.subcategories?.length) result.push(...flattenCategories(cat.subcategories));
        });
        return result;
    };

    const allCategories = flattenCategories(categories);
    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
    const isPriceFiltered = priceRange[0] !== 0 || priceRange[1] !== 100000;

    return (
        <div
            className={mobile ? "w-full flex flex-col" : "w-64 shrink-0 pr-8 border-r border-border flex flex-col"}
            style={mobile ? undefined : { height: 'calc(100vh - 5.5rem)' }}
        >

            {/* Fixed header — never scrolls, hidden on mobile (Sheet has its own header) */}
            <div className={cn("flex items-center justify-between pb-4 border-b border-border shrink-0", mobile && "hidden")}>
                <h2 className="font-display text-xl font-medium text-foreground">Filters</h2>
                {isPriceFiltered && (
                    <button
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                        onClick={() => {
                            setPriceRange([0, 100000]);
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('minPrice');
                            params.delete('maxPrice');
                            router.push(params.toString() ? `/products?${params.toString()}` : '/products');
                            onPriceRangeChange?.([0, 100000]);
                        }}
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Scrollable body */}
            <div className={mobile ? "pt-6 space-y-8" : "flex-1 overflow-y-auto scrollbar-luxury pt-6 space-y-8"} style={mobile ? undefined : { scrollbarGutter: 'stable' }}>

                {/* Category Filter */}
                <div>
                    <button
                        className="flex items-center justify-between w-full mb-4"
                        onClick={() => toggleSection('category')}
                    >
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                            Categories
                        </p>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${openSections.category ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.category && (
                        <div className="space-y-3">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="pl-9 h-8 text-sm rounded-sm border-border/60 bg-background"
                                />
                            </div>
                            <div className="space-y-0">
                                {filteredCategories.map((cat) => {
                                    const isSelected = selectedCategoryId === cat.categoryId;
                                    return (
                                        <button
                                            key={cat.categoryId}
                                            type="button"
                                            onClick={() => handleCategoryChange(isSelected ? "" : cat.categoryId.toString())}
                                            className="flex items-center gap-3 w-full py-2 text-left transition-colors group border-b border-border/30 last:border-b-0"
                                        >
                                            {/* Custom radio indicator */}
                                            <span className={cn(
                                                "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "border-[#c9a84c] bg-[#c9a84c]/10"
                                                    : "border-border/60 group-hover:border-foreground/40"
                                            )}>
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] block" />
                                                )}
                                            </span>
                                            <span className={cn(
                                                "text-sm transition-colors",
                                                isSelected
                                                    ? "text-foreground font-medium"
                                                    : "text-foreground/70 group-hover:text-foreground"
                                            )}>
                                                {cat.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div>
                    <button
                        className="flex items-center justify-between w-full mb-4"
                        onClick={() => toggleSection('price')}
                    >
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                            Price
                        </p>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${openSections.price ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.price && (
                        <div className="space-y-4">
                            <div className="px-1">
                                <Slider
                                    value={priceRange}
                                    onValueChange={(v) => setPriceRange(normalizeRange([v[0], v[1]]))}
                                    max={100000}
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>${priceRange[0].toLocaleString()}</span>
                                <span>${priceRange[1].toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([v, priceRange[1]]));
                                    }}
                                    className="text-center text-sm h-8 rounded-sm border-border/60"
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([priceRange[0], v]));
                                    }}
                                    className="text-center text-sm h-8 rounded-sm border-border/60"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    className="w-full rounded-none tracking-widest text-sm font-medium h-10"
                    onClick={applyFilters}
                >
                    Apply Filters
                </Button>

            </div>
        </div>
    );
};

export default FilterSidebar;
