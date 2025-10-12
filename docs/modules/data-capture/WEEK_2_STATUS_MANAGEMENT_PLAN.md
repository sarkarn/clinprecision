# Subject Status Management - Week 2 Implementation Plan

**Module**: Subject Management (Patient Enrollment)  
**Phase**: Week 2 - Status Lifecycle Management  
**Status**: 📋 Planning Complete  
**Started**: October 12, 2025  
**Target Completion**: October 19, 2025  
**Duration**: 5 business days

---

## 🎯 Objective

Implement a complete patient status lifecycle management system that:
- Enforces valid status transitions
- Maintains complete audit trail
- Tracks status history
- Provides real-time status visibility
- Ensures regulatory compliance (21 CFR Part 11)

---

## 📊 Status Lifecycle Flow

```
┌─────────────┐
│ REGISTERED  │ ← Initial state when patient is registered
└──────┬──────┘
       │
       ↓ (Start screening process)
┌─────────────┐
│  SCREENING  │ ← Patient is being screened for eligibility
└──────┬──────┘
       │
       ↓ (Pass screening and enroll)
┌─────────────┐
│  ENROLLED   │ ← Patient enrolled in study
└──────┬──────┘
       │
       ↓ (First treatment/visit)
┌─────────────┐
│   ACTIVE    │ ← Patient actively participating
└──────┬──────┘
       │
       ├──→ (Complete study) ┌─────────────┐
       │                     │  COMPLETED  │
       │                     └─────────────┘
       │
       └──→ (Withdraw)       ┌─────────────┐
                             │  WITHDRAWN  │ ← Can transition from ANY status
                             └─────────────┘
```

---

## ✅ What We Already Have (Week 1 Foundation)

### Backend Components ✅
1. **PatientStatus Enum** (`PatientStatus.java`)
   - REGISTERED, SCREENING, ENROLLED, WITHDRAWN, COMPLETED
   - But limited to just enum values in entity layer

2. **PatientAggregate** (`PatientAggregate.java`)
   - Uses internal PatientStatus enum (different from entity!)
   - Has status field and validation logic
   - CommandHandler for ChangePatientStatusCommand
   - EventSourcingHandler for PatientStatusChangedEvent
   - Validation: `validateStatusChange()` method

3. **Domain Objects**
   - `ChangePatientStatusCommand` - Command to trigger status change
   - `PatientStatusChangedEvent` - Event emitted on status change

4. **PatientEnrollmentProjector** (`PatientEnrollmentProjector.java`)
   - Handles PatientEnrolledEvent (sets status to ENROLLED)
   - BUT: Missing handler for PatientStatusChangedEvent!

### Current Gaps 🔴
1. ❌ No service layer for status changes
2. ❌ No REST API endpoints for status management
3. ❌ No status history table/tracking
4. ❌ PatientEnrollmentProjector missing PatientStatusChangedEvent handler
5. ❌ No frontend components for status management
6. ❌ Two different PatientStatus enums (aggregate vs entity) - potential confusion

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ StatusBadge.jsx  │  │ StatusChange.jsx │  │ StatusHistory│  │
│  │  (Display)       │  │  (Change UI)     │  │   .jsx       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API
┌───────────────────────────┼─────────────────────────────────────┐
│                    Controller Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PatientStatusController.java                             │   │
│  │  - POST /patients/{id}/status (Change status)           │   │
│  │  - GET  /patients/{id}/status/history (Get history)     │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                     Service Layer                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PatientStatusService.java                                │   │
│  │  - changePatientStatus()                                 │   │
│  │  - validateStatusTransition()                            │   │
│  │  - getStatusHistory()                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ CommandGateway
┌───────────────────────────┼─────────────────────────────────────┐
│                      Command/Event Bus (Axon)                    │
│  ┌────────────────────┐         ┌─────────────────────────┐     │
│  │ ChangePatientStatus│  ──────>│ PatientStatusChanged    │     │
│  │ Command            │         │ Event                   │     │
│  └────────────────────┘         └─────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      Aggregate Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PatientAggregate.java                                    │   │
│  │  - @CommandHandler handle(ChangePatientStatusCommand)   │   │
│  │  - @EventSourcingHandler on(PatientStatusChangedEvent)  │   │
│  │  - Business Rules & Validation                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Events
┌───────────────────────────┼─────────────────────────────────────┐
│                      Projection Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PatientEnrollmentProjector.java                          │   │
│  │  - @EventHandler on(PatientStatusChangedEvent)          │   │
│  │  - Update patient.status in read model                  │   │
│  │  - Create status history record                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                      Database Layer                              │
│  ┌──────────────────┐  ┌────────────────────────────────────┐   │
│  │ patients         │  │ patient_status_history             │   │
│  │ - status (enum)  │  │ - id (PK)                          │   │
│  │ - updated_at     │  │ - patient_id (FK)                  │   │
│  └──────────────────┘  │ - aggregate_uuid                   │   │
│                        │ - event_id (UUID)                  │   │
│                        │ - previous_status                  │   │
│                        │ - new_status                       │   │
│                        │ - reason                           │   │
│                        │ - changed_by                       │   │
│                        │ - changed_at                       │   │
│                        │ - notes                            │   │
│                        │ - enrollment_id (nullable)         │   │
│                        │ - created_at                       │   │
│                        └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Database Schema

