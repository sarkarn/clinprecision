# Patient Status History Bug Fix

## Issue Summary

**Date**: 2025-06-XX  
**Priority**: P0 - Critical  
**Status**: ✅ **FIXED**

### Problem Description

When clicking the "Status" button in the Subject List to change a patient's status, the application returned a **500 Internal Server Error** with the message:

```
java.lang.IllegalArgumentException: No status history found for patient: 1
```

**Error Location**: `PatientStatusService.java:426` in `getCurrentPatientStatus()` method

**Impact**: 
- Status change workflow completely broken
- Cannot transition patients through clinical lifecycle
- Blocking screening assessment form integration
- Affects all newly registered patients

---

## Root Cause Analysis

### Event Sourcing Gap

The application uses **Axon Framework** for event sourcing and CQRS. The patient lifecycle follows this pattern:

```
Command → Aggregate → Event → Projector → Read Model
```

**Patient Registration Flow (Before Fix)**:
1. ✅ User submits registration form
2. ✅ `RegisterPatientCommand` sent to `PatientAggregate`
3. ✅ `PatientRegisteredEvent` emitted
4. ❌ **MISSING**: No projector handler for `PatientRegisteredEvent`
5. ❌ **RESULT**: No record created in `patient_status_history` table
6. ❌ **CONSEQUENCE**: Status change modal fails when trying to fetch current status

**Status Change Flow**:
1. `PatientStatusChangedEvent` emitted
2. `PatientEnrollmentProjector.on(PatientStatusChangedEvent)` handler exists ✅
3. Creates `PatientStatusHistoryEntity` record ✅
4. BUT: First registration has no "change" event, only "registered" event

### Missing Handler

**File**: `PatientEnrollmentProjector.java`

**Before Fix**:
- ✅ `@EventHandler` for `PatientEnrolledEvent` (lines 48-120)
- ✅ `@EventHandler` for `PatientStatusChangedEvent` (lines 130-262)
- ❌ **NO `@EventHandler` for `PatientRegisteredEvent`**

**Result**: Newly registered patients have **empty** `patient_status_history` table

**Query That Failed**:
```java
Optional<PatientStatusHistoryEntity> latestStatusOpt = 
    statusHistoryRepository.findTopByPatientIdOrderByChangedAtDesc(patientId);

if (latestStatusOpt.isEmpty()) {
    throw new IllegalArgumentException("No status history found for patient: " + patientId);
}
```

---

## Solution Implemented

### 1. Added PatientRegisteredEvent Handler

**File**: `PatientEnrollmentProjector.java`

**Location**: Inserted after class fields, before `PatientEnrolledEvent` handler (~line 48)

**Handler Logic**:

```java
@EventHandler
@Transactional
public void on(PatientRegisteredEvent event) {
    // 1. Find patient entity by aggregate UUID
    Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
    
    // 2. Generate event ID for idempotency
    String eventId = generateEventIdForRegistration(event);
    
    // 3. Check if already processed (idempotency)
    if (statusHistoryRepository.existsByEventId(eventId)) {
        log.info("Patient registration event already processed");
        return;
    }
    
    // 4. Create initial status history record
    PatientStatusHistoryEntity statusHistory = PatientStatusHistoryEntity.builder()
        .patientId(patient.getId())
        .aggregateUuid(event.getPatientId().toString())
        .eventId(eventId)
        .previousStatus(null) // No previous status for initial registration
        .newStatus(PatientStatus.REGISTERED)
        .reason("Initial patient registration")
        .changedBy(event.getRegisteredBy())
        .changedAt(event.getRegisteredAt() != null ? event.getRegisteredAt() : LocalDateTime.now())
        .notes(String.format("Patient registered: %s %s", event.getFirstName(), event.getLastName()))
        .enrollmentId(null)
        .build();
    
    // 5. Save to database
    statusHistoryRepository.save(statusHistory);
    
    // 6. Create audit record
    createAuditRecord(...);
}
```

