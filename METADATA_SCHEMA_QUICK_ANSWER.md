# Where is Metadata Schema Defined? - Quick Answer

**Date**: October 15, 2025

---

## TL;DR - The Answer

Your system **ALREADY HAS** comprehensive metadata in the UI, but the **schema is implicitly defined** in the JSX code rather than formally documented.

### Current State
```
┌─────────────────────────────────────────────────────────────────────┐
│  Form Designer UI (CRFBuilderIntegration.jsx)                      │
│  Lines 1726-2600                                                     │
│                                                                      │
│  User clicks ⚙️ gear button → Shows 7 metadata tabs:               │
│                                                                      │
│  1. 📝 Basic - Description, help text, placeholder, defaults        │
│  2. 🏥 Clinical Flags - SDV, medical review, data review            │
│  3. 📊 CDASH/SDTM - Domain, variable, core status, mappings        │
│  4. 🏷️ Medical Coding - MedDRA, WHODrug, auto-coding              │
│  5. ✅ Data Quality - Critical data, query generation, ranges       │
│  6. 📋 Regulatory - FDA/EMA, 21 CFR Part 11, audit trail           │
│  7. 📤 Export - JSON/Excel/CSV export options                       │
│                                                                      │
│  Updates stored in field.metadata object (JavaScript)               │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
                         Saves as JSON
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│  MySQL Database                                                      │
│  Table: form_definitions                                            │
│  Column: fields (JSON)                                              │
│                                                                      │
│  Stores entire metadata structure as JSON string                    │
│  No validation, no schema enforcement                               │
└─────────────────────────────────────────────────────────────────────┘
```

### The Problem
```
❌ No formal JSON Schema definition
❌ No TypeScript interfaces (no type safety)
❌ No backend Java classes for parsing
❌ No validation (accepts any JSON structure)
❌ Schema is "defined" by what the UI happens to render
❌ Difficult for developers to know what's valid
```

---

## How Metadata Gets Rendered Now

### Step 1: User Opens Form Designer
```jsx
// CRFBuilderIntegration.jsx line ~1700
<button onClick={() => toggleFieldMetadata(field.id)}>
  <Settings className="w-4 h-4" /> {/* ⚙️ gear icon */}
</button>
```

### Step 2: Gear Button Toggles Metadata Panel
```jsx
{showFieldMetadata[field.id] && (
  <div>
    {/* Metadata panel appears below field */}
    <h4>Clinical Data Management Metadata</h4>
    
    {/* 7 tabs for different metadata categories */}
    <nav>
      📝 Basic | 🏥 Clinical | 📊 CDASH/SDTM | 🏷️ Coding | 
      ✅ Quality | 📋 Regulatory | 📤 Export
    </nav>
  </div>
)}
```

### Step 3: User Fills Metadata Forms
```jsx
// Example: CDASH Domain dropdown
<select
  value={field.metadata?.clinicalMetadata?.cdashMapping?.domain || ''}
  onChange={(e) => updateField(sectionIndex, fieldIndex, {
    metadata: {
      ...field.metadata,
      clinicalMetadata: {
        ...field.metadata?.clinicalMetadata,
        cdashMapping: {
          ...field.metadata?.clinicalMetadata?.cdashMapping,
          domain: e.target.value  // Updates in-memory object
        }
      }
    }
  })}
>
  <option value="DM">Demographics (DM)</option>
  <option value="AE">Adverse Events (AE)</option>
  <option value="VS">Vital Signs (VS)</option>
  {/* ... more options */}
</select>
```

### Step 4: Saved to Database
```javascript
// When user saves form
const formDefinition = {
  id: 123,
  studyId: 1,
  name: "Demographics Form",
  fields: [
    {
      id: "firstName",
      name: "First Name",
      type: "text",
      required: true,
      metadata: {
        description: "Patient's first name",
        helpText: "Enter legal first name",
        clinicalMetadata: {
          sdvFlag: true,
          cdashMapping: {
            domain: "DM",
            variable: "FIRSTNAME",
            core: "Required"
          }
        }
      }
    }
  ]
};

// Backend receives this and stores as JSON string in MySQL
POST /api/v1/form-definitions
Body: formDefinition
```

### Step 5: Backend Stores as JSON
```java
// FormDefinitionService.java
public FormDefinitionDto save(FormDefinitionDto dto) {
    FormDefinitionEntity entity = new FormDefinitionEntity();
    entity.setName(dto.getName());
    entity.setFields(dto.getFields());  // ← Just a String! No parsing!
    
    return repository.save(entity);  // Stores JSON as-is
}
```

```sql
-- MySQL
INSERT INTO form_definitions (name, fields, ...)
VALUES (
  'Demographics Form',
  '[{"id":"firstName","metadata":{"clinicalMetadata":{"cdashMapping":{"domain":"DM"}}}}]',
  ...
);
```

