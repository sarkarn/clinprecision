# Database Fields vs Metadata Best Practices

## Overview
This document defines what data should be stored in dedicated database columns vs the flexible `metadata` JSON column.

## Database Columns (Structured Data)
These fields should **always** be stored as dedicated database columns because they are:
- Frequently queried/filtered
- Used in reports and analytics  
- Required for business logic
- Need proper indexing for performance

### Core Study Fields
```sql
-- These map to dedicated database columns in the studies table:
name VARCHAR(255)                    -- Study name/title
protocol_number VARCHAR(100)        -- Protocol identifier
sponsor VARCHAR(255)                -- Sponsoring organization
description TEXT                    -- Study description
indication VARCHAR(500)             -- Medical condition
study_type VARCHAR(50)              -- INTERVENTIONAL/OBSERVATIONAL
principal_investigator VARCHAR(255) -- Lead investigator name
primary_objective TEXT              -- Main study goal
sites INTEGER                       -- Number of study sites
planned_subjects INTEGER            -- Target enrollment
enrolled_subjects INTEGER           -- Current enrollment
target_enrollment INTEGER           -- Enrollment goal
amendments INTEGER                   -- Number of amendments
start_date DATE                     -- Study start
end_date DATE                       -- Study end
```

### Lookup Relationships
```sql
-- These use foreign key relationships:
study_status_id BIGINT              -- References study_status table
regulatory_status_id BIGINT         -- References regulatory_status table  
study_phase_id BIGINT               -- References study_phase table
```

## Metadata JSON (Flexible Data)
The `metadata` column should contain **only** flexible, less-structured data:

### Supporting Personnel (Non-Primary)
```json
{
  "studyCoordinator": "Jane Doe",     // Supporting role
  "medicalMonitor": "Dr. Smith"       // Supporting role
}
```

### Study Configuration  
```json
{
  "secondaryObjectives": [            // Array of strings
    "Safety assessment", 
    "Quality of life"
  ],
  "estimatedDuration": "104 weeks"    // Flexible duration format
}
```

### Regulatory Flags
```json
{
  "ethicsApproval": true,             // Boolean flags
  "fdaInd": true,                     // Boolean flags
  "specialPopulation": "pediatric"    // Flexible classifications
}
```

### Custom/Study-Specific Data
```json
{
  "customFields": {                   // Study-specific requirements
    "deviceType": "Class II",
    "specialRequirements": ["GCP", "FDA"]
  }
}
```

## Frontend Implementation

### ✅ CORRECT - StudyRegister.jsx
```javascript
const apiFormData = {
  name: formData.name,
  principalInvestigator: formData.principalInvestigator,  // Top-level
  studyType: formData.studyType,                          // Top-level  
  primaryObjective: formData.primaryObjective,            // Top-level
  // ... other database fields
  
  metadata: JSON.stringify({
    studyCoordinator: formData.studyCoordinator,          // In metadata
    medicalMonitor: formData.medicalMonitor,              // In metadata
    ethicsApproval: formData.ethicsApproval               // In metadata
  })
};
```

### ❌ INCORRECT - Previous Wizard Implementation
```javascript
// DON'T DO THIS:
const metadata = {
  principalInvestigator: data.principalInvestigator,  // ❌ Should be top-level
  studyType: data.studyType,                          // ❌ Should be top-level
  primaryObjective: data.primaryObjective             // ❌ Should be top-level
};
```

## Backend Processing

### StudyCreateRequestDto Fields
```java
// These should be top-level DTO fields:
private String principalInvestigator;  // Maps to principal_investigator column
private String studyType;              // Maps to study_type column
private String primaryObjective;       // Maps to primary_objective column
private Long regulatoryStatusId;       // Maps to regulatory_status_id FK

// This stays as JSON:
private String metadata;               // Flexible JSON data
```

### StudyMapper Behavior
```java
// Correct mapping:
entity.setPrincipalInvestigator(dto.getPrincipalInvestigator()); // To column
entity.setStudyType(dto.getStudyType());                         // To column
entity.setMetadata(dto.getMetadata());                           // To JSON column
```

## Migration Strategy

1. **For New Studies**: Use the corrected frontend forms that send proper field structure
2. **For Existing Studies**: Run the `fix_metadata_structure.sql` script to move misplaced data
3. **For Testing**: Use `update_principal_investigators.sql` to populate test data

## Query Performance Benefits

### With Proper Columns (Fast)
```sql
-- Fast indexed queries:
SELECT * FROM studies WHERE principal_investigator LIKE '%Dr. Smith%';
SELECT * FROM studies WHERE study_type = 'INTERVENTIONAL';
```

### With Metadata Only (Slow)
```sql  
-- Slow JSON queries:
SELECT * FROM studies WHERE JSON_EXTRACT(metadata, '$.principalInvestigator') LIKE '%Dr. Smith%';
```

## Summary

| Field Category | Storage Location | Reason |
|---|---|---|
| Core study identifiers | Database columns | Frequently queried, indexed |
| Personnel (primary roles) | Database columns | Used in displays, filtering |  
| Study classifications | Database columns | Business logic, reporting |
| Numeric metrics | Database columns | Calculations, analytics |
| Supporting personnel | Metadata JSON | Flexible, less frequently queried |
| Configuration flags | Metadata JSON | Boolean settings, preferences |
| Study-specific extensions | Metadata JSON | Custom fields, variable structure |