package com.clinprecision.adminservice.service;

import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.entity.UserStudyRoleEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserStudyRoleService {
    
    // Existing method
    Optional<UserStudyRoleEntity> findHighestPriorityActiveRoleByUserId(Long userId);
    
    // CRUD Operations
    UserStudyRoleDto createUserStudyRole(UserStudyRoleDto userStudyRoleDto);
    UserStudyRoleDto updateUserStudyRole(Long id, UserStudyRoleDto userStudyRoleDto);
    void deleteUserStudyRole(Long id);
    Optional<UserStudyRoleDto> findById(Long id);
    
    // Query Operations
    List<UserStudyRoleDto> findAll();
    List<UserStudyRoleDto> findByUserId(Long userId);
    List<UserStudyRoleDto> findByStudyId(Long studyId);
    List<UserStudyRoleDto> findActiveByStudyId(Long studyId);
    List<UserStudyRoleDto> findByUserIdAndStudyId(Long userId, Long studyId);
    Optional<UserStudyRoleDto> findByUserIdAndStudyIdAndRoleId(Long userId, Long studyId, Long roleId);
    
    // Bulk Operations
    List<UserStudyRoleDto> createMultipleUserStudyRoles(List<UserStudyRoleDto> userStudyRoles);
    void deactivateUserStudyRoles(List<Long> ids, LocalDate endDate);
    
    // Business Logic Operations
    boolean hasActiveRoleInStudy(Long userId, Long studyId);
    boolean hasRoleInStudy(Long userId, Long studyId, String roleName);
    List<UserStudyRoleDto> getUserActiveRoles(Long userId);
    List<UserStudyRoleDto> getStudyTeamMembers(Long studyId);
    
    // Validation
    void validateUserStudyRoleAssignment(UserStudyRoleDto userStudyRoleDto);
    boolean canAssignRole(Long userId, Long studyId, Long roleId);
}
