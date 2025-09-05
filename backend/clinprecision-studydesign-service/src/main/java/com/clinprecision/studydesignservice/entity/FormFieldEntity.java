package com.clinprecision.studydesignservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Entity class representing a field in a CRF form definition.
 * This class is serialized as part of the JSON structure in the form_definitions table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldEntity implements Serializable {

    private String type;
    private String label;
    private String width;
    private int widthPercent;
    private String height;
    private FormFieldMetadataEntity metadata;

    /**
     * Validates that the field has the required properties
     */
    public boolean isValid() {
        if (type == null || label == null) {
            return false;
        }

        // Field type specific validations
        if (type.equals("select") || type.equals("radio") || type.equals("checkbox")) {
            return metadata != null && metadata.getOptions() != null && !metadata.getOptions().isEmpty();
        }

        return true;
    }
}