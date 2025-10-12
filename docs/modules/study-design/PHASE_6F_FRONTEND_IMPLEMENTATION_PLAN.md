# Phase 6F: Frontend Components Implementation Plan

**Status**: 🟡 In Progress  
**Started**: October 11, 2025  
**Target**: October 13, 2025  
**Duration**: 8-10 hours  
**Priority**: HIGH - Enables Phase 6 backend features

---

## 📋 Overview

Phase 6F implements 5 comprehensive React components to expose the Phase 6E service layer functionality to end users. These components enable clinical study designers to configure field-level metadata, plan SDV/review workflows, configure medical coding, export CDASH/SDTM mappings, and monitor regulatory compliance.

**Backend Foundation** (Already Complete ✅):
- StudyFieldMetadataService.java (485 lines)
- StudyMetadataQueryController.java (10 REST endpoints)
- 4 complete DTOs (FieldMetadataDTO, CdashMappingDTO, MedicalCodingConfigDTO)

---

## 🎯 Components to Build

### 1. FieldMetadataPanel.jsx (2-3 hours)
**Purpose**: Display and edit comprehensive field-level metadata

**Location**: `frontend/clinprecision/src/components/study-design/metadata/FieldMetadataPanel.jsx`

**Features**:
- Display all metadata categories (Clinical, Regulatory, Audit Trail, Data Entry)
- Inline editing of metadata flags
- Validation rules display
- Real-time save to backend
- Integration with CRFBuilderIntegration.jsx

**API Integration**:
- GET `/api/study-metadata/{studyId}/fields/{formId}/{fieldName}` - Fetch field metadata
- PUT `/api/study-metadata/{studyId}/fields/{formId}/{fieldName}` - Update metadata
- POST `/api/study-metadata/{studyId}/fields/validate` - Validate metadata

**UI Sections**:
```
┌─────────────────────────────────────────┐
│ Field Metadata: ae_adverse_event_term   │
├─────────────────────────────────────────┤
│ 📋 Clinical Flags                       │
│   ☑ SDV Required                        │
│   ☑ Medical Review Required             │
│   ☑ Critical Data Point                 │
│   ☑ Safety Data Point                   │
│   ☐ Efficacy Data Point                 │
│                                          │
│ 🏛️ Regulatory Flags                     │
│   ☑ FDA Required                        │
│   ☐ EMA Required                        │
│   ☑ 21 CFR Part 11                      │
│   ☑ GCP Required                        │
│                                          │
│ 📝 Audit Trail Configuration            │
│   Level: FULL ▼                         │
│   ☑ Electronic Signature Required       │
│   ☑ Reason for Change Required          │
│                                          │
│ ⌨️ Data Entry Configuration             │
│   ☐ Derived Field                       │
│   Formula: [empty]                      │
│   ☑ Query Enabled                       │
│   ☐ Editable After Lock                 │
│                                          │
│ [Save Changes] [Cancel] [Reset]         │
└─────────────────────────────────────────┘
```

**State Management**:
```javascript
const [metadata, setMetadata] = useState(null);
const [loading, setLoading] = useState(false);
const [validationErrors, setValidationErrors] = useState([]);
const [isDirty, setIsDirty] = useState(false);
```

**Key Functions**:
- `fetchFieldMetadata(studyId, formId, fieldName)`
- `updateMetadata(section, field, value)`
- `validateMetadata(metadata)`
- `saveMetadata()`
- `handleCheckboxChange(section, flag)`
- `handleDropdownChange(section, field, value)`

---

### 2. SdvWorkflowComponent.jsx (2 hours)
**Purpose**: Plan and configure SDV (Source Data Verification) workflows

**Location**: `frontend/clinprecision/src/components/study-design/metadata/SdvWorkflowComponent.jsx`

**Features**:
- Display all SDV-required fields by form
- Calculate SDV burden (% of fields requiring SDV)
- Configure SDV sampling strategy
- Generate SDV plan document
- Export SDV checklist

