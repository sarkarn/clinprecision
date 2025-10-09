# V004 Migration Execution Guide

## ⚠️ WARNING: DATA LOSS

**This migration will DROP and RECREATE the `study_versions` table!**
**ALL existing data in `study_versions` will be DELETED!**

Make sure you have a complete backup before proceeding.

---

## Step 1: Backup Database

### Windows PowerShell:
```powershell
# Set MySQL bin path (adjust if needed)
$env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Create backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
mysqldump -u root -p clinprecision_db > "backup_before_v004_$timestamp.sql"
```

### Alternative (if mysqldump in PATH):
```powershell
mysqldump -u root -p clinprecision_db > backup_before_v004.sql
```

---

## Step 2: Save Existing Data (Optional)

If you need to preserve `study_versions` data, export it first:

```sql
SELECT * INTO OUTFILE 'C:/temp/study_versions_backup.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM study_versions;
```

---

## Step 3: Execute Migration

### Navigate to migrations folder:
```powershell
cd backend\clinprecision-db\migrations
```

### Execute V004 migration:

**Option A: Using mysql command line**
```powershell
# If mysql is in PATH
mysql -u root -p clinprecision_db < V004__recreate_study_versions_table_for_ddd.sql

# If mysql not in PATH, use full path
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p clinprecision_db < V004__recreate_study_versions_table_for_ddd.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to `clinprecision_db`
3. Open `V004__recreate_study_versions_table_for_ddd.sql`
4. Execute the entire script

---

## Step 4: Verify Schema

Run these queries to verify the migration:

```sql
-- Check table structure
DESC study_versions;

-- Check aggregate_uuid type (should be binary(16))
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'clinprecision_db'
  AND TABLE_NAME = 'study_versions'
  AND COLUMN_NAME IN ('aggregate_uuid', 'study_aggregate_uuid', 'previous_active_version_uuid');

-- Expected output:
-- aggregate_uuid                 | binary  | binary(16)       | YES
-- study_aggregate_uuid           | binary  | binary(16)       | YES
-- previous_active_version_uuid   | binary  | binary(16)       | YES

-- Check all columns exist
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'clinprecision_db'
  AND TABLE_NAME = 'study_versions'
ORDER BY ORDINAL_POSITION;

-- Check constraints
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'clinprecision_db'
  AND TABLE_NAME = 'study_versions';

-- Check indexes
SHOW INDEX FROM study_versions;
```

---

## Step 5: Run Tests

```powershell
cd backend\clinprecision-clinops-service
mvn clean test
```

**Expected**: All 37 tests should pass!

---

## If Migration Fails - Rollback

If something goes wrong, rollback to the original structure:

```powershell
cd backend\clinprecision-db\migrations
mysql -u root -p clinprecision_db < V004__recreate_study_versions_table_for_ddd_ROLLBACK.sql
```

Then restore your backup:
```powershell
mysql -u root -p clinprecision_db < backup_before_v004.sql
```

---

## After Successful Migration

1. ✅ Tests pass
2. ✅ Schema validated
3. **Next Step**: Delete legacy `StudyVersionEntity.java` and related files

See the conversation summary for the list of files to clean up.

---

## Technical Details

### What This Migration Does:

1. **Drops** the existing `study_versions` table
2. **Recreates** it with:
   - `aggregate_uuid BINARY(16)` (was VARCHAR(36))
   - `study_aggregate_uuid BINARY(16)` (NEW - DDD field)
   - `previous_active_version_uuid BINARY(16)` (NEW - DDD field)
   - `approval_comments TEXT` (NEW)
   - `submission_date DATE` (NEW)
   - `notes TEXT` (NEW - replaces additional_notes)
   - `withdrawal_reason TEXT` (NEW)
   - `withdrawn_by BIGINT` (NEW)
   - `created_at DATETIME` (NEW - DDD standard)
   - Removes: `regulatory_submissions`, `review_comments`, `metadata`, `notify_stakeholders`
   - Keeps legacy fields for backward compatibility: `study_id`, `previous_version_id`, `created_date`, `amendment_reason`

3. **Adds** proper indexes for DDD query patterns
4. **Maintains** all foreign key relationships

### Why DROP and RECREATE?

The ALTER TABLE approach in V003 was complex and error-prone due to:
- Multiple column type changes
- Enum modifications
- JSON → TEXT conversions
- Complex data migrations

A clean DROP/RECREATE ensures:
- ✅ Clean schema structure
- ✅ No residual migration issues
- ✅ Matches ProtocolVersionEntity exactly
- ✅ Easier to maintain

---

## Questions?

If you encounter errors, share:
1. The exact error message
2. Output of `DESC study_versions;`
3. MySQL version: `SELECT VERSION();`
