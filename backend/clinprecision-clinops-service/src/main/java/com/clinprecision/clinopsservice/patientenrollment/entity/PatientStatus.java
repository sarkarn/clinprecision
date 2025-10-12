package com.clinprecision.clinopsservice.patientenrollment.entity;

/**
 * Patient Status enumeration  
 * Tracks the overall status of a patient in the system
 */
public enum PatientStatus {
    REGISTERED,    // Patient has been registered in the system
    SCREENING,     // Patient is being screened for eligibility
    SCREENED,      // Patient has been screened for eligibility
    ELIGIBLE,      // Patient has been confirmed eligible
    ENROLLED,      // Patient has been enrolled in a study
    INELIGIBLE,    // Patient has been confirmed ineligible
    WITHDRAWN,     // Patient has withdrawn from participation
    COMPLETED      // Patient has completed participation
}



