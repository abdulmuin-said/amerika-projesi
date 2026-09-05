package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.ShopUser;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ShopUserRepository extends JpaRepository<ShopUser, Integer>, JpaSpecificationExecutor<ShopUser> {
    boolean existsByEmail(String email);
    Optional<ShopUser> findByEmail(String email);
}
