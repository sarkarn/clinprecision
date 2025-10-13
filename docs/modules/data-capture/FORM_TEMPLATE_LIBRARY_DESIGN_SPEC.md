# Form Template/Library Design - Feature Specification

**Created:** October 12, 2025  
**Priority:** Medium (after Subject Management Phase 1)  
**Estimated Effort:** 2-3 weeks  
**Status:** 📋 Backlog (Future Enhancement)

---

## 🎯 Overview

### Current State
- ✅ **Form Data Capture Backend**: Complete (Week 2 bonus - October 12, 2025)
  - Event sourcing for form submissions
  - PostgreSQL JSON storage for flexible form schemas
  - Complete audit trail (21 CFR Part 11 compliant)
  - REST API endpoints for form submission and retrieval
  - FormDataService.js (frontend API client)
  - FormConstants.js (centralized configuration)

- ✅ **CRF Builder**: Complete (Phase 6F)
  - Study-specific form design within Study Design module
  - 6 metadata tabs for clinical data standards
  - Form JSON export functionality

### Gap Identified
**Missing**: Standalone UI for creating, managing, and versioning **reusable form templates** that can be:
- Used across multiple studies
- Versioned and tracked
- Browsed in a form library
- Cloned and customized
- Linked to FormConstants.js FORM_IDS

### Why This Is Needed
1. **Reusability**: Common forms (screening, vitals, adverse events) used across multiple studies
2. **Standardization**: Organization-wide form templates ensure consistency
3. **Efficiency**: Don't recreate the same forms for each study
4. **Versioning**: Track form changes over time (regulatory requirement)
5. **Form Discovery**: Browse available forms before designing a study

---

## 📋 Requirements

### Functional Requirements

#### 1. Form Template Designer
**User Story**: As a clinical operations manager, I want to create reusable form templates so that I don't have to recreate common forms for each study.

**Features**:
- Drag-and-drop form builder
- Field types:
  * Text (single-line)
  * Text Area (multi-line)
  * Number (integer, decimal)
  * Date / DateTime
  * Dropdown (single-select)
  * Multi-select
  * Checkbox
  * Radio buttons
  * File upload
  * Signature
- Field properties:
  * Label
  * Placeholder text
  * Help text
  * Required/Optional
  * Validation rules (min/max, regex, custom)
  * Conditional visibility (show if another field = X)
  * CDASH mapping (optional)
  * Medical coding (optional)
- Form properties:
  * Form name
  * Form description
  * Form type (SCREENING, VISIT, ADVERSE_EVENT, etc.)
  * Version number
  * Status (DRAFT, ACTIVE, ARCHIVED)
- Live preview
- Save to form_definitions table
- Auto-assign FORM_ID

#### 2. Form Library Browser
**User Story**: As a study designer, I want to browse available form templates so that I can select appropriate forms for my study.

**Features**:
- Search forms by:
  * Name
  * Type (SCREENING, VISIT, etc.)
  * Status (ACTIVE, DRAFT, ARCHIVED)
  * Creator
  * Date created
- Filter forms:
  * By category
  * By usage count
  * By organization/department
- Form preview:
  * Visual preview of form
  * Field list with properties
  * Version history
  * Usage statistics (which studies use this form)
- Form actions:
  * Clone form (create new from existing)
  * Edit form (creates new version)
  * Archive form
  * Export form (JSON, PDF)
  * View usage report

#### 3. Form Versioning
**User Story**: As a regulatory specialist, I want to track form versions so that I can demonstrate which version was used at what time.

**Features**:
- Version history for each form
- Track changes between versions (diff view)
- Lock previous versions (read-only)
- Link form submissions to specific version
- Version metadata:
  * Version number (1.0, 1.1, 2.0)
  * Created by
  * Created date
  * Change description
  * Status (DRAFT, ACTIVE, ARCHIVED, LOCKED)

#### 4. Form Usage Tracking
**User Story**: As a system administrator, I want to see which forms are being used so that I can optimize the form library.

**Features**:
- Usage statistics:
  * Number of studies using form
  * Number of submissions
  * Last used date
  * Average completion time
- Usage by:
  * Study
  * Site
  * Date range
- Reports:
  * Most used forms
  * Unused forms (candidates for archival)
  * Form completion rates

---

## 🏗️ Technical Architecture

### Database Schema

