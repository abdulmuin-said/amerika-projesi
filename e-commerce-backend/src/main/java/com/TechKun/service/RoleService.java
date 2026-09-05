package com.TechKun.service;

import java.util.List;

import com.TechKun.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TechKun.model.Role;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    public Role getRoleById(Integer id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No role found with ID: " + id));
    }
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }
    public Role updateRole(Integer id, Role role) {
        role.setRoleId(id);
        return roleRepository.save(role);
    }
    public void deleteRole(Integer id) {
        roleRepository.deleteById(id);
    }
}
