package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SDTM standard mapping
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SdtmMapping {
    
    /** SDTM domain (e.g., DM, AE, VS) */
    private String domain;
    
    /** SDTM variable name */
    private String variable;
    
    /** SDTM data type */
    private String dataType; // Char, Num, ISO8601
    
    /** Variable role */
    private String role; // Identifier, Topic, Timing, Grouping, Qualifier
    
    /** Core variable status */
    private String coreStatus; // Req, Exp, Perm
    
    /** Data transformation type */
    private String transformation; // Direct, Derived, Concatenated, Split
    
    /** Transformation rule or formula */
    private String transformationRule;
    
    /** Controlled terminology code */
    private String controlledTerminology;
    
    /** CDISC codelist name */
    private String codelist;
}
