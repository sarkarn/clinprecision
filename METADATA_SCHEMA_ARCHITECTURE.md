# Metadata Schema Architecture - Current State & Recommendations

**Created**: October 15, 2025  
**Purpose**: Document where and how field metadata schema is defined, stored, and rendered in the ClinPrecision system.

---

## Executive Summary

Your system **already has a comprehensive metadata structure** implemented in the Form Builder UI! When users click the ⚙️ gear button in the Form Designer, they see **7 metadata tabs** for configuring field-level clinical metadata:

1. 📝 **Basic** - Description, help text, placeholder, default value, field width, read-only, calculated fields
2. 🏥 **Clinical Flags** - SDV required, medical review, data review flags
3. 📊 **CDASH/SDTM** - Domain, variable, core status, data type, origin, codelist mappings
4. 🏷️ **Medical Coding** - MedDRA, WHODrug, auto-coding configuration
5. ✅ **Data Quality** - Critical data points, key variables, query generation, range checks
6. 📋 **Regulatory** - FDA/EMA requirements, 21 CFR Part 11, audit trail, submission datasets
7. 📤 **Export** - JSON/Excel/CSV export, metadata summary

**The Issue**: The schema is **implicitly defined in the UI component** but not formally documented or typed in backend/frontend contracts.

---

## Current Architecture

### 1. Storage Location
**Where**: MySQL `form_definitions` table, `fields` column (JSON)

```sql
form_definitions
├── id (BIGINT)
├── study_id (BIGINT)
├── name (VARCHAR)
├── description (TEXT)
├── fields (JSON) ← **Metadata stored here**
├── structure (JSON)
├── version (VARCHAR)
├── status (ENUM)
└── ...
```

### 2. Current JSON Structure (As Implemented in UI)

```json
{
  "id": "fieldId",
  "name": "Field Label",
  "type": "text|number|date|select|radio|checkbox|textarea",
  "required": true,
  "metadata": {
    // ===== BASIC (Tab 1) =====
    "description": "Field description for documentation",
    "helpText": "Help text shown to users",
    "placeholder": "Placeholder text",
    "defaultValue": "Default value",
    "fieldWidth": "full|half|third|quarter",
    "isReadOnly": false,
    "isCalculated": false,
    "calculationFormula": "field1 + field2 * 0.1",
    "options": ["Option 1", "Option 2"],  // For select/radio/checkbox
    
    // ===== CLINICAL METADATA (Nested Object) =====
    "clinicalMetadata": {
      
      // Clinical Flags (Tab 2)
      "sdvFlag": true,
      "medicalReviewFlag": true,
      "dataReviewFlag": true,
      
      // CDASH Mapping (Tab 3)
      "cdashMapping": {
        "domain": "DM|AE|CM|VS|LB|EG|PE|MH|SU|QS",
        "variable": "AETERM, VSTEST, etc.",
        "core": "Required|Expected|Permissible",
        "dataType": "text|integer|float|date|datetime|time"
      },
      
      // SDTM Mapping (Tab 3)
      "sdtmMapping": {
        "domain": "DM|AE|VS|LB|EG|...",
        "variable": "AETERM, VSTEST, etc.",
        "origin": "CRF|Derived|Assigned|Protocol|Predecessor",
        "codelist": "Controlled terminology",
        "comment": "Regulatory and compliance notes"
      },
      
      // Medical Coding (Tab 4)
      "medicalCoding": {
        "meddraRequired": true,
        "whodrugRequired": false,
        "autoCodeFlag": true,
        "meddraLevel": "LLT|PT|HLT|HLGT|SOC",
        "customDictionary": "Custom dictionary name"
      },
      
      // Data Quality (Tab 5)
      "dataQuality": {
        "criticalDataPoint": true,
        "keyDataPoint": false,
        "primaryEndpoint": false,
        "safetyVariable": true,
        "queryGeneration": "Auto|Manual|None",
        "rangeCheckType": "Hard|Soft|None"
      },
      
      // Regulatory Metadata (Tab 6)
      "regulatoryMetadata": {
        "fdaRequired": true,
        "emaRequired": true,
        "part11": true,
        "auditTrail": true,
        "submissionDataset": "Dataset name for submission"
      }
    }
  }
}
```

### 3. UI Rendering Location
**File**: `frontend/clinprecision/src/components/common/forms/CRFBuilderIntegration.jsx`

**Lines**: 1726-2600+ (metadata tabs implementation)