#### form_definitions table (existing - enhance)
```sql
CREATE TABLE form_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Form Identity
    form_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique code (e.g., SCREENING_V1, VITALS_V2)',
    form_name VARCHAR(255) NOT NULL,
    form_description TEXT,
    
    -- Form Classification
    form_type VARCHAR(50) NOT NULL COMMENT 'SCREENING, VISIT, ADVERSE_EVENT, etc.',
    form_category VARCHAR(50) COMMENT 'ENROLLMENT, SAFETY, EFFICACY, etc.',
    
    -- Form Schema (JSON)
    form_schema JSON NOT NULL COMMENT 'Complete form definition including fields, validation, layout',
    
    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    parent_form_id BIGINT NULL COMMENT 'FK to parent form if this is a version',
    version_notes TEXT COMMENT 'Description of changes in this version',
    
    -- Status & Lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT, ACTIVE, ARCHIVED, LOCKED',
    is_template BOOLEAN DEFAULT TRUE COMMENT 'TRUE for library templates, FALSE for study-specific',
    is_locked BOOLEAN DEFAULT FALSE COMMENT 'Locked forms cannot be edited',
    
    -- Metadata
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP,
    activated_at TIMESTAMP COMMENT 'When status changed to ACTIVE',
    archived_at TIMESTAMP COMMENT 'When status changed to ARCHIVED',
    
    -- Usage Tracking
    usage_count INT DEFAULT 0 COMMENT 'Number of times form has been used',
    last_used_at TIMESTAMP COMMENT 'Last time form was submitted',
    
    -- Organization Context
    organization_id BIGINT COMMENT 'FK to organizations if multi-tenant',
    
    -- Indexes
    INDEX idx_form_type (form_type),
    INDEX idx_form_status (status),
    INDEX idx_form_category (form_category),
    INDEX idx_parent_form (parent_form_id),
    INDEX idx_is_template (is_template),
    
    FOREIGN KEY (parent_form_id) REFERENCES form_definitions(id)
);
```

#### form_usage_log table (new)
```sql
CREATE TABLE form_usage_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    usage_type VARCHAR(50) NOT NULL COMMENT 'ASSIGNED_TO_STUDY, FORM_SUBMITTED',
    used_by VARCHAR(100) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (form_id) REFERENCES form_definitions(id),
    INDEX idx_form_usage_form (form_id),
    INDEX idx_form_usage_study (study_id),
    INDEX idx_form_usage_date (used_at)
);
```

### Form Schema JSON Structure

```json
{
  "formCode": "SCREENING_ASSESSMENT_V1",
  "formName": "Screening Assessment",
  "formDescription": "Standard screening assessment for eligibility determination",
  "formType": "SCREENING",
  "version": "1.0",
  "sections": [
    {
      "sectionId": "eligibility",
      "sectionTitle": "Eligibility Criteria",
      "sectionOrder": 1,
      "fields": [
        {
          "fieldId": "eligibility_age",
          "fieldName": "eligibility_age",
          "fieldLabel": "Meets Age Requirement?",
          "fieldType": "CHECKBOX",
          "required": true,
          "defaultValue": false,
          "validation": {
            "required": true
          },
          "helpText": "Patient must be 18-65 years old",
          "cdashMapping": {
            "domain": "DM",
            "variable": "AGE"
          }
        },
        {
          "fieldId": "eligibility_diagnosis",
          "fieldName": "eligibility_diagnosis",
          "fieldLabel": "Has Required Diagnosis?",
          "fieldType": "CHECKBOX",
          "required": true,
          "defaultValue": false
        },
        {
          "fieldId": "screening_date",
          "fieldName": "screening_date",
          "fieldLabel": "Screening Date",
          "fieldType": "DATE",
          "required": true,
          "validation": {
            "required": true,
            "maxDate": "today"
          }
        },
        {
          "fieldId": "assessor_name",
          "fieldName": "assessor_name",
          "fieldLabel": "Assessed By",
          "fieldType": "TEXT",
          "required": true,
          "validation": {
            "required": true,
            "minLength": 2,
            "maxLength": 100
          }
        },
        {
          "fieldId": "notes",
          "fieldName": "notes",
          "fieldLabel": "Additional Notes",
          "fieldType": "TEXTAREA",
          "required": false,
          "validation": {
            "maxLength": 1000
          },
          "rows": 4
        }
      ]
    }
  ],
  "metadata": {
    "estimatedCompletionTime": "10 minutes",
    "requiredRole": "CRC",
    "cdashCompliant": true,
    "regulatoryStandard": "GCP",
    "tags": ["screening", "eligibility", "enrollment"]
  }
}
```

---

## 🎨 User Interface Design

