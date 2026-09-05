"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pen, Trash } from "lucide-react";
import { Variation } from "@/types/domains/variation";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";


function VariationItem({ variation, onEdit, onDelete }: {
    variation: Variation;
    onEdit: (variation: Variation) => void;
    onDelete: (variation: Variation) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    const nodeTitleEl = (
        <span className="font-medium text-gray-800 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {variation.name}
        </span>
    );

    return <div>
        <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
            <div className="pl-2.5 min-w-0 flex items-center gap-1.5">
                {variation.variationOptions.length === 0 ?
                    <Tooltip>
                        <TooltipTrigger className="p-1 opacity-50">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>No variation options added</p>
                        </TooltipContent>
                    </Tooltip>:
                    <Button variant="ghost"
                        size={"none" as Parameters<typeof Button>[0]["size"]}
                        className="px-1 py-1"
                        onClick={() => setCollapsed(prev => !prev)}
                    >
                        {collapsed ?
                            <ChevronRight className="w-4 h-4 text-gray-600" /> :
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        }
                    </Button>
                }
                {nodeTitleEl}
            </div>
            <div className="flex gap-2">
                <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-2 h-6 text-sm"
                    onClick={() => onEdit(variation)}
                >
                    <Pen style={{ width: '0.85rem', height: '0.85rem' }} className="text-gray-600" />
                    <span className="text-gray-600">Edit</span>
                </Button>
                <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-1 h-6"
                    onClick={() => onDelete(variation)}
                >
                    <Trash className="w-4 h-4 text-gray-600" />
                </Button>
            </div>
        </div>

        {!!variation.variationOptions.length && <div hidden={collapsed} className="ml-5 mt-1 pl-4 py-1.5 border-l border-gray-300 space-y-2">
            {variation.variationOptions.map(option => (
                <div key={option.variationOptionId} className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                    <div className="pl-3.5 font-medium text-gray-800 overflow-hidden whitespace-nowrap overflow-ellipsis">
                        {option.name}
                    </div>
                </div>
            ))}
        </div>}
    </div>;
};

export default React.memo(VariationItem);