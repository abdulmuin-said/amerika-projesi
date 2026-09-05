package com.TechKun.dto.support_ticket_dtos;

import com.TechKun.dto.CustomerContact;

import lombok.Data;

@Data
public class SupportTicketDetails {
    private Integer ticketId;
    private String subject;
    private String description;
    private String status;
    private CustomerContact customer;
}