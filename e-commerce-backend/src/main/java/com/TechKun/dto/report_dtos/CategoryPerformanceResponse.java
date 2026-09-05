package com.TechKun.dto.report_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryPerformanceResponse {

    private double totalRevenue;
    private int totalUnitsSold;
    private List<CategoryPerformance> categories;
}
