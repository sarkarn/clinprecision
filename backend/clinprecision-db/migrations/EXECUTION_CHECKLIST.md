# Migration Execution Checklist

## Phase 1: Pre-Migration ☐

### Review & Preparation
- [ ] Reviewed V001__add_document_lifecycle_columns.sql
- [ ] Reviewed README_MIGRATION_USER_ID_STANDARDIZATION.md
- [ ] Reviewed MIGRATION_SUMMARY.md
- [ ] Reviewed VISUAL_SCHEMA_CHANGES.md
- [ ] Understood what columns are being added (6 total)
- [ ] Understood foreign key constraints (2 total)
- [ ] Understood indexes being created (4 total)

### Environment Verification
- [ ] Confirmed target database name: _________________
- [ ] Confirmed database user credentials
- [ ] Verified database connectivity
- [ ] Checked current table structure: `DESCRIBE study_documents;`
- [ ] Verified users table exists and has data

### Backup (Production Only)
- [ ] Created full database backup
- [ ] Verified backup file exists and is readable
- [ ] Tested backup restoration on test system (optional but recommended)
- [ ] Documented backup location: _________________
- [ ] Documented backup timestamp: _________________

## Phase 2: Migration Execution ☐

### Step 1: Apply Migration
```bash
mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns.sql
```

- [ ] Executed migration script
- [ ] No errors reported
- [ ] All ALTER TABLE statements completed successfully
- [ ] All CREATE INDEX statements completed successfully
- [ ] Execution time recorded: _______ seconds

### Step 2: Verify Migration
```bash
mysql -u root -p clinprecision_db < VERIFY_MIGRATION.sql
```

- [ ] Test 1 PASSED: All 6 columns exist
- [ ] Test 2 PASSED: Data types correct (approved_by = BIGINT)
- [ ] Test 3 PASSED: 2 foreign keys created
- [ ] Test 4 PASSED: 4 indexes created
- [ ] Test 5 PASSED: Insert operation successful
- [ ] Test 6 PASSED: Update operation successful
- [ ] Test 7 PASSED: Test data cleanup successful

### Step 3: Manual Verification (Optional)
```sql
DESCRIBE study_documents;
```

Expected columns visible:
- [ ] approved_by (BIGINT, NULL, FK)
- [ ] approved_at (TIMESTAMP, NULL)
- [ ] archived_by (BIGINT, NULL, FK)
- [ ] archived_at (TIMESTAMP, NULL)
- [ ] superseded_by_document_id (VARCHAR(36), NULL)
- [ ] is_deleted (BOOLEAN, NOT NULL, DEFAULT FALSE)

## Phase 3: Application Testing ☐

### Java Unit Tests
```bash
cd backend/clinprecision-clinops-service
mvn clean test
```

- [ ] Maven clean completed
- [ ] Maven compile completed without errors
- [ ] All 19 tests executed
- [ ] All 19 tests PASSED
- [ ] No schema validation errors in logs
- [ ] BUILD SUCCESS message displayed

### Application Startup
- [ ] Started clinops-service application
- [ ] No errors during startup
- [ ] EntityManagerFactory initialized successfully
- [ ] No Hibernate schema validation errors
- [ ] Application logs show normal startup

### Smoke Tests (Optional but Recommended)
- [ ] Tested document upload (uploadedBy as Long)
- [ ] Tested document approval (approvedBy as Long)
- [ ] Tested document archival (archivedBy as Long)
- [ ] Verified audit trail records (performedBy as Long)
- [ ] Checked query operations return correct data
- [ ] Verified DTOs serialize correctly

## Phase 4: Post-Migration ☐

### Data Integrity Checks
```sql
-- Check for orphaned user IDs (should return 0 rows)
SELECT COUNT(*) FROM study_documents 
WHERE approved_by IS NOT NULL AND approved_by NOT IN (SELECT id FROM users);

SELECT COUNT(*) FROM study_documents 
WHERE archived_by IS NOT NULL AND archived_by NOT IN (SELECT id FROM users);
```

- [ ] No orphaned approved_by references
- [ ] No orphaned archived_by references
- [ ] All foreign key constraints working correctly

