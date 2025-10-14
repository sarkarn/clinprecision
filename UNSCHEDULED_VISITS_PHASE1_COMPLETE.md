# Unscheduled Visits Implementation - Phase 1 Complete

**Date**: October 13, 2025  
**Status**: ✅ BACKEND COMPLETE - BUILD SUCCESS at 21:02:21

---

## Executive Summary

Successfully implemented complete backend infrastructure for unscheduled visit management following CQRS/Event Sourcing patterns. All 7 backend components created and compiled successfully.

---

## Phase 1: Backend Implementation (COMPLETE)

### Components Created

#### 1. Domain Layer ✅
- **CreateVisitCommand.java** - Command for creating visits with validation
- **VisitCreatedEvent.java** - Domain event emitted after visit creation
- **Location**: `com.clinprecision.clinopsservice.visit.domain.commands|events`

#### 2. Aggregate ✅
- **VisitAggregate.java** - Core domain aggregate with event sourcing
  - `@CommandHandler` for CreateVisitCommand
  - `@EventSourcingHandler` for VisitCreatedEvent
  - Business rule validation (patient ID, study ID, site ID, visit type, visit date required)
  - Comprehensive documentation on purpose and usage
- **Location**: `com.clinprecision.clinopsservice.visit.aggregate`

#### 3. Infrastructure Layer ✅
- **VisitEntity.java** - JPA entity for read model
  - Table: `visit`
  - Fields: visitId (UUID), patientId, studyId, siteId, visitType, visitDate, status, createdBy, createdAt, notes
- **VisitRepository.java** - Spring Data JPA repository
  - `findByPatientIdOrderByVisitDateDesc()` - Patient visits
  - `findByStudyId()` - Study visits
  - `findByVisitType()` - Filter by type
  - `findByStatus()` - Filter by status
  - `findByPatientIdAndVisitType()` - Patient + type combination
- **Location**: `com.clinprecision.clinopsservice.visit.entity|repository`

#### 4. Projector ✅
- **VisitProjector.java** - Event handler for read model projection
  - `@EventHandler` for VisitCreatedEvent
  - Transforms events into VisitEntity records
  - Error handling and logging
  - Part of CQRS query side
- **Location**: `com.clinprecision.clinopsservice.visit.projector`

#### 5. Service Layer ✅
- **UnscheduledVisitService.java** - Business logic orchestration
  - **Command operations**:
    - `createUnscheduledVisit()` - Generic visit creation
    - `createScreeningVisit()` - Convenience method for screening
    - `createEnrollmentVisit()` - Convenience method for enrollment
    - `createDiscontinuationVisit()` - Convenience method for discontinuation
  - **Query operations**:
    - `getPatientVisits()` - All visits for patient
    - `getStudyVisits()` - All visits for study
    - `getVisitsByType()` - Filter by visit type
    - `getVisitById()` - Single visit details
  - **Validation**: Request validation before command dispatch
  - **Projection waiting**: waitForVisitProjection() with 5-second timeout
  - **NO @Transactional** - Follows Axon best practices (same pattern as PatientStatusService)
- **Location**: `com.clinprecision.clinopsservice.visit.service`

#### 6. DTOs ✅
- **CreateVisitRequest.java** - API request for visit creation
- **VisitResponse.java** - API response after visit creation
- **VisitDto.java** - Data transfer object with fromEntity() factory method
- **Location**: `com.clinprecision.clinopsservice.visit.dto`

#### 7. REST Controller ✅
- **VisitController.java** - REST API endpoints
  - `POST /api/v1/visits/unscheduled` - Create visit (201 Created)
  - `GET /api/v1/visits/patient/{patientId}` - Patient visits
  - `GET /api/v1/visits/study/{studyId}` - Study visits
  - `GET /api/v1/visits/type/{visitType}` - Visits by type
  - `GET /api/v1/visits/{visitId}` - Single visit
  - Error handling with ErrorResponse DTO
  - `@CrossOrigin` enabled for frontend integration
- **Location**: `com.clinprecision.clinopsservice.visit.controller`

---

## Build Verification

