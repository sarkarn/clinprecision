package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for document operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    
    private String aggregateUuid;
    private Long databaseId;
    private String message;
    private String status;
}



