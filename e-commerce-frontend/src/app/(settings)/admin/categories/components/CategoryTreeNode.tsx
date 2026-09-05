/* eslint-disable @typescript-eslint/no-unused-expressions, react/display-name */
// /components/admin/CategoryTreeNode.tsx
'use client';

import React, { useRef, useState } from "react";
import { ChevronDown, ChevronRight, Minus, Pen, Plus } from "lucide-react";
import { CategoryTree } from "@/types/domains/category";
import { Button } from "@/components/ui/button";


const CategoryTreeNode = React.memo(({
    node,
    level = 0,
    onSelectCategory,
    onAddSubcategory,
    onDeleteCategory
}: {
    node: CategoryTree;
    level?: number;
    onSelectCategory: (id: number) => void;
    onAddSubcategory: (node: CategoryTree) => void;
    onDeleteCategory: (node: CategoryTree) => void;
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const editButtonRef = useRef<HTMLButtonElement>(null);

    const nodeTitleEl = (
        <span className="font-medium text-gray-800 overflow-hidden whitespace-nowrap overflow-ellipsis">{node.name}</span>
    );
    const editButtonEl = (
        <Button variant="ghost" ref={editButtonRef}
            size={"none" as Parameters<typeof Button>[0]["size"]}
            className="px-1.5 py-1.5"
            style={{opacity: "0"}}
            onClick={() => onSelectCategory(node.categoryId)}
        >
            <Pen style={{width: '0.85rem', height: '0.85rem'}} className="text-gray-600" />
        </Button>
    );

    return (<div>
        <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between"
            onMouseEnter={() => {
                if (editButtonRef.current)
                    editButtonRef.current.style.opacity = "1";
            }}
            onMouseLeave={() => {
                if (editButtonRef.current)
                    editButtonRef.current.style.opacity = "0";
            }}
        >
            {node.subcategories.length > 0 ? (
                <div className="pl-2.5 min-w-0 flex items-center gap-1.5">
                    <Button variant="ghost"
                        size={"none" as Parameters<typeof Button>[0]["size"]}
                        className="px-1 py-1"
                        onClick={() => setCollapsed(prev => !prev)}
                    >
                        {collapsed ?
                            <ChevronRight className="w-4 h-4 text-gray-600" />:
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        }
                    </Button>
                    {nodeTitleEl}
                    {editButtonEl}
                </div>
            ): (
                <div className="pl-3.5 min-w-0 flex items-center gap-1.5">
                    {nodeTitleEl}
                    {editButtonEl}
                </div>
            )}
            <div className="flex gap-1">
                <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-1 py-1"
                    onClick={() => onDeleteCategory(node)}
                >
                    <Minus className="w-4 h-4 text-gray-600" />
                </Button>
                {level < 2 && <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-1 py-1"
                    onClick={() => {
                        collapsed && setCollapsed(false);
                        onAddSubcategory(node)
                    }}
                >
                    <Plus className="w-4 h-4 text-gray-600" />
                </Button>}
            </div>
        </div>

        {node.subcategories.length > 0 && <div hidden={collapsed} className="ml-5 mt-1 pl-4 py-1.5 border-l border-gray-300 space-y-2">
            {node.subcategories.map((child) => (
                <CategoryTreeNode
                    key={child.categoryId}
                    node={child}
                    level={level + 1}
                    onSelectCategory={onSelectCategory}
                    onAddSubcategory={onAddSubcategory}
                    onDeleteCategory={onDeleteCategory}
                />
            ))}
        </div>}
    </div>);
});

export default CategoryTreeNode;