### 1. Form Library Dashboard
**Location**: `/forms/library`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Form Library                              [+ New]   │
├─────────────────────────────────────────────────────┤
│ Search: [______________] 🔍                         │
│                                                     │
│ Filters:                                            │
│ Type: [All ▼] Category: [All ▼] Status: [Active ▼] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌───────────────────┐ ┌───────────────────┐       │
│ │ Screening         │ │ Baseline Vitals   │       │
│ │ Assessment        │ │                   │       │
│ │                   │ │ Type: Visit Form  │       │
│ │ Type: Screening   │ │ Version: 2.1      │       │
│ │ Version: 1.5      │ │ Status: Active    │       │
│ │ Status: Active    │ │ Used: 45 times    │       │
│ │ Used: 123 times   │ │                   │       │
│ │                   │ │ [Edit] [Clone]    │       │
│ │ [Edit] [Clone]    │ └───────────────────┘       │
│ └───────────────────┘                             │
│                                                     │
│ ┌───────────────────┐ ┌───────────────────┐       │
│ │ Adverse Event     │ │ Consent Form      │       │
│ │ Report            │ │                   │       │
│ │                   │ │ Type: Regulatory  │       │
│ │ Type: Safety      │ │ Version: 1.0      │       │
│ │ Version: 3.0      │ │ Status: Draft     │       │
│ │ Status: Active    │ │ Used: 0 times     │       │
│ │ Used: 87 times    │ │                   │       │
│ │                   │ │ [Edit] [Delete]   │       │
│ │ [Edit] [Clone]    │ └───────────────────┘       │
│ └───────────────────┘                             │
└─────────────────────────────────────────────────────┘
```

### 2. Form Template Designer
**Location**: `/forms/designer` or `/forms/designer/:formId`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Form Designer: Screening Assessment         [Save] │
├──────────────┬──────────────────────────────────────┤
│ Toolbox      │ Form Canvas                          │
│              │                                      │
│ Basic Fields │ Form Name: [Screening Assessment]   │
│ □ Text       │ Description: [Standard screening...] │
│ □ Number     │ Type: [Screening ▼]                 │
│ □ Date       │ Version: [1.5]                      │
│ □ Dropdown   │                                      │
│ □ Checkbox   │ ┌─────────────────────────────────┐ │
│ □ Radio      │ │ Section: Eligibility Criteria  │ │
│ □ TextArea   │ ├─────────────────────────────────┤ │
│              │ │                                 │ │
│ Advanced     │ │ ☑ Meets Age Requirement?       │ │
│ □ File       │ │   (Required)                    │ │
│ □ Signature  │ │                                 │ │
│ □ Calculated │ │ ☑ Has Required Diagnosis?      │ │
│              │ │   (Required)                    │ │
│ Layout       │ │                                 │ │
│ □ Section    │ │ Screening Date: [__________]   │ │
│ □ Column     │ │   (Required, Date picker)       │ │
│ □ Divider    │ │                                 │ │
│              │ │ Assessed By: [______________]  │ │
│              │ │   (Required, Text)              │ │
│              │ │                                 │ │
│              │ │ Notes: [___________________]   │ │
│              │ │        [___________________]   │ │
│              │ │   (Optional, Textarea)          │ │
│              │ └─────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

**Interaction**:
- Drag fields from toolbox to canvas
- Click field to edit properties in right panel
- Reorder fields via drag-and-drop
- Add sections to organize fields
- Live preview in separate tab

### 3. Field Properties Panel
**Appears when field is selected**

```
┌─────────────────────────────────┐
│ Field Properties                │
├─────────────────────────────────┤
│ Field Type: Checkbox            │
│ Field Name: eligibility_age     │
│ Label: [Meets Age Requirement?] │
│ Help Text: [Patient must be...] │
│                                 │
│ ☑ Required                      │
│ ☐ Read-only                     │
│ ☐ Hidden by default             │
│                                 │
│ Validation Rules:               │
│ [+ Add Rule]                    │
│                                 │
│ CDASH Mapping (optional):       │
│ Domain: [DM ▼]                  │
│ Variable: [AGE]                 │
│                                 │
│ [Save] [Cancel]                 │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Form Library Browser (Week 1)
**Goal**: Users can browse and search existing forms

**Tasks**:
1. Create FormLibrary.jsx component
2. API endpoint: GET /api/v1/forms/library (list all template forms)
3. Search and filter functionality
4. Form card component (displays form summary)
5. Form detail modal (shows full form info + version history)

**Deliverables**:
- ✅ Browse form library
- ✅ Search forms by name/type
- ✅ View form details
- ✅ View version history

