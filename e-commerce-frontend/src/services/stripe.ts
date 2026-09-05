import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";

export interface CreatePaymentIntentRequest {
    items: Array<{
        productVariantId: number;
        shippingMethodId: number;
        price: number;
        quantity: number;
        productName: string;
        categoryName: string;
    }>;
    shippingAddressId?: number;
    shippingAddress?: {
        street: string;
        city: string;
        pincode: number;
        country: string;
    };
    subtotalAmount: number;
    shippingAmount: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    orderId: number;
    publishableKey: string;
    amount: number;
    currency: string;
}

export interface ConfirmPaymentPayload {
    paymentIntentId: string;
    orderId?: number;
}

export interface ConfirmPaymentResponse {
    status: "success" | "failed";
    orderId?: number;
    reason?: string;
}

export interface StripeConfigResponse {
    publishableKey: string;
}

export const createPaymentIntent: ServiceFunction<CreatePaymentIntentRequest, PaymentIntentResponse> = (payload) => {
    return servicesApiClient.post("/stripe/create-payment-intent", { data: payload });
};

export const confirmPayment: ServiceFunction<ConfirmPaymentPayload, ConfirmPaymentResponse> = (payload) => {
    return servicesApiClient.post("/stripe/confirm", { data: payload });
};

export const getStripeConfig: ServiceFunction<void, StripeConfigResponse> = () => {
    return servicesApiClient.get("/stripe/config");
};
