package com.TechKun.dto.support_ticket_dtos;

import lombok.Data;

@Data
public class SupportTicketDTO {
    private String subject;
    private String description;
    private String status;
}