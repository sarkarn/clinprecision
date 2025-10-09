# Migration Execution Guide

**Date:** October 4, 2025  
**Branch:** CLINOPS_DDD_IMPL  
**Strategy:** Direct Migration (No Adapters)  

---

## 🎯 Overview

This guide provides step-by-step instructions for executing the direct migration from legacy CRUD to CQRS/Event Sourcing architecture.

**Migration Approach:** Read legacy data → Replay as events → Verify → Switch to new API → Delete legacy code

**Timeline:** ~15 days (Oct 7 - Oct 21, 2025)

---

## 📋 Pre-Migration Checklist

Before starting migration, ensure:

- [ ] ✅ All 3 migration service files created and compile cleanly
- [ ] ✅ `application.properties` updated with migration config
- [ ] ✅ Development database backed up
- [ ] ✅ StudyDesign aggregate Phase 3 is complete and tested
- [ ] ✅ Event store tables exist (`domain_event_entry`, `snapshot_event_entry`)
- [ ] ✅ Read model tables exist (`study_design_view`, etc.)
- [ ] ✅ Migration controller endpoints are accessible (when enabled)

---

## 🔧 Step 1: Enable Migration Controller (Development Only)

**File:** `backend/clinprecision-clinops-service/src/main/resources/application.properties`

```properties
# Enable migration controller for testing
clinprecision.migration.controller-enabled=true
clinprecision.migration.dry-run=true
```

**⚠️ IMPORTANT:** Only enable in development/staging. Never in production.

**Restart service:**
```powershell
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

**Verify controller is active:**
```powershell
curl http://localhost:8083/api/admin/migration/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Migration Controller",
  "migrationInProgress": "false"
}
```

---

## 🧪 Step 2: Dry-Run Migration (Test Mode)

**Purpose:** Validate migration logic without writing data

### 2.1 Check Current Status

```powershell
curl http://localhost:8083/api/admin/migration/status
```

Expected response:
```json
{
  "migrationInProgress": false,
  "lastMigrationReport": null,
  "lastMigrationTime": null,
  "message": "No migration has been executed yet"
}
```

### 2.2 Execute Dry-Run

```powershell
curl -X POST "http://localhost:8083/api/admin/migration/execute?dryRun=true"
```

**What happens:**
- ✅ Reads all studies from legacy tables
- ✅ Validates data can be converted
- ✅ Simulates command execution
- ❌ Does NOT write to event store
- ✅ Returns detailed report

**Expected output:**
```json
{
  "totalStudies": 10,
  "successfulStudies": 10,
  "failedStudies": 0,
  "totalArms": 25,
  "totalVisits": 150,
  "totalForms": 300,
  "successes": [...],
  "failures": [],
  "verificationFailures": [],
  "startTime": "2025-10-07T10:00:00",
  "endTime": "2025-10-07T10:00:05",
  "dryRun": true,
  "successful": true
}
```

### 2.3 Review Dry-Run Report

```powershell
curl http://localhost:8083/api/admin/migration/summary
```

**Look for:**
- ✅ Success rate: Should be 100%
- ✅ Failed studies: Should be 0
- ✅ Verification failures: Should be 0
- ⚠️ Any warnings or errors in logs

**If dry-run fails:**
1. Check application logs for stack traces
2. Fix data issues in legacy tables
3. Fix migration service logic if needed
4. Re-run dry-run until 100% success

---

## 💾 Step 3: Backup Database

**CRITICAL:** Always backup before real migration!

```powershell
# Create backup directory
New-Item -ItemType Directory -Force -Path "c:\nnsproject\clinprecision\backups"

# Backup MySQL database
mysqldump -u root -p clinprecision > "c:\nnsproject\clinprecision\backups\clinprecision_before_migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```

**Verify backup:**
```powershell
# Check file size (should be several MB)
Get-Item "c:\nnsproject\clinprecision\backups\*.sql" | Select-Object Name, Length
```

**Test restore (optional but recommended):**
```powershell
# Create test database
mysql -u root -p -e "CREATE DATABASE clinprecision_test;"

# Restore to test database
mysql -u root -p clinprecision_test < "c:\nnsproject\clinprecision\backups\clinprecision_before_migration_*.sql"

# Verify tables
mysql -u root -p -e "USE clinprecision_test; SHOW TABLES;"

# Drop test database
mysql -u root -p -e "DROP DATABASE clinprecision_test;"
```

---

## 🚀 Step 4: Execute Real Migration

**Update configuration:**

```properties
# application.properties
clinprecision.migration.dry-run=false  # ← CHANGE THIS
clinprecision.migration.controller-enabled=true
```

