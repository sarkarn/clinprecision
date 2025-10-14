package com.clinprecision.clinopsservice.document.aggregate;

import com.clinprecision.clinopsservice.document.command.*;
import com.clinprecision.clinopsservice.document.event.*;
import com.clinprecision.clinopsservice.document.valueobject.DocumentStatus;
import com.clinprecision.clinopsservice.document.valueobject.DocumentType;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.time.Instant;
import java.util.UUID;

/**
 * Study Document Aggregate - DDD Aggregate Root for Document Management
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail (FDA 21 CFR Part 11 compliance)
 * - Immutable document history
 * - Regulatory compliance tracking
 * - E-signature support
 * 
 * Business Rules:
 * 1. Documents start as DRAFT after upload
 * 2. Only DRAFT documents can be edited or deleted
 * 3. Approval makes document CURRENT and immutable
 * 4. CURRENT documents can be SUPERSEDED or ARCHIVED
 * 5. SUPERSEDED and ARCHIVED are terminal states
 * 6. All access is tracked for regulatory compliance
 * 7. Critical documents require e-signatures
 * 
 * Lifecycle:
 * Upload → DRAFT → Approve → CURRENT → Supersede → SUPERSEDED
 *              ↓                    ↓            ↓
 *            Delete              Archive     Archive
 */
@Aggregate
@NoArgsConstructor
@Slf4j
public class StudyDocumentAggregate {

    @AggregateIdentifier
    private UUID documentId;
    
    // Core document information
    private UUID studyAggregateUuid;
    private String documentName;
    private DocumentType documentType;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private String version;
    private String description;
    
    // Status tracking
    private DocumentStatus status;
    private boolean isDeleted;
    
    // Audit fields
    private Long uploadedBy;
    private Instant uploadedAt;
    private Long approvedBy;
    private Instant approvedAt;
    private Long archivedBy;
    private Instant archivedAt;
    private UUID supersededByDocumentId;

    // ===================== COMMAND HANDLERS =====================

    /**
     * Constructor: Upload new document
     * Creates aggregate in DRAFT status
     */
    @CommandHandler
    public StudyDocumentAggregate(UploadStudyDocumentCommand command) {
        log.info("Uploading document: {} for study: {}", 
            command.getDocumentName(), command.getStudyAggregateUuid());
        
        // Validate command
        validateUploadCommand(command);
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentUploadedEvent.builder()
            .documentId(command.getDocumentId())
            .studyAggregateUuid(command.getStudyAggregateUuid())
            .documentName(command.getDocumentName())
            .documentType(command.getDocumentType())
            .fileName(command.getFileName())
            .filePath(command.getFilePath())
            .fileSize(command.getFileSize())
            .mimeType(command.getMimeType())
            .version(command.getVersion())
            .description(command.getDescription())
            .uploadedBy(command.getUploadedBy())
            .uploadedAt(Instant.now())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document uploaded event applied: {}", command.getDocumentId());
    }

    /**
     * Command Handler: Download Document
     * Records access for regulatory compliance
     */
    @CommandHandler
    public void handle(DownloadStudyDocumentCommand command) {
        log.info("Recording download of document: {} by user: {}", 
            documentId, command.getDownloadedBy());
        
        // Validate document exists and is not deleted
        validateDocumentNotDeleted();
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentDownloadedEvent.builder()
            .documentId(command.getDocumentId())
            .downloadedBy(command.getDownloadedBy())
            .downloadedAt(Instant.now())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .reason(command.getReason())
            .build());
        
