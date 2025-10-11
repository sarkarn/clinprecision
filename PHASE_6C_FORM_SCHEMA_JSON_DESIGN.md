# Phase 6C: Form Schema JSON Structure for Metadata

**Date**: October 11, 2025  
**Status**: 🔄 IN PROGRESS  
**Phase**: Design & Documentation

---

## Executive Summary

Define the JSON schema structure for embedding Phase 6 item-level metadata within form definitions. This enables the database build worker service to parse actual metadata from form schemas instead of using hardcoded sample data.

**Goals**:
- ✅ Define field-level metadata schema (clinical & regulatory flags)
- ✅ Define CDASH/SDTM mapping schema
- ✅ Define medical coding configuration schema
- ✅ Define data review workflow schema
- ✅ Provide complete examples
- ✅ Document validation rules

---

## Current Form Schema Structure

### Existing FormDefinitionEntity
```java
@Entity
@Table(name = "form_definitions")
public class FormDefinitionEntity {
    private Long id;
    private String name;
    private String formType;      // "AE", "VITALS", "MH", "DM", etc.
    private String formSchema;    // JSON string containing form definition ⬅️ We extend this
    private String description;
    // ... other fields
}
```

### Current Form Schema Format (Simplified)
```json
{
  "formName": "Adverse Events Form",
  "formType": "AE",
  "version": "1.0",
  "fields": [
    {
      "name": "adverse_event_term",
      "type": "text",
      "label": "Adverse Event Description",
      "required": true,
      "maxLength": 500
    }
  ]
}
```

**Problem**: No metadata, CDASH mappings, or coding config

---

## Enhanced Form Schema Structure (Phase 6)

### Complete Schema with Phase 6 Extensions

```json
{
  "formName": "Adverse Events Form",
  "formType": "AE",
  "version": "2.0",
  "description": "Records adverse events experienced by study participants",
  "cdiscDomain": "AE",
  
  "fields": [
    {
      "name": "subject_id",
      "type": "text",
      "label": "Subject ID",
      "required": true,
      "maxLength": 12,
      "validationPattern": "^[A-Z0-9]{6,12}$",
      
      // ✨ NEW: Phase 6 Field Metadata
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "medicalReviewRequired": false,
          "criticalDataPoint": true,
          "safetyDataPoint": false,
          "efficacyDataPoint": false,
          "dataReviewRequired": false
        },
        "regulatory": {
          "fdaRequired": true,
          "emaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true,
          "hipaaProtected": true
        },
        "auditTrail": {
          "level": "FULL",
          "electronicSignatureRequired": false,
          "reasonForChangeRequired": false
        },
        "dataEntry": {
          "isDerivedField": false,
          "derivationFormula": null,
          "isQueryEnabled": true,
          "isEditableAfterLock": false
        }
      }
    },
    
    {
      "name": "ae_start_date",
      "type": "date",
      "label": "AE Start Date",
      "required": true,
      
      // ✨ NEW: Phase 6 Field Metadata
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC",
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      // ✨ NEW: CDASH Mapping (if applicable)
      "cdashMapping": {
        "domain": "AE",
        "variable": "AESTDAT",
        "label": "Start Date of Adverse Event",
        "sdtmDomain": "AE",
        "sdtmVariable": "AESTDTC",
        "sdtmDatatype": "ISO8601",
        "cdiscTerminology": "C49488",
        "dataOrigin": "COLLECTED"
      }
    },
    
    {
      "name": "adverse_event_term",
      "type": "text",
      "label": "Adverse Event Description",
      "required": true,
      "maxLength": 500,
      
      // ✨ NEW: Field Metadata
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "medicalReviewRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "emaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "FULL",
          "electronicSignatureRequired": true,
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      // ✨ NEW: Medical Coding Configuration
      "medicalCoding": {
        "required": true,
        "dictionary": {
          "type": "MedDRA",
          "version": "26.0"
        },
        "autoCoding": {
          "enabled": true,
          "confidenceThreshold": 85,
          "maxMatches": 10,
          "showAllMatches": false
        },
        "codingLevel": "PT",
        "capturePrimarySoc": true,
        "verbatimField": {
          "label": "Adverse Event Description (Verbatim)",
          "maxLength": 500,
          "required": true
        },
        "workflow": {
          "type": "DUAL_CODER",
          "primaryCoderRole": "MEDICAL_CODER",
          "secondaryCoderRole": "SENIOR_MEDICAL_CODER",
          "adjudicationRequired": true,
          "adjudicatorRole": "MEDICAL_MONITOR",
          "manualReviewRequired": true
        },
        "instructions": "Code to MedDRA PT level. Use LLT only if PT not available. Adjudication required for discrepancies."
      }
    },
    
    {
      "name": "ae_severity",
      "type": "select",
      "label": "Severity",
      "required": true,
      "options": ["Mild", "Moderate", "Severe"],
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "medicalReviewRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC",
          "reasonForChangeRequired": true
        }
      },
      
      "cdashMapping": {
        "domain": "AE",
        "variable": "AESEV",
        "label": "Severity/Intensity",
        "sdtmDomain": "AE",
        "sdtmVariable": "AESEV",
        "sdtmDatatype": "Char",
        "cdiscTerminology": "C49488",
        "dataOrigin": "COLLECTED",
        "controlledTerms": {
          "codeList": "C66769",
          "values": ["MILD", "MODERATE", "SEVERE"]
        }
      }
    }
  ],
  
  // ✨ NEW: Form-level metadata
  "formMetadata": {
    "requiresElectronicSignature": true,
    "signerRole": "INVESTIGATOR",
    "allowsDataReview": true,
    "reviewerRole": "DATA_MANAGER",
    "allowsSDV": true,
    "sdvRole": "CLINICAL_MONITOR",
    "regulatorySubmission": {
      "includeInSDTM": true,
      "sdtmDomain": "AE",
      "defineXmlVersion": "2.1"
    }
  }
}
```

