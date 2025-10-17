# Build Tracking in Audit Tables - Critical Compliance Requirement

**Date**: October 16, 2025  
**Issue**: Audit table `study_form_data_audit` missing `build_id` column  
**Status**: **CRITICAL COMPLIANCE GAP** - Must be fixed immediately  
**Regulation**: 21 CFR Part 11 - Electronic Records

---

## 🎯 The Question

**User**: "Doesn't corresponding audit table need build_id?"

**Answer**: **ABSOLUTELY YES!** This is a **critical compliance requirement** for FDA regulations.

---

## 📜 Why Audit Tables Need build_id

### 21 CFR Part 11 Requirements

FDA regulation 21 CFR Part 11 requires:
- ✅ **Complete audit trail** of all changes
- ✅ **Ability to reconstruct data at any point in time**
- ✅ **Traceability of which protocol version was active**
- ✅ **Cannot modify audit records** (immutable)

**Without build_id in audit table**:
- ❌ **Cannot determine which form version the change was made to**
- ❌ **Cannot reconstruct historical data correctly**
- ❌ **Cannot prove compliance with the protocol version in effect**
- ❌ **AUDIT TRAIL IS INCOMPLETE** → FDA violation!

---

## 🔍 Real-World Audit Scenario

### Scenario: Protocol Amendment with Field Change

**Timeline**:
```
Jan 2025: Study launches with Build 1
  - Demographics form has "Age" field (range: 18-65)

Mar 2025: Protocol amended → Build 2
  - Demographics form updated with "Age" field (range: 18-85)  
  - Change reason: Expand eligibility criteria

Jun 2025: FDA Audit
  - Question: "Show me all changes to Patient #1001's Demographics form"
  - Question: "Which protocol version was in effect when each change was made?"
```

### Without build_id in Audit Table ❌

```sql
-- Query audit trail
SELECT 
    audit_id,
    action,
    old_data,
    new_data,
    changed_by,
    changed_at
FROM study_form_data_audit
WHERE record_id = 12345;  -- Patient 1001's Demographics form

-- Result:
| audit_id | action | old_data         | new_data         | changed_by | changed_at |
|----------|--------|------------------|------------------|------------|------------|
| 1001     | INSERT | NULL             | {"age": 70}      | Dr. Smith  | 2025-02-15 |
| 1002     | UPDATE | {"age": 70}      | {"age": 71}      | Dr. Jones  | 2025-04-20 |
| 1003     | UPDATE | {"age": 71}      | {"age": 72}      | Dr. Smith  | 2025-05-10 |

-- ❌ PROBLEM: Which protocol version was active for each change?
-- ❌ Was age=70 VALID or INVALID in February 2025?
-- ❌ Build 1 (age 18-65): INVALID
-- ❌ Build 2 (age 18-85): VALID
-- ❌ We can't tell! 💥
```

**FDA Inspector**: "Was this patient enrolled under a protocol that allowed age 70?"  
**You**: "Uh... we don't know. We didn't track the build version." 😰  
**FDA**: "⚠️ **WARNING LETTER** - Incomplete audit trail"

---

### With build_id in Audit Table ✅

```sql
-- Query audit trail with build tracking
SELECT 
    audit_id,
    action,
    old_data,
    new_data,
    build_id,
    changed_by,
    changed_at
FROM study_form_data_audit
WHERE record_id = 12345;

-- Result:
| audit_id | action | old_data    | new_data    | build_id | changed_by | changed_at |
|----------|--------|-------------|-------------|----------|------------|------------|
| 1001     | INSERT | NULL        | {"age":70}  | 1        | Dr. Smith  | 2025-02-15 |
| 1002     | UPDATE | {"age":70}  | {"age":71}  | 1        | Dr. Jones  | 2025-04-20 |
| 1003     | UPDATE | {"age":71}  | {"age":72}  | 2        | Dr. Smith  | 2025-05-10 |

-- ✅ Now we can answer:
-- Feb 15: Build 1 active (age limit 18-65) → age=70 was INVALID (data entry error!)
-- Apr 20: Build 1 still active → age=71 was INVALID (correcting error)
-- May 10: Build 2 active (age limit 18-85) → age=72 is VALID ✅

-- Join with build table for complete context
SELECT 
    a.audit_id,
    a.action,
    a.old_data,
    a.new_data,
    a.build_id,
    sdb.build_status,
    sdb.build_end_time,
    fd.fields,  -- Form definition at that build
    a.changed_by,
    a.changed_at
FROM study_form_data_audit a
JOIN study_database_builds sdb ON sdb.id = a.build_id
JOIN form_definitions fd ON fd.id = (
    SELECT form_id FROM study_form_data WHERE id = a.record_id
) AND fd.build_id = a.build_id
WHERE a.record_id = 12345;
```