**Component Structure**:
```jsx
{/* Gear button to toggle metadata panel */}
<button onClick={() => toggleFieldMetadata(field.id)}>
  <Settings className="w-4 h-4" />
</button>

{/* Metadata panel with tabs */}
{showFieldMetadata[field.id] && (
  <div className="border-t border-gray-200 pt-4 mt-4">
    {/* Tab navigation: Basic, Clinical, CDASH/SDTM, Coding, Quality, Regulatory, Export */}
    
    {/* Tab content - each tab renders form inputs for that metadata category */}
    {activeMetadataTab[field.id] === 'basic' && (
      // Basic metadata form fields
    )}
    
    {activeMetadataTab[field.id] === 'clinical' && (
      // Clinical flags checkboxes
    )}
    
    {activeMetadataTab[field.id] === 'standards' && (
      // CDASH/SDTM mapping form fields
    )}
    
    {/* ... and so on for all 7 tabs */}
  </div>
)}
```

### 4. Current Update Mechanism
**Function**: `updateField(sectionIndex, fieldIndex, updates)`

```jsx
// Example: Updating CDASH domain
onChange={(e) => updateField(sectionIndex, fieldIndex, {
  metadata: {
    ...field.metadata,
    clinicalMetadata: {
      ...field.metadata?.clinicalMetadata,
      cdashMapping: {
        ...field.metadata?.clinicalMetadata?.cdashMapping,
        domain: e.target.value
      }
    }
  }
})}
```

This updates the in-memory form definition, which is later saved to the database as JSON.

---

## Problem: Schema is Not Formally Defined

### Issues with Current Approach

1. **No TypeScript/Interface Definition**
   - Frontend has no typed interface for metadata
   - Easy to make typos or inconsistent property names
   - No IDE autocomplete/validation

2. **No Backend Schema Validation**
   - Backend receives JSON string, stores as-is
   - No validation of structure or required fields
   - No parsing logic for metadata categories

3. **No JSON Schema Document**
   - No formal schema definition (JSON Schema, OpenAPI, etc.)
   - Difficult for other developers to understand structure
   - No version control for schema changes

4. **Implicit Schema in UI Code**
   - Schema is defined by what the UI renders
   - Have to read 900+ lines of JSX to understand structure
   - Difficult to maintain consistency

5. **No Backend-Frontend Contract**
   - Frontend saves metadata structure it wants
   - Backend blindly stores whatever JSON it receives
   - No guarantee of consistency across forms

---

## Recommended Solution: Multi-Layer Schema Definition

### Layer 1: JSON Schema Definition (Source of Truth)
**Location**: `frontend/clinprecision/src/schemas/FormFieldMetadata.schema.json`

