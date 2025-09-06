package com.clinprecision.studydesignservice.exception;

/**
 * Exception thrown when there's an issue with locking or unlocking an entity.
 * This includes attempting to lock an already locked entity or unlock an already unlocked entity.
 */
public class LockingException extends RuntimeException {
    
    public LockingException(String message) {
        super(message);
    }
    
    public LockingException(String message, Throwable cause) {
        super(message, cause);
    }
}