**FDA Inspector**: "Was this patient enrolled under a protocol that allowed age 70?"  
**You**: "Yes! Here's the audit trail showing Build 2 (age limit 18-85) was active when age=72 was entered on May 10, 2025."  
**FDA**: "✅ **Acceptable** - Complete audit trail"

---

## 📊 What build_id Tracks in Audit Table

| Audit Field | Purpose | Example |
|-------------|---------|---------|
| `record_id` | Links to original form data record | study_form_data.id = 12345 |
| `old_data` | Previous form data (JSON) | {"name": "John", "age": 45} |
| `new_data` | New form data (JSON) | {"name": "John", "age": 46} |
| `build_id` | **Which form definition version was active** | Build 2 (12 fields, age range 18-85) |
| `changed_at` | When change occurred | 2025-05-10 14:23:15 |
| `changed_by` | Who made the change | Dr. Smith (user_id=42) |

**Without build_id**: You only know WHAT changed and WHEN  
**With build_id**: You also know which **PROTOCOL VERSION** was in effect (critical for compliance!)

---

## 🔥 Critical Audit Use Cases

### Use Case 1: Prove Compliance During FDA Inspection

**Requirement**: Show that all form data was entered according to the protocol version in effect at the time.

```sql
-- Find all changes made during Build 1 period
SELECT 
    a.record_id,
    a.changed_at,
    a.new_data,
    a.build_id,
    sdb.build_end_time as build_completed,
    CASE 
        WHEN a.build_id = 1 THEN 'Protocol v1.0 (age 18-65)'
        WHEN a.build_id = 2 THEN 'Protocol v2.0 (age 18-85)'
    END as protocol_version
FROM study_form_data_audit a
JOIN study_database_builds sdb ON sdb.id = a.build_id
WHERE a.study_id = 123
  AND a.action IN ('INSERT', 'UPDATE')
ORDER BY a.changed_at;
```

**Result**: Complete timeline showing which protocol version was followed for every data entry.

---

### Use Case 2: Reconstruct Data at Historical Point

**Requirement**: "Show me Patient 1001's Demographics form as it existed on March 15, 2025."

**Without build_id** ❌:
```sql
-- Can only get data values
SELECT new_data 
FROM study_form_data_audit 
WHERE record_id = 12345 
  AND changed_at <= '2025-03-15'
ORDER BY changed_at DESC 
LIMIT 1;

-- Result: {"name": "John", "age": 70}
-- ❌ But which form template? 10 fields or 12 fields?
-- ❌ Cannot reconstruct the actual form!
```

**With build_id** ✅:
```sql
-- Get data + form definition
SELECT 
    a.new_data as form_data,
    a.build_id,
    fd.fields as form_structure,
    fd.validation_rules
FROM study_form_data_audit a
JOIN form_definitions fd ON fd.id = (
    SELECT form_id FROM study_form_data WHERE id = a.record_id
) AND fd.build_id = a.build_id
WHERE a.record_id = 12345 
  AND a.changed_at <= '2025-03-15'
ORDER BY a.changed_at DESC 
LIMIT 1;

-- Result:
-- form_data: {"name": "John", "age": 70}
-- build_id: 1
-- form_structure: [10 fields from Build 1]
-- ✅ Can perfectly reconstruct the form as it appeared on March 15!
```

---

### Use Case 3: Detect Protocol Deviations

**Requirement**: Identify data entered that violates the protocol version in effect.

