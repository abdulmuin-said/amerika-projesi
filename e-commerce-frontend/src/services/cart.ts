import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import {
    CartItem, CartItemDTO, CartItemPreview,
    CartItemUpdatePayload
} from "@/types/domains/cart";

export const getAllCartItems: ServiceFunction<[], CartItemPreview[]> = () => {
    return servicesApiClient.get('/cart-items');
};

export const addCartItem: ServiceFunction<CartItemDTO, CartItem> = (payload) => {
    return servicesApiClient.post('/cart-items', { data: payload });
};

export const updateCartItem: ServiceFunction<
    [cartItemId: number, payload: CartItemUpdatePayload], CartItem
> = (cartItemId, payload) => {
    return servicesApiClient.put(`/cart-items/${cartItemId}`, { data: payload });
};

export const deleteCartItem: ServiceFunction<[cartItemId: number], void> = (cartItemId) => {
    return servicesApiClient.delete(`/cart-items/${cartItemId}`);
};