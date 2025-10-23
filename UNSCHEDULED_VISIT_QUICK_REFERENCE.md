# Unscheduled Visit Form Management - Quick Reference

**Date:** October 22, 2025  
**Status:** ✅ Complete - Option 1 Implementation  
**Files Created:** 2 (Guide + Helper Utility)

---

## What Was Implemented

**Option 1: Using Existing API** - No backend changes required! ✅

### Files Created

1. **UNSCHEDULED_VISIT_FORM_MANAGEMENT_GUIDE.md** (1000+ lines)
   - Complete architecture overview
   - Step-by-step process
   - API reference
   - Database schema explanation
   - Code examples
   - Testing guide

2. **frontend/src/utils/visitFormHelpers.js** (300+ lines)
   - Ready-to-use helper functions
   - Predefined form sets
   - Validation utilities
   - Comprehensive JSDoc

---

## Quick Start

### 1. Import the Helper

```javascript
import { createUnscheduledVisitWithForms } from '../utils/visitFormHelpers';
```

### 2. Create Visit with Forms

```javascript
const visit = await createUnscheduledVisitWithForms(
  {
    patientId: 123,
    studyId: 456,
    siteId: 789,
    visitType: 'SCREENING',
    visitDate: '2025-10-22',
    createdBy: currentUser.id,
    notes: 'Initial screening visit'
  },
  [101, 102, 103]  // Form IDs: Demographics, Vitals, Labs
);

console.log('Visit created with', visit.forms.length, 'forms');
```

### 3. Or Use Predefined Form Sets

```javascript
import { createScreeningVisit } from '../utils/visitFormHelpers';

const visit = await createScreeningVisit({
  patientId: 123,
  studyId: 456,
  siteId: 789,
  visitDate: '2025-10-22',
  createdBy: currentUser.id,
  notes: 'Patient meets initial criteria'
});
```

---

## How It Works

### Architecture

```
Protocol Visits (from schedule)
├─ visit_id → visit_definitions (NOT NULL)
├─ Forms inherited from visit_forms table
└─ Window config copied during enrollment

Unscheduled Visits (ad-hoc)
├─ visit_id = NULL (no link to visit_definitions)
├─ Forms manually assigned via API
└─ Stored in visit_forms with visit_uuid
```

### API Flow

```
1. POST /api/visits/unscheduled
   → Creates visit, returns visitUuid

2. POST /api/studies/{id}/visits/{visitUuid}/forms/{formId}
   → Assigns form to visit (repeat for each form)

3. GET /api/subjects/{id}/visits/{visitUuid}
   → Retrieves visit with forms[] array
```

---

## Available Functions

### Core Functions

```javascript
// Create visit + assign forms
createUnscheduledVisitWithForms(visitData, formIds)

// Add single form to existing visit
addFormToVisit(studyId, visitUuid, formId, options)

// Add multiple forms to existing visit
addMultipleFormsToVisit(studyId, visitUuid, formIds)
```

### Convenience Functions

```javascript
// Create screening visit with standard forms
createScreeningVisit(visitData)

// Create enrollment visit with standard forms
createEnrollmentVisit(visitData)

// Create adverse event visit with standard forms
createAdverseEventVisit(visitData)

// Create discontinuation visit with standard forms
createDiscontinuationVisit(visitData)
```

### Utility Functions

```javascript
// Get standard forms for a visit type
getStandardFormsForVisitType('SCREENING')

// Validate visit data before creation
validateVisitData(visitData)
```

---

## Predefined Form Sets

Update `STANDARD_FORM_SETS` in `visitFormHelpers.js` to match your form IDs:

```javascript
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
  
  // ... ADVERSE_EVENT, DISCONTINUATION
};
```

---

## Advanced Usage

### Custom Form Configuration

```javascript
const visit = await createUnscheduledVisitWithForms(
  visitData,
  [
    {
      id: 101,
      isRequired: true,
      displayOrder: 1,
      instructions: 'Complete demographics first',
      timing: 'ANY_TIME'
    },
    {
      id: 102,
      isRequired: true,
      displayOrder: 2,
      instructions: 'Record vitals during visit',
      timing: 'DURING_VISIT'
    },
    {
      id: 103,
      isRequired: false,
      displayOrder: 3,
      isConditional: true,
      conditionalLogic: '{"showIf": {"age": ">= 65"}}',
      timing: 'POST_VISIT'
    }
  ]
);
```

### Timing Options

- `PRE_VISIT` - Must be completed before visit date
- `DURING_VISIT` - Completed during visit
- `POST_VISIT` - Completed after visit
- `ANY_TIME` - No timing restriction (default)

---

## Database Schema

### visit_forms Table

