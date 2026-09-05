package com.TechKun.dto.report_dtos;

import lombok.Data;

import java.util.List;

@Data
public class ProductPerformanceResponse {
    private Integer totalViews;
    private Integer totalPurchases;
    private Double totalRevenue;
    private Double averageConversionRate;
    private Double averageReturnRate;
    private Double averageOrderValue;
    private List<ProductPerformance> products;
}