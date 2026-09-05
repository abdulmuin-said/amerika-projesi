package com.TechKun.dto.support_ticket_dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SupportTicketQueryOptions {
    private String status;
    private String customerName;
    private LocalDate fromDate;
    private LocalDate toDate;
}