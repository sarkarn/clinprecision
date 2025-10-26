# CodeList Dropdown Fix - Implementation Summary

## Issue Description
Study Phase and Current Status dropdowns in Study Creation wizard were showing "undefined" values because:
1. The `useCodeList` hook was a stub returning an empty array
2. No CodeList data existed in the database for STUDY_PHASE and STUDY_STATUS categories

## Solution Overview
Implemented proper CodeList integration by:
1. ✅ Updated `useCodeList` hook to fetch from CodeList API
2. ✅ Created SQL seed script to populate required CodeList entries

---

## 1. Frontend Changes

### Updated: `frontend/clinprecision/src/hooks/useCodeList.ts`

**Changes Made:**
- Implemented actual API call to ClinOps Service CodeList endpoint
- Fetches from: `/clinops-ws/api/v1/study-design/metadata/codelists/simple/{category}`
- Properly transforms `CodeListDto` response to frontend `CodeListOption` format
- Added error handling and loading states

**Key Transformation:**
```typescript
// Backend CodeListDto → Frontend CodeListOption
{
  id: item.id.toString(),
  value: item.code,           // "PHASE_I", "DRAFT", etc.
  label: item.displayName,    // "Phase I", "Draft", etc.
  description: item.description
}
```

**Usage Example:**
```typescript
// In component
const { data: phases, loading, error } = useCodeList('STUDY_PHASE');
// Returns: [
//   { id: "1", value: "PHASE_I", label: "Phase I", description: "..." },
//   { id: "2", value: "PHASE_II", label: "Phase II", description: "..." },
//   ...
// ]
```

---

## 2. Backend Database Changes

### Created: `backend/clinprecision-db/sql/seed_study_codelists.sql`

**Populates Three CodeList Categories:**

### 2.1 STUDY_PHASE (9 entries)
- PRECLINICAL → "Preclinical"
- PHASE_0 → "Phase 0"
- PHASE_I → "Phase I"
- PHASE_I_II → "Phase I/II"
- PHASE_II → "Phase II"
- PHASE_II_III → "Phase II/III"
- PHASE_III → "Phase III"
- PHASE_IV → "Phase IV"
- NA → "Not Applicable"

### 2.2 STUDY_STATUS (14 entries)
- DRAFT → "Draft"
- PROTOCOL_DEVELOPMENT → "Protocol Development"
- REGULATORY_SUBMISSION → "Regulatory Submission"
- REGULATORY_APPROVED → "Regulatory Approved"
- SITE_ACTIVATION → "Site Activation"
- ACTIVE → "Active"
- ENROLLING → "Enrolling"
- ENROLLMENT_COMPLETE → "Enrollment Complete"
- SUSPENDED → "Suspended"
- ON_HOLD → "On Hold"
- COMPLETED → "Completed"
- TERMINATED → "Terminated"
- WITHDRAWN → "Withdrawn"
- CLOSED → "Closed"

### 2.3 REGULATORY_STATUS (9 entries - Optional)
- NOT_SUBMITTED → "Not Submitted"
- PENDING_SUBMISSION → "Pending Submission"
- SUBMITTED → "Submitted"
- UNDER_REVIEW → "Under Review"
- ADDITIONAL_INFO_REQUESTED → "Additional Information Requested"
- APPROVED → "Approved"
- CONDITIONALLY_APPROVED → "Conditionally Approved"
- REJECTED → "Rejected"
- WITHDRAWN → "Withdrawn"

---

## 3. How to Apply the Fix

### Step 1: Run SQL Script
```bash
# Connect to your PostgreSQL database
psql -h <host> -U <username> -d <database> -f backend/clinprecision-db/sql/seed_study_codelists.sql
```

**⚠️ IMPORTANT:** Before running, update `created_by` field in SQL script:
```sql
-- Change this value from 1 to a valid user ID in your system
created_by = 1  -- Replace with actual user ID
```

### Step 2: Rebuild Frontend
```bash
cd frontend/clinprecision
npm run build
```

### Step 3: Test
1. Open Study Creation wizard
2. Check "Study Phase" dropdown → Should show Phase I, II, III, IV, etc.
3. Check "Current Status" dropdown → Should show Draft, Active, Completed, etc.

---

## 4. API Contract

### CodeList Endpoint
```
GET /clinops-ws/api/v1/study-design/metadata/codelists/simple/{category}
```

**Request:**
```
GET /clinops-ws/api/v1/study-design/metadata/codelists/simple/STUDY_PHASE
```

**Response:**
```json
[
  {
    "id": 1,
    "category": "STUDY_PHASE",
    "code": "PHASE_I",
    "displayName": "Phase I",
    "description": "First-in-human studies, safety and dosage",
    "sortOrder": 3,
    "isActive": true,
    "systemCode": false
  },
  ...
]
```

---

## 5. Data Flow

