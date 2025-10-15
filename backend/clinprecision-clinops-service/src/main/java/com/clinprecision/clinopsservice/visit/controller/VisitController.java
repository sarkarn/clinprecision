package com.clinprecision.clinopsservice.visit.controller;

import com.clinprecision.clinopsservice.visit.dto.CreateVisitRequest;
import com.clinprecision.clinopsservice.visit.dto.VisitDto;
import com.clinprecision.clinopsservice.visit.dto.VisitResponse;
import com.clinprecision.clinopsservice.visit.service.UnscheduledVisitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Unscheduled Visit Management
 * 
 * <p>Provides endpoints for creating and querying unscheduled visits in clinical trials.</p>
 * 
 * <p><b>Endpoints:</b></p>
 * <ul>
 *   <li>POST /api/v1/visits/unscheduled - Create a new unscheduled visit</li>
 *   <li>GET /api/v1/visits/patient/{patientId} - Get all visits for a patient</li>
 *   <li>GET /api/v1/visits/study/{studyId} - Get all visits for a study</li>
 *   <li>GET /api/v1/visits/type/{visitType} - Get visits by type</li>
 *   <li>GET /api/v1/visits/{visitId} - Get a specific visit</li>
 * </ul>
 * 
 * <p><b>Usage Flow:</b></p>
 * <pre>
 * 1. User changes patient status (e.g., REGISTERED → SCREENING)
 * 2. Frontend prompts: "Create screening visit?"
 * 3. User confirms
 * 4. Frontend calls: POST /api/v1/visits/unscheduled
 *    Request body: {
 *        "patientId": 123,
 *        "studyId": 456,
 *        "siteId": 789,
 *        "visitType": "SCREENING",
 *        "visitDate": "2025-10-15",
 *        "createdBy": "Dr. Smith",
 *        "notes": "Initial screening assessment"
 *    }
 * 5. Backend creates visit, returns visitId
 * 6. Frontend can then collect forms using visitId
 * </pre>
 * 
 * <p><b>Visit Types:</b></p>
 * <ul>
 *   <li>SCREENING - Eligibility assessment visit</li>
 *   <li>ENROLLMENT - Baseline data collection</li>
 *   <li>DISCONTINUATION - Exit forms and reason capture</li>
 *   <li>ADVERSE_EVENT - Unplanned safety assessment</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
@Slf4j
public class VisitController {

    private final UnscheduledVisitService visitService;

    /**
     * Create a new unscheduled visit
     * 
     * @param request CreateVisitRequest with visit details
     * @return ResponseEntity with VisitResponse (201 Created) or error (400/500)
     */
    @PostMapping("/unscheduled")
    public ResponseEntity<?> createUnscheduledVisit(@RequestBody CreateVisitRequest request) {
        log.info("REST: Creating unscheduled visit for patientId: {}, visitType: {}", 
                request.getPatientId(), request.getVisitType());
        
        try {
            VisitResponse response = visitService.createUnscheduledVisit(request);
            
            log.info("REST: Visit created successfully: visitId={}", response.getVisitId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Validation error creating visit: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
            
        } catch (Exception e) {
            log.error("REST: Error creating unscheduled visit", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create visit: " + e.getMessage()));
        }
    }

    /**
     * Get all visits for a patient
     * 
     * @param patientId Patient ID
     * @return ResponseEntity with List<VisitDto>
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VisitDto>> getPatientVisits(@PathVariable Long patientId) {
        log.debug("REST: Getting visits for patientId: {}", patientId);
        
        List<VisitDto> visits = visitService.getPatientVisits(patientId);
        
        log.debug("REST: Found {} visits for patientId: {}", visits.size(), patientId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get all visits for a study
     * 
     * @param studyId Study ID
     * @return ResponseEntity with List<VisitDto>
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<VisitDto>> getStudyVisits(@PathVariable Long studyId) {
        log.debug("REST: Getting visits for studyId: {}", studyId);
        
        List<VisitDto> visits = visitService.getStudyVisits(studyId);
        
        log.debug("REST: Found {} visits for studyId: {}", visits.size(), studyId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get visits by type
     * 
     * @param visitType Visit type (SCREENING, ENROLLMENT, etc.)
     * @return ResponseEntity with List<VisitDto>
     */
    @GetMapping("/type/{visitType}")
    public ResponseEntity<List<VisitDto>> getVisitsByType(@PathVariable String visitType) {
        log.debug("REST: Getting visits by type: {}", visitType);
        
        List<VisitDto> visits = visitService.getVisitsByType(visitType);
        
        log.debug("REST: Found {} visits for type: {}", visits.size(), visitType);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get a specific visit by ID
     * 
     * @param visitId Visit ID (Long primary key from study_visit_instances)
     * @return ResponseEntity with VisitDto or 404 if not found
     */
    @GetMapping("/{visitId}")
    public ResponseEntity<?> getVisitById(@PathVariable Long visitId) {
        log.debug("REST: Getting visit by visitId: {}", visitId);
        
        try {
            VisitDto visit = visitService.getVisitById(visitId);
            
            if (visit != null) {
                return ResponseEntity.ok(visit);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("REST: Error getting visit: {}", visitId, e);
            return ResponseEntity.badRequest().body(new ErrorResponse("Error retrieving visit: " + e.getMessage()));
        }
    }

    /**
     * Error response DTO
     */
    private static class ErrorResponse {
        private final String error;
        private final long timestamp;

        public ErrorResponse(String error) {
            this.error = error;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() {
            return error;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
