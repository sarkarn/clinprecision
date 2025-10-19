package com.clinprecision.clinopsservice.studydesign.studymgmt.exception;

/**
 * Exception thrown when study validation fails
 */
public class StudyValidationException extends RuntimeException {
    
    public StudyValidationException(String message) {
        super(message);
    }
    
    public StudyValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}



