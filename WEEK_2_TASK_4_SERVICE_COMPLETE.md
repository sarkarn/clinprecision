# Week 2 - Task 4: PatientStatusService Creation Complete ✅

**Date:** October 12, 2025  
**Task:** Create service layer for patient status management  
**Duration:** 1 hour  
**Status:** ✅ COMPLETE

---

## 📋 Task Summary

Successfully created comprehensive service layer (`PatientStatusService`) that orchestrates patient status changes and provides rich query operations. The service follows CQRS patterns, integrating with Axon CommandGateway for write operations and repository layer for read operations.

---

## 🎯 Deliverables

### PatientStatusService ✅
**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/service/PatientStatusService.java`

**Features:**
- ✅ **Command Operations:** 3 write methods with validation
- ✅ **Query Operations:** 10 read methods for analytics
- ✅ **Business Logic:** Status transition validation
- ✅ **Integration:** Axon CommandGateway + Repository
- ✅ **Error Handling:** Comprehensive validation and logging
- ✅ **Documentation:** 600+ lines with full JavaDoc

---

## 📊 Service Architecture

### CQRS Pattern

```
┌─────────────┐
│ UI/Frontend │
└──────┬──────┘
       │
       ↓
┌──────────────────────┐
│ PatientStatusService │
└──────┬───────────────┘
       │
       ├──────────── Write Operations ───────────→ CommandGateway → PatientAggregate
       │                                                    ↓
       │                                          PatientStatusChangedEvent
       │                                                    ↓
       │                                        PatientEnrollmentProjector
       │                                                    ↓
       └──────────── Read Operations ────────→ Repository → [patient_status_history]
```

---

## 🔨 Command Operations (Write)

### 1. changePatientStatus() - Main Command Method

**Purpose:** Orchestrate complete status change flow with validation

**Flow:**
```
1. Validate Inputs (patientId, newStatus, reason, changedBy)
2. Find Patient Entity (by database ID)
3. Get Current Status (from patient entity)
4. Validate Transition (business rules)
5. Create ChangePatientStatusCommand (Axon command)
6. Send to CommandGateway (dispatch to aggregate)
7. Wait for Command Completion (future.join())
8. Wait for Projection (status history record created)
9. Return Status History Entity
```

**Method Signature:**
```java
public PatientStatusHistoryEntity changePatientStatus(
    Long patientId,
    PatientStatus newStatus,
    String reason,
    String changedBy,
    String notes
)
```

**Example Usage:**
```java
PatientStatusHistoryEntity history = patientStatusService.changePatientStatus(
    1L,                                      // patientId
    PatientStatus.SCREENING,                 // newStatus
    "Screening visit scheduled for Oct 15",  // reason
    "coordinator@example.com",               // changedBy
    "Patient confirmed availability"         // notes (optional)
);

System.out.println("Status changed: " + history.getStatusChangeDescription());
// Output: "Registered → Screening: Screening visit scheduled for Oct 15"
```

**Validation Rules:**
- ✅ Patient ID required
- ✅ New status required
- ✅ Reason required (not empty)
- ✅ Changed by required (not empty)
- ✅ Patient must exist
- ✅ Status transition must be valid
- ✅ Cannot transition from terminal status
- ✅ Cannot transition to same status

**Error Handling:**
```java
try {
    history = patientStatusService.changePatientStatus(...);
} catch (IllegalArgumentException e) {
    // Validation failed (invalid transition, missing reason, etc.)
    log.error("Validation error: {}", e.getMessage());
} catch (RuntimeException e) {
    // Command processing failed or projection timeout
    log.error("Command failed: {}", e.getMessage());
}
```

---

### 2. validateStatusTransition() - Business Rule Validation

**Purpose:** Ensure status transitions follow lifecycle rules

**Valid Transitions:**
| From Status | To Status | Use Case |
|------------|-----------|----------|
| `REGISTERED` | `SCREENING` | Screening visit scheduled |
| `REGISTERED` | `WITHDRAWN` | Patient decided not to participate |
| `SCREENING` | `ENROLLED` | Passed eligibility criteria |
| `SCREENING` | `WITHDRAWN` | Failed screening or withdrew |
| `ENROLLED` | `ACTIVE` | First treatment visit completed |
| `ENROLLED` | `WITHDRAWN` | Withdrew before treatment start |
| `ACTIVE` | `COMPLETED` | Completed all study visits |
| `ACTIVE` | `WITHDRAWN` | Withdrew during treatment |
| `COMPLETED` | *(none)* | Terminal status |
| `WITHDRAWN` | *(none)* | Terminal status |

**Special Rule:** Can always transition to `WITHDRAWN` from any non-terminal status

**Method Logic:**
```java
public void validateStatusTransition(PatientStatus currentStatus, PatientStatus newStatus) {
    // 1. Check nulls
    // 2. Check same status (no-op)
    // 3. Check terminal status (cannot change)
    // 4. Check WITHDRAWN (always allowed from non-terminal)
    // 5. Check specific transitions
    // 6. Throw exception if invalid
}
```

**Example Validation:**
```java
// Valid transition
patientStatusService.validateStatusTransition(
    PatientStatus.REGISTERED,
    PatientStatus.SCREENING
); // ✅ No exception

