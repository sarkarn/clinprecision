package com.clinprecision.clinopsservice.patientenrollment.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event emitted when a patient is successfully enrolled in a study
 * 
 * This event captures the complete enrollment context including:
 * - Patient identification
 * - Study and site associations
 * - Enrollment metadata (screening number, enrollment date)
 * - Audit information (who, when)
 * 
 * Follows established ClinPrecision event patterns
 */
@Getter
@Builder
@ToString
public class PatientEnrolledEvent {

    /**
     * Unique identifier for this enrollment record
     */
    private final UUID enrollmentId;
    
    /**
     * Patient aggregate UUID
     */
    private final UUID patientId;
    
    /**
     * Study aggregate UUID
     */
    private final UUID studyId;
    
    /**
     * Site aggregate UUID
     */
    private final UUID siteId;
    
    /**
     * Study-Site association ID (FK to study_sites table)
     * Required for enrollment record persistence in projections.
     * This makes the event immutable and self-contained with all data needed for projection.
     */
    private final Long studySiteId;
    
    /**
     * Screening number assigned to patient for this study
     * This is the user-visible subject identifier (e.g., SCR-001, SUBJ-001)
     */
    private final String screeningNumber;
    
    /**
     * Date when patient was enrolled in the study
     */
    private final LocalDate enrollmentDate;
    
    /**
     * Initial enrollment status (typically "ENROLLED")
     */
    private final String enrollmentStatus;
    
    /**
     * User who performed the enrollment
     */
    private final String enrolledBy;
    
    /**
     * Timestamp when enrollment occurred
     */
    private final LocalDateTime enrolledAt;
    
    /**
     * User ID who created the enrollment
     */
    private final String createdBy;
    
    /**
     * NOTE: Treatment arm field removed for EDC blinding compliance
     * See: EDC_BLINDING_ARCHITECTURE_DECISION.md
     * Randomization handled by external IWRS/RTSM system, not during enrollment
     */
    
    /**
     * Optional: Eligibility confirmation flag
     */
    private final Boolean eligibilityConfirmed;
    
    /**
     * Optional: Additional enrollment notes
     */
    private final String notes;
    
    /**
     * Helper method to generate a display identifier
     */
    public String getDisplayIdentifier() {
        return screeningNumber != null ? screeningNumber : enrollmentId.toString().substring(0, 8);
    }
    
    /**
     * Check if enrollment is active
     */
    public boolean isActiveEnrollment() {
        return "ENROLLED".equalsIgnoreCase(enrollmentStatus) || 
               "ACTIVE".equalsIgnoreCase(enrollmentStatus);
    }
}
