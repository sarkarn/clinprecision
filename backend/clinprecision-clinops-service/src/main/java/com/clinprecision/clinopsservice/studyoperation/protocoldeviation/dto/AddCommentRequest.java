package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for adding a comment to a deviation
 * Used in POST /api/v1/deviations/{id}/comments endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    @NotNull(message = "User ID is required")
    private Long commentedBy;

    private Boolean isInternal = false;
}