// Invalid transition
patientStatusService.validateStatusTransition(
    PatientStatus.REGISTERED,
    PatientStatus.ENROLLED
); // ❌ Throws: "Invalid status transition: REGISTERED → ENROLLED. 
   //    Valid transitions from REGISTERED: SCREENING, WITHDRAWN"
```

---

### 3. changePatientStatus() - With Enrollment Context

**Purpose:** Variant that includes enrollment ID for enrollment-specific changes

**Method Signature:**
```java
public PatientStatusHistoryEntity changePatientStatus(
    Long patientId,
    Long enrollmentId,  // ✅ Additional parameter
    PatientStatus newStatus,
    String reason,
    String changedBy,
    String notes
)
```

**Use Case:** When status change is tied to specific study enrollment (patient enrolled in multiple studies)

**Example:**
```java
// Patient in multiple studies - change status for specific enrollment
PatientStatusHistoryEntity history = patientStatusService.changePatientStatus(
    patientId: 1L,
    enrollmentId: 5L,      // ✅ Specific enrollment
    newStatus: PatientStatus.ACTIVE,
    reason: "Started treatment in Study ABC",
    changedBy: "dr.smith@example.com",
    notes: "First dose administered"
);
```

---

## 🔍 Query Operations (Read)

### 1. getPatientStatusHistory() - Complete Audit Trail

**Purpose:** Retrieve all status changes for a patient

**Returns:** List ordered chronologically (newest first)

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<PatientStatusHistoryEntity> getPatientStatusHistory(Long patientId)
```

**Example Usage:**
```java
List<PatientStatusHistoryEntity> history = 
    patientStatusService.getPatientStatusHistory(1L);

for (PatientStatusHistoryEntity change : history) {
    System.out.printf("%s → %s: %s (by %s on %s)%n",
        change.getPreviousStatus(),
        change.getNewStatus(),
        change.getReason(),
        change.getChangedBy(),
        change.getChangedAt()
    );
}

// Output:
// ENROLLED → ACTIVE: First treatment completed (by dr.smith@example.com on 2025-10-12)
// SCREENING → ENROLLED: Passed eligibility (by coordinator@example.com on 2025-10-05)
// REGISTERED → SCREENING: Scheduled screening visit (by coordinator@example.com on 2025-09-28)
```

---

### 2. getCurrentPatientStatus() - Most Recent Status

**Purpose:** Get current status with full context (reason, who, when)

**Method Signature:**
```java
@Transactional(readOnly = true)
public PatientStatusHistoryEntity getCurrentPatientStatus(Long patientId)
```

**Example Usage:**
```java
PatientStatusHistoryEntity current = 
    patientStatusService.getCurrentPatientStatus(1L);

System.out.println("Current Status: " + current.getNewStatus());
System.out.println("Since: " + current.getChangedAt());
System.out.println("Reason: " + current.getReason());
System.out.println("Changed By: " + current.getChangedBy());

// Output:
// Current Status: ACTIVE
// Since: 2025-10-12T10:30:00
// Reason: First treatment completed
// Changed By: dr.smith@example.com
```

---

### 3. getStatusTransitionSummary() - Analytics

**Purpose:** Aggregate statistics on transitions across all patients

**Returns:** List of `StatusTransitionSummary` (projection interface)

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<StatusTransitionSummary> getStatusTransitionSummary()
```

**Example Usage:**
```java
List<StatusTransitionSummary> summary = 
    patientStatusService.getStatusTransitionSummary();

