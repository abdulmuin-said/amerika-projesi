import { Personalization } from "./personalization";
import { ProductImage, ProductVariant } from "./product";
import { ShopUser } from "./user";

export type CartItemPreview = {
    cartItemId: number;
    addedAt: Date;
    imageUrl?: string;
    title: string;
    productVariantId: number;
    productId?: number;
    categoryId?: number;
    sku: string;
    price: number;           // final price after discount
    originalPrice?: number;  // base price before discount; undefined = no promotion
    promotionType?: string;  // "PERCENTAGE" | "FLAT"
    discountValue?: number;  // e.g. 20 for 20% off
    quantityInStock: number;
    quantity: number;
    personalization?: Personalization;
    variationOptions?: { variationOptionId: number; optionName: string; variationName: string }[];
};

export type CartItemDTO = {
    productImageId?: number;
    productVariantId: number;
    quantity: number;
    personalization?: Personalization;
};

export interface CartItemUpdatePayload {
    quantity: number;
    personalization?: Personalization;
};

export type CartItem = {
    cartItemId: number;
    customer: ShopUser;
    productVariant: ProductVariant;
    productImage: ProductImage;
    quantity: number;
    personalization: Personalization;
    addedAt: Date;
};

// Assuming Personalization, ShopUser, ProductVariant, and ProductImage are defined elsewhere