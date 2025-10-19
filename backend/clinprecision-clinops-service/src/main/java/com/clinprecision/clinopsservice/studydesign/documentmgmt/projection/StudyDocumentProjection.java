package com.clinprecision.clinopsservice.studydesign.documentmgmt.projection;


import com.clinprecision.clinopsservice.studydesign.documentmgmt.repository.StudyDocumentRepository;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.entity.StudyDocumentEntity;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.event.*;
import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.Optional;

/**
 * Study Document Projection Handler
 * 
 * Updates the study_documents read model from domain events.
 * Follows CQRS pattern by separating write model (aggregate) from read model (entity).
 * 
 * This projection handler is responsible for:
 * - Creating document records on upload
 * - Updating document status on approval, supersession, archival
 * - Soft deleting documents
 * - Updating document metadata
 * 
 * Uses subscribing event processor for immediate synchronous processing.
 */
@Component
@ProcessingGroup("document-projection")
@Transactional
public class StudyDocumentProjection {

    private static final Logger logger = LoggerFactory.getLogger(StudyDocumentProjection.class);

    @Autowired
    private StudyDocumentRepository documentRepository;

    @PostConstruct
    public void init() {
        logger.info("[DOCUMENT_PROJECTION] ========== Study Document Projection Handler INITIALIZED ==========");
        logger.info("[DOCUMENT_PROJECTION] Handler is ready to process StudyDocument events");
        logger.info("[DOCUMENT_PROJECTION] Processing Group: document-projection (subscribing/synchronous)");
        logger.info("[DOCUMENT_PROJECTION] Repository: {}", documentRepository != null ? "INJECTED" : "NULL");
        logger.info("[DOCUMENT_PROJECTION] ========== Handler Registration Complete ==========");
    }

    /**
     * Handle Study Document Uploaded Event
     * Creates the initial read model entity when document is uploaded
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentUploadedEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentUploadedEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            // Check if entity already exists (for idempotency)
            Optional<StudyDocumentEntity> existing = 
                documentRepository.findByAggregateUuid(event.getDocumentId().toString());
            
            if (existing.isPresent()) {
                logger.warn("[DOCUMENT_PROJECTION] Document entity already exists, skipping creation...");
                return;
            }

            // Create new entity
            StudyDocumentEntity entity = new StudyDocumentEntity();
            entity.setAggregateUuid(event.getDocumentId().toString());
            entity.setStudyId(null); // TODO: Map studyAggregateUuid to studyId via StudyEntity lookup
            entity.setName(event.getDocumentName());
            entity.setDocumentType(event.getDocumentType().name());
            entity.setFileName(event.getFileName());
            entity.setFilePath(event.getFilePath());
            entity.setFileSize(event.getFileSize());
            entity.setMimeType(event.getMimeType());
            entity.setVersion(event.getVersion());
            entity.setDescription(event.getDescription());
            entity.setStatus(StudyDocumentEntity.DocumentStatus.DRAFT);
            entity.setUploadedBy(null); // TODO: Map uploadedBy username to user ID
            entity.setUploadedAt(event.getUploadedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            entity.setDeleted(false);
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document entity created successfully with ID: {}", entity.getId());
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentUploadedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Document Downloaded Event
     * No state change in read model - audit only
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentDownloadedEvent event) {
        logger.debug("[DOCUMENT_PROJECTION] Processing StudyDocumentDownloadedEvent for document: {}", 
                     event.getDocumentId());
        // No read model update needed - audit trail is handled by StudyDocumentAuditProjection
    }

    /**
     * Handle Study Document Approved Event
     * Updates document status to CURRENT
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentApprovedEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentApprovedEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
            
            entity.setStatus(StudyDocumentEntity.DocumentStatus.CURRENT);
            entity.setApprovedBy(event.getApprovedBy());
            entity.setApprovedAt(event.getApprovedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document approved and status updated to CURRENT");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentApprovedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Document Superseded Event
     * Updates document status to SUPERSEDED
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentSupersededEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentSupersededEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
            
            entity.setStatus(StudyDocumentEntity.DocumentStatus.SUPERSEDED);
            entity.setSupersededByDocumentId(event.getNewDocumentId().toString());
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document status updated to SUPERSEDED");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentSupersededEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Document Archived Event
     * Updates document status to ARCHIVED
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentArchivedEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentArchivedEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
            
            entity.setStatus(StudyDocumentEntity.DocumentStatus.ARCHIVED);
            entity.setArchivedBy(event.getArchivedBy());
            entity.setArchivedAt(event.getArchivedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document status updated to ARCHIVED");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentArchivedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Document Deleted Event
     * Marks document as soft deleted
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentDeletedEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentDeletedEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
            
            entity.setDeleted(true);
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document marked as deleted");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentDeletedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Document Metadata Updated Event
     * Updates document metadata fields
     */
    @EventHandler
    @Transactional
    public void on(StudyDocumentMetadataUpdatedEvent event) {
        logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentMetadataUpdatedEvent for document: {}", 
                    event.getDocumentId());
        
        try {
            StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
            
            if (event.getNewDocumentName() != null) {
                entity.setName(event.getNewDocumentName());
            }
            if (event.getNewDescription() != null) {
                entity.setDescription(event.getNewDescription());
            }
            if (event.getNewVersion() != null) {
                entity.setVersion(event.getNewVersion());
            }
            
            documentRepository.save(entity);
            logger.info("[DOCUMENT_PROJECTION] Document metadata updated successfully");
            
        } catch (Exception e) {
            logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentMetadataUpdatedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Find entity by aggregate UUID or throw exception
     */
    private StudyDocumentEntity findEntityOrThrow(String aggregateUuid) {
        return documentRepository.findByAggregateUuid(aggregateUuid)
                .orElseThrow(() -> new IllegalStateException(
                        "Study document entity not found for aggregate UUID: " + aggregateUuid));
    }
}