for (StatusTransitionSummary s : summary) {
    System.out.printf("%s → %s: %d transitions (%d unique patients)%n",
        s.getPreviousStatus(),
        s.getNewStatus(),
        s.getTransitionCount(),
        s.getUniquePatientCount()
    );
}

// Output:
// SCREENING → ENROLLED: 38 transitions (38 unique patients)
// ENROLLED → ACTIVE: 35 transitions (35 unique patients)
// REGISTERED → SCREENING: 52 transitions (50 unique patients)
// ACTIVE → COMPLETED: 15 transitions (15 unique patients)
```

---

### 4. findPatientsInStatus() - Filter by Status

**Purpose:** Find all patients currently in a specific status

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<PatientStatusHistoryEntity> findPatientsInStatus(PatientStatus status)
```

**Example Usage:**
```java
List<PatientStatusHistoryEntity> activePatients = 
    patientStatusService.findPatientsInStatus(PatientStatus.ACTIVE);

System.out.println("Active patients: " + activePatients.size());

for (PatientStatusHistoryEntity patient : activePatients) {
    System.out.printf("Patient %d: Active since %s%n",
        patient.getPatientId(),
        patient.getChangedAt()
    );
}
```

---

### 5. findPatientsStuckInStatus() - Identify Bottlenecks

**Purpose:** Find patients in a status longer than threshold (bottleneck detection)

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<Long> findPatientsStuckInStatus(PatientStatus status, int days)
```

**Example Usage:**
```java
// Find patients stuck in SCREENING for more than 14 days
List<Long> stuckPatients = patientStatusService.findPatientsStuckInStatus(
    PatientStatus.SCREENING,
    14  // days
);

System.out.println("Patients stuck in screening: " + stuckPatients.size());

for (Long patientId : stuckPatients) {
    PatientEntity patient = patientRepository.findById(patientId).get();
    System.out.println("  - " + patient.getFullName());
}

// Output:
// Patients stuck in screening: 5
//   - John Doe
//   - Jane Smith
//   - Bob Johnson
```

**Use Cases:**
- Quality assurance (identify delays)
- Resource allocation (patients needing attention)
- Compliance monitoring (regulatory timelines)

---

### 6. countStatusChanges() - Activity Metric

**Purpose:** Count total status changes for a patient

**Method Signature:**
```java
@Transactional(readOnly = true)
public long countStatusChanges(Long patientId)
```

**Example:**
```java
long changeCount = patientStatusService.countStatusChanges(1L);
System.out.println("Patient has " + changeCount + " status changes");
// Output: Patient has 4 status changes
```

**Use Case:** Identify patients with unusual number of changes (multiple withdrawals/re-enrollments)

---

### 7. getStatusChangesByDateRange() - Audit Reports

**Purpose:** Get status changes within date range for compliance reports

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<PatientStatusHistoryEntity> getStatusChangesByDateRange(
    LocalDateTime startDate,
    LocalDateTime endDate
)
```

**Example:**
```java
// Q3 2025 audit report
LocalDateTime start = LocalDateTime.of(2025, 7, 1, 0, 0);
LocalDateTime end = LocalDateTime.of(2025, 9, 30, 23, 59);

List<PatientStatusHistoryEntity> q3Changes = 
    patientStatusService.getStatusChangesByDateRange(start, end);

System.out.println("Q3 2025 status changes: " + q3Changes.size());
```

---

### 8. getStatusChangesByUser() - User Activity Audit

**Purpose:** Track which users made status changes

**Method Signature:**
```java
@Transactional(readOnly = true)
public List<PatientStatusHistoryEntity> getStatusChangesByUser(String changedBy)
```

**Example:**
```java
List<PatientStatusHistoryEntity> coordinatorChanges = 
    patientStatusService.getStatusChangesByUser("coordinator@example.com");

System.out.println("Coordinator made " + coordinatorChanges.size() + " status changes");
```

**Use Case:** User activity reports, training assessment, compliance audits

---

### 9. getAverageDaysBetweenChanges() - Progression Speed

**Purpose:** Calculate average patient progression speed

**Method Signature:**
```java
@Transactional(readOnly = true)
public Double getAverageDaysBetweenChanges(Long patientId)
```

**Example:**
```java
Double avgDays = patientStatusService.getAverageDaysBetweenChanges(1L);

if (avgDays != null) {
    System.out.printf("Patient progresses through statuses every %.1f days on average%n", avgDays);
} else {
    System.out.println("Insufficient data to calculate average");
}

// Output: Patient progresses through statuses every 7.3 days on average
```

