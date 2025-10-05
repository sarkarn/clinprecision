package com.clinprecision.common.entity.clinops;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing study document audit trail
 * Tracks all actions performed on study documents for regulatory compliance
 * 
 * This entity stores the read model for document audit events.
 * It is updated by the StudyDocumentAuditProjection event handler.
 */
@Entity
@Table(name = "study_document_audit")
public class StudyDocumentAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "action_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public StudyDocumentAuditEntity() {}

    public StudyDocumentAuditEntity(Long documentId, ActionType actionType, String performedBy, 
                                   LocalDateTime performedAt, String ipAddress, String userAgent) {
        this.documentId = documentId;
        this.actionType = actionType;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public String getOldValues() {
        return oldValues;
    }

    public void setOldValues(String oldValues) {
        this.oldValues = oldValues;
    }

    public String getNewValues() {
        return newValues;
    }

    public void setNewValues(String newValues) {
        this.newValues = newValues;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    /**
     * Action type enumeration
     */
    public enum ActionType {
        UPLOAD,
        DOWNLOAD,
        UPDATE,
        DELETE,
        STATUS_CHANGE
    }
}
