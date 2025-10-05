# Study Module DDD Migration Plan

## Executive Summary

This document outlines the comprehensive plan for migrating the Study module from legacy CRUD architecture to DDD/CQRS/Event Sourcing pattern using Axon Framework.

**Current State**: Study module uses traditional CRUD with direct JPA writes  
**Target State**: Full DDD with StudyAggregate, event sourcing, and read model projections  
**Impact**: Unlocks removal of bridge methods in ProtocolVersion module and enables consistent cross-aggregate queries

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Target DDD Architecture](#target-ddd-architecture)
3. [Migration Strategy](#migration-strategy)
4. [Implementation Phases](#implementation-phases)
5. [Data Migration Plan](#data-migration-plan)
6. [Risk Assessment](#risk-assessment)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)

---

## 1. Current Architecture Analysis

### 1.1 Current Components

**Entity Layer**:
- `StudyEntity.java` - JPA entity with 60+ fields
- Maps to `studies` table with Long ID primary key
- Has relationships: `studyStatus`, `regulatoryStatus`, `studyPhase`, `organizationStudies`, `formDefinitions`

**Service Layer**:
- `StudyService.java` (783 lines) - Main CRUD service
- `StudyValidationService.java` - Business validation logic
- `StudyStatusComputationService.java` - Status state machine
- `CrossEntityStatusValidationService.java` - Cross-aggregate validation
- `StudyDocumentService.java` - Document management

**Controller Layer**:
- `StudyController.java` - REST API endpoints

**Repository Layer**:
- `StudyRepository.java` - Spring Data JPA repository with Long ID

### 1.2 Key Operations

**Write Operations** (Event Sourcing Candidates):
1. **Create Study** - `createStudy(StudyCreateRequestDto)`
2. **Update Study** - `updateStudy(Long, StudyUpdateRequestDto)`
3. **Change Status** - `changeStudyStatus(Long, String)`
4. **Lifecycle Operations**:
   - `suspendStudy(Long, String reason)`
   - `resumeStudy(Long)`
   - `completeStudy(Long)`
   - `terminateStudy(Long, String reason)`
   - `withdrawStudy(Long, String reason)`

**Read Operations** (Projection Queries):
1. **Get Study** - `getStudyById(Long)`
2. **Get Study Overview** - `getStudyOverview(Long)`
3. **List Studies** - `getAllStudies()`, `getAllStudiesWithFilters(...)`

### 1.3 Business Rules (Aggregate Invariants)

1. **Status Transition Rules**:
   - PLANNING → PROTOCOL_DEVELOPMENT → UNDER_REVIEW → APPROVED → ACTIVE
   - ACTIVE can transition to SUSPENDED, COMPLETED, TERMINATED
   - SUSPENDED can return to ACTIVE
   - COMPLETED, TERMINATED, WITHDRAWN are terminal states

2. **Cross-Entity Dependencies**:
   - Cannot move to PROTOCOL_REVIEW without protocol version
   - Cannot move to APPROVED without at least one approved version
   - Cannot move to ACTIVE without exactly one active version
   - Status changes must pass `CrossEntityStatusValidationService` checks

3. **Study Versioning**:
   - Each study has a version number (e.g., "1.0", "2.0")
   - `isLatestVersion` flag indicates current version
   - `parentVersionId` tracks version lineage

4. **Organization Associations**:
   - Study can have multiple organizations (sponsor, CRO, site)
   - Managed through `OrganizationStudyEntity` join table

### 1.4 Dependencies

**Depends On**:
- `StudyStatusEntity` (lookup table)
- `RegulatoryStatusEntity` (lookup table)
- `StudyPhaseEntity` (lookup table)
- `OrganizationStudyEntity` (association)

**Depended By**:
- `ProtocolVersionAggregate` - references `studyAggregateUuid` (currently bridged via `studyId`)
- `CrossEntityStatusValidationService` - validates study state
- `StudyDocumentService` - documents belong to study
- Frontend pages - StudyListPage, StudyDetailPage, StudyEditPage, StudyDashboardPage

---

## 2. Target DDD Architecture

### 2.1 Aggregate Design

```java
@Aggregate
public class StudyAggregate {
    
    @AggregateIdentifier
    private UUID studyAggregateUuid;
    
    // Aggregate state (rebuilt from events)
    private String name;
    private String protocolNumber;
    private String sponsor;
    private StudyStatusCode status;
    private String version;
    private boolean isLatestVersion;
    private boolean isLocked;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Aggregate root manages all study lifecycle events
    
    @CommandHandler
    public StudyAggregate(CreateStudyCommand command) {
        // Validate: name not null, protocol number unique, etc.
        AggregateLifecycle.apply(
            StudyCreatedEvent.builder()
                .studyAggregateUuid(command.getStudyAggregateUuid())
                .name(command.getName())
                .protocolNumber(command.getProtocolNumber())
                .sponsor(command.getSponsor())
                .initialStatus(StudyStatusCode.PLANNING)
                .build()
        );
    }
    
    @CommandHandler
    public void handle(UpdateStudyCommand command) {
        // Validate: not locked, status allows modifications
        if (isLocked) {
            throw new StudyLockedException(studyAggregateUuid);
        }
        AggregateLifecycle.apply(
            StudyUpdatedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .name(command.getName())
                .description(command.getDescription())
                // ... other fields
                .build()
        );
    }
    
    @CommandHandler
    public void handle(ChangeStudyStatusCommand command) {
        // Validate: status transition valid
        if (!isValidTransition(status, command.getNewStatus())) {
            throw new InvalidStatusTransitionException(status, command.getNewStatus());
        }
        AggregateLifecycle.apply(
            StudyStatusChangedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .oldStatus(status)
                .newStatus(command.getNewStatus())
                .reason(command.getReason())
                .changedBy(command.getUserId())
                .build()
        );
    }
    
    @CommandHandler
    public void handle(SuspendStudyCommand command) {
        if (status != StudyStatusCode.ACTIVE) {
            throw new InvalidOperationException("Can only suspend ACTIVE studies");
        }
        AggregateLifecycle.apply(
            StudySuspendedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .reason(command.getReason())
                .suspendedBy(command.getUserId())
                .build()
        );
    }
    
    @CommandHandler
    public void handle(CompleteStudyCommand command) {
        if (status != StudyStatusCode.ACTIVE) {
            throw new InvalidOperationException("Can only complete ACTIVE studies");
        }
        AggregateLifecycle.apply(
            StudyCompletedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid())
                .completionDate(LocalDate.now())
                .completedBy(command.getUserId())
                .build()
        );
    }
    
    // Event sourcing handlers rebuild aggregate state
    
    @EventSourcingHandler
    public void on(StudyCreatedEvent event) {
        this.studyAggregateUuid = event.getStudyAggregateUuid();
        this.name = event.getName();
        this.protocolNumber = event.getProtocolNumber();
        this.sponsor = event.getSponsor();
        this.status = event.getInitialStatus();
        this.version = "1.0";
        this.isLatestVersion = true;
        this.isLocked = false;
    }
    
    @EventSourcingHandler
    public void on(StudyUpdatedEvent event) {
        this.name = event.getName();
        this.description = event.getDescription();
        // ... update other fields
    }
    
    @EventSourcingHandler
    public void on(StudyStatusChangedEvent event) {
        this.status = event.getNewStatus();
    }
    
    @EventSourcingHandler
    public void on(StudySuspendedEvent event) {
        this.status = StudyStatusCode.SUSPENDED;
    }
    
    @EventSourcingHandler
    public void on(StudyCompletedEvent event) {
        this.status = StudyStatusCode.COMPLETED;
        this.isLocked = true;
    }
}
```

### 2.2 Commands

**Core Commands**:
1. `CreateStudyCommand` - Create new study
2. `UpdateStudyCommand` - Update study details
3. `ChangeStudyStatusCommand` - Generic status change
4. `SuspendStudyCommand` - Suspend active study
5. `ResumeStudyCommand` - Resume suspended study
6. `CompleteStudyCommand` - Mark study as completed
7. `TerminateStudyCommand` - Terminate study with reason
8. `WithdrawStudyCommand` - Withdraw study
9. `LockStudyCommand` - Lock study for editing
10. `UnlockStudyCommand` - Unlock study

**All Commands Include**:
- `UUID studyAggregateUuid` - Aggregate identifier
- `UUID userId` - User performing action (for audit)
- Timestamp - Auto-captured by Axon

### 2.3 Events

**Core Events**:
1. `StudyCreatedEvent` - Study initialized
2. `StudyUpdatedEvent` - Study details changed
3. `StudyStatusChangedEvent` - Status transition occurred
4. `StudySuspendedEvent` - Study suspended
5. `StudyResumedEvent` - Study resumed from suspension
6. `StudyCompletedEvent` - Study completed
7. `StudyTerminatedEvent` - Study terminated
8. `StudyWithdrawnEvent` - Study withdrawn
9. `StudyLockedEvent` - Study locked
10. `StudyUnlockedEvent` - Study unlocked

**All Events Include**:
- `UUID studyAggregateUuid` - Aggregate identifier
- `UUID userId` - User who triggered event
- `Instant timestamp` - When event occurred (auto-captured)

### 2.4 Read Model (Projection)

**Enhanced StudyEntity**:
```java
@Entity
@Table(name = "studies")
public class StudyEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Keep for legacy compatibility (bridge period)
    
    @Column(name = "aggregate_uuid", unique = true, nullable = false)
    private UUID aggregateUuid; // ✅ NEW - Link to event-sourced aggregate
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "protocol_number")
    private String protocolNumber;
    
    // ... all 60+ fields from current entity
    
    // Relationships preserved
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_status_id")
    private StudyStatusEntity studyStatus;
    
    // ... other relationships
}
```

**StudyProjection** (Event Listener):
```java
@Component
public class StudyProjection {
    
    private final StudyReadRepository repository;
    
    @EventHandler
    @Transactional
    public void on(StudyCreatedEvent event) {
        StudyEntity entity = new StudyEntity();
        entity.setAggregateUuid(event.getStudyAggregateUuid());
        entity.setName(event.getName());
        entity.setProtocolNumber(event.getProtocolNumber());
        entity.setSponsor(event.getSponsor());
        // ... set other fields
        repository.save(entity);
    }
    
    @EventHandler
    @Transactional
    public void on(StudyUpdatedEvent event) {
        StudyEntity entity = repository.findByAggregateUuid(event.getStudyAggregateUuid())
            .orElseThrow(() -> new ProjectionNotFoundException());
        entity.setName(event.getName());
        entity.setDescription(event.getDescription());
        // ... update fields
        repository.save(entity);
    }
    
    @EventHandler
    @Transactional
    public void on(StudyStatusChangedEvent event) {
        StudyEntity entity = repository.findByAggregateUuid(event.getStudyAggregateUuid())
            .orElseThrow(() -> new ProjectionNotFoundException());
        // Lookup status entity by code
        StudyStatusEntity status = studyStatusRepository.findByCode(event.getNewStatus())
            .orElseThrow();
        entity.setStudyStatus(status);
        repository.save(entity);
    }
    
    // ... handlers for other events
}
```

**StudyReadRepository**:
```java
public interface StudyReadRepository extends JpaRepository<StudyEntity, Long> {
    
    // ✅ DDD Methods (Preferred)
    Optional<StudyEntity> findByAggregateUuid(UUID aggregateUuid);
    List<StudyEntity> findAllByOrderByCreatedAtDesc();
    
    // ⚠️ Bridge Methods (Temporary - during transition)
    @Deprecated
    Optional<StudyEntity> findById(Long id);
    
    @Deprecated
    List<StudyEntity> findAll();
}
```

### 2.5 Command Service (Orchestrator)

```java
@Service
public class StudyCommandService {
    
    private final CommandGateway commandGateway;
    private final StudyValidationService validationService;
    
    public UUID createStudy(StudyCreateRequestDto request) {
        // 1. Validate request (business rules)
        validationService.validateStudyCreation(request);
        
        // 2. Generate aggregate UUID
        UUID studyAggregateUuid = UUID.randomUUID();
        
        // 3. Send command to aggregate
        CreateStudyCommand command = CreateStudyCommand.builder()
            .studyAggregateUuid(studyAggregateUuid)
            .name(request.getName())
            .protocolNumber(request.getProtocolNumber())
            .sponsor(request.getSponsor())
            .userId(getCurrentUserId())
            .build();
        
        commandGateway.sendAndWait(command);
        
        return studyAggregateUuid;
    }
    
    public void updateStudy(UUID studyAggregateUuid, StudyUpdateRequestDto request) {
        // Validate update
        validationService.validateStudyUpdate(request);
        
        // Send command
        UpdateStudyCommand command = UpdateStudyCommand.builder()
            .studyAggregateUuid(studyAggregateUuid)
            .name(request.getName())
            .description(request.getDescription())
            .userId(getCurrentUserId())
            .build();
        
        commandGateway.sendAndWait(command);
    }
    
    public void changeStudyStatus(UUID studyAggregateUuid, String newStatus) {
        // Validate status transition (may query projection for current state)
        StudyEntity study = studyReadRepository.findByAggregateUuid(studyAggregateUuid)
            .orElseThrow();
        
        CrossEntityValidationResult validation = 
            crossEntityValidationService.validateCrossEntityDependencies(
                studyAggregateUuid, newStatus, "status change"
            );
        
        if (!validation.isValid()) {
            throw new ValidationException(validation.getErrors());
        }
        
        // Send command
        ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
            .studyAggregateUuid(studyAggregateUuid)
            .newStatus(StudyStatusCode.fromString(newStatus))
            .reason("Status changed by user")
            .userId(getCurrentUserId())
            .build();
        
        commandGateway.sendAndWait(command);
    }
}
```

### 2.6 Query Service (Read Model)

```java
@Service
@Transactional(readOnly = true)
public class StudyQueryService {
    
    private final StudyReadRepository studyReadRepository;
    private final StudyMapper studyMapper;
    
    public StudyResponseDto getStudyByUuid(UUID studyAggregateUuid) {
        StudyEntity study = studyReadRepository.findByAggregateUuid(studyAggregateUuid)
            .orElseThrow(() -> new StudyNotFoundException(studyAggregateUuid));
        
        return studyMapper.toResponseDto(study);
    }
    
    // Bridge method during transition
    @Deprecated
    public StudyResponseDto getStudyById(Long id) {
        StudyEntity study = studyReadRepository.findById(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        return studyMapper.toResponseDto(study);
    }
    
    public List<StudyResponseDto> getAllStudies() {
        List<StudyEntity> studies = studyReadRepository.findAllByOrderByCreatedAtDesc();
        return studies.stream()
            .map(studyMapper::toResponseDto)
            .collect(Collectors.toList());
    }
}
```

---

## 3. Migration Strategy

### 3.1 Approach: **Blue-Green with Bridge Pattern**

We'll use a phased approach that maintains backward compatibility while gradually migrating to DDD.

**Key Principles**:
1. **Database First**: Add `aggregate_uuid` column to `studies` table
2. **Dual Write**: Temporarily write to both aggregate (events) and projection (direct)
3. **Bridge Methods**: Repository supports both UUID and Long ID queries
4. **Gradual Migration**: Migrate write operations first, then read operations
5. **No Downtime**: System remains operational throughout migration

### 3.2 Migration Phases

**Phase 1: Infrastructure Setup** (1 week)
- Add `aggregate_uuid` column to `studies` table
- Create StudyAggregate, Commands, Events
- Create StudyProjection
- Enhance StudyEntity with `aggregateUuid` field
- Update StudyReadRepository with bridge methods
- **Deliverable**: DDD infrastructure ready, zero functionality changes

**Phase 2: Write Path Migration** (1 week)
- Create StudyCommandService
- Migrate `createStudy()` to use aggregate
- Migrate `updateStudy()` to use aggregate
- Migrate `changeStudyStatus()` to use aggregate
- Keep legacy service methods for read operations
- **Deliverable**: All writes go through aggregate, reads still use legacy

**Phase 3: Read Path Migration** (1 week)
- Create StudyQueryService
- Refactor controllers to use UUID instead of Long
- Update frontend to use UUID
- Update ProtocolVersion module to remove bridge (studyId)
- **Deliverable**: Full DDD architecture, bridge methods deprecated

**Phase 4: Legacy Cleanup** (3 days)
- Remove StudyService CRUD methods
- Remove bridge methods from repository
- Remove `id` field from API responses (keep in DB for legacy data)
- **Deliverable**: Pure DDD, legacy code removed

**Phase 5: Cross-Entity Validation Refactoring** (3 days)
- Refactor CrossEntityStatusValidationService to use UUIDs
- Update validation to query projections
- **Deliverable**: Validation uses DDD projections

---

## 4. Implementation Phases

### Phase 1: Infrastructure Setup

#### Step 1.1: Database Migration

```sql
-- Add aggregate_uuid column to studies table
ALTER TABLE studies 
ADD COLUMN aggregate_uuid VARCHAR(36) UNIQUE;

-- Add index for performance
CREATE INDEX idx_studies_aggregate_uuid ON studies(aggregate_uuid);

-- Generate UUIDs for existing studies
UPDATE studies 
SET aggregate_uuid = UUID() 
WHERE aggregate_uuid IS NULL;

-- Make aggregate_uuid NOT NULL after population
ALTER TABLE studies 
MODIFY COLUMN aggregate_uuid VARCHAR(36) NOT NULL;

-- Verify
SELECT COUNT(*), 
       COUNT(DISTINCT aggregate_uuid),
       COUNT(DISTINCT id)
FROM studies;
-- Should see same count for all three
```

#### Step 1.2: Create Domain Package Structure

```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/study/
├── aggregate/
│   └── StudyAggregate.java
├── command/
│   ├── CreateStudyCommand.java
│   ├── UpdateStudyCommand.java
│   ├── ChangeStudyStatusCommand.java
│   ├── SuspendStudyCommand.java
│   ├── ResumeStudyCommand.java
│   ├── CompleteStudyCommand.java
│   ├── TerminateStudyCommand.java
│   └── WithdrawStudyCommand.java
├── event/
│   ├── StudyCreatedEvent.java
│   ├── StudyUpdatedEvent.java
│   ├── StudyStatusChangedEvent.java
│   ├── StudySuspendedEvent.java
│   ├── StudyResumedEvent.java
│   ├── StudyCompletedEvent.java
│   ├── StudyTerminatedEvent.java
│   └── StudyWithdrawnEvent.java
├── projection/
│   └── StudyProjection.java
├── entity/
│   └── StudyEntity.java (enhanced)
├── repository/
│   └── StudyReadRepository.java
├── service/
│   ├── StudyCommandService.java
│   └── StudyQueryService.java
└── domain/
    └── valueobjects/
        └── StudyStatusCode.java (enum)
```

#### Step 1.3: Create StudyStatusCode Enum

```java
package com.clinprecision.clinopsservice.study.domain.valueobjects;

public enum StudyStatusCode {
    PLANNING("PLANNING"),
    PROTOCOL_DEVELOPMENT("PROTOCOL_DEVELOPMENT"),
    UNDER_REVIEW("UNDER_REVIEW"),
    APPROVED("APPROVED"),
    ACTIVE("ACTIVE"),
    SUSPENDED("SUSPENDED"),
    COMPLETED("COMPLETED"),
    TERMINATED("TERMINATED"),
    WITHDRAWN("WITHDRAWN");
    
    private final String code;
    
    StudyStatusCode(String code) {
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
    
    public static StudyStatusCode fromString(String code) {
        for (StudyStatusCode status : StudyStatusCode.values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
    
    public boolean canTransitionTo(StudyStatusCode newStatus) {
        // Define valid state transitions
        switch (this) {
            case PLANNING:
                return newStatus == PROTOCOL_DEVELOPMENT || newStatus == WITHDRAWN;
            case PROTOCOL_DEVELOPMENT:
                return newStatus == UNDER_REVIEW || newStatus == WITHDRAWN;
            case UNDER_REVIEW:
                return newStatus == APPROVED || newStatus == PROTOCOL_DEVELOPMENT || newStatus == WITHDRAWN;
            case APPROVED:
                return newStatus == ACTIVE || newStatus == WITHDRAWN;
            case ACTIVE:
                return newStatus == SUSPENDED || newStatus == COMPLETED || newStatus == TERMINATED;
            case SUSPENDED:
                return newStatus == ACTIVE || newStatus == TERMINATED;
            case COMPLETED:
            case TERMINATED:
            case WITHDRAWN:
                return false; // Terminal states
            default:
                return false;
        }
    }
}
```

#### Step 1.4: Enhance StudyEntity

```java
@Entity
@Table(name = "studies")
public class StudyEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Keep for legacy compatibility
    
    @Column(name = "aggregate_uuid", unique = true, nullable = false)
    private UUID aggregateUuid; // ✅ NEW - Link to event-sourced aggregate
    
    // ... rest of fields unchanged
    
    // Getters/Setters for aggregateUuid
    public UUID getAggregateUuid() {
        return aggregateUuid;
    }
    
    public void setAggregateUuid(UUID aggregateUuid) {
        this.aggregateUuid = aggregateUuid;
    }
}
```

---

## 5. Data Migration Plan

### 5.1 Zero-Downtime Migration

**Step 1**: Add column (NULL allowed)
```sql
ALTER TABLE studies ADD COLUMN aggregate_uuid VARCHAR(36) UNIQUE;
```

**Step 2**: Backfill existing data
```sql
UPDATE studies 
SET aggregate_uuid = UUID() 
WHERE aggregate_uuid IS NULL;
```

**Step 3**: Verify data integrity
```sql
SELECT 
    COUNT(*) as total_studies,
    COUNT(DISTINCT aggregate_uuid) as unique_uuids,
    COUNT(DISTINCT id) as unique_ids
FROM studies;
```

**Step 4**: Make column NOT NULL
```sql
ALTER TABLE studies 
MODIFY COLUMN aggregate_uuid VARCHAR(36) NOT NULL;
```

### 5.2 Synchronization Strategy

During Phase 2 (Write Path Migration):
1. New studies: Created via aggregate (UUID generated first)
2. Existing studies: Updated via aggregate (UUID already exists)
3. Projection always writes to database with UUID

**No data loss risk**: Events are source of truth, projection can be rebuilt

---

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data inconsistency between aggregate and projection | Low | High | Event replay capability, comprehensive tests |
| Performance degradation from event sourcing | Medium | Medium | Projection optimization, caching, monitoring |
| Breaking changes to frontend | Medium | High | Maintain bridge methods, gradual API migration |
| ProtocolVersion module breaks | Low | High | Update ProtocolVersion in same release |
| Cross-entity validation fails | Medium | Medium | Thorough testing of all status transitions |
| Migration script fails | Low | High | Test on staging, rollback plan ready |

---

## 7. Testing Strategy

### 7.1 Unit Tests

```java
@Test
void testCreateStudy_EmitsEvent() {
    // Given
    CreateStudyCommand command = CreateStudyCommand.builder()
        .studyAggregateUuid(UUID.randomUUID())
        .name("Test Study")
        .protocolNumber("PROTO-001")
        .sponsor("Test Sponsor")
        .userId(UUID.randomUUID())
        .build();
    
    // When
    StudyAggregate aggregate = new StudyAggregate(command);
    
    // Then
    assertEventEmitted(StudyCreatedEvent.class);
    assertEventField("name", "Test Study");
}

@Test
void testStatusTransition_ValidatesRules() {
    // Given
    StudyAggregate aggregate = createAggregateInState(StudyStatusCode.APPROVED);
    
    ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
        .studyAggregateUuid(aggregate.getStudyAggregateUuid())
        .newStatus(StudyStatusCode.ACTIVE)
        .userId(UUID.randomUUID())
        .build();
    
    // When/Then
    assertDoesNotThrow(() -> aggregate.handle(command));
}

@Test
void testStatusTransition_RejectsInvalidTransition() {
    // Given
    StudyAggregate aggregate = createAggregateInState(StudyStatusCode.COMPLETED);
    
    ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
        .studyAggregateUuid(aggregate.getStudyAggregateUuid())
        .newStatus(StudyStatusCode.ACTIVE)
        .userId(UUID.randomUUID())
        .build();
    
    // When/Then
    assertThrows(InvalidStatusTransitionException.class, 
                 () -> aggregate.handle(command));
}
```

### 7.2 Integration Tests

```java
@SpringBootTest
@AutoConfigureAxonFramework
class StudyDDDIntegrationTest {
    
    @Autowired
    private CommandGateway commandGateway;
    
    @Autowired
    private StudyReadRepository studyReadRepository;
    
    @Test
    void testEndToEnd_CreateStudy() {
        // 1. Send command
        UUID studyUuid = UUID.randomUUID();
        CreateStudyCommand command = CreateStudyCommand.builder()
            .studyAggregateUuid(studyUuid)
            .name("Integration Test Study")
            .protocolNumber("INT-001")
            .userId(UUID.randomUUID())
            .build();
        
        commandGateway.sendAndWait(command);
        
        // 2. Verify projection updated (eventual consistency)
        await().atMost(Duration.ofSeconds(5))
               .until(() -> studyReadRepository.findByAggregateUuid(studyUuid).isPresent());
        
        // 3. Verify data
        StudyEntity study = studyReadRepository.findByAggregateUuid(studyUuid).get();
        assertThat(study.getName()).isEqualTo("Integration Test Study");
        assertThat(study.getProtocolNumber()).isEqualTo("INT-001");
    }
}
```

### 7.3 Manual Testing Checklist

- [ ] Create study via API
- [ ] Update study details
- [ ] Change study status (all transitions)
- [ ] Suspend active study
- [ ] Resume suspended study
- [ ] Complete study
- [ ] Terminate study with reason
- [ ] Verify events in Axon event store
- [ ] Verify projection in database
- [ ] Test cross-entity validation
- [ ] Test frontend integration
- [ ] Test ProtocolVersion creation with new studyAggregateUuid

---

## 8. Rollback Plan

### 8.1 Rollback Triggers

- Critical bugs in production
- Data corruption detected
- Performance unacceptable
- Business operations impacted

### 8.2 Rollback Steps

**If in Phase 1** (Infrastructure only):
1. Drop `aggregate_uuid` column
2. Redeploy previous version
3. **Risk**: None (no functionality changed)

**If in Phase 2** (Write path migrated):
1. Redeploy previous version (writes go back to legacy)
2. Keep `aggregate_uuid` column for next attempt
3. **Risk**: Low (events stored, can replay)

**If in Phase 3+** (Read path migrated):
1. More complex - frontend may need updates
2. Restore bridge methods temporarily
3. Gradual rollback in reverse order
4. **Risk**: Medium (API changes may be in use)

---

## 9. Success Criteria

### Phase 1 Complete
- [x] `aggregate_uuid` column added to database
- [ ] StudyAggregate implemented
- [ ] Commands and Events created
- [ ] StudyProjection implemented
- [ ] StudyEntity enhanced
- [ ] StudyReadRepository updated
- [ ] Zero compilation errors
- [ ] All existing tests pass

### Phase 2 Complete
- [ ] StudyCommandService implemented
- [ ] All write operations use aggregate
- [ ] Zero direct writes to StudyEntity (except projection)
- [ ] Events stored in Axon event store
- [ ] Projections update correctly
- [ ] Integration tests pass

### Phase 3 Complete
- [ ] StudyQueryService implemented
- [ ] Controllers use UUID
- [ ] Frontend updated
- [ ] ProtocolVersion bridge removed
- [ ] CrossEntityStatusValidation refactored
- [ ] End-to-end tests pass

### Phase 4 Complete
- [ ] Legacy StudyService methods removed
- [ ] Bridge methods deprecated
- [ ] Code cleanup complete
- [ ] Documentation updated
- [ ] Production deployment successful

---

## 10. Timeline

| Phase | Duration | Start Date | End Date | Owner |
|-------|----------|------------|----------|-------|
| Phase 1: Infrastructure | 1 week | TBD | TBD | Team |
| Phase 2: Write Path | 1 week | TBD | TBD | Team |
| Phase 3: Read Path | 1 week | TBD | TBD | Team |
| Phase 4: Legacy Cleanup | 3 days | TBD | TBD | Team |
| Phase 5: Validation Refactoring | 3 days | TBD | TBD | Team |
| **Total** | **~4 weeks** | TBD | TBD | Team |

---

## 11. Next Steps

### Immediate Actions (Today)

1. **Review this plan** - Team approval required
2. **Database Migration Script** - Create and test on dev environment
3. **Create Domain Package** - Set up folder structure
4. **Implement StudyStatusCode** - Enum with transition rules
5. **Start Phase 1** - Begin infrastructure implementation

### This Week

1. Complete Phase 1 (Infrastructure Setup)
2. Run migration script on dev database
3. Implement and test StudyAggregate
4. Create all Commands and Events
5. Implement StudyProjection
6. Write unit tests for aggregate

### Next Week

1. Start Phase 2 (Write Path Migration)
2. Implement StudyCommandService
3. Migrate createStudy operation
4. Migrate updateStudy operation
5. Migrate changeStudyStatus operation
6. Integration tests

---

## 12. Benefits of This Migration

### Technical Benefits
1. **Event Sourcing**: Complete audit trail of all study changes
2. **CQRS**: Optimized read and write models
3. **Aggregate Consistency**: Business rules enforced in one place
4. **Scalability**: Event-driven architecture supports scaling
5. **Testability**: Aggregate can be tested in isolation

### Business Benefits
1. **Audit Trail**: Every study change tracked with who, when, why
2. **Compliance**: Regulatory requirements met with full history
3. **Time Travel**: Can rebuild study state at any point in time
4. **Debugging**: Event log shows exact sequence of changes
5. **Analytics**: Events can be replayed for data analysis

### Architectural Benefits
1. **Consistency**: Same pattern as ProtocolVersion module
2. **Removes Bridge**: Unlocks removal of studyId bridge in ProtocolVersion
3. **Clean Separation**: Write and read concerns separated
4. **Domain-Driven**: Business logic in domain, not scattered in services
5. **Future-Proof**: Easy to add new features as new events

---

## Appendix A: Key Files to Create

### Commands (8 files)
1. `CreateStudyCommand.java`
2. `UpdateStudyCommand.java`
3. `ChangeStudyStatusCommand.java`
4. `SuspendStudyCommand.java`
5. `ResumeStudyCommand.java`
6. `CompleteStudyCommand.java`
7. `TerminateStudyCommand.java`
8. `WithdrawStudyCommand.java`

### Events (8 files)
1. `StudyCreatedEvent.java`
2. `StudyUpdatedEvent.java`
3. `StudyStatusChangedEvent.java`
4. `StudySuspendedEvent.java`
5. `StudyResumedEvent.java`
6. `StudyCompletedEvent.java`
7. `StudyTerminatedEvent.java`
8. `StudyWithdrawnEvent.java`

### Core Components (5 files)
1. `StudyAggregate.java`
2. `StudyProjection.java`
3. `StudyCommandService.java`
4. `StudyQueryService.java`
5. `StudyStatusCode.java`

### Modified Files (3 files)
1. `StudyEntity.java` - Add aggregateUuid field
2. `StudyReadRepository.java` - Add UUID methods
3. `StudyController.java` - Update to use UUIDs (Phase 3)

**Total New Files**: 21  
**Total Modified Files**: 3  
**Database Changes**: 1 column addition

---

## Appendix B: Database Schema Changes

### Before Migration
```sql
CREATE TABLE studies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    protocol_number VARCHAR(100),
    sponsor VARCHAR(255),
    -- ... 60+ other fields
    study_status_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### After Migration
```sql
CREATE TABLE studies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_uuid VARCHAR(36) UNIQUE NOT NULL, -- ✅ NEW
    name VARCHAR(255) NOT NULL,
    protocol_number VARCHAR(100),
    sponsor VARCHAR(255),
    -- ... 60+ other fields
    study_status_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_studies_aggregate_uuid (aggregate_uuid)
);
```

**Change**: Single column addition + index, zero data loss

---

**Document Version**: 1.0  
**Last Updated**: October 4, 2025  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion
