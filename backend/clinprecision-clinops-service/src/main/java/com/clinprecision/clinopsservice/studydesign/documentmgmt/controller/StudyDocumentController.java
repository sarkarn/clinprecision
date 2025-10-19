package com.clinprecision.clinopsservice.studydesign.documentmgmt.controller;


import com.clinprecision.clinopsservice.studydesign.design.api.StudyDesignApiConstants;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.dto.*;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.service.StudyDocumentCommandService;
import com.clinprecision.clinopsservice.studydesign.documentmgmt.service.StudyDocumentQueryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API Controller for Study Document Management (DDD/CQRS Implementation)
 * 
 * <p>Follows established ClinPrecision patterns:</p>
 * <ul>
 *   <li>Uses UUID-based routing for DDD aggregates</li>
 *   <li>Separates command and query operations (CQRS)</li>
 *   <li>Returns standardized response formats</li>
 *   <li>Implements proper error handling</li>
 * </ul>
 * 
 * <p><b>URL Migration (October 2025 - April 2026):</b></p>
 * <ul>
 *   <li>NEW (Primary): {@code /api/v1/study-design/documents/*} - DDD-aligned, domain-focused paths</li>
 *   <li>OLD (Deprecated): {@code /api/v1/documents/*} - Legacy paths</li>
 * </ul>
 * 
 * <p><b>API Design:</b></p>
 * <ul>
 *   <li>Command operations: POST, PUT, DELETE (write)</li>
 *   <li>Query operations: GET (read)</li>
 *   <li>UUID-based document identification</li>
 *   <li>Study-scoped document queries</li>
 * </ul>
 * 
 * <p><b>Deprecation Timeline:</b> October 19, 2025 - April 19, 2026 (6 months)</p>
 * 
 * @see StudyDesignApiConstants
 * @author DDD Migration Team
 * @version 2.0
 * @since V004 Migration - Module 1.4 (October 2025)
 */
@RestController
@RequestMapping({
    StudyDesignApiConstants.DOCUMENTS_PATH,        // NEW: /api/v1/study-design/documents
    StudyDesignApiConstants.LEGACY_DOCUMENTS       // OLD: /api/v1/documents (deprecated)
})
@RequiredArgsConstructor
@Slf4j
public class StudyDocumentController {
    
    private final StudyDocumentCommandService commandService;
    private final StudyDocumentQueryService queryService;
    
    // ==================== COMMAND ENDPOINTS (Write Operations) ====================
    
    /**
     * Upload a new document
     * 
     * POST /api/v1/documents/upload
     * 
     * @param request Upload request details
     * @return Created document response with UUID and database ID
     */
    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @Valid @RequestBody UploadDocumentRequest request) {
        
        log.info("API Request: Upload document '{}' for study {}", 
                 request.getDocumentName(), request.getStudyAggregateUuid());
        
        try {
            DocumentResponse response = commandService.uploadDocument(request);
            
            log.info("API Response: Document uploaded successfully with UUID {} and ID {}", 
                     response.getAggregateUuid(), response.getDatabaseId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Upload validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error uploading document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload document", e);
        }
    }
    
    /**
     * Track document download (for audit)
     * 
     * POST /api/v1/documents/{uuid}/download
     * 
     * @param uuid Document UUID
     * @param downloadedBy Username of person downloading
     * @param ipAddress IP address (optional)
     * @param userAgent User agent (optional)
     * @return Success response
     */
    @PostMapping("/{uuid}/download")
    public ResponseEntity<Map<String, String>> downloadDocument(
            @PathVariable UUID uuid,
            @RequestParam Long downloadedBy,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String userAgent) {
        
        log.info("API Request: Download document {} by user {}", uuid, downloadedBy);
        
        try {
            commandService.downloadDocument(uuid, downloadedBy, ipAddress, userAgent);
            
            log.info("API Response: Download tracked for document {}", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Download tracked successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Download tracking failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error tracking download: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to track download", e);
        }
    }
    
    /**
     * Approve a document (DRAFT → CURRENT)
     * 
     * POST /api/v1/documents/{uuid}/approve
     * 
     * @param uuid Document UUID
     * @param request Approval details
     * @return Success response
     */
    @PostMapping("/{uuid}/approve")
    public ResponseEntity<Map<String, String>> approveDocument(
            @PathVariable UUID uuid,
            @Valid @RequestBody ApprovalRequest request) {
        
        log.info("API Request: Approve document {} by user {}", uuid, request.getApprovedBy());
        
        try {
            commandService.approveDocument(uuid, request);
            
            log.info("API Response: Document {} approved successfully", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Document approved successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Approval failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error approving document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to approve document", e);
        }
    }
    
    /**
     * Supersede a document with a newer version
     * 
     * POST /api/v1/documents/{uuid}/supersede
     * 
     * @param uuid Document UUID to supersede
     * @param request Supersession details
     * @return Success response
     */
    @PostMapping("/{uuid}/supersede")
    public ResponseEntity<Map<String, String>> supersedeDocument(
            @PathVariable UUID uuid,
            @Valid @RequestBody SupersedeRequest request) {
        
        log.info("API Request: Supersede document {} with new document {}", 
                 uuid, request.getNewDocumentId());
        
        try {
            commandService.supersedeDocument(uuid, request);
            
            log.info("API Response: Document {} superseded successfully", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Document superseded successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Supersession failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error superseding document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to supersede document", e);
        }
    }
    
    /**
     * Archive a document
     * 
     * POST /api/v1/documents/{uuid}/archive
     * 
     * @param uuid Document UUID
     * @param request Archive details
     * @return Success response
     */
    @PostMapping("/{uuid}/archive")
    public ResponseEntity<Map<String, String>> archiveDocument(
            @PathVariable UUID uuid,
            @Valid @RequestBody ArchiveRequest request) {
        
        log.info("API Request: Archive document {} by user {}", uuid, request.getArchivedBy());
        
        try {
            commandService.archiveDocument(uuid, request);
            
            log.info("API Response: Document {} archived successfully", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Document archived successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Archive failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error archiving document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to archive document", e);
        }
    }
    
    /**
     * Delete a document (soft delete)
     * 
     * DELETE /api/v1/documents/{uuid}
     * 
     * @param uuid Document UUID
     * @param request Deletion details
     * @return Success response
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable UUID uuid,
            @Valid @RequestBody DeleteRequest request) {
        
        log.info("API Request: Delete document {} by user {}", uuid, request.getDeletedBy());
        
        try {
            commandService.deleteDocument(uuid, request);
            
            log.info("API Response: Document {} deleted successfully", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Document deleted successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Deletion failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error deleting document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete document", e);
        }
    }
    
    /**
     * Update document metadata
     * 
     * PUT /api/v1/documents/{uuid}/metadata
     * 
     * @param uuid Document UUID
     * @param request Metadata update details
     * @return Success response
     */
    @PutMapping("/{uuid}/metadata")
    public ResponseEntity<Map<String, String>> updateMetadata(
            @PathVariable UUID uuid,
            @Valid @RequestBody MetadataUpdateRequest request) {
        
        log.info("API Request: Update metadata for document {} by user {}", 
                 uuid, request.getUpdatedBy());
        
        try {
            commandService.updateMetadata(uuid, request);
            
            log.info("API Response: Metadata updated successfully for document {}", uuid);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Metadata updated successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Metadata update failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating metadata: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update metadata", e);
        }
    }
    
    // ==================== QUERY ENDPOINTS (Read Operations) ====================
    
    /**
     * Get document by UUID
     * 
     * GET /api/v1/documents/{uuid}
     * 
     * @param uuid Document UUID
     * @return Document details
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<DocumentDTO> getDocumentByUuid(@PathVariable UUID uuid) {
        log.info("API Request: Get document by UUID {}", uuid);
        
        try {
            DocumentDTO document = queryService.findByUuid(uuid);
            return ResponseEntity.ok(document);
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get document by database ID
     * 
     * GET /api/v1/documents/id/{id}
     * 
     * @param id Database ID
     * @return Document details
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        log.info("API Request: Get document by ID {}", id);
        
        try {
            DocumentDTO document = queryService.findById(id);
            return ResponseEntity.ok(document);
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get all documents for a study
     * 
     * GET /api/v1/documents/study/{studyId}
     * 
     * @param studyId Study ID
     * @return List of documents
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByStudy(@PathVariable Long studyId) {
        log.info("API Request: Get documents for study {}", studyId);
        
        List<DocumentDTO> documents = queryService.findByStudy(studyId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Get documents by study and status
     * 
     * GET /api/v1/documents/study/{studyId}/status/{status}
     * 
     * @param studyId Study ID
     * @param status Document status (DRAFT, CURRENT, SUPERSEDED, ARCHIVED)
     * @return List of documents
     */
    @GetMapping("/study/{studyId}/status/{status}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByStudyAndStatus(
            @PathVariable Long studyId,
            @PathVariable String status) {
        
        log.info("API Request: Get documents for study {} with status {}", studyId, status);
        
        try {
            List<DocumentDTO> documents = queryService.findByStudyAndStatus(studyId, status);
            return ResponseEntity.ok(documents);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get documents by study and document type
     * 
     * GET /api/v1/documents/study/{studyId}/type/{documentType}
     * 
     * @param studyId Study ID
     * @param documentType Document type (PROTOCOL, ICF, IB, etc.)
     * @return List of documents
     */
    @GetMapping("/study/{studyId}/type/{documentType}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByStudyAndType(
            @PathVariable Long studyId,
            @PathVariable String documentType) {
        
        log.info("API Request: Get documents for study {} with type {}", studyId, documentType);
        
        List<DocumentDTO> documents = queryService.findByStudyAndType(studyId, documentType);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Get current documents for a study
     * 
     * GET /api/v1/documents/study/{studyId}/current
     * 
     * @param studyId Study ID
     * @return List of current documents
     */
    @GetMapping("/study/{studyId}/current")
    public ResponseEntity<List<DocumentDTO>> getCurrentDocuments(@PathVariable Long studyId) {
        log.info("API Request: Get current documents for study {}", studyId);
        
        List<DocumentDTO> documents = queryService.findCurrentDocuments(studyId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Get draft documents for a study
     * 
     * GET /api/v1/documents/study/{studyId}/draft
     * 
     * @param studyId Study ID
     * @return List of draft documents
     */
    @GetMapping("/study/{studyId}/draft")
    public ResponseEntity<List<DocumentDTO>> getDraftDocuments(@PathVariable Long studyId) {
        log.info("API Request: Get draft documents for study {}", studyId);
        
        List<DocumentDTO> documents = queryService.findDraftDocuments(studyId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Get archived documents for a study
     * 
     * GET /api/v1/documents/study/{studyId}/archived
     * 
     * @param studyId Study ID
     * @return List of archived documents
     */
    @GetMapping("/study/{studyId}/archived")
    public ResponseEntity<List<DocumentDTO>> getArchivedDocuments(@PathVariable Long studyId) {
        log.info("API Request: Get archived documents for study {}", studyId);
        
        List<DocumentDTO> documents = queryService.findArchivedDocuments(studyId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Get audit trail for a document
     * 
     * GET /api/v1/documents/{uuid}/audit
     * 
     * @param uuid Document UUID
     * @return List of audit records
     */
    @GetMapping("/{uuid}/audit")
    public ResponseEntity<List<AuditRecordDTO>> getAuditTrail(@PathVariable UUID uuid) {
        log.info("API Request: Get audit trail for document {}", uuid);
        
        try {
            List<AuditRecordDTO> auditRecords = queryService.getAuditTrail(uuid);
            return ResponseEntity.ok(auditRecords);
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get document statistics for a study
     * 
     * GET /api/v1/documents/study/{studyId}/statistics
     * 
     * @param studyId Study ID
     * @return Document statistics
     */
    @GetMapping("/study/{studyId}/statistics")
    public ResponseEntity<DocumentStatisticsDTO> getStatistics(@PathVariable Long studyId) {
        log.info("API Request: Get document statistics for study {}", studyId);
        
        DocumentStatisticsDTO statistics = queryService.getStatistics(studyId);
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Health check endpoint
     * 
     * GET /api/v1/documents/health
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Study Document Service (DDD/CQRS)",
            "version", "1.0.0"
        ));
    }
}



