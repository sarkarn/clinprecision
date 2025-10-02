package com.clinprecision.datacaptureservice.patientenrollment.entity;

/**
 * Patient Status enumeration  
 * Tracks the overall status of a patient in the system
 */
public enum PatientStatus {
    REGISTERED,    // Patient has been registered in the system
    SCREENED,      // Patient has been screened for eligibility
    ELIGIBLE,      // Patient has been confirmed eligible
    INELIGIBLE,    // Patient has been confirmed ineligible
    WITHDRAWN      // Patient has withdrawn from participation
}