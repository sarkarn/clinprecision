package com.clinprecision.studydesignservice.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for locking audit records.
 */
public class LockingAuditResponse {
    private String id;
    private String entityId;
    private String entityType;
    private String operation;
    private String reason;
    private Long userId;
    private LocalDateTime createdAt;
    
    // Default constructor for Jackson
    public LockingAuditResponse() {
    }
    
    public LockingAuditResponse(
            String id,
            String entityId,
            String entityType,
            String operation,
            String reason,
            Long userId,
            LocalDateTime createdAt) {
        this.id = id;
        this.entityId = entityId;
        this.entityType = entityType;
        this.operation = operation;
        this.reason = reason;
        this.userId = userId;
        this.createdAt = createdAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getEntityId() {
        return entityId;
    }
    
    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
    
    public String getOperation() {
        return operation;
    }
    
    public void setOperation(String operation) {
        this.operation = operation;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
