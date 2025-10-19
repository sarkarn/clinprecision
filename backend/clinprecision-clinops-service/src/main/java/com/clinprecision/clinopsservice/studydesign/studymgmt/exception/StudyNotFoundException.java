package com.clinprecision.clinopsservice.studydesign.studymgmt.exception;

/**
 * Exception thrown when a study is not found
 */
public class StudyNotFoundException extends RuntimeException {
    
    public StudyNotFoundException(String message) {
        super(message);
    }
    
    public StudyNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public StudyNotFoundException(Long studyId) {
        super("Study not found with ID: " + studyId);
    }
}



