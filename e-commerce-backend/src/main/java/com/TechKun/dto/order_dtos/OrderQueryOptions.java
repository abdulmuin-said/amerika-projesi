package com.TechKun.dto.order_dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

import com.TechKun.dto.SortOption;

@Data
public class OrderQueryOptions {
    private List<String> statuses;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String customerName;
    private String trackingNumber;
    private SortOption sortBy;
}