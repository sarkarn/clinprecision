package com.clinprecision.studydesignservice.controller;


import com.clinprecision.common.dto.studydesign.StudyDocumentDto;
import com.clinprecision.studydesignservice.service.StudyDocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// import javax.servlet.http.HttpServletRequest; // Not available in this environment
// import java.io.IOException; // Not needed for MVP
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST API Controller for Study Document Management
 * MVP version supporting basic CRUD operations
 */
@RestController
@RequestMapping("/api/studies/{studyId}/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudyDocumentController {

    private static final Logger logger = LoggerFactory.getLogger(StudyDocumentController.class);

    private final StudyDocumentService documentService;

    @Autowired
    public StudyDocumentController(StudyDocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Get all documents for a study
     * GET /api/studies/{studyId}/documents
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStudyDocuments(@PathVariable Long studyId) {
        logger.info("API: Getting documents for study: {}", studyId);
        
        try {
            List<StudyDocumentDto> documents = documentService.getStudyDocuments(studyId);
            StudyDocumentService.DocumentStatistics stats = documentService.getDocumentStatistics(studyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documents", documents);
            response.put("statistics", Map.of(
                "totalCount", stats.getTotalCount(),
                "totalSize", stats.getTotalSize(),
                "formattedTotalSize", stats.getFormattedTotalSize(),
                "currentCount", stats.getCurrentCount(),
                "draftCount", stats.getDraftCount()
            ));
            
            logger.info("API: Retrieved {} documents for study: {}", documents.size(), studyId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("API: Error retrieving documents for study: {}", studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to retrieve documents"));
        }
    }

    /**
     * Get current documents for a study (for overview page)
     * GET /api/studies/{studyId}/documents/current
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentStudyDocuments(@PathVariable Long studyId) {
        logger.info("API: Getting current documents for study: {}", studyId);
        
        try {
            List<StudyDocumentDto> documents = documentService.getCurrentStudyDocuments(studyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documents", documents);
            
            logger.info("API: Retrieved {} current documents for study: {}", documents.size(), studyId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("API: Error retrieving current documents for study: {}", studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to retrieve current documents"));
        }
    }

    /**
     * Get a specific document by ID
     * GET /api/studies/{studyId}/documents/{documentId}
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable Long studyId, 
                                                          @PathVariable Long documentId) {
        logger.info("API: Getting document {} for study: {}", documentId, studyId);
        
        try {
            Optional<StudyDocumentDto> document = documentService.getDocument(studyId, documentId);
            
            if (document.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("document", document.get());
                
                logger.info("API: Retrieved document {} for study: {}", documentId, studyId);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("API: Document {} not found for study: {}", documentId, studyId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "Document not found"));
            }
            
        } catch (Exception e) {
            logger.error("API: Error retrieving document {} for study: {}", documentId, studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to retrieve document"));
        }
    }

    /**
     * Upload a new document
     * POST /api/studies/{studyId}/documents
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable Long studyId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "uploadedBy", defaultValue = "1") Long uploadedBy) {
        
        logger.info("API: Uploading document for study: {}, type: {}, filename: {}", 
                   studyId, documentType, file.getOriginalFilename());
        
        try {
            StudyDocumentDto document = documentService.uploadDocument(
                studyId, file, documentType, description, uploadedBy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);
            response.put("message", "Document uploaded successfully");
            
            logger.info("API: Document uploaded successfully: {} for study: {}", document.getId(), studyId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("API: Invalid upload request for study: {} - {}", studyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));
                    
        } catch (Exception e) {
            logger.error("API: Error uploading document for study: {}", studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to upload document"));
        }
    }

    /**
     * Download a document
     * GET /api/studies/{studyId}/documents/{documentId}/download
     */
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long studyId,
                                                   @PathVariable Long documentId) {
        logger.info("API: Downloading document {} for study: {}", documentId, studyId);
        
        try {
            Resource resource = documentService.downloadDocument(studyId, documentId);
            
            // Get document info to set proper headers
            Optional<StudyDocumentDto> documentInfo = documentService.getDocument(studyId, documentId);
            
            if (documentInfo.isEmpty()) {
                logger.warn("API: Document {} not found for download in study: {}", documentId, studyId);
                return ResponseEntity.notFound().build();
            }
            
            // Use the stored MIME type from the document
            String contentType = documentInfo.get().getMimeType();
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = "application/octet-stream";
            }
            
            String originalFilename = documentInfo.get().getFileName();
            
            logger.info("API: Serving document {} with content type: {} and filename: {}", 
                       documentId, contentType, originalFilename);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + originalFilename + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            logger.error("API: Error downloading document {} for study: {}", documentId, studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update document metadata
     * PUT /api/studies/{studyId}/documents/{documentId}
     */
    @PutMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> updateDocument(
            @PathVariable Long studyId,
            @PathVariable Long documentId,
            @RequestBody StudyDocumentDto updateDto,
            @RequestParam(value = "updatedBy", defaultValue = "1") Long updatedBy) {
        
        logger.info("API: Updating document {} for study: {}", documentId, studyId);
        
        try {
            StudyDocumentDto updatedDocument = documentService.updateDocument(
                studyId, documentId, updateDto, updatedBy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", updatedDocument);
            response.put("message", "Document updated successfully");
            
            logger.info("API: Document {} updated successfully for study: {}", documentId, studyId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("API: Document {} not found for update in study: {}", documentId, studyId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "Document not found"));
            } else {
                logger.error("API: Error updating document {} for study: {}", documentId, studyId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "error", "Failed to update document"));
            }
        }
    }

    /**
     * Delete a document
     * DELETE /api/studies/{studyId}/documents/{documentId}
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable Long studyId,
            @PathVariable Long documentId,
            @RequestParam(value = "deletedBy", defaultValue = "1") Long deletedBy) {
        
        logger.info("API: Deleting document {} for study: {} by user: {}", documentId, studyId, deletedBy);
        
        try {
            documentService.deleteDocument(studyId, documentId, deletedBy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document deleted successfully");
            
            logger.info("API: Document {} deleted successfully for study: {}", documentId, studyId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("API: Document {} not found for deletion in study: {}", documentId, studyId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "Document not found"));
            } else {
                logger.error("API: Error deleting document {} for study: {}", documentId, studyId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "error", "Failed to delete document"));
            }
        }
    }

    /**
     * Get document statistics for a study
     * GET /api/studies/{studyId}/documents/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDocumentStatistics(@PathVariable Long studyId) {
        logger.info("API: Getting document statistics for study: {}", studyId);
        
        try {
            StudyDocumentService.DocumentStatistics stats = documentService.getDocumentStatistics(studyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", Map.of(
                "totalCount", stats.getTotalCount(),
                "totalSize", stats.getTotalSize(),
                "formattedTotalSize", stats.getFormattedTotalSize(),
                "currentCount", stats.getCurrentCount(),
                "draftCount", stats.getDraftCount()
            ));
            
            logger.info("API: Retrieved statistics for study: {} - {} documents, {} total size", 
                       studyId, stats.getTotalCount(), stats.getFormattedTotalSize());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("API: Error retrieving statistics for study: {}", studyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to retrieve statistics"));
        }
    }
}