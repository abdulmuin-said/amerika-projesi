package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.TechKun.model.enums.UserRole;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Set;

@Entity
@Table(name = "ShopUser")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ShopUser implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_no", nullable = false)
    private String phoneNo;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "address_id")
    private Address address;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "joined_at", nullable = false)
    private LocalDate joinedAt;

    @Column(name = "removed", nullable = false)
    private Boolean removed;

    public boolean isAdmin() {
        return this.role.getName() == UserRole.ADMIN || this.role.getName() == UserRole.PLATFORM_ADMIN;
    }

    public ShopUser() {
        this.joinedAt = LocalDate.now();
        this.removed = false;
    }

    public ShopUser(Integer userId) {
        this();
        this.userId = userId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(this.role);
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return !this.removed;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !this.removed;
    }

    @Override
    public boolean isEnabled() {
        return !this.removed;
    }
}