```sql
-- Find entries where age was out of range for the active build
SELECT 
    a.record_id,
    a.new_data->>'$.age' as age_entered,
    a.build_id,
    CASE 
        WHEN a.build_id = 1 AND CAST(a.new_data->>'$.age' AS UNSIGNED) > 65 
            THEN 'VIOLATION: Age > 65 in Build 1 (limit: 18-65)'
        WHEN a.build_id = 2 AND CAST(a.new_data->>'$.age' AS UNSIGNED) > 85 
            THEN 'VIOLATION: Age > 85 in Build 2 (limit: 18-85)'
        ELSE 'COMPLIANT'
    END as compliance_status,
    a.changed_by,
    a.changed_at
FROM study_form_data_audit a
WHERE a.new_data->>'$.age' IS NOT NULL
  AND a.action IN ('INSERT', 'UPDATE')
HAVING compliance_status LIKE 'VIOLATION%';
```

**Without build_id**: Cannot detect protocol deviations!  
**With build_id**: Can automatically identify all deviations.

---

### Use Case 4: Change Control Documentation

**Requirement**: Document impact of protocol amendments on existing data.

```sql
-- Count how many patients were affected by Build 1 → Build 2 transition
SELECT 
    'Before Amendment (Build 1)' as period,
    COUNT(DISTINCT record_id) as patient_count,
    COUNT(*) as total_changes
FROM study_form_data_audit
WHERE build_id = 1

UNION ALL

SELECT 
    'After Amendment (Build 2)' as period,
    COUNT(DISTINCT record_id) as patient_count,
    COUNT(*) as total_changes
FROM study_form_data_audit
WHERE build_id = 2;

-- Result:
-- Before Amendment: 150 patients, 890 changes
-- After Amendment: 200 patients, 1200 changes
-- ✅ Clear documentation of amendment impact
```

---

## 📋 Database Schema Impact

### Current Schema (INCOMPLETE) ❌

```sql
CREATE TABLE study_form_data_audit (
    audit_id BIGINT PRIMARY KEY,
    study_id BIGINT,
    record_id BIGINT,
    action VARCHAR(20),
    old_data JSON,
    new_data JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP,
    -- ❌ MISSING: build_id
);
```

**Problems**:
- ❌ Cannot determine protocol version for each change
- ❌ Cannot reconstruct historical form structure
- ❌ Cannot prove compliance during audits
- ❌ Violates 21 CFR Part 11 requirements

---

### Required Schema (COMPLIANT) ✅

```sql
CREATE TABLE study_form_data_audit (
    audit_id BIGINT PRIMARY KEY,
    study_id BIGINT,
    record_id BIGINT,
    action VARCHAR(20),
    old_data JSON,
    new_data JSON,
    build_id BIGINT NOT NULL,  -- ✅ CRITICAL: Protocol version tracking
    changed_by BIGINT,
    changed_at TIMESTAMP,
    
    -- Foreign key to builds table
    CONSTRAINT fk_audit_build 
        FOREIGN KEY (build_id) 
        REFERENCES study_database_builds(id),
    
    -- Index for efficient queries
    INDEX idx_audit_build (build_id),
    INDEX idx_audit_record_build (record_id, build_id)
);
```

**Benefits**:
- ✅ Complete audit trail with protocol version tracking
- ✅ Can reconstruct data at any historical point
- ✅ Proves compliance with protocol version in effect
- ✅ Meets 21 CFR Part 11 requirements

---

## 🚀 Required Changes

### 1. Update Migration Script

**File**: `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`

**Add to existing migration**:
```sql
-- ============================================================================
-- Add build_id to study_form_data_audit table (CRITICAL FOR COMPLIANCE)
-- ============================================================================

-- Add column
ALTER TABLE study_form_data_audit 
ADD COLUMN build_id BIGINT NULL COMMENT 'FK to study_database_builds - tracks protocol version when change was made';

-- Add foreign key
ALTER TABLE study_form_data_audit 
ADD CONSTRAINT fk_study_form_data_audit_build 
FOREIGN KEY (build_id) REFERENCES study_database_builds(id);

-- Add indexes
CREATE INDEX idx_study_form_data_audit_build_id ON study_form_data_audit(build_id);
CREATE INDEX idx_study_form_data_audit_record_build ON study_form_data_audit(record_id, build_id);

-- Backfill existing audit records
-- Get build_id from the main study_form_data table
UPDATE study_form_data_audit a
JOIN study_form_data sfd ON sfd.id = a.record_id
SET a.build_id = sfd.build_id
WHERE a.build_id IS NULL
  AND sfd.build_id IS NOT NULL;

-- For audit records where main record doesn't have build_id yet,
-- use the build that was active at the time of the change
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

-- Final check: Ensure no NULL build_id values remain
SELECT 
    COUNT(*) as records_missing_build_id
FROM study_form_data_audit
WHERE build_id IS NULL;
-- Expected: 0
```

