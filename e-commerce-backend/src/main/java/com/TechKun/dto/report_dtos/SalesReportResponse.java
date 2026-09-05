package com.TechKun.dto.report_dtos;

import lombok.Data;
import java.util.List;

@Data
public class SalesReportResponse {
    private double totalSales;
    private int totalOrders;
    private double averageOrderValue;
    private List<SalesByPeriod> salesByPeriod;
}