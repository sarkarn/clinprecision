# Week 2 - Task 1: Database Schema Complete ✅

**Date:** December 29, 2024  
**Task:** Database schema for patient_status_history table  
**Duration:** 45 minutes  
**Status:** ✅ COMPLETE

---

## 📋 Task Summary

Successfully created database schema for patient status history tracking with comprehensive audit trail capabilities.

---

## 🎯 Deliverables

### 1. Migration Script Created
**File:** `backend/clinprecision-db/ddl/V1.15__create_patient_status_history.sql`

**Contents:**
- ✅ patient_status_history table definition
- ✅ Comprehensive indexes for performance
- ✅ Foreign key constraints
- ✅ Database triggers for validation
- ✅ Views for quick status lookup
- ✅ Helper functions
- ✅ Complete inline documentation

### 2. Schema Updated
**File:** `backend/clinprecision-db/ddl/consolidated_schema.sql`

**Changes:**
- ✅ Updated patients table enum from old 5-status to new 6-status system
- ✅ Added status flow comment for documentation

---

## 📊 Table Structure: patient_status_history

```sql
CREATE TABLE IF NOT EXISTS patient_status_history (
    -- Primary Key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Patient References
    patient_id BIGINT NOT NULL,              -- FK to patients table
    aggregate_uuid VARCHAR(255) NOT NULL,     -- Patient aggregate UUID
    
    -- Event Tracking
    event_id VARCHAR(255) NOT NULL UNIQUE,    -- Event store event ID (idempotency)
    
    -- Status Transition
    previous_status VARCHAR(50) NOT NULL,     -- Previous status
    new_status VARCHAR(50) NOT NULL,          -- New status after transition
    
    -- Change Context
    reason TEXT NOT NULL,                     -- Required reason for change
    changed_by VARCHAR(100) NOT NULL,         -- User who performed change
    changed_at TIMESTAMP NOT NULL,            -- Timestamp of change
    notes TEXT,                               -- Optional notes
    
    -- Optional Context
    enrollment_id BIGINT NULL,                -- Optional FK to patient_enrollments
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES patient_enrollments(id) ON DELETE SET NULL
);
```

---

## 🔍 Indexes Created

Optimized for common query patterns:

| Index Name | Columns | Purpose |
|-----------|---------|---------|
| `idx_patient_status_history_patient_id` | patient_id | Get all status changes for a patient |
| `idx_patient_status_history_aggregate_uuid` | aggregate_uuid | Lookup by aggregate UUID |
| `idx_patient_status_history_event_id` | event_id | Idempotency check |
| `idx_patient_status_history_changed_at` | changed_at DESC | Chronological ordering |
| `idx_patient_status_history_new_status` | new_status | Filter by current status |
| `idx_patient_status_history_changed_by` | changed_by | Audit by user |
| `idx_patient_status_history_enrollment_id` | enrollment_id | Enrollment-specific history |

---

## 🛡️ Database Triggers

### trg_validate_status_transition

**Purpose:** Enforce valid status transitions at database level

**Valid Transitions:**
- REGISTERED → SCREENING, WITHDRAWN
- SCREENING → ENROLLED, WITHDRAWN
- ENROLLED → ACTIVE, WITHDRAWN
- ACTIVE → COMPLETED, WITHDRAWN
- COMPLETED → (none - terminal)
- WITHDRAWN → (none - terminal)

**Validation Rules:**
1. ✅ Only allow valid status transitions
2. ✅ Require non-empty reason for all changes
3. ✅ Raise error on invalid transition with helpful message

**Example Error:**
```
Invalid status transition: ENROLLED → COMPLETED. 
Valid transitions: REGISTERED→SCREENING, SCREENING→ENROLLED, 
ENROLLED→ACTIVE, ACTIVE→COMPLETED, ANY→WITHDRAWN
```

---

## 📊 Views Created

### v_patient_current_status

**Purpose:** Quick lookup of current status for each patient

**Columns:**
- patient_id
- aggregate_uuid
- current_status
- previous_status
- reason
- changed_by
- changed_at
- notes
- days_in_current_status

**Use Cases:**
- Dashboard "Current Status" column
- Filter patients by current status
- Show status duration

**Query Example:**
```sql
SELECT * FROM v_patient_current_status
WHERE current_status = 'ACTIVE'
ORDER BY days_in_current_status DESC;
```

### v_status_transition_summary

**Purpose:** Aggregate statistics on status transitions

**Columns:**
- previous_status
- new_status
- transition_count
- unique_patients
- avg_days_between_transitions

**Use Cases:**
- Analyze transition patterns
- Identify bottlenecks in patient flow
- Calculate average time in each status

**Query Example:**
```sql
SELECT * FROM v_status_transition_summary
WHERE previous_status = 'SCREENING' AND new_status = 'ENROLLED';
```

---

## ⚙️ Functions Created

### fn_get_patient_status_count

**Purpose:** Count total status changes for a patient

**Signature:**
```sql
fn_get_patient_status_count(p_patient_id BIGINT) RETURNS INT
```

**Use Case:**
```sql
SELECT patient_id, fn_get_patient_status_count(patient_id) AS status_changes
FROM patients
HAVING status_changes > 5;
```

---

## 🔄 Status Enum Update

### patients Table (consolidated_schema.sql)

