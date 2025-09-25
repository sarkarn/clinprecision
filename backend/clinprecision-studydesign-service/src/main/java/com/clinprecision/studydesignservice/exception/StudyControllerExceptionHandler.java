package com.clinprecision.studydesignservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for study-related operations
 */
@ControllerAdvice
public class StudyControllerExceptionHandler {
    
    @ExceptionHandler(StudyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudyNotFound(StudyNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(StudyValidationException.class)
    public ResponseEntity<ErrorResponse> handleStudyValidation(StudyValidationException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_VALIDATION_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleIllegalState(RuntimeException ex) {
        ErrorResponse error = new ErrorResponse("BUSINESS_RULE_VIOLATION", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse("VALIDATION_ERROR", 
            "Validation failed for request fields", errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse("INTERNAL_SERVER_ERROR", 
            "An unexpected error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    // Error response classes
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
