export interface PaymentMethod {
   paymentMethodId: number;
   type: PaymentType;
   providerToken: string;
   last4: string;
   expiryMonth: string;
   expiryYear: string;
   isDefault: boolean;
   cardHolderName: string;
}

export interface PaymentMethodDTO {
   last4: string;
   providerToken: string;
   expiryMonth: string;
   expiryYear: string;
   isDefault: boolean;
   cardHolderName: string;
}

export enum PaymentType {
   CREDIT_CARD = "CREDIT_CARD",
   DEBIT_CARD = "DEBIT_CARD",
   PAYPAL = "PAYPAL",
   BANK_TRANSFER = "BANK_TRANSFER",
   CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}
