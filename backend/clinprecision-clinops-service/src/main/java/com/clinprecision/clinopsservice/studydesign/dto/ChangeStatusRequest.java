package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

/**
 * DTO for changing study status
 * 
 * CRITICAL: This is the explicit status change API that replaces database triggers!
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeStatusRequest {
    
    private UUID studyId;
    private String newStatus;
    private String reason;
    private Long userId;
}
