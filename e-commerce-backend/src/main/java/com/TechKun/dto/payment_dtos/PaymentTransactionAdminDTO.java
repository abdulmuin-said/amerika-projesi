package com.TechKun.dto.payment_dtos;

import com.TechKun.model.enums.PaymentTransactionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentTransactionAdminDTO {
    private Integer paymentTransactionId;
    private Integer orderId;
    private String customerName;
    private String customerEmail;
    private String conversationId;
    private String stripePaymentIntentId;

    private PaymentTransactionStatus status;
    private Double paidPrice;
    private String currency;
    private Integer installment;
    private Integer fraudStatus;
    private String authCode;
    private String cardFamily;
    private String binNumber;
    private String lastFourDigits;
    private String cardAssociation;
    private String errorCode;
    private String errorMessage;
    private LocalDateTime createdAt;
}
