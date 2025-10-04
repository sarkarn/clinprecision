package com.clinprecision.clinopsservice.mapper;



import com.clinprecision.common.dto.clinops.*;
import com.clinprecision.common.entity.clinops.*;
import com.clinprecision.clinopsservice.service.RegulatoryStatusService;
import com.clinprecision.clinopsservice.service.StudyPhaseService;
import com.clinprecision.clinopsservice.service.StudyStatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper component for converting between entities and DTOs
 * Manual implementation for better control and performance
 */
@Component
public class StudyMapper {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyMapper.class);
    
    private final StudyStatusService studyStatusService;
    private final RegulatoryStatusService regulatoryStatusService;
    private final StudyPhaseService studyPhaseService;
    
    public StudyMapper(StudyStatusService studyStatusService,
                      RegulatoryStatusService regulatoryStatusService,
                      StudyPhaseService studyPhaseService) {
        this.studyStatusService = studyStatusService;
        this.regulatoryStatusService = regulatoryStatusService;
        this.studyPhaseService = studyPhaseService;
    }
    
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
        entity.setSponsor(dto.getSponsor());
        entity.setDescription(dto.getDescription());
        entity.setIndication(dto.getIndication());
        entity.setStudyType(dto.getStudyType());
        entity.setPrincipalInvestigator(dto.getPrincipalInvestigator());
        entity.setSites(dto.getSites());
        entity.setPlannedSubjects(dto.getPlannedSubjects());
        entity.setEnrolledSubjects(dto.getEnrolledSubjects());
        entity.setTargetEnrollment(dto.getTargetEnrollment());
        entity.setPrimaryObjective(dto.getPrimaryObjective());
        entity.setAmendments(dto.getAmendments());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setMetadata(dto.getMetadata());
        
        // Handle lookup table relationships
        if (dto.getStudyStatusId() != null) {
            studyStatusService.findEntityById(dto.getStudyStatusId())
                .ifPresent(entity::setStudyStatus);
        } else {
            // Set default draft status if no status provided
            studyStatusService.getDefaultDraftStatus()
                .ifPresent(entity::setStudyStatus);
        }
        
        if (dto.getStudyPhaseId() != null) {
            studyPhaseService.findEntityById(dto.getStudyPhaseId())
                .ifPresent(entity::setStudyPhase);
        }
        
        if (dto.getRegulatoryStatusId() != null) {
            regulatoryStatusService.findEntityById(dto.getRegulatoryStatusId())
                .ifPresent(entity::setRegulatoryStatus);
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
        dto.setIndication(entity.getIndication());
        dto.setStudyType(entity.getStudyType());
        dto.setPrincipalInvestigator(entity.getPrincipalInvestigator());
        dto.setSites(entity.getSites());
        dto.setPlannedSubjects(entity.getPlannedSubjects());
        dto.setEnrolledSubjects(entity.getEnrolledSubjects());
        dto.setTargetEnrollment(entity.getTargetEnrollment());
        dto.setPrimaryObjective(entity.getPrimaryObjective());
        dto.setAmendments(entity.getAmendments());
        dto.setModifiedBy(entity.getModifiedBy());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setMetadata(entity.getMetadata());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Convert lookup table relationships to DTOs
        if (entity.getStudyStatus() != null) {
            StudyStatusDto statusDto = new StudyStatusDto();
            statusDto.setId(entity.getStudyStatus().getId());
            statusDto.setCode(entity.getStudyStatus().getCode());
            statusDto.setName(entity.getStudyStatus().getName());
            statusDto.setDescription(entity.getStudyStatus().getDescription());
            statusDto.setDisplayOrder(entity.getStudyStatus().getDisplayOrder());
            statusDto.setIsActive(entity.getStudyStatus().getIsActive());
            statusDto.setAllowsModification(entity.getStudyStatus().getAllowsModification());
            statusDto.setIsFinalStatus(entity.getStudyStatus().getIsFinalStatus());
            dto.setStudyStatus(statusDto);
            
            // Set legacy status field for backward compatibility
            dto.setStatus(entity.getStudyStatus().getCode());
        } else {
            // Set default status if null to prevent "unknown" display
            logger.warn("Study {} has null status, defaulting to DRAFT", entity.getId());
            dto.setStatus("DRAFT");
        }
        
        if (entity.getStudyPhase() != null) {
            StudyPhaseDto phaseDto = new StudyPhaseDto();
            phaseDto.setId(entity.getStudyPhase().getId());
            phaseDto.setCode(entity.getStudyPhase().getCode());
            phaseDto.setName(entity.getStudyPhase().getName());
            phaseDto.setDescription(entity.getStudyPhase().getDescription());
            phaseDto.setPhaseCategory(entity.getStudyPhase().getPhaseCategory().toString());
            phaseDto.setTypicalPatientCountMin(entity.getStudyPhase().getTypicalPatientCountMin());
            phaseDto.setTypicalPatientCountMax(entity.getStudyPhase().getTypicalPatientCountMax());
            phaseDto.setTypicalDurationMonths(entity.getStudyPhase().getTypicalDurationMonths());
            phaseDto.setRequiresIde(entity.getStudyPhase().getRequiresIde());
            phaseDto.setRequiresInd(entity.getStudyPhase().getRequiresInd());
            phaseDto.setDisplayOrder(entity.getStudyPhase().getDisplayOrder());
            phaseDto.setIsActive(entity.getStudyPhase().getIsActive());
            dto.setStudyPhase(phaseDto);
            
            // Set legacy phase field for backward compatibility
            dto.setPhase(entity.getStudyPhase().getName());
        }
        
        if (entity.getRegulatoryStatus() != null) {
            RegulatoryStatusDto regStatusDto = new RegulatoryStatusDto();
            regStatusDto.setId(entity.getRegulatoryStatus().getId());
            regStatusDto.setCode(entity.getRegulatoryStatus().getCode());
            regStatusDto.setName(entity.getRegulatoryStatus().getName());
            regStatusDto.setDescription(entity.getRegulatoryStatus().getDescription());
            regStatusDto.setRegulatoryCategory(entity.getRegulatoryStatus().getRegulatoryCategory().toString());
            regStatusDto.setAllowsEnrollment(entity.getRegulatoryStatus().getAllowsEnrollment());
            regStatusDto.setRequiresDocumentation(entity.getRegulatoryStatus().getRequiresDocumentation());
            regStatusDto.setDisplayOrder(entity.getRegulatoryStatus().getDisplayOrder());
            regStatusDto.setIsActive(entity.getRegulatoryStatus().getIsActive());
            dto.setRegulatoryStatus(regStatusDto);
        }

        // Convert organization studies
        if (entity.getOrganizationStudies() != null && !entity.getOrganizationStudies().isEmpty()) {
            dto.setOrganizations(entity.getOrganizationStudies().stream()
                .map(this::toOrganizationStudyDto)
                .collect(Collectors.toList()));
        }
        
        // Map new overview fields
        dto.setTitle(entity.getName()); // Alias for frontend compatibility
        dto.setProtocol(entity.getProtocolNumber()); // Alias for frontend compatibility
        dto.setVersionStatus(entity.getIsLocked() != null && entity.getIsLocked() ? "LOCKED" : "APPROVED"); // Simple version status logic
        dto.setTherapeuticArea(entity.getTherapeuticArea());
        dto.setStudyCoordinator(entity.getStudyCoordinator());
        dto.setActiveSites(entity.getActiveSites());
        dto.setScreenedSubjects(entity.getScreenedSubjects());
        dto.setRandomizedSubjects(entity.getRandomizedSubjects());
        dto.setCompletedSubjects(entity.getCompletedSubjects());
        dto.setWithdrawnSubjects(entity.getWithdrawnSubjects());
        dto.setEstimatedCompletion(entity.getEstimatedCompletion());
        dto.setPrimaryEndpoint(entity.getPrimaryEndpoint());
        dto.setSecondaryEndpoints(entity.getSecondaryEndpoints());
        dto.setInclusionCriteria(entity.getInclusionCriteria());
        dto.setExclusionCriteria(entity.getExclusionCriteria());
        dto.setTimeline(entity.getTimeline());
        dto.setEnrollmentRate(entity.getEnrollmentRate());
        dto.setScreeningSuccessRate(entity.getScreeningSuccessRate());
        dto.setRetentionRate(entity.getRetentionRate());
        dto.setComplianceRate(entity.getComplianceRate());
        dto.setQueryRate(entity.getQueryRate());
        dto.setRecentActivities(entity.getRecentActivities());
        
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
      
        if (dto.getSponsor() != null) {
            entity.setSponsor(dto.getSponsor());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        if (dto.getIndication() != null) {
            entity.setIndication(dto.getIndication());
        }
        if (dto.getStudyType() != null) {
            entity.setStudyType(dto.getStudyType());
        }
        if (dto.getPrincipalInvestigator() != null) {
            entity.setPrincipalInvestigator(dto.getPrincipalInvestigator());
        }
        if (dto.getSites() != null) {
            entity.setSites(dto.getSites());
        }
        if (dto.getPlannedSubjects() != null) {
            entity.setPlannedSubjects(dto.getPlannedSubjects());
        }
        if (dto.getEnrolledSubjects() != null) {
            entity.setEnrolledSubjects(dto.getEnrolledSubjects());
        }
        if (dto.getTargetEnrollment() != null) {
            entity.setTargetEnrollment(dto.getTargetEnrollment());
        }
        if (dto.getPrimaryObjective() != null) {
            entity.setPrimaryObjective(dto.getPrimaryObjective());
        }
        if (dto.getAmendments() != null) {
            entity.setAmendments(dto.getAmendments());
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
        
        // Update lookup table relationships
        if (dto.getStudyStatusId() != null) {
            StudyStatusEntity studyStatus = studyStatusService.findEntityById(dto.getStudyStatusId()).orElse(null);
            if (studyStatus != null) {
                entity.setStudyStatus(studyStatus);
            } else {
                logger.warn("StudyStatusId {} not found, keeping existing status for study {}", 
                           dto.getStudyStatusId(), entity.getId());
            }
        } else {
            // DTO doesn't include statusId - preserve existing status (don't clear it)
            logger.debug("StudyStatusId not in DTO, preserving existing status for study {}", entity.getId());
            // IMPORTANT: Don't call entity.setStudyStatus() here - keep existing value
        }
        
        if (dto.getStudyPhaseId() != null) {
            StudyPhaseEntity studyPhase = studyPhaseService.findEntityById(dto.getStudyPhaseId()).orElse(null);
            if (studyPhase != null) {
                entity.setStudyPhase(studyPhase);
            }
        }
        
        if (dto.getRegulatoryStatusId() != null) {
            RegulatoryStatusEntity regulatoryStatus = regulatoryStatusService.findEntityById(dto.getRegulatoryStatusId()).orElse(null);
            if (regulatoryStatus != null) {
                entity.setRegulatoryStatus(regulatoryStatus);
            }
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
            entity.setRole(OrganizationRole.valueOf(dto.getRole().toUpperCase()));
        }
        
        // Set isPrimary field
        entity.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false);
        
        return entity;
    }
}
