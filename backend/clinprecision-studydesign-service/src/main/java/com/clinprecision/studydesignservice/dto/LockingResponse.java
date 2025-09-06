package com.clinprecision.studydesignservice.dto;

/**
 * Response DTO for locking and unlocking operations.
 */
public class LockingResponse {
    private boolean success;
    private String message;
    private boolean lockStatus;
    
    // Default constructor for Jackson
    public LockingResponse() {
    }
    
    public LockingResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        // Parse lock status from message if it contains lock information
        this.lockStatus = message != null && 
                (message.contains("is locked") || message.contains("locked successfully"));
    }
    
    public LockingResponse(boolean success, String message, boolean lockStatus) {
        this.success = success;
        this.message = message;
        this.lockStatus = lockStatus;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isLockStatus() {
        return lockStatus;
    }
    
    public void setLockStatus(boolean lockStatus) {
        this.lockStatus = lockStatus;
    }
}
