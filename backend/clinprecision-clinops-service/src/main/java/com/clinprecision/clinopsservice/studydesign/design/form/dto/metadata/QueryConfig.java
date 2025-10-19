package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Query management configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QueryConfig {
    
    /** Enable automatic query generation */
    private Boolean autoQueryEnabled;
    
    /** Auto-query rules */
    private List<AutoQueryRule> autoQueryRules;
    
    /** Enable manual queries */
    private Boolean manualQueryEnabled;
    
    /** Query workflow configuration */
    private QueryWorkflow queryWorkflow;
    
    /**
     * Auto-query rule
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutoQueryRule {
        /** Unique rule identifier */
        private String ruleId;
        
        /** Condition for query generation */
        private String condition;
        
        /** Query text template */
        private String queryText;
        
        /** Query priority */
        private String priority; // high, medium, low
    }
    
    /**
     * Query workflow configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueryWorkflow {
        /** Response required */
        private Boolean requiresResponse;
        
        /** Allow clarification requests */
        private Boolean allowClarification;
        
        /** Requires approval to close */
        private Boolean requiresClosureApproval;
    }
}
