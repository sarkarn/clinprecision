package com.clinprecision.adminservice.service;


import com.clinprecision.adminservice.repository.RoleRepository;
import com.clinprecision.common.dto.RoleDto;
import com.clinprecision.common.entity.RoleEntity;
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
