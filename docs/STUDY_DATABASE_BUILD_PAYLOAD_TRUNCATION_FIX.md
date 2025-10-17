# Study Database Build - Data Truncation Error Fix

**Date:** October 16, 2025  
**Error:** Data truncation in domain_event_entry table  
**Status:** ✅ READY TO APPLY

---

## Problem Summary

### Error Messages

```
2025-10-16 11:53:11 - SQL Error: 1406, SQLState: 22001
2025-10-16 11:53:11 - Data truncation: Data too long for column 'payload' at row 1
2025-10-16 11:53:11 - Command 'BuildStudyDatabaseCommand' resulted in 
  EventStoreException(Cannot reuse aggregate identifier [3bb95abf-7bdd-45f2-9e06-2085c428d727] 
  to create aggregate [StudyDatabaseBuildAggregate] since identifiers need to be unique.)
```

### Two Interrelated Issues:

**Issue 1: Data Truncation** 🔴 PRIMARY ISSUE
- **Column:** `domain_event_entry.payload` 
- **Current Type:** `BLOB` (max 64KB)
- **Problem:** Event payload exceeds 64KB limit
- **Root Cause:** `BuildStudyDatabaseCommand` contains large data structures:
  - `studyDesignConfiguration` - Form definitions, validation rules
  - `validationRules` - Comprehensive validation config
  - `siteCustomizations`, `performanceSettings`, `complianceSettings`

**Issue 2: Duplicate Aggregate Identifier** 🟡 SECONDARY ISSUE
- **Aggregate ID:** `3bb95abf-7bdd-45f2-9e06-2085c428d727`
- **Problem:** First event insertion failed due to truncation, but aggregate ID was already registered
- **Root Cause:** Transaction isolation - aggregate creation started but event storage failed
- **Result:** Subsequent retry attempts with same UUID fail with "duplicate identifier" error

---

## Root Cause Analysis

### 1. Why Payload is Too Large

The `BuildStudyDatabaseCommand` serializes to JSON with structure like:

```json
{
  "studyDatabaseBuildId": "3bb95abf-7bdd-45f2-9e06-2085c428d727",
  "studyId": 123,
  "studyName": "Example Study",
  "studyProtocol": "PROTO-001",
  "studyDesignConfiguration": {
    "forms": [
      // Array of form definitions with all fields
      {
        "id": 1,
        "name": "Demographics",
        "fields": [
          // Many field definitions with metadata, validation, options, etc.
          {
            "id": "field1",
            "label": "...",
            "type": "...",
            "validationRules": {...},
            "options": [...]
          }
          // ... potentially hundreds of fields
        ]
      }
      // ... multiple forms
    ],
    "visits": [...],  // All visit definitions
    "arms": [...]     // All study arm definitions
  },
  "validationRules": {
    "rules": [
      // Comprehensive validation rules for all forms
      {...}, {...}, {...}
    ]
  },
  "siteCustomizations": {...},
  "performanceSettings": {...},
  "complianceSettings": {...}
}
```

**For a typical clinical trial with:**
- 10-20 forms
- 50-100 fields per form
- Multiple visits and arms
- Comprehensive validation rules

**Serialized JSON size:** ~100KB - 500KB (far exceeds 64KB BLOB limit)

### 2. BLOB Type Limitations

| Type       | Max Size      | Bytes           |
|------------|---------------|-----------------|
| BLOB       | 64 KB         | 65,535          |
| MEDIUMBLOB | 16 MB         | 16,777,215      |
| LONGBLOB   | 4 GB          | 4,294,967,295   |

**Current:** BLOB (64KB) ❌  
**Required:** LONGBLOB (4GB) ✅

### 3. Event Flow and Failure Sequence

```
[Client] → [Service] → [CommandGateway] → [Aggregate] → [EventStore]
                                                              ↓
                                                    [domain_event_entry]
                                                              ↓
                                                        ❌ FAIL HERE
                                                    (Data truncation)
```