---

## Schema Components Breakdown

### 1. Field Metadata Object

```typescript
interface FieldMetadata {
  clinical: ClinicalFlags;
  regulatory: RegulatoryFlags;
  auditTrail: AuditTrailConfig;
  dataEntry: DataEntryConfig;
}

interface ClinicalFlags {
  sdvRequired: boolean;              // Source Data Verification required
  medicalReviewRequired: boolean;    // Medical review required
  criticalDataPoint: boolean;        // Critical for study integrity
  safetyDataPoint: boolean;          // Safety endpoint data
  efficacyDataPoint: boolean;        // Efficacy endpoint data
  dataReviewRequired: boolean;       // General data review required
}

interface RegulatoryFlags {
  fdaRequired: boolean;              // FDA regulatory requirement
  emaRequired: boolean;              // EMA regulatory requirement
  cfr21Part11: boolean;              // 21 CFR Part 11 compliance
  gcpRequired: boolean;              // ICH GCP requirement
  hipaaProtected: boolean;           // HIPAA protected data
}

interface AuditTrailConfig {
  level: "NONE" | "BASIC" | "FULL"; // Audit trail detail level
  electronicSignatureRequired: boolean;
  reasonForChangeRequired: boolean;
}

interface DataEntryConfig {
  isDerivedField: boolean;           // Calculated/derived field
  derivationFormula?: string;        // Formula if derived
  isQueryEnabled: boolean;           // Allow queries on this field
  isEditableAfterLock: boolean;      // Editable after form lock
}
```

### 2. CDASH Mapping Object

