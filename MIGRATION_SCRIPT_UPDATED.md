# Migration Script Updated for Build Tracking

**Date**: October 16, 2025  
**File**: `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`  
**Status**: ✅ Updated and Ready to Execute

---

## Summary

The migration script has been **updated** to reflect that all schema changes already exist in `consolidated_schema.sql`. The script now focuses on **data backfilling only**.

---

## What Was Changed

### Before
- Script tried to `ALTER TABLE` to add columns
- Script tried to `ADD CONSTRAINT` for foreign keys
- Script tried to `CREATE INDEX` for all indexes
- **Would FAIL** if run against current database (columns already exist)

### After
- All `ALTER TABLE` commands → **COMMENTED OUT** (columns already exist)
- All `ADD CONSTRAINT` commands → **COMMENTED OUT** (constraints already exist)
- All `CREATE INDEX` commands → **COMMENTED OUT** (indexes already exist)
- **ONLY ACTIVE**: Data backfill `UPDATE` statements
- **SAFE TO RUN**: Won't try to create existing objects

---

## Schema Status Verification

All 6 tables **already have** `build_id` columns in `consolidated_schema.sql`:

| Table | build_id Column | Foreign Key | Indexes |
|-------|----------------|-------------|---------|
| `visit_definitions` | ✅ Line 933 | ✅ `fk_visit_definition_build` | ✅ Yes |
| `form_definitions` | ✅ Line 963 | ✅ `fk_form_definition_build` | ✅ Yes |
| `visit_forms` | ✅ Line 1005 | ✅ `fk_visit_form_build` | ✅ Yes |
| `study_visit_instances` | ✅ Line 1552 | ✅ `fk_visit_instance_build` | ✅ Yes |
| `study_form_data` | ✅ Line 1485 | ✅ `fk_study_form_data_build` | ✅ Yes |
| `study_form_data_audit` | ✅ Line 1526 | ✅ `fk_study_form_data_audit_build` | ✅ Yes |

**Indexes also exist**:
- Line 1877-1879: `study_visit_instances` indexes
- Inline indexes for other tables in their CREATE TABLE statements

---

## What the Migration Script NOW Does

### ✅ Active Operations (Data Backfill)

**PART 3: Backfill existing data**
```sql
-- Backfill study_visit_instances
UPDATE study_visit_instances svi
INNER JOIN studies s ON s.id = svi.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET svi.build_id = builds.first_build_id
WHERE svi.build_id IS NULL;

-- Backfill visit_forms
UPDATE visit_forms vf
INNER JOIN visit_definitions vd ON vd.id = vf.visit_definition_id
INNER JOIN studies s ON s.id = vd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET vf.build_id = builds.first_build_id
WHERE vf.build_id IS NULL;
```

**PART 6: Backfill visit_definitions**
```sql
UPDATE visit_definitions vd
INNER JOIN studies s ON s.id = vd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET vd.build_id = builds.first_build_id
WHERE vd.build_id IS NULL;
```

**PART 7: Backfill form_definitions**
```sql
UPDATE form_definitions fd
INNER JOIN studies s ON s.id = fd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET fd.build_id = builds.first_build_id
WHERE fd.build_id IS NULL;
```

**PART 8: Backfill study_form_data**
```sql
-- From visit instances (preferred)
UPDATE study_form_data sfd
INNER JOIN study_visit_instances svi ON svi.id = sfd.visit_id
SET sfd.build_id = svi.build_id
WHERE sfd.build_id IS NULL
  AND sfd.visit_id IS NOT NULL;

-- For standalone forms (fallback)
UPDATE study_form_data sfd
INNER JOIN studies s ON s.id = sfd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET sfd.build_id = builds.first_build_id
WHERE sfd.build_id IS NULL;
```

**PART 9: Backfill study_form_data_audit**
```sql
-- From main form data table (preferred)
UPDATE study_form_data_audit a
INNER JOIN study_form_data sfd ON sfd.id = a.record_id
SET a.build_id = sfd.build_id
WHERE a.build_id IS NULL
  AND sfd.build_id IS NOT NULL;

-- From temporal build lookup (for older audit records)
UPDATE study_form_data_audit a
SET a.build_id = (
    SELECT sdb.id
    FROM study_database_builds sdb
    WHERE sdb.study_id = a.study_id
      AND sdb.build_status = 'COMPLETED'
      AND sdb.build_end_time <= a.changed_at
    ORDER BY sdb.build_end_time DESC
    LIMIT 1
)
WHERE a.build_id IS NULL;
```

**PART 10: Verification queries** (commented out, ready to run after migration)

### ❌ Skipped Operations (Already Exist in Schema)

All of these are now **commented out** with `-- SKIPPED:` prefix:

