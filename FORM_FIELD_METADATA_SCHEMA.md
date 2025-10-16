# Form Field Metadata Schema

**Created**: October 15, 2025  
**Purpose**: Comprehensive metadata schema for form field definitions supporting validation, clinical standards, regulatory compliance, and data quality.

---

## Executive Summary

This document defines the **complete JSON metadata structure** for form field definitions in the ClinPrecision system. This schema is stored in the `form_definitions.fields` column (JSON) and must be parseable by both frontend (validation/UI) and backend (compliance/audit/export).

---

## Current State Analysis

### Frontend Metadata (DataEntryService.js)
Currently implements **basic validation metadata**:
```json
{
  "metadata": {
    "required": true,
    "maxLength": 100,
    "minValue": 35,
    "maxValue": 42,
    "units": "°C",
    "options": [
      { "value": "M", "label": "Male" },
      { "value": "F", "label": "Female" }
    ],
    "placeholder": "Enter value",
    "description": "Field description",
    "checkboxLabel": "Checkbox label"
  }
}
```

**Limitations**:
- No CDASH/SDTM mapping
- No clinical flags
- No medical coding configuration
- No regulatory metadata
- No data quality rules
- No export configuration
- No conditional validation

### Backend Metadata (FieldMetadataDTO.java)
Defines **clinical and regulatory flags**:
- Clinical flags: SDV required, medical review, critical/safety/efficacy data points
- Regulatory flags: FDA, EMA, CFR 21 Part 11, GCP, HIPAA
- Audit trail: signature requirements, reason for change
- Data entry: derived fields, query enablement, edit after lock

**Issue**: This DTO is not integrated with form definitions. It exists as a separate entity/table structure that was commented out.

---

## Comprehensive Metadata Schema

### Complete JSON Structure