---

## Current JSON Structure (As Implemented)

```json
{
  "id": "temperature",
  "name": "Body Temperature",
  "type": "number",
  "required": true,
  "metadata": {
    "description": "Patient body temperature",
    "helpText": "Measure with calibrated thermometer",
    "placeholder": "36.5",
    "defaultValue": null,
    "fieldWidth": "half",
    "isReadOnly": false,
    "isCalculated": false,
    "clinicalMetadata": {
      "sdvFlag": true,
      "medicalReviewFlag": false,
      "dataReviewFlag": true,
      "cdashMapping": {
        "domain": "VS",
        "variable": "VSTEMP",
        "core": "Expected",
        "dataType": "float"
      },
      "sdtmMapping": {
        "domain": "VS",
        "variable": "VSSTRESN",
        "origin": "CRF",
        "codelist": null
      },
      "medicalCoding": {
        "meddraRequired": false,
        "whodrugRequired": false,
        "autoCodeFlag": false
      },
      "dataQuality": {
        "criticalDataPoint": false,
        "keyDataPoint": false,
        "safetyVariable": true,
        "queryGeneration": "Auto",
        "rangeCheckType": "Soft"
      },
      "regulatoryMetadata": {
        "fdaRequired": true,
        "emaRequired": true,
        "part11": true,
        "auditTrail": true,
        "submissionDataset": "VS"
      }
    }
  }
}
```

---

## What's Missing

### ❌ No JSON Schema Definition
**Problem**: No formal specification of what's valid

**Should Have**:
```
frontend/clinprecision/src/schemas/FormFieldMetadata.schema.json
```

**Would Enable**:
- Single source of truth
- Version control (v1.0, v1.1, v2.0)
- Validation with standard tools
- Generate TypeScript interfaces automatically
- Generate Java classes automatically
- Generate API documentation automatically

---

### ❌ No TypeScript Interfaces
**Problem**: No type safety in frontend

**Should Have**:
```typescript
// frontend/src/types/FormFieldMetadata.ts
export interface FormFieldMetadata {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | ...;
  metadata?: {
    clinicalMetadata?: {
      cdashMapping?: {
        domain: 'DM' | 'AE' | 'VS' | ...;
        variable: string;
        // ...
      };
    };
  };
}
```

**Would Enable**:
- IDE autocomplete
- Compile-time type checking
- Catch typos before runtime
- Better developer experience

---

### ❌ No Backend Java Classes
**Problem**: Backend can't parse or validate metadata

**Currently**: `FormDefinitionDto.fields` is just `String`
```java
public class FormDefinitionDto {
    private String fields;  // ← Generic String, no structure!
}
```

**Should Have**:
```java
// backend/.../dto/metadata/FormFieldMetadata.java
public class FormFieldMetadata {
    private String id;
    private FieldType type;
    private FieldMetadata metadata;
}

public class FieldMetadata {
    private ClinicalMetadata clinicalMetadata;
}

public class ClinicalMetadata {
    private Boolean sdvFlag;
    private CdashMapping cdashMapping;
    // ...
}
```

**Would Enable**:
- Parse JSON to typed objects
- Validate structure
- Execute business logic based on metadata
- Type-safe query of metadata

---

### ❌ No Validation
**Problem**: Any JSON structure accepted, no enforcement

**Current Behavior**:
```javascript
// Frontend can save ANY structure
field.metadata.cdashMapping.domainXYZ = "invalid";  // ← No error!
```

```java
// Backend accepts it
entity.setFields(anyJsonString);  // ← No validation!
```

**Should Have**:
```javascript
// Frontend validation before save
const errors = validateMetadata(field.metadata);
if (errors.length > 0) {
  showError("Invalid metadata structure");
  return;
}
```

```java
// Backend validation on receive
@PostMapping("/form-definitions")
public ResponseEntity<?> save(@RequestBody FormDefinitionDto dto) {
    ValidationResult result = metadataValidator.validate(dto);
    if (!result.isValid()) {
        return ResponseEntity.badRequest().body(result.getErrors());
    }
    // ...
}
```

---

