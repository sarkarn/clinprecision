package com.clinprecision.studydesignservice.model;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object for updating only the basic details of a Study,
 * without affecting collections or relationships
 */
@Getter
@Setter
public class StudyDetailsDTO {
    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String phase;
    private String investigator;

    @Enumerated(EnumType.STRING)
    private StudyEntity.Status status;

    private LocalDate startDate;
    private LocalDate endDate;
    private String metadata;
}
