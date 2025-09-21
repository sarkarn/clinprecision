package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.StudyDocumentDto;
import com.clinprecision.studydesignservice.entity.StudyDocumentEntity;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * Mapper for converting between StudyDocumentEntity and StudyDocumentDto
 * MVP version for basic document management
 */
@Component
public class StudyDocumentMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Convert StudyDocumentEntity to StudyDocumentDto
     * @param entity The document entity
     * @return The document DTO
     */
    public StudyDocumentDto toDto(StudyDocumentEntity entity) {
        if (entity == null) {
            return null;
        }

        StudyDocumentDto dto = new StudyDocumentDto();
        
        // Basic fields
        dto.setId(entity.getId());
        dto.setStudyId(entity.getStudyId());
        dto.setName(entity.getName());
        dto.setType(entity.getDocumentType());
        dto.setFileName(entity.getFileName());
        dto.setFileSize(entity.getFileSize());
        dto.setMimeType(entity.getMimeType());
        dto.setVersion(entity.getVersion());
        dto.setDescription(entity.getDescription());
        dto.setUploadedBy(entity.getUploadedBy());
        dto.setUploadedAt(entity.getUploadedAt());

        // Derived fields
        dto.setSize(entity.getFormattedFileSize());
        
        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().getDisplayName());
        }

        if (entity.getUploadedAt() != null) {
            dto.setLastModified(entity.getUploadedAt().format(DATE_FORMATTER));
        }

        // User information - for MVP, we'll use a placeholder
        // TODO: Implement user lookup service for getting user names
        dto.setUploadedByName("User " + entity.getUploadedBy());

        // URLs and permissions
        dto.setDownloadUrl("/api/studies/" + entity.getStudyId() + "/documents/" + entity.getId() + "/download");
        dto.setCanDownload(true);
        dto.setCanDelete(true); // TODO: Implement permission checking

        // File type information
        dto.setFileExtension(getFileExtension(entity.getFileName()));
        dto.setIsImage(entity.isImage());
        dto.setIsPdf(entity.isPdf());

        return dto;
    }

    /**
     * Convert StudyDocumentDto to StudyDocumentEntity (for updates)
     * @param dto The document DTO
     * @return The document entity
     */
    public StudyDocumentEntity toEntity(StudyDocumentDto dto) {
        if (dto == null) {
            return null;
        }

        StudyDocumentEntity entity = new StudyDocumentEntity();
        
        entity.setId(dto.getId());
        entity.setStudyId(dto.getStudyId());
        entity.setName(dto.getName());
        entity.setDocumentType(dto.getType());
        entity.setFileName(dto.getFileName());
        entity.setFileSize(dto.getFileSize());
        entity.setMimeType(dto.getMimeType());
        entity.setVersion(dto.getVersion());
        entity.setDescription(dto.getDescription());
        entity.setUploadedBy(dto.getUploadedBy());
        entity.setUploadedAt(dto.getUploadedAt());

        // Convert status string back to enum
        if (dto.getStatus() != null) {
            try {
                entity.setStatus(StudyDocumentEntity.DocumentStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Default to CURRENT if status is not recognized
                entity.setStatus(StudyDocumentEntity.DocumentStatus.CURRENT);
            }
        }

        return entity;
    }

    /**
     * Update an existing entity with data from DTO
     * @param entity The existing entity to update
     * @param dto The DTO with updated data
     */
    public void updateEntity(StudyDocumentEntity entity, StudyDocumentDto dto) {
        if (entity == null || dto == null) {
            return;
        }

        // Only update fields that can be modified
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        
        if (dto.getVersion() != null) {
            entity.setVersion(dto.getVersion());
        }

        if (dto.getStatus() != null) {
            try {
                entity.setStatus(StudyDocumentEntity.DocumentStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if new one is invalid
            }
        }
    }

    /**
     * Create a DTO for frontend display (optimized for UI)
     * @param entity The document entity
     * @return The display DTO
     */
    public StudyDocumentDto toDisplayDto(StudyDocumentEntity entity) {
        StudyDocumentDto dto = toDto(entity);
        
        if (dto != null) {
            // Optimize for frontend display
            dto.setUploadedAt(null); // Don't send full timestamp to frontend
            dto.setFileSize(null);   // Frontend uses formatted size
            dto.setMimeType(null);   // Frontend doesn't need MIME type for display
            
            // Add frontend-specific fields
            dto.setCanDownload(entity.getStatus() != StudyDocumentEntity.DocumentStatus.ARCHIVED);
            dto.setCanDelete(entity.getStatus() == StudyDocumentEntity.DocumentStatus.DRAFT);
        }
        
        return dto;
    }

    /**
     * Extract file extension from filename
     * @param fileName The filename
     * @return The file extension (without dot)
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex == fileName.length() - 1) {
            return "";
        }
        
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }
}