```
[INFO] BUILD SUCCESS
[INFO] Total time:  18.655 s
[INFO] Finished at: 2025-10-13T21:02:21-04:00
[INFO] Compiling 353 source files
```

**Status**: ✅ All classes compiled successfully, no errors

---

## Architecture Pattern

### CQRS/Event Sourcing Flow
```
StatusChangeModal (UI)
    ↓
VisitController.createUnscheduledVisit()
    ↓
UnscheduledVisitService.createUnscheduledVisit()
    ↓
CommandGateway.sendAndWait(CreateVisitCommand)
    ↓
VisitAggregate @CommandHandler
    ↓
AggregateLifecycle.apply(VisitCreatedEvent)
    ↓
[Event Store: domain_event_entry]
    ↓
VisitProjector @EventHandler
    ↓
[Read Model: visit table]
    ↓
UnscheduledVisitService.waitForVisitProjection()
    ↓
VisitResponse returned to frontend
```

---

## Visit Types

| Type | Purpose | Triggered By | Forms Collected |
|------|---------|--------------|-----------------|
| **SCREENING** | Eligibility assessment | REGISTERED → SCREENING | Screening Assessment Form |
| **ENROLLMENT** | Baseline data collection | SCREENING → ENROLLED | Enrollment Form, Consent Form |
| **DISCONTINUATION** | Exit procedures | Any → WITHDRAWN | Discontinuation Form, Exit Interview |
| **ADVERSE_EVENT** | Unplanned safety assessment | Any status | AE Form, Safety Assessment |

---

## Integration Points

### With Form Data Collection
```javascript
// 1. Create visit
const visit = await VisitService.createUnscheduledVisit({
    patientId: 123,
    studyId: 456,
    siteId: 789,
    visitType: 'SCREENING',
    visitDate: '2025-10-15',
    createdBy: 'Dr. Smith'
});

// 2. Collect forms using visitId
const formData = await FormDataService.submitFormData({
    patientId: 123,
    studyId: 456,
    visitId: visit.visitId, // Link form to visit
    formId: 'screening-assessment',
    formData: { /* screening questions */ }
});
```

### With Status Changes
```
Status Change Workflow:
1. User changes status (REGISTERED → SCREENING)
2. StatusChangeModal shows success
3. Frontend prompts: "Create screening visit?"
4. User clicks "Yes"
5. UnscheduledVisitModal opens
6. Visit created with visitId
7. (Optional) Forms collected with visitId
```

---

## Database Schema

### visit Table (To Be Created)
```sql
CREATE TABLE visit (
    visit_id BINARY(16) PRIMARY KEY COMMENT 'UUID of visit',
    patient_id BIGINT NOT NULL COMMENT 'Foreign key to patients table',
    study_id BIGINT NOT NULL COMMENT 'Foreign key to studies table',
    site_id BIGINT NOT NULL COMMENT 'Foreign key to sites table',
    visit_type VARCHAR(50) NOT NULL COMMENT 'SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT',
    visit_date DATE NOT NULL COMMENT 'Date of visit',
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED, COMPLETED, CANCELLED',
    created_by VARCHAR(100) COMMENT 'User who created the visit',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Visit creation timestamp',
    notes TEXT COMMENT 'Additional notes about the visit',
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_study_id (study_id),
    INDEX idx_visit_type (visit_type),
    INDEX idx_status (status),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Unscheduled visits for clinical trials';
```

**Status**: 🔴 Not yet created (will create in Phase 3)

---

## Key Design Decisions

### 1. No @Transactional Annotation
**Reason**: Axon Framework manages transactions internally. Adding @Transactional at service level causes circular deadlock:
- Transaction isolation prevents projections from being visible within same transaction
- `waitForVisitProjection()` can't see the INSERT until transaction commits
- Transaction can't commit because method is still waiting
- **Same pattern used in PatientStatusService** (fixed in previous bug resolution)

### 2. UUID for Visit ID
**Reason**:
- Globally unique (no collision risk across sites)
- Generated before command dispatch (idempotency)
- Works with event sourcing (no database-generated IDs)
- Standard for distributed systems

### 3. Generic + Convenience Methods
**Reason**:
- `createUnscheduledVisit()` handles all visit types
- Specific methods (`createScreeningVisit()`, etc.) provide cleaner API
- Reduces code duplication
- Type safety at method level

