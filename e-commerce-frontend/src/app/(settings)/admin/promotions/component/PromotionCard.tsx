import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionDetails } from "@/types/domains/promotion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const promotionCardColors = {
    purple: "bg-purple-200/60",
    orange: "bg-orange-200/60",
    emerald: "bg-emerald-200/60",
    red: "bg-red-200/60",
    blue: "bg-blue-200/60"
};

interface PromotionCardProps {
    promotion: PromotionDetails;
    onDelete: (id: number) => void;
    onEdit: (id: PromotionDetails) => void;
    bgColor?: keyof typeof promotionCardColors;
};

export const PromotionCard: React.FC<PromotionCardProps> = ({
    promotion,
    onDelete,
    onEdit,
    bgColor
}) => {
    const bgGradientClass = bgColor ? promotionCardColors[bgColor] : (promotion.promotionType === 'PERCENTAGE' ? 'from-emerald-600 to-emerald-800' : 'from-blue-600 to-blue-800');

    const formatDiscount = () => {
        return promotion.promotionType === 'PERCENTAGE'
            ? `${promotion.discountValue}% OFF`
            : `₹${promotion.discountValue} OFF`;
    };

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-IN');
    };

    return (
        <div className="relative group transition-all duration-300 w-full cursor-pointer" onClick={() => onEdit(promotion)}>
            {/* Main Card */}
            <div className={cn(
                "relative rounded-t-md p-4 bg-gradient-to-br overflow-hidden text-black",
                bgGradientClass
            )}>
                {/* Background Pattern */}
                {/* <div className="absolute inset-0 opacity-15">
                    <div className="absolute top-4 right-4 text-6xl font-bold transform rotate-12">
                        %
                    </div>
                    <div className="absolute bottom-4 left-4 text-4xl font-bold transform -rotate-12">
                        %
                    </div>
                </div> */}

                {/* Header */}
                <div className="relative flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/50 backdrop-blur-sm">
                        {promotion.promotionType === 'PERCENTAGE' ? 'Percentage' : 'Flat Discount'}
                    </span>
                    <Button variant={"outline"}
                        className="hover:bg-white/20 transition-colors text-black"
                        title="Delete promotion"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(promotion.promotionId);
                        }}
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>

                {/* Discount */}
                <div className="relative mb-3">
                    <h2 className="text-4xl font-bold">
                        {formatDiscount()}
                    </h2>
                    <span className="text-sm font-medium bg-white/50 backdrop-blur-sm px-2 py-1 rounded mt-5 inline-block">
                        Min Order: ₹{promotion.minimumOrderValue}
                    </span>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white rounded-b-md p-4 border-x border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{promotion.description}</h3>
                        <p className="text-xs text-gray-500">Valid till {formatDate(promotion.validTill)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">{promotion.maxUses} max uses</p>
                        <p className="text-xs text-gray-500">{promotion.usagePerCustomer} per customer</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export const PromotionCardSkeleton = () => {
    return (
        <div className="w-full">
            <Skeleton className="rounded-t-md p-4 h-32 flex flex-col justify-between rounded-b-none">
                <div className="flex justify-between items-start">
                    <Skeleton className="w-24 h-6 rounded-full bg-black/10" />
                    <Skeleton className="w-10 h-10 rounded-md bg-black/10" />
                </div>
                <div>
                    <Skeleton className="w-32 h-8 rounded mb-2 mt-2 bg-black/10" />
                    <Skeleton className="w-28 h-6 rounded bg-black/10" />
                </div>
            </Skeleton>
            <div className="bg-white rounded-b-md p-4 border-x border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="space-y-2 text-right flex flex-col items-end">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
};
