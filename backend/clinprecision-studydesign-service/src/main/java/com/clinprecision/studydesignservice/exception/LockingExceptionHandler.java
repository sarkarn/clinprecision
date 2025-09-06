package com.clinprecision.studydesignservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for locking-related exceptions.
 */
@ControllerAdvice
public class LockingExceptionHandler {

    /**
     * Handle EntityLockedException when attempting to modify a locked entity.
     */
    @ExceptionHandler(EntityLockedException.class)
    public ResponseEntity<Object> handleEntityLockedException(
            EntityLockedException ex, WebRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Entity Locked");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }
    
    /**
     * Handle LockingException for general locking/unlocking issues.
     */
    @ExceptionHandler(LockingException.class)
    public ResponseEntity<Object> handleLockingException(
            LockingException ex, WebRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Locking Error");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
