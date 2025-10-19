package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Audit trail configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditConfig {
    
    /** Audit trail level */
    private String level; // NONE, BASIC, FULL
    
    /** Requires electronic signature */
    private Boolean electronicSignatureRequired;
    
    /** Requires reason for change */
    private Boolean reasonForChangeRequired;
    
    /** Predefined reason options */
    private List<String> reasonForChangeOptions;
    
    /** Track version history */
    private Boolean trackVersionHistory;
    
    /** Change notification configuration */
    private ChangeNotification changeNotification;
    
    /**
     * Change notification configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeNotification {
        /** Enable change notifications */
        private Boolean enabled;
        
        /** Notification recipients (roles) */
        private List<String> recipients;
    }
}