---

### 2. Update Java Entity (if exists)

**File**: `StudyFormDataAuditEntity.java` (if it exists)

```java
@Entity
@Table(name = "study_form_data_audit")
public class StudyFormDataAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "record_id", nullable = false)
    private Long recordId;
    
    @Column(name = "action", nullable = false, length = 20)
    private String action;
    
    @Column(name = "old_data", columnDefinition = "JSON")
    private String oldData;
    
    @Column(name = "new_data", columnDefinition = "JSON")
    private String newData;
    
    @Column(name = "build_id", nullable = false)  // ✅ ADD THIS
    private Long buildId;
    
    @Column(name = "changed_by")
    private Long changedBy;
    
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
    
    // ... rest of entity
}
```

---

### 3. Update Audit Trigger/Service

**When creating audit records, always include build_id**:

```java
public void auditFormDataChange(
    Long recordId, 
    String action,
    String oldData,
    String newData,
    Long changedBy
) {
    // Get build_id from the main record
    StudyFormDataEntity mainRecord = studyFormDataRepository
        .findById(recordId)
        .orElseThrow();
    
    StudyFormDataAuditEntity audit = StudyFormDataAuditEntity.builder()
        .studyId(mainRecord.getStudyId())
        .recordId(recordId)
        .action(action)
        .oldData(oldData)
        .newData(newData)
        .buildId(mainRecord.getBuildId())  // ✅ CRITICAL: Copy build_id
        .changedBy(changedBy)
        .changedAt(LocalDateTime.now())
        .build();
    
    auditRepository.save(audit);
}
```

---

## 📊 Validation Queries

### After Migration - Verify build_id Populated

```sql
-- 1. Check column exists
DESCRIBE study_form_data_audit;
-- Should show build_id column

-- 2. Check foreign key exists
SELECT 
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'study_form_data_audit'
  AND COLUMN_NAME = 'build_id';
-- Should show FK to study_database_builds

-- 3. Verify no NULL build_id values
SELECT COUNT(*) as null_count
FROM study_form_data_audit
WHERE build_id IS NULL;
-- Should be 0

-- 4. Test audit trail reconstruction
SELECT 
    a.audit_id,
    a.action,
    a.changed_at,
    a.build_id,
    sdb.build_request_id,
    sdb.build_status,
    sdb.build_end_time,
    a.new_data
FROM study_form_data_audit a
JOIN study_database_builds sdb ON sdb.id = a.build_id
WHERE a.record_id = (SELECT id FROM study_form_data LIMIT 1)
ORDER BY a.changed_at;
-- Should show complete audit trail with build information
```

---

## ✅ Summary

**User Question**: "Doesn't corresponding audit table need build_id?"

**Answer**: **ABSOLUTELY YES!** This is a **CRITICAL COMPLIANCE REQUIREMENT**.

### Why It's Critical:

| Reason | Impact Without build_id | Impact With build_id |
|--------|------------------------|---------------------|
| **FDA Compliance** | ❌ Incomplete audit trail → Warning letter | ✅ Complete audit trail |
| **Historical Reconstruction** | ❌ Cannot reconstruct forms at past dates | ✅ Perfect reconstruction |
| **Protocol Deviation Detection** | ❌ Cannot detect violations | ✅ Automatic detection |
| **Change Control** | ❌ No protocol version tracking | ✅ Full version tracking |
| **Data Integrity** | ❌ Cannot prove compliance | ✅ Provable compliance |

### Required Actions:

1. ✅ Add `build_id` column to `study_form_data_audit` table
2. ✅ Add foreign key constraint to `study_database_builds`
3. ✅ Backfill existing audit records with build_id
4. ✅ Update audit trigger/service to always populate build_id
5. ✅ Update Java entity (if exists)

**Priority**: **P0 CRITICAL** - FDA compliance requirement  
**Risk**: **HIGH** - Incomplete audit trail = regulatory violation

---

**Thank you for catching this!** Audit table build tracking is just as critical as the main table for regulatory compliance.

---

**Document Created**: October 16, 2025  
**Compliance Regulation**: 21 CFR Part 11  
**Status**: ✅ **CRITICAL GAP IDENTIFIED - MUST FIX**
