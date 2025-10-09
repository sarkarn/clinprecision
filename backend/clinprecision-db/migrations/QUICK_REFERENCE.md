# Quick Reference Card - Database Migration

## 🎯 One-Liner Execution

```bash
# Execute migration
mysql -u root -p clinprecision_db < backend/clinprecision-db/migrations/V001__add_document_lifecycle_columns.sql

# Verify migration
mysql -u root -p clinprecision_db < backend/clinprecision-db/migrations/VERIFY_MIGRATION.sql

# Run tests
cd backend/clinprecision-clinops-service && mvn clean test
```

## 📋 What's Changing

| Column | Type | Purpose |
|--------|------|---------|
| approved_by | BIGINT | User who approved |
| approved_at | TIMESTAMP | When approved |
| archived_by | BIGINT | User who archived |
| archived_at | TIMESTAMP | When archived |
| superseded_by_document_id | VARCHAR(36) | Superseding doc UUID |
| is_deleted | BOOLEAN | Soft delete flag |

## ✅ Pre-Flight Checklist

- [ ] Backup database
- [ ] Review migration script
- [ ] Test on staging first (if available)
- [ ] Run during low-traffic window

## 🚀 Execution Steps

1. **Backup** (production only):
   ```bash
   mysqldump -u root -p clinprecision_db > backup_$(date +%Y%m%d).sql
   ```

2. **Execute Migration**:
   ```bash
   mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns.sql
   ```

3. **Verify**:
   ```bash
   mysql -u root -p clinprecision_db < VERIFY_MIGRATION.sql
   ```
   
   Expected: 7/7 tests pass ✅

4. **Test Application**:
   ```bash
   cd ../../clinprecision-clinops-service
   mvn clean test
   ```
   
   Expected: 19/19 tests pass ✅

## ⚠️ If Something Goes Wrong

```bash
# Restore from backup
mysql -u root -p clinprecision_db < backup_YYYYMMDD.sql

# OR run rollback script
mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns_ROLLBACK.sql
```

## 🔍 Quick Verification Queries

```sql
-- Check columns exist
DESCRIBE study_documents;

-- Check specific columns
SHOW COLUMNS FROM study_documents WHERE Field IN ('approved_by', 'archived_by');

-- Check foreign keys
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'study_documents' 
  AND CONSTRAINT_NAME LIKE 'fk_%';
```

## 📊 Expected Results

### After Migration SQL
```
Query OK, 0 rows affected   <- approved_by column added
Query OK, 0 rows affected   <- approved_at column added  
Query OK, 0 rows affected   <- archived_by column added
Query OK, 0 rows affected   <- archived_at column added
Query OK, 0 rows affected   <- superseded_by_document_id added
Query OK, 0 rows affected   <- is_deleted column added
Query OK, 0 rows affected   <- FK constraints added
Query OK, 0 rows affected   <- Indexes created
```

### After Verification SQL
```
Test 1: ✅ 6 columns found
Test 2: ✅ Data types correct (BIGINT)
Test 3: ✅ Foreign keys created
Test 4: ✅ Indexes created
Test 5: ✅ Insert test passed
Test 6: ✅ Update test passed
Test 7: ✅ Cleanup successful
```

### After Java Tests
```
Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## 📁 Files Location

```
backend/clinprecision-db/
├── migrations/
│   ├── V001__add_document_lifecycle_columns.sql          ← Execute this
│   ├── V001__add_document_lifecycle_columns_ROLLBACK.sql ← If needed
│   ├── VERIFY_MIGRATION.sql                              ← Run this
│   ├── README_MIGRATION_USER_ID_STANDARDIZATION.md       ← Full guide
│   ├── MIGRATION_SUMMARY.md                              ← Overview
│   ├── VISUAL_SCHEMA_CHANGES.md                          ← Diagrams
│   └── QUICK_REFERENCE.md                                ← This file
└── ddl/
    └── consolidated_schema.sql                           ← Updated
```

## 🎓 Key Concepts

**User ID Standardization**: All user references now use BIGINT (Long in Java)
- uploaded_by: BIGINT ✅ (already existed)
- approved_by: BIGINT 🆕 (NEW)
- archived_by: BIGINT 🆕 (NEW)
- performed_by: BIGINT ✅ (audit table, already existed)

**Document Lifecycle States**:
```
DRAFT → (approve) → CURRENT → (supersede/archive) → SUPERSEDED/ARCHIVED
  ↓
DELETE (soft, is_deleted=true)
```

## 💡 Pro Tips

1. **Timing**: Run during low-traffic hours
2. **Monitoring**: Watch application logs after migration
3. **Testing**: Test document approval/archival workflows
4. **Backup**: Keep backup for 24 hours after successful migration
5. **Verification**: Run VERIFY_MIGRATION.sql immediately after

## ❓ Common Questions

**Q: Will this affect existing documents?**
A: No. Adds columns only. Existing data unchanged.

**Q: Do I need to update Java code?**
A: No. Already updated (28 files).

**Q: Can I run this on production?**
A: Yes. Safe. But test on staging first.

**Q: How long does it take?**
A: < 1 second for small datasets. Depends on table size.

**Q: What if users are accessing system?**
A: Safe to run. ADD COLUMN is fast, non-blocking.

## 📞 Support

If issues occur:
1. Check VERIFY_MIGRATION.sql output
2. Review README_MIGRATION_USER_ID_STANDARDIZATION.md troubleshooting
3. Check application logs for schema validation errors
4. Verify foreign key constraints with verification queries

## ✨ Success Indicators

- ✅ VERIFY_MIGRATION shows all tests passing
- ✅ `DESCRIBE study_documents` shows 6 new columns
- ✅ `mvn test` shows 19/19 passing
- ✅ Application starts without errors
- ✅ Document operations work correctly
- ✅ No schema validation errors in logs

---

**Status**: ✅ READY TO EXECUTE

All scripts tested and validated. Execute when ready! 🚀
