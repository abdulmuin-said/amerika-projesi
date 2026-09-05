package com.TechKun.dto.auth_dtos;

import lombok.Data;

@Data
public class ChangePasswordPayload {
    private String currentPassword;
    private String newPassword;
}