package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.studydesign.StudyDocumentDto;
import com.clinprecision.common.entity.studydesign.StudyDocumentEntity;
import com.clinprecision.common.mapper.studydesign.StudyDocumentMapper;
import com.clinprecision.studydesignservice.repository.StudyDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing study documents
 * MVP version with local file storage
 */
@Service
@Transactional
public class StudyDocumentService {

    private static final Logger logger = LoggerFactory.getLogger(StudyDocumentService.class);

    private final StudyDocumentRepository documentRepository;
    private final StudyDocumentMapper documentMapper;
    private final Path fileStorageLocation;

    @Autowired
    public StudyDocumentService(StudyDocumentRepository documentRepository,
                               StudyDocumentMapper documentMapper,
                               @Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            logger.info("File storage location created at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            logger.error("Could not create the directory where the uploaded files will be stored.", ex);
            throw new RuntimeException("Could not create file storage directory", ex);
        }
    }

    /**
     * Get all documents for a study
     * @param studyId The study ID
     * @return List of document DTOs
     */
    @Transactional(readOnly = true)
    public List<StudyDocumentDto> getStudyDocuments(Long studyId) {
        logger.info("Retrieving documents for study: {}", studyId);
        
        List<StudyDocumentEntity> documents = documentRepository.findByStudyIdOrderByUploadedAtDesc(studyId);
        
        return documents.stream()
                .map(documentMapper::toDisplayDto)
                .collect(Collectors.toList());
    }

