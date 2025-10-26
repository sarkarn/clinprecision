# CodeList System - Quick Reference Guide

## Overview
The CodeList system provides centralized management of dropdown options, lookup values, and controlled vocabularies across the application.

---

## Frontend Usage

### 1. Basic Hook Usage

```typescript
import { useCodeList } from '../hooks/useCodeList';

function MyComponent() {
  const { data, loading, error } = useCodeList('STUDY_PHASE');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <select>
      {data.map(option => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

### 2. Using CodeListDropdown Component

```typescript
import CodeListDropdown from '../components/common/CodeListDropdown';

function StudyForm() {
  const [phase, setPhase] = useState('');
  
  return (
    <CodeListDropdown
      category="STUDY_PHASE"
      value={phase}
      onChange={(value) => setPhase(value)}
      label="Study Phase"
      placeholder="Select phase..."
    />
  );
}
```

### 3. Available Categories

| Category | Description | Example Values |
|----------|-------------|----------------|
| `STUDY_PHASE` | Clinical trial phases | Phase I, Phase II, Phase III |
| `STUDY_STATUS` | Study lifecycle status | Draft, Active, Completed |
| `REGULATORY_STATUS` | Regulatory approval status | Submitted, Approved, Rejected |

### 4. Data Structure

**Request:**
```typescript
useCodeList('STUDY_PHASE');
```

**Returns:**
```typescript
{
  data: [
    {
      id: "1",
      value: "PHASE_I",      // Use this for saving to DB
      label: "Phase I",       // Use this for display
      description: "First-in-human studies, safety and dosage"
    },
    ...
  ],
  loading: boolean,
  error: string | null,
  refresh: () => void
}
```

---

## Backend API

### Endpoints

#### Get All Codes for Category
```
GET /clinops-ws/api/v1/study-design/metadata/codelists/simple/{category}
```

**Example:**
```bash
GET /clinops-ws/api/v1/study-design/metadata/codelists/simple/STUDY_PHASE

# Response
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

#### Get Specific Code
```
GET /clinops-ws/api/v1/study-design/metadata/codelists/{category}/{code}
```

**Example:**
```bash
GET /clinops-ws/api/v1/study-design/metadata/codelists/STUDY_PHASE/PHASE_I

# Response
{
  "id": 1,
  "category": "STUDY_PHASE",
  "code": "PHASE_I",
  "displayName": "Phase I",
  ...
}
```

#### Validate Code
```
GET /clinops-ws/api/v1/study-design/metadata/codelists/validate/{category}/{code}
```

**Example:**
```bash
GET /clinops-ws/api/v1/study-design/metadata/codelists/validate/STUDY_PHASE/PHASE_I

# Response
{
  "valid": true,
  "code": "PHASE_I",
  "displayName": "Phase I"
}
```

---

## Database

### Table Schema
```sql
code_lists (
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
)
```

### Common Queries

#### Get all active codes for a category
```sql
SELECT code, display_name, description, sort_order
FROM code_lists
WHERE category = 'STUDY_PHASE'
  AND is_active = true
ORDER BY sort_order;
```

#### Add new code
```sql
INSERT INTO code_lists (
  category, code, display_name, description, 
  sort_order, is_active, created_by, created_at, updated_at
) VALUES (
  'STUDY_PHASE', 
  'PHASE_V', 
  'Phase V', 
  'Long-term safety studies',
  10,
  true,
  1,  -- Replace with actual user ID
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

#### Update existing code
```sql
UPDATE code_lists
SET display_name = 'Phase I Trial',
    description = 'Updated description',
    updated_at = CURRENT_TIMESTAMP
WHERE category = 'STUDY_PHASE' 
  AND code = 'PHASE_I';
```

#### Deactivate code (soft delete)
```sql
UPDATE code_lists
SET is_active = false,
    updated_at = CURRENT_TIMESTAMP
WHERE category = 'STUDY_PHASE' 
  AND code = 'PHASE_0';