### New Table: `patient_status_history`

```sql
CREATE TABLE patient_status_history (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Patient References
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    aggregate_uuid UUID NOT NULL,  -- PatientAggregate UUID
    
    -- Event Tracking
    event_id UUID NOT NULL UNIQUE,  -- Reference to event store
    
    -- Status Transition
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    
    -- Change Context
    reason TEXT NOT NULL,
    changed_by VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    notes TEXT,
    
    -- Optional: Study/Enrollment Context
    enrollment_id BIGINT REFERENCES patient_enrollments(id) ON DELETE SET NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT patient_status_history_patient_idx 
        FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Indexes for performance
CREATE INDEX idx_patient_status_history_patient_id 
    ON patient_status_history(patient_id);
    
CREATE INDEX idx_patient_status_history_changed_at 
    ON patient_status_history(changed_at DESC);
    
CREATE INDEX idx_patient_status_history_new_status 
    ON patient_status_history(new_status);

-- Comments
COMMENT ON TABLE patient_status_history IS 
    'Complete audit trail of patient status changes for regulatory compliance';
    
COMMENT ON COLUMN patient_status_history.event_id IS 
    'UUID of PatientStatusChangedEvent from event store';
    
COMMENT ON COLUMN patient_status_history.aggregate_uuid IS 
    'UUID of PatientAggregate (for event sourcing reconstruction)';
```

---

## 📝 Implementation Tasks

### Task 1: Database Schema (30 minutes)
**Priority**: P0 - Foundation  
**Files**: Database migration

#### Subtasks:
- [ ] Create migration file: `V1.15__create_patient_status_history.sql`
- [ ] Add table creation SQL
- [ ] Add indexes
- [ ] Add foreign key constraints
- [ ] Add comments
- [ ] Test migration on local database

**Deliverable**: Status history table created

---

### Task 2: Entity Layer (45 minutes)
**Priority**: P0 - Foundation  
**Files**: 
- `PatientStatusHistoryEntity.java` (NEW)
- `PatientStatusHistoryRepository.java` (NEW)

#### Subtasks:
- [ ] Create `PatientStatusHistoryEntity` with all fields
- [ ] Add JPA annotations (@Entity, @Table, @Column)
- [ ] Add Lombok annotations (@Data, @Builder, etc.)
- [ ] Add proper indexes and constraints
- [ ] Create repository interface with custom queries:
  - `findByPatientIdOrderByChangedAtDesc()`
  - `findByPatientIdAndNewStatus()`
  - `findTopByPatientIdOrderByChangedAtDesc()` (latest status)
- [ ] Add validation annotations

**Deliverable**: Entity and repository ready for use

---

### Task 3: Update Projector (1 hour)
**Priority**: P0 - Critical  
**Files**: `PatientEnrollmentProjector.java`

#### Current State:
```java
@EventHandler
public void on(PatientEnrolledEvent event) {
    // Updates patient status to ENROLLED
}
```

#### What's Missing:
- No handler for `PatientStatusChangedEvent`!

#### Subtasks:
- [ ] Add `PatientStatusHistoryRepository` dependency injection
- [ ] Create `@EventHandler` for `PatientStatusChangedEvent`
- [ ] Update patient status in `patients` table
- [ ] Create status history record
- [ ] Handle idempotency (check if event already processed)
- [ ] Add comprehensive logging
- [ ] Add error handling

**Deliverable**: Projector handles all status change events

---

