package com.clinprecision.studydesignservice.exception;

/**
 * Exception thrown when attempting to modify a locked entity.
 * This is used to prevent changes to studies and forms that have been locked.
 */
public class EntityLockedException extends RuntimeException {
    
    public EntityLockedException(String message) {
        super(message);
    }
    
    public EntityLockedException(String message, Throwable cause) {
        super(message, cause);
    }
}
