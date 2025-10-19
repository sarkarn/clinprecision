package com.clinprecision.clinopsservice.studydesign.studymgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.build.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.studydesign.build.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmRequestDto;
import com.clinprecision.clinopsservice.studydesign.design.dto.AssignFormToVisitRequest;
import com.clinprecision.clinopsservice.studydesign.design.dto.DesignProgressResponseDto;
import com.clinprecision.clinopsservice.studydesign.design.dto.DesignProgressUpdateRequestDto;
import com.clinprecision.clinopsservice.studydesign.design.service.DesignProgressService;
import com.clinprecision.clinopsservice.studydesign.studymgmt.api.StudyApiConstants;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyCommandService;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyQueryService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignAutoInitializationService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignCommandService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.CreateProtocolVersionCommand;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionIdentifier;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionNumber;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto.CreateVersionRequest;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionCommandService;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.exception.StudyStatusTransitionException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
 * <p><b>⚠️ URL MIGRATION IN PROGRESS</b></p>
 * <p>This controller supports both old and new URL patterns during the migration period.
 * Old URLs are deprecated and will be removed on April 19, 2026.</p>
 * 
 * <p><b>Old URLs (DEPRECATED):</b></p>
 * <ul>
 *   <li>POST   /api/studies - Create study</li>
 *   <li>PUT    /api/studies/{uuid} - Update study</li>
 *   <li>POST   /api/studies/{uuid}/details - Update study details</li>
 *   <li>PATCH  /api/studies/{uuid}/publish - Publish study</li>
 *   <li>PATCH  /api/studies/{uuid}/status - Change study status</li>
 *   <li>POST   /api/studies/{uuid}/suspend - Suspend study</li>
 *   <li>POST   /api/studies/{uuid}/resume - Resume study</li>
 *   <li>POST   /api/studies/{uuid}/complete - Complete study</li>
 *   <li>POST   /api/studies/{uuid}/terminate - Terminate study</li>
 *   <li>POST   /api/studies/{uuid}/withdraw - Withdraw study</li>
 * </ul>
 * 
 * <p><b>New URLs (RECOMMENDED):</b></p>
 * <ul>
 *   <li>POST   /api/v1/study-design/studies - Create study</li>
 *   <li>PUT    /api/v1/study-design/studies/{uuid} - Update study</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/details - Update study details</li>
 *   <li>PATCH  /api/v1/study-design/studies/{uuid}/publish - Publish study</li>
 *   <li>PATCH  /api/v1/study-design/studies/{uuid}/status - Change study status</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/lifecycle/suspend - Suspend study</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/lifecycle/resume - Resume study</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/lifecycle/complete - Complete study</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/lifecycle/terminate - Terminate study</li>
 *   <li>POST   /api/v1/study-design/studies/{uuid}/lifecycle/withdraw - Withdraw study</li>
 * </ul>
 * 
 * <p><b>Migration Timeline:</b></p>
 * <ul>
 *   <li>Phase 1 (Oct 2025 - Apr 2026): Both URLs work, old URLs include deprecation headers</li>
 *   <li>Phase 2 (Apr 2026 - Oct 2026): Sunset warnings, old URLs still work</li>
 *   <li>Phase 3 (Oct 2026+): Old URLs removed</li>
 * </ul>
 * 
 * <p><b>Architecture:</b></p>
 * <ul>
 *   <li>Receives DTOs from frontend</li>
 *   <li>Delegates to StudyCommandService</li>
 *   <li>Returns UUIDs or status codes</li>
 *   <li>No direct database access</li>
 * </ul>
 * 
 * @author DDD Migration Team
 * @version 1.0 (URL Refactoring - October 2025)
 * @since V004 Migration
 */
