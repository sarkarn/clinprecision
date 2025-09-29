package com.clinprecision.datacaptureservice.patientenrollment.controller;

import com.clinprecision.datacaptureservice.patientenrollment.dto.RegisterPatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.dto.PatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.service.PatientEnrollmentService;

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
     * Get all patients
     * 
     * @return List of all patients
     */
    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        
        log.info("API Request: Get all patients");
        
        try {
            List<PatientDto> results = patientEnrollmentService.getAllPatients();
            
            log.info("API Response: Found {} patients", results.size());
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            log.error("Error retrieving all patients: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve patients", e);
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
}