### Performance Checks
```sql
-- Verify indexes are being used
EXPLAIN SELECT * FROM study_documents WHERE approved_by = 1;
EXPLAIN SELECT * FROM study_documents WHERE is_deleted = FALSE;
```

- [ ] Index idx_study_documents_approved_by is used
- [ ] Index idx_study_documents_is_deleted is used
- [ ] Query performance is acceptable

### Monitoring (First 24 Hours)
- [ ] Monitor application logs for errors
- [ ] Monitor database slow query log
- [ ] Monitor CPU/memory usage (should be normal)
- [ ] Monitor application response times
- [ ] Check error rates (should be unchanged)

### Documentation
- [ ] Updated deployment notes with migration date
- [ ] Documented any issues encountered (if any)
- [ ] Documented resolution for any issues
- [ ] Updated schema documentation (if maintained)
- [ ] Notified team of successful migration

## Phase 5: Cleanup ☐

### 24 Hours After Successful Migration
- [ ] Verified no rollback needed
- [ ] Application stable for 24 hours
- [ ] No data integrity issues reported
- [ ] No performance degradation observed

### 7 Days After Successful Migration
- [ ] Consider removing old backup (after archiving)
- [ ] Archive migration execution notes
- [ ] Update knowledge base/wiki with lessons learned

## Rollback Plan (If Needed) ☐

⚠️ **ONLY USE IF CRITICAL ISSUES OCCUR**

### Before Rollback
- [ ] Documented reason for rollback: _________________
- [ ] Notified stakeholders
- [ ] Created current state backup (before rollback)

### Execute Rollback
```bash
mysql -u root -p clinprecision_db < V001__add_document_lifecycle_columns_ROLLBACK.sql
```

- [ ] Executed rollback script
- [ ] Verified columns removed: `DESCRIBE study_documents;`
- [ ] Restored original backup (if needed)
- [ ] Restarted application
- [ ] Verified application working with old schema

### After Rollback
- [ ] Investigated root cause
- [ ] Documented findings
- [ ] Created plan to address issues
- [ ] Scheduled new migration attempt (if applicable)

## Issue Tracking ☐

### Issues Encountered (if any)

Issue #1:
- [ ] Description: _________________________________
- [ ] Severity: ☐ Critical  ☐ Major  ☐ Minor
- [ ] Resolution: _________________________________
- [ ] Resolution time: _______ minutes

Issue #2:
- [ ] Description: _________________________________
- [ ] Severity: ☐ Critical  ☐ Major  ☐ Minor
- [ ] Resolution: _________________________________
- [ ] Resolution time: _______ minutes

Issue #3:
- [ ] Description: _________________________________
- [ ] Severity: ☐ Critical  ☐ Major  ☐ Minor
- [ ] Resolution: _________________________________
- [ ] Resolution time: _______ minutes

## Sign-Off ☐

### Migration Execution
- [ ] Executed by: _________________ Date: _________
- [ ] Verified by: _________________ Date: _________
- [ ] Approved by: _________________ Date: _________

### Final Status
- [ ] ✅ SUCCESS - Migration completed without issues
- [ ] ⚠️ SUCCESS WITH ISSUES - Migration completed but issues noted
- [ ] ❌ FAILED - Migration rolled back

### Notes:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Quick Stats

- **Total Columns Added**: 6
- **Total Foreign Keys Added**: 2
- **Total Indexes Added**: 4
- **Total Java Files Changed**: 28 (already done)
- **Expected Test Results**: 19/19 passing
- **Expected Downtime**: None
- **Rollback Available**: Yes

## Success Criteria (Must All Be TRUE)

✅ All phases completed without critical errors
✅ VERIFY_MIGRATION.sql shows 7/7 tests passing
✅ Java tests show 19/19 passing
✅ Application starts without errors
✅ No schema validation errors
✅ Document operations work correctly
✅ Foreign keys enforce referential integrity
✅ Indexes improve query performance
✅ No data integrity issues

---

**Migration Status**: ☐ NOT STARTED  ☐ IN PROGRESS  ☐ COMPLETE

**Overall Result**: ☐ SUCCESS  ☐ FAILED  ☐ ROLLED BACK

**Date Executed**: _________________

**Executed By**: _________________