## Recommended Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. JSON Schema (Source of Truth)                                   │
│  frontend/src/schemas/FormFieldMetadata.schema.json                 │
│                                                                      │
│  Formal specification using JSON Schema standard                    │
│  Version: 1.0.0                                                     │
│  Contains all field types, metadata structure, validation rules     │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│  2. TypeScript       │            │  3. Java Classes     │
│  (Auto-Generated)    │            │  (Auto-Generated)    │
│                      │            │                      │
│  FormFieldMetadata.ts│            │  FormFieldMetadata.  │
│                      │            │    java              │
│  Used by:            │            │                      │
│  - CRFBuilder        │            │  Used by:            │
│  - FormEntry         │            │  - FormDefinition    │
│  - DataEntry         │            │    Service           │
│                      │            │  - Validation        │
│  Benefits:           │            │    Service           │
│  ✅ Type safety      │            │                      │
│  ✅ Autocomplete     │            │  Benefits:           │
│  ✅ Catch errors     │            │  ✅ Type safety      │
│     at compile time  │            │  ✅ Validation       │
└──────────────────────┘            │  ✅ Business logic   │
                                    └──────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create JSON Schema (2 hours)
```bash
# Create schema file
frontend/src/schemas/FormFieldMetadata.schema.json

# Include:
- Field types enum
- Metadata structure
- Clinical metadata sub-structures
- Validation rules (required, enums, patterns)
- Descriptions for documentation
```

### Phase 2: Generate TypeScript (1 hour)
```bash
# Install tool
npm install --save-dev json-schema-to-typescript

# Add script
# package.json
"scripts": {
  "generate:types": "json2ts -i src/schemas/*.schema.json -o src/types/"
}

# Generate
npm run generate:types

# Result: frontend/src/types/FormFieldMetadata.ts
```

### Phase 3: Update Frontend (2 hours)
```typescript
// CRFBuilderIntegration.tsx (convert to TypeScript)
import { FormFieldMetadata } from '../types/FormFieldMetadata';

interface Props {
  formDefinition: {
    fields: FormFieldMetadata[];
  };
}

// Now TypeScript enforces structure!
const updateField = (field: FormFieldMetadata, updates: Partial<FormFieldMetadata>) => {
  // Type-safe updates
};
```

### Phase 4: Generate Java Classes (2 hours)
```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.jsonschema2pojo</groupId>
  <artifactId>jsonschema2pojo-maven-plugin</artifactId>
  <configuration>
    <sourceDirectory>${basedir}/src/main/resources/schemas</sourceDirectory>
    <targetPackage>com.clinprecision.clinopsservice.dto.metadata</targetPackage>
  </configuration>
</plugin>
```

```bash
# Copy schema to backend
cp frontend/src/schemas/FormFieldMetadata.schema.json \
   backend/clinprecision-clinops-service/src/main/resources/schemas/

# Generate Java classes
mvn generate-sources

# Result: backend/.../dto/metadata/FormFieldMetadata.java
```

### Phase 5: Add Validation (2 hours)
```java
// Backend
@Service
public class FormMetadataValidatorService {
    public ValidationResult validate(List<FormFieldMetadata> fields) {
        // Validate structure
        // Validate business rules
        // Return errors
    }
}

// Frontend
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(metadataSchema);

const validateBeforeSave = (field: FormFieldMetadata) => {
  const valid = validate(field);
  return valid ? [] : validate.errors;
};
```

---

## Summary Answer to Your Question

### **"Where are you planning to define this schema?"**

**Answer**: I plan to define it in **3 places** (generated from one source):

1. **JSON Schema** (source of truth)
   - Location: `frontend/clinprecision/src/schemas/FormFieldMetadata.schema.json`
   - Format: JSON Schema v7
   - Purpose: Formal specification, single source of truth

2. **TypeScript Interface** (generated from JSON Schema)
   - Location: `frontend/clinprecision/src/types/FormFieldMetadata.ts`
   - Tool: `json-schema-to-typescript`
   - Purpose: Frontend type safety

3. **Java Classes** (generated from JSON Schema)
   - Location: `backend/.../dto/metadata/FormFieldMetadata.java`
   - Tool: `jsonschema2pojo-maven-plugin`
   - Purpose: Backend type safety and validation

### **"How it is gets rendered currently in the form design UI when the gear button is clicked?"**

**Answer**: It's rendered in `CRFBuilderIntegration.jsx` lines 1726-2600:

1. User clicks ⚙️ gear button → `toggleFieldMetadata(field.id)` called
2. Panel appears with 7 tabs (Basic, Clinical, CDASH/SDTM, Coding, Quality, Regulatory, Export)
3. Each tab shows form inputs for that metadata category
4. User edits values → `updateField()` updates in-memory object
5. User saves form → Entire field definition (with metadata) saved as JSON to MySQL

**The schema is implicitly defined by the UI component structure** - there's no formal schema document yet.

---

## Next Steps

**Immediate**: Create `FormFieldMetadata.schema.json` based on existing UI structure

**Should I proceed?** This will give you:
- ✅ Single source of truth
- ✅ Type safety (TypeScript + Java)
- ✅ Validation
- ✅ Auto-generated documentation
- ✅ Consistent structure across frontend/backend

Let me know if you want me to create the JSON Schema now!

