# Form Data Capture Configuration Guide

**Created:** October 12, 2025  
**Module:** Data Capture  
**Status:** ✅ Implementation Complete

---

## Overview

This guide documents the form data capture configuration system implemented for ClinPrecision. It provides centralized constants, configuration values, and helper functions for the form submission workflow.

---

## 1. Constants File

**Location:** `frontend/clinprecision/src/constants/FormConstants.js`

### Purpose
- Centralize form IDs to avoid magic numbers throughout the codebase
- Define form submission statuses in one place
- Provide default configuration for study and site context
- Offer helper functions for form type validation

### Key Exports

#### FORM_IDS
Maps human-readable names to form definition IDs in the database:

```javascript
export const FORM_IDS = {
  // Pre-enrollment forms (no study/visit context)
  SCREENING_ASSESSMENT: 5,
  ELIGIBILITY_CHECKLIST: 6,
  INFORMED_CONSENT: 7,

  // Study visit forms (require study and visit context)
  BASELINE_VITALS: 10,
  ADVERSE_EVENT: 20,
  CONCOMITANT_MEDICATIONS: 30,
  LABORATORY_RESULTS: 40,
  PROTOCOL_DEVIATION: 50,
  STUDY_COMPLETION: 60,
};
```

#### FORM_STATUS
Lifecycle states for form data:

```javascript
export const FORM_STATUS = {
  DRAFT: 'DRAFT',           // Partially completed, can be edited
  SUBMITTED: 'SUBMITTED',   // Completed and submitted, can be edited
  LOCKED: 'LOCKED',         // Database locked, cannot be edited
  VALIDATED: 'VALIDATED',   // QC validated
  ARCHIVED: 'ARCHIVED'      // Historical record
};
```

#### DEFAULT_STUDY_CONFIG
Default values for study and site context:

```javascript
export const DEFAULT_STUDY_CONFIG = {
  DEFAULT_STUDY_ID: 1,      // Used for pre-enrollment screening forms
  DEFAULT_SITE_ID: null,    // Will be set from authenticated user context
};
```

### Helper Functions

#### `getFormNameById(formId)`
Converts form ID to human-readable name:
```javascript
getFormNameById(5) // Returns: "Screening Assessment"
```

#### `isScreeningForm(formId)`
Checks if form is a pre-enrollment screening form:
```javascript
isScreeningForm(5) // Returns: true
isScreeningForm(10) // Returns: false
```

#### `isVisitForm(formId)`
Checks if form requires visit context:
```javascript
isVisitForm(10) // Returns: true (Baseline Vitals)
isVisitForm(5) // Returns: false (Screening)
```

#### `isValidFormStatus(status)`
Validates form status value:
```javascript
isValidFormStatus('SUBMITTED') // Returns: true
isValidFormStatus('INVALID') // Returns: false
```

---

## 2. Integration in StatusChangeModal

### Imports
```javascript
import { 
  FORM_IDS, 
  FORM_STATUS, 
  DEFAULT_STUDY_CONFIG 
} from '../../../../constants/FormConstants';
```

### Usage Example

**Before (hardcoded values):**
```javascript
const formSubmission = {
  studyId: 1,                    // ❌ Magic number
  formId: 5,                     // ❌ Magic number
  status: 'SUBMITTED',           // ❌ String literal
  // ...
};
```

**After (using constants):**
```javascript
const formSubmission = {
  studyId: DEFAULT_STUDY_CONFIG.DEFAULT_STUDY_ID,  // ✅ Named constant
  formId: FORM_IDS.SCREENING_ASSESSMENT,           // ✅ Named constant
  status: FORM_STATUS.SUBMITTED,                   // ✅ Named constant
  // ...
};
```

---

## 3. Configuration Strategy

### Study Context

**Current Implementation:**
- **Pre-enrollment forms** (screening, eligibility): Use `DEFAULT_STUDY_ID = 1`
- **Post-enrollment forms** (visit forms): Use patient's assigned `studyId`

**Future Enhancement:**
```javascript
// When patient enrollment is implemented:
const studyId = patient.studyId || DEFAULT_STUDY_CONFIG.DEFAULT_STUDY_ID;
```

### Site Context

**Current Implementation:**
- **Default:** `null` (no site specified)
- **Reason:** Authentication context not yet implemented

