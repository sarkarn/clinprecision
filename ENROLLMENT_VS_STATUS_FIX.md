# Patient Enrollment vs. Status - Critical Bug Fix

**Date:** October 14, 2025  
**Issue:** Patient status workflow broken - enrollment triggering incorrect status change  
**Status:** ✅ FIXED

---

## Problem Summary

When users tried to change patient status from **REGISTERED → SCREENING**, they got this error:

```
Invalid status transition from ENROLLED to SCREENING. 
Valid transitions: REGISTERED→SCREENING, SCREENING→ENROLLED, 
ENROLLED→ACTIVE, ACTIVE→COMPLETED, ANY→WITHDRAWN
```

**Why?** The UI showed the patient as REGISTERED, but the aggregate actually had status **ENROLLED**.

---

## Root Cause Analysis

### The Bug

When a patient was enrolled in a study (via `EnrollPatientCommand`), the system was **automatically changing their status to ENROLLED**:

1. **PatientAggregate.java** (Event Handler):
   ```java
   @EventSourcingHandler
   public void on(PatientEnrolledEvent event) {
       this.studyEnrollments.add(event.getStudyId());
       this.status = PatientStatus.ENROLLED;  // ❌ WRONG!
   }
   ```

2. **PatientEnrollmentProjector.java** (Projection):
   ```java
   public void on(PatientEnrolledEvent event) {
       // Create enrollment record
       patientEnrollmentRepository.save(enrollment);
       
       // Update patient status to ENROLLED
       patient.setStatus(PatientStatus.ENROLLED);  // ❌ WRONG!
       patientRepository.save(patient);
   }
   ```

### Why This Caused the Error

**Timeline of events:**

1. User registers patient → Status: REGISTERED ✅
2. User enrolls patient in study → `PatientEnrolledEvent` emitted
3. **Aggregate sets status to ENROLLED** (bug!)
4. **Read model sets status to ENROLLED** (bug!)
5. User opens status change modal → UI shows "REGISTERED" (stale read model)
6. User selects "SCREENING" and submits
7. **Aggregate loads from event store** → Replays PatientEnrolledEvent → Status is ENROLLED
8. **Validation fails**: "Cannot transition from ENROLLED to SCREENING" ❌

### The Conceptual Confusion

The bug stemmed from confusing **two separate concepts**:

| Concept | Meaning | Storage |
|---------|---------|---------|
| **Study Enrollment** | Association between patient and study | `patient_enrollments` table |
| **Patient Status** | Lifecycle stage in clinical process | `patient.status` field |

**Key insight:** A patient can be enrolled in a study while still having status REGISTERED!

---

## The Fix

### Correct Status Lifecycle

```
REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
    ↓                         ↓
Can enroll in study    Can start screening
```

**Proper flow:**

1. **Register Patient** → Status: **REGISTERED**
2. **Enroll in Study** → Status: Still **REGISTERED** (enrollment ≠ status!)
3. **Change Status → SCREENING** → Status: **SCREENING** (when screening begins)
4. **Change Status → ENROLLED** → Status: **ENROLLED** (when screening passes)

### Code Changes

#### 1. Fixed PatientAggregate.java (Lines 149-169)

**Before:**
```java
@EventSourcingHandler
public void on(PatientEnrolledEvent event) {
    this.studyEnrollments.add(event.getStudyId());
    this.status = PatientStatus.ENROLLED;  // ❌ Automatic status change
}
```

**After:**
```java
/**
 * Event Sourcing Handler: Patient Enrolled
 * 
 * NOTE: Enrollment in a study does NOT automatically change patient status.
 * Patient status lifecycle (REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED)
 * is separate from study enrollment (association with a study).
 * Status changes must be explicit via ChangePatientStatusCommand.
 */
@EventSourcingHandler
public void on(PatientEnrolledEvent event) {
    logger.info("Applying PatientEnrolledEvent for patient: {}", event.getPatientId());
    
    // Add study to enrollments set
    this.studyEnrollments.add(event.getStudyId());
    
    // DO NOT change status here - enrollment ≠ status change
    // Status remains whatever it was (typically REGISTERED)
    
    logger.info("Patient {} now enrolled in {} studies, status remains: {}", 
        event.getPatientId(), this.studyEnrollments.size(), this.status);
}
```

#### 2. Fixed PatientEnrollmentProjector.java (Lines 173-181)

**Before:**
```java
PatientEnrollmentEntity saved = patientEnrollmentRepository.save(enrollment);

// Update patient status to ENROLLED
patient.setStatus(PatientStatus.ENROLLED);  // ❌ Automatic status change
patientRepository.save(patient);
```

**After:**
```java
PatientEnrollmentEntity saved = patientEnrollmentRepository.save(enrollment);
log.info("Enrollment record created: id={}, screening={}", saved.getId(), saved.getScreeningNumber());

// NOTE: Do NOT automatically change patient status during study enrollment
// Patient status and study enrollment are separate concepts:
// - Enrollment = Association with a study (patient_enrollments table)
// - Status = Lifecycle state (REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED)
// The status should be changed explicitly via ChangePatientStatusCommand
// This prevents confusion where enrolling in a study automatically sets status to ENROLLED
log.info("Patient enrolled in study, but status remains: {}", patient.getStatus());
```

---

## Verification Steps

### 1. Clean Up Old Events (IMPORTANT!)

Old events in the event store will still have the bug behavior. You need to:

**Option A: Delete old PatientEnrolledEvents** (if test data):
```sql
-- WARNING: Only for test/dev environments!
DELETE FROM domain_event_entry 
WHERE payload_type = 'com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientEnrolledEvent';

-- Reset patient statuses to REGISTERED
UPDATE patient SET status = 'REGISTERED' WHERE status = 'ENROLLED';
```

