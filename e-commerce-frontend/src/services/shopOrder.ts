import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction, PageResponse } from "@/types/api";
import {
    OrderCreatePayload, OrderDetails, OrderPreviewDTO,
    OrderQueryOptions, OrderUpdatePayload, ShopOrder   
} from "@/types/domains/order";



export const getAllOrders: ServiceFunction<[
    customerId?: number, filters?: OrderQueryOptions,
    page?: number, size?: number
], PageResponse<OrderPreviewDTO>> = (customerId, filters, page, size) => {
    return servicesApiClient.get('/shop-orders', { params: { customerId, page, size }, data: filters });
};

export const getOrderById: ServiceFunction<[shopOrderId: number], OrderDetails> = (shopOrderId) => {
    return servicesApiClient.get(`/shop-orders/${shopOrderId}`);
};

export const createOrder: ServiceFunction<OrderCreatePayload, ShopOrder> = (payload) => {
    return servicesApiClient.post('/shop-orders', { data: payload });
};

export const updateOrder: ServiceFunction<[shopOrderId: number, payload: OrderUpdatePayload], ShopOrder> = (shopOrderId, payload) => {
    return servicesApiClient.put(`/shop-orders/${shopOrderId}`, { data: payload });
};