```json
{
  "id": "fieldId",
  "type": "text|number|date|datetime|time|radio|checkbox|dropdown|textarea",
  "label": "Field Label",
  "metadata": {
    
    // ===== VALIDATION RULES =====
    "validation": {
      "required": true,
      "type": "string|integer|decimal|date|datetime|time|email|phone|url",
      "minLength": 1,
      "maxLength": 100,
      "minValue": 0,
      "maxValue": 200,
      "pattern": "^[A-Z]{2,3}$",
      "patternDescription": "2-3 uppercase letters",
      "customRules": [
        {
          "ruleId": "RULE001",
          "ruleType": "range|consistency|format|business",
          "expression": "field.value >= 0 && field.value <= 120",
          "errorMessage": "Value must be between 0 and 120",
          "severity": "error|warning|info"
        }
      ],
      "conditionalValidation": [
        {
          "condition": "otherField.value === 'YES'",
          "rules": {
            "required": true,
            "minLength": 10
          }
        }
      ]
    },
    
    // ===== UI CONFIGURATION =====
    "ui": {
      "placeholder": "Enter value",
      "helpText": "Additional guidance for data entry",
      "units": "kg|°C|mmHg|mg/dL",
      "unitsPosition": "suffix|prefix",
      "options": [
        {
          "value": "M",
          "label": "Male",
          "description": "Male gender"
        }
      ],
      "checkboxLabel": "Label for checkbox",
      "defaultValue": "DEFAULT",
      "readOnly": false,
      "hidden": false,
      "conditionalDisplay": {
        "field": "otherFieldId",
        "operator": "equals|notEquals|greaterThan|contains",
        "value": "YES"
      }
    },
    
    // ===== CDASH MAPPING =====
    "cdash": {
      "domain": "DM|AE|VS|LB|EG|MH|CM|EX",
      "variable": "BRTHDAT|AGE|SEX|RACE",
      "dataType": "Char|Num|Date|Time",
      "role": "Identifier|Topic|Timing|Qualifier",
      "coreStatus": "Required|Expected|Permissible",
      "implementationNotes": "CDASH v2.1 standard variable",
      "controlledTerminology": "C123456"
    },
    
    // ===== SDTM MAPPING =====
    "sdtm": {
      "domain": "DM|AE|VS|LB|EG|MH|CM|EX",
      "variable": "BRTHDTC|AGE|SEX|RACE",
      "dataType": "Char|Num|ISO8601",
      "role": "Identifier|Topic|Timing|Grouping|Qualifier",
      "coreStatus": "Req|Exp|Perm",
      "transformation": "Direct|Derived|Concatenated|Split",
      "transformationRule": "FORMAT(value, 'YYYY-MM-DD')",
      "controlledTerminology": "C123456",
      "codelist": "SEX|RACE|COUNTRY|ETHNIC"
    },
    
    // ===== CLINICAL FLAGS =====
    "clinical": {
      "sdvRequired": true,
      "medicalReviewRequired": true,
      "criticalDataPoint": true,
      "safetyDataPoint": false,
      "efficacyDataPoint": false,
      "dataReviewRequired": true,
      "medicallySignificant": false,
      "requiresMonitoring": true,
      "requiresSourceDocumentation": true,
      "allowableDeviationRange": {
        "lowerBound": -5,
        "upperBound": 5,
        "units": "%"
      }
    },
    
    // ===== MEDICAL CODING =====
    "coding": {
      "dictionary": "MedDRA|WHODrug|ICD-10|ICD-11|SNOMED-CT",
      "version": "26.0",
      "level": "PT|LLT|HLT|HLGT|SOC",
      "autoCode": true,
      "codeRequired": true,
      "allowMultipleCodes": false,
      "codingQuery": {
        "autoGenerateQuery": true,
        "queryThreshold": "low|medium|high"
      }
    },
    
    // ===== DATA QUALITY RULES =====
    "dataQuality": {
      "rangeChecks": [
        {
          "checkId": "RC001",
          "type": "normal|expected|possible",
          "min": 36.0,
          "max": 37.5,
          "action": "warning|error|query",
          "message": "Temperature outside normal range"
        }
      ],
      "consistencyRules": [
        {
          "ruleId": "CONS001",
          "type": "temporal|logical|anatomical",
          "relatedFields": ["startDate", "endDate"],
          "expression": "startDate <= endDate",
          "message": "Start date must be before or equal to end date"
        }
      ],
      "crossFieldValidation": [
        {
          "ruleId": "CROSS001",
          "relatedFields": ["systolicBP", "diastolicBP"],
          "expression": "systolicBP > diastolicBP",
          "message": "Systolic BP must be greater than diastolic BP",
          "severity": "error"
        }
      ],
      "duplicateCheck": {
        "enabled": true,
        "scope": "visit|subject|study",
        "fields": ["fieldId1", "fieldId2"]
      }
    },
    
    // ===== REGULATORY METADATA =====
    "regulatory": {
      "fdaRequired": true,
      "emaRequired": true,
      "cfr21Part11": true,
      "gcpRequired": true,
      "hipaaProtected": false,
      "phiCategory": "identifier|demographic|dates|contact|financial|health",
      "deidentificationRequired": false,
      "retentionYears": 25,
      "archivingRequired": true
    },
    
    // ===== AUDIT TRAIL CONFIGURATION =====
    "audit": {
      "level": "NONE|BASIC|FULL",
      "electronicSignatureRequired": false,
      "reasonForChangeRequired": true,
      "reasonForChangeOptions": [
        "Data entry error",
        "Source document update",
        "Protocol deviation",
        "Other"
      ],
      "trackVersionHistory": true,
      "changeNotification": {
        "enabled": true,
        "recipients": ["medicalMonitor", "dataManager"]
      }
    },
    
    // ===== DATA ENTRY CONFIGURATION =====
    "dataEntry": {
      "isDerivedField": false,
      "derivationFormula": "BMI = weight / (height * height)",
      "derivationDependencies": ["weight", "height"],
      "isQueryEnabled": true,
      "isEditableAfterLock": false,
      "isEditableAfterFreeze": false,
      "requiresDoubleDataEntry": false,
      "requiresSourceDataVerification": true,
      "allowNA": true,
      "allowNotDone": true,
      "allowNotAsked": true,
      "allowUnknown": true
    },
    
    // ===== EXPORT CONFIGURATION =====
    "export": {
      "includeInExport": true,
      "exportFormat": "original|formatted|coded|transformed",
      "exportVariable": "BRTHDTC",
      "exportTransformation": "ISO8601_DATE",
      "includeInDataset": ["SDTM", "ADaM", "TFLs"],
      "exportMapping": {
        "SDTM": {
          "domain": "DM",
          "variable": "BRTHDTC"
        },
        "ADaM": {
          "dataset": "ADSL",
          "variable": "BRTHDT"
        }
      }
    },
    
    // ===== QUERY CONFIGURATION =====
    "query": {
      "autoQueryEnabled": true,
      "autoQueryRules": [
        {
          "ruleId": "Q001",
          "condition": "value < 35 || value > 42",
          "queryText": "Temperature value appears out of normal range. Please verify.",
          "priority": "high|medium|low"
        }
      ],
      "manualQueryEnabled": true,
      "queryWorkflow": {
        "requiresResponse": true,
        "allowClarification": true,
        "requiresClosureApproval": true
      }
    },
    
    // ===== ADDITIONAL METADATA =====
    "description": "Detailed field description",
    "implementationNotes": "Special instructions for data entry",
    "dataSource": "CRF|eCOA|ePRO|Lab|Device|EHR",
    "captureMethod": "manual|automated|imported|derived",
    "version": "1.0",
    "effectiveDate": "2025-01-01",
    "expirationDate": null,
    "changeLog": [
      {
        "version": "1.0",
        "date": "2025-01-01",
        "author": "Study Designer",
        "changes": "Initial definition"
      }
    ]
  }
}
```

