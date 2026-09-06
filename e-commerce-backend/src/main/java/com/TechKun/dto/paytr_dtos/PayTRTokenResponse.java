package com.TechKun.dto.paytr_dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayTRTokenResponse {

    private String status; // "success" or "failed"
    private String token;
    private String iframeUrl;
    private Integer orderId;
    private String currency;
    private Double amount;
    private Boolean isTest;
    private String errorMessage;
}
