package com.TechKun.dto.report_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPerformance {
    private Long productId;
    private String productTitle;
    private Integer views;
    private Integer purchases;
    private Double conversionRate;
    private Double returnRate;
    private Integer unitsSold;
    private Double revenue;
}