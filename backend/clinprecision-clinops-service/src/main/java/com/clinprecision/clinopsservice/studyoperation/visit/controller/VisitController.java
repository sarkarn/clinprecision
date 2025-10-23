package com.clinprecision.clinopsservice.studyoperation.visit.controller;

import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.studydesign.build.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.studydesign.build.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.studydesign.design.form.entity.FormDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.design.form.repository.FormDefinitionRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.CreateVisitRequest;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.UnscheduledVisitTypeDto;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.VisitDto;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.VisitFormDto;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.VisitResponse;
import com.clinprecision.clinopsservice.studyoperation.visit.entity.VisitEntity;
import com.clinprecision.clinopsservice.studyoperation.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.studyoperation.visit.repository.VisitRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.repository.StudyVisitInstanceRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.service.PatientVisitService;
import com.clinprecision.clinopsservice.studyoperation.visit.service.VisitFormQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    private final PatientVisitService visitService;
    private final VisitFormQueryService visitFormQueryService;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final VisitRepository visitRepository;
    private final StudyVisitInstanceRepository studyVisitInstanceRepository;
    private final VisitFormRepository visitFormRepository;
    private final FormDefinitionRepository formDefinitionRepository;

    /**
     * Get unscheduled visit definitions for a study
     * Returns all enabled unscheduled visit types that can be created on-demand
     * 
     * @param studyId Study ID
     * @return ResponseEntity with List<UnscheduledVisitTypeDto>
     */
    @GetMapping("/study/{studyId}/unscheduled-types")
    public ResponseEntity<List<UnscheduledVisitTypeDto>> getUnscheduledVisitTypes(@PathVariable Long studyId) {
        log.info("REST: Getting unscheduled visit types for studyId: {}", studyId);
        
        List<VisitDefinitionEntity> unscheduledVisits = visitDefinitionRepository
            .findUnscheduledVisitsByStudyId(studyId);
        
        // Convert entities to DTOs to avoid circular reference issues
        List<UnscheduledVisitTypeDto> visitTypeDtos = unscheduledVisits.stream()
            .map(visit -> UnscheduledVisitTypeDto.builder()
                .id(visit.getId())
                .name(visit.getName())
                .description(visit.getDescription())
                .visitCode(visit.getVisitCode())
                .visitOrder(visit.getVisitOrder())
                .isRequired(visit.getIsRequired())
                .build())
            .collect(Collectors.toList());
        
        log.info("REST: Found {} unscheduled visit types for studyId: {}", 
                visitTypeDtos.size(), studyId);
        
        return ResponseEntity.ok(visitTypeDtos);
    }

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
     * Get all forms associated with a visit instance
     * Gap #2: Visit-Form Association API
     * 
     * Returns forms that are defined in the protocol schedule for this visit.
     * For protocol visits (Screening, Baseline, etc.), returns forms from visit_forms table.
     * For unscheduled visits, returns empty list (no pre-defined forms).
     * 
     * @param visitInstanceId Visit instance Long ID (from study_visit_instances.id)
     * @return ResponseEntity with List<VisitFormDto> or 404 if visit not found
     */
    @GetMapping("/{visitInstanceId}/forms")
    public ResponseEntity<?> getVisitForms(@PathVariable Long visitInstanceId) {
        log.info("REST: Getting forms for visit instance: {}", visitInstanceId);
        
        try {
            List<VisitFormDto> forms = visitFormQueryService.getFormsForVisitInstance(visitInstanceId);
            
            log.info("REST: Found {} forms for visit instance: {}", forms.size(), visitInstanceId);
            return ResponseEntity.ok(forms);
            
        } catch (RuntimeException e) {
            log.error("REST: Error fetching forms for visit {}: {}", visitInstanceId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Visit not found: " + visitInstanceId));
                    
        } catch (Exception e) {
            log.error("REST: Error getting visit forms", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve visit forms: " + e.getMessage()));
        }
    }

    /**
     * Get only required forms for a visit instance
     * 
     * @param visitInstanceId Visit instance Long ID
     * @return ResponseEntity with List<VisitFormDto> containing only required forms
     */
    @GetMapping("/{visitInstanceId}/forms/required")
    public ResponseEntity<?> getRequiredForms(@PathVariable Long visitInstanceId) {
        log.info("REST: Getting required forms for visit instance: {}", visitInstanceId);
        
        try {
            List<VisitFormDto> forms = visitFormQueryService.getRequiredFormsForVisitInstance(visitInstanceId);
            
            log.info("REST: Found {} required forms for visit instance: {}", forms.size(), visitInstanceId);
            return ResponseEntity.ok(forms);
            
        } catch (RuntimeException e) {
            log.error("REST: Error fetching required forms for visit {}: {}", visitInstanceId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Visit not found: " + visitInstanceId));
                    
        } catch (Exception e) {
            log.error("REST: Error getting required visit forms", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve required forms: " + e.getMessage()));
        }
    }

    /**
     * Assign a form to a visit instance (for unscheduled visits)
     * POST /api/v1/visits/{visitInstanceId}/forms/{formId}
     * 
     * This endpoint assigns forms to visit INSTANCES (operational data), not visit DEFINITIONS (protocol design).
     * Used primarily for unscheduled visits (SCREENING, AE, DISCONTINUATION) where forms are added post-creation.
     * 
     * Creates a record in visit_forms table with:
     * - visit_uuid: Links to the visit instance UUID
     * - form_definition_id: The form being assigned
     * - visit_definition_id: NULL (unscheduled visits don't have definitions)
     * 
     * @param visitInstanceId Visit instance Long ID (from study_visit_instances.id)
     * @param formId Form definition ID to assign
     * @param options Request body with optional fields (isRequired, displayOrder, instructions)
     * @return ResponseEntity with created assignment or error
     */
    @PostMapping("/{visitInstanceId}/forms/{formId}")
    public ResponseEntity<?> assignFormToVisitInstance(
            @PathVariable Long visitInstanceId,
            @PathVariable Long formId,
            @RequestBody(required = false) java.util.Map<String, Object> options) {
        
        log.info("REST: Assigning form {} to visit instance {}", formId, visitInstanceId);
        
        try {
            // 1. Get the visit instance to validate it exists
            StudyVisitInstanceEntity visitInstance = studyVisitInstanceRepository.findById(visitInstanceId)
                    .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));
            
            // 2. Get the form to validate it exists
            FormDefinitionEntity form = formDefinitionRepository.findById(formId)
                    .orElseThrow(() -> new RuntimeException("Form not found: " + formId));
            
            // 3. Extract options with defaults
            Boolean isRequired = options != null && options.containsKey("isRequired") 
                    ? (Boolean) options.get("isRequired") : true;
            Integer displayOrder = options != null && options.containsKey("displayOrder")
                    ? ((Number) options.get("displayOrder")).intValue() : 1;
            String instructions = options != null && options.containsKey("instructions")
                    ? (String) options.get("instructions") : null;
            
            // 4. Determine if this is a protocol visit or unscheduled visit
            boolean isUnscheduledVisit = (visitInstance.getVisitId() == null);
            Long visitDefinitionId = visitInstance.getVisitId();
            Long buildId = visitInstance.getBuildId();
            
            // 5. Generate unique visit UUID for unscheduled visits
            // Use visit instance ID to ensure uniqueness per visit instance
            UUID visitUuid = null;
            if (isUnscheduledVisit) {
                // Create a deterministic UUID based on visit instance ID
                // This ensures each visit instance has its own unique identifier
                String uuidString = String.format("00000000-0000-0000-0000-%012d", visitInstanceId);
                visitUuid = UUID.fromString(uuidString);
            }
            
            // 6. Check if form already assigned
            boolean alreadyExists;
            if (isUnscheduledVisit) {
                // For unscheduled visits: check by visit_uuid
                final UUID finalVisitUuid = visitUuid;
                alreadyExists = visitFormRepository.findAll().stream()
                        .anyMatch(vf -> vf.getVisitUuid() != null && 
                                        vf.getVisitUuid().equals(finalVisitUuid) && 
                                        vf.getFormDefinition().getId().equals(formId));
            } else {
                // For protocol visits: check by visit_definition_id + build_id
                alreadyExists = visitFormRepository
                        .findByVisitDefinitionIdAndBuildIdOrderByDisplayOrderAsc(visitDefinitionId, buildId)
                        .stream()
                        .anyMatch(vf -> vf.getFormDefinition().getId().equals(formId));
            }
            
            if (alreadyExists) {
                log.warn("Form {} already assigned to visit instance {}", formId, visitInstanceId);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("Form already assigned to this visit"));
            }
            
            // 7. Create visit_forms record
            VisitFormEntity.VisitFormEntityBuilder builder = VisitFormEntity.builder()
                    .formDefinition(form)
                    .isRequired(isRequired)
                    .displayOrder(displayOrder)
                    .instructions(instructions)
                    .isConditional(false)
                    .isDeleted(false);
            
            // Add visit-type-specific fields
            if (isUnscheduledVisit) {
                // Unscheduled visit: use deterministic visit_uuid based on visit instance ID
                // This ensures forms are unique per visit instance
                builder.visitUuid(visitUuid)  // visitUuid already calculated above
                       .visitDefinition(null)  // NULL for unscheduled
                       .aggregateUuid(null)
                       .buildId(null);
                log.info("Creating unscheduled visit form assignment: visitInstanceId={}, visit_uuid={}, form={}", 
                        visitInstanceId, visitUuid, formId);
            } else {
                // Protocol visit: use visit_definition_id and build_id
                VisitDefinitionEntity visitDef = visitDefinitionRepository.findById(visitDefinitionId)
                        .orElseThrow(() -> new RuntimeException("Visit definition not found: " + visitDefinitionId));
                builder.visitDefinition(visitDef)
                       .visitUuid(null)  // NULL for protocol visits
                       .aggregateUuid(null)
                       .buildId(buildId);
                log.info("Creating protocol visit form assignment: visit_definition_id={}, build_id={}, form={}", 
                        visitDefinitionId, buildId, formId);
            }
            
            VisitFormEntity visitForm = builder.build();
            VisitFormEntity savedVisitForm = visitFormRepository.save(visitForm);
            
            log.info("Successfully assigned form {} to visit instance {}", formId, visitInstanceId);
            
            // 8. Return success response
            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("message", "Form assigned successfully");
            response.put("visitFormId", savedVisitForm.getId());
            response.put("formId", formId);
            response.put("formName", form.getName());
            response.put("visitInstanceId", visitInstanceId);
            response.put("isUnscheduledVisit", isUnscheduledVisit);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("REST: Error assigning form to visit: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to assign form: " + e.getMessage()));
                    
        } catch (Exception e) {
            log.error("REST: Unexpected error assigning form to visit", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Get visit completion status
     * Returns percentage of required forms completed and overall visit status
     * 
     * @param visitInstanceId Visit instance Long ID
     * @return ResponseEntity with completion percentage
     */
    @GetMapping("/{visitInstanceId}/completion")
    public ResponseEntity<?> getVisitCompletion(@PathVariable Long visitInstanceId) {
        log.info("REST: Getting completion status for visit instance: {}", visitInstanceId);
        
        try {
            Double completionPercentage = visitFormQueryService.calculateVisitCompletionPercentage(visitInstanceId);
            boolean isComplete = visitFormQueryService.isVisitComplete(visitInstanceId);
            
            var response = new VisitCompletionResponse(completionPercentage, isComplete);
            
            log.info("REST: Visit {} completion: {}% (complete={})", 
                     visitInstanceId, completionPercentage, isComplete);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("REST: Error calculating completion for visit {}: {}", visitInstanceId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Visit not found: " + visitInstanceId));
                    
        } catch (Exception e) {
            log.error("REST: Error getting visit completion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to calculate visit completion: " + e.getMessage()));
        }
    }

    /**
     * Visit completion response DTO
     */
    private static class VisitCompletionResponse {
        private final Double completionPercentage;
        private final Boolean isComplete;

        public VisitCompletionResponse(Double completionPercentage, Boolean isComplete) {
            this.completionPercentage = completionPercentage;
            this.isComplete = isComplete;
        }

        public Double getCompletionPercentage() {
            return completionPercentage;
        }

        public Boolean getIsComplete() {
            return isComplete;
        }
    }

    /**
     * Update visit status
     * Transitions visit from one status to another (e.g., SCHEDULED → IN_PROGRESS)
     * 
     * @param visitInstanceId Visit instance ID (database primary key)
     * @param request Status update request with newStatus, updatedBy, notes
     * @return ResponseEntity with success message or error
     */
    @PutMapping("/{visitInstanceId}/status")
    public ResponseEntity<?> updateVisitStatus(
            @PathVariable Long visitInstanceId,
            @RequestBody UpdateVisitStatusRequest request) {
        
        log.info("REST: Updating visit status: visitInstanceId={}, newStatus={}, updatedBy={}", 
                visitInstanceId, request.getNewStatus(), request.getUpdatedBy());
        
        try {
            boolean success = visitService.updateVisitStatus(
                visitInstanceId,
                request.getNewStatus(),
                request.getUpdatedBy(),
                request.getNotes()
            );
            
            if (success) {
                log.info("REST: Visit status updated successfully: visitInstanceId={}, newStatus={}", 
                        visitInstanceId, request.getNewStatus());
                return ResponseEntity.ok(new StatusUpdateResponse(
                    true,
                    "Visit status updated successfully",
                    request.getNewStatus()
                ));
            } else {
                log.error("REST: Failed to update visit status: visitInstanceId={}", visitInstanceId);
                return ResponseEntity.badRequest().body(new ErrorResponse(
                    "Failed to update visit status. Visit may not exist."
                ));
            }
            
        } catch (Exception e) {
            log.error("REST: Error updating visit status: visitInstanceId={}", visitInstanceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error updating visit status: " + e.getMessage()));
        }
    }

    /**
     * Update visit status request DTO
     */
    private static class UpdateVisitStatusRequest {
        private String newStatus;
        private Long updatedBy;
        private String notes;

        public String getNewStatus() {
            return newStatus;
        }

        public void setNewStatus(String newStatus) {
            this.newStatus = newStatus;
        }

        public Long getUpdatedBy() {
            return updatedBy;
        }

        public void setUpdatedBy(Long updatedBy) {
            this.updatedBy = updatedBy;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    /**
     * Status update response DTO
     */
    private static class StatusUpdateResponse {
        private final Boolean success;
        private final String message;
        private final String newStatus;

        public StatusUpdateResponse(Boolean success, String message, String newStatus) {
            this.success = success;
            this.message = message;
            this.newStatus = newStatus;
        }

        public Boolean getSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public String getNewStatus() {
            return newStatus;
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
