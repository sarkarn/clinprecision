# Database Migration: User ID Standardization for Study Documents

## Overview
This migration adds missing columns to the `study_documents` table to support the complete document lifecycle (approval, archival, supersession, and soft deletion). All user ID fields are standardized to `BIGINT` type to align with the system-wide user ID format.

## Migration Files

### 1. Forward Migration (Apply)
**File**: `V001__add_document_lifecycle_columns.sql`

**Location**: `backend/clinprecision-db/migrations/`

**What it does**:
- Adds `approved_by` (BIGINT) and `approved_at` (TIMESTAMP) columns
- Adds `archived_by` (BIGINT) and `archived_at` (TIMESTAMP) columns
- Adds `superseded_by_document_id` (VARCHAR(36)) column
- Adds `is_deleted` (BOOLEAN) column for soft deletes
- Creates foreign key constraints to `users` table
- Creates indexes for query performance

### 2. Rollback Migration (Revert)
**File**: `V001__add_document_lifecycle_columns_ROLLBACK.sql`

**Location**: `backend/clinprecision-db/migrations/`

**What it does**:
- Removes all columns added by the forward migration
- ⚠️ **WARNING**: This will permanently delete data in these columns!

### 3. Updated Schema
**File**: `consolidated_schema.sql` (UPDATED)

**Location**: `backend/clinprecision-db/ddl/`

**What changed**:
- Added all new columns to the `study_documents` table definition
- Added foreign key constraints
- Added performance indexes
- This ensures new database installations have the complete schema

## Execution Instructions

### For Existing Database (Migration)

#### Option 1: Using MySQL Command Line

```bash
# Navigate to migrations directory
cd backend/clinprecision-db/migrations/

# Connect to MySQL
mysql -u <username> -p <database_name>

# Run migration
source V001__add_document_lifecycle_columns.sql

# Verify
DESCRIBE study_documents;
```

#### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open `V001__add_document_lifecycle_columns.sql`
4. Click "Execute" (⚡ icon)
5. Verify by running: `DESCRIBE study_documents;`

#### Option 3: Using DBeaver
1. Open DBeaver
2. Connect to your database
3. Right-click on database → SQL Editor → Open SQL Script
4. Select `V001__add_document_lifecycle_columns.sql`
5. Execute (Ctrl+Enter or Execute button)
6. Verify schema changes

### For Development/Testing (H2 Database)

The H2 test database will automatically pick up the schema changes from the JPA entities since it uses `ddl-auto: create-drop`. No manual migration needed for tests.

### For New Database Installations

Use the updated `consolidated_schema.sql` which includes all columns:

```bash
mysql -u <username> -p <database_name> < backend/clinprecision-db/ddl/consolidated_schema.sql
```

## Verification Queries

After running the migration, verify the changes:

```sql
-- Check table structure
DESCRIBE study_documents;

-- Verify new columns exist
SHOW COLUMNS FROM study_documents LIKE 'approved_by';
SHOW COLUMNS FROM study_documents LIKE 'archived_by';
SHOW COLUMNS FROM study_documents LIKE 'is_deleted';

-- Check foreign keys
SELECT 
    CONSTRAINT_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'study_documents'
  AND TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check indexes
SHOW INDEX FROM study_documents;

-- Verify data integrity (should return 0 rows with invalid user IDs)
SELECT * FROM study_documents 
WHERE approved_by IS NOT NULL AND approved_by NOT IN (SELECT id FROM users);

SELECT * FROM study_documents 
WHERE archived_by IS NOT NULL AND archived_by NOT IN (SELECT id FROM users);
```

## Expected Schema After Migration

The `study_documents` table should have these columns:

| Column | Type | Null | Default | Comment |
|--------|------|------|---------|---------|
| id | BIGINT | NO | AUTO_INCREMENT | Primary key |
| aggregate_uuid | VARCHAR(36) | NO | | UUID for Axon aggregate |
| study_id | BIGINT | NO | | Reference to studies |
| name | VARCHAR(255) | NO | | Document name |
| document_type | VARCHAR(50) | NO | | Type (Protocol, ICF, etc.) |
| file_name | VARCHAR(255) | NO | | Original filename |
| file_path | VARCHAR(500) | NO | | Storage path |
| file_size | BIGINT | NO | | Size in bytes |
| mime_type | VARCHAR(100) | YES | | MIME type |
| version | VARCHAR(50) | YES | '1.0' | Version number |
| status | ENUM | YES | 'CURRENT' | DRAFT/CURRENT/SUPERSEDED/ARCHIVED |
| description | TEXT | YES | | Description |
| uploaded_by | BIGINT | NO | | **User ID who uploaded** |
| uploaded_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Upload time |
| **approved_by** | **BIGINT** | **YES** | **NULL** | **✨ NEW: User ID who approved** |
| **approved_at** | **TIMESTAMP** | **YES** | **NULL** | **✨ NEW: Approval time** |
| **superseded_by_document_id** | **VARCHAR(36)** | **YES** | **NULL** | **✨ NEW: Superseding document UUID** |
| **archived_by** | **BIGINT** | **YES** | **NULL** | **✨ NEW: User ID who archived** |
| **archived_at** | **TIMESTAMP** | **YES** | **NULL** | **✨ NEW: Archival time** |
| **is_deleted** | **BOOLEAN** | **NO** | **FALSE** | **✨ NEW: Soft delete flag** |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Created time |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Updated time |

