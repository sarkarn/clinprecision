package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for audit trail record
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditRecordDTO {
    
    private Long id;
    private Long documentId;
    private String actionType;
    private String oldValues;
    private String newValues;
    private String performedBy;
    private LocalDateTime performedAt;
    private String ipAddress;
    private String userAgent;
    private String notes;
}



