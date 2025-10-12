package com.clinprecision.clinopsservice.patientenrollment.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Exception handler for Patient Status operations
 * 
 * Provides consistent error responses for all patient status-related endpoints
 * Maps exceptions to appropriate HTTP status codes with descriptive messages
 * 
 * Error Response Format:
 * <pre>
 * {
 *   "code": "ERROR_CODE",
 *   "message": "Detailed error message",
 *   "timestamp": "2025-10-12T10:30:00"
 * }
 * </pre>
 */
@ControllerAdvice(basePackages = "com.clinprecision.clinopsservice.patientenrollment.controller")
public class PatientStatusExceptionHandler {

    /**
     * Handle invalid status transition attempts
     * Returns: 400 BAD REQUEST
     * 
     * Example scenarios:
     * - Attempting to change from REGISTERED to ENROLLED (must go through SCREENING)
     * - Attempting to change from terminal status (COMPLETED/WITHDRAWN)
     * - Attempting to transition to same status
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        
        String message = ex.getMessage();
        String code;
        
        // Determine specific error code based on message content
        if (message != null) {
            if (message.contains("Invalid status transition")) {
                code = "INVALID_STATUS_TRANSITION";
            } else if (message.contains("terminal status")) {
                code = "TERMINAL_STATUS_IMMUTABLE";
            } else if (message.contains("not found")) {
                code = "PATIENT_NOT_FOUND";
            } else if (message.contains("required")) {
                code = "REQUIRED_FIELD_MISSING";
            } else if (message.contains("Invalid status")) {
                code = "INVALID_STATUS_VALUE";
            } else {
                code = "VALIDATION_ERROR";
            }
        } else {
            code = "VALIDATION_ERROR";
        }
        
        ErrorResponse error = new ErrorResponse(code, message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle validation errors from @Valid annotations
     * Returns: 400 BAD REQUEST with field-specific errors
     * 
     * Example scenarios:
     * - Missing required field (newStatus, reason, changedBy)
     * - Invalid format (email, dates)
     * - Constraint violations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
            "VALIDATION_ERROR",
            "Invalid request: one or more required fields are missing or invalid",
            errors
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Handle patient not found errors
     * Returns: 404 NOT FOUND
     * 
     * Example scenarios:
     * - Requesting status history for non-existent patient ID
     * - Attempting to change status for non-existent patient
     */
    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePatientNotFound(PatientNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("PATIENT_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle command processing failures
     * Returns: 500 INTERNAL SERVER ERROR
     * 
     * Example scenarios:
     * - CommandGateway timeout
     * - Event processing failure
     * - Database connection issues
     * - Projection timeout
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        
        String message = ex.getMessage();
        String code;
        
        // Determine specific error code
        if (message != null) {
            if (message.contains("Command processing failed") || message.contains("Projection timeout")) {
                code = "COMMAND_PROCESSING_ERROR";
            } else if (message.contains("Failed to change patient status")) {
                code = "STATUS_CHANGE_FAILED";
            } else {
                code = "INTERNAL_SERVER_ERROR";
            }
        } else {
            code = "INTERNAL_SERVER_ERROR";
        }
        
        ErrorResponse error = new ErrorResponse(
            code,
            "An error occurred processing your request: " + message
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Handle all other unexpected exceptions
     * Returns: 500 INTERNAL SERVER ERROR
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // ==================== Error Response Classes ====================

    /**
     * Standard error response structure
     */
    public static class ErrorResponse {
        private String code;
        private String message;
        private LocalDateTime timestamp;
        
        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }
        
        // Getters and setters
        public String getCode() {
            return code;
        }
        
        public void setCode(String code) {
            this.code = code;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }

    /**
     * Validation error response with field-specific errors
     */
    public static class ValidationErrorResponse extends ErrorResponse {
        private Map<String, String> fieldErrors;
        
        public ValidationErrorResponse(String code, String message, Map<String, String> fieldErrors) {
            super(code, message);
            this.fieldErrors = fieldErrors;
        }
        
        public Map<String, String> getFieldErrors() {
            return fieldErrors;
        }
        
        public void setFieldErrors(Map<String, String> fieldErrors) {
            this.fieldErrors = fieldErrors;
        }
    }
}
