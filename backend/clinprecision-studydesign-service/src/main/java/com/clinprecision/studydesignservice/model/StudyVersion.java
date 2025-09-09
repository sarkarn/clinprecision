package com.clinprecision.studydesignservice.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyVersion {
    private Long id;
    private Long studyId;
    private String version;
    private LocalDateTime versionDate;
    private String versionNotes;
    private Long createdBy;
}
