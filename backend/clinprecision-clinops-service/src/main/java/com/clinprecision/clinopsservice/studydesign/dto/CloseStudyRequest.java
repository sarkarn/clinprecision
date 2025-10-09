package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

/**
 * DTO for closing a study
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloseStudyRequest {
    
    private UUID studyId;
    private String closureReason;
    private String closureNotes;
    private Long userId;
}
