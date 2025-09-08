package com.clinprecision.userservice.service;

import com.clinprecision.userservice.data.RoleEntity;
import com.clinprecision.userservice.data.RoleRepository;
import com.clinprecision.userservice.shared.dto.RoleDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleDto> getAllRoles() {
        List<RoleEntity> roles = (List<RoleEntity>) roleRepository.findAll();
        return roles.stream()
                .map(role -> new RoleDto(role.getId(), role.getName()))
                .collect(Collectors.toList());
    }
}
