package com.clinprecision.clinopsservice.studydesign.studymgmt.exception;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Exception thrown when study status transition validation fails
 * 
 * This exception indicates that a requested status transition violates
 * business rules defined in CrossEntityStatusValidationService.
 * 
 * Contains detailed error messages for diagnostic purposes.
 */
public class StudyStatusTransitionException extends RuntimeException {
    
    private final List<String> validationErrors;
    
    /**
     * Constructor with single error message
     * 
     * @param message Error message
     */
    public StudyStatusTransitionException(String message) {
        super(message);
        this.validationErrors = Collections.emptyList();
    }
    
    /**
     * Constructor with message and list of validation errors
     * 
     * @param message Summary error message
     * @param validationErrors Detailed validation errors
     */
    public StudyStatusTransitionException(String message, List<String> validationErrors) {
        super(message);
        this.validationErrors = validationErrors != null ? 
            new ArrayList<>(validationErrors) : Collections.emptyList();
    }
    
    /**
     * Constructor with message and cause
     * 
     * @param message Error message
     * @param cause Root cause exception
     */
    public StudyStatusTransitionException(String message, Throwable cause) {
        super(message, cause);
        this.validationErrors = Collections.emptyList();
    }
    
    /**
     * Get detailed validation errors
     * 
     * @return List of validation error messages
     */
    public List<String> getValidationErrors() {
        return Collections.unmodifiableList(validationErrors);
    }
    
    /**
     * Check if exception has detailed validation errors
     * 
     * @return true if validation errors are available
     */
    public boolean hasValidationErrors() {
        return !validationErrors.isEmpty();
    }
    
    /**
     * Get count of validation errors
     * 
     * @return Number of validation errors
     */
    public int getValidationErrorCount() {
        return validationErrors.size();
    }
}