---

## Field Type-Specific Metadata

### Text Fields
```json
{
  "type": "text",
  "metadata": {
    "validation": {
      "minLength": 1,
      "maxLength": 100,
      "pattern": "^[A-Za-z\\s]+$",
      "patternDescription": "Letters and spaces only"
    },
    "ui": {
      "placeholder": "Enter text",
      "autocomplete": true,
      "autocompleteSource": "previousValues|controlledTerminology"
    }
  }
}
```

### Number Fields
```json
{
  "type": "number",
  "metadata": {
    "validation": {
      "type": "integer|decimal",
      "minValue": 0,
      "maxValue": 200,
      "decimalPlaces": 2,
      "allowNegative": false
    },
    "ui": {
      "units": "kg",
      "unitsPosition": "suffix",
      "stepSize": 0.1
    },
    "dataQuality": {
      "rangeChecks": [
        {
          "type": "normal",
          "min": 50,
          "max": 100,
          "action": "warning"
        }
      ]
    }
  }
}
```

### Date/DateTime Fields
```json
{
  "type": "date",
  "metadata": {
    "validation": {
      "minDate": "1900-01-01",
      "maxDate": "today",
      "allowPartialDates": false,
      "allowFutureDates": false
    },
    "ui": {
      "format": "YYYY-MM-DD|DD/MM/YYYY|MM/DD/YYYY",
      "datePickerEnabled": true,
      "defaultToToday": false
    },
    "sdtm": {
      "dataType": "ISO8601",
      "transformation": "FORMAT(value, 'YYYY-MM-DD')"
    }
  }
}
```

### Radio/Dropdown Fields
```json
{
  "type": "radio",
  "metadata": {
    "validation": {
      "required": true
    },
    "ui": {
      "options": [
        {
          "value": "M",
          "label": "Male",
          "description": "Male gender",
          "order": 1,
          "codingValue": "M",
          "codingSystem": "HL7 Gender"
        },
        {
          "value": "F",
          "label": "Female",
          "description": "Female gender",
          "order": 2,
          "codingValue": "F",
          "codingSystem": "HL7 Gender"
        }
      ],
      "allowOther": true,
      "otherSpecifyRequired": true
    },
    "cdash": {
      "controlledTerminology": "C123456"
    }
  }
}
```

### Checkbox Fields
```json
{
  "type": "checkbox",
  "metadata": {
    "ui": {
      "checkboxLabel": "Patient has allergies",
      "trueValue": "YES",
      "falseValue": "NO"
    },
    "validation": {
      "conditionalValidation": [
        {
          "condition": "value === true",
          "rules": {
            "requiresFollowup": ["allergies"]
          }
        }
      ]
    }
  }
}
```

---

## Backend Implementation Requirements

### 1. Create Java Classes for Metadata Structure

**Location**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/metadata/`

**Required Classes**:
```
FieldMetadata.java           // Main metadata container
ValidationConfig.java         // Validation rules
UIConfig.java                // UI configuration
CdashMapping.java            // CDASH mapping
SdtmMapping.java             // SDTM mapping
ClinicalFlags.java           // Clinical flags (enhance existing FieldMetadataDTO)
MedicalCoding.java           // Medical coding config
DataQualityRules.java        // Data quality rules
RegulatoryMetadata.java      // Regulatory flags (enhance existing)
AuditConfig.java             // Audit trail config (enhance existing)
DataEntryConfig.java         // Data entry config (enhance existing)
ExportConfig.java            // Export configuration
QueryConfig.java             // Query management
```

### 2. Metadata Parser Service

Create `FormMetadataParserService.java`:
```java
@Service
public class FormMetadataParserService {
    
