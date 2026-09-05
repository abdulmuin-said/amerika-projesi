import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction, PageResponse } from "@/types/api";
import { PaymentTransaction, PaymentSummary } from "@/types/domains/payment_transaction";

export const getAllTransactions: ServiceFunction<[
    status?: string,
    fromDate?: string,
    toDate?: string,
    page?: number,
    size?: number
], PageResponse<PaymentTransaction>> = (status, fromDate, toDate, page = 0, size = 20) => {
    return servicesApiClient.get("/payment-transactions", {
        params: { status, fromDate, toDate, page, size },
    });
};

export const getTransactionById: ServiceFunction<number, PaymentTransaction> = (id) => {
    return servicesApiClient.get(`/payment-transactions/${id}`);
};

export const getPaymentSummary: ServiceFunction<void, PaymentSummary> = () => {
    return servicesApiClient.get("/payment-transactions/summary");
};
