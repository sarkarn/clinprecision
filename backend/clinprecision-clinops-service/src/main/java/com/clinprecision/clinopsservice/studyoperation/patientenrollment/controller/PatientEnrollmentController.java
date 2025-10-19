package com.clinprecision.clinopsservice.patientenrollment.controller;

import com.clinprecision.clinopsservice.patientenrollment.dto.RegisterPatientDto;
import com.clinprecision.clinopsservice.patientenrollment.dto.UpdatePatientDemographicsDto;
import com.clinprecision.clinopsservice.patientenrollment.dto.EnrollPatientDto;
import com.clinprecision.clinopsservice.patientenrollment.dto.PatientDto;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.clinopsservice.patientenrollment.service.PatientEnrollmentService;
import com.clinprecision.common.entity.SiteStudyEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

/**
 * REST API Controller for Patient Enrollment functionality
 * 
 * Follows established ClinPrecision patterns:
 * - Uses Long IDs in external API endpoints
 * - Maps internally to UUIDs for Axon operations
 * - Returns standardized response formats
 * - Implements proper error handling
 */
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientEnrollmentController {

    private final PatientEnrollmentService patientEnrollmentService;

    /**
     * Register a new patient
     * 
     * @param registerDto Patient registration details
     * @return Created patient with database ID and aggregate UUID
     */
    @PostMapping
    public ResponseEntity<PatientDto> registerPatient(
            @Valid @RequestBody RegisterPatientDto registerDto) {
        
        log.info("API Request: Register patient {} {}", 
                 registerDto.getFirstName(), registerDto.getLastName());
        
        try {
            // TODO: Get actual user from security context
            String currentUser = "system"; // Placeholder
            
            PatientDto result = patientEnrollmentService.registerPatient(registerDto, currentUser);
            
            log.info("API Response: Patient registered with ID {}", result.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid patient registration request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error registering patient: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register patient", e);
        }
    }

    /**
     * Enroll an existing patient into a study at a specific site
     * Persists siteId as part of the enrollment record
     *
     * @param patientId Database ID of the patient to enroll
     * @param enrollDto Enrollment details including studyId, siteId, screeningNumber, enrollmentDate
     * @return Created enrollment record
     */
    @PostMapping("/{patientId}/enroll")
    public ResponseEntity<PatientEnrollmentEntity> enrollPatient(
            @PathVariable Long patientId,
            @Valid @RequestBody EnrollPatientDto enrollDto) {

        log.info("API Request: Enroll patient {} into study {} at site {} with screening {}",
                patientId, enrollDto.getStudyId(), enrollDto.getSiteId(), enrollDto.getScreeningNumber());

        try {
            String currentUser = "system"; // TODO: replace with authenticated user
            PatientEnrollmentEntity result = patientEnrollmentService.enrollPatient(patientId, enrollDto, currentUser);
            log.info("API Response: Patient {} enrolled with enrollment ID {}", patientId, result.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid patient enrollment request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error enrolling patient {}: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to enroll patient", e);
        }
    }

    /**
     * Get patient by database ID
     * 
     * @param patientId Database ID of the patient
     * @return Patient details
     */
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDto> getPatient(@PathVariable Long patientId) {
        
        log.info("API Request: Get patient by ID {}", patientId);
        
        try {
            PatientDto result = patientEnrollmentService.getPatientById(patientId);
            
            log.info("API Response: Found patient {} with UUID {}", 
                     result.getId(), result.getAggregateUuid());
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            log.warn("Patient not found: {}", patientId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving patient {}: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve patient", e);
        }
    }
    
    /**
     * Update patient demographics
     * 
     * @param patientId Database ID of the patient to update
     * @param updateDto Demographics update data
     * @return Updated patient details
     */
    @PutMapping("/{patientId}")
    public ResponseEntity<PatientDto> updatePatientDemographics(
            @PathVariable Long patientId,
            @Valid @RequestBody UpdatePatientDemographicsDto updateDto) {
        
        log.info("API Request: Update patient demographics for ID {}", patientId);
        
        try {
            // TODO: Get actual user from security context
            String currentUser = "system"; // Placeholder
            
            PatientDto result = patientEnrollmentService.updatePatientDemographics(patientId, updateDto, currentUser);
            
            log.info("API Response: Patient {} demographics updated successfully", result.getId());
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid patient update request: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.warn("Patient not found: {}", patientId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating patient {}: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to update patient", e);
        }
    }

    /**
     * Get patient by aggregate UUID
     * Used internally by other services
     * 
     * @param aggregateUuid Aggregate UUID of the patient
     * @return Patient details
     */
    @GetMapping("/uuid/{aggregateUuid}")
    public ResponseEntity<PatientDto> getPatientByUuid(@PathVariable String aggregateUuid) {
        
        log.info("API Request: Get patient by UUID {}", aggregateUuid);
        
        try {
            PatientDto result = patientEnrollmentService.getPatientByUuid(aggregateUuid);
            
            log.info("API Response: Found patient {} with ID {}", 
                     result.getAggregateUuid(), result.getId());
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            log.warn("Patient not found by UUID: {}", aggregateUuid);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving patient by UUID {}: {}", aggregateUuid, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve patient", e);
        }
    }

    /**
     * Get all patients with enrollment information
     * Returns patients with their current enrollment status and study associations
     * 
     * @return List of all patients with enrollment data
     */
    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        
        log.info("API Request: Get all patients with enrollment data");
        
        try {
            List<PatientDto> results = patientEnrollmentService.getAllPatientsWithEnrollments();
            
            log.info("API Response: Found {} patients", results.size());
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            log.error("Error retrieving all patients: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve patients", e);
        }
    }

    /**
     * Get enrolled patients by study ID
     * 
     * @param studyId Study ID to filter patients
     * @return List of patients enrolled in the specified study
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<PatientDto>> getPatientsByStudy(@PathVariable Long studyId) {
        
        log.info("API Request: Get patients for study ID {}", studyId);
        
        try {
            List<PatientDto> results = patientEnrollmentService.getPatientsByStudy(studyId);
            
            log.info("API Response: Found {} patients for study {}", results.size(), studyId);
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            log.error("Error retrieving patients for study {}: {}", studyId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve patients for study", e);
        }
    }

    /**
     * Search patients by name
     * 
     * @param searchTerm Search term for patient names
     * @return List of matching patients
     */
    @GetMapping("/search")
    public ResponseEntity<List<PatientDto>> searchPatients(
            @RequestParam(name = "name") String searchTerm) {
        
        log.info("API Request: Search patients by name '{}'", searchTerm);
        
        try {
            List<PatientDto> results = patientEnrollmentService.searchPatientsByName(searchTerm);
            
            log.info("API Response: Found {} patients matching '{}'", results.size(), searchTerm);
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            log.error("Error searching patients by name '{}': {}", searchTerm, e.getMessage(), e);
            throw new RuntimeException("Failed to search patients", e);
        }
    }

    /**
     * Get patient count (for dashboard/statistics)
     * 
     * @return Total number of registered patients
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getPatientCount() {
        
        log.info("API Request: Get patient count");
        
        try {
            List<PatientDto> patients = patientEnrollmentService.getAllPatients();
            long count = patients.size();
            
            log.info("API Response: Patient count = {}", count);
            return ResponseEntity.ok(count);
            
        } catch (Exception e) {
            log.error("Error getting patient count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get patient count", e);
        }
    }

    /**
     * Health check endpoint
     * 
     * @return Service status
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Patient Enrollment Service is healthy");
    }

    /**
     * Test endpoint: Enroll the first registered patient into the first study
     * This is a temporary endpoint for testing the enrollment workflow
     * 
     * @return Result of test enrollment
     */
    @PostMapping("/test-enroll")
    public ResponseEntity<String> testEnrollment() {
        log.info("API Request: Test enrollment workflow");
        
        try {
            String result = patientEnrollmentService.performTestEnrollment();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Test enrollment failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Test enrollment failed: " + e.getMessage());
        }
    }
    
    /**
     * Get site-study associations for a specific study
     * Returns all sites that are associated with the specified study
     * 
     * @param studyId Study ID
     * @return List of site-study associations
     */
    @GetMapping("/site-studies/study/{studyId}")
    public ResponseEntity<List<SiteStudyEntity>> getSiteStudiesByStudy(@PathVariable Long studyId) {
        log.info("API Request: Get site studies for study ID {}", studyId);
        
        try {
            List<SiteStudyEntity> results = patientEnrollmentService.getSiteStudiesByStudy(studyId);
            log.info("API Response: Found {} site studies for study {}", results.size(), studyId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error retrieving site studies for study {}: {}", studyId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve site studies", e);
        }
    }
}



