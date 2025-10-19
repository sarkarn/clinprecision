package com.clinprecision.clinopsservice.studydesign.studymgmt.mapper;

import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting Study Entity to Response DTOs
 * 
 * This mapper converts database entities to HTTP response DTOs for CQRS read operations.
 * It maps from the relational model (StudyEntity) to the API contract (DTOs).
 */
@Component
@Slf4j
public class StudyResponseMapper {
    
    /**
     * Convert StudyEntity to full StudyResponseDto
     * Used for GET /api/studies/{uuid} endpoints
     * 
     * @param entity Study entity from database
     * @return StudyResponseDto with all study details
     */
    public StudyResponseDto toResponseDto(StudyEntity entity) {
        if (entity == null) {
            return null;
        }
        
        log.debug("Mapping StudyEntity to StudyResponseDto for study ID: {}", entity.getId());
        
        return StudyResponseDto.builder()
                .studyAggregateUuid(entity.getAggregateUuid())
                .id(entity.getId())
                .name(entity.getName())
                .protocolNumber(entity.getProtocolNumber())
                .sponsor(entity.getSponsor())
                .description(entity.getDescription())
                .organizationId(null) // TODO: Map from organizationStudies relationship
                .organizationName(null) // TODO: Map from organizationStudies relationship
                .plannedStartDate(null) // TODO: Add to entity if needed
                .plannedEndDate(null) // TODO: Add to entity if needed
                .actualStartDate(null) // TODO: Add to entity if needed
                .actualEndDate(null) // TODO: Add to entity if needed
                .targetEnrollment(entity.getTargetEnrollment())
                .targetSites(entity.getSites())
                .phase(entity.getStudyPhase() != null ? entity.getStudyPhase().getName() : null)
                .studyType(entity.getStudyType())
                .therapeuticArea(entity.getTherapeuticArea())
                .regulatoryStatus(entity.getRegulatoryStatus() != null ? entity.getRegulatoryStatus().getName() : null)
                .indNumber(null) // TODO: Add to entity if needed
                .protocolVersionNumber(null) // TODO: Add to entity if needed
                .principalInvestigator(entity.getPrincipalInvestigator())
                .medicalMonitor(null) // TODO: Add to entity if needed
                .contactEmail(null) // TODO: Add to entity if needed
                .status(entity.getStudyStatus() != null ? 
                    StudyStatusCode.fromString(entity.getStudyStatus().getCode()) : null)
                .statusReason(null) // TODO: Add to entity if needed
                .statusChangedAt(null) // TODO: Add to entity if needed
                .statusChangedBy(null) // TODO: Add to entity if needed
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy() != null ? entity.getCreatedBy().toString() : null)
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(null) // TODO: Add to entity if needed
                .build();
    }
    
    /**
     * Convert StudyEntity to summary StudyListResponseDto
     * Used for GET /api/studies list endpoints
     * Returns only essential fields for list views
     * 
     * @param entity Study entity from database
     * @return StudyListResponseDto with summary fields
     */
    public StudyListResponseDto toListDto(StudyEntity entity) {
        if (entity == null) {
            return null;
        }
        
        log.debug("Mapping StudyEntity to StudyListResponseDto for study ID: {}", entity.getId());
        
        return StudyListResponseDto.builder()
                .studyAggregateUuid(entity.getAggregateUuid())
                .id(entity.getId())
                .name(entity.getName())
                .protocolNumber(entity.getProtocolNumber())
                .sponsor(entity.getSponsor())
                .organizationId(null) // TODO: Map from organizationStudies relationship
                .organizationName(null) // TODO: Map from organizationStudies relationship
                .plannedStartDate(entity.getStartDate())
                .actualStartDate(entity.getStartDate())
                .targetEnrollment(entity.getTargetEnrollment())
                .currentEnrollment(entity.getEnrolledSubjects())
                .phase(entity.getStudyPhase() != null ? entity.getStudyPhase().getName() : null)
                .studyType(entity.getStudyType())
                .status(entity.getStudyStatus() != null ? 
                    StudyStatusCode.fromString(entity.getStudyStatus().getCode()) : null)
                .build();
    }
}