### Task 4: Service Layer (1.5 hours)
**Priority**: P0 - Business Logic  
**Files**: 
- `PatientStatusService.java` (NEW)
- `ChangePatientStatusRequest.java` (NEW DTO)
- `PatientStatusHistoryDto.java` (NEW DTO)

#### Service Methods:
```java
public interface PatientStatusService {
    /**
     * Change patient status with validation
     */
    void changePatientStatus(UUID patientId, ChangePatientStatusRequest request);
    
    /**
     * Get complete status history for patient
     */
    List<PatientStatusHistoryDto> getStatusHistory(Long patientId);
    
    /**
     * Get latest status for patient
     */
    PatientStatusHistoryDto getCurrentStatus(Long patientId);
    
    /**
     * Validate if status transition is allowed
     */
    boolean isValidTransition(String currentStatus, String newStatus);
    
    /**
     * Get all valid next statuses from current status
     */
    List<String> getValidNextStatuses(String currentStatus);
}
```

#### Subtasks:
- [ ] Create service interface
- [ ] Implement service with CommandGateway injection
- [ ] Create DTOs (request/response)
- [ ] Add validation logic
- [ ] Add business rules enforcement
- [ ] Add logging and error handling
- [ ] Add unit tests

**Deliverable**: Service layer with complete business logic

---

### Task 5: REST API Controller (1 hour)
**Priority**: P1 - API Layer  
**Files**: `PatientStatusController.java` (NEW)

#### API Endpoints:
```
POST   /clinops-ws/api/v1/patients/{patientId}/status
       - Change patient status
       - Request: { newStatus, reason, changedBy, notes?, enrollmentId? }
       - Response: { success, message, statusHistory }

GET    /clinops-ws/api/v1/patients/{patientId}/status/history
       - Get complete status history
       - Response: [ { id, previousStatus, newStatus, reason, changedBy, changedAt, ... } ]

GET    /clinops-ws/api/v1/patients/{patientId}/status/current
       - Get current status with metadata
       - Response: { status, lastChanged, changedBy, ... }

GET    /clinops-ws/api/v1/patients/{patientId}/status/valid-transitions
       - Get list of valid next statuses
       - Response: { currentStatus, validNextStatuses: [...] }
```

#### Subtasks:
- [ ] Create controller class
- [ ] Implement all endpoints
- [ ] Add request/response validation
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add security annotations (@PreAuthorize)
- [ ] Add error handling (@ExceptionHandler)
- [ ] Test with Postman/curl

**Deliverable**: RESTful API for status management

---

### Task 6: Frontend - StatusBadge Component (1 hour)
**Priority**: P1 - UI Foundation  
**Files**: `frontend/clinprecision/src/components/common/StatusBadge.jsx` (NEW)

#### Features:
- Color-coded status badges
- Status icons
- Tooltips with status description
- Click to view history (optional)

#### Status Colors:
- REGISTERED: Gray (bg-gray-100 text-gray-800)
- SCREENING: Blue (bg-blue-100 text-blue-800)
- ENROLLED: Green (bg-green-100 text-green-800)
- ACTIVE: Emerald (bg-emerald-100 text-emerald-800)
- COMPLETED: Indigo (bg-indigo-100 text-indigo-800)
- WITHDRAWN: Red (bg-red-100 text-red-800)

#### Subtasks:
- [ ] Create StatusBadge component
- [ ] Add status-to-color mapping
- [ ] Add icons for each status
- [ ] Add tooltips
- [ ] Make it reusable
- [ ] Add prop validation
- [ ] Test with all status values

**Deliverable**: Reusable status badge component

---

### Task 7: Frontend - Status Change Modal (2 hours)
**Priority**: P1 - User Interaction  
**Files**: `frontend/clinprecision/src/components/subjects/StatusChangeModal.jsx` (NEW)

#### Features:
- Modal dialog for status change
- Dropdown showing only valid next statuses
- Required reason text field
- Optional notes field
- Confirmation dialog
- Success/error messaging

#### Workflow:
1. User clicks "Change Status" button
2. Modal opens with current status displayed
3. Dropdown shows only valid transitions (fetched from API)
4. User selects new status
5. User enters reason (required, min 10 characters)
6. User optionally adds notes
7. User confirms
8. API call to change status
9. Success: Modal closes, status badge updates, toast notification
10. Error: Error message displayed in modal

