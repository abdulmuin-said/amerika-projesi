package com.TechKun.controller;

import com.TechKun.dto.report_dtos.*;
import com.TechKun.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class  ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/reports/sales")
    public SalesReportResponse getSalesReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return reportService.generateSalesReport(startDate, endDate);
    }
    @GetMapping("/reports/categories-performance")
    public CategoryPerformanceResponse getCategoryPerformance(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return reportService.getCategoryPerformance(startDate, endDate);
    }


    @GetMapping("/reports/orders")
    public List<OrderStatusReport> getOrderStatusReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return reportService.getOrdersGroupedByStatus(startDate, endDate);
    }
    @GetMapping("/reports/customers")
    public CustomerReportResponse getCustomerReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return reportService.getCustomerReport(startDate, endDate);
    }
    @GetMapping("/reports/products-performance")
    public ProductPerformanceResponse getProductPerformance(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return reportService.getProductPerformance(startDate, endDate);
    }
    @GetMapping("/reports/discounts-performance")
    public DiscountPerformanceResponse getDiscountPerformance(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return reportService.getDiscountPerformance(startDate, endDate);
    }


}