**Restart service:**
```powershell
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

**Execute migration:**
```powershell
curl -X POST "http://localhost:8083/api/admin/migration/execute?dryRun=false"
```

**Monitor logs:**
```
🚀 Starting migration of all studies (dry-run=false)
Found 10 studies to migrate
📋 Migrating study ID: 1 - 'Study Alpha'
  Generated UUID: 550e8400-e29b-41d4-a716-446655440000
  ✅ Migrated 3 arms
  ✅ Migrated 15 visits
  ✅ Migrated 30 form assignments
  ✅ Verification passed: 3 arms, 15 visits, 30 forms
✅ Study 1 migrated successfully as 550e8400-e29b-41d4-a716-446655440000
...
✅ Migration complete
```

**Expected duration:** 5-10 seconds per study (depends on complexity)

**Retrieve final report:**
```powershell
curl http://localhost:8083/api/admin/migration/report
```

---

## 🔍 Step 5: Verify Migration

### 5.1 Check Event Store

```sql
-- Count events written
SELECT COUNT(*) FROM domain_event_entry;

-- Sample events
SELECT 
    aggregate_identifier,
    type,
    timestamp,
    payload_type
FROM domain_event_entry
ORDER BY timestamp DESC
LIMIT 20;
```

Expected:
- Multiple events per study (InitializeStudyDesign, AddStudyArm, DefineVisit, etc.)
- Aggregate identifiers are UUIDs
- Timestamps are recent

### 5.2 Check Read Models

```sql
-- Check study_design_view table
SELECT * FROM study_design_view LIMIT 10;

-- Count migrated records
SELECT COUNT(*) FROM study_arms WHERE aggregate_uuid IS NOT NULL;
SELECT COUNT(*) FROM visit_definitions WHERE aggregate_uuid IS NOT NULL;
SELECT COUNT(*) FROM visit_forms WHERE aggregate_uuid IS NOT NULL;
```

Expected:
- `aggregate_uuid` fields populated with UUIDs
- `arm_uuid`, `visit_uuid`, `assignment_uuid` fields populated
- Record counts match legacy tables

### 5.3 Test Query Service

```powershell
# Get study design (replace UUID with actual one from migration report)
curl http://localhost:8083/api/study-designs/550e8400-e29b-41d4-a716-446655440000

# Get study arms
curl http://localhost:8083/api/study-designs/550e8400-e29b-41d4-a716-446655440000/arms

# Get visits
curl http://localhost:8083/api/study-designs/550e8400-e29b-41d4-a716-446655440000/visits
```

Expected:
- 200 OK responses
- Data matches legacy records
- UUIDs in response

### 5.4 Spot-Check Data Integrity

**Compare record counts:**
```sql
-- Study Arms
SELECT 
    'Legacy' AS source, 
    COUNT(*) AS count 
FROM study_arms WHERE arm_uuid IS NULL
UNION ALL
SELECT 
    'Migrated' AS source, 
    COUNT(*) AS count 
FROM study_arms WHERE arm_uuid IS NOT NULL;

-- Visit Definitions
SELECT 
    'Legacy' AS source, 
    COUNT(*) AS count 
FROM visit_definitions WHERE visit_uuid IS NULL
UNION ALL
SELECT 
    'Migrated' AS source, 
    COUNT(*) AS count 
FROM visit_definitions WHERE visit_uuid IS NOT NULL;
```

**Compare specific study:**
```sql
-- Pick a study ID to verify
SET @study_id = 1;

-- Compare arms
SELECT 
    'Legacy' AS source,
    id,
    name,
    type,
    sequence_number
FROM study_arms 
WHERE study_id = @study_id AND arm_uuid IS NULL
UNION ALL
SELECT 
    'Migrated' AS source,
    id,
    name,
    type,
    sequence_number
FROM study_arms 
WHERE study_id = @study_id AND arm_uuid IS NOT NULL
ORDER BY sequence_number;
```

Expected:
- Counts match
- Data fields match
- No missing records

---

## ✅ Step 6: Migration Success Criteria

Before proceeding to next steps, verify:

- [ ] ✅ Migration report shows 100% success rate
- [ ] ✅ Zero failed studies
- [ ] ✅ Zero verification failures
- [ ] ✅ Event store populated with events
- [ ] ✅ Read models populated with UUIDs
- [ ] ✅ Record counts match (legacy vs migrated)
- [ ] ✅ Query service returns correct data
- [ ] ✅ No errors in application logs
- [ ] ✅ Database backup created and verified

---

## 🔄 Rollback Procedure (If Needed)

### Option 1: Restore from Backup

```powershell
# Stop service
# Restore database
mysql -u root -p clinprecision < "c:\nnsproject\clinprecision\backups\clinprecision_before_migration_*.sql"

# Restart service
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

### Option 2: Clear Migrated Data

