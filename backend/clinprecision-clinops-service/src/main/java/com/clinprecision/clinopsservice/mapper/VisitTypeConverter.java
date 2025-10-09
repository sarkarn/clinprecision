package com.clinprecision.clinopsservice.mapper;


import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter for VisitType enum to handle case-insensitive database values
 */
@Converter(autoApply = true)
public class VisitTypeConverter implements AttributeConverter<VisitDefinitionEntity.VisitType, String> {

    @Override
    public String convertToDatabaseColumn(VisitDefinitionEntity.VisitType visitType) {
        if (visitType == null) {
            return null;
        }
        return visitType.name().toLowerCase();
    }

    @Override
    public VisitDefinitionEntity.VisitType convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Handle various case formats and convert to enum
            String normalized = dbValue.toUpperCase()
                .replace(" ", "_")
                .replace("-", "_");
            return VisitDefinitionEntity.VisitType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // Log warning and return default
            System.err.println("Unknown visit type value in database: " + dbValue + ". Using TREATMENT as default.");
            return VisitDefinitionEntity.VisitType.TREATMENT;
        }
    }
}