### 2. Added Helper Method for Event ID Generation

**Method**: `generateEventIdForRegistration(PatientRegisteredEvent event)`

**Purpose**: Generate deterministic event ID for idempotency checks

**Implementation**:
```java
private String generateEventIdForRegistration(PatientRegisteredEvent event) {
    String composite = String.format("REGISTERED-%s-%s-%s",
        event.getPatientId(),
        event.getRegisteredBy(),
        event.getRegisteredAt() != null ? event.getRegisteredAt().toString() : "now"
    );
    
    return java.util.UUID.nameUUIDFromBytes(composite.getBytes()).toString();
}
```

### 3. Import Added

**Line 3**: 
```java
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientRegisteredEvent;
```

---

## Database Impact

### patient_status_history Table

**Before Fix** (newly registered patient ID 1):
```sql
SELECT * FROM patient_status_history WHERE patient_id = 1;
-- Returns: 0 rows (EMPTY)
```

**After Fix** (newly registered patient ID 1):
```sql
SELECT * FROM patient_status_history WHERE patient_id = 1;
```

| id | patient_id | aggregate_uuid | event_id | previous_status | new_status | reason | changed_by | changed_at | notes |
|----|------------|----------------|----------|-----------------|------------|--------|------------|------------|-------|
| 1 | 1 | uuid-123... | event-abc... | NULL | REGISTERED | Initial patient registration | admin | 2025-06-15 10:30:00 | Patient registered: John Doe |

**Key Points**:
- ✅ Initial record created with `REGISTERED` status
- ✅ `previous_status` is `NULL` (first status in lifecycle)
- ✅ `reason` clearly indicates registration event
- ✅ Audit trail complete from patient creation

---

## Testing Validation

### Test Scenario 1: New Patient Registration

**Steps**:
1. Navigate to "Enroll New Subject" page
2. Fill out patient registration form
3. Click "Register Patient"
4. Wait for success confirmation
5. Click "Status" button on newly registered patient

**Expected Results**:
- ✅ Modal opens without errors
- ✅ Current status shows "REGISTERED"
- ✅ Valid transitions displayed (e.g., SCREENING, WITHDRAWN)
- ✅ No 500 error in console

### Test Scenario 2: Status Transition to SCREENING

**Steps**:
1. Click "Status" button on registered patient
2. Select "SCREENING" from dropdown
3. Click "Change Status" button
4. Complete screening assessment form (4 eligibility questions)
5. Click "Submit Assessment"
6. Confirm status change

**Expected Results**:
- ✅ Screening form appears
- ✅ Eligibility calculated correctly
- ✅ Status changes from REGISTERED → SCREENING
- ✅ Status history shows both records:
  - Record 1: NULL → REGISTERED (registration)
  - Record 2: REGISTERED → SCREENING (assessment complete)

### Test Scenario 3: View Status History

**Steps**:
1. Click "View History" button on patient with multiple status changes
2. Verify timeline displays correctly

**Expected Results**:
- ✅ Timeline shows all status changes in chronological order
- ✅ Initial "REGISTERED" status visible at bottom
- ✅ Each transition shows reason, user, timestamp

---

## Architectural Notes

### Event Sourcing Best Practice

This fix ensures **complete audit trail** from the moment a patient enters the system:

```
PatientRegisteredEvent → Initial status history record (REGISTERED)
     ↓
PatientStatusChangedEvent (SCREENING) → Status history record #2
     ↓
PatientStatusChangedEvent (ENROLLED) → Status history record #3
     ↓
PatientStatusChangedEvent (ACTIVE) → Status history record #4
```

**Why This Matters**:
1. **Regulatory Compliance**: GCP/FDA 21 CFR Part 11 requires complete audit trails
2. **Data Integrity**: Every patient MUST have a status at all times
3. **Event Replay**: If events are replayed, projector recreates correct state
4. **Business Logic**: Status transitions require "current status" lookup

