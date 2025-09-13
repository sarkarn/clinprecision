package com.clinprecision.studydesignservice.exception;

/**
 * Exception thrown when trying to create an entity that already exists
 * (e.g., duplicate template ID, duplicate study name, etc.)
 */
public class DuplicateEntityException extends RuntimeException {
    
    public DuplicateEntityException(String message) {
        super(message);
    }
    
    public DuplicateEntityException(String message, Throwable cause) {
        super(message, cause);
    }
}