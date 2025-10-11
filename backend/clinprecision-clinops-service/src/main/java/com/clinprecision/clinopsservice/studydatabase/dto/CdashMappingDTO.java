package com.clinprecision.clinopsservice.studydatabase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for CDASH Mapping Response
 * Returns CDISC CDASH/SDTM mapping information for regulatory submissions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CdashMappingDTO {
    
    private Long id;
    private Long studyId;
    private Long formId;
    private String fieldName;
    
    // CDASH (data collection standard)
    private String cdashDomain;
    private String cdashVariable;
    private String cdashLabel;
    
    // SDTM (submission format)
    private String sdtmDomain;
    private String sdtmVariable;
    private String sdtmLabel;
    private String sdtmDatatype;
    private Integer sdtmLength;
    
    // CDISC standards
    private String cdiscTerminologyCode;
    private String dataOrigin;
    private String unitConversionRule;
    private String mappingNotes;
    
    private Boolean isActive;
}
