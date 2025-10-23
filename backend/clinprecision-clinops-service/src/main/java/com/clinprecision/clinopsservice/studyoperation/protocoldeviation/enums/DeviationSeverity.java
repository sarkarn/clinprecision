package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums;

/**
 * Protocol Deviation Severity Enumeration
 * Indicates the impact level of the deviation
 */
public enum DeviationSeverity {
    MINOR,      // Minimal impact, no effect on subject safety or data integrity
    MAJOR,      // Significant impact, may affect data quality
    CRITICAL    // Severe impact, compromises subject safety or data validity
}
