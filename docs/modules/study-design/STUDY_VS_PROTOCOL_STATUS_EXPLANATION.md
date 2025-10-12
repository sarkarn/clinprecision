# Study Status vs Protocol Version Status - Explained

## 🎯 Two Different Status Systems

Your application has **TWO separate status systems** that serve different purposes:

### 1. Study Status (Study Lifecycle)
**Location**: `studies.study_status_id` → `study_status` lookup table

**Purpose**: Tracks the **overall study's lifecycle state**

**Examples**:
- `PLANNING` - Study is being planned
- `DRAFT` - Study design is in draft
- `ACTIVE` - Study is actively recruiting/running
- `COMPLETED` - Study has finished
- `SUSPENDED` - Study temporarily paused
- `TERMINATED` - Study ended early

**Managed By**: Study management operations (create study, activate study, close study)

**Entity Field**: `StudyEntity.studyStatus` (ManyToOne relationship)

---

### 2. Protocol Version Status (Protocol Workflow)
**Location**: `study_versions.status` (ENUM column)

**Purpose**: Tracks the **approval workflow state of each protocol version**

**Examples**:
- `DRAFT` - Protocol version being edited
- `UNDER_REVIEW` - Protocol submitted for internal review
- `SUBMITTED` - Protocol submitted to regulatory authority
- `APPROVED` - Protocol approved by reviewers
- `ACTIVE` - Protocol version is currently in use
- `SUPERSEDED` - Protocol replaced by newer version
- `WITHDRAWN` - Protocol withdrawn from consideration

**Managed By**: Protocol version operations (create version, submit for review, approve version)

**Entity Field**: `StudyVersionEntity.status` (ENUM field)

---

## 🐛 The Actual Problem You're Experiencing

### What You Observed:
> "Study status is going to DRAFT from PLANNING status after creating initial version of the protocol"

### What's Really Happening:

```
Step 1: Study created with status = "PLANNING"
   ✅ studies.study_status_id = 2 (PLANNING)

Step 2: Create initial protocol version (v1.0)
   🐛 BUG: studies.study_status_id becomes NULL

Step 3: Frontend fetches study data
   ⚠️ StudyMapper sees null status
   ⚠️ Band-aid fix: defaults to "DRAFT"
   ❌ Frontend displays: "DRAFT"

Step 4: You see status changed PLANNING → DRAFT
   ✅ But it's actually: PLANNING → NULL → "DRAFT" (display only)
```

### The Root Cause:
**The study status is being set to NULL in the database** when you create a protocol version. This is the bug we're investigating with the debug logging.

### Why It Defaults to "DRAFT":
In `StudyMapper.java` (lines 138-141), we added a temporary fix:

```java
if (entity.getStudyStatus() != null) {
    dto.setStatus(entity.getStudyStatus().getCode()); // Use actual status
} else {
    logger.warn("Study {} has null status, defaulting to DRAFT", entity.getId());
    dto.setStatus("DRAFT"); // ← Band-aid: prevents "unknown" display
}
```

This was meant to prevent the frontend from showing "unknown" status, but it's just **masking the real problem** (status becoming NULL).

---

## 🔍 Proof That These Are Separate

### Database Schema:

```sql
-- Study Status (one per study, represents lifecycle)
CREATE TABLE studies (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    study_status_id BIGINT NULL,  -- ← Study lifecycle status
    FOREIGN KEY (study_status_id) REFERENCES study_status(id)
);

-- Protocol Version Status (many per study, represents version workflow)
CREATE TABLE study_versions (
    id BIGINT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    version_number VARCHAR(20),
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', ...), -- ← Protocol workflow status
    FOREIGN KEY (study_id) REFERENCES studies(id)
);
```

### Example Scenario:

A study in **ACTIVE** status (actively recruiting patients) can have:
- Protocol v1.0 with status **ACTIVE** (currently being used)
- Protocol v2.0 with status **UNDER_REVIEW** (amendment being reviewed)
- Protocol v3.0 with status **DRAFT** (next amendment being prepared)

**Study Status**: ACTIVE (patients are being enrolled)
**Protocol Version Statuses**: Multiple versions in different workflow states

---

## ✅ Expected Behavior vs Current Bug

### Expected Behavior:
1. Create study with status "PLANNING"
   - `studies.study_status_id = 2` (PLANNING)
2. Create initial protocol version v1.0
   - `study_versions.status = 'DRAFT'` (protocol is in draft)
   - `studies.study_status_id = 2` **SHOULD STAY AS PLANNING**
3. Frontend should show:
   - **Study Status**: PLANNING
   - **Protocol Version Status**: DRAFT

### Current Bug:
1. Create study with status "PLANNING"
   - `studies.study_status_id = 2` ✅
2. Create initial protocol version v1.0
   - `study_versions.status = 'DRAFT'` ✅
   - `studies.study_status_id = NULL` ❌ **BUG: Should stay PLANNING**
3. Frontend shows:
   - **Study Status**: DRAFT (wrong! should be PLANNING)
   - **Protocol Version Status**: DRAFT ✅

---

## 🔬 How to Verify

### Check Database Directly:

```sql
-- Before creating protocol version
SELECT id, name, study_status_id 
FROM studies 
WHERE id = YOUR_STUDY_ID;
-- Result: study_status_id = 2 (PLANNING)

-- After creating protocol version
SELECT id, name, study_status_id 
FROM studies 
WHERE id = YOUR_STUDY_ID;
-- Bug Result: study_status_id = NULL (should still be 2)

-- Check protocol version status (should be separate)
SELECT id, study_id, version_number, status 
FROM study_versions 
WHERE study_id = YOUR_STUDY_ID;
-- Result: status = 'DRAFT' (this is correct and separate)
```

### Check Application Logs:

With the debug logging I added, you should see:

```
INFO  - BEFORE version save - Study 2 status: PLANNING (status_id: 2)
INFO  - Saving version v1.0 for study 2
INFO  - AFTER version save - Study 2 status: NULL (status_id: NULL)
ERROR - ⚠️ CRITICAL: Study 2 status changed from PLANNING to NULL during version creation!
WARN  - Study 2 has null status, defaulting to DRAFT
```

---

## 🎯 Summary

| Aspect | Study Status | Protocol Version Status |
|--------|-------------|------------------------|
| **Purpose** | Study lifecycle | Protocol approval workflow |
| **Examples** | PLANNING, ACTIVE, COMPLETED | DRAFT, UNDER_REVIEW, APPROVED |
| **Scope** | One per study | Many per study |
| **Table** | `studies.study_status_id` | `study_versions.status` |
| **Entity** | `StudyEntity.studyStatus` | `StudyVersionEntity.status` |
| **Type** | Foreign key to lookup table | ENUM in same table |
| **Should Change?** | When study lifecycle changes | When protocol goes through workflow |

**Current Issue**: Study status (`StudyEntity.studyStatus`) is being set to NULL when creating protocol version, which **should never happen**. The "DRAFT" you're seeing is just a fallback display value to prevent showing "unknown".

---

## 🔧 Next Steps

1. **Run the test** with debug logging to confirm status changes to NULL
2. **Check database** to see actual NULL value
3. **Identify root cause** using the log timestamps
4. **Fix the bug** so status stays as PLANNING (or whatever it was)
5. **Remove band-aid fix** once root cause is resolved

The debug logging in `StudyVersionService.java` will show us exactly when the status becomes NULL, which will guide us to the fix.
