package com.clinprecision.clinopsservice.formdata.controller;

import com.clinprecision.clinopsservice.formdata.dto.FormSubmissionRequest;
import com.clinprecision.clinopsservice.formdata.dto.FormSubmissionResponse;
import com.clinprecision.clinopsservice.formdata.dto.FormDataDto;
import com.clinprecision.clinopsservice.formdata.service.StudyFormDataService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * StudyFormDataController - REST API for visit-based form data submissions
 * 
 * USAGE CONTEXT:
 * This controller provides REST endpoints for capturing clinical trial form data
 * through a visit-based data collection model. It is designed to be called from:
 * 
 * ✓ Visit Management UI (scheduled/unscheduled visits)
 * ✓ Electronic Data Capture (EDC) forms
 * ✓ Mobile data collection apps
 * ✓ External systems via API integration
 * 
 * ✗ NOT called directly from Status Change workflows (status changes are separate)
 * 
 * ARCHITECTURAL PATTERN (October 2025):
 * - Status changes trigger visit creation (if appropriate)
 * - Visit context provides structure for form collection
 * - Forms are captured within visit boundaries
 * - Audit trail links: Visit → Forms → Data Points
 * 
 * Example Flow:
 * 1. User changes status to SCREENING
 * 2. System optionally prompts: "Create screening visit?"
 * 3. Visit created (unscheduled, type=SCREENING)
 * 4. Forms collected via this API (visitId provided)
 * 5. Audit trail shows: Visit → Screening Form → Eligibility Data
 * 
 * Endpoints:
 * - POST /api/v1/form-data - Submit new form data
 * - GET /api/v1/form-data/subject/{subjectId} - Get all forms for a subject
 * - GET /api/v1/form-data/study/{studyId} - Get all forms for a study
 * - GET /api/v1/form-data/{id} - Get specific form by ID
 * - GET /api/v1/form-data/study/{studyId}/form/{formId} - Get forms by study and form definition
 * 
 * CORS: Configured in application.yml or WebConfig
 * Security: TODO - Add @PreAuthorize annotations for role-based access
 * 
 * Error Handling:
 * - 400 Bad Request: Validation errors
 * - 404 Not Found: Form data not found
 * - 500 Internal Server Error: Unexpected errors
 */
@RestController
@RequestMapping("/api/v1/form-data")
@RequiredArgsConstructor
@Slf4j
// CORS is handled by API Gateway - do not add @CrossOrigin here
public class StudyFormDataController {

    private final StudyFormDataService formDataService;

