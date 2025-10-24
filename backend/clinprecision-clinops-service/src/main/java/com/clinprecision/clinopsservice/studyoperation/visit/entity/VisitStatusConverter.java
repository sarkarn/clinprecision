package com.clinprecision.clinopsservice.studyoperation.visit.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter for VisitStatus enum
 * Converts between enum values and database VARCHAR values
 * 
 * Stores as UPPERCASE strings in database for consistency
 * Handles case-insensitive reading for backward compatibility
 * 
 * @author ClinPrecision Development Team
 * @version 1.0
 * @since October 2025
 */
@Converter(autoApply = true)
public class VisitStatusConverter implements AttributeConverter<VisitStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(VisitStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Store as UPPERCASE for consistency
        return attribute.name();
    }
    
    @Override
    public VisitStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        // Use fromString for case-insensitive parsing
        return VisitStatus.fromString(dbData);
    }
}
