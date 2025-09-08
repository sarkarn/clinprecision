package com.clinprecision.userservice.ui.controllers;

import com.clinprecision.userservice.shared.dto.RoleDto;
import com.clinprecision.userservice.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RoleController {

	private final RoleService roleService;

	@Autowired
	public RoleController(RoleService roleService) {
		this.roleService = roleService;
	}

	@GetMapping(produces = { MediaType.APPLICATION_JSON_VALUE })
	public List<RoleDto> getAllRoles() {
		return roleService.getAllRoles();
	}
}
