package com.clinprecision.clinopsservice.studyoperation.patientenrollment.exception;

/**
 * Exception thrown when a patient is not found by ID
 * 
 * Used by PatientStatusService and PatientStatusController
 * Mapped to HTTP 404 NOT FOUND by exception handler
 * 
 * @see PatientStatusExceptionHandler
 */
public class PatientNotFoundException extends RuntimeException {
    
    public PatientNotFoundException(Long patientId) {
        super("Patient not found with ID: " + patientId);
    }
    
    public PatientNotFoundException(String message) {
        super(message);
    }
    
    public PatientNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
