# Execute V003 Migration - Quick Guide

## Step 1: Backup Database
```bash
mysqldump -u root -p clinprecision_db > backup_before_v003_$(date +%Y%m%d_%H%M%S).sql
```

## Step 2: Execute Migration
```bash
cd backend\clinprecision-db\migrations
mysql -u root -p clinprecision_db < V003__align_study_versions_with_ddd_protocol_version.sql
```

## Step 3: Verify Schema
```sql
-- Check aggregate_uuid type changed to BINARY(16)
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'study_versions'
  AND COLUMN_NAME = 'aggregate_uuid';
-- Expected: binary(16)

-- Check new columns exist
DESC study_versions;
-- Should see: study_aggregate_uuid, approval_comments, submission_date, notes, etc.
```

## Step 4: Check for Errors
If migration fails, check error and rollback:
```bash
mysql -u root -p clinprecision_db < V003__align_study_versions_with_ddd_protocol_version_ROLLBACK.sql
```

## Done!
Proceed to Step 2: Delete legacy StudyVersionEntity
