package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Export configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExportConfig {
    
    /** Include in data export */
    private Boolean includeInExport;
    
    /** Export format */
    private String exportFormat; // original, formatted, coded, transformed
    
    /** Variable name in export */
    private String exportVariable;
    
    /** Transformation to apply on export */
    private String exportTransformation;
    
    /** Datasets to include in */
    private List<String> includeInDataset;
    
    /** Export mappings by dataset type */
    private Map<String, DatasetMapping> exportMapping;
    
    /**
     * Dataset mapping
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatasetMapping {
        /** Target domain */
        private String domain;
        
        /** Target dataset */
        private String dataset;
        
        /** Target variable name */
        private String variable;
    }
}
