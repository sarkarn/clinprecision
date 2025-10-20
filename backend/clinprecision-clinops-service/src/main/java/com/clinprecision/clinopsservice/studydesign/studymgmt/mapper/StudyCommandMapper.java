package com.clinprecision.clinopsservice.studydesign.studymgmt.mapper;


import com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.OrganizationRole;
import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper for converting Study Request DTOs to Domain Commands
 * 
 * This mapper converts HTTP request DTOs to Axon command objects for CQRS write operations.
 * It enriches commands with user context (userId, userName) from security context.
 */
@Component
@Slf4j
public class StudyCommandMapper {
    
    /**
     * Convert StudyCreateRequestDto to CreateStudyCommand
     * Generates new UUID for study aggregate
     * 
     * @param dto HTTP request DTO
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return CreateStudyCommand for command gateway
     */
    public CreateStudyCommand toCreateCommand(StudyCreateRequestDto dto, UUID userId, String userName) {
        UUID studyAggregateUuid = UUID.randomUUID();
        
        log.debug("Mapping StudyCreateRequestDto to CreateStudyCommand with UUID: {}", studyAggregateUuid);
        
        return CreateStudyCommand.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .name(dto.getName())
                .description(dto.getDescription())
                .sponsor(dto.getSponsor())
                .protocolNumber(dto.getProtocolNumber())
                .indication(dto.getIndication())
                .studyType(dto.getStudyType())
                .principalInvestigator(dto.getPrincipalInvestigator())
                .studyCoordinator(dto.getStudyCoordinator())
                .therapeuticArea(dto.getTherapeuticArea())
                .plannedSubjects(dto.getPlannedSubjects() != null ? dto.getPlannedSubjects() : dto.getTargetEnrollment())
                .targetEnrollment(dto.getTargetEnrollment())
                .targetSites(dto.getTargetSites())
                .primaryObjective(dto.getPrimaryObjective() != null ? dto.getPrimaryObjective() : dto.getObjective())
                .primaryEndpoint(dto.getPrimaryEndpoint())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .estimatedCompletion(dto.getPlannedEndDate())
                .studyStatusId(dto.getStudyStatusId())
                .regulatoryStatusId(dto.getRegulatoryStatusId())
                .studyPhaseId(dto.getStudyPhaseId())
                .organizationId(dto.getOrganizationId())
                .metadata(dto.getMetadata())
                .organizations(mapOrganizations(dto.getOrganizations()))
                .userId(userId)
                .userName(userName)
                .build();
    }
    
    /**
     * Convert StudyUpdateRequestDto to UpdateStudyCommand
     * 
     * @param studyUuid UUID of study aggregate to update
     * @param dto HTTP request DTO (partial update - only non-null fields updated)
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return UpdateStudyCommand for command gateway
     */
    public UpdateStudyCommand toUpdateCommand(UUID studyUuid, StudyUpdateRequestDto dto, UUID userId, String userName) {
        log.debug("Mapping StudyUpdateRequestDto to UpdateStudyCommand for study: {}", studyUuid);

        return UpdateStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .name(dto.getName())
                .description(dto.getDescription())
                .sponsor(dto.getSponsor())
                .protocolNumber(dto.getProtocolNumber())
                .indication(dto.getIndication())
                .studyType(dto.getStudyType())
                .principalInvestigator(dto.getPrincipalInvestigator())
                .studyCoordinator(dto.getStudyCoordinator())
                .therapeuticArea(dto.getTherapeuticArea())
                .plannedSubjects(dto.getPlannedSubjects() != null ? dto.getPlannedSubjects() : dto.getTargetEnrollment())
                .targetEnrollment(dto.getTargetEnrollment())
                .targetSites(dto.getTargetSites())
                .primaryObjective(dto.getPrimaryObjective() != null ? dto.getPrimaryObjective() : dto.getObjective())
                .primaryEndpoint(dto.getPrimaryEndpoint())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .estimatedCompletion(dto.getPlannedEndDate())
                .studyPhaseId(dto.getStudyPhaseId())
                .regulatoryStatusId(dto.getRegulatoryStatusId())
                .organizationId(dto.getOrganizationId())
                .metadata(dto.getMetadata())
                .organizations(mapOrganizations(dto.getOrganizations()))
                .userId(userId)
                .userName(userName)
                .build();
    }
    
