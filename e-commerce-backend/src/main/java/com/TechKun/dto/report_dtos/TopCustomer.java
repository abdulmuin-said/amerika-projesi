package com.TechKun.dto.report_dtos;

import com.TechKun.model.Address;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopCustomer {
    private Long userId;
    private String fullName;
    private double totalSpent;
    private int orderedItems;
    private String phoneNo;
    private String email;
    private Address address;
}