**What happens:**
1. ✅ `StudyDatabaseBuildAggregate` constructor called
2. ✅ `StudyDatabaseBuildInitiatedEvent` created
3. ✅ Event serialized to JSON
4. ❌ **INSERT fails - payload too large**
5. ❌ Aggregate ID already registered in Axon's cache
6. ❌ Retry with same UUID → "Cannot reuse aggregate identifier" error

---

## Solution

### Step 1: Clean Up Failed Event Data (IMMEDIATE)

**Option A: Delete Specific Failed Aggregate (RECOMMENDED)**

```sql
-- Backup first (ALWAYS!)
CREATE TABLE domain_event_entry_backup_20251016 AS 
SELECT * FROM domain_event_entry 
WHERE aggregate_identifier = '3bb95abf-7bdd-45f2-9e06-2085c428d727';

-- Delete failed event entries for this specific aggregate
DELETE FROM domain_event_entry 
WHERE aggregate_identifier = '3bb95abf-7bdd-45f2-9e06-2085c428d727';

-- Verify deletion
SELECT COUNT(*) FROM domain_event_entry 
WHERE aggregate_identifier = '3bb95abf-7bdd-45f2-9e06-2085c428d727';
-- Should return: 0

-- Check backup
SELECT COUNT(*) FROM domain_event_entry_backup_20251016;
```

**Option B: Delete All Today's Failed Study Database Build Events (NUCLEAR OPTION)**

```sql
-- Backup first
CREATE TABLE domain_event_entry_backup_20251016_all AS 
SELECT * FROM domain_event_entry 
WHERE payload_type LIKE '%StudyDatabaseBuild%'
  AND DATE(time_stamp) = CURDATE();

-- Delete all today's study database build events
DELETE FROM domain_event_entry 
WHERE payload_type LIKE '%StudyDatabaseBuild%'
  AND DATE(time_stamp) = CURDATE();
```

**Option C: Delete All Study Database Build Events (EXTREME - Only if testing)**

```sql
-- CAUTION: Only use this if you're in development/testing!
CREATE TABLE domain_event_entry_backup_20251016_studydb AS 
SELECT * FROM domain_event_entry 
WHERE payload_type LIKE '%StudyDatabaseBuild%';

DELETE FROM domain_event_entry 
WHERE payload_type LIKE '%StudyDatabaseBuild%';

-- Also clean up read model
DELETE FROM study_database_build 
WHERE build_status = 'FAILED' OR build_status = 'IN_PROGRESS';
```

### Step 2: Apply Database Migration (REQUIRED)

**Migration File:** `backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql`

```sql
-- Increase payload column size
ALTER TABLE domain_event_entry 
    MODIFY COLUMN payload LONGBLOB NOT NULL,
    MODIFY COLUMN meta_data LONGBLOB;

ALTER TABLE snapshot_event_entry 
    MODIFY COLUMN payload LONGBLOB NOT NULL,
    MODIFY COLUMN meta_data LONGBLOB;
```

**Execute Migration:**

```bash
# Option 1: Direct MySQL execution
mysql -u root -p clinprecision < backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql

# Option 2: Using MySQL Workbench
# - Open the migration file
# - Execute against clinprecision database

# Option 3: PowerShell
Get-Content backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql | mysql -u root -p clinprecision
```

### Step 3: Verify Migration Success

```sql
-- Check column types
SELECT 
    TABLE_NAME,
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'clinprecision'
  AND TABLE_NAME IN ('domain_event_entry', 'snapshot_event_entry')
  AND COLUMN_NAME IN ('payload', 'meta_data')
ORDER BY TABLE_NAME, COLUMN_NAME;
```

**Expected Output:**

```
+------------------------+-------------+-----------+--------------------------+-------------+
| TABLE_NAME             | COLUMN_NAME | DATA_TYPE | CHARACTER_MAXIMUM_LENGTH | COLUMN_TYPE |
+------------------------+-------------+-----------+--------------------------+-------------+
| domain_event_entry     | meta_data   | longblob  |               4294967295 | longblob    |
| domain_event_entry     | payload     | longblob  |               4294967295 | longblob    |
| snapshot_event_entry   | meta_data   | longblob  |               4294967295 | longblob    |
| snapshot_event_entry   | payload     | longblob  |               4294967295 | longblob    |
+------------------------+-------------+-----------+--------------------------+-------------+
```

