package com.TechKun.dto.report_dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class CustomerReportResponse {
    private int customersOnboarded;
    private int activeCustomers;
    private List<TopCustomer> topCustomers;
}
