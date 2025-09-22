package com.clinprecision.common.exception;

/**
 * Exception thrown when an entity is not found in the database.
 */
public class EntityNotFoundException extends RuntimeException {

    /**
     * Constructs a new exception with the specified detail message.
     * 
     * @param message the detail message
     */
    public EntityNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new exception with the specified detail message and cause.
     * 
     * @param message the detail message
     * @param cause the cause
     */
    public EntityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
