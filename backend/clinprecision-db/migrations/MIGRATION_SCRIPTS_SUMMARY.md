# Database Migration Scripts - Summary

## Created Files

### Migration Scripts

1. **V001__add_document_lifecycle_columns.sql**
   - Adds 6 columns to `study_documents`: approved_by, approved_at, archived_by, archived_at, superseded_by_document_id, is_deleted
   - Adds 2 foreign keys: approved_by → users(id), archived_by → users(id)
   - Adds 4 indexes for performance

2. **V002__add_aggregate_uuid_to_study_versions.sql**
   - Adds `aggregate_uuid` column to `study_versions` table
   - Adds index on aggregate_uuid

### Rollback Scripts

1. **V001__add_document_lifecycle_columns_ROLLBACK.sql**
   - Removes all changes from V001

2. **V002__add_aggregate_uuid_to_study_versions_ROLLBACK.sql**
   - Removes all changes from V002

### Verification Script

1. **VERIFY_MIGRATION.sql**
   - Automated tests for V001 migration
   - 7 comprehensive validation checks

### Updated Schema

1. **consolidated_schema.sql** (UPDATED)
   - Complete schema for new installations
   - Includes all new columns

## Execution Order

```sql
-- 1. Execute main migrations
mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns.sql
mysql -u root -p clinprecision_db < V002__add_aggregate_uuid_to_study_versions.sql

-- 2. Verify (optional)
mysql -u root -p clinprecision_db < VERIFY_MIGRATION.sql

-- 3. If rollback needed (emergency only)
mysql -u root -p clinprecision_db < V002__add_aggregate_uuid_to_study_versions_ROLLBACK.sql
mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns_ROLLBACK.sql
```

## Java Code Changes (Already Complete ✅)

- Fixed: StudyDocumentAuditRepository.findByPerformedBy (String → Long)
- Fixed: StudyReadRepository (all query methods use correct entity fields)
- Updated: 28 Java files (entities, DTOs, events, commands) - user ID fields now Long

## Next Steps

1. Execute V001 migration script
2. Execute V002 migration script
3. Run: `mvn clean test`
4. Expected: All 19 tests pass ✅
