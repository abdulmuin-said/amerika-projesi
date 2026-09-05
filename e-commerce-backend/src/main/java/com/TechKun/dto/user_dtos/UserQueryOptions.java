package com.TechKun.dto.user_dtos;

import lombok.Data;

@Data
public class UserQueryOptions {
    private String fullName;
    private String phoneNo;
    private String email;
    private String city;
    private String country;
}