**Purpose**: Formal, versioned schema definition using JSON Schema standard

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://clinprecision.com/schemas/form-field-metadata-v1.0.json",
  "title": "Form Field Metadata Schema",
  "description": "Comprehensive metadata schema for clinical trial form fields",
  "version": "1.0.0",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique field identifier"
    },
    "name": {
      "type": "string",
      "description": "Display name for field"
    },
    "type": {
      "type": "string",
      "enum": ["text", "number", "date", "datetime", "time", "select", "multiselect", "radio", "checkbox", "textarea"],
      "description": "Field input type"
    },
    "required": {
      "type": "boolean",
      "default": false
    },
    "metadata": {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "helpText": { "type": "string" },
        "placeholder": { "type": "string" },
        "defaultValue": { "type": ["string", "number", "boolean"] },
        "fieldWidth": {
          "type": "string",
          "enum": ["full", "half", "third", "quarter"]
        },
        "isReadOnly": { "type": "boolean" },
        "isCalculated": { "type": "boolean" },
        "calculationFormula": { "type": "string" },
        "options": {
          "type": "array",
          "items": { "type": "string" }
        },
        "clinicalMetadata": {
          "type": "object",
          "properties": {
            "sdvFlag": { "type": "boolean" },
            "medicalReviewFlag": { "type": "boolean" },
            "dataReviewFlag": { "type": "boolean" },
            "cdashMapping": {
              "type": "object",
              "properties": {
                "domain": {
                  "type": "string",
                  "enum": ["DM", "AE", "CM", "VS", "LB", "EG", "PE", "MH", "SU", "QS"]
                },
                "variable": { "type": "string" },
                "core": {
                  "type": "string",
                  "enum": ["Required", "Expected", "Permissible"]
                },
                "dataType": {
                  "type": "string",
                  "enum": ["text", "integer", "float", "date", "datetime", "time"]
                }
              }
            },
            "sdtmMapping": {
              "type": "object",
              "properties": {
                "domain": { "type": "string" },
                "variable": { "type": "string" },
                "origin": {
                  "type": "string",
                  "enum": ["CRF", "Derived", "Assigned", "Protocol", "Predecessor"]
                },
                "codelist": { "type": "string" },
                "comment": { "type": "string" }
              }
            },
            "medicalCoding": {
              "type": "object",
              "properties": {
                "meddraRequired": { "type": "boolean" },
                "whodrugRequired": { "type": "boolean" },
                "autoCodeFlag": { "type": "boolean" },
                "meddraLevel": {
                  "type": "string",
                  "enum": ["LLT", "PT", "HLT", "HLGT", "SOC"]
                },
                "customDictionary": { "type": "string" }
              }
            },
            "dataQuality": {
              "type": "object",
              "properties": {
                "criticalDataPoint": { "type": "boolean" },
                "keyDataPoint": { "type": "boolean" },
                "primaryEndpoint": { "type": "boolean" },
                "safetyVariable": { "type": "boolean" },
                "queryGeneration": {
                  "type": "string",
                  "enum": ["Auto", "Manual", "None"]
                },
                "rangeCheckType": {
                  "type": "string",
                  "enum": ["Hard", "Soft", "None"]
                }
              }
            },
            "regulatoryMetadata": {
              "type": "object",
              "properties": {
                "fdaRequired": { "type": "boolean" },
                "emaRequired": { "type": "boolean" },
                "part11": { "type": "boolean" },
                "auditTrail": { "type": "boolean" },
                "submissionDataset": { "type": "string" }
              }
            }
          }
        }
      }
    }
  },
  "required": ["id", "type"]
}
```

**Benefits**:
- Single source of truth
- Versionable (v1.0, v1.1, v2.0)
- Validated with standard tools (ajv, json-schema-validator)
- Can generate TypeScript interfaces from it
- Can generate Java classes from it
- Can generate API documentation from it

---

### Layer 2: TypeScript Interface (Frontend Type Safety)
**Location**: `frontend/clinprecision/src/types/FormFieldMetadata.ts`

**Generated From**: JSON Schema (using `json-schema-to-typescript` npm package)

```typescript
// AUTO-GENERATED FROM FormFieldMetadata.schema.json - DO NOT EDIT MANUALLY

export interface FormFieldMetadata {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'time' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea';
  required?: boolean;
  metadata?: {
    description?: string;
    helpText?: string;
    placeholder?: string;
    defaultValue?: string | number | boolean;
    fieldWidth?: 'full' | 'half' | 'third' | 'quarter';
    isReadOnly?: boolean;
    isCalculated?: boolean;
    calculationFormula?: string;
    options?: string[];
    clinicalMetadata?: {
      sdvFlag?: boolean;
      medicalReviewFlag?: boolean;
      dataReviewFlag?: boolean;
      cdashMapping?: {
        domain?: 'DM' | 'AE' | 'CM' | 'VS' | 'LB' | 'EG' | 'PE' | 'MH' | 'SU' | 'QS';
        variable?: string;
        core?: 'Required' | 'Expected' | 'Permissible';
        dataType?: 'text' | 'integer' | 'float' | 'date' | 'datetime' | 'time';
      };
      sdtmMapping?: {
        domain?: string;
        variable?: string;
        origin?: 'CRF' | 'Derived' | 'Assigned' | 'Protocol' | 'Predecessor';
        codelist?: string;
        comment?: string;
      };
      medicalCoding?: {
        meddraRequired?: boolean;
        whodrugRequired?: boolean;
        autoCodeFlag?: boolean;
        meddraLevel?: 'LLT' | 'PT' | 'HLT' | 'HLGT' | 'SOC';
        customDictionary?: string;
      };
      dataQuality?: {
        criticalDataPoint?: boolean;
        keyDataPoint?: boolean;
        primaryEndpoint?: boolean;
        safetyVariable?: boolean;
        queryGeneration?: 'Auto' | 'Manual' | 'None';
        rangeCheckType?: 'Hard' | 'Soft' | 'None';
      };
      regulatoryMetadata?: {
        fdaRequired?: boolean;
        emaRequired?: boolean;
        part11?: boolean;
        auditTrail?: boolean;
        submissionDataset?: string;
      };
    };
  };
}