### Step 4: Restart Application

```bash
# Stop all services
# (Use your specific stop command)

# Restart services
# (Use your specific start command)

# Verify logs show no errors
tail -f logs/clinops-service.log
```

### Step 5: Retry Study Database Build

1. **Navigate to Study Design Module**
2. **Select Study**
3. **Click "Build Database"**
4. **Monitor logs for success:**

```
✅ Generated build UUID: [new-uuid], request ID: [request-id]
✅ Sending BuildStudyDatabaseCommand to Axon for UUID: [new-uuid]
✅ BuildStudyDatabaseCommand completed successfully for UUID: [new-uuid]
✅ Study database build initiated successfully
```

---

## Verification Checklist

After applying the fix, verify:

- [ ] ✅ Migration executed successfully
- [ ] ✅ Payload columns changed to LONGBLOB
- [ ] ✅ Failed aggregate entries deleted
- [ ] ✅ Application restarted
- [ ] ✅ New build command succeeds
- [ ] ✅ Event stored in domain_event_entry
- [ ] ✅ No data truncation errors in logs
- [ ] ✅ Build status shows IN_PROGRESS or COMPLETED

---

## Prevention: Future Considerations

### 1. Monitor Event Payload Sizes

Create a monitoring query:

```sql
-- Find events with large payloads
SELECT 
    aggregate_identifier,
    payload_type,
    LENGTH(payload) as payload_size_bytes,
    LENGTH(payload) / 1024 as payload_size_kb,
    time_stamp
FROM domain_event_entry
WHERE LENGTH(payload) > 50000  -- Events larger than 50KB
ORDER BY payload_size_bytes DESC
LIMIT 20;
```

### 2. Consider Event Payload Optimization

For future development, consider:

**Option A: Event Reference Pattern**
```java
// Instead of including full data in command/event
public class BuildStudyDatabaseCommand {
    private UUID studyDatabaseBuildId;
    private Long studyId;
    
    // Reference to external storage instead of inline data
    private String studyDesignConfigurationRef;  // S3 key or file path
    private String validationRulesRef;            // S3 key or file path
}
```

**Option B: Command Decomposition**
```java
// Break large command into smaller commands
BuildStudyDatabaseCommand (metadata only)
  → LoadStudyDesignCommand (forms)
  → LoadValidationRulesCommand (rules)
  → LoadSiteCustomizationsCommand (sites)
```

**Option C: Compress Payloads**
```java
// Use compression for large data
byte[] compressedPayload = compress(largeData);
```

### 3. Add Payload Size Validation

```java
@Component
public class CommandPayloadValidator {
    private static final int MAX_PAYLOAD_SIZE = 500_000; // 500KB warning threshold
    
    @Before("execution(* org.axonframework.commandhandling.gateway.CommandGateway.send(..))")
    public void validatePayloadSize(JoinPoint joinPoint) {
        Object command = joinPoint.getArgs()[0];
        int estimatedSize = estimateSerializedSize(command);
        
        if (estimatedSize > MAX_PAYLOAD_SIZE) {
            log.warn("Command {} has large payload: {} bytes", 
                command.getClass().getSimpleName(), estimatedSize);
        }
    }
}
```

---

## Technical Details

### BuildStudyDatabaseCommand Structure

