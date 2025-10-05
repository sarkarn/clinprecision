package com.clinprecision.clinopsservice.study.controller;

import com.clinprecision.clinopsservice.study.dto.request.*;
import com.clinprecision.clinopsservice.study.service.StudyCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
     * Publish a study (set status to ACTIVE)
     * 
     * Command: ActivateStudyCommand
     * Event: StudyActivatedEvent
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK
     */
    @PatchMapping("/{uuid}/publish")
    public ResponseEntity<Void> publishStudy(@PathVariable UUID uuid) {
        log.info("REST: Publishing study: {}", uuid);
        
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
    @PatchMapping("/{uuid}/status")
    public ResponseEntity<Void> changeStudyStatus(
            @PathVariable UUID uuid,
            @RequestBody Map<String, String> request) {
        
        String newStatus = request.get("newStatus");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("newStatus is required");
        }
        
        log.info("REST: Changing study status: {} to {}", uuid, newStatus);
        
        // Delegate to appropriate command based on status
        switch (newStatus.toUpperCase()) {
            case "ACTIVE":
                // TODO: Implement activateStudy method in StudyCommandService
                log.warn("Study activation not yet implemented: {}", uuid);
                throw new UnsupportedOperationException("Study activation not yet implemented");
            case "SUSPENDED":
                studyCommandService.suspendStudy(uuid, 
                    SuspendStudyRequestDto.builder()
                        .reason(request.get("reason"))
                        .build());
                break;
            case "COMPLETED":
                studyCommandService.completeStudy(uuid);
                break;
            case "TERMINATED":
                studyCommandService.terminateStudy(uuid, 
                    TerminateStudyRequestDto.builder()
                        .reason(request.get("reason"))
                        .build());
                break;
            default:
                throw new IllegalArgumentException("Unsupported status transition: " + newStatus);
        }
        
        log.info("REST: Study status changed successfully: {} to {}", uuid, newStatus);
        return ResponseEntity.ok().build();
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
}
