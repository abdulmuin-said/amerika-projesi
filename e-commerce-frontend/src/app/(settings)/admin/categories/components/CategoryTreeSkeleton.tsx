import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryTreeSkeleton({ level = 0 }: { level?: number }) {
    return (
        <div>
            <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                <div className="pl-2.5 min-w-0 flex items-center gap-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="w-4 h-4" />
                    {level < 2 && <Skeleton className="w-4 h-4" />}
                </div>
            </div>
            {level < 2 && <div className="ml-5 mt-1 pl-4 py-1.5 border-l border-gray-300 space-y-2">
                <CategoryTreeSkeleton level={level + 1} />
                <CategoryTreeSkeleton level={level + 1} />
            </div>}
        </div>
    );
}