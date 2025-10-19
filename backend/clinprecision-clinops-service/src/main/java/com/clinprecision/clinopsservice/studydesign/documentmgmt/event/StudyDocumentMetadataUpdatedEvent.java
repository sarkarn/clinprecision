package com.clinprecision.clinopsservice.studydesign.documentmgmt.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Metadata Updated
 * 
 * Triggered when document metadata is modified (DRAFT only)
 * Tracks what was changed for audit purposes
 */
@Value
@Builder
public class StudyDocumentMetadataUpdatedEvent {
    
    UUID documentId;
    String newDocumentName;
    String newDescription;
    String newVersion;
    Long updatedBy;
    Instant updatedAt;
    String updateReason;
    String ipAddress;
    String userAgent;
}