**API Integration**:
- GET `/api/study-metadata/{studyId}/sdv-required` - Get all SDV fields
- GET `/api/study-metadata/{studyId}/metadata-summary` - Get summary statistics
- GET `/api/study-metadata/{studyId}/critical-fields` - Get critical data points

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│ SDV Workflow Planning - Study XYZ-123           │
├─────────────────────────────────────────────────┤
│ 📊 SDV Coverage Summary                         │
│   Total Fields: 487                             │
│   SDV Required: 243 (49.9%)                     │
│   Critical w/ SDV: 87 (100%)                    │
│   Compliance Level: EXCELLENT ✅                │
│                                                  │
│ 📋 SDV-Required Fields by Form                  │
│   ┌─ Adverse Events (23 fields)                │
│   │  ☑ ae_adverse_event_term (Critical)        │
│   │  ☑ ae_start_date (Critical)                │
│   │  ☑ ae_severity (Safety)                    │
│   │  ☑ ae_related_to_study_drug (Safety)       │
│   │  ...                                        │
│   │                                             │
│   ┌─ Vital Signs (12 fields)                   │
│   │  ☑ vs_systolic_bp (Critical)               │
│   │  ☑ vs_diastolic_bp (Critical)              │
│   │  ...                                        │
│                                                  │
│ [Generate SDV Plan] [Export Checklist]          │
└─────────────────────────────────────────────────┘
```

**Key Functions**:
- `fetchSdvFields(studyId)`
- `calculateSdvBurden()`
- `groupFieldsByForm()`
- `generateSdvPlan()`
- `exportSdvChecklist()`

---

### 3. MedicalCodingComponent.jsx (2 hours)
**Purpose**: Configure medical coding (MedDRA, WHO Drug) for study fields

**Location**: `frontend/clinprecision/src/components/study-design/metadata/MedicalCodingComponent.jsx`

**Features**:
- Display all fields requiring medical coding
- Configure dictionary type and version
- Set auto-coding thresholds
- Define coding workflow (single/dual/adjudication)
- Configure verbatim text capture

**API Integration**:
- GET `/api/study-metadata/{studyId}/medical-coding` - Get all coding configs
- POST `/api/study-metadata/{studyId}/medical-coding` - Create config
- PUT `/api/study-metadata/{studyId}/medical-coding/{id}` - Update config

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│ Medical Coding Configuration                    │
├─────────────────────────────────────────────────┤
│ 📋 Fields Requiring Medical Coding              │
│                                                  │
│ Adverse Events Form                             │
│ ┌─ ae_adverse_event_term                        │
│ │  Dictionary: MedDRA v26.0 ▼                   │
│ │  Coding Level: PT (Preferred Term) ▼          │
│ │  ☑ Auto-coding Enabled (80% threshold)        │
│ │  ☑ Manual Review Required                     │
│ │  Workflow: Dual Coder + Adjudication ▼        │
│ │  Primary Coder: Medical Coder ▼               │
│ │  Secondary Coder: Senior Medical Coder ▼      │
│ │  Adjudicator: Medical Director ▼              │
│ │  ☑ Capture Primary SOC                        │
│ │  Max Matches: 10                              │
│ │  [Edit] [Delete]                              │
│                                                  │
│ Concomitant Medications Form                    │
│ ┌─ cm_medication_name                           │
│ │  Dictionary: WHO Drug Dictionary B3 ▼         │
│ │  ...                                          │
│                                                  │
│ [Add New Coding Config]                         │
└───────────────────────────────────────────────��─┘
```

**Key Functions**:
- `fetchCodingConfigs(studyId)`
- `createCodingConfig(config)`
- `updateCodingConfig(id, config)`
- `deleteCodingConfig(id)`
- `validateCodingWorkflow(workflow)`

---

### 4. CdashExportDialog.jsx (1-2 hours)
**Purpose**: Export CDASH/SDTM mappings for regulatory submission

**Location**: `frontend/clinprecision/src/components/study-design/metadata/CdashExportDialog.jsx`

**Features**:
- Display all CDASH/SDTM mappings
- Filter by domain (AE, VS, CM, etc.)
- Export to Excel/CSV for define.xml generation
- Validate mappings completeness
- Generate mapping report

