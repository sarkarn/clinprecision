package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for document statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStatisticsDTO {
    
    private Long studyId;
    private long totalCount;
    private long currentCount;
    private long draftCount;
    private long supersededCount;
    private long archivedCount;
    private Long totalFileSize;
    private String formattedTotalSize;
}



