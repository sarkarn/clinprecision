package com.clinprecision.clinopsservice.studydesign.documentmgmt.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Deleted
 * 
 * Triggered when a DRAFT document is deleted
 * Only DRAFT documents can be deleted
 */
@Value
@Builder
public class StudyDocumentDeletedEvent {
    
    UUID documentId;
    Long deletedBy;
    Instant deletedAt;
    String deletionReason;
    String ipAddress;
    String userAgent;
}



