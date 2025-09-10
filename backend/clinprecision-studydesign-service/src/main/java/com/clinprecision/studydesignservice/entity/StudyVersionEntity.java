package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "study_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyVersionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "version_date")
    private java.time.LocalDateTime versionDate;

    @Column(name = "version_notes")
    private String versionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private StudyEntity study;

    @Column(name = "created_by")
    private Long createdBy;
}