## Rollback Instructions

⚠️ **IMPORTANT**: Only rollback if absolutely necessary. This will delete data!

```bash
# Connect to MySQL
mysql -u <username> -p <database_name>

# Run rollback
source V001__add_document_lifecycle_columns_ROLLBACK.sql

# Verify rollback
DESCRIBE study_documents;
```

## Impact Assessment

### Tables Affected
- ✅ `study_documents` - Main table (columns added)
- ✅ `study_document_audit` - No changes (already has `performed_by` as BIGINT)

### Code Alignment
After this migration, the database schema will match the Java entities:

| Entity | Field | Database Column | Type |
|--------|-------|----------------|------|
| StudyDocumentEntity | uploadedBy | uploaded_by | BIGINT ✅ |
| StudyDocumentEntity | approvedBy | approved_by | BIGINT ✅ |
| StudyDocumentEntity | archivedBy | archived_by | BIGINT ✅ |
| StudyDocumentAuditEntity | performedBy | performed_by | BIGINT ✅ |

### Application Changes Required
✅ **NONE** - All Java code has already been updated to use `Long` (BIGINT) for user IDs in:
- Entities (StudyDocumentEntity, StudyDocumentAuditEntity)
- Aggregates (StudyDocumentAggregate)
- Commands (all document commands)
- Events (all document events)
- DTOs (all request/response DTOs)
- Services (StudyDocumentCommandService, StudyDocumentQueryService)
- Controllers (StudyDocumentController)

## Testing After Migration

### 1. Unit Tests
```bash
cd backend/clinprecision-clinops-service
mvn clean test
```

**Expected Result**: All 19 tests should pass

### 2. Integration Tests
```bash
mvn test -Dtest=StudyDDDIntegrationTest
```

**Expected Result**: 18 tests pass

### 3. Smoke Test Queries
```sql
-- Test document upload (should work with BIGINT user ID)
INSERT INTO study_documents (
    aggregate_uuid, study_id, name, document_type, file_name, 
    file_path, file_size, uploaded_by
) VALUES (
    UUID(), 1, 'Test Protocol', 'PROTOCOL', 'test.pdf', 
    '/uploads/test.pdf', 12345, 1
);

-- Test document approval (should accept BIGINT user ID)
UPDATE study_documents 
SET approved_by = 2, approved_at = NOW(), status = 'CURRENT'
WHERE id = LAST_INSERT_ID();

-- Test document archival (should accept BIGINT user ID)
UPDATE study_documents 
SET archived_by = 3, archived_at = NOW(), status = 'ARCHIVED'
WHERE id = LAST_INSERT_ID();

-- Cleanup
DELETE FROM study_documents WHERE id = LAST_INSERT_ID();
```

## Troubleshooting

### Issue: Foreign key constraint fails
**Cause**: User IDs in data don't exist in `users` table

**Solution**:
```sql
-- Check for orphaned records
SELECT DISTINCT uploaded_by FROM study_documents 
WHERE uploaded_by NOT IN (SELECT id FROM users);

-- Fix by creating placeholder users or setting to NULL (if allowed)
UPDATE study_documents SET uploaded_by = 1 WHERE uploaded_by NOT IN (SELECT id FROM users);
```

### Issue: Migration fails on existing data
**Cause**: Existing `approved_by` or `archived_by` columns with wrong type

**Solution**:
```sql
-- Check if columns already exist
SHOW COLUMNS FROM study_documents LIKE 'approved_by';

-- If they exist with wrong type, drop them first
ALTER TABLE study_documents DROP COLUMN approved_by;
ALTER TABLE study_documents DROP COLUMN archived_by;

-- Then rerun migration
```

### Issue: H2 test database still shows VARCHAR
**Cause**: Schema validation might be using old cached schema

**Solution**:
```bash
# Clean build and restart
mvn clean
mvn compile
mvn test
```

## Timeline

| Date | Action | Status |
|------|--------|--------|
| 2025-10-05 | Code updated (28 files) | ✅ Complete |
| 2025-10-05 | Migration scripts created | ✅ Ready |
| TBD | Database migration executed | ⏳ Pending |
| TBD | Tests verified passing | ⏳ Pending |

## Related Changes

This migration is part of the Phase 4 cleanup initiative:
- **Files Changed**: 28 Java files
- **Purpose**: Standardize all user IDs to BIGINT (Long) throughout the system
- **Scope**: Document management module (StudyDocument aggregate)
- **Branch**: CLINOPS_DDD_IMPL

## Support

If you encounter issues:
1. Check the verification queries above
2. Review the troubleshooting section
3. Check application logs for schema validation errors
4. Verify user IDs exist in the `users` table

## Success Criteria

✅ Migration completed successfully when:
1. All new columns exist with correct types
2. Foreign keys are properly created
3. Indexes are in place
4. Unit tests pass (19/19)
5. Integration tests pass (18/18)
6. No schema validation errors in logs
7. Application starts without errors

---

**Ready to execute!** 🚀

Review the scripts and run them when ready. The forward migration is safe to run as it only adds new columns without modifying existing data.