- ❌ `ALTER TABLE` to add `build_id` columns (Parts 1, 2, 6, 7, 8, 9)
- ❌ `ADD CONSTRAINT` for foreign keys (Parts 4, 6, 7, 8, 9)
- ❌ `CREATE INDEX` statements (Parts 5, 6, 7, 8, 9)

---

## Why This Update Was Needed

### Problem
The original migration script was created when the schema changes were planned but not yet applied. However, the `consolidated_schema.sql` file already contains:

1. All `build_id` columns defined
2. All foreign key constraints
3. All performance indexes

### Risk
Running the original script would cause:
```sql
ERROR 1060 (42S21): Duplicate column name 'build_id'
ERROR 1061 (42000): Duplicate key name 'fk_visit_instance_build'
ERROR 1061 (42000): Duplicate key name 'idx_visit_instances_build_id'
```

### Solution
- Keep the **data backfill logic** (critical for existing data)
- Remove the **schema modification commands** (already done)
- Result: **Safe, idempotent migration** that can run against current database

---

## Execution Plan

### When to Run This Migration

**Scenario 1: Fresh Database (from consolidated_schema.sql)**
- Schema already has all `build_id` columns ✅
- No existing data to backfill
- **Result**: Migration completes instantly (all WHERE clauses return 0 rows)

**Scenario 2: Existing Database with Data**
- Schema already has all `build_id` columns ✅
- Has existing data in the 6 tables
- **Result**: Migration backfills all NULL `build_id` values with first completed build

### How to Execute

```bash
# Option 1: MySQL command line
mysql -u clinprecadmin -p clinprecisiondb < backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql

# Option 2: MySQL Workbench
# - Open the migration script
# - Execute against clinprecisiondb database
# - Check output for row counts updated

# Option 3: Via application (if using Flyway/Liquibase)
# - Place in migrations folder
# - Run application startup or explicit migration command
```

### Expected Output

```
Query OK, 0 rows affected (0.01 sec)
Rows matched: 0  Changed: 0  Warnings: 0

-- For each UPDATE statement, you'll see:
-- Either "0 rows" (fresh DB) or "X rows" (existing data)
```

### Post-Migration Verification

Uncomment and run the verification queries in **PART 10**:

```sql
-- Should return 0 for all tables
SELECT 
    'study_visit_instances' as table_name,
    COUNT(*) as total_rows,
    COUNT(build_id) as rows_with_build_id,
    COUNT(*) - COUNT(build_id) as rows_missing_build_id
FROM study_visit_instances
UNION ALL
SELECT 'visit_forms', COUNT(*), COUNT(build_id), COUNT(*) - COUNT(build_id)
FROM visit_forms
UNION ALL
SELECT 'visit_definitions', COUNT(*), COUNT(build_id), COUNT(*) - COUNT(build_id)
FROM visit_definitions
UNION ALL
SELECT 'form_definitions', COUNT(*), COUNT(build_id), COUNT(*) - COUNT(build_id)
FROM form_definitions
UNION ALL
SELECT 'study_form_data', COUNT(*), COUNT(build_id), COUNT(*) - COUNT(build_id)
FROM study_form_data
UNION ALL
SELECT 'study_form_data_audit', COUNT(*), COUNT(build_id), COUNT(*) - COUNT(build_id)
FROM study_form_data_audit;
```

**Expected Result**: All `rows_missing_build_id` should be **0**

---

## Rollback Plan

If migration fails or causes issues:

```sql
-- Reset all build_id values to NULL
UPDATE study_visit_instances SET build_id = NULL;
UPDATE visit_forms SET build_id = NULL;
UPDATE visit_definitions SET build_id = NULL;
UPDATE form_definitions SET build_id = NULL;
UPDATE study_form_data SET build_id = NULL;
UPDATE study_form_data_audit SET build_id = NULL;
```

**Note**: Cannot drop columns/constraints as they are part of base schema

---

## Next Steps

1. ✅ **Migration script updated** - Safe to run
2. ⏳ **Execute migration** - Run against database
3. ⏳ **Verify results** - Check all tables have build_id populated
4. ⏳ **Test Java code** - Verify determineBuildId() logic works
5. ⏳ **Integration testing** - End-to-end form submission with build tracking

---

## Files Updated

1. ✅ `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`
   - Commented out all schema modification commands
   - Kept all data backfill logic active
   - Ready for execution

2. ✅ `DATABASE_SPECIFICATION.md`
   - Documents all 6 tables with build_id
   - Explains build tracking architecture
   - Reference documentation complete

3. ✅ Java files (11 files) - Previously completed
   - All entities, DTOs, commands, events updated
   - Service layer with determineBuildId() method
   - Projectors for event handling

---

**Status**: ✅ Ready for migration execution  
**Risk Level**: LOW (only updates data, no schema changes)  
**Approval**: Pending user review
