package com.TechKun.dto.auth_dtos;

import com.TechKun.dto.UserEssentials;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenPayload {
    private String message;
    private String token;
    private long expiresAt;
    private UserEssentials user;
}
