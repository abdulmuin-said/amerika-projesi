
package com.TechKun.service;
import com.TechKun.dto.report_dtos.*;
import com.TechKun.dao.ReportRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class  ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public SalesReportResponse generateSalesReport(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        return this.reportRepository.groupSalesByPeriod(start, end);
    }
    public CategoryPerformanceResponse getCategoryPerformance(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());
        return reportRepository.getCategoryPerformance(start, end);
    }

    public List<OrderStatusReport> getOrdersGroupedByStatus(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end   = LocalDate.parse(endDate.trim());
        return reportRepository.getOrdersGroupedByStatus(start, end);
    }


    public CustomerReportResponse getCustomerReport(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());
        return reportRepository.getCustomerReport(start, end);
    }
    public ProductPerformanceResponse getProductPerformance(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return reportRepository.getProductPerformance(start, end);
    }
    public DiscountPerformanceResponse getDiscountPerformance(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());
        return reportRepository.getDiscountPerformance(start, end);
    }



}
