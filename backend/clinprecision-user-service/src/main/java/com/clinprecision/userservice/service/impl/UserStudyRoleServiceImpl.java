package com.clinprecision.userservice.service.impl;


import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.dto.studydesign.StudyResponseDto;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import com.clinprecision.common.mapper.UserStudyRoleMapper;
import com.clinprecision.userservice.repository.RoleRepository;
import com.clinprecision.userservice.repository.UserStudyRoleRepository;
import com.clinprecision.userservice.repository.UsersRepository;
import com.clinprecision.userservice.service.StudyServiceClient;
import com.clinprecision.userservice.service.UserStudyRoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserStudyRoleServiceImpl implements UserStudyRoleService {
    
    private static final Logger log = LoggerFactory.getLogger(UserStudyRoleServiceImpl.class);
    
    private final UserStudyRoleRepository userStudyRoleRepository;
    private final UsersRepository usersRepository;
    private final RoleRepository roleRepository;
    private final UserStudyRoleMapper userStudyRoleMapper;
    private final StudyServiceClient studyServiceClient;

    @Autowired
    public UserStudyRoleServiceImpl(UserStudyRoleRepository userStudyRoleRepository,
                                   UsersRepository usersRepository,
                                   RoleRepository roleRepository,
                                   UserStudyRoleMapper userStudyRoleMapper,
                                   StudyServiceClient studyServiceClient) {
        this.userStudyRoleRepository = userStudyRoleRepository;
        this.usersRepository = usersRepository;
        this.roleRepository = roleRepository;
        this.userStudyRoleMapper = userStudyRoleMapper;
        this.studyServiceClient = studyServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserStudyRoleEntity> findHighestPriorityActiveRoleByUserId(Long userId) {
        return userStudyRoleRepository.findHighestPriorityActiveRoleByUserId(userId);
    }
    
    @Override
    public UserStudyRoleDto createUserStudyRole(UserStudyRoleDto userStudyRoleDto) {
        log.info("Creating user study role assignment: userId={}, studyId={}, roleId={}", 
                 userStudyRoleDto.getUserId(), userStudyRoleDto.getStudyId(), userStudyRoleDto.getRoleCode());
        
        // Validate the assignment
        validateUserStudyRoleAssignment(userStudyRoleDto);
        
        // Convert DTO to entity
        UserStudyRoleEntity entity = dtoToEntityWithRelations(userStudyRoleDto);
        
        // Save entity
        UserStudyRoleEntity savedEntity = userStudyRoleRepository.save(entity);
        
        // Convert back to DTO and return
        return userStudyRoleMapper.entityToDto(savedEntity);
    }
    
    @Override
    public UserStudyRoleDto updateUserStudyRole(Long id, UserStudyRoleDto userStudyRoleDto) {
        log.info("Updating user study role assignment: id={}", id);
        
        Optional<UserStudyRoleEntity> existingEntity = userStudyRoleRepository.findById(id);
        if (existingEntity.isEmpty()) {
            throw new RuntimeException("UserStudyRole not found with id: " + id);
        }
        
        // Validate the update
        validateUserStudyRoleAssignment(userStudyRoleDto);
        
        UserStudyRoleEntity entity = existingEntity.get();
        updateEntityFromDto(entity, userStudyRoleDto);
        
        UserStudyRoleEntity updatedEntity = userStudyRoleRepository.save(entity);
        return userStudyRoleMapper.entityToDto(updatedEntity);
    }
    
    @Override
    public void deleteUserStudyRole(Long id) {
        log.info("Deleting user study role assignment: id={}", id);
        
        if (!userStudyRoleRepository.existsById(id)) {
            throw new RuntimeException("UserStudyRole not found with id: " + id);
        }
        
        userStudyRoleRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserStudyRoleDto> findById(Long id) {
        return userStudyRoleRepository.findById(id)
                .map(userStudyRoleMapper::entityToDto)
                .map(this::enrichWithStudyInfo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> findAll() {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findAll();
        List<UserStudyRoleDto> dtos = entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
        return enrichWithStudyInfo(dtos);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> findByUserId(Long userId) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findByUser_Id(userId);
        List<UserStudyRoleDto> dtos = entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
        return enrichWithStudyInfo(dtos);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> findByStudyId(Long studyId) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findByStudyId(studyId);
        List<UserStudyRoleDto> dtos = entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
        return enrichWithStudyInfo(dtos);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> findActiveByStudyId(Long studyId) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findActiveByStudyId(studyId);
        List<UserStudyRoleDto> dtos = entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
        return enrichWithStudyInfo(dtos);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> findByUserIdAndStudyId(Long userId, Long studyId) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findByUser_Id(userId)
                .stream()
                .filter(entity -> studyId.equals(entity.getStudyId()))
                .collect(Collectors.toList());
        
        List<UserStudyRoleDto> dtos = entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
        return enrichWithStudyInfo(dtos);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserStudyRoleDto> findByUserIdAndStudyIdAndRoleId(Long userId, Long studyId, Long roleId) {
        return userStudyRoleRepository.findByUser_IdAndStudyIdAndRole_Id(userId, studyId, roleId)
                .map(userStudyRoleMapper::entityToDto)
                .map(this::enrichWithStudyInfo);
    }
    
    @Override
    public List<UserStudyRoleDto> createMultipleUserStudyRoles(List<UserStudyRoleDto> userStudyRoles) {
        log.info("Creating multiple user study role assignments: count={}", userStudyRoles.size());
        
        // Validate all assignments
        userStudyRoles.forEach(this::validateUserStudyRoleAssignment);
        
        // Convert to entities
        List<UserStudyRoleEntity> entities = userStudyRoles.stream()
                .map(this::dtoToEntityWithRelations)
                .collect(Collectors.toList());
        
        // Save all entities
        List<UserStudyRoleEntity> savedEntities = userStudyRoleRepository.saveAll(entities);
        
        // Convert back to DTOs
        return savedEntities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public void deactivateUserStudyRoles(List<Long> ids, LocalDate endDate) {
        log.info("Deactivating user study role assignments: ids={}, endDate={}", ids, endDate);
        
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findAllById(ids);
        entities.forEach(entity -> entity.setEndDate(endDate));
        userStudyRoleRepository.saveAll(entities);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveRoleInStudy(Long userId, Long studyId) {
        List<UserStudyRoleEntity> activeRoles = userStudyRoleRepository.findByUser_Id(userId)
                .stream()
                .filter(entity -> studyId.equals(entity.getStudyId()))
                .filter(entity -> entity.getStatus() == UserStudyRoleEntity.RoleStatus.ACTIVE)
                .collect(Collectors.toList());
        
        return !activeRoles.isEmpty();
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasRoleInStudy(Long userId, Long studyId, String roleName) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findByUser_Id(userId);
        return entities.stream()
                .anyMatch(entity -> studyId.equals(entity.getStudyId()) 
                         && roleName.equals(entity.getRole().getName())
                         && entity.getStatus() == UserStudyRoleEntity.RoleStatus.ACTIVE);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> getUserActiveRoles(Long userId) {
        List<UserStudyRoleEntity> entities = userStudyRoleRepository.findByUser_Id(userId)
                .stream()
                .filter(entity -> entity.getStatus() == UserStudyRoleEntity.RoleStatus.ACTIVE)
                .collect(Collectors.toList());
        
        return entities.stream()
                .map(userStudyRoleMapper::entityToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserStudyRoleDto> getStudyTeamMembers(Long studyId) {
        return findActiveByStudyId(studyId);
    }
    
    @Override
    public void validateUserStudyRoleAssignment(UserStudyRoleDto userStudyRoleDto) {
        // Validate user exists
        if (userStudyRoleDto.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (!usersRepository.existsById(userStudyRoleDto.getUserId())) {
            throw new RuntimeException("User not found with id: " + userStudyRoleDto.getUserId());
        }
        
        // Validate study ID exists (this could be enhanced with study service call)
        if (userStudyRoleDto.getStudyId() == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        
        // Validate role exists
        if (userStudyRoleDto.getRoleCode() == null || userStudyRoleDto.getRoleCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Role code is required");
        }
        
        // Additional business rule validations can be added here
        // For example: checking if user already has this role in the study
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canAssignRole(Long userId, Long studyId, Long roleId) {
        // Basic validation - can be enhanced with more business rules
        boolean userExists = usersRepository.existsById(userId);
        boolean roleExists = roleRepository.existsById(roleId);
        
        // Check if user already has this exact role assignment
        Optional<UserStudyRoleEntity> existingRole = userStudyRoleRepository
                .findByUser_IdAndStudyIdAndRole_Id(userId, studyId, roleId);
        boolean hasActiveAssignment = existingRole.isPresent() 
                && existingRole.get().getStatus() == UserStudyRoleEntity.RoleStatus.ACTIVE;
        
        return userExists && roleExists && !hasActiveAssignment;
    }
    
    // Helper methods
    private UserStudyRoleEntity dtoToEntityWithRelations(UserStudyRoleDto dto) {
        UserStudyRoleEntity entity = userStudyRoleMapper.dtoToEntity(dto);
        
        // Set user relationship
        UserEntity user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
        entity.setUser(user);
        
        // Set role relationship
        RoleEntity role = roleRepository.findByName(dto.getRoleCode());
        if (role == null) {
            throw new RuntimeException("Role not found with name: " + dto.getRoleCode());
        }
        entity.setRole(role);
        
        // Set study ID
        entity.setStudyId(dto.getStudyId());
        
        return entity;
    }
    
    private void updateEntityFromDto(UserStudyRoleEntity entity, UserStudyRoleDto dto) {
        // Update basic fields
        if (dto.getStartDate() != null) {
            entity.setStartDate(dto.getStartDate().toLocalDate());
        }
        if (dto.getEndDate() != null) {
            entity.setEndDate(dto.getEndDate().toLocalDate());
        }
        
        // Update relationships if they've changed
        if (!dto.getRoleCode().equals(entity.getRole().getName())) {
            RoleEntity role = roleRepository.findByName(dto.getRoleCode());
            if (role == null) {
                throw new RuntimeException("Role not found with name: " + dto.getRoleCode());
            }
            entity.setRole(role);
        }
    }
    
    /**
     * Enriches UserStudyRoleDto with study information by calling the Study service
     */
    private UserStudyRoleDto enrichWithStudyInfo(UserStudyRoleDto dto) {
        if (dto.getStudyId() != null) {
            try {
                ResponseEntity<StudyResponseDto> response = studyServiceClient.getStudyById(dto.getStudyId(), "");
                if (response != null && response.getBody() != null) {
                    StudyResponseDto study = response.getBody();
                    if (study != null) {
                        String studyName = study.getName() != null ? study.getName() : study.getTitle();
                        dto.setStudyName(studyName != null ? studyName : "Unknown Study");
                        dto.setStudyCode(study.getProtocolNumber());
                    } else {
                        dto.setStudyName("Unknown Study");
                    }
                } else {
                    dto.setStudyName("Unknown Study");
                }
            } catch (Exception e) {
                log.warn("Failed to fetch study details for studyId {}: {}", dto.getStudyId(), e.getMessage());
                // Don't fail the entire operation if study info can't be fetched
                dto.setStudyName("Unknown Study");
            }
        }
        return dto;
    }
    
    /**
     * Enriches a list of UserStudyRoleDtos with study information
     */
    private List<UserStudyRoleDto> enrichWithStudyInfo(List<UserStudyRoleDto> dtos) {
        return dtos.stream()
                .map(this::enrichWithStudyInfo)
                .collect(Collectors.toList());
    }
}
