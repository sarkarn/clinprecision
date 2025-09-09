package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "studies")
@Setter
@Getter
public class StudyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;

    // Version-related fields
    private String version = "1.0";
    private boolean isLatestVersion = true;
    private Long parentVersionId;
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

    // Relationships
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyVersionEntity> versions;

    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyArmEntity> arms;

    public enum Status {
        draft, active, completed, terminated
    }
}
