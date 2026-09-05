package com.TechKun.dto.payment_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentSummaryDTO {
    private Double totalRevenue;
    private Long totalSuccessful;
    private Long totalFailed;
    private Long totalPending;
}
