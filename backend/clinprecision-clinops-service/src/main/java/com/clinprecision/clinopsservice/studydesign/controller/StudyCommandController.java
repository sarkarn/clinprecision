package com.clinprecision.clinopsservice.studydesign.controller;

import com.clinprecision.clinopsservice.studydesign.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ProtocolNumber;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyPhase;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyStatus;
import com.clinprecision.clinopsservice.studydesign.dto.*;
import com.clinprecision.clinopsservice.studydesign.service.StudyCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Study Command Controller
 * 
 * REST API for study write operations (command side).
 * Following CQRS pattern: Commands modify state and return identifiers.
 * 
 * Endpoints:
 * - POST   /api/studies           - Create study
 * - PUT    /api/studies/{id}/status - Change status
 * - PUT    /api/studies/{id}      - Update details
 * - DELETE /api/studies/{id}      - Close study
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Slf4j
public class StudyCommandController {

    private final StudyCommandService studyCommandService;

    /**
     * Create a new study
     * 
     * @param request Study creation request
     * @return 201 Created with study ID
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createStudy(@RequestBody CreateStudyRequest request) {
        log.info("REST: Creating study: {}", request.getName());
        
        try {
            // Generate new study ID
            UUID studyId = studyCommandService.generateStudyId();
            
            // Build command
            CreateStudyCommand command = CreateStudyCommand.builder()
                .studyId(studyId)
                .name(request.getName())
                .description(request.getDescription())
                .sponsor(request.getSponsor())
                .protocolNumber(ProtocolNumber.of(request.getProtocolNumber()))
                .phase(StudyPhase.valueOf(request.getPhase()))
                .indication(request.getIndication())
                .studyType(request.getStudyType())
                .principalInvestigator(request.getPrincipalInvestigator())
                .plannedSubjects(request.getPlannedSubjects())
                .plannedSites(request.getPlannedSites())
                .plannedStartDate(request.getPlannedStartDate())
                .plannedEndDate(request.getPlannedEndDate())
                .createdBy(request.getCreatedBy())
                .build();
            
            // Execute command synchronously for REST API
            UUID createdStudyId = studyCommandService.createStudySync(command);
            
            log.info("Study created successfully: {}", createdStudyId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "studyId", createdStudyId.toString(),
                    "message", "Study created successfully"
                ));
                
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating study", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create study: " + e.getMessage()));
        }
    }

    /**
     * Change study status
     * 
     * CRITICAL: This is the explicit API endpoint that replaces database triggers!
     * All status changes MUST go through this endpoint.
     * 
     * @param id Study aggregate UUID
     * @param request Status change request
     * @return 200 OK
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> changeStatus(
            @PathVariable UUID id,
            @RequestBody ChangeStatusRequest request) {
        
        log.info("REST: Changing study status: {} to {}", id, request.getNewStatus());
        
        try {
            // Build command
            ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
                .studyId(id)
                .newStatus(StudyStatus.valueOf(request.getNewStatus()))
                .reason(request.getReason())
                .userId(request.getUserId())
                .build();
            
            // Execute command synchronously
            studyCommandService.changeStudyStatusSync(command);
            
            log.info("Study status changed successfully: {} to {}", id, request.getNewStatus());
            
            return ResponseEntity.ok(Map.of(
                "message", "Study status changed successfully",
                "studyId", id.toString(),
                "newStatus", request.getNewStatus()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Validation error changing study status", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error changing study status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to change study status: " + e.getMessage()));
        }
    }

    /**
     * Update study details
     * 
     * @param id Study aggregate UUID
     * @param request Update request
     * @return 200 OK
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateStudy(
            @PathVariable UUID id,
            @RequestBody UpdateStudyRequest request) {
        
        log.info("REST: Updating study: {}", id);
        
        try {
            // Build command
            UpdateStudyDetailsCommand command = UpdateStudyDetailsCommand.builder()
                .studyId(id)
                .name(request.getName())
                .description(request.getDescription())
                .indication(request.getIndication())
                .studyType(request.getStudyType())
                .principalInvestigator(request.getPrincipalInvestigator())
                .plannedSubjects(request.getPlannedSubjects())
                .plannedSites(request.getPlannedSites())
                .plannedStartDate(request.getPlannedStartDate())
                .plannedEndDate(request.getPlannedEndDate())
                .updatedBy(request.getUpdatedBy())
                .build();
            
            // Execute command synchronously
            studyCommandService.updateStudyDetailsSync(command);
            
            log.info("Study updated successfully: {}", id);
            
            return ResponseEntity.ok(Map.of(
                "message", "Study updated successfully",
                "studyId", id.toString()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Validation error updating study", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update study: " + e.getMessage()));
        }
    }

    /**
     * Close study
     * 
     * @param id Study aggregate UUID
     * @param request Close study request
     * @return 200 OK
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> closeStudy(
            @PathVariable UUID id,
            @RequestBody CloseStudyRequest request) {
        
        log.info("REST: Closing study: {} with reason: {}", id, request.getClosureReason());
        
        try {
            // Build command
            CloseStudyCommand command = CloseStudyCommand.builder()
                .studyId(id)
                .closureReason(CloseStudyCommand.ClosureReason.valueOf(request.getClosureReason()))
                .closureNotes(request.getClosureNotes())
                .closedBy(request.getUserId())
                .build();
            
            // Execute command synchronously
            studyCommandService.closeStudySync(command);
            
            log.info("Study closed successfully: {}", id);
            
            return ResponseEntity.ok(Map.of(
                "message", "Study closed successfully",
                "studyId", id.toString(),
                "closureReason", request.getClosureReason()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Validation error closing study", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error closing study", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to close study: " + e.getMessage()));
        }
    }
}
