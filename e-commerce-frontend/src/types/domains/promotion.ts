import { Category } from "./category";

export enum PromotionType {
    PERCENTAGE = "PERCENTAGE",
    FLAT = "FLAT"
}

export interface Promotion {
    promotionId: number;
    description: string;
    promotionType: PromotionType;
    discountValue: number;
    validFrom: Date;
    validTill: Date;
    minimumOrderValue: number;
    maxUses: number;
    usagePerCustomer: number;
    categories: Category[];
}

export interface PromotionDetails {
    promotionId: number;
    description: string;
    promotionType: PromotionType;
    imageUrl?: string;
    discountValue: number;
    validFrom?: Date;
    validTill?: Date;
    minimumOrderValue?: number;
    maxUses?: number;
    usagePerCustomer?: number;
    categories: {
        categoryId: number;
        name: string;
    }[];
}

export interface PromotionDTO {
    description: string;
    promotionType: PromotionType;
    discountValue: number;
    validFrom?: Date;
    validTill?: Date;
    minimumOrderValue?: number;
    maxUses?: number;
    usagePerCustomer?: number;
    categoryIds: number[];
}