**Future Enhancement:**
```javascript
// When auth context is available:
import { useAuth } from '../../../../contexts/AuthContext';

const { user } = useAuth();
const siteId = user?.siteId || DEFAULT_STUDY_CONFIG.DEFAULT_SITE_ID;
```

### Form ID Mapping

**Database Requirements:**
1. Create `form_definitions` table with form metadata
2. Populate with standard form types
3. Link form IDs to protocol-specific forms

**Example Schema:**
```sql
CREATE TABLE form_definitions (
  id BIGINT PRIMARY KEY,
  form_name VARCHAR(100) NOT NULL,
  form_type VARCHAR(50) NOT NULL,  -- 'SCREENING', 'VISIT', 'ADVERSE_EVENT'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO form_definitions (id, form_name, form_type) VALUES
  (5, 'Screening Assessment', 'SCREENING'),
  (6, 'Eligibility Checklist', 'SCREENING'),
  (10, 'Baseline Vitals', 'VISIT'),
  (20, 'Adverse Event Report', 'VISIT');
```

---

## 4. Configuration Management Best Practices

### Adding New Forms

**Step 1:** Add to database
```sql
INSERT INTO form_definitions (id, form_name, form_type) 
VALUES (70, 'Study Exit Interview', 'VISIT');
```

**Step 2:** Add to constants
```javascript
// In FormConstants.js
export const FORM_IDS = {
  // ... existing forms
  STUDY_EXIT_INTERVIEW: 70,  // New form
};
```

**Step 3:** Update helper functions
```javascript
export const getFormNameById = (formId) => {
  const formNames = {
    // ... existing mappings
    [FORM_IDS.STUDY_EXIT_INTERVIEW]: 'Study Exit Interview',
  };
  return formNames[formId] || `Form ${formId}`;
};
```

### Environment-Specific Configuration

For different environments (dev, staging, prod), consider:

**Option A: Environment Variables**
```javascript
export const DEFAULT_STUDY_CONFIG = {
  DEFAULT_STUDY_ID: parseInt(process.env.REACT_APP_DEFAULT_STUDY_ID || '1'),
  DEFAULT_SITE_ID: process.env.REACT_APP_DEFAULT_SITE_ID || null,
};
```

**Option B: Config Files**
```javascript
// config/dev.config.js
export default {
  DEFAULT_STUDY_ID: 1,
  DEFAULT_SITE_ID: null,
};

// config/prod.config.js
export default {
  DEFAULT_STUDY_ID: 100,
  DEFAULT_SITE_ID: 1,
};
```

---

## 5. Integration Checklist

### For StatusChangeModal ✅
- [x] Import constants
- [x] Replace `studyId: 1` with `DEFAULT_STUDY_CONFIG.DEFAULT_STUDY_ID`
- [x] Replace `formId: 5` with `FORM_IDS.SCREENING_ASSESSMENT`
- [x] Replace `status: 'SUBMITTED'` with `FORM_STATUS.SUBMITTED`
- [x] Add inline comments explaining configuration choices
- [ ] Future: Get `siteId` from auth context when available

### For Other Components
When integrating form submission in other parts of the application:

1. **Import constants:**
   ```javascript
   import { FORM_IDS, FORM_STATUS } from '../../constants/FormConstants';
   ```

2. **Use named constants:**
   ```javascript
   const formSubmission = {
     formId: FORM_IDS.BASELINE_VITALS,  // Not: formId: 10
     status: FORM_STATUS.DRAFT,          // Not: status: 'DRAFT'
   };
   ```

3. **Validate form type:**
   ```javascript
   if (isVisitForm(formId) && !visitId) {
     throw new Error('Visit context required for this form');
   }
   ```

---

## 6. Maintenance Guidelines

### When to Update Constants

**Add new form:**
1. Database: Insert into `form_definitions`
2. Constants: Add to `FORM_IDS`
3. Helpers: Update `getFormNameById()`
4. Documentation: Update this guide

**Change form status:**
1. Backend: Update `FormDataStatus` enum
2. Frontend: Update `FORM_STATUS` constant
3. Validation: Update `isValidFormStatus()`