#### Subtasks:
- [ ] Create modal component
- [ ] Integrate with API
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add confirmation dialog
- [ ] Test all transitions
- [ ] Add accessibility features

**Deliverable**: Full status change UI workflow

---

### Task 8: Frontend - Status History View (1.5 hours)
**Priority**: P2 - Audit Trail  
**Files**: `frontend/clinprecision/src/components/subjects/StatusHistoryView.jsx` (NEW)

#### Features:
- Timeline view of status changes
- Shows: status, reason, changed by, date/time
- Filterable by status
- Sortable by date
- Expandable for notes
- Export to CSV

#### Layout:
```
┌────────────────────────────────────────────────────┐
│ Status History - Patient SCR-001                   │
├────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐  │
│ │ ○ ENROLLED → ACTIVE                           │  │
│ │   Reason: First treatment visit completed     │  │
│ │   Changed by: dr.smith@example.com            │  │
│ │   Date: Oct 12, 2025 10:30 AM                 │  │
│ │   [Show Notes]                                │  │
│ └───────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────┐  │
│ │ ○ SCREENING → ENROLLED                        │  │
│ │   Reason: Passed all eligibility criteria     │  │
│ │   Changed by: coordinator@example.com         │  │
│ │   Date: Oct 10, 2025 2:15 PM                  │  │
│ └───────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────┐  │
│ │ ○ REGISTERED → SCREENING                      │  │
│ │   Reason: Screening visit scheduled           │  │
│ │   Changed by: coordinator@example.com         │  │
│ │   Date: Oct 8, 2025 9:00 AM                   │  │
│ └───────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

#### Subtasks:
- [ ] Create timeline component
- [ ] Fetch history from API
- [ ] Format dates/times
- [ ] Add expand/collapse for notes
- [ ] Add filtering
- [ ] Add sorting
- [ ] Add export functionality
- [ ] Test with various history lengths

**Deliverable**: Complete status history viewer

---

### Task 9: Integration with Subject Dashboard (1 hour)
**Priority**: P2 - Integration  
**Files**: 
- `SubjectManagementDashboard.jsx`
- `SubjectList.jsx`
- `SubjectDetail.jsx`

#### Integration Points:
1. **SubjectList**: Add StatusBadge to each row
2. **SubjectDetail**: 
   - Show StatusBadge prominently
   - Add "Change Status" button
   - Add "View Status History" button
3. **Dashboard Statistics**: 
   - Count by status
   - Recent status changes widget

#### Subtasks:
- [ ] Add StatusBadge to subject list
- [ ] Add status change button to detail view
- [ ] Wire up StatusChangeModal
- [ ] Wire up StatusHistoryView
- [ ] Update dashboard statistics
- [ ] Test end-to-end workflow

**Deliverable**: Fully integrated status management

---

### Task 10: Testing & Documentation (2 hours)
**Priority**: P2 - Quality Assurance  
**Files**: Test classes, documentation

#### Testing:
- [ ] **Unit Tests** (Service layer)
  - Status transition validation
  - Business rules enforcement
  - Edge cases
- [ ] **Integration Tests** (API)
  - POST /status endpoint
  - GET /status/history endpoint
  - Error scenarios
- [ ] **E2E Tests** (Frontend)
  - Change status workflow
  - View history
  - Error handling

#### Documentation:
- [ ] Update API documentation (Swagger)
- [ ] Create user guide for CRCs
- [ ] Add code comments
- [ ] Update MODULE_PROGRESS_TRACKER.md
- [ ] Create WEEK_2_COMPLETE_SUMMARY.md

**Deliverable**: Tested and documented feature

---

## 📋 Testing Scenarios

### Scenario 1: Happy Path - Complete Lifecycle
```
Test: Patient progresses through full lifecycle
Steps:
  1. Register patient → Status: REGISTERED
  2. Change to SCREENING → Status: SCREENING
  3. Change to ENROLLED → Status: ENROLLED
  4. Change to ACTIVE → Status: ACTIVE
  5. Change to COMPLETED → Status: COMPLETED
Expected: All transitions succeed, history shows 5 entries
```

### Scenario 2: Early Withdrawal
```
Test: Patient withdraws during screening
Steps:
  1. Register patient → Status: REGISTERED
  2. Change to SCREENING → Status: SCREENING
  3. Change to WITHDRAWN → Status: WITHDRAWN
