package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}
