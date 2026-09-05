package com.TechKun.dto.auth_dtos;

import lombok.Data;

@Data
public class LoginPayload {
    private String email;
    private String password;
}