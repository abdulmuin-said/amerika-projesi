/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { MultiSelect, MultiSelectContent, MultiSelectSearchInput, MultiSelectTrigger } from "@/components/ui/multiselect";
import { CategoryTree } from "@/types/domains/category";
import { ChevronRight, ChevronsUpDown, ChevronDown } from "lucide-react";
import React, { useState, useContext } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface CategoryMultiSelectNode {
    categoryId: number;
    name: string;
    parentCategory: CategoryMultiSelectNode | undefined;
    path: string;
}

interface CategoryHierarchyItemProps {
    category: CategoryTree;
    parentCategory: CategoryMultiSelectNode | undefined;
    selectedCategories: Set<number>;
    onToggle: (node: CategoryMultiSelectNode) => void;
    level?: number;
}

function CategoryHierarchyItem({
    category,
    parentCategory,
    selectedCategories,
    onToggle,
    level = 0
}: CategoryHierarchyItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const categoryNode: CategoryMultiSelectNode = {
        categoryId: category.categoryId,
        name: category.name,
        parentCategory,
        path: category.path
    };

    const isSelected = selectedCategories.has(category.categoryId);
    const hasSubcategories = category.subcategories.length > 0;

    return (
        <>
            <div
                className={`flex items-center gap-2 h-8 ${hasSubcategories ? 'px-2' : 'px-2.5' } hover:bg-accent rounded-sm cursor-pointer`}
                onClick={() => onToggle(categoryNode)}
            >
                {hasSubcategories && (
                    <Button
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        style={{ padding: "0.0625rem" }}
                        className="h-min hover:bg-accent-foreground/10 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown size={3} />
                        ) : (
                            <ChevronRight size={3} />
                        )}
                    </Button>
                )}

                <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => onToggle(categoryNode)}
                />

                <span className="text-sm flex-1">
                    {category.name}
                </span>
            </div>

            {hasSubcategories && isExpanded && (
                <div className="w-full pl-6">
                    {category.subcategories.map(sub => (
                        <CategoryHierarchyItem
                            key={sub.path}
                            category={sub}
                            parentCategory={categoryNode}
                            selectedCategories={selectedCategories}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function CategoriesMultiSelectMenu({
    categories,
    selectedCategories,
    onToggle
}: {
    categories: CategoryTree[];
    selectedCategories: Set<number>;
    onToggle: (node: CategoryMultiSelectNode) => void;
}) {

    return categories.map(category => (
        <CategoryHierarchyItem
            key={category.path}
            category={category}
            parentCategory={undefined}
            selectedCategories={selectedCategories}
            onToggle={onToggle}
        />
    ));
}

export default function CategoriesMultiSelect({
    disabled = false,
    categories,
    selectedCategoryIds,
    onSelectionChange,
    placeholder = "Select categories"
}: {
    disabled?: boolean;
    categories: CategoryTree[];
    selectedCategoryIds: number[];
    onSelectionChange: (selectedIds: number[]) => void;
    placeholder?: string;
}) {
    const selectedCategories = new Set(selectedCategoryIds);

    const selectedCategoryNames = getSelectedCategoryNames(categories, selectedCategoryIds);

    const handleToggle = (node: CategoryMultiSelectNode) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(node.categoryId)) {
            newSelected.delete(node.categoryId);
        } else {
            newSelected.add(node.categoryId);
        }
        onSelectionChange(Array.from(newSelected));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    className={cn(
                        "border px-3 h-9 justify-between",
                        selectedCategoryNames.length === 0 && "text-muted-foreground hover:text-muted-foreground"
                    )}
                >
                    <div className="text-left flex-1">
                        {selectedCategoryNames.length === 0 ? (
                            <div>{placeholder}</div>
                        ) : (
                            <div>
                                <span>{selectedCategoryNames.slice(0, 2).join(", ")}</span>
                                {selectedCategoryNames.length > 2 && <span className="text-xs text-muted-foreground">
                                    &nbsp;+{selectedCategoryNames.length - 2} more
                                </span>}
                            </div>
                        )}
                    </div>
                    <ChevronsUpDown className="opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-80" onWheel={e => e.stopPropagation()}>
                <div className="border-b px-1 py-2">
                    <div className="max-h-64 overflow-y-auto thin-scrollbar">
                        <CategoriesMultiSelectMenu
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onToggle={handleToggle}
                        />
                    </div>
                </div>
                <Button variant="ghost" disabled={selectedCategoryNames.length === 0}
                    className="rounded-t-none w-full"
                    onClick={() => onSelectionChange([])}
                >
                    Clear all ({selectedCategoryNames.length})
                </Button>
            </PopoverContent>
        </Popover>
    );
}

function getSelectedCategoryNames(categories: CategoryTree[], selectedIds: number[]): string[] {
    const names: string[] = [];

    function searchCategories(cats: CategoryTree[]) {
        for (const cat of cats) {
            if (selectedIds.includes(cat.categoryId)) {
                names.push(cat.name);
            }
            searchCategories(cat.subcategories);
        }
    }

    searchCategories(categories);
    return names;
} 