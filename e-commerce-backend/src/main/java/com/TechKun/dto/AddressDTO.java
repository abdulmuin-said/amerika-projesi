package com.TechKun.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private String street;
    private String city;
    private Integer pincode;
    private String country;
}