export interface FormDefinition {
  id: number;
  studyId: number;
  name: string;
  description?: string;
  fields: FormFieldMetadata[];
  structure?: any;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}
```

**Usage in Components**:
```typescript
import { FormFieldMetadata, FormDefinition } from '../types/FormFieldMetadata';

const CRFBuilder: React.FC = () => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition>({
    id: 0,
    studyId: 1,
    name: 'New Form',
    fields: [],
    version: '1.0',
    status: 'DRAFT'
  });
  
  const updateField = (fieldIndex: number, updates: Partial<FormFieldMetadata>) => {
    // TypeScript ensures type safety here!
  };
};
```

---

### Layer 3: Java Classes (Backend Type Safety)
**Location**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/metadata/`

**Generated From**: JSON Schema (using `jsonschema2pojo` Maven plugin)

```java
package com.clinprecision.clinopsservice.dto.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * Form Field Metadata
 * AUTO-GENERATED FROM FormFieldMetadata.schema.json - DO NOT EDIT MANUALLY
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldMetadata {
    
    @NotNull
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("name")
    private String name;
    
    @NotNull
    @JsonProperty("type")
    private FieldType type;
    
    @JsonProperty("required")
    private Boolean required = false;
    
    @Valid
    @JsonProperty("metadata")
    private FieldMetadata metadata;
    
    public enum FieldType {
        TEXT, NUMBER, DATE, DATETIME, TIME, SELECT, MULTISELECT, RADIO, CHECKBOX, TEXTAREA
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class FieldMetadata {
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("helpText")
    private String helpText;
    
    @JsonProperty("placeholder")
    private String placeholder;
    
    @JsonProperty("defaultValue")
    private Object defaultValue;
    
    @JsonProperty("fieldWidth")
    private FieldWidth fieldWidth;
    
    @JsonProperty("isReadOnly")
    private Boolean isReadOnly;
    
    @JsonProperty("isCalculated")
    private Boolean isCalculated;
    
    @JsonProperty("calculationFormula")
    private String calculationFormula;
    
    @JsonProperty("options")
    private List<String> options;
    
    @Valid
    @JsonProperty("clinicalMetadata")
    private ClinicalMetadata clinicalMetadata;
    
    public enum FieldWidth {
        FULL, HALF, THIRD, QUARTER
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ClinicalMetadata {
    
    @JsonProperty("sdvFlag")
    private Boolean sdvFlag;
    
    @JsonProperty("medicalReviewFlag")
    private Boolean medicalReviewFlag;
    
    @JsonProperty("dataReviewFlag")
    private Boolean dataReviewFlag;
    
    @Valid
    @JsonProperty("cdashMapping")
    private CdashMapping cdashMapping;
    
    @Valid
    @JsonProperty("sdtmMapping")
    private SdtmMapping sdtmMapping;
    
    @Valid
    @JsonProperty("medicalCoding")
    private MedicalCoding medicalCoding;
    
    @Valid
    @JsonProperty("dataQuality")
    private DataQuality dataQuality;
    
    @Valid
    @JsonProperty("regulatoryMetadata")
    private RegulatoryMetadata regulatoryMetadata;
}

// Additional nested classes: CdashMapping, SdtmMapping, MedicalCoding, DataQuality, RegulatoryMetadata
// Each with appropriate @JsonProperty annotations and validation
```

**Usage in Backend**:
```java
@Service
public class FormDefinitionService {
    
    public FormFieldMetadata parseFieldMetadata(String metadataJson) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(metadataJson, FormFieldMetadata.class);
        } catch (JsonProcessingException e) {
            throw new InvalidMetadataException("Invalid field metadata JSON", e);
        }
    }
    
    public void validateMetadata(FormFieldMetadata metadata) {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();
        Set<ConstraintViolation<FormFieldMetadata>> violations = validator.validate(metadata);
        
        if (!violations.isEmpty()) {
            throw new ValidationException("Metadata validation failed", violations);
        }
    }
}
```

---

### Layer 4: OpenAPI Schema (API Documentation)
**Location**: `backend/clinprecision-clinops-service/src/main/resources/openapi/schemas/FormFieldMetadata.yaml`