### Phase 2: Form Template Designer (Week 2-3)
**Goal**: Users can create new form templates

**Tasks**:
1. Create FormDesigner.jsx component
2. Drag-and-drop field builder
3. Field properties editor
4. Form preview functionality
5. Save form to form_definitions table
6. API endpoints:
   - POST /api/v1/forms/templates (create new template)
   - PUT /api/v1/forms/templates/:id (update template)
   - POST /api/v1/forms/templates/:id/version (create new version)

**Deliverables**:
- ✅ Drag-and-drop form builder
- ✅ Field types: text, number, date, dropdown, checkbox, textarea
- ✅ Field validation rules
- ✅ Live preview
- ✅ Save templates

### Phase 3: Form Versioning & Management (Week 3)
**Goal**: Track form versions and manage lifecycle

**Tasks**:
1. Version history UI
2. Form diff viewer (compare versions)
3. Form cloning functionality
4. Form status management (DRAFT → ACTIVE → ARCHIVED)
5. Lock form versions
6. API endpoints:
   - GET /api/v1/forms/templates/:id/versions
   - POST /api/v1/forms/templates/:id/clone
   - PUT /api/v1/forms/templates/:id/status

**Deliverables**:
- ✅ Version history view
- ✅ Clone forms
- ✅ Activate/archive forms
- ✅ Lock previous versions

### Phase 4: Integration (Week 3)
**Goal**: Connect form library to existing systems

**Tasks**:
1. Update FormConstants.js to pull from database
2. Integration with CRF Builder (import from library)
3. Integration with StatusChangeModal (use library forms)
4. Update form_definitions table to match new schema
5. Migrate existing forms to new structure

**Deliverables**:
- ✅ FormConstants.js dynamically loaded
- ✅ CRF Builder can import library forms
- ✅ StatusChangeModal uses library forms
- ✅ Existing forms migrated

---

## 📊 Success Metrics

### User Adoption
- Number of forms in library (target: 20+ templates)
- Number of form clones created (indicates reuse)
- Percentage of studies using library forms vs creating new (target: 70%+)

### Efficiency
- Time to create new form (target: 30% reduction)
- Number of duplicate forms (target: 50% reduction)
- Form reuse rate (target: 3+ studies per template)

### Quality
- Number of forms with complete CDASH mappings
- Number of forms with validation rules
- Form completion rate (filled vs abandoned)

---

## 🚧 Dependencies & Risks

### Dependencies
✅ Form data capture backend (COMPLETE - Week 2)  
✅ FormConstants.js (COMPLETE - Week 2)  
✅ form_definitions table (EXISTS - needs enhancement)  
⏳ Subject Management Phase 1 (should complete first)

### Risks
| Risk | Mitigation |
|------|------------|
| **Complex UI/UX** - Form builder is complex | Start with basic fields, iterate with user feedback |
| **Performance** - Large form library may be slow | Implement pagination, lazy loading, caching |
| **Data Migration** - Existing forms may not fit new schema | Write migration script with validation |
| **User Adoption** - Users may resist new system | Provide training, documentation, and support |

---

## 📚 References

### Related Documents
- `FormConstants.js` - Current form configuration
- `FORM_DATA_CONFIGURATION_GUIDE.md` - Form data capture system
- `WEEK_2_COMPLETE_SUMMARY.md` - Form capture backend implementation
- `PHASE_6F_ROLLBACK_AND_ENHANCEMENT_COMPLETE.md` - CRF Builder enhancement

### Similar Systems
- **REDCap**: Online survey and database builder
- **Qualtrics**: Survey platform with drag-and-drop builder
- **SurveyMonkey**: Form builder with templates
- **Formstack**: Form builder for data collection

---

## 🎯 Next Steps

1. **Add to Backlog**: Include in product backlog with Medium priority
2. **Schedule After Week 4**: Plan for implementation after Subject Management Phase 1
3. **User Research**: Interview CRCs and study coordinators to understand form template needs
4. **UI/UX Design**: Create detailed mockups and user flows
5. **Technical Spike**: Investigate drag-and-drop libraries (React DnD, react-beautiful-dnd)
6. **Database Schema**: Finalize form_definitions table enhancements

---

**Status**: 📋 Backlog  
**Priority**: Medium  
**Estimated Effort**: 2-3 weeks  
**Target Start**: After Subject Management Phase 1 (November 2025)  
**Dependencies**: None (form capture backend complete)

---

*This feature will complete the form management ecosystem by providing a user-friendly way to create, manage, and reuse form templates across the ClinPrecision platform.*