**Use Cases:**
- Identify fast/slow progressors
- Study timeline estimation
- Resource planning

---

### 10. Utility Methods

**patientExists()** - Check if patient exists
```java
boolean exists = patientStatusService.patientExists(1L);
```

**getPatientEntity()** - Get patient entity (internal use)
```java
PatientEntity patient = patientStatusService.getPatientEntity(1L);
```

---

## 🔄 Integration Flow

### Write Operation Flow

```
Controller
    ↓
PatientStatusService.changePatientStatus()
    ↓
1. Validate inputs
2. Find patient entity
3. Validate transition
    ↓
CommandGateway.send(ChangePatientStatusCommand)
    ↓
PatientAggregate.handle(ChangePatientStatusCommand)
    ↓
PatientAggregate.apply(PatientStatusChangedEvent)
    ↓
Event Store (domain_event_entry)
    ↓
PatientEnrollmentProjector.on(PatientStatusChangedEvent)
    ↓
[patients, patient_status_history tables updated]
    ↓
PatientStatusService.waitForStatusHistoryProjection()
    ↓
Return PatientStatusHistoryEntity to Controller
```

### Read Operation Flow

```
Controller
    ↓
PatientStatusService.getPatientStatusHistory()
    ↓
PatientStatusHistoryRepository.findByPatientIdOrderByChangedAtDesc()
    ↓
[patient_status_history table]
    ↓
Return List<PatientStatusHistoryEntity> to Controller
```

---

## 📈 Benefits Delivered

### Business Logic Encapsulation ✅
- All status transition rules in one place
- Easy to modify and test
- Consistent validation across application

### CQRS Pattern ✅
- Clear separation of write (commands) and read (queries)
- Optimized for different access patterns
- Scalable architecture

### Rich Query API ✅
- 10 query methods for various use cases
- Analytics and reporting support
- Audit trail access

### Error Handling ✅
- Comprehensive validation
- Descriptive error messages
- Graceful degradation

### Developer Experience ✅
- Well-documented methods
- Clear method names
- Type-safe API

---

## 🧪 Testing Scenarios

### Test 1: Valid Status Change
```java
@Test
public void testValidStatusChange() {
    // Given: Patient in REGISTERED status
    PatientEntity patient = createPatient(PatientStatus.REGISTERED);
    
    // When: Change to SCREENING
    PatientStatusHistoryEntity history = patientStatusService.changePatientStatus(
        patient.getId(),
        PatientStatus.SCREENING,
        "Screening visit scheduled",
        "coordinator@example.com",
        null
    );
    
    // Then: Status changed successfully
    assertNotNull(history);
    assertEquals(PatientStatus.REGISTERED, history.getPreviousStatus());
    assertEquals(PatientStatus.SCREENING, history.getNewStatus());
    assertEquals("Screening visit scheduled", history.getReason());
}
```

### Test 2: Invalid Transition
```java
@Test
public void testInvalidTransition() {
    // Given: Patient in REGISTERED status
    PatientEntity patient = createPatient(PatientStatus.REGISTERED);
    
    // When: Try to change directly to ENROLLED (invalid)
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> patientStatusService.changePatientStatus(
            patient.getId(),
            PatientStatus.ENROLLED,  // ❌ Invalid: must go through SCREENING first
            "Test",
            "test@example.com",
            null
        )
    );
    
    // Then: Exception thrown with helpful message
    assertTrue(exception.getMessage().contains("Invalid status transition"));
    assertTrue(exception.getMessage().contains("REGISTERED → ENROLLED"));
}
```

### Test 3: Terminal Status
```java
@Test
public void testCannotChangeTerminalStatus() {
    // Given: Patient in COMPLETED status (terminal)
    PatientEntity patient = createPatient(PatientStatus.COMPLETED);
    
    // When: Try to change status
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> patientStatusService.changePatientStatus(
            patient.getId(),
            PatientStatus.ACTIVE,
            "Test",
            "test@example.com",
            null
        )
    );
    
    // Then: Exception thrown
    assertTrue(exception.getMessage().contains("terminal status"));
}
```

### Test 4: Missing Reason
```java
@Test
public void testMissingReason() {
    // Given: Patient in REGISTERED status
    PatientEntity patient = createPatient(PatientStatus.REGISTERED);
    
    // When: Try to change without reason
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> patientStatusService.changePatientStatus(
            patient.getId(),
            PatientStatus.SCREENING,
            "",  // ❌ Empty reason
            "coordinator@example.com",
            null
        )
    );
    
    // Then: Exception thrown
    assertTrue(exception.getMessage().contains("Reason is required"));
}
```