**API Integration**:
- GET `/api/study-metadata/{studyId}/cdash-mappings` - Get all mappings
- GET `/api/study-metadata/{studyId}/cdash-mappings/{domain}` - Get by domain
- GET `/api/study-metadata/{studyId}/cdash-mappings/grouped` - Grouped by domain

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│ CDASH/SDTM Export                               │
├─────────────────────────────────────────────────┤
│ Filter by Domain: All ▼                         │
│                                                  │
│ 📊 Mapping Summary                              │
│   Total Mappings: 487                           │
│   Complete: 487 (100%)                          │
│   Missing SDTM Variable: 0                      │
│   Missing Terminology: 0                        │
│                                                  │
│ 📋 CDASH/SDTM Mappings by Domain                │
│   AE (Adverse Events) - 23 mappings             │
│   VS (Vital Signs) - 12 mappings                │
│   CM (Concomitant Meds) - 18 mappings           │
│   LB (Laboratory) - 87 mappings                 │
│   ...                                           │
│                                                  │
│ Export Format:                                  │
│   ○ Excel (.xlsx) - For define.xml generation   │
│   ○ CSV (.csv) - For import to other systems    │
│   ○ JSON (.json) - For API integration          │
│                                                  │
│ [Export] [Cancel] [Preview]                     │
└─────────────────────────────────────────────────┘
```

**Key Functions**:
- `fetchCdashMappings(studyId, domain)`
- `exportToExcel(mappings)`
- `exportToCsv(mappings)`
- `exportToJson(mappings)`
- `validateMappingsCompleteness(mappings)`

---

### 5. RegulatoryDashboard.jsx (2 hours)
**Purpose**: Monitor regulatory compliance and generate reports

**Location**: `frontend/clinprecision/src/components/study-design/metadata/RegulatoryDashboard.jsx`

**Features**:
- Display compliance summary
- Show FDA/EMA required fields coverage
- Calculate SDV coverage percentages
- Generate compliance report
- Identify compliance gaps

**API Integration**:
- GET `/api/study-metadata/{studyId}/metadata-summary` - Summary statistics
- GET `/api/study-metadata/{studyId}/compliance-report` - Compliance report
- GET `/api/study-metadata/{studyId}/fda-required` - FDA required fields
- GET `/api/study-metadata/{studyId}/ema-required` - EMA required fields

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│ Regulatory Compliance Dashboard                 │
├─────────────────────────────────────────────────┤
│ 📊 Compliance Summary                           │
│   Overall Level: EXCELLENT ✅                   │
│   Last Updated: Oct 11, 2025 17:30 EST         │
│                                                  │
│ 🎯 Key Metrics                                  │
│   ┌─────────────────────────────────┐          │
│   │ SDV Coverage         │ 75.2%    │ ✅       │
│   │ Critical SDV         │ 100%     │ ✅       │
│   │ FDA Required Fields  │ 127      │ ✅       │
│   │ CDASH Mappings       │ 487      │ ✅       │
│   │ Medical Coding       │ 41       │ ✅       │
│   └─────────────────────────────────┘          │
│                                                  │
│ 📋 Compliance Details                           │
│   ✅ All critical data points have SDV          │
│   ✅ All FDA required fields configured         │
│   ✅ All safety fields have review              │
│   ✅ Electronic signatures configured           │
│   ✅ Audit trail enabled for critical data      │
│                                                  │
│ 🔍 Recommendations                              │
│   (No issues found)                             │
│                                                  │
│ [Generate Report] [Export PDF] [View Details]   │
└─────────────────────────────────────────────────┘
```

**Key Functions**:
- `fetchComplianceReport(studyId)`
- `calculateComplianceLevel()`
- `identifyComplianceGaps()`
- `generateComplianceReport()`
- `exportReportToPdf()`

---

## 📁 File Structure

```
frontend/clinprecision/src/
└── components/
    └── study-design/
        └── metadata/
            ├── FieldMetadataPanel.jsx (NEW)
            ├── SdvWorkflowComponent.jsx (NEW)
            ├── MedicalCodingComponent.jsx (NEW)
            ├── CdashExportDialog.jsx (NEW)
            ├── RegulatoryDashboard.jsx (NEW)
            └── MetadataStyles.css (NEW - shared styles)
```

---

## 🔗 Integration Points

