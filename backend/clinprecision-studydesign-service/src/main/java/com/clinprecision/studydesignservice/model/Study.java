package com.clinprecision.studydesignservice.model;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class Study {
    private String id;

    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String phase;

    @Enumerated(EnumType.STRING)
    private StudyEntity.Status status;

    private LocalDate startDate;
    private LocalDate endDate;

    private String metadata;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Status {
        draft, active, completed, terminated
    }
}