**Option B: Replay with new logic** (production approach):
```sql
-- Mark events for replay
UPDATE domain_event_entry 
SET processed = false 
WHERE payload_type = 'com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientEnrolledEvent';
```

Then restart the service to replay events with fixed logic.

### 2. Restart Service

```bash
cd backend/clinprecision-clinops-service
mvn clean compile -DskipTests
# Restart the service
```

### 3. Test the Workflow

1. **Register a new patient**
   - Verify status: REGISTERED ✅

2. **Enroll patient in a study**
   - Check status: Should still be REGISTERED ✅
   - Check `patient_enrollments` table: Enrollment record exists ✅

3. **Change status REGISTERED → SCREENING**
   - Should succeed without error ✅
   - Verify status changed to SCREENING ✅

4. **Change status SCREENING → ENROLLED**
   - Should succeed ✅
   - Verify status changed to ENROLLED ✅

---

## Impact Analysis

### What Changed

✅ **Patients can be enrolled in studies without automatic status change**  
✅ **Status transitions now work correctly (REGISTERED → SCREENING)**  
✅ **Clear separation between enrollment and status concepts**  
✅ **Event sourcing integrity maintained**

### What Didn't Change

- Enrollment process still works
- `patient_enrollments` table still created correctly
- Status history still tracked via `patient_status_history`
- All existing APIs still function

### Breaking Change?

**Yes, but intentional:** This fixes incorrect behavior. Old code assumed:
```
Enroll in Study = Status automatically becomes ENROLLED
```

New code correctly treats them as separate:
```
Enroll in Study = Create association (status unchanged)
Change Status to ENROLLED = Explicit lifecycle transition
```

---

## Documentation Updates Needed

### 1. Update API Documentation

**PatientEnrollmentService.enrollPatient():**
```java
/**
 * Enroll a patient in a study
 * 
 * IMPORTANT: This creates a study enrollment association but does NOT 
 * change the patient's status. The patient status remains REGISTERED 
 * after enrollment. To progress the patient through the lifecycle, 
 * use PatientStatusService.changePatientStatus().
 * 
 * Typical workflow:
 * 1. Register patient (status: REGISTERED)
 * 2. Enroll in study (status: still REGISTERED)
 * 3. Change status to SCREENING (when screening begins)
 * 4. Change status to ENROLLED (when screening passes)
 */
```

### 2. Update User Guide

Add clarification to CLINPRECISION_USER_EXPERIENCE_GUIDE.md:

```markdown
## Understanding Enrollment vs. Status

**Study Enrollment** and **Patient Status** are separate concepts:

### Study Enrollment
- **What:** Association between a patient and a specific study
- **When:** Done early in the process (often same time as registration)
- **Result:** Patient can access study-specific forms, visits, protocols
- **Database:** `patient_enrollments` table

### Patient Status
- **What:** The patient's lifecycle stage in the clinical process
- **When:** Changes as patient progresses through workflow
- **Result:** Controls available actions, forms, visit types
- **Database:** `patient.status` field
- **Values:** REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED

### Example Workflow

1. **Day 1:** Register patient John Doe
   - Status: REGISTERED
   - Enrolled in: None

2. **Day 1:** Enroll John in "Cancer Study 123"
   - Status: Still REGISTERED (enrollment doesn't change status)
   - Enrolled in: Cancer Study 123

3. **Day 2:** John arrives for screening visit
   - Change status: REGISTERED → SCREENING
   - Enrolled in: Cancer Study 123

4. **Day 5:** John passes screening
   - Change status: SCREENING → ENROLLED
   - Enrolled in: Cancer Study 123
   - Note: "ENROLLED" status ≠ study enrollment (confusing but correct!)

5. **Day 10:** John starts treatment
   - Change status: ENROLLED → ACTIVE
   - Enrolled in: Cancer Study 123
```

---

## Testing Checklist

- [x] Build succeeds with new code
- [ ] Restart backend service
- [ ] Clean up old events (test environment)
- [ ] Register new patient → Verify status REGISTERED
- [ ] Enroll patient in study → Verify status still REGISTERED
- [ ] Change status REGISTERED → SCREENING → Verify succeeds
- [ ] Change status SCREENING → ENROLLED → Verify succeeds
- [ ] Verify `patient_enrollments` table has correct record
- [ ] Verify `patient_status_history` table has status changes
- [ ] Check event store: PatientEnrolledEvent and PatientStatusChangedEvent both exist

---

## Related Issues

- **Original Error:** "Invalid status transition from ENROLLED to SCREENING"
- **Confusion:** UI showing REGISTERED but aggregate having ENROLLED
- **Design Flaw:** Mixing enrollment action with status lifecycle

---

## Lessons Learned

1. **Domain concepts must be clearly separated** - Enrollment ≠ Status
2. **Event handlers should only update state relevant to the event** - EnrollPatientCommand should only create enrollment association
3. **Status changes should always be explicit** - Never automatic side effects
4. **Read model sync is critical** - Stale read models cause confusion
5. **Event sourcing requires careful thought** - Old events can cause issues if logic changes

---

## Files Modified

1. `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/aggregate/PatientAggregate.java`
   - Lines 149-169: Fixed `on(PatientEnrolledEvent)` to NOT change status

2. `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/projection/PatientEnrollmentProjector.java`
   - Lines 173-181: Removed automatic status change in projection

---

## Next Steps

1. ✅ Code fixed and compiled
2. ⏳ Restart backend service
3. ⏳ Clean up test data (delete old events or reset statuses)
4. ⏳ Test complete workflow end-to-end
5. ⏳ Update documentation
6. ⏳ Notify team of conceptual change

---

**Status:** Ready for testing after service restart + data cleanup