### Test 5: Get Status History
```java
@Test
public void testGetStatusHistory() {
    // Given: Patient with multiple status changes
    PatientEntity patient = createPatientWithHistory();
    
    // When: Get status history
    List<PatientStatusHistoryEntity> history = 
        patientStatusService.getPatientStatusHistory(patient.getId());
    
    // Then: All changes returned in chronological order
    assertEquals(3, history.size());
    assertEquals(PatientStatus.ACTIVE, history.get(0).getNewStatus());  // Most recent
    assertEquals(PatientStatus.ENROLLED, history.get(1).getNewStatus());
    assertEquals(PatientStatus.SCREENING, history.get(2).getNewStatus());
}
```

### Test 6: Find Stuck Patients
```java
@Test
public void testFindStuckPatients() {
    // Given: Patient stuck in SCREENING for 20 days
    PatientEntity patient = createPatientStuckInStatus(PatientStatus.SCREENING, 20);
    
    // When: Find patients stuck > 14 days
    List<Long> stuckPatients = patientStatusService.findPatientsStuckInStatus(
        PatientStatus.SCREENING,
        14
    );
    
    // Then: Patient found
    assertTrue(stuckPatients.contains(patient.getId()));
}
```

---

## 🎓 Key Learnings

1. **Service Layer Role:** Orchestrates business logic, validation, and integration between command and query sides
2. **CQRS Separation:** Commands go through CommandGateway, queries go through Repository
3. **Validation Placement:** Business rules in service layer, data constraints in entity/aggregate
4. **Waiting for Projection:** Event sourcing requires polling for projection completion
5. **Rich Query API:** Multiple specialized query methods better than generic queries
6. **Error Messages:** Descriptive errors with context improve debugging and user experience

---

## 📝 Next Steps (Task 5)

### Create REST API Controller
1. **PatientStatusController**
   - POST /api/patients/{id}/status - Change status
   - GET /api/patients/{id}/status/history - Get history
   - GET /api/patients/{id}/status/current - Get current status
   - GET /api/status/summary - Get transition summary
   - GET /api/status/{status}/patients - Find patients in status
   - GET /api/status/{status}/stuck?days={days} - Find stuck patients

2. **Request/Response DTOs**
   - ChangePatientStatusRequest
   - PatientStatusHistoryResponse
   - StatusTransitionSummaryResponse

3. **Exception Handling**
   - @ControllerAdvice for consistent error responses
   - HTTP status code mapping

**Estimated Time:** 1.5 hours

---

## ✅ Checklist

### Service Implementation
- [x] Command operations (3 methods)
- [x] Query operations (10 methods)
- [x] Status transition validation
- [x] CommandGateway integration
- [x] Repository integration
- [x] Error handling and logging
- [x] Comprehensive JavaDoc

### Method Categories
- [x] Write operations with validation
- [x] Read operations for audit trail
- [x] Analytics queries
- [x] User activity queries
- [x] Bottleneck detection
- [x] Date range queries
- [x] Utility methods

### Code Quality
- [x] @Transactional annotations
- [x] @Transactional(readOnly = true) for queries
- [x] Logging at appropriate levels
- [x] Descriptive error messages
- [x] Null checks and validation
- [x] Type safety

---

## 📚 References

- **Task Plan:** `WEEK_2_STATUS_MANAGEMENT_PLAN.md` - Task 4
- **Projector:** `WEEK_2_TASK_3_PROJECTOR_COMPLETE.md`
- **Repository:** `WEEK_2_TASK_2_ENTITY_REPOSITORY_COMPLETE.md`
- **Visual Guide:** `PATIENT_STATUS_LIFECYCLE_VISUAL_GUIDE.md`
- **Service File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/service/PatientStatusService.java`

---

## 📊 Code Statistics

- **Total Lines:** ~600 lines
- **Command Methods:** 3 (write operations)
- **Query Methods:** 10 (read operations)
- **Validation Methods:** 2
- **Utility Methods:** 3
- **JavaDoc Coverage:** 100%
- **Dependencies:** 3 (CommandGateway, 2 Repositories)

---

**Ready for Task 5: Create REST API Controller** ✅