    /**
     * Convert SuspendStudyRequestDto to SuspendStudyCommand
     * 
     * @param studyUuid UUID of study aggregate to suspend
     * @param dto HTTP request DTO containing suspension reason
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return SuspendStudyCommand for command gateway
     */
    public SuspendStudyCommand toSuspendCommand(UUID studyUuid, SuspendStudyRequestDto dto, UUID userId, String userName) {
        log.debug("Mapping SuspendStudyRequestDto to SuspendStudyCommand for study: {}", studyUuid);
        
        return SuspendStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .reason(dto.getReason())
                .userId(userId)
                .userName(userName)
                .build();
    }
    
    /**
     * Convert TerminateStudyRequestDto to TerminateStudyCommand
     * Note: Termination is a terminal state - study cannot be modified after this
     * 
     * @param studyUuid UUID of study aggregate to terminate
     * @param dto HTTP request DTO containing termination reason
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return TerminateStudyCommand for command gateway
     */
    public TerminateStudyCommand toTerminateCommand(UUID studyUuid, TerminateStudyRequestDto dto, UUID userId, String userName) {
        log.debug("Mapping TerminateStudyRequestDto to TerminateStudyCommand for study: {}", studyUuid);
        
        return TerminateStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .reason(dto.getReason())
                .userId(userId)
                .userName(userName)
                .build();
    }
    
    /**
     * Convert WithdrawStudyRequestDto to WithdrawStudyCommand
     * Note: Withdrawal is a terminal state - study cannot be modified after this
     * 
     * @param studyUuid UUID of study aggregate to withdraw
     * @param dto HTTP request DTO containing withdrawal reason
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return WithdrawStudyCommand for command gateway
     */
    public WithdrawStudyCommand toWithdrawCommand(UUID studyUuid, WithdrawStudyRequestDto dto, UUID userId, String userName) {
        log.debug("Mapping WithdrawStudyRequestDto to WithdrawStudyCommand for study: {}", studyUuid);
        
        return WithdrawStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .reason(dto.getReason())
                .userId(userId)
                .userName(userName)
                .build();
    }
    
    /**
     * Create CompleteStudyCommand
     * Note: Completion marks successful end of study
     * 
     * @param studyUuid UUID of study aggregate to complete
     * @param userId Current user ID from security context
     * @param userName Current user name from security context
     * @return CompleteStudyCommand for command gateway
     */
    public CompleteStudyCommand toCompleteCommand(UUID studyUuid, UUID userId, String userName) {
        log.debug("Creating CompleteStudyCommand for study: {}", studyUuid);
        
        return CompleteStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .userId(userId)
                .userName(userName)
                .build();
    }

        private List<OrganizationAssociationUpdate> mapOrganizations(List<StudyOrganizationAssociationRequestDto> associations) {
                if (associations == null || associations.isEmpty()) {
                        return null;
                }

                List<OrganizationAssociationUpdate> mapped = associations.stream()
                        .filter(association -> association.getOrganizationId() != null)
                        .map(association -> {
                                OrganizationRole role = null;
                                if (association.getRole() != null && !association.getRole().isBlank()) {
                                        try {
                                                role = OrganizationRole.valueOf(association.getRole().toUpperCase());
                                        } catch (IllegalArgumentException ex) {
                                                log.warn("Unknown organization role '{}' supplied for organization {}. Defaulting to SPONSOR.",
                                                        association.getRole(), association.getOrganizationId());
                                        }
                                }

                                if (role == null) {
                                        role = OrganizationRole.SPONSOR;
                                }

                                return OrganizationAssociationUpdate.builder()
                                        .organizationId(association.getOrganizationId())
                                        .role(role)
                                        .isPrimary(Boolean.TRUE.equals(association.getIsPrimary()))
                                        .build();
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

                return mapped.isEmpty() ? null : mapped;
        }
}



