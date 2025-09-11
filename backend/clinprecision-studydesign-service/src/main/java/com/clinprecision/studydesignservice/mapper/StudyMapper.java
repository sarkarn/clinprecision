package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.*;
import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper component for converting between entities and DTOs
 * Manual implementation for better control and performance
 */
@Component
public class StudyMapper {
    
    /**
     * Convert StudyCreateRequestDto to StudyEntity
     */
    public StudyEntity toEntity(StudyCreateRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        StudyEntity entity = new StudyEntity();
        entity.setName(dto.getName());
        entity.setProtocolNumber(dto.getProtocolNumber());
        entity.setPhase(dto.getPhase());
        entity.setSponsor(dto.getSponsor());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setMetadata(dto.getMetadata());
        
        // Convert status string to enum
        if (dto.getStatus() != null) {
            entity.setStatus(com.clinprecision.studydesignservice.entity.StudyStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        
        return entity;
    }
    
    /**
     * Convert StudyEntity to StudyResponseDto
     */
    public StudyResponseDto toResponseDto(StudyEntity entity) {
        if (entity == null) {
            return null;
        }
        
        StudyResponseDto dto = new StudyResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setSponsor(entity.getSponsor());
        dto.setProtocolNumber(entity.getProtocolNumber());
        dto.setVersion(entity.getVersion());
        dto.setIsLatestVersion(entity.getIsLatestVersion());
        dto.setParentVersionId(entity.getParentVersionId());
        dto.setVersionNotes(entity.getVersionNotes());
        dto.setIsLocked(entity.getIsLocked());
        dto.setPhase(entity.getPhase());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setMetadata(entity.getMetadata());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Convert status enum to string
        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name().toLowerCase());
        }
        
        // Convert organization studies
        if (entity.getOrganizationStudies() != null && !entity.getOrganizationStudies().isEmpty()) {
            dto.setOrganizations(entity.getOrganizationStudies().stream()
                .map(this::toOrganizationStudyDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    /**
     * Convert list of StudyEntity to list of StudyResponseDto
     */
    public List<StudyResponseDto> toResponseDtoList(List<StudyEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Update StudyEntity from StudyUpdateRequestDto
     */
    public void updateEntityFromDto(StudyUpdateRequestDto dto, StudyEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Update only non-null fields from DTO
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getProtocolNumber() != null) {
            entity.setProtocolNumber(dto.getProtocolNumber());
        }
        if (dto.getPhase() != null) {
            entity.setPhase(dto.getPhase());
        }
        if (dto.getSponsor() != null) {
            entity.setSponsor(dto.getSponsor());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        if (dto.getStartDate() != null) {
            entity.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            entity.setEndDate(dto.getEndDate());
        }
        if (dto.getMetadata() != null) {
            entity.setMetadata(dto.getMetadata());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(com.clinprecision.studydesignservice.entity.StudyStatus.valueOf(dto.getStatus().toUpperCase()));
        }
    }
    
    /**
     * Convert OrganizationStudyEntity to OrganizationStudyDto
     */
    public OrganizationStudyDto toOrganizationStudyDto(OrganizationStudyEntity entity) {
        if (entity == null) {
            return null;
        }
        
        OrganizationStudyDto dto = new OrganizationStudyDto();
        dto.setId(entity.getId());
        dto.setOrganizationId(entity.getOrganizationId());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Convert role enum to string
        if (entity.getRole() != null) {
            dto.setRole(entity.getRole().name().toLowerCase());
        }
        
        // Set isPrimary field
        dto.setIsPrimary(entity.getIsPrimary());
        
        return dto;
    }
    
    /**
     * Convert OrganizationAssignmentDto to OrganizationStudyEntity
     */
    public OrganizationStudyEntity toOrganizationStudyEntity(OrganizationAssignmentDto dto, StudyEntity study) {
        if (dto == null) {
            return null;
        }
        
        OrganizationStudyEntity entity = new OrganizationStudyEntity();
        entity.setOrganizationId(dto.getOrganizationId());
        entity.setStudy(study);
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        
        // Convert role string to enum
        if (dto.getRole() != null) {
            entity.setRole(com.clinprecision.studydesignservice.entity.OrganizationRole.valueOf(dto.getRole().toUpperCase()));
        }
        
        // Set isPrimary field
        entity.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false);
        
        return entity;
    }
}