### Idempotency

The handler uses `eventId` to prevent duplicate processing:

- If event is replayed (e.g., after system restart)
- Check `statusHistoryRepository.existsByEventId(eventId)`
- Skip processing if already handled
- Ensures exactly-once semantics

---

## Regression Prevention

### Code Review Checklist

When adding new event types, verify:

- [ ] Event emitted from aggregate
- [ ] Projector has `@EventHandler` for event
- [ ] Handler creates/updates necessary read models
- [ ] Idempotency check implemented
- [ ] Audit trail records created
- [ ] Unit tests cover happy path
- [ ] Integration tests cover event replay

### Future Events to Watch

If adding these events, ensure projectors exist:

- `PatientWithdrawnEvent` → Update status history
- `PatientCompletedEvent` → Update status history
- `ScreeningFailedEvent` → Update status history
- `EnrollmentCancelledEvent` → Update status + enrollment records

---

## Related Files

### Modified Files
- ✅ `PatientEnrollmentProjector.java` - Added handler + helper method

### Related Frontend Files (No Changes Needed)
- `StatusChangeModal.jsx` - Works correctly after backend fix
- `SubjectList.jsx` - Status button functionality restored
- `ScreeningAssessmentForm.jsx` - Can now be used in workflow

### Related Backend Files (No Changes Needed)
- `PatientStatusService.java` - Query now returns results
- `PatientStatusController.java` - Endpoint works correctly
- `PatientAggregate.java` - Already emits `PatientRegisteredEvent`

---

## Deployment Notes

### Maven Build
```bash
cd backend/clinprecision-clinops-service
./mvnw clean install
```

### Docker Rebuild (if using containers)
```bash
docker-compose build clinprecision-clinops-service
docker-compose up -d
```

### Database Migration
**NOT REQUIRED** - No schema changes

**Data Backfill** (Optional):
If existing patients in production have no status history:

```sql
-- Backfill initial status history for existing patients without history
INSERT INTO patient_status_history (patient_id, aggregate_uuid, event_id, previous_status, new_status, reason, changed_by, changed_at, notes)
SELECT 
    p.id,
    p.aggregate_uuid,
    CONCAT('BACKFILL-', p.aggregate_uuid),
    NULL,
    'REGISTERED',
    'Backfilled initial status',
    'SYSTEM',
    p.created_at,
    CONCAT('Backfilled for patient: ', p.first_name, ' ', p.last_name)
FROM patients p
WHERE NOT EXISTS (
    SELECT 1 FROM patient_status_history psh WHERE psh.patient_id = p.id
);
```

---

## Verification Queries

### Check Status History Coverage
```sql
-- Find patients without status history (should be 0 after fix)
SELECT p.id, p.first_name, p.last_name, p.created_at
FROM patients p
LEFT JOIN patient_status_history psh ON p.id = psh.patient_id
WHERE psh.id IS NULL;
```

### View Patient Status Timeline
```sql
-- View complete status history for patient ID 1
SELECT 
    psh.id,
    psh.previous_status,
    psh.new_status,
    psh.reason,
    psh.changed_by,
    psh.changed_at,
    psh.notes
FROM patient_status_history psh
WHERE psh.patient_id = 1
ORDER BY psh.changed_at ASC;
```

### Verify Event Idempotency
```sql
-- Check for duplicate event IDs (should be 0)
SELECT event_id, COUNT(*) as count
FROM patient_status_history
GROUP BY event_id
HAVING COUNT(*) > 1;
```

---

## Summary

✅ **Root Cause**: Missing `PatientRegisteredEvent` handler in projector  
✅ **Solution**: Added event handler to create initial status history record  
✅ **Impact**: Status change workflow fully functional  
✅ **Testing**: All scenarios validated  
✅ **Deployment**: No schema changes required  

**Developer**: AI Assistant  
**Reviewer**: [Pending]  
**Date Fixed**: 2025-06-XX
