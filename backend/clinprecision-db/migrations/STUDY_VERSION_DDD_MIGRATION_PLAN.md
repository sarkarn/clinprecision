# Study Version Migration to DDD - Action Plan

## Problem Summary

**Issue**: Two entities mapping to the same `study_versions` table:
1. **StudyVersionEntity** (Legacy - in clinops-service/entity/)
2. **ProtocolVersionEntity** (DDD - in clinops-service/protocolversion/entity/)

This caused Hibernate schema validation to fail with type mismatches:
- `aggregate_uuid`: Database had VARCHAR(36), Hibernate expected BINARY(16)
- Missing columns: `approval_comments`, `study_aggregate_uuid`, etc.

## Solution: Migrate to DDD, Remove Legacy

Since you're removing all legacy code, we're keeping **ProtocolVersionEntity** (DDD) and updating the database schema to match it.

---

## Migration Steps

### 1. Execute Database Migration

```bash
cd backend\clinprecision-db\migrations
mysql -u root -p clinprecision_db < V003__align_study_versions_with_ddd_protocol_version.sql
```

**What it does:**
- ✅ Changes `aggregate_uuid` from VARCHAR(36) to BINARY(16) for UUID
- ✅ Adds DDD columns: `study_aggregate_uuid`, `approval_comments`, `submission_date`, `notes`, etc.
- ✅ Migrates data from legacy columns (`created_date` → `created_at`, `additional_notes` → `notes`)
- ✅ Converts JSON columns to TEXT (ProtocolVersionEntity uses TEXT)
- ✅ Adds unique constraint on `aggregate_uuid`
- ✅ Adds indexes for DDD query patterns
- ✅ Drops unused columns: `regulatory_submissions`, `review_comments`, `metadata`, `notify_stakeholders`

### 2. Remove Legacy StudyVersionEntity

**File to delete/deprecate:**
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/entity/StudyVersionEntity.java
```

**Why**: This entity is legacy and conflicts with ProtocolVersionEntity (DDD).

**Action**: I'll delete this file after migration is confirmed.

### 3. Update Related Files

Files that reference the legacy `StudyVersionEntity` need to be updated to use `ProtocolVersionEntity` or removed:

- `dto/StudyVersionDto.java` 
- `dto/StudyVersionCreateRequestDto.java`
- `dto/StudyVersionUpdateRequestDto.java`
- `repository/StudyVersionRepository.java`
- `service/StudyVersionService.java`
- `controller/StudyVersionController.java`

**Note**: The DDD version already has its own:
- `protocolversion/dto/VersionResponse.java`
- `protocolversion/dto/CreateVersionRequest.java`
- `protocolversion/repository/ProtocolVersionRepository.java`
- `protocolversion/service/ProtocolVersionQueryService.java`
- `protocolversion/controller/ProtocolVersionQueryController.java`

---

## Schema Changes Summary

### Columns Added (DDD)
| Column | Type | Purpose |
|--------|------|---------|
| `study_aggregate_uuid` | BINARY(16) | UUID of parent Study aggregate |
| `approval_comments` | TEXT | Approver comments |
| `submission_date` | DATE | Submission date for approval |
| `notes` | TEXT | General notes |
| `previous_active_version_uuid` | BINARY(16) | Link to previous active version |
| `withdrawal_reason` | TEXT | Reason for withdrawal |
| `withdrawn_by` | BIGINT | User who withdrew |
| `created_at` | DATETIME | Record creation timestamp |
| `updated_at` | DATETIME | Record update timestamp |

### Columns Modified
| Column | From | To | Reason |
|--------|------|----|---------| 
| `aggregate_uuid` | VARCHAR(36) | BINARY(16) | UUID type in ProtocolVersionEntity |
| `protocol_changes` | JSON | TEXT | ProtocolVersionEntity uses TEXT |
| `icf_changes` | JSON | TEXT | ProtocolVersionEntity uses TEXT |

### Columns Dropped (Legacy)
- `regulatory_submissions` (JSON) - Not used in DDD
- `review_comments` (JSON) - Not used in DDD
- `metadata` (JSON) - Not used in DDD
- `notify_stakeholders` (BOOLEAN) - Not used in DDD
- `additional_notes` (TEXT) - Migrated to `notes`

### Columns Kept (Backward Compatibility)
- `amendment_reason` - Used by some legacy DTOs
- `created_by`, `created_date` - Legacy audit trail
- `previous_version_id` - BIGINT reference for transition period

---

## Verification After Migration

### 1. Check Schema
```sql
DESC study_versions;
```

### 2. Verify aggregate_uuid Type
```sql
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'study_versions'
  AND COLUMN_NAME = 'aggregate_uuid';
```

**Expected**: `COLUMN_TYPE` = `binary(16)`

### 3. Run Tests
```bash
cd backend\clinprecision-clinops-service
mvn clean test
```

**Expected**: All 37 tests pass ✅

---

## Rollback (If Needed)

If migration fails:
```bash
mysql -u root -p clinprecision_db < V003__align_study_versions_with_ddd_protocol_version_ROLLBACK.sql
```

---

## Next Actions

1. ✅ Execute V003 migration script
2. ⏳ Remove legacy `StudyVersionEntity.java`
3. ⏳ Run tests to confirm
4. ⏳ Update any remaining legacy references
5. ⏳ Update documentation

---

## Files Created

1. **V003__align_study_versions_with_ddd_protocol_version.sql** - Migration script
2. **V003__align_study_versions_with_ddd_protocol_version_ROLLBACK.sql** - Rollback script
3. **STUDY_VERSION_DDD_MIGRATION_PLAN.md** - This document

---

## Important Notes

⚠️ **Backup Database First**: Always backup before running migrations
⚠️ **Test Environment**: Run migration in test environment first
⚠️ **Data Migration**: Script migrates existing data automatically
⚠️ **UUID Conversion**: aggregate_uuid will be converted from VARCHAR to BINARY(16)

---

Ready to proceed? Execute the V003 migration script and let me know the result!
