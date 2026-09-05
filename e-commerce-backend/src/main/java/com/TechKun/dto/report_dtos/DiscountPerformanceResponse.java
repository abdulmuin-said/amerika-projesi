package com.TechKun.dto.report_dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DiscountPerformanceResponse {
    private double totalRevenueInfluenced;
    private double averageOrderValue;
    private List<DiscountPerformance> discounts;
}
