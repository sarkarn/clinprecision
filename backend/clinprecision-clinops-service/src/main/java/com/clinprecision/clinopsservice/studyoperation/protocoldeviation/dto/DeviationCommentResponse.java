package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for deviation comment responses
 * Maps from ProtocolDeviationCommentEntity to API response format
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviationCommentResponse {

    private Long id;
    private Long deviationId;
    private String commentText;
    private Long commentedBy;
    private LocalDateTime commentedAt;
    private Boolean isInternal;
}
