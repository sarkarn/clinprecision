package com.clinprecision.clinopsservice.document.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Superseded
 * 
 * Triggered when a document is replaced by a new version
 * Original document becomes SUPERSEDED, new version becomes CURRENT
 */
@Value
@Builder
public class StudyDocumentSupersededEvent {
    
    UUID documentId;           // Document being superseded
    UUID newDocumentId;        // New version
    Long supersededBy;
    Instant supersededAt;
    String supersessionReason;
    String ipAddress;
    String userAgent;
}



