
import { Attribute } from "./attribute";

export interface Product {
    productId: number;
    categoryId: number;
    shippingMethodId?: number;
    title: string;
    code: string;
    description: string;
    dateAdded: string;
    starred: boolean;
    /** When false, product is hidden from the public shop (admin still sees it). */
    status: boolean;
    variants: ProductVariant[];
    productImages: ProductImage[];
    attributes: ProductAttribute[];
}

export interface ProductVariant {
    productVariantId: number;
    sku: string;
    disabled: boolean;
    quantityInStock: number;
    price: number;
    // product: Product;
    variationOptions: {
        variationOptionId: number;
        name: string;
        variationId: number;
    }[];
}

export interface ProductAttribute {
    productAttributeId: number;
    // product: Product;
    attribute: Attribute;
    value: string;
}

export interface ProductImage {
    productImageId: number;
    imageUrl: string;
    isDefault: boolean;
    // product: Product;
}

export interface ProductDetails {
    productId: number;
    images: ProductImage[];
    title: string;
    code: string;
    categoryId: number;
    shippingMethodId?: number;
    variants: (Omit<ProductVariant, 'variationOptions'> & {variantProperties : {[variationId: number] : {variationOptionId: number , name: string}}})[];
    description: string;
    attributes: ProductAttribute[];
    starred: boolean;
    status: boolean;
    averageRating: number;
    reviewCount: number;
}

export interface ProductPatchPayload {
    title: string;
    starred: boolean;
    categoryId: number;
    shippingMethodId?: number;
    status: boolean;
}

export interface ProductPayload {
    title: string;
    code: string;
    description: string;
    starred: boolean;
    status: boolean;
    categoryId: number;
    shippingMethodId?: number;
    images: {
        productImageId?: number;
        imageUrl: string;
        isDefault: boolean;
    }[];
    variants: {
        productVariantId?: number;
        sku: string;
        quantityInStock: number;
        price: number;
        disabled: boolean;
        variationOptionIds: number[];
    }[];
    attributes: {
        attributeId: number;
        value: string;
    }[];
}

export interface ProductPreview {
    productId: number;
    productVariantId: number;
    categoryId: number;
    shippingMethodId?: number;
    dateAdded: Date;
    quantityInStock: number;
    imageUrl: string;
    images: string[];
    price: number;
    title: string;
    code: string;
    rating: number;
    starred: boolean;
    /** Omit on admin list (all products). Set true on shop to load only active products. */
    status?: boolean;
}

export interface ProductQueryOptions {
    searchInput?: string;
    categoryId?: number;
    variations?: Record<number, number>;
    sortOption?: SortOption;
    /** When true, only products visible in the shop. Omit for admin. */
    status?: boolean;
    /** Maximum number of results to return. */
    limit?: number;
    /** Number of results to skip (for pagination). */
    offset?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    /** Exclude a specific product ID from results (used for related products). */
    excludeProductId?: number;
}

export enum SortOption {
    POPULAR = 'POPULAR',
    NEWEST = 'NEWEST',
    PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
    PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW',
}