@RestController
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyCommandController {

    private final StudyCommandService studyCommandService;
    private final DesignProgressService designProgressService;
    private final StudyDesignCommandService studyDesignCommandService;
    private final StudyDesignAutoInitializationService studyDesignAutoInitService;
    private final VisitFormRepository visitFormRepository;
    private final StudyQueryService studyQueryService;
    private final ProtocolVersionCommandService protocolVersionCommandService;

    /**
     * Create a new study
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies</li>
     * </ul>
     * 
     * Command: CreateStudyCommand
     * Event: StudyCreatedEvent
     * 
     * @param request Study creation request with name, description, phase, etc.
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 201 Created with study aggregate UUID
     */
    @PostMapping(value = {
        StudyApiConstants.CreateStudy.OLD,
        StudyApiConstants.CreateStudy.NEW
    })
    public ResponseEntity<Map<String, UUID>> createStudy(
            @Valid @RequestBody StudyCreateRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.CreateStudy.OLD,
            StudyApiConstants.CreateStudy.NEW
        );
        
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
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): PUT /api/studies/{uuid}</li>
     *   <li>New (recommended): PUT /api/v1/study-design/studies/{uuid}</li>
     * </ul>
     * 
     * Command: UpdateStudyCommand
     * Event: StudyUpdatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Study update request (partial update)
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PutMapping(value = {
        StudyApiConstants.UpdateStudy.OLD,
        StudyApiConstants.UpdateStudy.NEW
    })
    public ResponseEntity<Void> updateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody StudyUpdateRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Updating study: {}", uuid);
        
        studyCommandService.updateStudy(uuid, request);
        
        log.info("REST: Study updated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Update study details (specific endpoint for StudyEditPage.jsx)
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/details</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/details</li>
     * </ul>
     * 
     * Command: UpdateStudyCommand
     * Event: StudyUpdatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Study update request
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.UpdateStudyDetails.OLD,
        StudyApiConstants.UpdateStudyDetails.NEW
    })
    public ResponseEntity<Void> updateStudyDetails(
            @PathVariable UUID uuid,
            @Valid @RequestBody StudyUpdateRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Updating study details: {}", uuid);
        
        studyCommandService.updateStudy(uuid, request);
        
        log.info("REST: Study details updated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Publish a study (set status to ACTIVE).
     * Supports both Long ID and UUID for gradual migration.
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): PATCH /api/studies/{studyId}/publish</li>
     *   <li>New (recommended): PATCH /api/v1/study-design/studies/{studyId}/publish</li>
     * </ul>
     * 
     * Publishing a study means activating it (APPROVED → ACTIVE transition).
     * This makes the study available for data capture and participant enrollment.
     * 
     * Command: ChangeStudyStatusCommand
     * Event: StudyStatusChangedEvent
     * 
     * @param studyId Study ID (Long or UUID string)
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PatchMapping(value = {
        StudyApiConstants.PublishStudy.OLD,
        StudyApiConstants.PublishStudy.NEW
    })
    public ResponseEntity<Void> publishStudy(
            @PathVariable String studyId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        // Bridge pattern: Resolve Study aggregate UUID (not StudyDesign UUID!)
        UUID studyAggregateUuid;
        try {
            // Try as UUID first
            studyAggregateUuid = UUID.fromString(studyId);
        } catch (IllegalArgumentException e) {
            // If not a UUID, treat as Long ID and look up the study
            try {
                Long studyLongId = Long.parseLong(studyId);
                studyAggregateUuid = studyQueryService.findStudyEntityById(studyLongId)
                    .map(entity -> entity.getAggregateUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Study not found with ID: " + studyId));
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("Invalid study ID format: " + studyId);
            }
        }
        
        log.info("REST: Publishing study: {} (UUID: {})", studyId, studyAggregateUuid);
        
        // Publishing means activating the study (APPROVED → ACTIVE)
        try {
            studyCommandService.changeStudyStatus(studyAggregateUuid, "ACTIVE", "Study published via UI");
            log.info("Study published successfully: {}", studyAggregateUuid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error publishing study: {}", studyAggregateUuid, e);
            throw e;
        }
    }

    /**
     * Change study status (generic status change)
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): PATCH /api/studies/{studyId}/status</li>
     *   <li>New (recommended): PATCH /api/v1/study-design/studies/{studyId}/status</li>
     * </ul>
     * 
     * Command: Various status commands
     * Event: Various status events
     * 
     * @param studyId Study aggregate UUID or legacy ID
     * @param request Map containing "newStatus" field
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PatchMapping(value = {
        StudyApiConstants.UpdateStudyStatus.OLD,
        StudyApiConstants.UpdateStudyStatus.NEW
    })
    public ResponseEntity<Void> changeStudyStatus(
            @PathVariable String studyId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
                StudyResponseDto study =
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
            
        } catch (StudyStatusTransitionException ex) {
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
            return "At least one protocol version must be activated before the study can be approved.";
        }
        
        if (message.contains("active protocol version")) {
            return "At least one protocol version must be activated before the study can be approved.";
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
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/suspend</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/lifecycle/suspend</li>
     * </ul>
     * 
     * Command: SuspendStudyCommand
     * Event: StudySuspendedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Suspension request with reason
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.SuspendStudy.OLD,
        StudyApiConstants.SuspendStudy.NEW
    })
    public ResponseEntity<Void> suspendStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody SuspendStudyRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Suspending study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.suspendStudy(uuid, request);
        
        log.info("REST: Study suspended successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Resume study (from suspended state)
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/resume</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/lifecycle/resume</li>
     * </ul>
     * 
     * Command: ActivateStudyCommand
     * Event: StudyActivatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.ResumeStudy.OLD,
        StudyApiConstants.ResumeStudy.NEW
    })
    public ResponseEntity<Void> resumeStudy(
            @PathVariable UUID uuid,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Resuming study: {}", uuid);
        
        // TODO: Implement resumeStudy method in StudyCommandService
        // studyCommandService.resumeStudy(uuid);
        log.warn("Study resume not yet implemented: {}", uuid);
        return ResponseEntity.status(501).build(); // Not Implemented
    }

    /**
     * Complete study
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/complete</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/lifecycle/complete</li>
     * </ul>
     * 
     * Command: CompleteStudyCommand
     * Event: StudyCompletedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.CompleteStudy.OLD,
        StudyApiConstants.CompleteStudy.NEW
    })
    public ResponseEntity<Void> completeStudy(
            @PathVariable UUID uuid,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Completing study: {}", uuid);
        
        studyCommandService.completeStudy(uuid);
        
        log.info("REST: Study completed successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Terminate study
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/terminate</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/lifecycle/terminate</li>
     * </ul>
     * 
     * Command: TerminateStudyCommand
     * Event: StudyTerminatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Termination request with reason
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.TerminateStudy.OLD,
        StudyApiConstants.TerminateStudy.NEW
    })
    public ResponseEntity<Void> terminateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody TerminateStudyRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Terminating study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.terminateStudy(uuid, request);
        
        log.info("REST: Study terminated successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Withdraw study
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{uuid}/withdraw</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{uuid}/lifecycle/withdraw</li>
     * </ul>
     * 
     * Command: WithdrawStudyCommand
     * Event: StudyWithdrawnEvent
     * 
     * @param uuid Study aggregate UUID
     * @param request Withdrawal request with reason
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK
     */
    @PostMapping(value = {
        StudyApiConstants.WithdrawStudy.OLD,
        StudyApiConstants.WithdrawStudy.NEW
    })
    public ResponseEntity<Void> withdrawStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody WithdrawStudyRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
        log.info("REST: Withdrawing study: {} - Reason: {}", uuid, request.getReason());
        
        studyCommandService.withdrawStudy(uuid, request);
        
        log.info("REST: Study withdrawn successfully: {}", uuid);
        return ResponseEntity.ok().build();
    }

    /**
     * Initialize design progress for a study (supports UUID or legacy ID)
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/studies/{id}/design-progress/initialize</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{id}/design-progress</li>
     * </ul>
     * 
     * Command: InitializeDesignProgressCommand (TODO)
     * Event: DesignProgressInitializedEvent (TODO)
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 201 Created
     * 
     * NOTE: This method is temporarily returning success without implementation
     * to prevent frontend errors. Actual implementation pending.
     */
    @PostMapping(value = {
        StudyApiConstants.InitializeDesignProgress.OLD,
        StudyApiConstants.InitializeDesignProgress.NEW
    })
    public ResponseEntity<Void> initializeDesignProgress(
            @PathVariable String id,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): PUT /api/studies/{id}/design-progress</li>
     *   <li>New (recommended): PUT /api/v1/study-design/studies/{id}/design-progress</li>
     * </ul>
     * 
     * Bridge endpoint: Frontend calls PUT /studies/{id}/design-progress
     * 
     * Command: UpdateDesignProgressCommand (TODO - future DDD implementation)
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @param updateRequest Design progress update data
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return 200 OK with updated design progress
     */
    @PutMapping(value = {
        StudyApiConstants.UpdateDesignProgress.OLD,
        StudyApiConstants.UpdateDesignProgress.NEW
    })
    public ResponseEntity<DesignProgressResponseDto> updateDesignProgress(
            @PathVariable String id,
            @Valid @RequestBody DesignProgressUpdateRequestDto updateRequest,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyApiConstants.OLD_BASE_PATH,
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
    public ResponseEntity<StudyArmResponseDto> createStudyArm(
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
            StudyArmResponseDto createdArm =
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
                List<VisitFormEntity> existingAssignments =
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
            AssignFormToVisitRequest request =
                AssignFormToVisitRequest.builder()
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

    /**
     * Bridge Endpoint: Create protocol version for a study
     * POST /api/studies/{studyId}/versions
     * 
     * Bridge Pattern: Accepts legacy study ID and resolves to Study UUID
     * to create protocol version via ProtocolVersionCommandController
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param versionData Protocol version data
     * @return 201 CREATED with version UUID
     */
    @PostMapping("/{studyId}/versions")
    public ResponseEntity<?> createProtocolVersion(
            @PathVariable String studyId,
            @RequestBody Map<String, Object> versionData) {
        
        log.info("REST: Bridge endpoint - Create protocol version for study: {}", studyId);
        
        try {
            // Resolve Study aggregate UUID
            UUID studyAggregateUuid;
            try {
                // Try as UUID first
                studyAggregateUuid = UUID.fromString(studyId);
                log.debug("REST: Using UUID format for version creation");
            } catch (IllegalArgumentException e) {
                // Not a UUID, try as legacy ID
                try {
                    Long legacyId = Long.parseLong(studyId);
                    log.info("REST: Using legacy ID {} for version creation (Bridge Pattern)", legacyId);
                    
                    StudyResponseDto study =
                        studyQueryService.getStudyById(legacyId);
                    studyAggregateUuid = study.getStudyAggregateUuid();
                    
                    if (studyAggregateUuid == null) {
                        log.error("REST: Study {} has no aggregate UUID", legacyId);
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Study " + legacyId + " has not been migrated to DDD yet"));
                    }
                } catch (NumberFormatException nfe) {
                    log.error("REST: Invalid identifier format: {}", studyId);
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid study ID format: " + studyId));
                }
            }
            
            log.info("REST: Creating protocol version for Study UUID: {}", studyAggregateUuid);
            
            // Build CreateVersionRequest
            CreateVersionRequest request =
                new CreateVersionRequest();
            request.setStudyAggregateUuid(studyAggregateUuid);
            request.setVersionNumber((String) versionData.get("versionNumber"));
            request.setDescription((String) versionData.get("description"));
            // Handle amendment type - default to INITIAL for first version
            request.setAmendmentType(versionData.containsKey("amendmentType") ? 
                AmendmentType.valueOf(
                    (String) versionData.get("amendmentType")) : 
                AmendmentType.INITIAL);
            request.setChangesSummary((String) versionData.get("changesSummary"));
            request.setImpactAssessment((String) versionData.get("impactAssessment"));
            request.setRequiresRegulatoryApproval(
                versionData.containsKey("requiresRegulatoryApproval") ? 
                    (Boolean) versionData.get("requiresRegulatoryApproval") : true);
            request.setProtocolChanges((String) versionData.get("protocolChanges"));
            request.setIcfChanges((String) versionData.get("icfChanges"));
            
            // Handle createdBy - can be Integer or String from frontend
            Long createdBy = 1L; // Default value
            Object createdByValue = versionData.get("createdBy");
            if (createdByValue != null) {
                if (createdByValue instanceof Integer) {
                    createdBy = ((Integer) createdByValue).longValue();
                } else if (createdByValue instanceof Long) {
                    createdBy = (Long) createdByValue;
                } else if (createdByValue instanceof String) {
                    createdBy = Long.parseLong((String) createdByValue);
                }
            }
            request.setCreatedBy(createdBy);
            
            // Delegate to ProtocolVersionCommandService
            UUID versionId = VersionIdentifier.newIdentifier().getValue();
            
            CreateProtocolVersionCommand command =
                CreateProtocolVersionCommand.builder()
                    .versionId(versionId)
                    .studyAggregateUuid(studyAggregateUuid)
                    .versionNumber(VersionNumber.of(request.getVersionNumber()))
                    .description(request.getDescription())
                    .amendmentType(request.getAmendmentType())
                    .changesSummary(request.getChangesSummary())
                    .impactAssessment(request.getImpactAssessment())
                    .requiresRegulatoryApproval(request.getRequiresRegulatoryApproval())
                    .protocolChanges(request.getProtocolChanges())
                    .icfChanges(request.getIcfChanges())
                    .createdBy(request.getCreatedBy())
                    .build();
            
            UUID createdId = protocolVersionCommandService.createVersionSync(command);
            
            log.info("REST: Protocol version created with UUID: {}", createdId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", createdId.toString()));
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Validation error creating version for study: {}", studyId, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "VALIDATION_ERROR", "message", e.getMessage()));
        } catch (Exception ex) {
            log.error("REST: Failed to create protocol version for study: {}", studyId, ex);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "INTERNAL_ERROR", "message", "Failed to create protocol version: " + ex.getMessage()));
        }
    }

}
