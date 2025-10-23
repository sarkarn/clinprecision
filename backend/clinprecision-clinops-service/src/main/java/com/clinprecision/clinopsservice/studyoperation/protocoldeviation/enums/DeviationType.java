package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums;

/**
 * Protocol Deviation Type Enumeration
 * Represents the category of protocol violation
 */
public enum DeviationType {
    VISIT_WINDOW,           // Visit outside protocol-defined time window
    INCLUSION_EXCLUSION,    // Violation of inclusion/exclusion criteria
    PROCEDURE,              // Deviation from protocol-mandated procedures
    DOSING,                 // Incorrect dosing or medication deviation
    CONSENT,                // Informed consent process deviation
    FORM_COMPLETION,        // eCRF completion outside allowed timeframe
    SPECIMEN_HANDLING,      // Sample collection/processing deviation
    RANDOMIZATION,          // Randomization process deviation
    OTHER                   // Other protocol deviations
}