```typescript
interface CdashMapping {
  domain: string;                    // CDASH domain (VS, AE, LB, etc.)
  variable: string;                  // CDASH variable name
  label: string;                     // CDASH variable label
  sdtmDomain: string;                // SDTM domain
  sdtmVariable: string;              // SDTM variable name
  sdtmDatatype: string;              // SDTM datatype (Char, Num, ISO8601)
  sdtmLength?: number;               // Max length for SDTM
  cdiscTerminology?: string;         // CDISC CT code
  dataOrigin: string;                // CRF, DERIVED, ASSIGNED, etc.
  unitConversionRule?: string;       // Unit conversion if needed
  mappingNotes?: string;             // Additional notes
  controlledTerms?: {                // For coded values
    codeList: string;
    values: string[];
  };
}
```

### 3. Medical Coding Object

```typescript
interface MedicalCoding {
  required: boolean;
  dictionary: {
    type: "MedDRA" | "WHO_DD" | "SNOMED" | "ICD10" | "ICD11" | "LOINC";
    version: string;
  };
  autoCoding: {
    enabled: boolean;
    confidenceThreshold: number;     // 0-100
    maxMatches: number;
    showAllMatches: boolean;
  };
  codingLevel?: string;              // PT, LLT, HLT, etc. (MedDRA)
  capturePrimarySoc?: boolean;       // Capture SOC (MedDRA)
  verbatimField: {
    label: string;
    maxLength: number;
    required: boolean;
  };
  workflow: {
    type: "SINGLE_CODER" | "DUAL_CODER" | "AUTO_WITH_REVIEW" | "CENTRALIZED";
    primaryCoderRole: string;
    secondaryCoderRole?: string;
    adjudicationRequired: boolean;
    adjudicatorRole?: string;
    manualReviewRequired: boolean;
  };
  instructions?: string;
}
```

### 4. Form-Level Metadata

```typescript
interface FormMetadata {
  requiresElectronicSignature: boolean;
  signerRole?: string;
  allowsDataReview: boolean;
  reviewerRole?: string;
  allowsSDV: boolean;
  sdvRole?: string;
  regulatorySubmission: {
    includeInSDTM: boolean;
    sdtmDomain?: string;
    defineXmlVersion?: string;
  };
}
```

---

## Example Schemas by Form Type

### Example 1: Vital Signs Form

```json
{
  "formName": "Vital Signs",
  "formType": "VITALS",
  "version": "2.0",
  "cdiscDomain": "VS",
  
  "fields": [
    {
      "name": "systolic_bp",
      "type": "number",
      "label": "Systolic Blood Pressure",
      "required": true,
      "unit": "mmHg",
      "minValue": 60,
      "maxValue": 250,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC",
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      "cdashMapping": {
        "domain": "VS",
        "variable": "SYSBP",
        "label": "Systolic Blood Pressure",
        "sdtmDomain": "VS",
        "sdtmVariable": "VSORRES",
        "sdtmDatatype": "Num",
        "sdtmLength": 8,
        "cdiscTerminology": "C25298",
        "dataOrigin": "COLLECTED",
        "unitConversionRule": "mmHg to kPa: multiply by 0.133322"
      }
    },
    
    {
      "name": "diastolic_bp",
      "type": "number",
      "label": "Diastolic Blood Pressure",
      "required": true,
      "unit": "mmHg",
      "minValue": 40,
      "maxValue": 150,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC",
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      "cdashMapping": {
        "domain": "VS",
        "variable": "DIABP",
        "label": "Diastolic Blood Pressure",
        "sdtmDomain": "VS",
        "sdtmVariable": "VSORRES",
        "sdtmDatatype": "Num",
        "sdtmLength": 8,
        "cdiscTerminology": "C25299",
        "dataOrigin": "COLLECTED",
        "unitConversionRule": "mmHg to kPa: multiply by 0.133322"
      }
    },
    
    {
      "name": "heart_rate",
      "type": "number",
      "label": "Heart Rate",
      "required": true,
      "unit": "bpm",
      "minValue": 30,
      "maxValue": 220,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC"
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      "cdashMapping": {
        "domain": "VS",
        "variable": "HR",
        "label": "Heart Rate",
        "sdtmDomain": "VS",
        "sdtmVariable": "VSORRES",
        "sdtmDatatype": "Num",
        "cdiscTerminology": "C49677",
        "dataOrigin": "COLLECTED"
      }
    }
  ],
  
  "formMetadata": {
    "allowsSDV": true,
    "sdvRole": "CLINICAL_MONITOR",
    "regulatorySubmission": {
      "includeInSDTM": true,
      "sdtmDomain": "VS"
    }
  }
}
```

