package com.TechKun.dto.report_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountPerformance {
    private String discountCode;
    private int timesUsed;
    private double revenueInfluenced;
    private double averageOrderValue;
}
