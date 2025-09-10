package com.clinprecision.studydesignservice.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyArm {
    private Long id;
    private Long studyId;
    private String name;
    private String description;
    private Integer randomizationRatio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