### Example 2: Medical History Form

```json
{
  "formName": "Medical History",
  "formType": "MH",
  "version": "2.0",
  "cdiscDomain": "MH",
  
  "fields": [
    {
      "name": "medical_condition",
      "type": "text",
      "label": "Medical Condition",
      "required": true,
      "maxLength": 300,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "medicalReviewRequired": true,
          "criticalDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "FULL",
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      "medicalCoding": {
        "required": true,
        "dictionary": {
          "type": "WHO_DD",
          "version": "2024-Q1"
        },
        "autoCoding": {
          "enabled": true,
          "confidenceThreshold": 80,
          "maxMatches": 15,
          "showAllMatches": true
        },
        "verbatimField": {
          "label": "Medical Condition Description",
          "maxLength": 300,
          "required": true
        },
        "workflow": {
          "type": "SINGLE_CODER",
          "primaryCoderRole": "DATA_MANAGER",
          "adjudicationRequired": false,
          "manualReviewRequired": false
        },
        "instructions": "Code to WHO-DD. Review for accuracy."
      },
      
      "cdashMapping": {
        "domain": "MH",
        "variable": "MHTERM",
        "label": "Medical History Term",
        "sdtmDomain": "MH",
        "sdtmVariable": "MHTERM",
        "sdtmDatatype": "Char",
        "dataOrigin": "COLLECTED"
      }
    },
    
    {
      "name": "condition_ongoing",
      "type": "boolean",
      "label": "Ongoing Condition?",
      "required": true,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC"
        }
      },
      
      "cdashMapping": {
        "domain": "MH",
        "variable": "MHONGO",
        "label": "Ongoing Event",
        "sdtmDomain": "MH",
        "sdtmVariable": "MHENRF",
        "sdtmDatatype": "Char",
        "dataOrigin": "COLLECTED",
        "controlledTerms": {
          "codeList": "C66742",
          "values": ["ONGOING", "NOT ONGOING"]
        }
      }
    }
  ],
  
  "formMetadata": {
    "requiresElectronicSignature": false,
    "allowsDataReview": true,
    "reviewerRole": "DATA_MANAGER",
    "allowsSDV": true,
    "sdvRole": "CLINICAL_MONITOR",
    "regulatorySubmission": {
      "includeInSDTM": true,
      "sdtmDomain": "MH"
    }
  }
}
```

### Example 3: Laboratory Results Form