**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/domain/commands/BuildStudyDatabaseCommand.java`

**Large Fields:**
- `Map<String, Object> studyDesignConfiguration` - Contains all form definitions, visits, arms
- `Map<String, Object> validationRules` - Contains all validation rules
- `Map<String, Object> siteCustomizations` - Site-specific configs
- `Map<String, Object> performanceSettings` - Performance configs
- `Map<String, Object> complianceSettings` - Compliance configs

**Populated By:** `StudyDatabaseBuildCommandService.sendBuildCommand()` (lines 300-433)

### Event Store Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Axon Event Store                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  domain_event_entry                                         │
│  ┌──────────────────────────────────────────────────┐      │
│  │ global_index        BIGINT AUTO_INCREMENT        │      │
│  │ aggregate_identifier VARCHAR(255)  ← Unique ID   │      │
│  │ sequence_number     BIGINT                       │      │
│  │ payload             LONGBLOB ← CHANGED FROM BLOB │      │
│  │ payload_type        VARCHAR(255)                 │      │
│  │ meta_data           LONGBLOB ← CHANGED FROM BLOB │      │
│  │ time_stamp          VARCHAR(255)                 │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  UNIQUE KEY: (aggregate_identifier, sequence_number)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Execution Plan

### Quick Fix (Immediate - 5 minutes)

```bash
# 1. Connect to MySQL
mysql -u root -p

# 2. Use database
USE clinprecision;

# 3. Delete failed event (replace with your actual UUID)
DELETE FROM domain_event_entry 
WHERE aggregate_identifier = '3bb95abf-7bdd-45f2-9e06-2085c428d727';

# 4. Apply migration
SOURCE C:/nnsproject/clinprecision/backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql;

# 5. Verify
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'domain_event_entry' 
  AND COLUMN_NAME = 'payload';
-- Should show: longblob

# 6. Exit MySQL
EXIT;
```

### Full Fix with Safety (Recommended - 10 minutes)

```bash
# PowerShell commands

# 1. Backup database
mysqldump -u root -p clinprecision > "C:\backups\clinprecision_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# 2. Connect to MySQL
mysql -u root -p

# Then in MySQL:
USE clinprecision;

-- 3. Create backup of events
CREATE TABLE domain_event_entry_backup_20251016 AS 
SELECT * FROM domain_event_entry;

-- 4. Delete failed aggregate
DELETE FROM domain_event_entry 
WHERE aggregate_identifier = '3bb95abf-7bdd-45f2-9e06-2085c428d727';

-- 5. Apply migration
SOURCE C:/nnsproject/clinprecision/backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql;

-- 6. Verify migration
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('domain_event_entry', 'snapshot_event_entry')
  AND COLUMN_NAME IN ('payload', 'meta_data');

-- 7. Check event counts
SELECT COUNT(*) as total_events FROM domain_event_entry;
SELECT COUNT(*) as backup_events FROM domain_event_entry_backup_20251016;

EXIT;

# 8. Restart application services
# (Use your specific restart command)

# 9. Test database build again
```

---

## Rollback Plan (If Needed)

If something goes wrong:

```sql
-- Restore from backup table
TRUNCATE TABLE domain_event_entry;

INSERT INTO domain_event_entry 
SELECT * FROM domain_event_entry_backup_20251016;

-- Or restore from full database dump
-- mysql -u root -p clinprecision < C:\backups\clinprecision_backup_[timestamp].sql
```

---

## Success Criteria

✅ **Fix is successful when:**

1. Migration executes without errors
2. Payload columns are LONGBLOB type
3. Failed aggregate entries deleted
4. Application starts without errors
5. Study database build completes successfully
6. No "Data truncation" errors in logs
7. No "Cannot reuse aggregate identifier" errors
8. Events stored in domain_event_entry table
9. Build status updates correctly in UI

---

## Related Files Modified

1. ✅ `backend/clinprecision-db/migrations/20251016_increase_event_payload_size.sql` (NEW)
2. ✅ `backend/clinprecision-db/ddl/consolidated_schema.sql` (UPDATED)
3. ✅ `docs/STUDY_DATABASE_BUILD_PAYLOAD_TRUNCATION_FIX.md` (NEW - this file)

---

## Support Information

**Error Reference:** SQL Error 1406, SQLState 22001  
**Axon Version:** (Check your pom.xml)  
**MySQL Version:** 8.0+  
**Issue Type:** Data truncation, Event sourcing  
**Priority:** HIGH - Blocking database build functionality  

---

**Status:** ✅ **READY TO APPLY**  
**Estimated Time:** 5-10 minutes  
**Risk Level:** LOW (non-breaking change, increases capacity only)  
**Rollback Available:** YES (via backup table)
