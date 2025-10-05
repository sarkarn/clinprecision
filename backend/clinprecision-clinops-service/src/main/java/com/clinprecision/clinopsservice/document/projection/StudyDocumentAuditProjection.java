package com.clinprecision.clinopsservice.document.projection;

import com.clinprecision.clinopsservice.document.event.*;
import com.clinprecision.clinopsservice.repository.StudyDocumentAuditRepository;
import com.clinprecision.clinopsservice.repository.StudyDocumentRepository;
import com.clinprecision.common.entity.clinops.StudyDocumentAuditEntity;
import com.clinprecision.common.entity.clinops.StudyDocumentEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Study Document Audit Projection Handler
 * 
 * Updates the study_document_audit read model from domain events.
 * Creates audit trail records for all document operations.
 * 
 * This projection handler is responsible for:
 * - Recording all document actions (upload, download, approve, etc.)
 * - Capturing before/after values for changes
 * - Storing user context (IP address, user agent)
 * - Maintaining complete audit trail for regulatory compliance (21 CFR Part 11)
 * 
 * Uses subscribing event processor for immediate synchronous processing.
 */
@Component
@ProcessingGroup("document-audit-projection")
@Transactional
public class StudyDocumentAuditProjection {

    private static final Logger logger = LoggerFactory.getLogger(StudyDocumentAuditProjection.class);

    @Autowired
    private StudyDocumentAuditRepository auditRepository;

