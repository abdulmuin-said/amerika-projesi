package com.TechKun.dto;

import com.TechKun.model.Address;
import com.TechKun.model.enums.UserRole;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserEssentials {
    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNo;
    private Address address;
    private Integer roleId;
    private UserRole roleName;
    private LocalDate joinedAt;
}
