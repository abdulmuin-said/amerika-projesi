import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";

export interface PayTROrderItemPayload {
    productVariantId: number;
    shippingMethodId: number;
    price: number;
    quantity: number;
    productName: string;
    categoryName?: string;
}

export interface PayTRShippingAddressPayload {
    street: string;
    city: string;
    pincode: number;
    country: string;
}

export interface PayTRTokenRequest {
    items: PayTROrderItemPayload[];
    shippingAddressId?: number;
    shippingAddress?: PayTRShippingAddressPayload;
    subtotalAmount: number;
    shippingAmount: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    currency?: "TRY" | "USD" | string;
    userEmail?: string;
    userName?: string;
    userPhone?: string;
}

export interface PayTRTokenResponse {
    status: "success" | "failed";
    token?: string;
    iframeUrl?: string;
    orderId: number;
    currency: string;
    amount: number;
    isTest: boolean;
    errorMessage?: string;
}

export interface ConfirmPayTRTestRequest {
    orderId: number;
}

export interface ConfirmPayTRTestResponse {
    status: "success" | "failed";
    orderId?: number;
    message?: string;
}

export const getPayTRToken: ServiceFunction<PayTRTokenRequest, PayTRTokenResponse> = (payload) => {
    return servicesApiClient.post("/paytr/get-token", { data: payload });
};

export const confirmPayTRTest: ServiceFunction<ConfirmPayTRTestRequest, ConfirmPayTRTestResponse> = (payload) => {
    return servicesApiClient.post("/paytr/confirm-test", { data: payload });
};
