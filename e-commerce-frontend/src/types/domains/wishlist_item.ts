import { ProductVariant } from "./product";
import { ShopUser } from "./user";

export interface WishlistItem {
    wishlistItemId: number;
    productVariant: ProductVariant;
    customer: ShopUser;
}

export interface WishlistItemDTO {
    wishlistItemId: number;
    productTitle?: string;
    productImageUrl: string;
    productId?: number;
    categoryId?: number;
    productVariant: {
        productVariantId: number;
        sku: string;
        quantityInStock: number;
        price: number;
    };
}