**Modify study/site defaults:**
1. Review impact on existing forms
2. Update `DEFAULT_STUDY_CONFIG`
3. Test screening form workflow
4. Update integration tests

### Version Control

**Tag configuration changes:**
```bash
git tag -a form-config-v1.0 -m "Initial form constants configuration"
git push origin form-config-v1.0
```

**Document in changelog:**
```markdown
## [1.0.0] - 2025-10-12
### Added
- FormConstants.js with centralized form configuration
- FORM_IDS constants for all standard forms
- DEFAULT_STUDY_CONFIG for pre-enrollment context
```

---

## 7. Future Enhancements

### Dynamic Form Configuration API

Instead of hardcoded constants, fetch from backend:

```javascript
// services/FormConfigService.js
export const FormConfigService = {
  async getFormDefinitions() {
    const response = await ApiService.get('/api/v1/form-definitions');
    return response.data;
  },
  
  async getActiveFormsByType(formType) {
    const response = await ApiService.get(`/api/v1/form-definitions/type/${formType}`);
    return response.data;
  }
};
```

**Benefits:**
- Protocol-specific forms without code changes
- Dynamic form activation/deactivation
- Multi-site form configuration
- Version-controlled form schemas

### User Context Integration

```javascript
// contexts/UserContext.js
export const useUserContext = () => {
  const { user } = useAuth();
  
  return {
    userId: user?.id,
    siteId: user?.siteId,
    studyId: user?.defaultStudyId,
    permissions: user?.permissions || []
  };
};

// In StatusChangeModal.jsx
const { siteId, studyId } = useUserContext();

const formSubmission = {
  studyId: studyId || DEFAULT_STUDY_CONFIG.DEFAULT_STUDY_ID,
  siteId: siteId || DEFAULT_STUDY_CONFIG.DEFAULT_SITE_ID,
  // ...
};
```

### Protocol-Specific Forms

```javascript
export const getFormIdForProtocol = (protocolId, formType) => {
  const protocolForms = {
    'PROTOCOL-001': {
      SCREENING: 5,
      BASELINE: 10,
      ADVERSE_EVENT: 20
    },
    'PROTOCOL-002': {
      SCREENING: 105,
      BASELINE: 110,
      ADVERSE_EVENT: 120
    }
  };
  
  return protocolForms[protocolId]?.[formType];
};
```

---

## 8. Troubleshooting

### Issue: Form ID not found
**Symptom:** Backend returns 400 Bad Request with "Invalid formId"

**Solution:**
1. Verify form exists in database: `SELECT * FROM form_definitions WHERE id = ?`
2. Check constant matches: `console.log(FORM_IDS.SCREENING_ASSESSMENT)`
3. Update constants if database was modified

### Issue: Status validation fails
**Symptom:** "Invalid status" error during submission

**Solution:**
1. Check backend FormDataStatus enum matches frontend FORM_STATUS
2. Verify status string is uppercase: `SUBMITTED` not `submitted`
3. Use constant: `FORM_STATUS.SUBMITTED` not string literal

### Issue: Study/Site context missing
**Symptom:** Forms saved with null studyId or siteId

**Solution:**
1. Check DEFAULT_STUDY_CONFIG values
2. Verify auth context is available
3. Add fallback logic in submission code

---

## 9. Related Documentation

- **Backend:** `backend/clinprecision-clinops-service/src/main/java/.../formdata/`
- **API Reference:** `STUDY_DDD_API_QUICK_REFERENCE.md`
- **Form Service:** `frontend/clinprecision/src/services/FormDataService.js`
- **Status Modal:** `frontend/clinprecision/src/components/.../StatusChangeModal.jsx`

---

## Summary

The form constants configuration provides:

✅ **Centralized Management** - All form IDs and statuses in one place  
✅ **Type Safety** - Constants prevent typos and invalid values  
✅ **Maintainability** - Easy to update when forms are added/changed  
✅ **Documentation** - Self-documenting code with named constants  
✅ **Future-Ready** - Structured for auth context integration  

**Next Steps:**
1. Complete end-to-end testing (Task 12)
2. Integrate authentication context for siteId
3. Create form_definitions table in database
4. Consider dynamic form configuration API

---

**Status:** Configuration complete and integrated ✅  
**Testing:** Ready for E2E verification 🧪
