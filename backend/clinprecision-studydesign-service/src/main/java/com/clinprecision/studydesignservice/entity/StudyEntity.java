package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "studies")
@Setter
@Getter
public class StudyEntity {
    @Id
    private String id;

    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    
    // Version-related fields
    private String version = "1.0";
    private boolean isLatestVersion = true;
    private String parentVersionId;
    private String versionNotes;
    
    private String phase;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(columnDefinition = "json")
    private String metadata;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Versioning lock status - prevents further changes when locked
    private boolean isLocked = false;

    public enum Status {
        draft, active, completed, terminated
    }

    // Getters and setters
}
