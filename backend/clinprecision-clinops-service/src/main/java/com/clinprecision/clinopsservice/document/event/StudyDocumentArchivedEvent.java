package com.clinprecision.clinopsservice.document.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Archived
 * 
 * Triggered when document is permanently archived
 * Document retained per regulatory requirements but no longer active
 */
@Value
@Builder
public class StudyDocumentArchivedEvent {
    
    UUID documentId;
    String archivedBy;
    Instant archivedAt;
    String archivalReason;
    String retentionPolicy;
    String ipAddress;
    String userAgent;
}
