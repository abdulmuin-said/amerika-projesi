"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CategoryTree } from "@/types/domains/category";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import React from "react";

export interface CategoryDropdownNode {
    categoryId: number;
    name: string;
    parentCategory: CategoryDropdownNode | undefined;
};

function renderCategoryDropdown(category: CategoryTree, parentCategory: CategoryDropdownNode | undefined, onSelect: (id: CategoryDropdownNode) => void) {
    const categoryNodeItem: CategoryDropdownNode = {
        categoryId: category.categoryId,
        name: category.name,
        parentCategory
    };

    if (category.subcategories.length === 0)
        return <DropdownMenuItem key={category.path} onClick={() => onSelect(categoryNodeItem)}>
            {category.name}
        </DropdownMenuItem>;

    return <div className="flex" key={category.path}>
        <DropdownMenuItem className="flex-1" onClick={() => onSelect(categoryNodeItem)}>
            {category.name}
        </DropdownMenuItem>
        <DropdownMenuSub>
            <DropdownMenuSubTrigger />
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {category.subcategories.map(sub => renderCategoryDropdown(sub, categoryNodeItem, onSelect))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    </div>
};

export default function CategoriesDropdown({
    disabled = false,
    categories,
    selectedCategoryNode,
    onSelect,
    onAddCategory,
    onAddSubcategory
}: {
    disabled?: boolean;
    categories: CategoryTree[];
    selectedCategoryNode: CategoryDropdownNode | undefined;
    onSelect: (id: CategoryDropdownNode) => void;
    onAddCategory?: () => void;
    onAddSubcategory?: (parent: CategoryDropdownNode) => void;
}) {
    const selectedCategory = getParentStack(selectedCategoryNode);

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button disabled={disabled}
                variant={"outline"}
                className={`border px-3 py-1.5 justify-between ${selectedCategory ? "" : "text-muted-foreground"}`}
                style={{ height: "auto" }}
            >
                {selectedCategory ?
                    <div className="text-left">
                        <div className="mb-1">{selectedCategory.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {selectedCategory.parentStack.map((cat, i) => <React.Fragment key={cat.categoryId}>
                                {cat.name}
                                {i + 1 !== selectedCategory.parentStack.length && <ChevronRight className="size-3" />}
                            </React.Fragment>)}
                        </div>
                    </div> :
                    "Select a category"}
                <ChevronsUpDown className="opacity-50" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            {/* Optional quick actions */}
            {onAddCategory && (
                <DropdownMenuItem onClick={onAddCategory} className="font-medium">
                    + Add Category
                </DropdownMenuItem>
            )}
            {onAddSubcategory && selectedCategoryNode && (
                <DropdownMenuItem onClick={() => onAddSubcategory(selectedCategoryNode)} className="font-medium">
                    + Add subcategory under: {selectedCategoryNode.name}
                </DropdownMenuItem>
            )}
            {(onAddCategory || (onAddSubcategory && selectedCategoryNode)) && <DropdownMenuSeparator />}
            {categories.map(cat => renderCategoryDropdown(cat, undefined, node => {
                if (node.categoryId === selectedCategoryNode?.categoryId)
                    return;

                onSelect(node);
            }))}
        </DropdownMenuContent>
    </DropdownMenu>
};

function getParentStack(categoryDetails: CategoryDropdownNode | undefined): {
    name: string;
    parentStack: {
        categoryId: number;
        name: string;
    }[];
} | undefined {
    if (!categoryDetails)
        return undefined;

    let current: CategoryDropdownNode | undefined = categoryDetails;
    const parentStack: {
        categoryId: number;
        name: string;
    }[] = [];
    while (current) {
        parentStack.splice(0, 0, {
            categoryId: current.categoryId,
            name: current.name
        });
        current = current.parentCategory;
    }
    return {
        name: categoryDetails.name,
        parentStack
    }
};