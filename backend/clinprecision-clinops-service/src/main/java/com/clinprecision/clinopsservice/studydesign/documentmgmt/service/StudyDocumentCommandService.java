package com.clinprecision.clinopsservice.studydesign.documentmgmt.service;


import com.clinprecision.clinopsservice.studydesign.documentmgmt.command.*;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.dto.*;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.valueobject.DocumentType;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.entity.StudyDocumentEntity;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.repository.StudyDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Command service for study document operations
 * Handles all write operations via Axon Command Gateway
 * 
 * NOTE: No class-level @Transactional - Axon handles transactions for command processing.
 * Adding @Transactional prevents projections from seeing committed events due to transaction
 * isolation - the waitForDocumentProjection() method can't see the INSERT until transaction
 * commits, but the transaction can't commit because the method is still waiting (circular deadlock).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDocumentCommandService {
    
    private final CommandGateway commandGateway;
    private final StudyDocumentRepository documentRepository;
    
    private static final int MAX_WAIT_SECONDS = 30;
    private static final int POLL_INTERVAL_MS = 100;
    
    /**
     * Upload a new document
     */
    public DocumentResponse uploadDocument(UploadDocumentRequest request) {
        UUID documentId = UUID.randomUUID();
        log.info("Uploading document: {} with ID: {}", request.getDocumentName(), documentId);
        
        UploadStudyDocumentCommand command = UploadStudyDocumentCommand.builder()
                .documentId(documentId)
                .studyAggregateUuid(request.getStudyAggregateUuid())
                .documentName(request.getDocumentName())
                .documentType(DocumentType.valueOf(request.getDocumentType()))
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .version(request.getVersion())
                .description(request.getDescription())
                .uploadedBy(request.getUploadedBy())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Upload command sent successfully for document: {}", request.getDocumentName());
        
        // Wait for projection to update
        StudyDocumentEntity entity = waitForDocumentProjection(documentId.toString());
        
        return DocumentResponse.builder()
                .aggregateUuid(documentId.toString())
                .databaseId(entity.getId())
                .message("Document uploaded successfully")
                .status(entity.getStatus().toString())
                .build();
    }
    
    /**
     * Download a document (tracked for audit)
     */
    public void downloadDocument(UUID documentId, Long downloadedBy, String ipAddress, String userAgent) {
        log.info("Downloading document: {}", documentId);
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        DownloadStudyDocumentCommand command = DownloadStudyDocumentCommand.builder()
                .documentId(documentId)
                .downloadedBy(downloadedBy)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        
        commandGateway.send(command);
        log.info("Download command sent successfully for document: {}", documentId);
    }
    
    /**
     * Approve a document
     */
    public void approveDocument(UUID documentId, ApprovalRequest request) {
        log.info("Approving document: {}", documentId);
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        if (!"DRAFT".equals(entity.getStatus())) {
            throw new IllegalStateException("Only draft documents can be approved. Current status: " + entity.getStatus());
        }
        
        ApproveStudyDocumentCommand command = ApproveStudyDocumentCommand.builder()
                .documentId(documentId)
                .approvedBy(request.getApprovedBy())
                .approvalComments(request.getApprovalComments())
                .electronicSignature(request.getElectronicSignature())
                .approvalRole(request.getApprovalRole())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Approval command sent successfully for document: {}", documentId);
    }
    
    /**
     * Supersede a document with a newer version
     */
    public void supersedeDocument(UUID documentId, SupersedeRequest request) {
        log.info("Superseding document: {} with new document: {}", documentId, request.getNewDocumentId());
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        if (!"CURRENT".equals(entity.getStatus())) {
            throw new IllegalStateException("Only current documents can be superseded. Current status: " + entity.getStatus());
        }
        
        // Verify new document exists
        StudyDocumentEntity newDocument = documentRepository.findByAggregateUuid(request.getNewDocumentId().toString())
                .orElseThrow(() -> new IllegalArgumentException("New document not found: " + request.getNewDocumentId()));
        
        SupersedeStudyDocumentCommand command = SupersedeStudyDocumentCommand.builder()
                .documentId(documentId)
                .newDocumentId(request.getNewDocumentId())
                .supersededBy(request.getSupersededBy())
                .supersessionReason(request.getSupersessionReason())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Supersession command sent successfully for document: {}", documentId);
    }
    
    /**
     * Archive a document
     */
    public void archiveDocument(UUID documentId, ArchiveRequest request) {
        log.info("Archiving document: {}", documentId);
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        if ("ARCHIVED".equals(entity.getStatus().toString()) || entity.isDeleted()) {
            throw new IllegalStateException("Document is already archived or deleted");
        }
        
        ArchiveStudyDocumentCommand command = ArchiveStudyDocumentCommand.builder()
                .documentId(documentId)
                .archivedBy(request.getArchivedBy())
                .archivalReason(request.getArchivalReason())
                .retentionPolicy(request.getRetentionPolicy())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Archive command sent successfully for document: {}", documentId);
    }
    
    /**
     * Delete a document (soft delete)
     */
    public void deleteDocument(UUID documentId, DeleteRequest request) {
        log.info("Deleting document: {}", documentId);
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        if (entity.isDeleted()) {
            throw new IllegalStateException("Document is already deleted");
        }
        
        DeleteStudyDocumentCommand command = DeleteStudyDocumentCommand.builder()
                .documentId(documentId)
                .deletedBy(request.getDeletedBy())
                .deletionReason(request.getDeletionReason())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Delete command sent successfully for document: {}", documentId);
    }
    
    /**
     * Update document metadata
     */
    public void updateMetadata(UUID documentId, MetadataUpdateRequest request) {
        log.info("Updating metadata for document: {}", documentId);
        
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        if (entity.isDeleted()) {
            throw new IllegalStateException("Cannot update metadata for deleted documents");
        }
        
        UpdateStudyDocumentMetadataCommand command = UpdateStudyDocumentMetadataCommand.builder()
                .documentId(documentId)
                .newDocumentName(request.getNewDocumentName())
                .newDescription(request.getNewDescription())
                .newVersion(request.getNewVersion())
                .updatedBy(request.getUpdatedBy())
                .updateReason(request.getUpdateReason())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        
        commandGateway.send(command);
        log.info("Metadata update command sent successfully for document: {}", documentId);
    }
    
    /**
     * Wait for projection to be updated after command execution
     */
    private StudyDocumentEntity waitForDocumentProjection(String aggregateUuid) {
        log.debug("Waiting for document projection: {}", aggregateUuid);
        
        long startTime = System.currentTimeMillis();
        long maxWaitMillis = MAX_WAIT_SECONDS * 1000L;
        
        while (System.currentTimeMillis() - startTime < maxWaitMillis) {
            Optional<StudyDocumentEntity> entity = documentRepository.findByAggregateUuid(aggregateUuid);
            if (entity.isPresent()) {
                log.debug("Document projection found: {}", aggregateUuid);
                return entity.get();
            }
            
            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for projection", e);
            }
        }
        
        throw new RuntimeException("Document projection not found after " + MAX_WAIT_SECONDS + " seconds: " + aggregateUuid);
    }
}



