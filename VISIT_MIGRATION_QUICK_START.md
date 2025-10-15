# Visit Migration - Quick Start Guide

**Date:** 2025-10-14  
**Status:** ✅ Code Ready - Database Migration Needed

---

## What Was Done

✅ **Backend Code Updated:**
- `UnscheduledVisitService` now queries `study_visit_instances`
- `VisitProjector` now saves to `study_visit_instances` 
- `StudyVisitInstanceEntity` has new fields: `aggregate_uuid`, `notes`, `created_by`
- `StudyVisitInstanceRepository` has new method: `findByAggregateUuid()`
- `VisitController` updated for Long IDs instead of UUIDs
- **BUILD SUCCESS** ✅

---

## What You Need to Do

### Step 1: Run Database Migration

Execute the SQL script:
```bash
mysql -u your_user -p clinprecision < backend/clinprecision-db/ddl/migrate_visit_table.sql
```

Or manually run these key statements:
```sql
-- Add new columns
ALTER TABLE study_visit_instances 
  ADD COLUMN aggregate_uuid VARCHAR(36),
  ADD COLUMN notes TEXT,
  ADD COLUMN created_by VARCHAR(100);

-- Make visit_id nullable (for unscheduled visits)
ALTER TABLE study_visit_instances 
  MODIFY COLUMN visit_id BIGINT NULL;

-- Add index
CREATE INDEX idx_aggregate_uuid ON study_visit_instances(aggregate_uuid);
```

**Verify:**
```sql
DESCRIBE study_visit_instances;
-- Should show: aggregate_uuid, notes, created_by columns

SELECT COUNT(*) FROM study_visit_instances WHERE study_id = 11;
-- Should return: 56 (your existing scheduled visits)
```

---

### Step 2: Restart Backend

```bash
cd backend/clinprecision-clinops-service
mvn spring-boot:run
```

**Check logs for:**
- ✅ `StudyVisitInstanceRepository` bean created
- ✅ `VisitProjector` initialized
- ✅ No errors related to visit packages

---

### Step 3: Test Visit Display

1. Open browser: `http://localhost:3000`
2. Navigate to SubjectDetails page (patient ID 5)
3. **Expected:** See 56 visits displayed
4. **Check:** Visit names (Screening, Baseline, Week 4, Week 12)
5. **Check:** Visit dates and statuses

---

### Step 4: Test Unscheduled Visit Creation

1. Click **"+ Create Visit"** button
2. Fill out UnscheduledVisitModal form
3. Submit
4. **Expected:** Visit appears in list immediately
5. **Verify database:**
   ```sql
   SELECT * FROM study_visit_instances 
   WHERE aggregate_uuid IS NOT NULL
   ORDER BY created_at DESC LIMIT 1;
   ```
   Should show your new unscheduled visit with `visit_id = NULL`

---

### Step 5: Remove visit Table (After Testing)

**⚠️ Only after Steps 1-4 are successful:**

```sql
DROP TABLE visit;
```

Then update `consolidated_schema.sql` to remove the `visit` table definition.

---

## Expected Results

### Before Migration
- **Backend queries:** `visit` table (empty)
- **Frontend displays:** "No visits scheduled"
- **Database:** 56 visits in `study_visit_instances` (unused)

### After Migration
- **Backend queries:** `study_visit_instances` table
- **Frontend displays:** 56 visits
- **Unscheduled visits:** Work via event sourcing
- **visit table:** Can be dropped

---

## Troubleshooting

### Issue: Service won't start
**Check:**
- Database migration ran successfully
- `aggregate_uuid` column exists
- No typos in SQL statements

### Issue: No visits displayed
**Check:**
- GET `/api/v1/visits/patient/5` returns data
- Browser console for errors
- Backend logs for SQL errors

### Issue: Unscheduled visit not created
**Check:**
- `domain_event_entry` table for `VisitCreatedEvent`
- Backend logs for projection errors
- `aggregate_uuid` column allows NULL

---

## Rollback (if needed)

```sql
-- Remove new columns
ALTER TABLE study_visit_instances 
  DROP COLUMN aggregate_uuid,
  DROP COLUMN notes,
  DROP COLUMN created_by;

-- Restore NOT NULL constraint
ALTER TABLE study_visit_instances 
  MODIFY COLUMN visit_id BIGINT NOT NULL;
```

Then revert code:
```bash
git checkout HEAD~1 -- backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/visit/
mvn clean compile
```

---

## Files Changed

**Java Files:**
- `UnscheduledVisitService.java` - Uses new repository
- `VisitProjector.java` - Projects to study_visit_instances
- `StudyVisitInstanceEntity.java` - Added fields
- `StudyVisitInstanceRepository.java` - Added query method
- `VisitController.java` - Long ID instead of UUID

**SQL Files:**
- `migrate_visit_table.sql` - Database migration script

**Documentation:**
- `VISIT_TABLE_MIGRATION_COMPLETE.md` - Detailed implementation
- `VISIT_TABLES_DESIGN_INCONSISTENCY_ANALYSIS.md` - Problem analysis
- `VISIT_MIGRATION_QUICK_START.md` - This file

---

## Success Criteria

✅ BUILD SUCCESS (completed)  
✅ Database migration executed  
✅ Service starts without errors  
✅ 56 visits display in frontend  
✅ Unscheduled visit creation works  
✅ visit table dropped  

---

## Next Steps

1. Run `migrate_visit_table.sql`
2. Restart backend service
3. Test visit display
4. Test visit creation
5. Drop `visit` table
6. Update schema documentation

**Estimated Time:** 15-30 minutes for full migration and testing

---

## Questions?

Refer to:
- `VISIT_TABLE_MIGRATION_COMPLETE.md` - Complete implementation details
- `VISIT_TABLES_DESIGN_INCONSISTENCY_ANALYSIS.md` - Why this was needed
- SQL script comments - Step-by-step instructions
