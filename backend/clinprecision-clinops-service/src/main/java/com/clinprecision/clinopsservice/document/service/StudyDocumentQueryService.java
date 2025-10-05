package com.clinprecision.clinopsservice.document.service;

import com.clinprecision.clinopsservice.document.dto.AuditRecordDTO;
import com.clinprecision.clinopsservice.document.dto.DocumentDTO;
import com.clinprecision.clinopsservice.document.dto.DocumentStatisticsDTO;
import com.clinprecision.clinopsservice.entity.StudyDocumentAuditEntity;
import com.clinprecision.clinopsservice.entity.StudyDocumentEntity;
import com.clinprecision.clinopsservice.entity.StudyDocumentEntity.DocumentStatus;
import com.clinprecision.clinopsservice.repository.StudyDocumentAuditRepository;
import com.clinprecision.clinopsservice.repository.StudyDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Query service for study documents
 * Handles all read operations without modifying state
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class StudyDocumentQueryService {
    
    private final StudyDocumentRepository documentRepository;
    private final StudyDocumentAuditRepository auditRepository;
    
    /**
     * Find document by aggregate UUID
     */
    public DocumentDTO findByUuid(UUID uuid) {
        log.debug("Finding document by UUID: {}", uuid);
        StudyDocumentEntity entity = documentRepository.findByAggregateUuid(uuid.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + uuid));
        return mapToDto(entity);
    }
    
    /**
     * Find document by aggregate UUID (returns Optional)
     */
    public Optional<DocumentDTO> findByUuidOptional(UUID uuid) {
        log.debug("Finding document by UUID (optional): {}", uuid);
        return documentRepository.findByAggregateUuid(uuid.toString())
                .map(this::mapToDto);
    }
    
    /**
     * Find document by database ID
     */
    public DocumentDTO findById(Long id) {
        log.debug("Finding document by ID: {}", id);
        StudyDocumentEntity entity = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
        return mapToDto(entity);
    }
    
    /**
     * Find all documents for a study
     */
    public List<DocumentDTO> findByStudy(Long studyId) {
        log.debug("Finding documents for study: {}", studyId);
        return documentRepository.findByStudyIdAndIsDeletedFalse(studyId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Find documents by study and status
     */
    public List<DocumentDTO> findByStudyAndStatus(Long studyId, String status) {
        log.debug("Finding documents for study: {} with status: {}", studyId, status);
        DocumentStatus documentStatus;
        try {
            documentStatus = DocumentStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid document status: " + status);
        }
        
        return documentRepository.findByStudyIdAndStatusAndIsDeletedFalse(studyId, documentStatus)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Find documents by study and document type
     */
    public List<DocumentDTO> findByStudyAndType(Long studyId, String documentType) {
        log.debug("Finding documents for study: {} with type: {}", studyId, documentType);
        return documentRepository.findByStudyIdAndDocumentTypeAndIsDeletedFalse(studyId, documentType)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get current (active) documents for a study
     */
    public List<DocumentDTO> findCurrentDocuments(Long studyId) {
        log.debug("Finding current documents for study: {}", studyId);
        return documentRepository.findByStudyIdAndStatusAndIsDeletedFalse(studyId, DocumentStatus.CURRENT)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get draft documents for a study
     */
    public List<DocumentDTO> findDraftDocuments(Long studyId) {
        log.debug("Finding draft documents for study: {}", studyId);
        return documentRepository.findByStudyIdAndStatusAndIsDeletedFalse(studyId, DocumentStatus.DRAFT)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get archived documents for a study
     */
    public List<DocumentDTO> findArchivedDocuments(Long studyId) {
        log.debug("Finding archived documents for study: {}", studyId);
        return documentRepository.findByStudyIdAndStatusAndIsDeletedFalse(studyId, DocumentStatus.ARCHIVED)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get audit trail for a document
     */
    public List<AuditRecordDTO> getAuditTrail(UUID documentId) {
        log.debug("Getting audit trail for document: {}", documentId);
        
        // First find the document to get its database ID
        StudyDocumentEntity document = documentRepository.findByAggregateUuid(documentId.toString())
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
        
        return auditRepository.findByDocumentIdOrderByPerformedAtDesc(document.getId())
                .stream()
                .map(this::mapAuditToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get audit trail by document database ID
     */
    public List<AuditRecordDTO> getAuditTrailById(Long documentId) {
        log.debug("Getting audit trail for document ID: {}", documentId);
        return auditRepository.findByDocumentIdOrderByPerformedAtDesc(documentId)
                .stream()
                .map(this::mapAuditToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get document statistics for a study
     */
    public DocumentStatisticsDTO getStatistics(Long studyId) {
        log.debug("Getting document statistics for study: {}", studyId);
        
        List<StudyDocumentEntity> allDocuments = documentRepository.findByStudyIdAndIsDeletedFalse(studyId);
        
        long totalCount = allDocuments.size();
        long currentCount = allDocuments.stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.CURRENT)
                .count();
        long draftCount = allDocuments.stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.DRAFT)
                .count();
        long supersededCount = allDocuments.stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.SUPERSEDED)
                .count();
        long archivedCount = allDocuments.stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.ARCHIVED)
                .count();
        
        Long totalFileSize = allDocuments.stream()
                .mapToLong(StudyDocumentEntity::getFileSize)
                .sum();
        
        return DocumentStatisticsDTO.builder()
                .studyId(studyId)
                .totalCount(totalCount)
                .currentCount(currentCount)
                .draftCount(draftCount)
                .supersededCount(supersededCount)
                .archivedCount(archivedCount)
                .totalFileSize(totalFileSize)
                .formattedTotalSize(formatFileSize(totalFileSize))
                .build();
    }
    
    /**
     * Map entity to DTO
     */
    private DocumentDTO mapToDto(StudyDocumentEntity entity) {
        return DocumentDTO.builder()
                .id(entity.getId())
                .aggregateUuid(entity.getAggregateUuid())
                .studyId(entity.getStudyId())
                .documentName(entity.getName())
                .documentType(entity.getDocumentType())
                .fileName(entity.getFileName())
                .filePath(entity.getFilePath())
                .fileSize(entity.getFileSize())
                .formattedFileSize(formatFileSize(entity.getFileSize()))
                .mimeType(entity.getMimeType())
                .version(entity.getVersion())
                .status(entity.getStatus().toString())
                .description(entity.getDescription())
                .uploadedBy(entity.getUploadedBy())
                .uploadedByUsername(null) // Would need to lookup from user service
                .uploadedAt(entity.getUploadedAt())
                .approvedBy(entity.getApprovedBy())
                .approvedAt(entity.getApprovedAt())
                .supersededByDocumentId(entity.getSupersededByDocumentId())
                .archivedBy(entity.getArchivedBy())
                .archivedAt(entity.getArchivedAt())
                .isDeleted(entity.isDeleted())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    /**
     * Map audit entity to DTO
     */
    private AuditRecordDTO mapAuditToDto(StudyDocumentAuditEntity entity) {
        return AuditRecordDTO.builder()
                .id(entity.getId())
                .documentId(entity.getDocumentId())
                .actionType(entity.getActionType().toString())
                .oldValues(entity.getOldValues())
                .newValues(entity.getNewValues())
                .performedBy(entity.getPerformedBy())
                .performedAt(entity.getPerformedAt())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .notes(entity.getNotes())
                .build();
    }
    
    /**
     * Format file size for display
     */
    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) {
            return "0 B";
        }
        
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", size, units[unitIndex]);
    }
}