```yaml
FormFieldMetadata:
  type: object
  required:
    - id
    - type
  properties:
    id:
      type: string
      description: Unique field identifier
      example: "subjectId"
    name:
      type: string
      description: Display name for field
      example: "Subject ID"
    type:
      type: string
      enum: [text, number, date, datetime, time, select, multiselect, radio, checkbox, textarea]
      example: "text"
    required:
      type: boolean
      default: false
    metadata:
      $ref: '#/components/schemas/FieldMetadata'

FieldMetadata:
  type: object
  properties:
    description:
      type: string
      example: "Unique identifier for study subject"
    helpText:
      type: string
      example: "Format: SITE-###-####"
    # ... continue with all metadata properties
```

**Generates**:
- Swagger UI documentation
- API client code (for external integrations)
- Postman collections
- Mock servers

---

## Implementation Roadmap

### Phase 1: Create JSON Schema (2 hours)
**Tasks**:
1. ✅ Review existing UI metadata structure (already done)
2. Create `FormFieldMetadata.schema.json` with complete schema
3. Add validation rules (required fields, enums, patterns)
4. Version as v1.0.0
5. Add to version control

**Deliverable**: Single source of truth JSON Schema file

---

### Phase 2: Generate TypeScript Interfaces (1 hour)
**Tasks**:
1. Install `json-schema-to-typescript` npm package
2. Create generation script in `package.json`
3. Generate `FormFieldMetadata.ts` interface
4. Update `CRFBuilderIntegration.jsx` to import and use types
5. Fix any type errors

**Commands**:
```bash
npm install --save-dev json-schema-to-typescript
```

**package.json**:
```json
{
  "scripts": {
    "generate:types": "json2ts -i src/schemas/FormFieldMetadata.schema.json -o src/types/FormFieldMetadata.ts"
  }
}
```

**Deliverable**: Type-safe frontend with IDE autocomplete

---

### Phase 3: Generate Java Classes (2 hours)
**Tasks**:
1. Add `jsonschema2pojo-maven-plugin` to `pom.xml`
2. Place JSON schema in `src/main/resources/schemas/`
3. Run Maven generate sources
4. Create `FormMetadataParserService.java`
5. Create `FormMetadataValidatorService.java`
6. Add validation to `FormDefinitionController`

**pom.xml**:
```xml
<plugin>
    <groupId>org.jsonschema2pojo</groupId>
    <artifactId>jsonschema2pojo-maven-plugin</artifactId>
    <version>1.2.1</version>
    <configuration>
        <sourceDirectory>${basedir}/src/main/resources/schemas</sourceDirectory>
        <targetPackage>com.clinprecision.clinopsservice.dto.metadata</targetPackage>
        <annotationStyle>jackson2</annotationStyle>
        <includeAdditionalProperties>false</includeAdditionalProperties>
        <useLongIntegers>true</useLongIntegers>
        <includeJsr303Annotations>true</includeJsr303Annotations>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>generate</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**Deliverable**: Type-safe backend with validation

---

### Phase 4: Create Validation Service (2 hours)
**Tasks**:
1. Create `FormMetadataValidatorService.java`
2. Implement metadata validation logic
3. Add validation endpoint: `POST /api/v1/form-definitions/validate-metadata`
4. Update frontend to call validation before save
5. Display validation errors in UI

**Deliverable**: Real-time metadata validation

---

### Phase 5: Create OpenAPI Schema (1 hour)
**Tasks**:
1. Convert JSON Schema to OpenAPI YAML
2. Add to Swagger UI
3. Generate API documentation
4. Test with Swagger UI

**Deliverable**: Auto-generated API documentation

---

### Phase 6: Migrate Existing Forms (2 hours)
**Tasks**:
1. Create migration script to validate existing form metadata
2. Fix any non-conforming metadata
3. Re-save all form definitions
4. Verify in database

**Deliverable**: All forms conform to schema

---

## Validation Strategy

### Frontend Validation (Before Save)
```typescript
import Ajv from 'ajv';
import metadataSchema from '../schemas/FormFieldMetadata.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(metadataSchema);

const validateFieldMetadata = (field: FormFieldMetadata): string[] => {
  const valid = validate(field);
  if (!valid) {
    return validate.errors.map(err => `${err.instancePath}: ${err.message}`);
  }
  return [];
};

// In CRFBuilder save function
const saveForm = async () => {
  const errors = formDefinition.fields.flatMap(field => validateFieldMetadata(field));
  
  if (errors.length > 0) {
    showErrorNotification('Form metadata validation failed', errors);
    return;
  }
  
  // Proceed with save
  await FormService.saveFormDefinition(formDefinition);
};
```

### Backend Validation (On Receive)
```java
@Service
public class FormMetadataValidatorService {
    
