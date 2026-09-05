package com.TechKun.dto.payment_method_dtos;

import lombok.Data;

@Data
public class PaymentMethodDTO {
    private String last4;
    private String providerToken;
    private String expiryMonth;
    private String expiryYear;
    private Boolean isDefault;
    private String cardHolderName;
}