Expected: Transition succeeds (can withdraw from any status)
```

### Scenario 3: Invalid Transition
```
Test: Try to skip status
Steps:
  1. Register patient → Status: REGISTERED
  2. Try to change to ACTIVE (skipping SCREENING, ENROLLED)
Expected: 400 Bad Request - Invalid transition
```

### Scenario 4: Status History Query
```
Test: View complete history
Steps:
  1. Create patient with multiple status changes
  2. GET /patients/{id}/status/history
Expected: Returns all history entries in reverse chronological order
```

### Scenario 5: Valid Next Statuses
```
Test: Get allowed transitions
Steps:
  1. Patient in SCREENING status
  2. GET /patients/{id}/status/valid-transitions
Expected: Returns ["ENROLLED", "WITHDRAWN"]
```

---

## 🎯 Acceptance Criteria

### Backend ✅
- [ ] Patient status can be changed via REST API
- [ ] All status transitions are validated
- [ ] Invalid transitions return 400 error
- [ ] Status history is recorded for every change
- [ ] Event sourcing maintains complete audit trail
- [ ] Projector updates read model on status change
- [ ] Service layer enforces business rules
- [ ] All endpoints have proper error handling

### Frontend ✅
- [ ] Status badges display correctly on subject list
- [ ] CRC can click "Change Status" button
- [ ] Modal shows only valid next statuses
- [ ] Status change requires reason (min 10 chars)
- [ ] Success notification appears after change
- [ ] Status history view shows all changes
- [ ] Timeline view is easy to read
- [ ] All components are accessible (WCAG 2.1)

### Data Quality ✅
- [ ] No orphaned status history records
- [ ] Event IDs match event store
- [ ] Timestamps are accurate
- [ ] Changed_by tracks actual user
- [ ] Reason is always captured
- [ ] Read model stays in sync with event store

### Documentation ✅
- [ ] API endpoints documented in Swagger
- [ ] Code has inline comments
- [ ] User guide created for CRCs
- [ ] Architecture diagram updated
- [ ] Test scenarios documented

---

## 🚀 Deployment Plan

### Phase 1: Backend (Day 1-2)
1. Create database migration
2. Run migration on dev database
3. Create entities and repositories
4. Update projector
5. Create service layer
6. Create controller
7. Test with Postman

### Phase 2: Frontend (Day 3-4)
1. Create StatusBadge component
2. Create StatusChangeModal
3. Create StatusHistoryView
4. Integrate with subject dashboard
5. Test in browser

### Phase 3: Integration Testing (Day 5)
1. End-to-end testing
2. Fix bugs
3. Performance testing
4. Documentation
5. Code review

---

## 📊 Success Metrics

### Functional Metrics
- ✅ 100% of status transitions validated
- ✅ 0% invalid transitions allowed
- ✅ 100% status changes recorded in history
- ✅ < 200ms API response time for status change
- ✅ < 100ms API response time for status history

### Quality Metrics
- ✅ 80%+ unit test coverage (service layer)
- ✅ 100% API endpoint coverage (integration tests)
- ✅ 0 console errors in frontend
- ✅ WCAG 2.1 AA compliance

### User Experience Metrics
- ✅ CRC can change status in < 30 seconds
- ✅ Status history loads in < 1 second
- ✅ Clear error messages for invalid transitions
- ✅ No page refresh required after status change

---

## 🔗 Dependencies

### Technical Dependencies
- ✅ Axon Framework (event sourcing)
- ✅ Spring Boot (backend)
- ✅ React (frontend)
- ✅ Tailwind CSS (styling)
- ✅ PostgreSQL (database)

### Module Dependencies
- ✅ Week 1: Patient Enrollment (COMPLETE)
- ✅ User Management (for changed_by user)
- ✅ Study Management (for enrollment context)

---

## 🚨 Risk & Mitigation

### Risk 1: Two PatientStatus Enums
**Risk**: Confusion between aggregate enum and entity enum  
**Mitigation**: 
- Document clearly which is used where
- Consider consolidating in future refactoring
- Add comments in code

### Risk 2: Event Replay Issues
**Risk**: Projector may not handle event replay correctly  
**Mitigation**: 
- Add idempotency checks (event_id uniqueness)
- Test replay scenarios
- Add logging for debugging

### Risk 3: Performance with Large History
**Risk**: Patients with many status changes may have slow queries  
**Mitigation**: 
- Add pagination to history API
- Add indexes on patient_id and changed_at
- Consider caching latest status

### Risk 4: Frontend State Management
**Risk**: Status changes may not reflect immediately in UI  
**Mitigation**: 
- Refresh subject list after status change
- Use optimistic updates
- Add WebSocket for real-time updates (future)

---

## 📚 Reference Documentation

### Existing Code to Review
1. `PatientAggregate.java` - Status validation logic
2. `ChangePatientStatusCommand.java` - Command structure
3. `PatientStatusChangedEvent.java` - Event structure
4. `PatientEnrollmentProjector.java` - Projection pattern
5. `PatientStatus.java` (entity) - Entity enum

### Similar Implementations
1. Patient Enrollment (Week 1) - Follow same pattern
2. Study activation workflow - Similar status flow
3. Site activation workflow - Similar validation

### Standards & Compliance
1. FDA 21 CFR Part 11 - Audit trail requirements
2. ICH GCP E6(R2) - Subject management standards
3. HIPAA - Data privacy for status changes

---

## ✅ Definition of Done

A task is considered DONE when:
- [ ] Code is written and follows project conventions
- [ ] Unit tests are written and passing
- [ ] Integration tests are written and passing
- [ ] Code is reviewed by peer
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Tested on dev environment
- [ ] User guide updated (if applicable)
- [ ] Merged to patient_status_lifecycle branch

---

## 👥 Team & Roles

### Backend Developer
- Database schema
- Entity and repository layer
- Service layer implementation
- Controller implementation
- Unit and integration tests

### Frontend Developer
- StatusBadge component
- StatusChangeModal component
- StatusHistoryView component
- Integration with dashboard
- E2E tests

### QA Engineer
- Test scenario development
- Manual testing
- Regression testing
- Performance testing

### Tech Lead
- Code review
- Architecture decisions
- Risk management

---

## 📅 Daily Plan

### Day 1 (Oct 12) - Backend Foundation
- [ ] Task 1: Database schema (30 min)
- [ ] Task 2: Entity layer (45 min)
- [ ] Task 3: Update projector (1 hour)
- [ ] Task 4: Service layer (1.5 hours)
**Goal**: Backend core complete

### Day 2 (Oct 13) - API Layer
- [ ] Task 5: REST API controller (1 hour)
- [ ] Manual testing with Postman (1 hour)
- [ ] Fix any bugs (1 hour)
**Goal**: API endpoints working

### Day 3 (Oct 14) - Frontend Components
- [ ] Task 6: StatusBadge component (1 hour)
- [ ] Task 7: StatusChangeModal (2 hours)
**Goal**: Core UI components complete

### Day 4 (Oct 15) - Frontend Integration
- [ ] Task 8: StatusHistoryView (1.5 hours)
- [ ] Task 9: Dashboard integration (1 hour)
- [ ] UI testing and fixes (1 hour)
**Goal**: Fully integrated UI

### Day 5 (Oct 16) - Testing & Documentation
- [ ] Task 10: Testing (2 hours)
- [ ] Bug fixes (1 hour)
- [ ] Documentation (1 hour)
**Goal**: Week 2 complete! 🎉

---

## 🎉 Expected Outcome

By end of Week 2, we will have:

✅ **Complete Status Lifecycle Management**
- Patients can transition through all statuses
- All transitions are validated and enforced
- Complete audit trail via event sourcing

✅ **User-Friendly Interface**
- CRCs can easily change patient status
- Status is prominently displayed with color-coded badges
- Complete history is accessible with one click

✅ **Regulatory Compliance**
- Every status change is recorded with reason
- Changed_by user is tracked
- Timestamps are accurate
- Audit trail is immutable (event sourcing)

✅ **Foundation for Week 3**
- Status management enables visit scheduling
- Status-based business rules can be applied
- Ready to implement screening workflow

---

**Status**: 📋 Plan Complete - Ready to Start Implementation  
**Next Step**: Task 1 - Create Database Migration  
**Created**: October 12, 2025  
**Target**: October 19, 2025  
**Estimated Effort**: 13 hours (distributed over 5 days)

---

## 🚦 Ready to Start?

This plan provides:
- ✅ Clear architecture
- ✅ Detailed task breakdown
- ✅ Implementation sequence
- ✅ Testing scenarios
- ✅ Success criteria
- ✅ Risk mitigation
- ✅ Daily schedule

**Let's build this! 🚀**
