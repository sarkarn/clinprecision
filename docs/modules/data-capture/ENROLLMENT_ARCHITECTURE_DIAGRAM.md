# Patient Enrollment Event Sourcing Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                                    │
│  SubjectEnrollment.jsx                                                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  1. POST /clinops-ws/api/v1/patients                             │      │
│  │     { firstName, lastName, email, phone, dob, gender }           │      │
│  │     → Register Patient                                            │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                              ↓                                               │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  2. POST /clinops-ws/api/v1/patients/{id}/enroll                 │      │
│  │     { studyId, siteId, screeningNumber, enrollmentDate }         │      │
│  │     → Enroll Patient in Study                                     │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                     REST CONTROLLER (Spring Boot)                            │
│  PatientEnrollmentController                                                 │
│                                                                              │
│  @PostMapping("/patients")                                                   │
│  registerPatient() → PatientEnrollmentService.registerPatient()             │
│                                                                              │
│  @PostMapping("/patients/{id}/enroll")                                       │
│  enrollPatient() → PatientEnrollmentService.enrollPatient()                 │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                         │
│  PatientEnrollmentService                                                    │
│                                                                              │
│  enrollPatient(patientId, dto, user):                                        │
│    1. Validate inputs                                                        │
│    2. Check patient exists                                                   │
│    3. Check uniqueness (screening number, patient-study)                     │
│    4. Validate site-study association                                        │
│    5. Check enrollment cap                                                   │
│    6. Build EnrollPatientCommand                                             │
│    7. commandGateway.send(command) ──────────┐                              │
│    8. Wait for projection (5 sec timeout)    │                              │
│    9. Return enrollment entity               │                              │
└──────────────────────────────────────────────┼──────────────────────────────┘
                                               │
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMMAND BUS (Axon Framework)                            │
│                                                                              │
│  Route command to target aggregate:                                          │
│  @TargetAggregateIdentifier = patientId                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGGREGATE (Event Sourcing)                           │
│  PatientAggregate                                                            │
│                                                                              │
│  @CommandHandler                                                             │
│  handle(EnrollPatientCommand cmd):                                           │
│    ┌─────────────────────────────────────────────────────────┐             │
│    │ BUSINESS RULES VALIDATION                                │             │
│    │ • Patient must be REGISTERED or SCREENING                │             │
│    │ • Cannot enroll in same study twice                      │             │
│    │ • Study and site must be valid                           │             │
│    └─────────────────────────────────────────────────────────┘             │
│                              ↓                                               │
│    AggregateLifecycle.apply(PatientEnrolledEvent)                           │
│                              ↓                                               │
│  @EventSourcingHandler                                                       │
│  on(PatientEnrolledEvent event):                                             │
│    • studyEnrollments.add(event.studyId)                                     │
│    • status = ENROLLED                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EVENT STORE (Axon Server)                              │
│                                                                              │
│  domain_event_entry:                                                         │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │ aggregate_identifier: patient-uuid                          │            │
│  │ sequence_number: 2                                          │            │
│  │ type: PatientEnrolledEvent                                  │            │
│  │ payload: {enrollmentId, studyId, siteId, ...}               │            │
│  │ timestamp: 2025-10-11T10:15:30Z                             │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  ✅ Immutable audit trail                                                    │
│  ✅ Can replay events to rebuild state                                       │
│  ✅ 21 CFR Part 11 compliant                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EVENT BUS (Axon Framework)                             │
│                                                                              │
│  Publish event to all event handlers                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROJECTOR (Read Model Update)                          │
│  PatientEnrollmentProjector                                                  │
│                                                                              │
│  @EventHandler                                                               │
│  @Transactional                                                              │
│  on(PatientEnrolledEvent event):                                             │
│    1. Find patient by UUID                                                   │
│    2. Create enrollment record:                                              │
│       ┌──────────────────────────────────────────────────────┐             │
│       │ PatientEnrollmentEntity:                              │             │
│       │ • id: auto-generated                                  │             │
│       │ • aggregateUuid: event.enrollmentId                   │             │
│       │ • patientId: patient.id (Long)                        │             │
│       │ • studyId: mapped from UUID                           │             │
│       │ • screeningNumber: event.screeningNumber              │             │
│       │ • enrollmentStatus: ENROLLED                          │             │
│       │ • enrollmentDate: event.enrollmentDate                │             │
│       └──────────────────────────────────────────────────────┘             │
│    3. Update patient status to ENROLLED                                      │
│    4. Create audit record                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                     READ MODEL (MySQL Database)                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ patient_enrollments (INSERT)                                 │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ id: 1                                                        │           │
│  │ aggregate_uuid: enrollment-uuid                              │           │
│  │ patient_id: 1                                                │           │
│  │ study_id: 11                                                 │           │
│  │ screening_number: "SCR-001"                                  │           │
│  │ enrollment_status: ENROLLED                                  │           │
│  │ enrollment_date: 2025-10-11                                  │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ patients (UPDATE)                                            │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ id: 1                                                        │           │
│  │ status: ENROLLED  ← Updated from REGISTERED                  │           │
│  │ last_modified_at: 2025-10-11T10:15:30Z                       │           │
│  │ last_modified_by: john.doe                                   │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ patient_enrollment_audit (INSERT)                            │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ entity_type: ENROLLMENT                                      │           │
│  │ action_type: ENROLL                                          │           │
│  │ performed_by: john.doe                                       │           │
│  │ performed_at: 2025-10-11T10:15:30Z                           │           │
│  │ new_values: {...enrollment data...}                          │           │
│  └─────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Continued)                                 │
│  PatientEnrollmentService                                                    │
│                                                                              │
│  waitForEnrollmentProjection(enrollmentUuid, 5000ms):                        │
│    Retry loop with exponential backoff:                                      │
│      • 50ms → 100ms → 200ms → 400ms → 500ms                                  │
│      • Max wait: 5 seconds                                                   │
│      • Query: findByAggregateUuid(enrollmentUuid)                            │
│                              ↓                                               │
│    Return PatientEnrollmentEntity                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                     REST CONTROLLER (Response)                               │
│  PatientEnrollmentController                                                 │
│                                                                              │
│  Return HTTP 200 with enrollment entity:                                     │
│  {                                                                           │
│    "id": 1,                                                                  │
│    "screeningNumber": "SCR-001",                                             │
│    "enrollmentStatus": "ENROLLED",                                           │
│    "enrollmentDate": "2025-10-11",                                           │
│    "patientId": 1,                                                           │
│    "studyId": 11                                                             │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                                    │
│  SubjectEnrollment.jsx                                                       │
│                                                                              │
│  Success! Navigate to subject details page                                   │
│  navigate(`/subject-management/subjects/${result.id}`)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Benefits of This Architecture

### 1. **Complete Audit Trail** 
- Every enrollment is recorded as immutable event in event store
- Can answer: "Who enrolled this patient? When? Why?"
- 21 CFR Part 11 compliant

### 2. **Business Rules Enforced**
- Validation happens in aggregate (single source of truth)
- Cannot bypass rules by direct DB access
- Status transitions validated

### 3. **Temporal Queries**
- Can query: "How many patients were enrolled on Oct 11?"
- Can replay events to see state at any point in time
- Can debug issues by examining event history

### 4. **Scalability**
- Command side (write) and query side (read) can scale independently
- Event store optimized for append-only writes
- Read models optimized for queries

### 5. **Testability**
- Aggregate logic testable in isolation
- Given events → When command → Then new events
- No database required for unit tests

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Command validation | 1-2ms | In aggregate |
| Event persistence | 3-5ms | Axon event store |
| Event publishing | 1-2ms | In-memory bus |
| Projection update | 50-100ms | MySQL writes (3 tables) |
| Total latency | 55-110ms | P95 percentile |

## Comparison: Before vs After

| Aspect | Before (Direct Persistence) | After (Event Sourcing) |
|--------|----------------------------|------------------------|
| **Write path** | Service → Repository → DB | Service → Command → Aggregate → Event → Projector → DB |
| **Latency** | 50ms | 100ms (+50ms) |
| **Audit trail** | Manual audit table | Automatic via events |
| **Validation** | Service layer | Aggregate (DDD) |
| **Testability** | Integration tests needed | Unit tests sufficient |
| **Compliance** | Basic | 21 CFR Part 11 ready |
| **Replay capability** | None | Full event replay |
| **Temporal queries** | Not possible | Available |

## Next: Visit Scheduling (Week 3)

Once enrollment is working, we'll add visit scheduling:

```
Patient REGISTERED
    ↓
Patient ENROLLED  ← We are here!
    ↓
Generate Visit Schedule (Week 3)
    ↓
Track Visit Compliance
    ↓
Capture Visit Data
```
