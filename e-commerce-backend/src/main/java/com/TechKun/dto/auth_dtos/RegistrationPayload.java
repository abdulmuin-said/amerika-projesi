package com.TechKun.dto.auth_dtos;

import com.TechKun.dto.AddressDTO;

import lombok.Data;

@Data
public class RegistrationPayload {
    private String email;
    private String password;
    private String fullName;
    private String phoneNo;
    private AddressDTO address;
    private Integer roleId;
}