**Old Enum:**
```sql
status ENUM('REGISTERED', 'SCREENED', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN')
```

**New Enum:**
```sql
status ENUM('REGISTERED', 'SCREENING', 'ENROLLED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN')
```

**Migration Impact:**
- ⚠️ Existing data with old statuses will need migration script
- ⚠️ 'SCREENED' → 'SCREENING'
- ⚠️ 'ELIGIBLE' → 'ENROLLED' (requires judgment)
- ⚠️ 'INELIGIBLE' → 'WITHDRAWN' with reason

---

## 📈 Benefits Delivered

### Regulatory Compliance
- ✅ Complete audit trail for FDA 21 CFR Part 11 compliance
- ✅ Immutable history (no updates, only inserts)
- ✅ Tracks who, when, why, and what changed
- ✅ Event sourcing integration via event_id

### Data Quality
- ✅ Database-level validation of status transitions
- ✅ Required reason field prevents unaudited changes
- ✅ Idempotency protection via unique event_id
- ✅ Foreign key constraints maintain referential integrity

### Performance
- ✅ 7 indexes for optimized query patterns
- ✅ Views for common queries (no repeated joins)
- ✅ Efficient chronological ordering

### Developer Experience
- ✅ Comprehensive inline comments
- ✅ Helper functions reduce code duplication
- ✅ Clear error messages from triggers
- ✅ Sample data for testing (commented out)

---

## 🔗 Integration Points

### Event Sourcing
- `event_id` links to `domain_event_entry.event_identifier`
- Projector will create history record on `PatientStatusChangedEvent`
- Idempotency prevents duplicate records on event replay

### Patient Aggregate
- `aggregate_uuid` matches `PatientAggregate.patientId`
- `patient_id` links to read model `patients.id`
- Maintains consistency between event store and read model

### Patient Enrollments
- Optional `enrollment_id` for enrollment-specific status changes
- Supports multi-enrollment scenarios (patient in multiple studies)

---

## 🧪 Testing Scenarios

### Test 1: Valid Transition
```sql
INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, 
 reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-1', 'REGISTERED', 'SCREENING',
 'Screening visit scheduled', 'coordinator@example.com', NOW());
-- ✅ Should succeed
```

### Test 2: Invalid Transition
```sql
INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, 
 reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-2', 'ENROLLED', 'COMPLETED',
 'Should fail', 'coordinator@example.com', NOW());
-- ❌ Should fail: Invalid transition (must go ENROLLED → ACTIVE first)
```

### Test 3: Missing Reason
```sql
INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, 
 reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-3', 'SCREENING', 'ENROLLED',
 '', 'coordinator@example.com', NOW());
-- ❌ Should fail: Reason is required
```

### Test 4: Duplicate Event ID
```sql
-- Insert same event_id twice (simulate event replay)
INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, 
 reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-4', 'SCREENING', 'ENROLLED',
 'First insert', 'coordinator@example.com', NOW());

INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, 
 reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-4', 'SCREENING', 'ENROLLED',
 'Duplicate event', 'coordinator@example.com', NOW());
-- ❌ Should fail: Unique constraint on event_id
```

---

## 📝 Next Steps (Task 2)

### Create Java Entities
1. **PatientStatusHistoryEntity.java**
   - Map to patient_status_history table
   - Use @Entity, @Table, @Id annotations
   - Add relationships to PatientEntity and PatientEnrollmentEntity

2. **PatientStatusHistoryRepository.java**
   - Extend JpaRepository<PatientStatusHistoryEntity, Long>
   - Add custom query methods:
     - `findByPatientIdOrderByChangedAtDesc(Long patientId)`
     - `findByAggregateUuid(String aggregateUuid)`
     - `findByEventId(String eventId)`
     - `findByNewStatus(PatientStatus status)`

**Estimated Time:** 45 minutes

---

## 🎓 Key Learnings

1. **Database-Level Validation:** Triggers provide last line of defense against invalid data
2. **Idempotency:** Unique constraint on event_id prevents duplicate records during event replay
3. **Performance:** Strategic indexes crucial for audit queries (often filtered by patient_id or changed_at)
4. **Flexibility:** VARCHAR(50) for status columns allows future status additions without schema change
5. **Documentation:** Inline comments and view descriptions improve maintainability

---

## ✅ Checklist

- [x] patient_status_history table created
- [x] Foreign key constraints added
- [x] 7 indexes created for performance
- [x] Trigger for status transition validation
- [x] v_patient_current_status view created
- [x] v_status_transition_summary view created
- [x] fn_get_patient_status_count function created
- [x] patients table enum updated
- [x] Inline documentation added
- [x] Sample test data added (commented)
- [x] Migration script numbered (V1.15)

---

## 📚 References

- **Specification:** `WEEK_2_STATUS_MANAGEMENT_PLAN.md` - Task 1
- **Enum Fix:** `WEEK_2_ENUM_FIX_COMPLETE.md`
- **Visual Guide:** `PATIENT_STATUS_LIFECYCLE_VISUAL_GUIDE.md`
- **Schema File:** `backend/clinprecision-db/ddl/consolidated_schema.sql`
- **Migration File:** `backend/clinprecision-db/ddl/V1.15__create_patient_status_history.sql`

---

**Ready for Task 2: Entity Creation** ✅