```json
{
  "formName": "Laboratory Results - Hematology",
  "formType": "LB",
  "version": "2.0",
  "cdiscDomain": "LB",
  
  "fields": [
    {
      "name": "hemoglobin",
      "type": "number",
      "label": "Hemoglobin",
      "required": true,
      "unit": "g/dL",
      "decimalPlaces": 1,
      
      "metadata": {
        "clinical": {
          "sdvRequired": true,
          "criticalDataPoint": true,
          "safetyDataPoint": true,
          "efficacyDataPoint": true
        },
        "regulatory": {
          "fdaRequired": true,
          "cfr21Part11": true,
          "gcpRequired": true
        },
        "auditTrail": {
          "level": "BASIC",
          "reasonForChangeRequired": true
        },
        "dataEntry": {
          "isQueryEnabled": true
        }
      },
      
      "cdashMapping": {
        "domain": "LB",
        "variable": "LBORRES",
        "label": "Result or Finding in Original Units",
        "sdtmDomain": "LB",
        "sdtmVariable": "LBORRES",
        "sdtmDatatype": "Num",
        "cdiscTerminology": "C64848",
        "dataOrigin": "COLLECTED",
        "mappingNotes": "Hemoglobin concentration"
      },
      
      "medicalCoding": {
        "required": true,
        "dictionary": {
          "type": "LOINC",
          "version": "2.76"
        },
        "autoCoding": {
          "enabled": true,
          "confidenceThreshold": 90,
          "maxMatches": 5,
          "showAllMatches": false
        },
        "verbatimField": {
          "label": "Test Name",
          "maxLength": 100,
          "required": true
        },
        "workflow": {
          "type": "SINGLE_CODER",
          "primaryCoderRole": "DATA_MANAGER",
          "adjudicationRequired": false,
          "manualReviewRequired": false
        },
        "instructions": "Map to LOINC code for hemoglobin test"
      }
    }
  ],
  
  "formMetadata": {
    "allowsSDV": true,
    "sdvRole": "CLINICAL_MONITOR",
    "regulatorySubmission": {
      "includeInSDTM": true,
      "sdtmDomain": "LB"
    }
  }
}
```

---

## Validation Rules

### 1. Field Metadata Validation

```javascript
// All boolean flags default to false if not specified
// At least one clinical flag should be true for regulatory submissions
// If fdaRequired or emaRequired is true, auditTrailLevel cannot be "NONE"
// If electronicSignatureRequired is true, auditTrailLevel must be "FULL"

function validateFieldMetadata(metadata) {
  if (metadata.regulatory?.fdaRequired || metadata.regulatory?.emaRequired) {
    if (metadata.auditTrail?.level === "NONE") {
      throw new Error("FDA/EMA required fields must have audit trail");
    }
  }
  
  if (metadata.auditTrail?.electronicSignatureRequired) {
    if (metadata.auditTrail?.level !== "FULL") {
      throw new Error("Electronic signature requires FULL audit trail");
    }
  }
  
  if (metadata.dataEntry?.isDerivedField) {
    if (!metadata.dataEntry?.derivationFormula) {
      throw new Error("Derived fields must have derivation formula");
    }
  }
}
```

### 2. CDASH Mapping Validation

```javascript
function validateCdashMapping(mapping) {
  // Domain and variable are required
  if (!mapping.domain || !mapping.variable) {
    throw new Error("CDASH domain and variable are required");
  }
  
  // SDTM domain and variable are required for regulatory submissions
  if (!mapping.sdtmDomain || !mapping.sdtmVariable) {
    throw new Error("SDTM mapping is required");
  }
  
  // dataOrigin must be one of: COLLECTED, DERIVED, ASSIGNED, etc.
  const validOrigins = ["COLLECTED", "DERIVED", "ASSIGNED", "PROTOCOL", "PREDECESSOR"];
  if (!validOrigins.includes(mapping.dataOrigin)) {
    throw new Error(`Invalid dataOrigin: ${mapping.dataOrigin}`);
  }
}
```

### 3. Medical Coding Validation

```javascript
function validateMedicalCoding(coding) {
  // Dictionary type and version are required
  if (!coding.dictionary?.type || !coding.dictionary?.version) {
    throw new Error("Medical coding dictionary and version are required");
  }
  
  // Confidence threshold must be 0-100
  if (coding.autoCoding?.confidenceThreshold < 0 || coding.autoCoding?.confidenceThreshold > 100) {
    throw new Error("Confidence threshold must be between 0 and 100");
  }
  
  // DUAL_CODER workflow requires secondaryCoderRole
  if (coding.workflow?.type === "DUAL_CODER" && !coding.workflow?.secondaryCoderRole) {
    throw new Error("DUAL_CODER workflow requires secondaryCoderRole");
  }
  
  // Adjudication requires adjudicatorRole
  if (coding.workflow?.adjudicationRequired && !coding.workflow?.adjudicatorRole) {
    throw new Error("Adjudication requires adjudicatorRole");
  }
}
```

