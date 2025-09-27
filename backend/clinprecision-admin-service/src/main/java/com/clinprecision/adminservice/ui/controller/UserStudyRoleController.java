package com.clinprecision.adminservice.ui.controller;

import com.clinprecision.adminservice.service.UserStudyRoleService;
import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import com.clinprecision.common.mapper.UserStudyRoleMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for User Study Role Management
 * Handles CRUD operations and business logic for user-study-role assignments
 */
@RestController
@RequestMapping("/api/user-study-roles")
public class UserStudyRoleController {

    private static final Logger log = LoggerFactory.getLogger(UserStudyRoleController.class);

    @Autowired
    UserStudyRoleService userStudyRoleService;
    
    @Autowired
    UserStudyRoleMapper userStudyRoleMapper;

    /**
     * Legacy endpoint for backward compatibility
     */
    @GetMapping(value="/users/{userId}/highest-priority", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserId(@PathVariable Long userId) {
        log.info("Finding highest priority active role for user: {}", userId);
        
        Optional<UserStudyRoleEntity> userStudyRoleEntity = userStudyRoleService.findHighestPriorityActiveRoleByUserId(userId);
        
        // Convert entity to DTO
        Optional<UserStudyRoleDto> userStudyRoleDto = userStudyRoleEntity
            .map(entity -> userStudyRoleMapper.entityToDto(entity));
        
        return ResponseEntity.ok().body(userStudyRoleDto);
    }
    
    /**
     * Get all user study role assignments
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getAllUserStudyRoles() {
        log.info("Finding all user study role assignments");
        
        try {
            List<UserStudyRoleDto> assignments = userStudyRoleService.findAll();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error finding all user study role assignments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create a new user study role assignment
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserStudyRoleDto> createUserStudyRole(@Valid @RequestBody UserStudyRoleDto userStudyRoleDto) {
        log.info("Creating user study role assignment: userId={}, studyId={}, roleCode={}", 
                 userStudyRoleDto.getUserId(), userStudyRoleDto.getStudyId(), userStudyRoleDto.getRoleCode());
        
        try {
            UserStudyRoleDto created = userStudyRoleService.createUserStudyRole(userStudyRoleDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating user study role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating user study role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update an existing user study role assignment
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserStudyRoleDto> updateUserStudyRole(@PathVariable Long id, @Valid @RequestBody UserStudyRoleDto userStudyRoleDto) {
        log.info("Updating user study role assignment: id={}", id);
        
        try {
            UserStudyRoleDto updated = userStudyRoleService.updateUserStudyRole(id, userStudyRoleDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.warn("Error updating user study role with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating user study role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a user study role assignment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserStudyRole(@PathVariable Long id) {
        log.info("Deleting user study role assignment: id={}", id);
        
        try {
            userStudyRoleService.deleteUserStudyRole(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("Error deleting user study role with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting user study role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a user study role assignment by ID
     */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserStudyRoleDto> getUserStudyRoleById(@PathVariable Long id) {
        log.info("Finding user study role assignment by id: {}", id);
        
        Optional<UserStudyRoleDto> userStudyRole = userStudyRoleService.findById(id);
        return userStudyRole.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get all role assignments for a specific user
     */
    @GetMapping(value = "/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getUserRoleAssignments(@PathVariable Long userId) {
        log.info("Finding role assignments for user: {}", userId);
        
        try {
            List<UserStudyRoleDto> assignments = userStudyRoleService.findByUserId(userId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error finding role assignments for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all role assignments for a specific study
     */
    @GetMapping(value = "/studies/{studyId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getStudyRoleAssignments(@PathVariable Long studyId) {
        log.info("Finding role assignments for study: {}", studyId);
        
        try {
            List<UserStudyRoleDto> assignments = userStudyRoleService.findByStudyId(studyId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error finding role assignments for study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get active role assignments for a specific study
     */
    @GetMapping(value = "/studies/{studyId}/active", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getActiveStudyRoleAssignments(@PathVariable Long studyId) {
        log.info("Finding active role assignments for study: {}", studyId);
        
        try {
            List<UserStudyRoleDto> assignments = userStudyRoleService.findActiveByStudyId(studyId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error finding active role assignments for study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get role assignments for a specific user in a specific study
     */
    @GetMapping(value = "/users/{userId}/studies/{studyId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getUserStudyRoleAssignments(@PathVariable Long userId, @PathVariable Long studyId) {
        log.info("Finding role assignments for user {} in study {}", userId, studyId);
        
        try {
            List<UserStudyRoleDto> assignments = userStudyRoleService.findByUserIdAndStudyId(userId, studyId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error finding role assignments for user in study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all active roles for a specific user across all studies
     */
    @GetMapping(value = "/users/{userId}/active", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getUserActiveRoles(@PathVariable Long userId) {
        log.info("Finding active roles for user: {}", userId);
        
        try {
            List<UserStudyRoleDto> activeRoles = userStudyRoleService.getUserActiveRoles(userId);
            return ResponseEntity.ok(activeRoles);
        } catch (Exception e) {
            log.error("Error finding active roles for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get study team members (all active role assignments for a study)
     */
    @GetMapping(value = "/studies/{studyId}/team", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> getStudyTeamMembers(@PathVariable Long studyId) {
        log.info("Finding team members for study: {}", studyId);
        
        try {
            List<UserStudyRoleDto> teamMembers = userStudyRoleService.getStudyTeamMembers(studyId);
            return ResponseEntity.ok(teamMembers);
        } catch (Exception e) {
            log.error("Error finding team members for study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create multiple user study role assignments in bulk
     */
    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<UserStudyRoleDto>> createMultipleUserStudyRoles(@Valid @RequestBody List<UserStudyRoleDto> userStudyRoles) {
        log.info("Creating multiple user study role assignments: count={}", userStudyRoles.size());
        
        try {
            List<UserStudyRoleDto> created = userStudyRoleService.createMultipleUserStudyRoles(userStudyRoles);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating multiple user study roles: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating multiple user study roles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Deactivate multiple user study role assignments
     */
    @PutMapping("/bulk/deactivate")
    public ResponseEntity<Void> deactivateUserStudyRoles(@RequestBody DeactivationRequest request) {
        log.info("Deactivating user study role assignments: ids={}, endDate={}", request.getIds(), request.getEndDate());
        
        try {
            userStudyRoleService.deactivateUserStudyRoles(request.getIds(), request.getEndDate());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deactivating user study roles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Check if user has active role in study
     */
    @GetMapping(value = "/users/{userId}/studies/{studyId}/has-active-role", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> hasActiveRoleInStudy(@PathVariable Long userId, @PathVariable Long studyId) {
        log.info("Checking if user {} has active role in study {}", userId, studyId);
        
        try {
            boolean hasRole = userStudyRoleService.hasActiveRoleInStudy(userId, studyId);
            return ResponseEntity.ok(hasRole);
        } catch (Exception e) {
            log.error("Error checking active role in study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Check if user has specific role in study
     */
    @GetMapping(value = "/users/{userId}/studies/{studyId}/roles/{roleName}/has-role", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> hasRoleInStudy(@PathVariable Long userId, @PathVariable Long studyId, @PathVariable String roleName) {
        log.info("Checking if user {} has role {} in study {}", userId, roleName, studyId);
        
        try {
            boolean hasRole = userStudyRoleService.hasRoleInStudy(userId, studyId, roleName);
            return ResponseEntity.ok(hasRole);
        } catch (Exception e) {
            log.error("Error checking role in study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Request class for bulk deactivation
     */
    public static class DeactivationRequest {
        private List<Long> ids;
        private LocalDate endDate;
        
        public List<Long> getIds() { return ids; }
        public void setIds(List<Long> ids) { this.ids = ids; }
        
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }
}