    /**
     * Parse field metadata from JSON string
     */
    public FieldMetadata parseFieldMetadata(String metadataJson) {
        // Parse JSON to FieldMetadata object
        // Validate structure
        // Return typed metadata
    }
    
    /**
     * Validate metadata completeness
     */
    public ValidationResult validateMetadata(FieldMetadata metadata) {
        // Check required fields based on field type
        // Validate CDASH/SDTM mappings
        // Validate regulatory requirements
        // Return validation result
    }
    
    /**
     * Get validation rules for a field
     */
    public List<ValidationRule> getValidationRules(FieldMetadata metadata) {
        // Extract all validation rules
        // Include range checks
        // Include consistency rules
        // Include cross-field validations
    }
}
```

### 3. Validation Engine Service

Create `FormValidationEngineService.java`:
```java
@Service
public class FormValidationEngineService {
    
    /**
     * Validate field value against metadata rules
     */
    public ValidationResult validateField(
        String fieldId, 
        Object value, 
        FieldMetadata metadata,
        Map<String, Object> allFieldValues
    ) {
        // Execute required validation
        // Execute type validation
        // Execute min/max validation
        // Execute pattern validation
        // Execute custom rules
        // Execute conditional validation
        // Execute cross-field validation
        // Return comprehensive validation result
    }
    
    /**
     * Validate entire form
     */
    public FormValidationResult validateForm(
        Map<String, Object> formData,
        List<FieldMetadata> allFieldMetadata
    ) {
        // Validate all fields
        // Execute form-level rules
        // Return comprehensive form validation
    }
}
```

---

## Frontend Implementation Requirements

### 1. Enhance ValidationEngine.js

**Location**: `frontend/clinprecision/src/services/ValidationEngine.js`

```javascript
class ValidationEngine {
  
