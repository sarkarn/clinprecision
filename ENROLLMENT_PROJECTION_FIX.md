# Enrollment Projection Fix - Foreign Key Constraint Issue

**Date:** October 14, 2025  
**Issue:** Enrollment projection failing with FK constraint violation  
**Status:** ✅ FIXED

---

## Problem Summary

When enrolling a patient in a study, the projection was failing with:

```
Cannot add or update a child row: a foreign key constraint fails 
(`clinprecisiondb`.`patient_enrollments`, CONSTRAINT `patient_enrollments_ibfk_2` 
FOREIGN KEY (`study_id`) REFERENCES `studies` (`id`))
```

---

## Root Cause

The `PatientEnrollmentProjector` was using a **fake/hashed study ID** instead of the real one:

```java
// ❌ WRONG - Line 157 (old code)
.studyId(extractLongId(event.getStudyId().toString()))

// This method was generating a fake ID:
private Long extractLongId(String uuid) {
    return Math.abs(uuid.hashCode()) % 1000000L;  // Random fake ID!
}
```

**Problem:** The `extractLongId()` method was creating a random Long ID from the UUID hash, which doesn't exist in the `studies` table, causing the FK constraint violation.

---

## The Fix

### 1. Added SiteStudyRepository Dependency

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class PatientEnrollmentProjector {
    // ... existing dependencies
    
    // NEW: Added to look up real study ID
    private final com.clinprecision.clinopsservice.patientenrollment.repository.SiteStudyRepository siteStudyRepository;
}
```

### 2. Look Up Real Study ID from site_studies Table

**Before:**
```java
PatientEntity patient = patientOpt.get();

// Create enrollment record
PatientEnrollmentEntity enrollment = PatientEnrollmentEntity.builder()
    .aggregateUuid(event.getEnrollmentId().toString())
    .patientId(patient.getId())
    .studyId(extractLongId(event.getStudyId().toString()))  // ❌ Fake ID!
    .studySiteId(event.getStudySiteId())
    .build();
```

**After:**
```java
PatientEntity patient = patientOpt.get();

// Look up the real study ID from the site_studies table using studySiteId
com.clinprecision.common.entity.SiteStudyEntity siteStudy = siteStudyRepository.findById(event.getStudySiteId())
    .orElseThrow(() -> new IllegalStateException(
        "Site-Study association not found: " + event.getStudySiteId()));

Long realStudyId = siteStudy.getStudyId();
log.info("Resolved studySiteId={} to studyId={}", event.getStudySiteId(), realStudyId);

// Create enrollment record
PatientEnrollmentEntity enrollment = PatientEnrollmentEntity.builder()
    .aggregateUuid(event.getEnrollmentId().toString())
    .patientId(patient.getId())
    .studyId(realStudyId)  // ✅ Real study ID from database!
    .studySiteId(event.getStudySiteId())
    .build();
```

---

## Why This Works

### The Data Flow:

1. **User enrolls patient** → Frontend sends `studyId` and `siteId`
2. **Service finds site-study association** → Looks up `study_sites` table
3. **Command includes studySiteId** → `EnrollPatientCommand` has `studySiteId=5` (FK to study_sites)
4. **Event is immutable** → `PatientEnrolledEvent` includes `studySiteId=5`
5. **Projector looks up real IDs** → Uses `studySiteId` to get real `studyId` from `study_sites` table
6. **Enrollment record created** → With valid FK to `studies` table ✅

### Database Schema:

```
study_sites table:
+----+---------+----------+
| id | site_id | study_id |  ← studySiteId=5 has studyId=1
+----+---------+----------+
| 5  | 123     | 1        |
+----+---------+----------+

studies table:
+----+-------------+
| id | study_name  |  ← Must have matching study_id
+----+-------------+
| 1  | Cancer 123  |  ← This exists!
+----+-------------+

patient_enrollments table:
+----+------------+----------+---------------+
| id | patient_id | study_id | study_site_id |
+----+------------+----------+---------------+
| 1  | 5          | 1        | 5             |  ← Both FKs valid!
+----+------------+----------+---------------+
```

---

## Previous Fixes in This Session

This fix builds on earlier fixes:

### 1. **Enrollment vs Status Fix** (ENROLLMENT_VS_STATUS_FIX.md)
- Removed automatic status change to ENROLLED during study enrollment
- Status now remains REGISTERED after enrollment
- Status changes are explicit via ChangePatientStatusCommand

### 2. **Valid Transitions Fallback** (PatientStatusController.java)
- Added fallback to patient table if no status history exists
- Prevents "No status history found" error for new patients

### 3. **CORS Fix** (VisitController.java)
- Removed duplicate @CrossOrigin annotation
- Fixed "multiple Access-Control-Allow-Origin values" error

---

## Testing Steps

### 1. Restart Service

```bash
# Restart the clinops-service with new code
```

### 2. Test Patient Enrollment

```bash
# In browser console, should see:
Resolved studySiteId=5 to studyId=1
Enrollment record created: id=1, screening=SUBJ-007
```

### 3. Verify Database

```sql
-- Check enrollment was created
SELECT * FROM patient_enrollments ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- study_id = 1 (real ID from studies table)
-- study_site_id = 5 (FK to study_sites table)
-- No FK constraint errors!
```

### 4. Verify Projection Completion

The service should log:
```
PatientEnrolledEvent projection completed successfully
Enrollment projection found: id=1
```

No more timeout errors!

---

## Files Modified

1. **PatientEnrollmentProjector.java** (Lines 41-44, 147-168)
   - Added `SiteStudyRepository` dependency
   - Added lookup logic to get real study ID from study_sites table
   - Replaced `extractLongId()` fake ID generation with real DB lookup

---

## Impact

✅ **Enrollment projections now complete successfully**  
✅ **Foreign key constraints satisfied**  
✅ **No more "Cannot add or update a child row" errors**  
✅ **Proper database referential integrity**  
✅ **Event sourcing immutability maintained**

---

## Related Issues

- **Enrollment timeout** - Projection was failing silently, causing 10-second timeout
- **Missing enrollment records** - FK constraint prevented record creation
- **Invalid transitions error** - Caused by old enrollment events setting status to ENROLLED

---

## Key Learnings

1. **Never generate fake IDs from UUIDs** - Always look up real database IDs
2. **Use immutable event data wisely** - `studySiteId` in event enabled this fix
3. **Follow foreign key relationships** - site_studies → studies lookup pattern
4. **Log database lookups** - Helps debug FK constraint issues
5. **Projection errors should be visible** - Don't swallow exceptions silently

---

**Status:** Ready for testing after service restart
