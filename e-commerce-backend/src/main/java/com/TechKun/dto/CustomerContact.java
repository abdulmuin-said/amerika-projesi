package com.TechKun.dto;

import lombok.Data;

@Data
public class CustomerContact {
    private int customerId;
    private String customerName;
    private String phoneNumber;
    private String email;
}