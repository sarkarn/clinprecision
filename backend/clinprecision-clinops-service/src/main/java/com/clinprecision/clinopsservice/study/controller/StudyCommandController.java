package com.clinprecision.clinopsservice.study.controller;

import com.clinprecision.clinopsservice.dto.DesignProgressResponseDto;
import com.clinprecision.clinopsservice.dto.DesignProgressUpdateRequestDto;
import com.clinprecision.clinopsservice.service.DesignProgressService;
import com.clinprecision.clinopsservice.study.dto.request.*;
import com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.study.service.StudyCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Study Command Controller - DDD/CQRS Write Operations
 * 
 * REST API for study write operations (command side).
 * Following CQRS pattern: Commands modify state and return identifiers or status.
 * 
 * Base Path: /api/studies
 * 
 * Command Endpoints:
 * - POST   /api/studies                        - Create study
 * - PUT    /api/studies/{uuid}                 - Update study
 * - POST   /api/studies/{uuid}/details         - Update study details
 * - PATCH  /api/studies/{uuid}/publish         - Publish study (set ACTIVE)
 * - PATCH  /api/studies/{uuid}/status          - Change study status
 * - POST   /api/studies/{uuid}/suspend         - Suspend study
 * - POST   /api/studies/{uuid}/resume          - Resume study
 * - POST   /api/studies/{uuid}/complete        - Complete study
 * - POST   /api/studies/{uuid}/terminate       - Terminate study
 * - POST   /api/studies/{uuid}/withdraw        - Withdraw study
 * 
 * Architecture:
 * - Receives DTOs from frontend
 * - Delegates to StudyCommandService
 * - Returns UUIDs or status codes
 * - No direct database access
 * 
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyCommandController {

    private final StudyCommandService studyCommandService;
    private final DesignProgressService designProgressService;
    private final com.clinprecision.clinopsservice.studydesign.service.StudyDesignCommandService studyDesignCommandService;
    private final com.clinprecision.clinopsservice.studydesign.service.StudyDesignAutoInitializationService studyDesignAutoInitService;
    private final com.clinprecision.clinopsservice.repository.VisitFormRepository visitFormRepository;
    private final com.clinprecision.clinopsservice.study.service.StudyQueryService studyQueryService;

    /**
     * Create a new study
     * 
     * Command: CreateStudyCommand
     * Event: StudyCreatedEvent
     * 
     * @param request Study creation request with name, description, phase, etc.
     * @return 201 Created with study aggregate UUID
     */
    @PostMapping
    public ResponseEntity<Map<String, UUID>> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        log.info("REST: Creating study: {}", request.getName());
        
        UUID studyUuid = studyCommandService.createStudy(request);
        
        log.info("REST: Study created successfully with UUID: {}", studyUuid);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("studyAggregateUuid", studyUuid));
    }

    /**
     * Update an existing study
     * 
     * Command: UpdateStudyCommand
     * Event: StudyUpdatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Study update request (partial update)
     * @return 200 OK
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<Void> updateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody StudyUpdateRequestDto request) {
        
        log.info("REST: Updating study: {}", uuid);
        
        studyCommandService.updateStudy(uuid, request);
        
        log.info("REST: Study updated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Update study details (specific endpoint for StudyEditPage.jsx)
     * 
     * Command: UpdateStudyCommand
     * Event: StudyUpdatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Study update request
     * @return 200 OK
     */
    @PostMapping("/{uuid}/details")
    public ResponseEntity<Void> updateStudyDetails(
            @PathVariable UUID uuid,
            @Valid @RequestBody StudyUpdateRequestDto request) {
        
        log.info("REST: Updating study details: {}", uuid);
        
        studyCommandService.updateStudy(uuid, request);
        
        log.info("REST: Study details updated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Publish a study (set status to ACTIVE).
     * Supports both Long ID and UUID for gradual migration.
     * 
     * Command: ActivateStudyCommand
     * Event: StudyActivatedEvent
     * 
     * @param studyId Study ID (Long or UUID string)
     * @return 200 OK
     */
    @PatchMapping("/{studyId}/publish")
    public ResponseEntity<Void> publishStudy(@PathVariable String studyId) {
        // Bridge pattern: Convert Long ID to UUID using auto-initialization
        UUID uuid = studyDesignAutoInitService.ensureStudyDesignExists(studyId).join();
        
        log.info("REST: Publishing study: {} (UUID: {})", studyId, uuid);
        
        // TODO: Implement activateStudy method in StudyCommandService
        // studyCommandService.activateStudy(uuid);
        log.warn("Study publish/activate not yet implemented: {}", uuid);
        return ResponseEntity.status(501).build(); // Not Implemented
    }

    /**
     * Change study status (generic status change)
     * 
     * Command: Various status commands
     * Event: Various status events
     * 
     * @param uuid Study aggregate UUID
     * @param request Map containing "newStatus" field
     * @return 200 OK
     */
    @PatchMapping("/{studyId}/status")
    public ResponseEntity<Void> changeStudyStatus(
            @PathVariable String studyId,
            @RequestBody Map<String, String> request) {
        
        String newStatus = request.get("newStatus");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("newStatus is required");
        }
        
        // Bridge pattern: Resolve Study aggregate UUID (not StudyDesign UUID!)
        UUID studyAggregateUuid;
        try {
            // Try as UUID first
            studyAggregateUuid = UUID.fromString(studyId);
            log.debug("REST: Using UUID format for status change");
        } catch (IllegalArgumentException e) {
            // Not a UUID, try as legacy ID
            try {
                Long legacyId = Long.parseLong(studyId);
                log.info("REST: Using legacy ID {} for status change (Bridge Pattern)", legacyId);
                
                // Get Study entity to retrieve its aggregate UUID
                com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto study = 
                    studyQueryService.getStudyById(legacyId);
                studyAggregateUuid = study.getStudyAggregateUuid();
                
                if (studyAggregateUuid == null) {
                    log.error("REST: Study {} has no aggregate UUID - cannot change status", legacyId);
                    throw new IllegalStateException("Study " + legacyId + " has not been migrated to DDD yet");
                }
            } catch (NumberFormatException nfe) {
                log.error("REST: Invalid identifier format (not UUID or numeric): {}", studyId);
                throw new IllegalArgumentException("Invalid study ID format: " + studyId);
            }
        }
        
        log.info("REST: Changing study status: {} (Study Aggregate UUID: {}) to {}", 
                 studyId, studyAggregateUuid, newStatus);
        
        try {
            // Use generic status change method - supports all valid status transitions
            // Including: PROTOCOL_REVIEW, PLANNING, REGULATORY_SUBMISSION, APPROVED, ACTIVE, etc.
            String reason = request.get("reason"); // Optional reason for status change
            studyCommandService.changeStudyStatus(studyAggregateUuid, newStatus, reason);
            
            log.info("REST: Study status changed successfully: {} to {}", studyAggregateUuid, newStatus);
            return ResponseEntity.ok().build();
            
        } catch (com.clinprecision.clinopsservice.study.exception.StudyStatusTransitionException ex) {
            // Transform technical error into user-friendly message
            String userFriendlyMessage = makeUserFriendly(ex.getMessage(), newStatus);
            log.warn("REST: Status transition validation failed: {}", userFriendlyMessage);
            
            // Return 400 Bad Request with user-friendly message
            return ResponseEntity
                .badRequest()
                .header("X-Error-Message", userFriendlyMessage)
                .build();
        }
    }
    
    /**
     * Transform technical exception messages into user-friendly messages
     * Removes UUIDs and technical jargon, provides actionable guidance
     */
    private String makeUserFriendly(String technicalMessage, String targetStatus) {
        if (technicalMessage == null) {
            return "Unable to change study status. Please contact support.";
        }
        
        // Remove UUID from message
        String message = technicalMessage.replaceAll("\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b", "study");
        message = message.replace("Cannot transition study to status " + targetStatus + ": ", "");
        message = message.replace("Cannot transition study to status PROTOCOL_REVIEW: ", "");
        
        // Transform specific messages
        if (message.contains("protocol version before review")) {
            return "Please create a protocol version before submitting the study for review.";
        }
        
        if (message.contains("approved protocol version")) {
            return "At least one protocol version must be approved before proceeding.";
        }
        
        if (message.contains("invalid status transition") || message.contains("not allowed")) {
            return "This status change is not allowed from the current study status.";
        }
        
        if (message.contains("amendments")) {
            return "Please resolve pending amendments before changing study status.";
        }
        
        // Return cleaned message if no specific transformation matched
        return message.replace("study study", "the study");
    }

    /**
     * Suspend study
     * 
     * Command: SuspendStudyCommand
     * Event: StudySuspendedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Suspension request with reason
     * @return 200 OK
     */
    @PostMapping("/{uuid}/suspend")
    public ResponseEntity<Void> suspendStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody SuspendStudyRequestDto request) {
        
        log.info("REST: Suspending study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.suspendStudy(uuid, request);
        
        log.info("REST: Study suspended successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Resume study (from suspended state)
     * 
     * Command: ActivateStudyCommand
     * Event: StudyActivatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK
     */
    @PostMapping("/{uuid}/resume")
    public ResponseEntity<Void> resumeStudy(@PathVariable UUID uuid) {
        log.info("REST: Resuming study: {}", uuid);
        
        // TODO: Implement resumeStudy method in StudyCommandService
        // studyCommandService.resumeStudy(uuid);
        log.warn("Study resume not yet implemented: {}", uuid);
        return ResponseEntity.status(501).build(); // Not Implemented
    }

    /**
     * Complete study
     * 
     * Command: CompleteStudyCommand
     * Event: StudyCompletedEvent
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK
     */
    @PostMapping("/{uuid}/complete")
    public ResponseEntity<Void> completeStudy(@PathVariable UUID uuid) {
        log.info("REST: Completing study: {}", uuid);
        
        studyCommandService.completeStudy(uuid);
        
        log.info("REST: Study completed successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Terminate study
     * 
     * Command: TerminateStudyCommand
     * Event: StudyTerminatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Termination request with reason
     * @return 200 OK
     */
    @PostMapping("/{uuid}/terminate")
    public ResponseEntity<Void> terminateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody TerminateStudyRequestDto request) {
        
        log.info("REST: Terminating study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.terminateStudy(uuid, request);
        
        log.info("REST: Study terminated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Withdraw study
     * 
     * Command: WithdrawStudyCommand
     * Event: StudyWithdrawnEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Withdrawal request with reason
     * @return 200 OK
     */
    @PostMapping("/{uuid}/withdraw")
    public ResponseEntity<Void> withdrawStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody WithdrawStudyRequestDto request) {
        
        log.info("REST: Withdrawing study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.withdrawStudy(uuid, request);
        
        log.info("REST: Study withdrawn successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Initialize design progress for a study (supports UUID or legacy ID)
     * 
     * Command: InitializeDesignProgressCommand (TODO)
     * Event: DesignProgressInitializedEvent (TODO)
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @return 201 Created
     * 
     * NOTE: This method is temporarily returning success without implementation
     * to prevent frontend errors. Actual implementation pending.
     */
    @PostMapping("/{id}/design-progress/initialize")
    public ResponseEntity<Void> initializeDesignProgress(@PathVariable String id) {
        log.info("REST: Initializing design progress for study: {}", id);
        
        // Support both UUID and legacy numeric ID
        UUID studyUuid;
        try {
            studyUuid = UUID.fromString(id);
            log.debug("REST: Using UUID format for design progress initialization");
        } catch (IllegalArgumentException e) {
            try {
                Long legacyId = Long.parseLong(id);
                log.info("REST: Using legacy ID {} for design progress initialization (Bridge Pattern)", legacyId);
                // Would need to resolve to UUID here when implementing
                // For now, just log it
                log.warn("Design progress initialization not yet implemented - returning 201 to prevent frontend errors");
                return ResponseEntity.status(HttpStatus.CREATED).build();
            } catch (NumberFormatException nfe) {
                log.error("REST: Invalid identifier format (not UUID or numeric): {}", id);
                return ResponseEntity.badRequest().build();
            }
        }
        
        // TODO: Implement design progress initialization command
        // studyCommandService.initializeDesignProgress(studyUuid);
        
        log.warn("Design progress initialization not yet implemented for UUID: {} - returning 201 to prevent frontend errors", studyUuid);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Update design progress for a study (supports UUID or legacy ID)
     * 
     * Bridge endpoint: Frontend calls PUT /studies/{id}/design-progress
     * 
     * Command: UpdateDesignProgressCommand (TODO - future DDD implementation)
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @param updateRequest Design progress update data
     * @return 200 OK with updated design progress
     */
    @PutMapping("/{id}/design-progress")
    public ResponseEntity<DesignProgressResponseDto> updateDesignProgress(
            @PathVariable String id,
            @Valid @RequestBody DesignProgressUpdateRequestDto updateRequest) {
        
        log.info("REST: Updating design progress for study: {}", id);
        log.debug("REST: Progress update data: {}", updateRequest);
        
        // Support both UUID and legacy numeric ID
        Long studyId;
        try {
            UUID studyUuid = UUID.fromString(id);
            log.debug("REST: Received UUID format for design progress update: {}", studyUuid);
            // TODO: When DDD implementation is complete, resolve UUID to ID
            // For now, throw exception as we need numeric ID for bridge implementation
            throw new IllegalArgumentException("UUID resolution not yet implemented - please use numeric study ID");
        } catch (IllegalArgumentException e) {
            try {
                studyId = Long.parseLong(id);
                log.info("REST: Using legacy ID {} for design progress update (Bridge Pattern)", studyId);
            } catch (NumberFormatException nfe) {
                log.error("REST: Invalid identifier format (not UUID or numeric): {}", id);
                return ResponseEntity.badRequest().build();
            }
        }
        
        // Bridge pattern: Call service directly (not using DDD commands yet)
        // TODO: Replace with DDD command when implementing UpdateDesignProgressCommand
        try {
            DesignProgressResponseDto response = designProgressService.updateDesignProgress(studyId, updateRequest);
            log.info("REST: Design progress updated successfully for study: {}", studyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            log.error("REST: Invalid request for study {}: {}", studyId, ex.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            log.error("REST: Error updating design progress for study {}", studyId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ===================== STUDY ARMS COMMAND ENDPOINTS (Bridge Pattern) =====================
    
    /**
     * Create a study arm (supports UUID or legacy ID)
     * 
     * Bridge endpoint: Frontend calls POST /studies/{id}/arms
     * Backend DDD: POST /study-design/{uuid}/arms
     * 
     * Command: AddStudyArmCommand (TODO - future DDD implementation)
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @param armData Study arm data
     * @return 201 Created with created arm data
     */
    @PostMapping("/{id}/arms")
    public ResponseEntity<com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto> createStudyArm(
            @PathVariable String id,
            @Valid @RequestBody StudyArmRequestDto armData) {
        
        log.info("REST: Creating study arm '{}' for study: {}", armData.getName(), id);
        
        try {
            // Resolve study ID to get numeric ID
            Long studyIdNumeric;
            
            try {
                UUID uuid = UUID.fromString(id);
                log.debug("REST: Using UUID format for arm creation");
                var study = studyCommandService.getStudyEntityByUuid(uuid);
                studyIdNumeric = study.getId();
            } catch (IllegalArgumentException e) {
                studyIdNumeric = Long.parseLong(id);
                log.info("REST: Using legacy ID {} for arm creation (Bridge Pattern)", studyIdNumeric);
            }
            
            // TODO: Send DDD command to StudyDesignAggregate
            // For now, create directly in read model (temporary bridge implementation)
            com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto createdArm = 
                studyCommandService.createStudyArm(studyIdNumeric, armData);
            
            log.info("REST: Study arm created successfully: {}", createdArm.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdArm);
            
        } catch (NumberFormatException nfe) {
            log.error("REST: Invalid identifier format (not UUID or numeric): {}", id);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error creating study arm for study: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // NOTE: PUT /api/arms/{armId} and DELETE /api/arms/{armId} have been moved to
    // StudyArmsCommandController.java to avoid path conflicts
    
    // ===================== FORM BINDING COMMAND ENDPOINTS (Bridge Pattern) =====================
    
    /**
     * Assign a form to a visit (create form binding)
     * 
     * Bridge endpoint: Frontend calls POST /studies/{studyId}/visits/{visitId}/forms/{formId}
     * Backend DDD: AssignFormToVisitCommand
     * 
     * Command: AssignFormToVisitCommand
     * Event: FormAssignedToVisitEvent
     * 
     * @param studyId Study identifier (UUID or numeric ID)
     * @param visitId Visit UUID
     * @param formId Form definition ID
     * @param bindingData Form binding configuration
     * @return 201 Created with created binding data
     */
    @PostMapping("/{studyId}/visits/{visitId}/forms/{formId}")
    public ResponseEntity<Map<String, Object>> assignFormToVisit(
            @PathVariable String studyId,
            @PathVariable String visitId,
            @PathVariable Long formId,
            @RequestBody Map<String, Object> bindingData) {
        
        log.info("REST: Assigning form {} to visit {} for study: {}", formId, visitId, studyId);
        log.debug("REST: Binding data: {}", bindingData);
        
        try {
            // Ensure StudyDesign aggregate exists and get its ID
            UUID studyDesignId = studyDesignAutoInitService.ensureStudyDesignExists(studyId).join();
            log.info("REST: Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
            
            // Auto-calculate next available display order by checking existing assignments for this visit
            Integer displayOrder;
            if (bindingData.containsKey("displayOrder")) {
                displayOrder = ((Number) bindingData.get("displayOrder")).intValue();
            } else {
                // Query existing assignments for this visit and get max display order
                List<com.clinprecision.clinopsservice.entity.VisitFormEntity> existingAssignments = 
                    visitFormRepository.findByAggregateUuidOrderByDisplayOrderAsc(studyDesignId);
                
                // Filter for this specific visit UUID
                UUID visitUuid = UUID.fromString(visitId);
                int maxOrder = existingAssignments.stream()
                    .filter(vf -> vf.getVisitUuid() != null && vf.getVisitUuid().equals(visitUuid))
                    .filter(vf -> vf.getIsDeleted() == null || !vf.getIsDeleted())
                    .mapToInt(vf -> vf.getDisplayOrder() != null ? vf.getDisplayOrder() : 0)
                    .max()
                    .orElse(0);
                
                displayOrder = maxOrder + 1;
                log.info("REST: Auto-calculated display order: {} for visit: {}", displayOrder, visitId);
            }
            
            // Create UUID for formId using deterministic UUID generation (bridge pattern)
            // Format: 00000000-0000-0000-0000-{formId padded to 12 digits}
            UUID formUuid = UUID.fromString(String.format("00000000-0000-0000-0000-%012d", formId));
            
            // Create request DTO
            com.clinprecision.clinopsservice.studydesign.dto.AssignFormToVisitRequest request = 
                com.clinprecision.clinopsservice.studydesign.dto.AssignFormToVisitRequest.builder()
                    .visitId(UUID.fromString(visitId))
                    .formId(formUuid)
                    .isRequired((Boolean) bindingData.getOrDefault("isRequired", true))
                    .isConditional((Boolean) bindingData.getOrDefault("isConditional", false))
                    .conditionalLogic((String) bindingData.get("conditionalLogic"))
                    .displayOrder(displayOrder)
                    .instructions((String) bindingData.get("instructions"))
                    .assignedBy(1L) // TODO: Get from security context
                    .build();
            
            // Send command via StudyDesignCommandService
            UUID assignmentId = studyDesignCommandService.assignFormToVisit(studyDesignId, request).join();
            
            log.info("REST: Form binding created with assignment ID: {}", assignmentId);
            
            // Return response matching frontend expectations
            Map<String, Object> response = Map.of(
                "id", assignmentId.toString(),
                "studyId", studyId,
                "visitId", visitId,
                "visitDefinitionId", visitId,
                "formId", formId,
                "formDefinitionId", formId,
                "isRequired", request.getIsRequired(),
                "timing", bindingData.getOrDefault("timing", "ANY_TIME"),
                "conditions", bindingData.getOrDefault("conditions", new Object[0]),
                "reminders", bindingData.getOrDefault("reminders", Map.of("enabled", true, "days", new int[]{1}))
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalStateException e) {
            log.error("REST: Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "BUSINESS_RULE_VIOLATION",
                    "message", e.getMessage()
                ));
        } catch (java.util.concurrent.CompletionException e) {
            // Unwrap CompletionException from async command
            if (e.getCause() instanceof IllegalStateException) {
                log.error("REST: Business rule violation: {}", e.getCause().getMessage());
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "BUSINESS_RULE_VIOLATION",
                        "message", e.getCause().getMessage()
                    ));
            }
            log.error("REST: Error assigning form {} to visit {} for study: {}", formId, visitId, studyId, e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "INTERNAL_ERROR",
                    "message", "An error occurred while assigning the form"
                ));
        } catch (Exception e) {
            log.error("REST: Error assigning form {} to visit {} for study: {}", formId, visitId, studyId, e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "INTERNAL_ERROR",
                    "message", "An error occurred while assigning the form"
                ));
        }
    }
    
}
