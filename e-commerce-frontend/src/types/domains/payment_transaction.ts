export type PaymentTransactionStatus = "PENDING" | "SUCCESS" | "FAILURE";

export interface PaymentTransaction {
    paymentTransactionId: number;
    orderId: number;
    customerName: string;
    customerEmail: string;
    conversationId: string;
    stripePaymentIntentId?: string | null;
    status: PaymentTransactionStatus;
    paidPrice: number | null;
    currency: string;
    installment: number | null;
    fraudStatus: number | null;
    authCode: string | null;
    cardFamily: string | null;
    binNumber: string | null;
    lastFourDigits: string | null;
    cardAssociation: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
}

export interface PaymentSummary {
    totalRevenue: number;
    totalSuccessful: number;
    totalFailed: number;
    totalPending: number;
}
