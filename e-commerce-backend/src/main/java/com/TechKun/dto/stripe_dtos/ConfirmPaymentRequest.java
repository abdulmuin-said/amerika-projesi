package com.TechKun.dto.stripe_dtos;

import lombok.Data;

@Data
public class ConfirmPaymentRequest {
    private String paymentIntentId;
    private Integer orderId;
}