```

---

## Adding New Categories

### Step 1: Add SQL Data
Create SQL script to populate new category:

```sql
-- Example: VISIT_TYPE category
INSERT INTO code_lists (
  category, code, display_name, description, 
  sort_order, is_active, system_code, created_by, 
  created_at, updated_at, version_number
) VALUES 
  ('VISIT_TYPE', 'SCREENING', 'Screening Visit', 
   'Initial screening visit', 1, true, false, 1, 
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
  ('VISIT_TYPE', 'BASELINE', 'Baseline Visit', 
   'Baseline assessment', 2, true, false, 1, 
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
  ('VISIT_TYPE', 'FOLLOW_UP', 'Follow-up Visit', 
   'Regular follow-up', 3, true, false, 1, 
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);
```

### Step 2: Use in Frontend
```typescript
// Automatically works with existing infrastructure!
const { data: visitTypes } = useCodeList('VISIT_TYPE');

// Or use dropdown component
<CodeListDropdown
  category="VISIT_TYPE"
  value={selectedVisitType}
  onChange={setSelectedVisitType}
/>
```

---

## Best Practices

### 1. Naming Conventions
- **Category**: UPPERCASE_SNAKE_CASE (e.g., `STUDY_PHASE`, `VISIT_TYPE`)
- **Code**: UPPERCASE_SNAKE_CASE (e.g., `PHASE_I`, `SCREENING_VISIT`)
- **Display Name**: Title Case (e.g., `Phase I`, `Screening Visit`)

### 2. Sort Order
- Start at 1
- Increment by 1
- Leave gaps (5, 10, 15) if codes may be inserted later

### 3. System vs User Codes
- `system_code = true`: System-managed, cannot be deleted by users
- `system_code = false`: User-configurable codes

### 4. Soft Deletes
- Never DELETE rows
- Set `is_active = false` instead
- This preserves historical data references

### 5. Code Values in Database
Always store the **code** (not display_name) in foreign key references:

```sql
-- ✅ Good
studies (
  study_phase VARCHAR(100) REFERENCES code_lists(code)
)

-- ❌ Bad
studies (
  study_phase VARCHAR(200)  -- storing display name
)
```

---

## Troubleshooting

### Dropdown shows no options

**Check 1:** Verify category exists in database
```sql
SELECT COUNT(*) FROM code_lists WHERE category = 'STUDY_PHASE';
```

**Check 2:** Verify codes are active
```sql
SELECT * FROM code_lists 
WHERE category = 'STUDY_PHASE' AND is_active = true;
```

**Check 3:** Check browser console for API errors
```
F12 → Console → Look for 404 or 500 errors
```

**Check 4:** Verify API endpoint is accessible
```bash
curl http://localhost:8080/clinops-ws/api/v1/study-design/metadata/codelists/simple/STUDY_PHASE
```

### Dropdown shows old values after update

**Solution:** Refresh the data
```typescript
const { data, refresh } = useCodeList('STUDY_PHASE');

// Call refresh after updates
const handleUpdate = async () => {
  await updateCodeList();
  refresh();  // Re-fetch data
};
```

### Cannot add new code - constraint violation

**Cause:** Duplicate (category, code) combination

**Solution:** Use UPSERT or check before insert
```sql
INSERT INTO code_lists (category, code, display_name, ...)
VALUES (...)
ON CONFLICT (category, code) DO UPDATE
SET display_name = EXCLUDED.display_name,
    updated_at = CURRENT_TIMESTAMP;
```

---

## Migration from Old System

If you have existing dropdown data in separate tables:

### Step 1: Extract existing data
```sql
-- Example: Migrate study_phases table to code_lists
INSERT INTO code_lists (
  category, code, display_name, description,
  sort_order, is_active, created_by, created_at, updated_at
)
SELECT 
  'STUDY_PHASE' as category,
  phase_code as code,
  phase_name as display_name,
  phase_description as description,
  display_order as sort_order,
  is_active,
  1 as created_by,
  CURRENT_TIMESTAMP as created_at,
  CURRENT_TIMESTAMP as updated_at
FROM study_phases
ON CONFLICT (category, code) DO NOTHING;
```

### Step 2: Update frontend components
```typescript
// Old approach
import StudyPhaseService from '../services/StudyPhaseService';
const phases = await StudyPhaseService.getAllPhases();

// New approach
import { useCodeList } from '../hooks/useCodeList';
const { data: phases } = useCodeList('STUDY_PHASE');
```

### Step 3: Verify migration
```sql
-- Compare counts
SELECT 'old_table', COUNT(*) FROM study_phases
UNION ALL
SELECT 'new_table', COUNT(*) FROM code_lists WHERE category = 'STUDY_PHASE';
```

---

## Performance Tips

### 1. Cache on Frontend
```typescript
// CodeList data changes infrequently, cache aggressively
const { data } = useCodeList('STUDY_PHASE');
// Hook automatically caches until page reload or manual refresh
```

### 2. Database Indexes
```sql
-- Already created by migration
CREATE INDEX idx_code_lists_category ON code_lists(category);
CREATE INDEX idx_code_lists_is_active ON code_lists(is_active);
CREATE INDEX idx_code_lists_category_active ON code_lists(category, is_active);
```

### 3. Load Multiple Categories in Parallel
```typescript
const { data: phases } = useCodeList('STUDY_PHASE');
const { data: statuses } = useCodeList('STUDY_STATUS');
const { data: regStatuses } = useCodeList('REGULATORY_STATUS');
// All fetch in parallel automatically
```

---

## Security Considerations

### 1. Read Access
- All authenticated users can read CodeLists
- No sensitive data should be stored in CodeLists

### 2. Write Access
- Only admins should create/update/delete codes
- Implement permission checks in backend

### 3. SQL Injection
- Always use parameterized queries
- Never concatenate user input in SQL

```java
// ✅ Good
@Query("SELECT c FROM CodeListEntity c WHERE c.category = :category")
List<CodeListEntity> findByCategory(@Param("category") String category);

// ❌ Bad
String sql = "SELECT * FROM code_lists WHERE category = '" + userInput + "'";
```

---

## Summary

✅ Use `useCodeList(category)` hook for dropdown data  
✅ Store **code** values in database, not display names  
✅ Always use `is_active = false` for deletions  
✅ Follow naming conventions for categories and codes  
✅ Add indexes for frequently queried categories  
✅ Cache data on frontend, refresh on updates  
✅ Implement proper access controls for admin operations  

**Related Files:**
- Frontend Hook: `src/hooks/useCodeList.ts`
- Dropdown Component: `src/components/common/CodeListDropdown.tsx`
- Backend Controller: `CodeListController.java`
- Seed Data: `backend/clinprecision-db/sql/seed_study_codelists.sql`
