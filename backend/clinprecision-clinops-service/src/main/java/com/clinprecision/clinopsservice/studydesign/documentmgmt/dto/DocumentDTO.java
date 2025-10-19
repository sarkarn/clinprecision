package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Study Document data transfer
 * Used for query responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    
    private Long id;
    private String aggregateUuid;
    private Long studyId;
    private String documentName;
    private String documentType;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String formattedFileSize;
    private String mimeType;
    private String version;
    private String status;
    private String description;
    private Long uploadedBy;
    private String uploadedByUsername;
    private LocalDateTime uploadedAt;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private String supersededByDocumentId;
    private Long archivedBy;
    private LocalDateTime archivedAt;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



