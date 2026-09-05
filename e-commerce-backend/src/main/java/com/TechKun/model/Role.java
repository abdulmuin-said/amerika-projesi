package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.persistence.Id;
import org.springframework.security.core.GrantedAuthority;

import com.TechKun.model.enums.UserRole;


@Entity
@Data
@Table(name = "Role")
public class Role implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true)
    private UserRole name;

    @Override
    public String getAuthority() {
        return this.name != null ? this.name.name() : null;
    }
}