---

## Migration Path: Existing Forms → Phase 6 Forms

### Step 1: Identify Fields Needing Metadata

```sql
-- Find all forms without Phase 6 metadata
SELECT 
    f.id,
    f.name,
    f.form_type,
    JSON_LENGTH(f.form_schema, '$.fields') as field_count,
    JSON_EXTRACT(f.form_schema, '$.fields[0].metadata') as has_metadata
FROM form_definitions f
WHERE JSON_EXTRACT(f.form_schema, '$.fields[0].metadata') IS NULL;
```

### Step 2: Add Default Metadata to Existing Forms

```javascript
// Script to add default metadata to existing forms
function addDefaultMetadata(formSchema) {
  const updatedFields = formSchema.fields.map(field => {
    if (!field.metadata) {
      field.metadata = {
        clinical: {
          sdvRequired: false,
          medicalReviewRequired: false,
          criticalDataPoint: false,
          safetyDataPoint: false,
          efficacyDataPoint: false,
          dataReviewRequired: false
        },
        regulatory: {
          fdaRequired: false,
          emaRequired: false,
          cfr21Part11: false,
          gcpRequired: false,
          hipaaProtected: false
        },
        auditTrail: {
          level: "BASIC",
          electronicSignatureRequired: false,
          reasonForChangeRequired: false
        },
        dataEntry: {
          isDerivedField: false,
          isQueryEnabled: true,
          isEditableAfterLock: false
        }
      };
    }
    return field;
  });
  
  return {
    ...formSchema,
    fields: updatedFields
  };
}
```

### Step 3: Form Designer UI Updates (Phase 6F)

Later in Phase 6F, the form designer will need:
- Metadata editor panel
- CDASH mapping selector
- Medical coding configurator
- Preview of SDTM output

---

## Database Build Worker Updates (Phase 6D)

### Updated createFieldMetadata() Method

