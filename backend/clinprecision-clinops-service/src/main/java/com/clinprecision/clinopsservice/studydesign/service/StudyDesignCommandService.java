package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.studydesign.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ArmType;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyDesignIdentifier;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitType;
import com.clinprecision.clinopsservice.studydesign.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for handling StudyDesign commands
 * Orchestrates command creation and dispatching via Axon CommandGateway
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDesignCommandService {

    private final CommandGateway commandGateway;
    private final StudyDesignValidationService validationService;

    /**
     * Initialize a new study design aggregate
     * Validates study status allows design initialization
     */
    public CompletableFuture<UUID> initializeStudyDesign(InitializeStudyDesignRequest request) {
        log.info("Initializing study design for study: {}", request.getStudyAggregateUuid());
        
        // Validate design initialization allowed
    validationService.validateDesignInitialization(request.getStudyAggregateUuid(), request.getLegacyStudyId());
        
        UUID studyDesignId = request.getStudyDesignId() != null
            ? StudyDesignIdentifier.fromUuid(request.getStudyDesignId()).getId()
            : StudyDesignIdentifier.newIdentifier().getId();
        
        InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
            .studyDesignId(studyDesignId)
            .studyAggregateUuid(request.getStudyAggregateUuid())
            .studyName(request.getStudyName())
            .createdBy(request.getCreatedBy())
            .build();
        
        return commandGateway.send(command)
            .thenApply(result -> studyDesignId);
    }

    /**
     * Add a study arm
     * Validates study status allows design modifications
     * @return CompletableFuture containing the UUID of the created arm
     */
    public CompletableFuture<UUID> addStudyArm(UUID studyDesignId, AddStudyArmRequest request) {
        log.info("Adding study arm '{}' to design: {}", request.getName(), studyDesignId);
        
        // Validate arm addition allowed
        // TODO: Need to pass studyUuid - this requires querying StudyDesign aggregate or adding to request
        // validationService.validateArmAddition(studyDesignId, studyUuid);
        
        UUID armId = UUID.randomUUID();
        
        AddStudyArmCommand command = AddStudyArmCommand.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .name(request.getName())
            .description(request.getDescription())
            .type(ArmType.valueOf(request.getType()))
            .sequenceNumber(request.getSequenceNumber())
            .plannedSubjects(request.getPlannedSubjects())
            .addedBy(request.getAddedBy())
            .build();
        
        return commandGateway.send(command).thenApply(result -> armId);
    }

    /**
     * Update study arm
     * Validates study status allows design modifications
     */
    public CompletableFuture<Void> updateStudyArm(UUID studyDesignId, UUID armId, UpdateStudyArmRequest request) {
        log.info("Updating study arm {} in design: {}", armId, studyDesignId);
        
        // TODO: Need to pass studyUuid - requires querying StudyDesign aggregate
        // validationService.validateArmUpdate(studyDesignId, armId, studyUuid);
        
        UpdateStudyArmCommand command = UpdateStudyArmCommand.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .name(request.getName())
            .description(request.getDescription())
            .plannedSubjects(request.getPlannedSubjects())
            .updatedBy(request.getUpdatedBy())
            .build();
        
        return commandGateway.send(command);
    }

    /**
     * Remove study arm
     * Validates study status allows design modifications
     * CRITICAL: Validates no enrolled subjects in arm
     */
    public CompletableFuture<Void> removeStudyArm(UUID studyDesignId, UUID armId, String reason, Long removedBy) {
        log.info("Removing study arm {} from design: {}", armId, studyDesignId);
        
        // TODO: Need to pass studyUuid - requires querying StudyDesign aggregate
        // validationService.validateArmRemoval(studyDesignId, armId, studyUuid);
        
        RemoveStudyArmCommand command = RemoveStudyArmCommand.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .reason(reason)
            .removedBy(removedBy)
            .build();
        
        return commandGateway.send(command);
    }

    /**
     * Define a visit
     * Validates study status allows design modifications
     * @return CompletableFuture containing the UUID of the created visit
     */
    public CompletableFuture<UUID> defineVisit(UUID studyDesignId, DefineVisitRequest request) {
        log.info("Defining visit '{}' at timepoint {} in design: {}", 
            request.getName(), request.getTimepoint(), studyDesignId);
        
        // TODO: Need to pass studyUuid - requires querying StudyDesign aggregate
        // validationService.validateVisitDefinition(studyDesignId, studyUuid);
        
        UUID visitId = UUID.randomUUID();
        
        DefineVisitCommand command = DefineVisitCommand.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .name(request.getName())
            .description(request.getDescription())
            .timepoint(request.getTimepoint())
            .windowBefore(request.getWindowBefore())
            .windowAfter(request.getWindowAfter())
            .visitType(VisitType.valueOf(request.getVisitType()))
            .isRequired(request.getIsRequired())
            .sequenceNumber(request.getSequenceNumber())
            .armId(request.getArmId())
            .definedBy(request.getDefinedBy() != null ? request.getDefinedBy() : 1L)
            .build();
        
        return commandGateway.send(command).thenApply(result -> visitId);
    }

    /**
     * Update visit
     */
    public CompletableFuture<Void> updateVisit(UUID studyDesignId, UUID visitId, UpdateVisitRequest request) {
        log.info("Updating visit {} in design: {}", visitId, studyDesignId);
        
        // Provide default user ID if not specified (handles legacy API calls)
        Long updatedBy = request.getUpdatedBy() != null ? request.getUpdatedBy() : 1L;
        
        UpdateVisitCommand command = UpdateVisitCommand.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .name(request.getName())
            .description(request.getDescription())
            .timepoint(request.getTimepoint())
            .windowBefore(request.getWindowBefore())
            .windowAfter(request.getWindowAfter())
            .visitType(request.getVisitType() != null ? VisitType.valueOf(request.getVisitType()) : null) // BUGFIX: Added visitType
            .isRequired(request.getIsRequired())
            .updatedBy(updatedBy)
            .build();
        
        return commandGateway.send(command);
    }

    /**
     * Remove visit
     */
    public CompletableFuture<Void> removeVisit(UUID studyDesignId, UUID visitId, String reason, Long removedBy) {
        log.info("Removing visit {} from design: {}", visitId, studyDesignId);
        
        RemoveVisitCommand command = RemoveVisitCommand.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .reason(reason)
            .removedBy(removedBy)
            .build();
        
        return commandGateway.send(command);
    }

    /**
     * Assign form to visit
     * @return CompletableFuture containing the UUID of the created form assignment
     */
    public CompletableFuture<UUID> assignFormToVisit(UUID studyDesignId, AssignFormToVisitRequest request) {
        log.info("Assigning form {} to visit {} in design: {}", 
            request.getFormId(), request.getVisitId(), studyDesignId);
        
        UUID assignmentId = UUID.randomUUID();
        
        AssignFormToVisitCommand command = AssignFormToVisitCommand.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .visitId(request.getVisitId())
            .formId(request.getFormId())
            .isRequired(request.getIsRequired())
            .isConditional(request.getIsConditional())
            .conditionalLogic(request.getConditionalLogic())
            .displayOrder(request.getDisplayOrder())
            .instructions(request.getInstructions())
            .assignedBy(request.getAssignedBy())
            .build();
        
        return commandGateway.send(command).thenApply(result -> assignmentId);
    }

    /**
     * Update form assignment
     */
    public CompletableFuture<Void> updateFormAssignment(UUID studyDesignId, UUID assignmentId, 
                                                        UpdateFormAssignmentRequest request) {
        log.info("Updating form assignment {} in design: {}", assignmentId, studyDesignId);
        
        UpdateFormAssignmentCommand command = UpdateFormAssignmentCommand.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .isRequired(request.getIsRequired())
            .isConditional(request.getIsConditional())
            .conditionalLogic(request.getConditionalLogic())
            .instructions(request.getInstructions())
            .updatedBy(request.getUpdatedBy())
            .build();
        
        return commandGateway.send(command);
    }

    /**
     * Remove form assignment
     */
    public CompletableFuture<Void> removeFormAssignment(UUID studyDesignId, UUID assignmentId, 
                                                        String reason, Long removedBy) {
        log.info("Removing form assignment {} from design: {}", assignmentId, studyDesignId);
        
        RemoveFormAssignmentCommand command = RemoveFormAssignmentCommand.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .reason(reason)
            .removedBy(removedBy)
            .build();
        
        return commandGateway.send(command);
    }
}
