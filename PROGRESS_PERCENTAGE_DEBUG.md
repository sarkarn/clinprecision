# Visit Progress Percentage Debug Guide

**Issue**: Visit progress percentage still showing incorrect values after `.distinct()` fix

## Diagnostic Steps

### 1. Verify Backend Rebuilt
```bash
# Rebuild the backend service
cd backend/clinprecision-clinops-service
mvn clean compile -DskipTests

# Expected: BUILD SUCCESS
```

### 2. Restart Backend Service
```bash
# Kill existing process
# Start the service again to load new code
```

### 3. Check Database Query Results

Run this query to see what data is being returned:

```sql
-- Replace 123 with actual visit_id you're testing
SELECT 
    id,
    visit_id,
    form_id,
    status,
    created_at
FROM study_form_data
WHERE visit_id = 123
ORDER BY created_at DESC;
```

**Expected Result**:
- Should show all form submissions for the visit
- May have multiple rows for same `form_id` (drafts/revisions)
- Only count SUBMITTED/LOCKED forms with DISTINCT form_id

### 4. Manual Calculation Test

```sql
-- Total forms for visit (from visit_forms table)
SELECT COUNT(*) as total_forms
FROM visit_forms
WHERE visit_definition_id = (
    SELECT visit_id 
    FROM study_visit_instances 
    WHERE id = 123
);

-- Completed UNIQUE forms (what our code should calculate)
SELECT COUNT(DISTINCT form_id) as completed_forms
FROM study_form_data
WHERE visit_id = 123
  AND status IN ('SUBMITTED', 'LOCKED');

-- Calculate percentage
-- percentage = (completed_forms / total_forms) * 100
```

### 5. Check Frontend API Call

Open browser DevTools → Network tab:
1. Filter for API call: `GET /api/v1/visits/...`
2. Check Response JSON:
   ```json
   {
     "id": 123,
     "visitName": "Week 2 Follow-up",
     "totalForms": 4,
     "completedForms": 4,
     "completionPercentage": 100.0
   }
   ```
3. Verify these values match your expectations

### 6. Clear Frontend Cache

```bash
# In browser
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache
3. Or open in Incognito/Private mode
```

## Common Issues & Solutions

### Issue 1: Backend Not Restarted
**Symptom**: Code looks correct but behavior unchanged  
**Solution**: Rebuild (`mvn clean compile`) and restart service

### Issue 2: Frontend Caching Old Response
**Symptom**: API returns correct data but UI shows old percentage  
**Solution**: Hard refresh browser (Ctrl+Shift+R)

### Issue 3: Wrong visitId Being Used
**Symptom**: Query returns empty results  
**Solution**: 
- Check that `entity.getId()` returns correct visit instance ID
- Verify `findByVisitIdOrderByCreatedAtDesc(visitInstanceId)` query parameter

### Issue 4: Forms in DRAFT Status
**Symptom**: Forms exist but not counted  
**Solution**: 
- Check if forms have status = 'SUBMITTED' or 'LOCKED'
- If forms are still 'DRAFT', they won't be counted (correct behavior)

### Issue 5: No Forms in visit_forms Table
**Symptom**: totalForms = 0, percentage = 0%  
**Solution**:
- Verify visit_forms entries exist for this visit definition
- Check that visit_definition_id in visit_forms matches entity.getVisitId()

### Issue 6: Multiple Form Submissions with Different formIds
**Symptom**: Each form re-submission creates new formId instead of new version  
**Solution**: 
- This is likely the root cause if forms have different form_id values
- Check database schema: study_form_data should reuse same form_id for revisions
- Verify: Do multiple submissions of "Demographics" form all have same form_id?

## Expected Behavior

**Scenario**: Visit has 4 required forms
- Demographics (form_id=101)
- Vitals (form_id=102)  
- Labs (form_id=103)
- Adverse Events (form_id=104)

**Database State**:
```
study_form_data table:
id | visit_id | form_id | status    | created_at
1  | 123      | 101     | DRAFT     | 2025-10-21 10:00
2  | 123      | 101     | SUBMITTED | 2025-10-21 10:05  ← Count this
3  | 123      | 102     | SUBMITTED | 2025-10-21 10:10  ← Count this
4  | 123      | 103     | SUBMITTED | 2025-10-21 10:15  ← Count this
5  | 123      | 104     | SUBMITTED | 2025-10-21 10:20  ← Count this
6  | 123      | 101     | SUBMITTED | 2025-10-21 10:25  ← Don't count (duplicate form_id=101)
```

**Correct Calculation**:
```java
allForms.stream()
    .filter(form -> "SUBMITTED".equals(form.getStatus()) || "LOCKED".equals(form.getStatus()))
    // Forms: [2, 3, 4, 5, 6]
    .map(StudyFormDataEntity::getFormId)
    // Form IDs: [101, 102, 103, 104, 101]
    .distinct()
    // Unique IDs: [101, 102, 103, 104]
    .count()
    // Count: 4

percentage = 4 / 4 * 100 = 100%  ✓ CORRECT
```

## Test Case to Verify Fix

1. **Setup**: Create test visit with 4 forms
2. **Action 1**: Submit 2 forms → Expect 50%
3. **Action 2**: Submit 1 more form → Expect 75%
4. **Action 3**: Submit last form → Expect 100%
5. **Action 4**: Re-submit first form (revision) → Expect 100% (not 125%)

## Code Reference

**File**: `PatientVisitService.java` (lines 469-475)

```java
// Count DISTINCT formIds with SUBMITTED or LOCKED status
int completedCount = (int) allForms.stream()
    .filter(form -> "SUBMITTED".equals(form.getStatus()) || "LOCKED".equals(form.getStatus()))
    .map(StudyFormDataEntity::getFormId)  // Get formId
    .distinct()                            // Count unique forms only ← KEY FIX
    .count();
```

## Next Steps

If issue persists after all diagnostics:

1. **Enable Debug Logging**: Add log statements to see actual values:
   ```java
   log.info("Visit {}: total={}, forms found={}, completed unique={}, percentage={}", 
       entity.getId(), totalForms, allForms.size(), completedCount, percentage);
   ```

2. **Check Actual Data**: Run SQL queries to see what's in database

3. **Provide Details**: Share:
   - Visit ID being tested
   - Expected vs actual percentage
   - SQL query results from step 3
   - Backend logs showing calculation

---

**Last Updated**: October 21, 2025  
**Related Commits**: 
- 353fd54 (Initial progress tracker bug fix)
- dd3f90d (Gap #4 backend implementation)
