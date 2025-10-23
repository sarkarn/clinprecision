# Unscheduled Visit Form Management Guide

**Created:** October 22, 2025  
**Purpose:** Complete guide for adding forms to unscheduled visits using existing API  
**Related:** Gap #4 Visit Window Compliance, UnscheduledVisitService.java

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Visit Types Comparison](#visit-types-comparison)
3. [Step-by-Step Process](#step-by-step-process)
4. [API Reference](#api-reference)
5. [Frontend Implementation](#frontend-implementation)
6. [Code Examples](#code-examples)
7. [Database Schema](#database-schema)
8. [Testing Guide](#testing-guide)

---

## Architecture Overview

### Two Visit Creation Patterns

**Protocol Visits** (From Study Schedule)
```
Study Design → visit_definitions → Forms Pre-Assigned
                     ↓
Patient Enrollment → Protocol visits auto-created
                     ↓
                Forms inherited from visit_definitions
```

**Unscheduled Visits** (Ad-hoc Events)
```
Event Occurs → Create unscheduled visit
                     ↓
              Manually assign forms
                     ↓
              Forms linked via aggregateUuid
```

### Key Differences

| Aspect | Protocol Visits | Unscheduled Visits |
|--------|----------------|-------------------|
| **Visit ID** | Links to `visit_definitions` (NOT NULL) | NULL (no definition) |
| **Aggregate UUID** | StudyDesign UUID | StudyDesign UUID |
| **Visit UUID** | Visit instance UUID | Visit instance UUID |
| **Form Source** | Inherited from `visit_forms` table | Manually assigned via API |
| **Window Config** | Copied from `visit_definitions` | NULL (no compliance window) |
| **Creation Time** | During patient enrollment | On-demand (screening, AE, etc.) |
| **Examples** | Week 1, Week 2, Week 4, etc. | Screening, Enrollment, Adverse Event |

---

## Visit Types Comparison

### Protocol Visit Example
```sql
-- study_visit_instances
id | subject_id | visit_id | aggregate_uuid | visit_uuid | visit_date | visit_status
1  | 123        | 45       | <study-uuid>   | <v1-uuid>  | 2025-01-29 | SCHEDULED

-- visit_id = 45 links to visit_definitions
SELECT * FROM visit_definitions WHERE id = 45;
-- name: "Week 2 Visit", timepoint: 14, window_before: 2, window_after: 2

-- Forms come from visit_forms table
SELECT * FROM visit_forms WHERE visit_definition_id = 45;
-- Returns: Demographics (101), Vitals (102), Labs (103)
```

### Unscheduled Visit Example
```sql
-- study_visit_instances
id | subject_id | visit_id | aggregate_uuid | visit_uuid | visit_date | visit_status
2  | 123        | NULL     | <study-uuid>   | <v2-uuid>  | 2025-01-15 | COMPLETED

-- visit_id is NULL (no link to visit_definitions)
-- This is a SCREENING visit created before enrollment

-- Forms must be manually assigned
-- They're stored in visit_forms with visit_uuid instead of visit_definition_id
SELECT * FROM visit_forms WHERE visit_uuid = '<v2-uuid>';
-- Returns: (empty until forms are assigned)
```

---

## Step-by-Step Process

### Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREATE UNSCHEDULED VISIT                                     │
│    POST /api/visits/unscheduled                                 │
│    Returns: visitUuid                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ASSIGN FORMS TO VISIT (repeat for each form)                │
│    POST /api/studies/{studyId}/visits/{visitUuid}/forms/{formId}│
│    Body: { isRequired, displayOrder, timing }                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. RETRIEVE VISIT DETAILS                                       │
│    GET /api/subjects/{subjectId}/visits/{visitUuid}             │
│    Returns: visitDetails with forms[]                           │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Steps

#### Step 1: Create Unscheduled Visit

**API Call:**
```http
POST /api/visits/unscheduled
Content-Type: application/json

{
  "patientId": 123,
  "studyId": 456,
  "siteId": 789,
  "visitType": "SCREENING",
  "visitDate": "2025-10-22",
  "createdBy": 1,
  "notes": "Initial screening visit before enrollment"
}
```

**Response:**
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "subjectId": 123,
  "studyId": 456,
  "siteId": 789,
  "visitName": "Unscheduled Visit",
  "visitDate": "2025-10-22",
  "visitStatus": "SCHEDULED",
  "createdAt": "2025-10-22T10:30:00Z"
}
```

**Backend Processing:**
1. `UnscheduledVisitService.createUnscheduledVisit()`
2. Creates `CreateVisitCommand`
3. CommandGateway sends command to `VisitAggregate`
4. `VisitCreatedEvent` fired
5. `VisitProjector` creates record in `study_visit_instances`
6. Record has `visit_id = NULL`, `aggregate_uuid` set, `visit_uuid` generated

#### Step 2: Assign Forms to Visit

**Why Multiple API Calls?**
- Flexibility: Different forms can have different configurations
- Granular control: Each form can be required/optional/conditional
- Display order: Forms can be ordered explicitly
- Timing: Forms can be scheduled for different visit phases

**API Call (for each form):**
```http
POST /api/studies/456/visits/550e8400-e29b-41d4-a716-446655440000/forms/101
Content-Type: application/json

{
  "isRequired": true,
  "isConditional": false,
  "conditionalLogic": null,
  "displayOrder": 1,
  "instructions": "Complete demographics before other forms",
  "timing": "ANY_TIME"
}
```

**Parameters:**
- `isRequired`: true = must be completed, false = optional
- `isConditional`: true = only shown if conditions met
- `conditionalLogic`: JSON expression for conditional display
- `displayOrder`: Order in form list (1, 2, 3...)
- `instructions`: User guidance for form completion
- `timing`: "PRE_VISIT", "DURING_VISIT", "POST_VISIT", "ANY_TIME"

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "studyId": "456",
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "visitDefinitionId": "550e8400-e29b-41d4-a716-446655440000",
  "formId": 101,
  "formDefinitionId": 101,
  "isRequired": true,
  "timing": "ANY_TIME",
  "conditions": []
}
```

**Backend Processing:**
1. `StudyCommandController.assignFormToVisit()`
2. Creates `AssignFormToVisitRequest`
3. `StudyDesignCommandService.assignFormToVisit()`
4. Sends `AssignFormToVisitDefinitionCommand`
5. `FormAssignedToVisitEvent` fired
6. Projector creates record in `visit_forms` table
7. Record has `visit_uuid` set (not `visit_definition_id`)

#### Step 3: Verify Forms Assigned

**API Call:**
```http
GET /api/subjects/123/visits/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "visitName": "Unscheduled Visit",
  "visitDate": "2025-10-22",
  "visitStatus": "SCHEDULED",
  "forms": [
    {
      "id": 101,
      "name": "Demographics",
      "status": "not_started",
      "isRequired": true,
      "displayOrder": 1
    },
    {
      "id": 102,
      "name": "Vital Signs",
      "status": "not_started",
      "isRequired": true,
      "displayOrder": 2
    },
    {
      "id": 103,
      "name": "Laboratory Tests",
      "status": "not_started",
      "isRequired": false,
      "displayOrder": 3
    }
  ],
  "completedForms": 0,
  "totalForms": 3,
  "progressPercentage": 0
}
```

---

## API Reference

### Create Unscheduled Visit

**Endpoint:** `POST /api/visits/unscheduled`

**Request Body:**
```typescript
interface CreateVisitRequest {
  patientId: number;      // Required
  studyId: number;        // Required
  siteId: number;         // Required
  visitType: string;      // SCREENING | ENROLLMENT | DISCONTINUATION | ADVERSE_EVENT
  visitDate: string;      // ISO date: "YYYY-MM-DD"
  createdBy: number;      // User ID
  notes?: string;         // Optional notes
}
```

**Response:**
```typescript
interface VisitResponse {
  visitId: string;        // UUID
  subjectId: number;
  studyId: number;
  siteId: number;
  visitName: string;
  visitDate: string;
  visitStatus: string;    // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  createdAt: string;      // ISO datetime
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/visits/unscheduled \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "studyId": 456,
    "siteId": 789,
    "visitType": "SCREENING",
    "visitDate": "2025-10-22",
    "createdBy": 1,
    "notes": "Initial screening"
  }'
```

### Assign Form to Visit

**Endpoint:** `POST /api/studies/{studyId}/visits/{visitUuid}/forms/{formId}`

**Path Parameters:**
- `studyId`: Study identifier (number or UUID string)
- `visitUuid`: Visit UUID (from createUnscheduledVisit response)
- `formId`: Form definition ID (number)

**Request Body:**
```typescript
interface AssignFormRequest {
  isRequired?: boolean;        // Default: true
  isConditional?: boolean;     // Default: false
  conditionalLogic?: string;   // JSON expression
  displayOrder?: number;       // Auto-calculated if omitted
  instructions?: string;       // User guidance
  timing?: string;            // Default: "ANY_TIME"
}
```

**Timing Options:**
- `PRE_VISIT`: Must be completed before visit date
- `DURING_VISIT`: Completed during visit
- `POST_VISIT`: Completed after visit
- `ANY_TIME`: No timing restriction

**Response:**
```typescript
interface AssignFormResponse {
  id: string;                  // Assignment UUID
  studyId: string;
  visitId: string;
  formId: number;
  isRequired: boolean;
  timing: string;
  conditions: any[];
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/studies/456/visits/550e8400-e29b-41d4-a716-446655440000/forms/101 \
  -H "Content-Type: application/json" \
  -d '{
    "isRequired": true,
    "displayOrder": 1,
    "timing": "ANY_TIME"
  }'
```

### Alternative Endpoints

The API supports both old and new URL patterns:

**Old Pattern (deprecated):**
```
POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}
```

**New Pattern (recommended):**
```
POST /api/v1/study-design/studies/{studyId}/visits/{visitId}/forms/{formId}
```

Both work identically. The old pattern adds deprecation headers to the response.

---

## Frontend Implementation

### React Helper Utility

Create a reusable utility for managing unscheduled visits with forms:

**File:** `frontend/src/utils/visitFormHelpers.js`

```javascript
import axios from 'axios';

/**
 * Create an unscheduled visit and assign forms in a single operation
 * 
 * @param {Object} visitData - Visit creation parameters
 * @param {number} visitData.patientId - Patient ID
 * @param {number} visitData.studyId - Study ID
 * @param {number} visitData.siteId - Site ID
 * @param {string} visitData.visitType - Visit type (SCREENING, ENROLLMENT, etc.)
 * @param {string} visitData.visitDate - Visit date (ISO format)
 * @param {number} visitData.createdBy - User ID
 * @param {string} [visitData.notes] - Optional notes
 * @param {Array<number|Object>} formIds - Array of form IDs or form config objects
 * @returns {Promise<Object>} Complete visit details with forms
 */
export const createUnscheduledVisitWithForms = async (visitData, formIds = []) => {
  try {
    console.log('Creating unscheduled visit...', visitData);
    
    // Step 1: Create the visit
    const visitResponse = await axios.post('/api/visits/unscheduled', visitData);
    const visitUuid = visitResponse.data.visitId;
    
    console.log('Visit created:', visitUuid);
    
    // Step 2: Assign forms if provided
    if (formIds && formIds.length > 0) {
      console.log(`Assigning ${formIds.length} forms to visit...`);
      
      const formAssignments = await Promise.all(
        formIds.map((formConfig, index) => {
          // Handle both simple IDs and config objects
          const formId = typeof formConfig === 'number' ? formConfig : formConfig.id;
          const formSettings = typeof formConfig === 'object' ? formConfig : {};
          
          return axios.post(
            `/api/studies/${visitData.studyId}/visits/${visitUuid}/forms/${formId}`,
            {
              isRequired: formSettings.isRequired !== undefined ? formSettings.isRequired : true,
              isConditional: formSettings.isConditional || false,
              conditionalLogic: formSettings.conditionalLogic || null,
              displayOrder: formSettings.displayOrder !== undefined ? formSettings.displayOrder : index + 1,
              instructions: formSettings.instructions || '',
              timing: formSettings.timing || 'ANY_TIME'
            }
          );
        })
      );
      
      console.log(`${formAssignments.length} forms assigned successfully`);
    }
    
    // Step 3: Fetch complete visit details with forms
    const fullVisitResponse = await axios.get(
      `/api/subjects/${visitData.patientId}/visits/${visitUuid}`
    );
    
    console.log('Visit created with forms:', fullVisitResponse.data);
    return fullVisitResponse.data;
    
  } catch (error) {
    console.error('Error creating unscheduled visit with forms:', error);
    throw error;
  }
};

/**
 * Add a single form to an existing visit
 * 
 * @param {number} studyId - Study ID
 * @param {string} visitUuid - Visit UUID
 * @param {number} formId - Form definition ID
 * @param {Object} options - Form configuration
 * @returns {Promise<Object>} Assignment response
 */
export const addFormToVisit = async (studyId, visitUuid, formId, options = {}) => {
  try {
    const response = await axios.post(
      `/api/studies/${studyId}/visits/${visitUuid}/forms/${formId}`,
      {
        isRequired: options.isRequired !== undefined ? options.isRequired : true,
        isConditional: options.isConditional || false,
        conditionalLogic: options.conditionalLogic || null,
        displayOrder: options.displayOrder,
        instructions: options.instructions || '',
        timing: options.timing || 'ANY_TIME'
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error adding form to visit:', error);
    throw error;
  }
};

/**
 * Add multiple forms to an existing visit
 * 
 * @param {number} studyId - Study ID
 * @param {string} visitUuid - Visit UUID
 * @param {Array<number|Object>} formIds - Array of form IDs or config objects
 * @returns {Promise<Array>} Array of assignment responses
 */
export const addMultipleFormsToVisit = async (studyId, visitUuid, formIds) => {
  try {
    const assignments = await Promise.all(
      formIds.map((formConfig, index) => {
        const formId = typeof formConfig === 'number' ? formConfig : formConfig.id;
        const options = typeof formConfig === 'object' ? formConfig : {};
        
        if (!options.displayOrder) {
          options.displayOrder = index + 1;
        }
        
        return addFormToVisit(studyId, visitUuid, formId, options);
      })
    );
    
    return assignments;
  } catch (error) {
    console.error('Error adding multiple forms to visit:', error);
    throw error;
  }
};

/**
 * Predefined form sets for common visit types
 */
export const STANDARD_FORM_SETS = {
  SCREENING: [
    { id: 101, name: 'Demographics', isRequired: true },
    { id: 102, name: 'Medical History', isRequired: true },
    { id: 103, name: 'Vital Signs', isRequired: true },
    { id: 104, name: 'Inclusion/Exclusion Criteria', isRequired: true },
    { id: 105, name: 'Informed Consent', isRequired: true }
  ],
  
  ENROLLMENT: [
    { id: 106, name: 'Randomization', isRequired: true },
    { id: 107, name: 'Treatment Assignment', isRequired: true },
    { id: 108, name: 'Baseline Assessments', isRequired: true }
  ],
  
  ADVERSE_EVENT: [
    { id: 109, name: 'Adverse Event Report', isRequired: true },
    { id: 110, name: 'Concomitant Medications', isRequired: true },
    { id: 102, name: 'Vital Signs', isRequired: true },
    { id: 111, name: 'Safety Labs', isRequired: false }
  ],
  
  DISCONTINUATION: [
    { id: 112, name: 'Discontinuation Reason', isRequired: true },
    { id: 113, name: 'Final Assessments', isRequired: true },
    { id: 114, name: 'Study Drug Return', isRequired: true }
  ]
};

/**
 * Create a screening visit with standard forms
 */
export const createScreeningVisit = async (visitData) => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'SCREENING' },
    STANDARD_FORM_SETS.SCREENING.map(f => f.id)
  );
};

/**
 * Create an enrollment visit with standard forms
 */
export const createEnrollmentVisit = async (visitData) => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'ENROLLMENT' },
    STANDARD_FORM_SETS.ENROLLMENT.map(f => f.id)
  );
};

/**
 * Create an adverse event visit with standard forms
 */
export const createAdverseEventVisit = async (visitData) => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'ADVERSE_EVENT' },
    STANDARD_FORM_SETS.ADVERSE_EVENT.map(f => f.id)
  );
};
```

### React Component Example

**File:** `frontend/src/components/modules/datacapture/visits/CreateUnscheduledVisitModal.jsx`

```javascript
import React, { useState } from 'react';
import { createUnscheduledVisitWithForms, STANDARD_FORM_SETS } from '../../../../utils/visitFormHelpers';

const CreateUnscheduledVisitModal = ({ patient, study, site, onClose, onSuccess }) => {
  const [visitType, setVisitType] = useState('SCREENING');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get standard forms for selected visit type
  const standardForms = STANDARD_FORM_SETS[visitType] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const visitData = {
        patientId: patient.id,
        studyId: study.id,
        siteId: site.id,
        visitType,
        visitDate,
        createdBy: 1, // TODO: Get from auth context
        notes
      };

      const visit = await createUnscheduledVisitWithForms(visitData, selectedForms);
      
      onSuccess(visit);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create visit');
    } finally {
      setLoading(false);
    }
  };

  const handleFormToggle = (formId) => {
    setSelectedForms(prev =>
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleSelectStandardForms = () => {
    setSelectedForms(standardForms.map(f => f.id));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Unscheduled Visit</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Visit Type */}
          <div className="form-group">
            <label>Visit Type</label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              required
            >
              <option value="SCREENING">Screening</option>
              <option value="ENROLLMENT">Enrollment</option>
              <option value="ADVERSE_EVENT">Adverse Event</option>
              <option value="DISCONTINUATION">Discontinuation</option>
            </select>
          </div>

          {/* Visit Date */}
          <div className="form-group">
            <label>Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional visit notes..."
            />
          </div>

          {/* Form Selection */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label>Forms to Include</label>
              <button
                type="button"
                onClick={handleSelectStandardForms}
                className="btn-sm btn-secondary"
              >
                Use Standard Forms
              </button>
            </div>
            
            <div className="form-checklist">
              {standardForms.map(form => (
                <label key={form.id} className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedForms.includes(form.id)}
                    onChange={() => handleFormToggle(form.id)}
                  />
                  <span>{form.name}</span>
                  {form.isRequired && <span className="badge-required">Required</span>}
                </label>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              {selectedForms.length} form(s) selected
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUnscheduledVisitModal;
```

---

## Code Examples

### Example 1: Simple Screening Visit with Forms

```javascript
import { createUnscheduledVisitWithForms } from './utils/visitFormHelpers';

// Create screening visit with 3 forms
const visit = await createUnscheduledVisitWithForms(
  {
    patientId: 123,
    studyId: 456,
    siteId: 789,
    visitType: 'SCREENING',
    visitDate: '2025-10-22',
    createdBy: 1,
    notes: 'Initial screening visit'
  },
  [101, 102, 103]  // Demographics, Vitals, Labs
);

console.log('Visit created:', visit.visitId);
console.log('Forms assigned:', visit.forms.length);
```

### Example 2: Custom Form Configuration

```javascript
import { createUnscheduledVisitWithForms } from './utils/visitFormHelpers';

// Create visit with custom form configurations
const visit = await createUnscheduledVisitWithForms(
  {
    patientId: 123,
    studyId: 456,
    siteId: 789,
    visitType: 'ADVERSE_EVENT',
    visitDate: '2025-10-22',
    createdBy: 1,
    notes: 'Patient reported headache'
  },
  [
    {
      id: 109,
      isRequired: true,
      displayOrder: 1,
      instructions: 'Complete AE form immediately',
      timing: 'DURING_VISIT'
    },
    {
      id: 102,
      isRequired: true,
      displayOrder: 2,
      instructions: 'Record vital signs',
      timing: 'DURING_VISIT'
    },
    {
      id: 111,
      isRequired: false,
      displayOrder: 3,
      instructions: 'Optional safety labs if warranted',
      timing: 'POST_VISIT'
    }
  ]
);
```

### Example 3: Add Forms to Existing Visit

```javascript
import { addMultipleFormsToVisit } from './utils/visitFormHelpers';

// Visit already created, now add forms
const visitUuid = '550e8400-e29b-41d4-a716-446655440000';
const studyId = 456;

await addMultipleFormsToVisit(studyId, visitUuid, [
  { id: 101, isRequired: true },
  { id: 102, isRequired: true },
  { id: 103, isRequired: false }
]);
```

### Example 4: Using Predefined Form Sets

```javascript
import { createScreeningVisit, createEnrollmentVisit } from './utils/visitFormHelpers';

// Screening visit with standard forms
const screeningVisit = await createScreeningVisit({
  patientId: 123,
  studyId: 456,
  siteId: 789,
  visitDate: '2025-10-15',
  createdBy: 1,
  notes: 'Patient meets initial criteria'
});

// After screening passes, create enrollment visit
const enrollmentVisit = await createEnrollmentVisit({
  patientId: 123,
  studyId: 456,
  siteId: 789,
  visitDate: '2025-10-22',
  createdBy: 1,
  notes: 'Patient randomized to treatment arm A'
});
```

### Example 5: Sequential Form Assignment

```javascript
import { addFormToVisit } from './utils/visitFormHelpers';

const studyId = 456;
const visitUuid = '550e8400-e29b-41d4-a716-446655440000';

// Add forms one at a time with specific configuration
await addFormToVisit(studyId, visitUuid, 101, {
  isRequired: true,
  displayOrder: 1,
  instructions: 'Complete demographics first'
});

await addFormToVisit(studyId, visitUuid, 102, {
  isRequired: true,
  displayOrder: 2,
  timing: 'DURING_VISIT',
  instructions: 'Record vital signs during visit'
});

await addFormToVisit(studyId, visitUuid, 103, {
  isRequired: false,
  displayOrder: 3,
  isConditional: true,
  conditionalLogic: '{"showIf": {"age": ">= 65"}}',
  instructions: 'Complete if patient is 65 or older'
});
```

---

## Database Schema

### visit_forms Table

```sql
CREATE TABLE visit_forms (
    id BIGSERIAL PRIMARY KEY,
    
    -- Event Sourcing Fields
    aggregate_uuid UUID NOT NULL,           -- StudyDesign aggregate UUID
    assignment_uuid UUID NOT NULL UNIQUE,   -- Unique assignment ID
    
    -- Visit Linkage (ONE of these is set)
    visit_definition_id BIGINT,             -- For protocol visits (FK to visit_definitions)
    visit_uuid UUID,                        -- For unscheduled visits (FK to study_visit_instances.visit_uuid)
    
    -- Form Definition
    form_definition_id BIGINT NOT NULL,     -- FK to form_definitions
    
    -- Configuration
    display_order INT NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    is_conditional BOOLEAN DEFAULT FALSE,
    conditional_logic TEXT,
    instructions TEXT,
    timing VARCHAR(50),                     -- PRE_VISIT, DURING_VISIT, POST_VISIT, ANY_TIME
    
    -- Build Tracking
    build_id BIGINT,                        -- FK to study_database_builds
    
    -- Metadata
    assigned_by BIGINT,                     -- User ID who assigned the form
    assigned_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    
    -- Constraints
    CONSTRAINT fk_visit_def FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    CONSTRAINT fk_form_def FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    CONSTRAINT fk_build FOREIGN KEY (build_id) REFERENCES study_database_builds(id),
    
    -- Check: Must have either visit_definition_id OR visit_uuid, not both
    CONSTRAINT chk_visit_link CHECK (
        (visit_definition_id IS NOT NULL AND visit_uuid IS NULL) OR
        (visit_definition_id IS NULL AND visit_uuid IS NOT NULL)
    )
);

-- Index for protocol visits
CREATE INDEX idx_visit_forms_visit_def ON visit_forms(visit_definition_id) WHERE is_deleted = FALSE;

-- Index for unscheduled visits (IMPORTANT!)
CREATE INDEX idx_visit_forms_visit_uuid ON visit_forms(visit_uuid) WHERE is_deleted = FALSE;

-- Index for aggregate queries
CREATE INDEX idx_visit_forms_aggregate ON visit_forms(aggregate_uuid) WHERE is_deleted = FALSE;

-- Index for form lookups
CREATE INDEX idx_visit_forms_form_def ON visit_forms(form_definition_id);
```

### Query Examples

**Find all forms for a protocol visit:**
```sql
SELECT vf.*, fd.name AS form_name, fd.version
FROM visit_forms vf
JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.visit_definition_id = 45
  AND vf.is_deleted = FALSE
ORDER BY vf.display_order;
```

**Find all forms for an unscheduled visit:**
```sql
SELECT vf.*, fd.name AS form_name, fd.version
FROM visit_forms vf
JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.visit_uuid = '550e8400-e29b-41d4-a716-446655440000'
  AND vf.is_deleted = FALSE
ORDER BY vf.display_order;
```

**Count protocol vs unscheduled form assignments:**
```sql
SELECT 
    COUNT(*) FILTER (WHERE visit_definition_id IS NOT NULL) AS protocol_forms,
    COUNT(*) FILTER (WHERE visit_uuid IS NOT NULL) AS unscheduled_forms,
    COUNT(*) AS total_forms
FROM visit_forms
WHERE is_deleted = FALSE;
```

---

## Testing Guide

### Unit Test: Create Unscheduled Visit with Forms

```javascript
describe('visitFormHelpers', () => {
  describe('createUnscheduledVisitWithForms', () => {
    it('should create visit and assign forms', async () => {
      // Mock API responses
      const mockVisitResponse = {
        data: {
          visitId: 'test-visit-uuid',
          subjectId: 123,
          visitDate: '2025-10-22'
        }
      };
      
      const mockFormResponse = {
        data: { id: 'test-assignment-uuid' }
      };
      
      const mockVisitDetailsResponse = {
        data: {
          visitId: 'test-visit-uuid',
          forms: [
            { id: 101, name: 'Demographics' },
            { id: 102, name: 'Vitals' }
          ]
        }
      };
      
      axios.post
        .mockResolvedValueOnce(mockVisitResponse)  // Create visit
        .mockResolvedValueOnce(mockFormResponse)   // Assign form 1
        .mockResolvedValueOnce(mockFormResponse);  // Assign form 2
      
      axios.get.mockResolvedValueOnce(mockVisitDetailsResponse);
      
      // Execute
      const result = await createUnscheduledVisitWithForms(
        {
          patientId: 123,
          studyId: 456,
          siteId: 789,
          visitType: 'SCREENING',
          visitDate: '2025-10-22',
          createdBy: 1
        },
        [101, 102]
      );
      
      // Assert
      expect(result.visitId).toBe('test-visit-uuid');
      expect(result.forms).toHaveLength(2);
      expect(axios.post).toHaveBeenCalledTimes(3);  // 1 visit + 2 forms
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Integration Test: End-to-End Flow

```javascript
describe('Unscheduled Visit Integration', () => {
  let createdVisitId;
  
  it('should create screening visit', async () => {
    const response = await axios.post('/api/visits/unscheduled', {
      patientId: testPatient.id,
      studyId: testStudy.id,
      siteId: testSite.id,
      visitType: 'SCREENING',
      visitDate: '2025-10-22',
      createdBy: testUser.id
    });
    
    expect(response.status).toBe(200);
    expect(response.data.visitId).toBeDefined();
    
    createdVisitId = response.data.visitId;
  });
  
  it('should assign forms to visit', async () => {
    const formIds = [101, 102, 103];
    
    for (let i = 0; i < formIds.length; i++) {
      const response = await axios.post(
        `/api/studies/${testStudy.id}/visits/${createdVisitId}/forms/${formIds[i]}`,
        {
          isRequired: true,
          displayOrder: i + 1
        }
      );
      
      expect(response.status).toBe(201);
    }
  });
  
  it('should retrieve visit with forms', async () => {
    const response = await axios.get(
      `/api/subjects/${testPatient.id}/visits/${createdVisitId}`
    );
    
    expect(response.data.forms).toHaveLength(3);
    expect(response.data.forms[0].id).toBe(101);
    expect(response.data.forms[0].displayOrder).toBe(1);
  });
});
```

### Manual Testing Checklist

**Prerequisites:**
- [ ] Backend service running
- [ ] Database accessible
- [ ] Test patient created
- [ ] Test forms available (IDs: 101, 102, 103)

**Test Steps:**

1. **Create Unscheduled Visit**
   ```bash
   curl -X POST http://localhost:8080/api/visits/unscheduled \
     -H "Content-Type: application/json" \
     -d '{
       "patientId": 123,
       "studyId": 456,
       "siteId": 789,
       "visitType": "SCREENING",
       "visitDate": "2025-10-22",
       "createdBy": 1,
       "notes": "Test screening visit"
     }'
   ```
   - [ ] Returns 200 OK
   - [ ] Response contains `visitId` (UUID)
   - [ ] Database record created in `study_visit_instances`
   - [ ] `visit_id` is NULL
   - [ ] `aggregate_uuid` is set
   - [ ] `visit_uuid` is set

2. **Assign First Form (Demographics)**
   ```bash
   curl -X POST http://localhost:8080/api/studies/456/visits/{visitUuid}/forms/101 \
     -H "Content-Type: application/json" \
     -d '{
       "isRequired": true,
       "displayOrder": 1,
       "timing": "ANY_TIME"
     }'
   ```
   - [ ] Returns 201 Created
   - [ ] Response contains assignment ID
   - [ ] Database record created in `visit_forms`
   - [ ] `visit_uuid` matches visit
   - [ ] `visit_definition_id` is NULL
   - [ ] `form_definition_id` = 101

3. **Assign Second Form (Vitals)**
   ```bash
   curl -X POST http://localhost:8080/api/studies/456/visits/{visitUuid}/forms/102 \
     -H "Content-Type: application/json" \
     -d '{
       "isRequired": true,
       "displayOrder": 2,
       "timing": "DURING_VISIT"
     }'
   ```
   - [ ] Returns 201 Created
   - [ ] `display_order` = 2

4. **Assign Third Form (Labs - Optional)**
   ```bash
   curl -X POST http://localhost:8080/api/studies/456/visits/{visitUuid}/forms/103 \
     -H "Content-Type: application/json" \
     -d '{
       "isRequired": false,
       "displayOrder": 3,
       "timing": "POST_VISIT"
     }'
   ```
   - [ ] Returns 201 Created
   - [ ] `is_required` = false

5. **Retrieve Visit Details**
   ```bash
   curl http://localhost:8080/api/subjects/123/visits/{visitUuid}
   ```
   - [ ] Returns 200 OK
   - [ ] `forms` array contains 3 items
   - [ ] Forms in correct order (by `displayOrder`)
   - [ ] Each form has `isRequired` flag
   - [ ] Form statuses are `not_started`

6. **Verify in UI**
   - [ ] Navigate to patient visit list
   - [ ] Unscheduled visit appears
   - [ ] Click visit to view details
   - [ ] Forms section shows 3 forms
   - [ ] Required badges displayed correctly
   - [ ] Can click to complete forms

**Database Verification:**

```sql
-- Check visit created
SELECT * FROM study_visit_instances 
WHERE visit_uuid = '{visitUuid}';
-- Expected: visit_id IS NULL, aggregate_uuid IS NOT NULL

-- Check forms assigned
SELECT vf.*, fd.name
FROM visit_forms vf
JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.visit_uuid = '{visitUuid}'
ORDER BY vf.display_order;
-- Expected: 3 rows, display_order 1,2,3

-- Verify constraint
SELECT 
    CASE 
        WHEN visit_definition_id IS NOT NULL AND visit_uuid IS NULL THEN 'Protocol Visit'
        WHEN visit_definition_id IS NULL AND visit_uuid IS NOT NULL THEN 'Unscheduled Visit'
        ELSE 'ERROR - Both or neither set'
    END AS visit_type,
    COUNT(*) AS count
FROM visit_forms
GROUP BY visit_type;
```

---

## Summary

### Quick Reference Card

**Create Unscheduled Visit + Forms (JavaScript)**
```javascript
import { createUnscheduledVisitWithForms } from './utils/visitFormHelpers';

const visit = await createUnscheduledVisitWithForms(
  {
    patientId: 123,
    studyId: 456,
    siteId: 789,
    visitType: 'SCREENING',
    visitDate: '2025-10-22',
    createdBy: 1
  },
  [101, 102, 103]  // Form IDs
);
```

**Key Points:**
1. ✅ Unscheduled visits have `visit_id = NULL`
2. ✅ Forms linked via `visit_uuid` (not `visit_definition_id`)
3. ✅ Use existing API: `POST /api/studies/{id}/visits/{uuid}/forms/{formId}`
4. ✅ Forms must be assigned AFTER visit creation
5. ✅ Each form assignment is a separate API call
6. ✅ Auto-calculated `displayOrder` if omitted
7. ✅ Standard form sets available for common visit types

**Files to Use:**
- `visitFormHelpers.js` - Reusable utility functions
- `CreateUnscheduledVisitModal.jsx` - UI component
- Existing API endpoints (no backend changes needed)

---

**Document Complete** ✅
