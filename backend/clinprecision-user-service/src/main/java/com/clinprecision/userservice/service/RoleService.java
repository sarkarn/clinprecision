package com.clinprecision.userservice.service;

import com.clinprecision.common.dto.RoleDto;

import java.util.List;

public interface RoleService {

    public List<RoleDto> getAllRoles();

    public List<RoleDto> getSystemRoles();

    public List<RoleDto> getNonSystemRoles();
}