### 1. CRFBuilderIntegration.jsx
Add metadata panel to form designer:
```javascript
// Add to field edit mode
{showFieldMetadata[field.id] && (
  <FieldMetadataPanel
    studyId={studyId}
    formId={formId}
    fieldName={field.name}
    onSave={(metadata) => handleMetadataSave(field.id, metadata)}
    onClose={() => toggleFieldMetadata(field.id)}
  />
)}
```

### 2. StudyDatabaseBuildComponent.jsx
Add metadata validation to database build:
```javascript
// Pre-build validation
const metadataValid = await validateStudyMetadata(studyId);
if (!metadataValid) {
  showMetadataWarnings();
}
```

### 3. Study Navigation Menu
Add new menu items:
```javascript
const metadataMenuItems = [
  { label: 'SDV Planning', component: <SdvWorkflowComponent /> },
  { label: 'Medical Coding', component: <MedicalCodingComponent /> },
  { label: 'CDASH Export', component: <CdashExportDialog /> },
  { label: 'Compliance Dashboard', component: <RegulatoryDashboard /> }
];
```

---

## 🎨 Shared Styles

Create `MetadataStyles.css`:
```css
/* Metadata Panel Container */
.metadata-panel {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Section Headers */
.metadata-section-header {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Flag Checkboxes */
.metadata-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 0;
}

.metadata-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Compliance Badges */
.compliance-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.compliance-excellent {
  background: #d4edda;
  color: #155724;
}

.compliance-good {
  background: #d1ecf1;
  color: #0c5460;
}

.compliance-acceptable {
  background: #fff3cd;
  color: #856404;
}

.compliance-needs-improvement {
  background: #f8d7da;
  color: #721c24;
}

/* Metric Cards */
.metric-card {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.metric-label {
  font-weight: 500;
  color: #495057;
}

.metric-value {
  font-weight: 600;
  color: #2c3e50;
}

/* Export Dialog */
.export-dialog {
  min-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

/* Validation Errors */
.validation-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// FieldMetadataPanel.test.jsx
describe('FieldMetadataPanel', () => {
  it('renders all metadata sections', () => {});
  it('updates clinical flags correctly', () => {});
  it('validates metadata on save', () => {});
  it('displays validation errors', () => {});
});

// SdvWorkflowComponent.test.jsx
describe('SdvWorkflowComponent', () => {
  it('calculates SDV burden correctly', () => {});
  it('groups fields by form', () => {});
  it('generates SDV plan', () => {});
});

// MedicalCodingComponent.test.jsx
describe('MedicalCodingComponent', () => {
  it('creates coding configuration', () => {});
  it('validates workflow type', () => {});
  it('handles dictionary selection', () => {});
});

// CdashExportDialog.test.jsx
describe('CdashExportDialog', () => {
  it('exports to Excel format', () => {});
  it('filters by domain', () => {});
  it('validates mappings completeness', () => {});
});

// RegulatoryDashboard.test.jsx
describe('RegulatoryDashboard', () => {
  it('displays compliance summary', () => {});
  it('calculates compliance level', () => {});
  it('generates compliance report', () => {});
});
```

### Integration Tests
```javascript
describe('Phase 6F Integration', () => {
  it('metadata panel integrates with form designer', () => {});
  it('SDV workflow uses backend API', () => {});
  it('CDASH export generates valid files', () => {});
  it('compliance dashboard reflects backend data', () => {});
});
```

---

## 📋 Implementation Checklist

### Component 1: FieldMetadataPanel.jsx
- [ ] Create component file
- [ ] Implement state management
- [ ] Build clinical flags section
- [ ] Build regulatory flags section
- [ ] Build audit trail configuration
- [ ] Build data entry configuration
- [ ] Add API integration (fetch, update, validate)
- [ ] Add validation logic
- [ ] Add save/cancel handlers
- [ ] Style component
- [ ] Write unit tests
- [ ] Integrate with CRFBuilderIntegration

### Component 2: SdvWorkflowComponent.jsx
- [ ] Create component file
- [ ] Implement state management
- [ ] Fetch SDV-required fields
- [ ] Calculate SDV burden
- [ ] Group fields by form
- [ ] Build summary section
- [ ] Build fields list section
- [ ] Add export functionality
- [ ] Style component
- [ ] Write unit tests