```java
private int createFieldMetadata(Long studyId, UUID buildId, List<FormDefinitionEntity> forms) {
    log.info("Phase 6: Creating field-level metadata for {} forms", forms.size());
    
    int metadataCreated = 0;
    ObjectMapper objectMapper = new ObjectMapper();
    
    try {
        for (FormDefinitionEntity form : forms) {
            // Parse form schema JSON
            JsonNode formSchema = objectMapper.readTree(form.getFormSchema());
            JsonNode fields = formSchema.get("fields");
            
            if (fields != null && fields.isArray()) {
                for (JsonNode field : fields) {
                    String fieldName = field.get("name").asText();
                    
                    // Check if metadata exists in schema
                    if (field.has("metadata")) {
                        // Skip if already exists in database (idempotent)
                        if (!fieldMetadataRepository.existsByStudyIdAndFormIdAndFieldName(
                            studyId, form.getId(), fieldName)) {
                            
                            // Parse metadata from schema
                            StudyFieldMetadataEntity metadata = parseFieldMetadata(
                                studyId, form.getId(), field);
                            
                            fieldMetadataRepository.save(metadata);
                            metadataCreated++;
                        }
                    }
                }
            }
            
            trackBuildConfig(buildId, studyId, "FIELD_METADATA", 
                           String.format("Form %d field metadata", form.getId()));
        }
        
        log.info("Phase 6: Created {} field metadata records", metadataCreated);
        
    } catch (Exception e) {
        log.error("Failed to create field metadata: {}", e.getMessage(), e);
        throw new RuntimeException("Failed to create field metadata", e);
    }
    
    return metadataCreated;
}

private StudyFieldMetadataEntity parseFieldMetadata(Long studyId, Long formId, JsonNode field) {
    JsonNode metadata = field.get("metadata");
    JsonNode clinical = metadata.get("clinical");
    JsonNode regulatory = metadata.get("regulatory");
    JsonNode auditTrail = metadata.get("auditTrail");
    JsonNode dataEntry = metadata.get("dataEntry");
    
    return StudyFieldMetadataEntity.builder()
        .studyId(studyId)
        .formId(formId)
        .fieldName(field.get("name").asText())
        .fieldLabel(field.get("label").asText())
        .sdvRequired(clinical.has("sdvRequired") ? clinical.get("sdvRequired").asBoolean() : false)
        .medicalReviewRequired(clinical.has("medicalReviewRequired") ? clinical.get("medicalReviewRequired").asBoolean() : false)
        .criticalDataPoint(clinical.has("criticalDataPoint") ? clinical.get("criticalDataPoint").asBoolean() : false)
        .safetyDataPoint(clinical.has("safetyDataPoint") ? clinical.get("safetyDataPoint").asBoolean() : false)
        .efficacyDataPoint(clinical.has("efficacyDataPoint") ? clinical.get("efficacyDataPoint").asBoolean() : false)
        .dataReviewRequired(clinical.has("dataReviewRequired") ? clinical.get("dataReviewRequired").asBoolean() : false)
        .fdaRequired(regulatory.has("fdaRequired") ? regulatory.get("fdaRequired").asBoolean() : false)
        .emaRequired(regulatory.has("emaRequired") ? regulatory.get("emaRequired").asBoolean() : false)
        .cfr21Part11(regulatory.has("cfr21Part11") ? regulatory.get("cfr21Part11").asBoolean() : false)
        .gcpRequired(regulatory.has("gcpRequired") ? regulatory.get("gcpRequired").asBoolean() : false)
        .hipaaProtected(regulatory.has("hipaaProtected") ? regulatory.get("hipaaProtected").asBoolean() : false)
        .auditTrailLevel(parseAuditTrailLevel(auditTrail.get("level").asText()))
        .electronicSignatureRequired(auditTrail.has("electronicSignatureRequired") ? auditTrail.get("electronicSignatureRequired").asBoolean() : false)
        .reasonForChangeRequired(auditTrail.has("reasonForChangeRequired") ? auditTrail.get("reasonForChangeRequired").asBoolean() : false)
        .isDerivedField(dataEntry.has("isDerivedField") ? dataEntry.get("isDerivedField").asBoolean() : false)
        .derivationFormula(dataEntry.has("derivationFormula") ? dataEntry.get("derivationFormula").asText(null) : null)
        .isQueryEnabled(dataEntry.has("isQueryEnabled") ? dataEntry.get("isQueryEnabled").asBoolean() : true)
        .isEditableAfterLock(dataEntry.has("isEditableAfterLock") ? dataEntry.get("isEditableAfterLock").asBoolean() : false)
        .validationRules(field.has("validationPattern") ? 
            String.format("{\"pattern\": \"%s\"}", field.get("validationPattern").asText()) : null)
        .build();
}
```

---

## Next Steps

### Phase 6C Remaining Tasks:
1. ✅ Define JSON schema structure - COMPLETE
2. ⏭️ Create sample forms with full metadata
3. ⏭️ Update worker service to parse JSON (not hardcoded)
4. ⏭️ Add validation logic for schema

### Phase 6D: REST API Endpoints (Next)
1. GET `/api/studies/{studyId}/forms/{formId}/metadata` - Get all field metadata
2. GET `/api/studies/{studyId}/fields/sdv-required` - Get SDV required fields
3. GET `/api/studies/{studyId}/cdash/mappings` - Get CDASH mappings
4. GET `/api/studies/{studyId}/coding/config` - Get medical coding config

---

**Generated**: October 11, 2025  
**Status**: Design Complete - Ready for Implementation  
**Next Phase**: Phase 6D - REST API Endpoints