```sql
CREATE TABLE visit_forms (
    id BIGSERIAL PRIMARY KEY,
    aggregate_uuid UUID NOT NULL,
    assignment_uuid UUID NOT NULL UNIQUE,
    
    -- ONE of these is set:
    visit_definition_id BIGINT,  -- For protocol visits
    visit_uuid UUID,              -- For unscheduled visits ← NEW!
    
    form_definition_id BIGINT NOT NULL,
    display_order INT,
    is_required BOOLEAN,
    is_conditional BOOLEAN,
    timing VARCHAR(50),
    instructions TEXT,
    
    CONSTRAINT chk_visit_link CHECK (
        (visit_definition_id IS NOT NULL AND visit_uuid IS NULL) OR
        (visit_definition_id IS NULL AND visit_uuid IS NOT NULL)
    )
);
```

**Key Index:**
```sql
CREATE INDEX idx_visit_forms_visit_uuid 
ON visit_forms(visit_uuid) 
WHERE is_deleted = FALSE;
```

---

## Testing

### Manual Test

```bash
# 1. Create visit
curl -X POST http://localhost:8080/api/visits/unscheduled \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "studyId": 456,
    "siteId": 789,
    "visitType": "SCREENING",
    "visitDate": "2025-10-22",
    "createdBy": 1
  }'

# 2. Assign form
curl -X POST http://localhost:8080/api/studies/456/visits/{visitUuid}/forms/101 \
  -H "Content-Type: application/json" \
  -d '{"isRequired": true, "displayOrder": 1}'

# 3. Verify
curl http://localhost:8080/api/subjects/123/visits/{visitUuid}
```

### Database Verification

```sql
-- Check visit created
SELECT * FROM study_visit_instances 
WHERE visit_uuid = '{visitUuid}';
-- Expected: visit_id IS NULL

-- Check forms assigned
SELECT vf.*, fd.name
FROM visit_forms vf
JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.visit_uuid = '{visitUuid}'
ORDER BY vf.display_order;
```

---

## Migration Notes

### For Existing Code

**Before (manual API calls):**
```javascript
// Create visit
const visitResp = await axios.post('/api/visits/unscheduled', visitData);
const visitUuid = visitResp.data.visitId;

// Manually assign each form
await axios.post(`/api/studies/${studyId}/visits/${visitUuid}/forms/101`, {...});
await axios.post(`/api/studies/${studyId}/visits/${visitUuid}/forms/102`, {...});
await axios.post(`/api/studies/${studyId}/visits/${visitUuid}/forms/103`, {...});

// Fetch visit details
const visit = await axios.get(`/api/subjects/${patientId}/visits/${visitUuid}`);
```

**After (using helper):**
```javascript
import { createUnscheduledVisitWithForms } from '../utils/visitFormHelpers';

const visit = await createUnscheduledVisitWithForms(visitData, [101, 102, 103]);
// Done! Visit created with forms in one call
```

---

## Next Steps

### Recommended Actions

1. ✅ **Update STANDARD_FORM_SETS** in `visitFormHelpers.js` with your actual form IDs
2. ✅ **Test helper functions** with your API endpoints
3. ✅ **Create UI component** using `CreateUnscheduledVisitModal.jsx` example from guide
4. ✅ **Add to existing workflows** where unscheduled visits are created
5. ✅ **Document for team** - share guide with developers

### Optional Enhancements

- Create React component for form selection UI
- Add form search/filter functionality
- Implement form templates/presets
- Add bulk form assignment
- Create visit duplication feature

---

## Documentation References

📄 **UNSCHEDULED_VISIT_FORM_MANAGEMENT_GUIDE.md** - Complete guide (1000+ lines)
- Architecture overview
- API reference
- Code examples
- Testing procedures

📄 **visitFormHelpers.js** - Helper utility (300+ lines)
- Ready-to-use functions
- Comprehensive JSDoc
- Input validation
- Error handling

📄 **Related:**
- `UnscheduledVisitService.java` - Backend service (line 97)
- `StudyCommandController.java` - API endpoint (line 1133)
- `VisitFormRepository.java` - Database queries (line 150, 155)

---

## Why Option 1?

✅ **No backend changes** - Uses existing, working API  
✅ **Flexible** - Can add/remove forms after visit creation  
✅ **Follows patterns** - Consistent with current architecture  
✅ **Well tested** - API already in production use  
✅ **Quick implementation** - Helper utility ready to use  
✅ **Easy to extend** - Add custom form sets as needed  

---

## Summary

**Problem:** "How am I going to add form to Unscheduled Visit?"

**Solution:** Use existing API with helper utilities

**Implementation:**
- Created comprehensive guide (1000+ lines)
- Created helper utility (300+ lines)
- Documented API flow
- Provided code examples
- Ready to use immediately

**No backend changes required!** ✅

---

**Created:** October 22, 2025  
**Status:** ✅ Complete and Ready to Use  
**Related:** Gap #4 Visit Window Compliance, Patient Visit Management
