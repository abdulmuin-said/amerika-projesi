import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { WishlistItem, WishlistItemDTO } from "@/types/domains/wishlist_item";

const API_BASE_URL = '/wishlist-items';

export const getWishlistItems: ServiceFunction<[], WishlistItemDTO[]> = () => {
    return servicesApiClient.get(`${API_BASE_URL}`, {});
};

export const addToWishlist: ServiceFunction<[productVariantId: number], WishlistItem> = (productVariantId) => {
    return servicesApiClient.post(`${API_BASE_URL}`, {
        params: { productVariantId }
    });
};

export const deleteWishlistItem: ServiceFunction<[wishlistItemId: number], void> = (wishlistItemId) => {
    return servicesApiClient.delete(`${API_BASE_URL}/${wishlistItemId}`);
};