  /**
   * Validate field value against metadata
   */
  validateField(fieldId, value, metadata, allFormData) {
    const errors = [];
    const warnings = [];
    
    // Required validation
    if (metadata.validation?.required && !this.hasValue(value)) {
      errors.push({ field: fieldId, message: `${metadata.label} is required`, type: 'required' });
    }
    
    // Type validation
    if (metadata.validation?.type) {
      const typeError = this.validateType(value, metadata.validation.type);
      if (typeError) errors.push({ field: fieldId, ...typeError });
    }
    
    // Min/Max validation
    if (metadata.validation?.minValue !== undefined || metadata.validation?.maxValue !== undefined) {
      const rangeError = this.validateRange(value, metadata.validation);
      if (rangeError) errors.push({ field: fieldId, ...rangeError });
    }
    
    // Pattern validation
    if (metadata.validation?.pattern) {
      const patternError = this.validatePattern(value, metadata.validation);
      if (patternError) errors.push({ field: fieldId, ...patternError });
    }
    
    // Custom rules
    if (metadata.validation?.customRules) {
      const customErrors = this.validateCustomRules(value, metadata.validation.customRules, allFormData);
      errors.push(...customErrors.filter(e => e.severity === 'error'));
      warnings.push(...customErrors.filter(e => e.severity === 'warning'));
    }
    
    // Conditional validation
    if (metadata.validation?.conditionalValidation) {
      const conditionalErrors = this.validateConditional(value, metadata.validation.conditionalValidation, allFormData);
      errors.push(...conditionalErrors);
    }
    
    // Data quality range checks
    if (metadata.dataQuality?.rangeChecks) {
      const rangeWarnings = this.checkRanges(value, metadata.dataQuality.rangeChecks);
      warnings.push(...rangeWarnings.filter(w => w.action === 'warning'));
      errors.push(...rangeWarnings.filter(w => w.action === 'error'));
    }
    
    // Cross-field validation
    if (metadata.dataQuality?.crossFieldValidation) {
      const crossFieldErrors = this.validateCrossField(fieldId, value, metadata.dataQuality.crossFieldValidation, allFormData);
      errors.push(...crossFieldErrors);
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  /**
   * Validate entire form
   */
  validateForm(formData, formDefinition) {
    const allErrors = [];
    const allWarnings = [];
    
    formDefinition.fields.forEach(field => {
      const result = this.validateField(field.id, formData[field.id], field.metadata, formData);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });
    
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  // Helper methods...
  hasValue(value) {
    return value !== null && value !== undefined && value !== '';
  }
  
  validateType(value, expectedType) {
    // Implement type validation
  }
  
  validateRange(value, validation) {
    // Implement range validation
  }
  
  validatePattern(value, validation) {
    // Implement pattern validation
  }
  
  validateCustomRules(value, rules, allFormData) {
    // Implement custom rule execution
  }
  
  validateConditional(value, conditionalRules, allFormData) {
    // Implement conditional validation
  }
  
  checkRanges(value, rangeChecks) {
    // Implement data quality range checks
  }
  
  validateCrossField(fieldId, value, crossFieldRules, allFormData) {
    // Implement cross-field validation
  }
}

export default new ValidationEngine();
```

### 2. Update FormEntry.jsx to Use ValidationEngine

```javascript
import ValidationEngine from '../../../../services/ValidationEngine';

// In FormEntry.jsx
const validateField = (fieldId, value) => {
  const field = formDefinition.fields.find(f => f.id === fieldId);
  if (!field) return;
  
  const result = ValidationEngine.validateField(fieldId, value, field.metadata, formData);
  
  setFieldErrors(prev => ({
    ...prev,
    [fieldId]: result.errors
  }));
  
  setFieldWarnings(prev => ({
    ...prev,
    [fieldId]: result.warnings
  }));
};

const validateForm = () => {
  const result = ValidationEngine.validateForm(formData, formDefinition);
  
  setFormErrors(result.errors);
  setFormWarnings(result.warnings);
  
  return result.valid;
};
```

---

## Migration Strategy

### Phase 1: Enhance Existing Metadata (Current)
1. ✅ Document current metadata structure
2. ✅ Identify gaps
3. 🟡 Create comprehensive schema (this document)

### Phase 2: Backend Infrastructure (Next 2-3 hours)
1. Create Java metadata classes
2. Create parser service
3. Create validation engine service
4. Add API endpoints for validation

### Phase 3: Frontend Implementation (Next 2-3 hours)
1. Create ValidationEngine.js service
2. Update FormEntry.jsx to use validation engine
3. Display inline errors and warnings
4. Add validation summary panel

### Phase 4: Data Migration (Next 1-2 hours)
1. Script to enhance existing form definitions
2. Add comprehensive metadata to existing fields
3. Validate all form definitions

### Phase 5: Testing (Next 1-2 hours)
1. Unit tests for validation rules
2. Integration tests for form validation
3. E2E tests for data entry with validation

---

## Example: Complete Field Definition

**Temperature Field with Full Metadata**:
```json
{
  "id": "temperature",
  "type": "number",
  "label": "Body Temperature",
  "metadata": {
    "validation": {
      "required": true,
      "type": "decimal",
      "minValue": 35.0,
      "maxValue": 42.0,
      "decimalPlaces": 1
    },
    "ui": {
      "placeholder": "36.5",
      "helpText": "Measure in degrees Celsius using calibrated thermometer",
      "units": "°C",
      "unitsPosition": "suffix"
    },
    "cdash": {
      "domain": "VS",
      "variable": "VSTEMP",
      "dataType": "Num",
      "role": "Topic",
      "coreStatus": "Expected"
    },
    "sdtm": {
      "domain": "VS",
      "variable": "VSSTRESN",
      "dataType": "Num",
      "transformation": "Direct"
    },
    "clinical": {
      "sdvRequired": true,
      "medicalReviewRequired": false,
      "criticalDataPoint": false,
      "safetyDataPoint": true,
      "requiresSourceDocumentation": true
    },
    "dataQuality": {
      "rangeChecks": [
        {
          "checkId": "TEMP_NORMAL",
          "type": "normal",
          "min": 36.0,
          "max": 37.5,
          "action": "warning",
          "message": "Temperature outside normal range"
        },
        {
          "checkId": "TEMP_CRITICAL",
          "type": "critical",
          "min": 35.0,
          "max": 42.0,
          "action": "error",
          "message": "Temperature critically abnormal - verify reading"
        }
      ]
    },
    "regulatory": {
      "gcpRequired": true,
      "cfr21Part11": true,
      "retentionYears": 25
    },
    "audit": {
      "level": "FULL",
      "reasonForChangeRequired": true
    },
    "export": {
      "includeInExport": true,
      "exportFormat": "original",
      "includeInDataset": ["SDTM"]
    },
    "description": "Patient's body temperature in degrees Celsius",
    "dataSource": "CRF",
    "captureMethod": "manual"
  }
}
```

---

## Validation Rule Examples

### 1. Required Field
```json
{
  "validation": {
    "required": true
  }
}
```
**Error**: "This field is required"

### 2. Min/Max Range
```json
{
  "validation": {
    "minValue": 18,
    "maxValue": 100
  }
}
```
**Error**: "Age must be between 18 and 100"

### 3. Pattern Match
```json
{
  "validation": {
    "pattern": "^\\d{3}-\\d{2}-\\d{4}$",
    "patternDescription": "SSN format: 123-45-6789"
  }
}
```
**Error**: "Invalid format. Expected format: 123-45-6789"

### 4. Conditional Validation
```json
{
  "validation": {
    "conditionalValidation": [
      {
        "condition": "adverseEvent === 'YES'",
        "rules": {
          "required": true,
          "minLength": 10
        }
      }
    ]
  }
}
```
**Error**: "Description required when adverse event is reported"

### 5. Cross-Field Validation
```json
{
  "dataQuality": {
    "crossFieldValidation": [
      {
        "ruleId": "DATE_SEQUENCE",
        "relatedFields": ["startDate", "endDate"],
        "expression": "startDate <= endDate",
        "message": "Start date must be before or equal to end date",
        "severity": "error"
      }
    ]
  }
}
```
**Error**: "Start date must be before or equal to end date"

### 6. Custom Business Rule
```json
{
  "validation": {
    "customRules": [
      {
        "ruleId": "BMI_RANGE",
        "expression": "weight / (height * height) >= 18.5 && weight / (height * height) <= 40",
        "errorMessage": "Calculated BMI outside acceptable range (18.5-40)",
        "severity": "warning"
      }
    ]
  }
}
```
**Warning**: "Calculated BMI outside acceptable range (18.5-40)"

---

## Next Steps

### Immediate (Next 1 hour)
1. ✅ Review this schema with user
2. Create Java metadata classes
3. Create parser service skeleton

### Short-term (Next 2-3 hours)
1. Implement validation engine (backend)
2. Create ValidationEngine.js (frontend)
3. Update FormEntry.jsx with validation
4. Test basic validation rules

### Medium-term (Next 4-6 hours)
1. Implement CDASH/SDTM validation
2. Implement clinical flags checking
3. Implement data quality rules
4. Add query auto-generation
5. Add comprehensive error display

### Long-term (Next 8-10 hours)
1. Migrate existing form definitions
2. Add all metadata to existing fields
3. Create metadata management UI
4. Create rule designer UI
5. Complete testing

---

## Questions for User

1. **Priority**: Should we focus on validation rules first, then add CDASH/SDTM later?
2. **Scope**: Do you want all metadata categories implemented now, or phase them in?
3. **Medical Coding**: Do you need MedDRA/WHODrug integration immediately?
4. **Data Quality**: Should range checks generate queries automatically?
5. **Regulatory**: Do you need CFR 21 Part 11 signature enforcement now?

---

## Appendix: JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Field Metadata Schema",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "type": { 
      "type": "string",
      "enum": ["text", "number", "date", "datetime", "time", "radio", "checkbox", "dropdown", "textarea"]
    },
    "label": { "type": "string" },
    "metadata": {
      "type": "object",
      "properties": {
        "validation": { "$ref": "#/definitions/validation" },
        "ui": { "$ref": "#/definitions/ui" },
        "cdash": { "$ref": "#/definitions/cdash" },
        "sdtm": { "$ref": "#/definitions/sdtm" },
        "clinical": { "$ref": "#/definitions/clinical" },
        "coding": { "$ref": "#/definitions/coding" },
        "dataQuality": { "$ref": "#/definitions/dataQuality" },
        "regulatory": { "$ref": "#/definitions/regulatory" },
        "audit": { "$ref": "#/definitions/audit" },
        "dataEntry": { "$ref": "#/definitions/dataEntry" },
        "export": { "$ref": "#/definitions/export" },
        "query": { "$ref": "#/definitions/query" },
        "description": { "type": "string" }
      }
    }
  },
  "required": ["id", "type", "label", "metadata"]
}
```

---

**End of Document**