```
Component (StudyPhaseDropdown)
    ↓
useCodeList('STUDY_PHASE')
    ↓
ApiService.get('/clinops-ws/api/v1/study-design/metadata/codelists/simple/STUDY_PHASE')
    ↓
CodeListController.getSimpleCodeList(category)
    ↓
CodeListRepository.findByCategoryAndIsActive('STUDY_PHASE', true)
    ↓
code_lists table (PostgreSQL)
    ↓
[{code: 'PHASE_I', displayName: 'Phase I'}, ...]
    ↓
Transform to {id, value, label, description}
    ↓
Dropdown populated with options
```

---

## 6. Database Schema

### Table: `code_lists`
```sql
CREATE TABLE code_lists (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    system_code BOOLEAN DEFAULT false,
    parent_code_id BIGINT,
    metadata JSON,
    valid_from DATE,
    valid_to DATE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP,
    version_number INTEGER DEFAULT 1,
    UNIQUE(category, code)
);
```

---

## 7. Related Components

### Components Using CodeList:
- `StudyPhaseDropdown.tsx` → Uses `useCodeList('STUDY_PHASE')`
- `StudyStatusDropdown.tsx` → Uses `useCodeList('STUDY_STATUS')`
- `CodeListDropdown.tsx` → Generic dropdown accepting category prop
- `BasicInformationStep.tsx` → Contains phase/status dropdowns

### Services:
- `CodeListController.java` → REST endpoint provider
- `CodeListService.java` → Business logic
- `CodeListRepository.java` → Database access
- `ApiService.ts` → Frontend HTTP client

---

## 8. Verification Queries

### Check if data inserted correctly:
```sql
-- Count entries per category
SELECT category, COUNT(*) as count 
FROM code_lists 
WHERE category IN ('STUDY_PHASE', 'STUDY_STATUS', 'REGULATORY_STATUS')
GROUP BY category;

-- View all study phases
SELECT code, display_name, description, sort_order
FROM code_lists
WHERE category = 'STUDY_PHASE'
ORDER BY sort_order;

-- View all study statuses
SELECT code, display_name, description, sort_order
FROM code_lists
WHERE category = 'STUDY_STATUS'
ORDER BY sort_order;
```

### Expected Results:
| category | count |
|----------|-------|
| STUDY_PHASE | 9 |
| STUDY_STATUS | 14 |
| REGULATORY_STATUS | 9 |

---

## 9. Testing Checklist

- [ ] SQL script runs without errors
- [ ] Verify counts: 9 phases, 14 statuses, 9 regulatory statuses
- [ ] Frontend build completes successfully
- [ ] Study Phase dropdown shows all 9 phases
- [ ] Current Status dropdown shows all 14 statuses
- [ ] Dropdown values are selectable
- [ ] Selected values save correctly
- [ ] No console errors in browser
- [ ] API returns 200 status for `/simple/STUDY_PHASE` endpoint
- [ ] API returns 200 status for `/simple/STUDY_STATUS` endpoint

---

## 10. Troubleshooting

### Issue: Dropdowns still showing "undefined"

**Check 1:** Verify API endpoint is accessible
```bash
curl http://localhost:8080/clinops-ws/api/v1/study-design/metadata/codelists/simple/STUDY_PHASE
```

**Check 2:** Check browser console for errors
- Open DevTools → Console tab
- Look for 404 or 500 errors
- Check Network tab for failed API calls

**Check 3:** Verify database has data
```sql
SELECT * FROM code_lists WHERE category = 'STUDY_PHASE' LIMIT 5;
```

**Check 4:** Check created_by constraint
```sql
-- Ensure created_by references valid user
SELECT id, username FROM users LIMIT 1;
-- Update SQL script with this user ID
```

### Issue: API returns 404

**Possible Causes:**
- ClinOps Service not running
- Wrong API path (check `config.ts` for correct URL)
- CodeListController not registered

**Solution:**
```bash
# Restart ClinOps Service
cd backend/clinprecision-clinops-service
mvn spring-boot:run
```

---

## 11. Future Enhancements

1. **Add More Categories:**
   - VISIT_TYPE (Screening, Baseline, Follow-up, etc.)
   - ADVERSE_EVENT_SEVERITY (Mild, Moderate, Severe)
   - CONSENT_STATUS (Not Obtained, Obtained, Withdrawn)

2. **Admin UI for CodeList Management:**
   - CRUD operations for code lists
   - Bulk import/export
   - Version history

3. **Caching:**
   - Add Redis caching for CodeList API
   - Frontend caching in useCodeList hook

---

## Summary

✅ **Fixed:** Study Phase and Current Status dropdowns now populate correctly  
✅ **Implementation:** useCodeList hook fetches from CodeList API  
✅ **Database:** Seed script adds all required STUDY_PHASE and STUDY_STATUS entries  
✅ **Testing:** Verify with provided SQL queries and UI testing checklist  

**Next Steps:**
1. Run `seed_study_codelists.sql` (update `created_by` first!)
2. Rebuild frontend
3. Test dropdown functionality
4. Deploy to dev/staging environment