### Component 3: MedicalCodingComponent.jsx
- [ ] Create component file
- [ ] Implement state management
- [ ] Fetch coding configurations
- [ ] Build configuration form
- [ ] Add dictionary selection
- [ ] Add workflow configuration
- [ ] Add CRUD operations
- [ ] Add validation
- [ ] Style component
- [ ] Write unit tests

### Component 4: CdashExportDialog.jsx
- [ ] Create component file
- [ ] Implement state management
- [ ] Fetch CDASH mappings
- [ ] Build summary section
- [ ] Build mappings list
- [ ] Add domain filtering
- [ ] Implement Excel export
- [ ] Implement CSV export
- [ ] Implement JSON export
- [ ] Style component
- [ ] Write unit tests

### Component 5: RegulatoryDashboard.jsx
- [ ] Create component file
- [ ] Implement state management
- [ ] Fetch compliance report
- [ ] Build compliance summary
- [ ] Build metrics cards
- [ ] Build recommendations section
- [ ] Add report generation
- [ ] Add PDF export
- [ ] Style component
- [ ] Write unit tests

### Integration & Polish
- [ ] Create shared MetadataStyles.css
- [ ] Integrate all components with navigation
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add tooltips and help text
- [ ] Test cross-component interactions
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation

---

## 🚀 Implementation Order

1. **FieldMetadataPanel.jsx** (3 hours) - HIGHEST PRIORITY
   - Most frequently used
   - Foundation for other components
   - Integrates directly with form designer

2. **RegulatoryDashboard.jsx** (2 hours) - HIGH PRIORITY
   - Executive-level view
   - Demonstrates Phase 6 value
   - Uses read-only APIs (simpler)

3. **SdvWorkflowComponent.jsx** (2 hours) - MEDIUM PRIORITY
   - Supports clinical operations
   - Builds on FieldMetadataPanel

4. **MedicalCodingComponent.jsx** (2 hours) - MEDIUM PRIORITY
   - Specialized functionality
   - Used during study setup

5. **CdashExportDialog.jsx** (1-2 hours) - LOWER PRIORITY
   - Used during regulatory submission
   - Can be built last

---

## 📊 Success Criteria

### Phase 6F Complete When:
- ✅ All 5 components implemented
- ✅ All components integrated with backend APIs
- ✅ All components styled and responsive
- ✅ Unit tests written (>80% coverage)
- ✅ Integration tests passing
- ✅ Documentation complete
- ✅ User acceptance testing passed

### User Can:
- ✅ View and edit field-level metadata from form designer
- ✅ Plan SDV workflows with burden calculations
- ✅ Configure medical coding for verbatim fields
- ✅ Export CDASH/SDTM mappings to Excel/CSV
- ✅ Monitor regulatory compliance with dashboard
- ✅ Generate compliance reports

---

## 📅 Timeline

**Day 1 (Oct 11)**: 4 hours
- 09:00-12:00: FieldMetadataPanel.jsx (complete)
- 13:00-14:00: RegulatoryDashboard.jsx (start)

**Day 2 (Oct 12)**: 4 hours
- 09:00-11:00: RegulatoryDashboard.jsx (complete)
- 11:00-13:00: SdvWorkflowComponent.jsx (complete)

**Day 3 (Oct 13)**: 4 hours
- 09:00-11:00: MedicalCodingComponent.jsx (complete)
- 11:00-12:00: CdashExportDialog.jsx (complete)
- 12:00-13:00: Integration, testing, polish

**Target Completion**: October 13, 2025 EOD

---

## 🎉 Phase 6 Completion

After Phase 6F completion:
- **Study Design Module**: 100% ✅
- **Phase 6 Item-Level Metadata**: 100% ✅
- **Overall System Progress**: 42%
- **Next Priority**: Subject Management Week 2 OR Fix Phase 6 bugs

---

**Status**: 🟡 Ready to Start  
**Owner**: Frontend Team  
**Reviewer**: Clinical Operations Team  
**Dependencies**: Phase 6E (Complete ✅)
