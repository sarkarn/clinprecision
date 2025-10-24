package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.controller;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto.*;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationCommentEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.mapper.ProtocolDeviationMapper;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.service.ProtocolDeviationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API Controller for Protocol Deviation Management
 * 
 * Endpoints:
 * - POST   /api/v1/deviations - Record new deviation
 * - GET    /api/v1/deviations/{id} - Get deviation by ID
 * - PUT    /api/v1/deviations/{id}/status - Update deviation status
 * - POST   /api/v1/deviations/{id}/comments - Add comment
 * - GET    /api/v1/deviations/{id}/comments - Get comments
 * - GET    /api/v1/patients/{patientId}/deviations - Get patient deviations
 * - GET    /api/v1/studies/{studyId}/deviations - Get study deviations
 */
@RestController
@RequestMapping("/api/v1/deviations")
@RequiredArgsConstructor
@Slf4j
public class ProtocolDeviationController {

    private final ProtocolDeviationService deviationService;
    private final ProtocolDeviationMapper mapper;

    /**
     * Record a new protocol deviation
     * 
     * @param request Deviation details
     * @return Created deviation with generated ID
     */
    @PostMapping
    public ResponseEntity<ProtocolDeviationResponse> recordDeviation(
            @Valid @RequestBody CreateDeviationRequest request) {
        
        log.info("API Request: Record protocol deviation for patient {}, type: {}, severity: {}", 
                request.getPatientId(), request.getDeviationType(), request.getSeverity());
        
        try {
            // Build entity from request
            ProtocolDeviationEntity deviation = ProtocolDeviationEntity.builder()
                    .patientId(request.getPatientId())
                    .studyId(request.getStudyId())
                    .studySiteId(request.getStudySiteId())
                    .visitInstanceId(request.getVisitInstanceId())
                    .deviationType(request.getDeviationType())
                    .severity(request.getSeverity())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .protocolSection(request.getProtocolSection())
                    .expectedProcedure(request.getExpectedProcedure())
                    .actualProcedure(request.getActualProcedure())
                    .deviationDate(request.getDeviationDate())
                    .rootCause(request.getRootCause())
                    .immediateAction(request.getImmediateAction())
                    .correctiveAction(request.getCorrectiveAction())
                    .preventiveAction(request.getPreventiveAction())
                    .detectedBy(request.getDetectedBy())
                    .build();
            
            ProtocolDeviationEntity saved = deviationService.recordDeviation(deviation);
            
            log.info("API Response: Deviation recorded successfully with ID: {}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(saved));
            
        } catch (Exception e) {
            log.error("Error recording protocol deviation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to record protocol deviation", e);
        }
    }

    /**
     * Get deviation by ID
     * 
     * @param id Deviation ID
     * @return Deviation details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProtocolDeviationResponse> getDeviationById(@PathVariable Long id) {
        log.info("API Request: Get deviation by ID: {}", id);
        
        try {
            ProtocolDeviationEntity deviation = deviationService.getDeviationById(id);
            return ResponseEntity.ok(mapper.toResponse(deviation));
            
        } catch (Exception e) {
            log.error("Error fetching deviation {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update deviation status
     * 
     * @param id Deviation ID
     * @param request Status update request
     * @return Updated deviation
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ProtocolDeviationResponse> updateDeviationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeviationStatusRequest request) {
        
        log.info("API Request: Update deviation {} status to: {}", id, request.getNewStatus());
        
        try {
            ProtocolDeviationEntity updated = deviationService.updateDeviationStatus(
                    id, request.getNewStatus(), request.getUserId());
            
            log.info("API Response: Deviation {} status updated successfully", id);
            return ResponseEntity.ok(mapper.toResponse(updated));
            
        } catch (Exception e) {
            log.error("Error updating deviation {} status: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add a comment to a deviation
     * 
     * @param id Deviation ID
     * @param request Comment details
     * @return Created comment
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<DeviationCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request) {
        
        log.info("API Request: Add comment to deviation {} by user {}", id, request.getCommentedBy());
        
        try {
            ProtocolDeviationCommentEntity comment = deviationService.addComment(
                    id, request.getCommentText(), request.getCommentedBy(), 
                    request.getIsInternal() != null && request.getIsInternal());
            
            log.info("API Response: Comment added successfully to deviation {}", id);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(comment));
            
        } catch (Exception e) {
            log.error("Error adding comment to deviation {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get comments for a deviation
     * 
     * @param id Deviation ID
     * @return List of comments
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<DeviationCommentResponse>> getComments(@PathVariable Long id) {
        log.info("API Request: Get comments for deviation {}", id);
        
        try {
            List<ProtocolDeviationCommentEntity> comments = deviationService.getCommentsByDeviation(id);
            List<DeviationCommentResponse> responses = comments.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching comments for deviation {}: {}", id, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get all deviations for a patient
     * 
     * @param patientId Patient ID
     * @return List of deviations
     */
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<List<ProtocolDeviationResponse>> getPatientDeviations(
            @PathVariable Long patientId) {
        
        log.info("API Request: Get deviations for patient {}", patientId);
        
        try {
            List<ProtocolDeviationEntity> deviations = deviationService.getDeviationsByPatient(patientId);
            List<ProtocolDeviationResponse> responses = deviations.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            log.info("API Response: Found {} deviations for patient {}", responses.size(), patientId);
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching deviations for patient {}: {}", patientId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get active deviations for a patient
     * 
     * @param patientId Patient ID
     * @return List of active deviations
     */
    @GetMapping("/patients/{patientId}/active")
    public ResponseEntity<List<ProtocolDeviationResponse>> getActivePatientDeviations(
            @PathVariable Long patientId) {
        
        log.info("API Request: Get active deviations for patient {}", patientId);
        
        try {
            List<ProtocolDeviationEntity> deviations = deviationService.getActiveDeviationsByPatient(patientId);
            List<ProtocolDeviationResponse> responses = deviations.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching active deviations for patient {}: {}", patientId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get all deviations for a study
     * 
     * @param studyId Study ID
     * @return List of deviations
     */
    @GetMapping("/studies/{studyId}")
    public ResponseEntity<List<ProtocolDeviationResponse>> getStudyDeviations(
            @PathVariable Long studyId) {
        
        log.info("API Request: Get deviations for study {}", studyId);
        
        try {
            List<ProtocolDeviationEntity> deviations = deviationService.getDeviationsByStudy(studyId);
            List<ProtocolDeviationResponse> responses = deviations.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            log.info("API Response: Found {} deviations for study {}", responses.size(), studyId);
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching deviations for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get critical deviations for a study
     * 
     * @param studyId Study ID
     * @return List of critical deviations
     */
    @GetMapping("/studies/{studyId}/critical")
    public ResponseEntity<List<ProtocolDeviationResponse>> getCriticalStudyDeviations(
            @PathVariable Long studyId) {
        
        log.info("API Request: Get critical deviations for study {}", studyId);
        
        try {
            List<ProtocolDeviationEntity> deviations = deviationService.getCriticalDeviationsByStudy(studyId);
            List<ProtocolDeviationResponse> responses = deviations.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching critical deviations for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get unreported deviations (requiring IRB/Sponsor reporting)
     * 
     * @return List of unreported deviations
     */
    @GetMapping("/unreported")
    public ResponseEntity<List<ProtocolDeviationResponse>> getUnreportedDeviations() {
        log.info("API Request: Get unreported deviations");
        
        try {
            List<ProtocolDeviationEntity> deviations = deviationService.getUnreportedDeviations();
            List<ProtocolDeviationResponse> responses = deviations.stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            
            log.info("API Response: Found {} unreported deviations", responses.size());
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching unreported deviations: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }
}
