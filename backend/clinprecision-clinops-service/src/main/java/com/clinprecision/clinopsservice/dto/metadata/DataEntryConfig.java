package com.clinprecision.clinopsservice.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data entry configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DataEntryConfig {
    
    /** Field is derived/calculated */
    private Boolean isDerivedField;
    
    /** Derivation formula */
    private String derivationFormula;
    
    /** Fields this derivation depends on */
    private List<String> derivationDependencies;
    
    /** Query management enabled */
    private Boolean isQueryEnabled;
    
    /** Editable after form lock */
    private Boolean isEditableAfterLock;
    
    /** Editable after database freeze */
    private Boolean isEditableAfterFreeze;
    
    /** Requires double data entry */
    private Boolean requiresDoubleDataEntry;
    
    /** Requires SDV */
    private Boolean requiresSourceDataVerification;
    
    /** Allow 'N/A' response */
    private Boolean allowNA;
    
    /** Allow 'Not Done' response */
    private Boolean allowNotDone;
    
    /** Allow 'Not Asked' response */
    private Boolean allowNotAsked;
    
    /** Allow 'Unknown' response */
    private Boolean allowUnknown;
}
