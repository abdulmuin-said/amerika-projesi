package com.TechKun.dto.user_dtos;

import com.TechKun.dto.AddressDTO;

import lombok.Data;

@Data
public class UserUpdatePayload {
    private String fullName;
    private AddressDTO address;
}