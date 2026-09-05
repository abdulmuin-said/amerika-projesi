package com.TechKun.dto.report_dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SalesByPeriod {
    private String dateFormatted;
    private Double sales;
    private Integer totalOrders;
}