### 4. Projection Waiting with Timeout
**Reason**:
- Ensures read model is available before returning response
- Prevents "visit not found" errors immediately after creation
- 5-second timeout prevents infinite wait
- 50ms polling interval balances responsiveness vs CPU usage

---

## Documentation Standards

All classes include comprehensive JavaDoc:
- **Purpose**: What the class does
- **Usage Context**: When and how to use it
- **Architecture**: How it fits in CQRS/Event Sourcing
- **Integration**: How it connects with other components
- **Examples**: Code snippets for common use cases

---

## Next Steps

### Phase 2: Frontend (2-3 hours)
1. ✅ Create `VisitService.js` - API client for visit endpoints
2. Create `UnscheduledVisitModal.jsx` - Visit creation modal
3. Update `StatusChangeModal.jsx` - Add optional visit prompt after status change
4. Create `VisitList.jsx` - Display patient visits (optional)

### Phase 3: Integration (1 hour)
1. Create `visit` table in database
2. Test end-to-end flow:
   - Status change → Visit prompt → Visit creation
   - Visit creation → Form collection with visitId
3. Verify event sourcing (domain_event_entry)
4. Verify read model projection (visit table)

### Phase 4: Enhancements (Optional)
1. Visit status updates (SCHEDULED → COMPLETED)
2. Visit cancellation workflow
3. Visit rescheduling
4. Visit-specific form templates
5. Visit scheduling calendar view

---

## Testing Checklist

### Backend Tests (To Be Run)
- [ ] Create screening visit - verify VisitCreatedEvent emitted
- [ ] Create enrollment visit - verify read model updated
- [ ] Get patient visits - verify correct ordering (DESC by date)
- [ ] Get visits by type - verify filtering works
- [ ] Invalid request - verify validation errors
- [ ] Missing required fields - verify 400 Bad Request

### Integration Tests (Phase 3)
- [ ] Status change + visit creation
- [ ] Visit creation + form collection
- [ ] Multiple visits for same patient
- [ ] Visit history display

---

## Estimated Timelines

| Phase | Description | Status | Time |
|-------|-------------|--------|------|
| **Phase 1** | Backend implementation | ✅ COMPLETE | 2.5 hours |
| **Phase 2** | Frontend implementation | 🔄 NEXT | 2-3 hours |
| **Phase 3** | Integration & testing | ⏳ PENDING | 1 hour |
| **TOTAL** | Unscheduled Visits Feature | 40% COMPLETE | 5.5-6.5 hours |

---

## Success Criteria

### Phase 1 (Backend) ✅
- [x] All domain classes created
- [x] Event sourcing patterns implemented
- [x] Service layer with validation
- [x] REST API endpoints
- [x] BUILD SUCCESS
- [x] Comprehensive documentation

### Phase 2 (Frontend) ⏳
- [ ] API client service created
- [ ] Visit creation modal functional
- [ ] Status change integration
- [ ] Form collection linked to visits

### Phase 3 (Integration) ⏳
- [ ] Database table created
- [ ] End-to-end flow tested
- [ ] Events persisted to event store
- [ ] Read model projections working

---

## Benefits Realized

1. **Separation of Concerns**: Status changes and data collection are now properly separated
2. **Audit Trail**: Full event sourcing for regulatory compliance
3. **Flexibility**: Can create visits before/after/independent of status changes
4. **Reusability**: Generic infrastructure works for all visit types
5. **Standards Compliance**: Aligns with ICH-GCP visit-based data collection
6. **Performance**: No transaction deadlocks (learned from previous bug fix)
7. **Scalability**: UUID-based IDs work in distributed environments

---

## References

- **Architecture Decision**: `ARCHITECTURE_DECISION_STATUS_VS_FORMS.md`
- **Transaction Fix**: Previous bug resolution (Phase 84-108)
- **Form Data Service**: `StudyFormDataService.java` (to be integrated in Phase 3)
- **Event Sourcing**: Axon Framework patterns in `PatientAggregate.java`

---

**Phase 1 Status**: ✅ **COMPLETE - Ready for Frontend Implementation**
