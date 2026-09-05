import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VariationItemsSkeleton() {
    return (
        <div className="py-1">
            <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                <div className="pl-2.5 min-w-0 flex items-center gap-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="w-12 h-4" />
                    <Skeleton className="w-4 h-4" />
                </div>
            </div>
            <div className="ml-5 mt-1 pl-4 border-l border-gray-300">
                <div className="py-1">
                    <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                        <div className="pl-2.5 min-w-0 flex items-center gap-1">
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <div className="py-1">
                    <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                        <div className="pl-2.5 min-w-0 flex items-center gap-1">
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}