        log.info("Document download recorded: {}", documentId);
    }

    /**
     * Command Handler: Approve Document
     * Transitions document from DRAFT to CURRENT
     */
    @CommandHandler
    public void handle(ApproveStudyDocumentCommand command) {
        log.info("Approving document: {} by user: {}", 
            documentId, command.getApprovedBy());
        
        // Validate business rules
        validateApprovalAllowed();
        validateElectronicSignature(command);
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentApprovedEvent.builder()
            .documentId(command.getDocumentId())
            .approvedBy(command.getApprovedBy())
            .approvedAt(Instant.now())
            .approvalComments(command.getApprovalComments())
            .electronicSignature(command.getElectronicSignature())
            .approvalRole(command.getApprovalRole())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document approved: {}", documentId);
    }

    /**
     * Command Handler: Supersede Document
     * Replaces current document with new version
     */
    @CommandHandler
    public void handle(SupersedeStudyDocumentCommand command) {
        log.info("Superseding document: {} with new document: {}", 
            documentId, command.getNewDocumentId());
        
        // Validate business rules
        validateSupersessionAllowed();
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentSupersededEvent.builder()
            .documentId(command.getDocumentId())
            .newDocumentId(command.getNewDocumentId())
            .supersededBy(command.getSupersededBy())
            .supersededAt(Instant.now())
            .supersessionReason(command.getSupersessionReason())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document superseded: {}", documentId);
    }

    /**
     * Command Handler: Archive Document
     * Permanently archives document
     */
    @CommandHandler
    public void handle(ArchiveStudyDocumentCommand command) {
        log.info("Archiving document: {}", documentId);
        
        // Validate business rules
        validateArchivalAllowed();
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentArchivedEvent.builder()
            .documentId(command.getDocumentId())
            .archivedBy(command.getArchivedBy())
            .archivedAt(Instant.now())
            .archivalReason(command.getArchivalReason())
            .retentionPolicy(command.getRetentionPolicy())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document archived: {}", documentId);
    }

    /**
     * Command Handler: Delete Document
     * Soft delete for DRAFT documents only
     */
    @CommandHandler
    public void handle(DeleteStudyDocumentCommand command) {
        log.info("Deleting document: {}", documentId);
        
        // Validate business rules
        validateDeletionAllowed();
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentDeletedEvent.builder()
            .documentId(command.getDocumentId())
            .deletedBy(command.getDeletedBy())
            .deletedAt(Instant.now())
            .deletionReason(command.getDeletionReason())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document deleted: {}", documentId);
    }

    /**
     * Command Handler: Update Metadata
     * Updates document metadata (DRAFT only)
     */
    @CommandHandler
    public void handle(UpdateStudyDocumentMetadataCommand command) {
        log.info("Updating metadata for document: {}", documentId);
        
        // Validate business rules
        validateMetadataUpdateAllowed();
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDocumentMetadataUpdatedEvent.builder()
            .documentId(command.getDocumentId())
            .newDocumentName(command.getNewDocumentName())
            .newDescription(command.getNewDescription())
            .newVersion(command.getNewVersion())
            .updatedBy(command.getUpdatedBy())
            .updatedAt(Instant.now())
            .updateReason(command.getUpdateReason())
            .ipAddress(command.getIpAddress())
            .userAgent(command.getUserAgent())
            .build());
        
        log.info("Document metadata updated: {}", documentId);
    }

    // ===================== EVENT SOURCING HANDLERS =====================

    @EventSourcingHandler
    public void on(StudyDocumentUploadedEvent event) {
        this.documentId = event.getDocumentId();
        this.studyAggregateUuid = event.getStudyAggregateUuid();
        this.documentName = event.getDocumentName();
        this.documentType = event.getDocumentType();
        this.fileName = event.getFileName();
        this.filePath = event.getFilePath();
        this.fileSize = event.getFileSize();
        this.mimeType = event.getMimeType();
        this.version = event.getVersion();
        this.description = event.getDescription();
        this.status = DocumentStatus.DRAFT;
        this.uploadedBy = event.getUploadedBy();
        this.uploadedAt = event.getUploadedAt();
        this.isDeleted = false;
        
        log.debug("Aggregate state updated: Document uploaded - ID: {}, Status: DRAFT", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentDownloadedEvent event) {
        // Download doesn't change aggregate state, just creates audit trail
        log.debug("Document downloaded event processed: {}", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentApprovedEvent event) {
        this.status = DocumentStatus.CURRENT;
        this.approvedBy = event.getApprovedBy();
        this.approvedAt = event.getApprovedAt();
        
        log.debug("Aggregate state updated: Document approved - ID: {}, Status: CURRENT", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentSupersededEvent event) {
        this.status = DocumentStatus.SUPERSEDED;
        this.supersededByDocumentId = event.getNewDocumentId();
        
        log.debug("Aggregate state updated: Document superseded - ID: {}, Status: SUPERSEDED", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentArchivedEvent event) {
        this.status = DocumentStatus.ARCHIVED;
        this.archivedBy = event.getArchivedBy();
        this.archivedAt = event.getArchivedAt();
        
        log.debug("Aggregate state updated: Document archived - ID: {}, Status: ARCHIVED", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentDeletedEvent event) {
        this.isDeleted = true;
        
        log.debug("Aggregate state updated: Document deleted - ID: {}", documentId);
    }

    @EventSourcingHandler
    public void on(StudyDocumentMetadataUpdatedEvent event) {
        if (event.getNewDocumentName() != null) {
            this.documentName = event.getNewDocumentName();
        }
        if (event.getNewDescription() != null) {
            this.description = event.getNewDescription();
        }
        if (event.getNewVersion() != null) {
            this.version = event.getNewVersion();
        }
        
        log.debug("Aggregate state updated: Document metadata updated - ID: {}", documentId);
    }

    // ===================== VALIDATION METHODS =====================

    private void validateUploadCommand(UploadStudyDocumentCommand command) {
        if (command.getDocumentName() == null || command.getDocumentName().trim().isEmpty()) {
            throw new IllegalArgumentException("Document name cannot be empty");
        }
        if (command.getFileName() == null || command.getFileName().trim().isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }
        if (command.getFilePath() == null || command.getFilePath().trim().isEmpty()) {
            throw new IllegalArgumentException("File path cannot be empty");
        }
        if (command.getFileSize() == null || command.getFileSize() <= 0) {
            throw new IllegalArgumentException("File size must be greater than 0");
        }
        if (command.getUploadedBy() == null) {
            throw new IllegalArgumentException("Uploaded by user ID cannot be null");
        }
    }

    private void validateDocumentNotDeleted() {
        if (isDeleted) {
            throw new IllegalStateException("Document has been deleted and cannot be accessed");
        }
    }

    private void validateApprovalAllowed() {
        validateDocumentNotDeleted();
        
        if (status != DocumentStatus.DRAFT) {
            throw new IllegalStateException(
                String.format("Document cannot be approved from status %s. Must be DRAFT.", 
                    status.getDisplayName())
            );
        }
    }

    private void validateElectronicSignature(ApproveStudyDocumentCommand command) {
        // Critical documents require e-signature
        if (documentType.requiresSignature()) {
            if (command.getElectronicSignature() == null || 
                command.getElectronicSignature().trim().isEmpty()) {
                throw new IllegalArgumentException(
                    String.format("Electronic signature required for document type: %s", 
                        documentType.getDisplayName())
                );
            }
        }
    }

    private void validateSupersessionAllowed() {
        validateDocumentNotDeleted();
        
        if (status != DocumentStatus.CURRENT) {
            throw new IllegalStateException(
                String.format("Only CURRENT documents can be superseded. Current status: %s", 
                    status.getDisplayName())
            );
        }
    }

    private void validateArchivalAllowed() {
        validateDocumentNotDeleted();
        
        if (status == DocumentStatus.ARCHIVED) {
            throw new IllegalStateException("Document is already archived");
        }
    }

    private void validateDeletionAllowed() {
        validateDocumentNotDeleted();
        
        if (status != DocumentStatus.DRAFT) {
            throw new IllegalStateException(
                String.format("Only DRAFT documents can be deleted. Current status: %s", 
                    status.getDisplayName())
            );
        }
    }

    private void validateMetadataUpdateAllowed() {
        validateDocumentNotDeleted();
        
        if (status != DocumentStatus.DRAFT) {
            throw new IllegalStateException(
                String.format("Only DRAFT documents can be updated. Current status: %s", 
                    status.getDisplayName())
            );
        }
    }

    // ===================== GETTER METHODS (for testing) =====================

    public UUID getDocumentId() {
        return documentId;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }
}







