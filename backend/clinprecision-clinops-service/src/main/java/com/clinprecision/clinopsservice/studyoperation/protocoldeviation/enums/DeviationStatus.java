package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums;

/**
 * Protocol Deviation Status Enumeration
 * Tracks the workflow state of deviation resolution
 */
public enum DeviationStatus {
    OPEN,           // Newly detected, awaiting review
    UNDER_REVIEW,   // Being investigated by site/sponsor
    RESOLVED,       // Root cause identified, corrective action taken
    CLOSED          // Fully documented and closed per regulatory requirements
}