    /**
     * Submit form data
     * 
     * POST /api/v1/form-data
     * 
     * Request Body:
     * {
     *   "studyId": 1,
     *   "formId": 5,
     *   "subjectId": 1001,
     *   "visitId": null,
     *   "siteId": 10,
     *   "formData": {
     *     "eligibility_age": true,
     *     "eligibility_diagnosis": true,
     *     "screening_date": "2025-10-12"
     *   },
     *   "status": "SUBMITTED"
     * }
     * 
     * Response: 201 Created
     * {
     *   "formDataId": "550e8400-e29b-41d4-a716-446655440000",
     *   "recordId": 123,
     *   "studyId": 1,
     *   "formId": 5,
     *   "subjectId": 1001,
     *   "status": "SUBMITTED",
     *   "message": "Form submitted successfully"
     * }
     * 
     * @param request Form submission request
     * @return Response with formDataId and recordId
     */
    @PostMapping
    public ResponseEntity<FormSubmissionResponse> submitFormData(
            @Valid @RequestBody FormSubmissionRequest request) {
        
        log.info("POST /api/v1/form-data - Submit form data: studyId={}, formId={}, subjectId={}", 
            request.getStudyId(), request.getFormId(), request.getSubjectId());
        
        try {
            FormSubmissionResponse response = formDataService.submitFormData(request);
            
            log.info("Form data submitted successfully: formDataId={}, recordId={}", 
                response.getFormDataId(), response.getRecordId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(FormSubmissionResponse.error("Validation error: " + e.getMessage()));
            
        } catch (Exception e) {
            log.error("Error submitting form data: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(FormSubmissionResponse.error("Failed to submit form data: " + e.getMessage()));
        }
    }

    /**
     * Get all form submissions for a subject
     * 
     * GET /api/v1/form-data/subject/{subjectId}
     * 
     * Response: 200 OK
     * [
     *   {
     *     "id": 123,
     *     "formId": 5,
     *     "formData": {...},
     *     "status": "SUBMITTED",
     *     "createdAt": "2025-10-12T14:30:00"
     *   },
     *   ...
     * ]
     * 
     * @param subjectId Subject ID
     * @return List of form submissions
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<FormDataDto>> getSubjectFormData(
            @PathVariable Long subjectId) {
        
        log.info("GET /api/v1/form-data/subject/{} - Get subject form data", subjectId);
        
        try {
            List<FormDataDto> formData = formDataService.getSubjectFormData(subjectId);
            
            log.info("Retrieved {} form submissions for subject {}", formData.size(), subjectId);
            
            return ResponseEntity.ok(formData);
            
        } catch (Exception e) {
            log.error("Error retrieving subject form data: subjectId={}, error={}", 
                subjectId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all form submissions for a study
     * 
     * GET /api/v1/form-data/study/{studyId}
     * 
     * @param studyId Study ID
     * @return List of form submissions
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<FormDataDto>> getStudyFormData(
            @PathVariable Long studyId) {
        
        log.info("GET /api/v1/form-data/study/{} - Get study form data", studyId);
        
        try {
            List<FormDataDto> formData = formDataService.getStudyFormData(studyId);
            
            log.info("Retrieved {} form submissions for study {}", formData.size(), studyId);
            
            return ResponseEntity.ok(formData);
            
        } catch (Exception e) {
            log.error("Error retrieving study form data: studyId={}, error={}", 
                studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get specific form submission by ID
     * 
     * GET /api/v1/form-data/{id}
     * 
     * @param id Record ID
     * @return Form data
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormDataDto> getFormDataById(
            @PathVariable Long id) {
        
        log.info("GET /api/v1/form-data/{} - Get form data by ID", id);
        
        try {
            FormDataDto formData = formDataService.getFormDataById(id);
            
            log.info("Retrieved form data: id={}, studyId={}, formId={}", 
                id, formData.getStudyId(), formData.getFormId());
            
            return ResponseEntity.ok(formData);
            
        } catch (RuntimeException e) {
            log.error("Form data not found: id={}", id);
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("Error retrieving form data: id={}, error={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get form submissions by study and form definition
     * 
     * GET /api/v1/form-data/study/{studyId}/form/{formId}
     * 
     * Example: Get all screening assessments for a study
     * GET /api/v1/form-data/study/1/form/5
     * 
     * @param studyId Study ID
     * @param formId Form definition ID
     * @return List of form submissions
     */
    @GetMapping("/study/{studyId}/form/{formId}")
    public ResponseEntity<List<FormDataDto>> getFormDataByStudyAndForm(
            @PathVariable Long studyId,
            @PathVariable Long formId) {
        
        log.info("GET /api/v1/form-data/study/{}/form/{} - Get form data by study and form", 
            studyId, formId);
        
        try {
            List<FormDataDto> formData = formDataService.getFormDataByStudyAndForm(studyId, formId);
            
            log.info("Retrieved {} submissions for study {} form {}", 
                formData.size(), studyId, formId);
            
            return ResponseEntity.ok(formData);
            
        } catch (Exception e) {
            log.error("Error retrieving form data: studyId={}, formId={}, error={}", 
                studyId, formId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get form data for a specific visit and form
     * 
     * GET /api/v1/form-data/visit/{visitId}/form/{formId}
     * 
     * Use case: Load existing form data when user opens a form for editing
     * Returns: Most recent form submission for this visit+form combination
     * 
     * @param visitId Visit instance ID
     * @param formId Form definition ID
     * @return Form data or 404 if not found
     */
    @GetMapping("/visit/{visitId}/form/{formId}")
    public ResponseEntity<FormDataDto> getFormDataByVisitAndForm(
            @PathVariable Long visitId,
            @PathVariable Long formId) {
        
        log.info("GET /api/v1/form-data/visit/{}/form/{} - Get form data by visit and form", 
            visitId, formId);
        
        try {
            FormDataDto formData = formDataService.getFormDataByVisitAndForm(visitId, formId);
            
            if (formData != null) {
                log.info("Retrieved form data: visitId={}, formId={}, status={}", 
                    visitId, formId, formData.getStatus());
                return ResponseEntity.ok(formData);
            } else {
                log.info("No form data found for visit {} and form {}", visitId, formId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Error retrieving form data: visitId={}, formId={}, error={}", 
                visitId, formId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     * 
     * GET /api/v1/form-data/health
     * 
     * @return Status message
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Form Data Service is healthy");
    }
}