    private final ObjectMapper objectMapper;
    private final Validator validator;
    
    public FormMetadataValidatorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        this.validator = factory.getValidator();
    }
    
    public ValidationResult validateFormDefinition(FormDefinitionDto formDto) {
        List<String> errors = new ArrayList<>();
        
        try {
            // Parse fields JSON to typed objects
            List<FormFieldMetadata> fields = parseFields(formDto.getFields());
            
            // Validate each field
            for (int i = 0; i < fields.size(); i++) {
                FormFieldMetadata field = fields.get(i);
                Set<ConstraintViolation<FormFieldMetadata>> violations = validator.validate(field);
                
                if (!violations.isEmpty()) {
                    for (ConstraintViolation<FormFieldMetadata> violation : violations) {
                        errors.add(String.format("Field %d (%s): %s", 
                            i, field.getId(), violation.getMessage()));
                    }
                }
                
                // Custom business validation
                validateClinicalMetadata(field, errors);
            }
            
        } catch (JsonProcessingException e) {
            errors.add("Invalid JSON structure: " + e.getMessage());
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    private void validateClinicalMetadata(FormFieldMetadata field, List<String> errors) {
        ClinicalMetadata clinical = field.getMetadata().getClinicalMetadata();
        if (clinical == null) return;
        
        // Validate CDASH/SDTM consistency
        if (clinical.getCdashMapping() != null && clinical.getSdtmMapping() != null) {
            if (!clinical.getCdashMapping().getDomain().equals(clinical.getSdtmMapping().getDomain())) {
                errors.add(String.format("Field %s: CDASH and SDTM domains must match", field.getId()));
            }
        }
        
        // Validate medical coding requirements
        if (clinical.getMedicalCoding() != null && clinical.getMedicalCoding().getMeddraRequired()) {
            if (clinical.getMedicalCoding().getMeddraLevel() == null) {
                errors.add(String.format("Field %s: MedDRA level required when MedDRA coding is enabled", field.getId()));
            }
        }
    }
}
```

---

## Summary: Where Schema is Defined

| **Layer** | **Location** | **Purpose** | **Status** |
|-----------|-------------|-------------|-----------|
| **UI Implementation** | `CRFBuilderIntegration.jsx` lines 1726-2600 | Renders metadata form | ✅ **EXISTS** |
| **JSON Schema** | `frontend/src/schemas/FormFieldMetadata.schema.json` | Source of truth, formal spec | ❌ **MISSING** - Needs creation |
| **TypeScript Interface** | `frontend/src/types/FormFieldMetadata.ts` | Frontend type safety | ❌ **MISSING** - Generate from schema |
| **Java Classes** | `backend/.../dto/metadata/*.java` | Backend type safety | ⚠️ **PARTIAL** - `FieldMetadataDTO.java` exists but incomplete |
| **OpenAPI Schema** | `backend/.../openapi/schemas/*.yaml` | API documentation | ❌ **MISSING** - Generate from schema |
| **Database** | `form_definitions.fields` (JSON column) | Persistent storage | ✅ **EXISTS** |

---

## Recommended Actions

### Immediate (Next 2 hours)
1. ✅ Document current metadata structure (this document)
2. Create `FormFieldMetadata.schema.json` with v1.0 schema
3. Validate existing UI against schema

### Short-term (Next 4 hours)
1. Generate TypeScript interfaces
2. Update CRFBuilder to use TypeScript
3. Add frontend validation with Ajv

### Medium-term (Next 8 hours)
1. Generate Java classes from schema
2. Create backend validation service
3. Add validation to save endpoint
4. Migrate existing forms

### Long-term (Next 12 hours)
1. Create OpenAPI schema
2. Generate API documentation
3. Add metadata versioning support
4. Create metadata migration tools

---

## Questions for User

1. **Should I create the JSON Schema now** based on the existing UI structure?

2. **Do you want TypeScript interfaces** added to the frontend for type safety?

3. **Should backend validate metadata** before saving, or just trust frontend validation?

4. **Do you need metadata versioning** (v1.0, v1.1, v2.0) to support schema evolution?

5. **Should I enhance the existing `FieldMetadataDTO.java`** or create new classes from schema?

---

**Next Step**: I recommend creating the JSON Schema first as the single source of truth, then generating TypeScript/Java from it. This ensures consistency between frontend and backend.

Should I proceed with creating `FormFieldMetadata.schema.json`?