```sql
-- WARNING: Only use if you need to re-run migration

-- Clear event store
DELETE FROM domain_event_entry 
WHERE aggregate_identifier IN (
    SELECT DISTINCT aggregate_uuid 
    FROM study_arms 
    WHERE aggregate_uuid IS NOT NULL
);

-- Clear UUID fields (preserves legacy data)
UPDATE study_arms SET 
    aggregate_uuid = NULL,
    arm_uuid = NULL
WHERE aggregate_uuid IS NOT NULL;

UPDATE visit_definitions SET 
    aggregate_uuid = NULL,
    visit_uuid = NULL
WHERE aggregate_uuid IS NOT NULL;

UPDATE visit_forms SET 
    aggregate_uuid = NULL,
    assignment_uuid = NULL,
    visit_uuid = NULL
WHERE aggregate_uuid IS NOT NULL;
```

### Option 3: Re-run Migration

If you need to fix data and re-migrate:

1. Rollback using Option 2
2. Fix data issues in legacy tables
3. Update migration service logic if needed
4. Re-run dry-run to verify fixes
5. Execute migration again

---

## 📊 Migration Monitoring

### Real-Time Monitoring

**Terminal 1: Application Logs**
```powershell
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

Watch for:
- 🚀 Migration start
- 📋 Study progress
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warnings

**Terminal 2: Database Monitoring**
```sql
-- Watch event creation in real-time
SELECT 
    COUNT(*) AS total_events,
    MAX(timestamp) AS latest_event
FROM domain_event_entry;

-- Refresh every 5 seconds
```

### Post-Migration Analysis

**Event Distribution:**
```sql
SELECT 
    payload_type,
    COUNT(*) AS count
FROM domain_event_entry
GROUP BY payload_type
ORDER BY count DESC;
```

Expected event types:
- `InitializeStudyDesignCommand`
- `AddStudyArmCommand`
- `DefineVisitCommand`
- `AssignFormToVisitCommand`

**Timeline Analysis:**
```sql
SELECT 
    DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i') AS minute,
    COUNT(*) AS events_per_minute
FROM domain_event_entry
GROUP BY minute
ORDER BY minute;
```

---

## 🎓 Troubleshooting

### Issue: Migration Fails with "Command handler not found"

**Cause:** Axon command handlers not registered

**Fix:**
1. Verify `StudyDesignAggregate` exists and has `@AggregateRoot`
2. Check `@CommandHandler` annotations on aggregate methods
3. Restart service to re-register handlers

### Issue: "Aggregate with identifier X not found"

**Cause:** StudyDesign aggregate not initialized before adding arms/visits

**Fix:**
1. Verify `initializeStudyDesign()` is called first in migration
2. Check command order in logs
3. Ensure `commandService.initializeStudyDesign()` completes before arm commands

### Issue: Verification fails with count mismatch

**Cause:** Query service returning incomplete data

**Fix:**
1. Check projection event handlers
2. Verify read model tables populated
3. Add delay between command and query (eventual consistency)
4. Check for filtering (deleted records, etc.)

### Issue: "Concurrent modification exception"

**Cause:** Multiple migration requests or conflicting updates

**Fix:**
1. Ensure only one migration runs at a time
2. Check `migrationInProgress` flag
3. Restart service to clear state

### Issue: Dry-run succeeds but real migration fails

**Cause:** Transaction rollback, constraint violations, or event store errors

**Fix:**
1. Check database constraints
2. Verify event serialization works
3. Look for unique constraint violations
4. Check database permissions

---

## 📝 Next Steps After Successful Migration

Once migration is verified successful:

1. **Update Controllers** → Implement new UUID-based REST API
2. **Update UI** → Change API calls to use UUIDs instead of Long IDs
3. **Test End-to-End** → Verify all workflows work with new API
4. **Delete Legacy Code** → Remove adapters, old services, old DTOs
5. **Drop Legacy Tables** → After 30-day verification period

See `DIRECT_MIGRATION_STRATEGY.md` for detailed next steps.

---

## 🔒 Security Notes

### Production Safety

**DO NOT** enable migration controller in production:
```properties
# Production application.properties
clinprecision.migration.controller-enabled=false
```

### Access Control

Migration endpoints should be:
- [ ] Behind admin authentication
- [ ] IP whitelisted (internal network only)
- [ ] Audit logged
- [ ] Rate limited

### Data Protection

- [ ] Always backup before migration
- [ ] Test restore procedure
- [ ] Keep backups for 90 days
- [ ] Encrypt backups at rest

---

## 📞 Support

If you encounter issues during migration:

1. **Check Logs:** Review application logs for errors
2. **Review Report:** Check migration report for failure details
3. **Verify Data:** Compare legacy vs migrated data
4. **Rollback if Needed:** Use backup to restore
5. **Fix and Retry:** Address issues and re-run migration

---

## ✨ Success Indicators

Migration is successful when:

- ✅ 100% success rate in migration report
- ✅ Zero errors or warnings in logs
- ✅ Event store populated with all events
- ✅ Read models match legacy data
- ✅ Query service returns correct data
- ✅ All verification checks pass

**You are now ready to proceed with controller and UI updates!**

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Status:** READY FOR EXECUTION
