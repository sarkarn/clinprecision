package com.clinprecision.clinopsservice.document.event;

import com.clinprecision.clinopsservice.document.valueobject.DocumentType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Uploaded
 * 
 * Triggered when a new document is uploaded to the system
 * Document is in DRAFT status after upload
 */
@Value
@Builder
public class StudyDocumentUploadedEvent {
    
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
    Instant uploadedAt;
    String ipAddress;
    String userAgent;
}



