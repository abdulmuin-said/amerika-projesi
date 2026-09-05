package com.TechKun.dto.report_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryPerformance {

    private Long categoryId;
    private String categoryName;
    private int unitsSold;
    private double revenue;
}