package com.clinprecision.adminservice.ui.controller;

import com.clinprecision.adminservice.service.UserStudyRoleService;
import com.clinprecision.adminservice.service.UsersService;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/users/study")
public class UserStudyRoleController {

    @Autowired
    UserStudyRoleService userStudyRoleService;

    @GetMapping(value="/{userId}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    ResponseEntity<Optional<UserStudyRoleEntity>> findHighestPriorityActiveRoleByUserId(Long userId){
        Optional<UserStudyRoleEntity> userStudyRoleEntity = userStudyRoleService.findHighestPriorityActiveRoleByUserId(userId);
        return ResponseEntity.ok().body(userStudyRoleEntity);
    }
}
