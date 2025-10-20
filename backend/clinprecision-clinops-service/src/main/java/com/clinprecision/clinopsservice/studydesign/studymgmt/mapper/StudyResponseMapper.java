package com.clinprecision.clinopsservice.studydesign.studymgmt.mapper;

import com.clinprecision.clinopsservice.client.OrganizationServiceClient;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyOrganizationAssociationResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.OrganizationStudyEntity;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyEntity;
import com.clinprecision.common.dto.OrganizationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Mapper for converting Study Entity to Response DTOs
 * 
 * This mapper converts database entities to HTTP response DTOs for CQRS read operations.
 * It maps from the relational model (StudyEntity) to the API contract (DTOs).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudyResponseMapper {
    
    private final OrganizationServiceClient organizationClient;
    
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
        
        // Get organization ID and name
        Long organizationId = null;
        String organizationName = null;
        List<StudyOrganizationAssociationResponseDto> organizationAssociations = new ArrayList<>();
        Map<Long, String> organizationNameCache = new HashMap<>();
        
        if (entity.getOrganizationStudies() != null && !entity.getOrganizationStudies().isEmpty()) {
            organizationId = entity.getOrganizationStudies().get(0).getOrganizationId();
            
            organizationAssociations = mapOrganizationAssociations(entity.getOrganizationStudies(), organizationNameCache);

            if (organizationId != null) {
                organizationName = organizationNameCache.get(organizationId);
                if (organizationName == null) {
                    organizationName = resolveOrganizationName(organizationId, organizationNameCache);
                }
            }
        }
        
        return StudyResponseDto.builder()
                .studyAggregateUuid(entity.getAggregateUuid())
                .id(entity.getId())
                .name(entity.getName())
                .protocolNumber(entity.getProtocolNumber())
                .sponsor(entity.getSponsor())
                .description(entity.getDescription())
                .primaryObjective(entity.getPrimaryObjective())
                .organizationId(organizationId)
                .organizationName(organizationName)
                .organizations(organizationAssociations)
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .plannedStartDate(entity.getStartDate())
                .plannedEndDate(entity.getEndDate())
                .actualStartDate(entity.getStartDate())
                .actualEndDate(entity.getEndDate())
                .targetEnrollment(entity.getTargetEnrollment())
                .targetSites(entity.getSites())
                .studyPhaseId(entity.getStudyPhase() != null ? entity.getStudyPhase().getId() : null)
                .phase(entity.getStudyPhase() != null ? entity.getStudyPhase().getName() : null)
                .studyType(entity.getStudyType())
                .therapeuticArea(entity.getTherapeuticArea())
                .regulatoryStatusId(entity.getRegulatoryStatus() != null ? entity.getRegulatoryStatus().getId() : null)
                .regulatoryStatus(entity.getRegulatoryStatus() != null ? entity.getRegulatoryStatus().getName() : null)
                .indNumber(null) // TODO: Add to entity if needed
                .protocolVersionNumber(null) // TODO: Add to entity if needed
                .principalInvestigator(entity.getPrincipalInvestigator())
                .medicalMonitor(null) // TODO: Add to entity if needed
                .contactEmail(null) // TODO: Add to entity if needed
                .studyStatusId(entity.getStudyStatus() != null ? entity.getStudyStatus().getId() : null)
                .status(entity.getStudyStatus() != null ? 
                    StudyStatusCode.fromString(entity.getStudyStatus().getCode()) : null)
                .statusReason(null) // TODO: Add to entity if needed
                .statusChangedAt(null) // TODO: Add to entity if needed
                .statusChangedBy(null) // TODO: Add to entity if needed
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy() != null ? entity.getCreatedBy().toString() : null)
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(null) // TODO: Add to entity if needed
                .metadata(entity.getMetadata()) // Include metadata JSON for frontend
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
        
        // Get organization ID and name
    Long organizationId = null;
    String organizationName = null;
    Map<Long, String> organizationNameCache = new HashMap<>();
        
        if (entity.getOrganizationStudies() != null && !entity.getOrganizationStudies().isEmpty()) {
            organizationId = entity.getOrganizationStudies().get(0).getOrganizationId();
            if (organizationId != null) {
                organizationName = resolveOrganizationName(organizationId, organizationNameCache);
            }
        }
        
        return StudyListResponseDto.builder()
                .studyAggregateUuid(entity.getAggregateUuid())
                .id(entity.getId())
                .name(entity.getName())
                .protocolNumber(entity.getProtocolNumber())
                .sponsor(entity.getSponsor())
                .organizationId(organizationId)
                .organizationName(organizationName)
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
    
    private List<StudyOrganizationAssociationResponseDto> mapOrganizationAssociations(
            List<OrganizationStudyEntity> organizationStudies,
            Map<Long, String> organizationNameCache) {
        List<StudyOrganizationAssociationResponseDto> associations = new ArrayList<>();
        if (organizationStudies == null || organizationStudies.isEmpty()) {
            return associations;
        }

        for (OrganizationStudyEntity association : organizationStudies) {
            Long orgId = association.getOrganizationId();
            if (orgId == null) {
                continue;
            }

            String resolvedName = resolveOrganizationName(orgId, organizationNameCache);

            associations.add(StudyOrganizationAssociationResponseDto.builder()
                .organizationId(orgId)
                .organizationName(resolvedName)
                .role(association.getRole() != null ? association.getRole().name().toLowerCase() : null)
                .isPrimary(association.getIsPrimary())
                .build());
        }

        return associations;
    }

    private String resolveOrganizationName(Long organizationId, Map<Long, String> cache) {
        if (organizationId == null) {
            return null;
        }

        if (cache.containsKey(organizationId)) {
            return cache.get(organizationId);
        }

        try {
            ResponseEntity<OrganizationDto> response = organizationClient.getOrganizationById(organizationId);
            if (response.getBody() != null) {
                String name = response.getBody().getName();
                cache.put(organizationId, name);
                return name;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch organization name for ID: {}. Error: {}", organizationId, e.getMessage());
        }

        cache.put(organizationId, null);
        return null;
    }
}