    /**
     * Get current documents for a study (for overview page)
     * @param studyId The study ID
     * @return List of current document DTOs
     */
    @Transactional(readOnly = true)
    public List<StudyDocumentDto> getCurrentStudyDocuments(Long studyId) {
        logger.info("Retrieving current documents for study: {}", studyId);
        
        List<StudyDocumentEntity> documents = documentRepository.findCurrentDocumentsByStudyId(studyId);
        
        return documents.stream()
                .map(documentMapper::toDisplayDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific document by ID
     * @param studyId The study ID
     * @param documentId The document ID
     * @return Optional document DTO
     */
    @Transactional(readOnly = true)
    public Optional<StudyDocumentDto> getDocument(Long studyId, Long documentId) {
        logger.info("Retrieving document {} for study: {}", documentId, studyId);
        
        return documentRepository.findByIdAndStudyId(documentId, studyId)
                .map(documentMapper::toDto);
    }

    /**
     * Upload a new document
     * @param studyId The study ID
     * @param file The file to upload
     * @param documentType The type of document
     * @param description The document description
     * @param uploadedBy The user ID uploading the document
     * @return The created document DTO
     */
    public StudyDocumentDto uploadDocument(Long studyId, MultipartFile file, String documentType, 
                                         String description, Long uploadedBy) {
        logger.info("Uploading document for study: {}, type: {}, filename: {}", 
                   studyId, documentType, file.getOriginalFilename());

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("File must have a valid filename");
        }

        try {
            // Generate unique filename to avoid conflicts
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Create study-specific directory
            Path studyDir = fileStorageLocation.resolve("study_" + studyId);
            Files.createDirectories(studyDir);
            
            // Store file
            Path targetLocation = studyDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            logger.info("File stored at: {}", targetLocation);

            // Create document entity
            StudyDocumentEntity document = new StudyDocumentEntity(
                studyId,
                generateDocumentName(originalFilename, documentType),
                documentType,
                originalFilename,
                targetLocation.toString(),
                file.getSize(),
                file.getContentType(),
                uploadedBy
            );
            
            document.setDescription(description);
            document.setStatus(StudyDocumentEntity.DocumentStatus.CURRENT);
            
            // Save to database
            StudyDocumentEntity savedDocument = documentRepository.save(document);
            
            logger.info("Document saved to database with ID: {}", savedDocument.getId());
            
            return documentMapper.toDto(savedDocument);
            
        } catch (IOException ex) {
            logger.error("Failed to store file: {}", originalFilename, ex);
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    /**
     * Download a document
     * @param studyId The study ID
     * @param documentId The document ID
     * @return The file resource
     */
    @Transactional(readOnly = true)
    public Resource downloadDocument(Long studyId, Long documentId) {
        logger.info("Downloading document {} for study: {}", documentId, studyId);
        
        StudyDocumentEntity document = documentRepository.findByIdAndStudyId(documentId, studyId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                logger.info("Document file found and readable: {}", filePath);
                return resource;
            } else {
                logger.error("Document file not found or not readable: {}", filePath);
                throw new RuntimeException("File not found or not readable");
            }
        } catch (MalformedURLException ex) {
            logger.error("Invalid file path: {}", document.getFilePath(), ex);
            throw new RuntimeException("Invalid file path", ex);
        }
    }

    /**
     * Delete a document
     * @param studyId The study ID
     * @param documentId The document ID
     * @param deletedBy The user ID deleting the document
     */
    public void deleteDocument(Long studyId, Long documentId, Long deletedBy) {
        logger.info("Deleting document {} for study: {} by user: {}", documentId, studyId, deletedBy);
        
        StudyDocumentEntity document = documentRepository.findByIdAndStudyId(documentId, studyId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            // Delete physical file
            Path filePath = Paths.get(document.getFilePath()).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Physical file deleted: {}", filePath);
            } else {
                logger.warn("Physical file not found for deletion: {}", filePath);
            }
            
            // Delete database record
            documentRepository.delete(document);
            logger.info("Document deleted from database: {}", documentId);
            
        } catch (IOException ex) {
            logger.error("Failed to delete physical file: {}", document.getFilePath(), ex);
            // Continue with database deletion even if file deletion fails
            documentRepository.delete(document);
            logger.info("Document record deleted from database despite file deletion failure");
        }
    }

    /**
     * Update document metadata
     * @param studyId The study ID
     * @param documentId The document ID
     * @param updateDto The update information
     * @param updatedBy The user ID updating the document
     * @return The updated document DTO
     */
    public StudyDocumentDto updateDocument(Long studyId, Long documentId, StudyDocumentDto updateDto, Long updatedBy) {
        logger.info("Updating document {} for study: {} by user: {}", documentId, studyId, updatedBy);
        
        StudyDocumentEntity document = documentRepository.findByIdAndStudyId(documentId, studyId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Update allowed fields
        documentMapper.updateEntity(document, updateDto);
        document.setUpdatedAt(LocalDateTime.now());
        
        StudyDocumentEntity updatedDocument = documentRepository.save(document);
        logger.info("Document metadata updated: {}", documentId);
        
        return documentMapper.toDto(updatedDocument);
    }

    /**
     * Get document statistics for a study
     * @param studyId The study ID
     * @return Statistics object
     */
    @Transactional(readOnly = true)
    public DocumentStatistics getDocumentStatistics(Long studyId) {
        logger.info("Getting document statistics for study: {}", studyId);
        
        try {
            Object[] stats = documentRepository.getDocumentStatistics(studyId);
            
            // Debug logging to understand what we're getting
            logger.debug("Statistics query returned: {} elements", stats != null ? stats.length : "null");
            if (stats != null) {
                for (int i = 0; i < stats.length; i++) {
                    Object stat = stats[i];
                    logger.debug("stats[{}] = {} (type: {})", i, stat, 
                               stat != null ? stat.getClass().getSimpleName() : "null");
                }
            }
            
            if (stats == null || stats.length < 4) {
                logger.warn("Unexpected statistics result for study {}: {}", studyId, 
                          stats != null ? Arrays.toString(stats) : "null");
                // Return default statistics
                return new DocumentStatistics(0L, 0L, 0L, 0L);
            }
            
            // Safely convert each element
            Long totalCount = convertToLong(stats[0], "total count");
            Long totalSize = convertToLong(stats[1], "total size"); 
            Long currentCount = convertToLong(stats[2], "current count");
            Long draftCount = convertToLong(stats[3], "draft count");
            
            return new DocumentStatistics(totalCount, totalSize, currentCount, draftCount);
            
        } catch (Exception e) {
            logger.error("Error getting document statistics for study {}: {}", studyId, e.getMessage(), e);
            // Return default statistics to prevent application failure
            return new DocumentStatistics(0L, 0L, 0L, 0L);
        }
    }
    
    /**
     * Safely convert an object to Long
     * @param obj The object to convert
     * @param fieldName The field name for error reporting
     * @return Long value or 0 if conversion fails
     */
    private Long convertToLong(Object obj, String fieldName) {
        if (obj == null) {
            logger.warn("Null value found for {}, defaulting to 0", fieldName);
            return 0L;
        }
        
        try {
            if (obj instanceof Number) {
                return ((Number) obj).longValue();
            } else if (obj instanceof Object[]) {
                Object[] array = (Object[]) obj;
                logger.warn("Unexpected array found for {}: {}, taking first element", fieldName, Arrays.toString(array));
                if (array.length > 0 && array[0] instanceof Number) {
                    return ((Number) array[0]).longValue();
                }
            } else {
                logger.warn("Unexpected type for {}: {}, attempting string conversion", fieldName, obj.getClass().getSimpleName());
                return Long.parseLong(obj.toString());
            }
        } catch (Exception e) {
            logger.error("Failed to convert {} to Long: {}", fieldName, e.getMessage());
        }
        
        return 0L;
    }

    /**
     * Generate a display name for a document
     * @param originalFilename The original filename
     * @param documentType The document type
     * @return Generated display name
     */
    private String generateDocumentName(String originalFilename, String documentType) {
        String baseName = originalFilename;
        int lastDotIndex = originalFilename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            baseName = originalFilename.substring(0, lastDotIndex);
        }
        
        return documentType + " - " + baseName;
    }

    /**
     * Extract file extension from filename
     * @param filename The filename
     * @return The file extension (without dot)
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Document statistics DTO
     */
    public static class DocumentStatistics {
        private final long totalCount;
        private final long totalSize;
        private final long currentCount;
        private final long draftCount;

        public DocumentStatistics(long totalCount, long totalSize, long currentCount, long draftCount) {
            this.totalCount = totalCount;
            this.totalSize = totalSize;
            this.currentCount = currentCount;
            this.draftCount = draftCount;
        }

        public long getTotalCount() { return totalCount; }
        public long getTotalSize() { return totalSize; }
        public long getCurrentCount() { return currentCount; }
        public long getDraftCount() { return draftCount; }

        public String getFormattedTotalSize() {
            if (totalSize < 1024) return totalSize + " B";
            else if (totalSize < 1048576) return String.format("%.1f KB", totalSize / 1024.0);
            else if (totalSize < 1073741824) return String.format("%.1f MB", totalSize / 1048576.0);
            else return String.format("%.1f GB", totalSize / 1073741824.0);
        }
    }
}