    @Autowired
    private StudyDocumentRepository documentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] ========== Study Document Audit Projection Handler INITIALIZED ==========");
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Handler is ready to process StudyDocument audit events");
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Processing Group: document-audit-projection (subscribing/synchronous)");
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Audit Repository: {}", auditRepository != null ? "INJECTED" : "NULL");
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Document Repository: {}", documentRepository != null ? "INJECTED" : "NULL");
        logger.info("[DOCUMENT_AUDIT_PROJECTION] ========== Handler Registration Complete ==========");
    }

    /**
     * Handle Study Document Uploaded Event
     * Records document upload action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentUploadedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording upload action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.UPLOAD);
            audit.setPerformedBy(event.getUploadedBy());
            audit.setPerformedAt(event.getUploadedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            // Capture new values
            Map<String, Object> newValues = new HashMap<>();
            newValues.put("documentName", event.getDocumentName());
            newValues.put("documentType", event.getDocumentType().name());
            newValues.put("fileName", event.getFileName());
            newValues.put("fileSize", event.getFileSize());
            newValues.put("version", event.getVersion());
            newValues.put("status", "DRAFT");
            audit.setNewValues(objectMapper.writeValueAsString(newValues));
            
            audit.setNotes("Document uploaded: " + event.getDocumentName());
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Upload action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording upload action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record upload action", e);
        }
    }

    /**
     * Handle Study Document Downloaded Event
     * Records document download action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentDownloadedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording download action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.DOWNLOAD);
            audit.setPerformedBy(event.getDownloadedBy());
            audit.setPerformedAt(event.getDownloadedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            String reason = event.getReason() != null ? event.getReason() : "Document accessed";
            audit.setNotes(reason);
            
            auditRepository.save(audit);
            logger.debug("[DOCUMENT_AUDIT_PROJECTION] Download action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording download action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record download action", e);
        }
    }

    /**
     * Handle Study Document Approved Event
     * Records document approval action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentApprovedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording approval action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.STATUS_CHANGE);
            audit.setPerformedBy(event.getApprovedBy());
            audit.setPerformedAt(event.getApprovedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            // Capture old and new values
            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("status", "DRAFT");
            audit.setOldValues(objectMapper.writeValueAsString(oldValues));
            
            Map<String, Object> newValues = new HashMap<>();
            newValues.put("status", "CURRENT");
            newValues.put("approvedBy", event.getApprovedBy());
            newValues.put("approvalRole", event.getApprovalRole());
            if (event.getElectronicSignature() != null) {
                newValues.put("electronicSignature", "***SIGNATURE_PRESENT***");
            }
            audit.setNewValues(objectMapper.writeValueAsString(newValues));
            
            String notes = "Document approved" + 
                          (event.getApprovalComments() != null ? ": " + event.getApprovalComments() : "");
            audit.setNotes(notes);
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Approval action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording approval action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record approval action", e);
        }
    }

    /**
     * Handle Study Document Superseded Event
     * Records document supersession action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentSupersededEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording supersession action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.STATUS_CHANGE);
            audit.setPerformedBy(event.getSupersededBy());
            audit.setPerformedAt(event.getSupersededAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            // Capture old and new values
            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("status", "CURRENT");
            audit.setOldValues(objectMapper.writeValueAsString(oldValues));
            
            Map<String, Object> newValues = new HashMap<>();
            newValues.put("status", "SUPERSEDED");
            newValues.put("supersededByDocumentId", event.getNewDocumentId().toString());
            audit.setNewValues(objectMapper.writeValueAsString(newValues));
            
            String notes = "Document superseded by new version" + 
                          (event.getSupersessionReason() != null ? ": " + event.getSupersessionReason() : "");
            audit.setNotes(notes);
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Supersession action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording supersession action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record supersession action", e);
        }
    }

    /**
     * Handle Study Document Archived Event
     * Records document archival action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentArchivedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording archival action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.STATUS_CHANGE);
            audit.setPerformedBy(event.getArchivedBy());
            audit.setPerformedAt(event.getArchivedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            // Capture new values
            Map<String, Object> newValues = new HashMap<>();
            newValues.put("status", "ARCHIVED");
            newValues.put("archivedBy", event.getArchivedBy());
            if (event.getRetentionPolicy() != null) {
                newValues.put("retentionPolicy", event.getRetentionPolicy());
            }
            audit.setNewValues(objectMapper.writeValueAsString(newValues));
            
            String notes = "Document archived" + 
                          (event.getArchivalReason() != null ? ": " + event.getArchivalReason() : "");
            audit.setNotes(notes);
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Archival action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording archival action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record archival action", e);
        }
    }

    /**
     * Handle Study Document Deleted Event
     * Records document deletion action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentDeletedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording deletion action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.DELETE);
            audit.setPerformedBy(event.getDeletedBy());
            audit.setPerformedAt(event.getDeletedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            String notes = "Document deleted (soft delete)" + 
                          (event.getDeletionReason() != null ? ": " + event.getDeletionReason() : "");
            audit.setNotes(notes);
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Deletion action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording deletion action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record deletion action", e);
        }
    }

    /**
     * Handle Study Document Metadata Updated Event
     * Records document metadata update action in audit trail
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentMetadataUpdatedEvent event) {
        logger.info("[DOCUMENT_AUDIT_PROJECTION] Recording metadata update action for document: {}", 
                    event.getDocumentId());
        
        try {
            Long documentId = getDocumentId(event.getDocumentId().toString());
            
            StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
            audit.setDocumentId(documentId);
            audit.setActionType(StudyDocumentAuditEntity.ActionType.UPDATE);
            audit.setPerformedBy(event.getUpdatedBy());
            audit.setPerformedAt(event.getUpdatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            audit.setIpAddress(event.getIpAddress());
            audit.setUserAgent(event.getUserAgent());
            
            // Capture new values
            Map<String, Object> newValues = new HashMap<>();
            if (event.getNewDocumentName() != null) {
                newValues.put("documentName", event.getNewDocumentName());
            }
            if (event.getNewDescription() != null) {
                newValues.put("description", event.getNewDescription());
            }
            if (event.getNewVersion() != null) {
                newValues.put("version", event.getNewVersion());
            }
            audit.setNewValues(objectMapper.writeValueAsString(newValues));
            
            String notes = "Document metadata updated" + 
                          (event.getUpdateReason() != null ? ": " + event.getUpdateReason() : "");
            audit.setNotes(notes);
            
            auditRepository.save(audit);
            logger.info("[DOCUMENT_AUDIT_PROJECTION] Metadata update action recorded successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_AUDIT_PROJECTION] Error recording metadata update action: {}", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to record metadata update action", e);
        }
    }

    /**
     * Get document database ID from aggregate UUID
     */
    private Long getDocumentId(String aggregateUuid) {
        Optional<StudyDocumentEntity> document = documentRepository.findByAggregateUuid(aggregateUuid);
        if (document.isPresent()) {
            return document.get().getId();
        }
        // If document doesn't exist yet, return null (will be set later)
        logger.warn("[DOCUMENT_AUDIT_PROJECTION] Document not found for UUID: {}, audit will use null ID", 
                   aggregateUuid);
        return null;
    }
}
