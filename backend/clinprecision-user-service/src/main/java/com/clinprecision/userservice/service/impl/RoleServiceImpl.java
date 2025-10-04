package com.clinprecision.userservice.service.impl;


import com.clinprecision.common.dto.RoleDto;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.userservice.repository.RoleRepository;
import com.clinprecision.userservice.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleDto> getAllRoles() {
        List<RoleEntity> roles = (List<RoleEntity>) roleRepository.findAll();
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<RoleDto> getSystemRoles() {
        List<RoleEntity> roles = roleRepository.findByIsSystemRole(true);
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<RoleDto> getNonSystemRoles() {
        List<RoleEntity> roles = roleRepository.findByIsSystemRole(false);
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private RoleDto convertToDto(RoleEntity role) {
        return new RoleDto(role.getId(), role.getName(), role.isSystemRole());
    }
}
