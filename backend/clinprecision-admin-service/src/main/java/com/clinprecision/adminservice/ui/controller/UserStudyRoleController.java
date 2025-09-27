package com.clinprecision.adminservice.ui.controller;

import com.clinprecision.adminservice.service.UserStudyRoleService;
import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import com.clinprecision.common.mapper.UserStudyRoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/users/study")
public class UserStudyRoleController {

    @Autowired
    UserStudyRoleService userStudyRoleService;
    
    @Autowired
    UserStudyRoleMapper userStudyRoleMapper;

    @GetMapping(value="/{userId}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserId(@PathVariable Long userId) {
        Optional<UserStudyRoleEntity> userStudyRoleEntity = userStudyRoleService.findHighestPriorityActiveRoleByUserId(userId);
        
        // Convert entity to DTO
        Optional<UserStudyRoleDto> userStudyRoleDto = userStudyRoleEntity
            .map(entity -> userStudyRoleMapper.entityToDto(entity));
        
        return ResponseEntity.ok().body(userStudyRoleDto);
    }
}
