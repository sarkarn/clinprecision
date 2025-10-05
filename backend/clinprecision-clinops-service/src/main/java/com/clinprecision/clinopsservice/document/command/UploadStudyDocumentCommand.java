package com.clinprecision.clinopsservice.document.command;

import com.clinprecision.clinopsservice.document.valueobject.DocumentType;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to upload a new study document
 * 
 * Validation:
 * - Document name must not be empty
 * - File path must be valid
 * - File size must be within limits
 * - User must have upload permissions
 * - Study must exist
 */
@Value
@Builder
public class UploadStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    UUID studyAggregateUuid;
    String documentName;
    DocumentType documentType;
    String fileName;
    String filePath;
    Long fileSize;
    String mimeType;
    String version;
    String description;
    String uploadedBy;
    String ipAddress;
    String userAgent;
}
