package com.clinprecision.studydesignservice.converter;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity.VisitType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter for VisitType enum to handle case-insensitive database values
 */
@Converter(autoApply = true)
public class VisitTypeConverter implements AttributeConverter<VisitType, String> {

    @Override
    public String convertToDatabaseColumn(VisitType visitType) {
        if (visitType == null) {
            return null;
        }
        return visitType.name().toLowerCase();
    }

    @Override
    public VisitType convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Handle various case formats and convert to enum
            String normalized = dbValue.toUpperCase()
                .replace(" ", "_")
                .replace("-", "_");
            return VisitType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // Log warning and return default
            System.err.println("Unknown visit type value in database: " + dbValue + ". Using TREATMENT as default.");
            return VisitType.TREATMENT;
        }
    }
}