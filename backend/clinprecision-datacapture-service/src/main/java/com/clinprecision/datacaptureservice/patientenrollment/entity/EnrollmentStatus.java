package com.clinprecision.datacaptureservice.patientenrollment.entity;

/**
 * Patient Enrollment Status enumeration
 * Tracks the status of a specific enrollment in a study
 */
public enum EnrollmentStatus {
    ENROLLED,      // Patient has been enrolled in the study
    SCREENING,     // Patient is currently being screened
    ELIGIBLE,      // Patient has been confirmed eligible for the study
    INELIGIBLE,    // Patient has been confirmed ineligible for the study
    WITHDRAWN,     // Patient has withdrawn from the study
    COMPLETED      // Patient has completed the study
}