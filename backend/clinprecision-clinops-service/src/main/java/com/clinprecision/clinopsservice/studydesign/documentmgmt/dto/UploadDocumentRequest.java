package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;

/**
 * Request DTO for uploading a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadDocumentRequest {
    
    @NotNull(message = "Study aggregate UUID is required")
    private UUID studyAggregateUuid;
    
    @NotBlank(message = "Document name is required")
    private String documentName;
    
    @NotBlank(message = "Document type is required")
    private String documentType;  // PROTOCOL, ICF, IB, CRF, etc.
    
    @NotBlank(message = "File name is required")
    private String fileName;
    
    @NotBlank(message = "File path is required")
    private String filePath;
    
    @NotNull(message = "File size is required")
    @Positive(message = "File size must be positive")
    private Long fileSize;
    
    private String mimeType;
    private String version;
    private String description;
    
    @NotBlank(message = "Uploaded by user ID is required")
    private Long uploadedBy;
    
    private String ipAddress;
    private String userAgent;
}



