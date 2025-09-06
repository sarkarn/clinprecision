package com.clinprecision.studydesignservice.dto;

/**
 * Request DTO for locking and unlocking operations.
 */
public class LockingRequest {
    private String reason;
    private Long userId;
    
    // Default constructor for Jackson
    public LockingRequest() {
    }
    
    public LockingRequest(String reason, Long userId) {
        this.reason = reason;
        this.userId = userId;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
