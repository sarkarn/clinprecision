package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CDASH standard mapping
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CdashMapping {
    
    /** CDASH domain (e.g., DM, AE, VS) */
    private String domain;
    
    /** CDASH variable name */
    private String variable;
    
    /** CDASH data type */
    private String dataType; // Char, Num, Date, Time
    
    /** Variable role */
    private String role; // Identifier, Topic, Timing, Qualifier
    
    /** Core variable status */
    private String coreStatus; // Required, Expected, Permissible
    
    /** CDASH implementation notes */
    private String implementationNotes;
    
    /** Controlled terminology code */
    private String controlledTerminology;
}
