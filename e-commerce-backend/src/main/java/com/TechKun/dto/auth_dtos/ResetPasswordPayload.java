package com.TechKun.dto.auth_dtos;

import lombok.Data;

@Data
public class ResetPasswordPayload {
    private String token;
    private String newPassword;
}