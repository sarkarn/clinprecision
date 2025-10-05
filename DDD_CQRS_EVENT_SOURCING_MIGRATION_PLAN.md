# Study Design Refactoring to DDD, CQRS, and Event Sourcing - Migration Plan

## 📊 **Current State Analysis**

### ✅ **Already Following DDD/CQRS/Event Sourcing**
1. **`patientenrollment` module**
   - ✅ Aggregate: `PatientAggregate`
   - ✅ Commands, Events, Domain model
   - ✅ Event sourcing with Axon Framework
   - ✅ Command/Query separation

2. **`studydatabase` module (DBBuild)**
   - ✅ Aggregate: `StudyDatabaseBuildAggregate`
   - ✅ Commands, Events, Projections
   - ✅ Event sourcing with Axon Framework
   - ✅ CQRS pattern implemented

### ❌ **Legacy CRUD Architecture (Needs Refactoring)**

#### **Study Management Services** (19 service classes):
```
service/
├── StudyService.java                          ← Core study CRUD (783 lines)
├── StudyVersionService.java                   ← Protocol versioning (403 lines)
├── StudyAmendmentService.java                 ← Amendment management
├── StudyArmService.java                       ← Study arms/interventions
├── StudyPhaseService.java                     ← Phase management
├── StudyDocumentService.java                  ← Document management
├── StudyDashboardService.java                 ← Dashboard queries
├── DesignProgressService.java                 ← Progress tracking
├── VisitDefinitionService.java                ← Visit schedules
├── VisitFormService.java                      ← Form assignments
├── FormDefinitionService.java                 ← Form definitions
├── FormTemplateService.java                   ← Form templates
├── CodeListService.java                       ← Code lists
├── StudyStatusService.java                    ← Status lookups
├── StudyStatusComputationService.java         ← Status computation (business logic!)
├── AutomatedStatusComputationService.java     ← Auto status updates
├── RegulatoryStatusService.java               ← Regulatory tracking
├── CrossEntityStatusValidationService.java    ← Cross-entity validation
└── StudyValidationService.java                ← Study validation rules
```

### **Problems with Current Architecture**

#### 1. **Anemic Domain Model**
```java
// Current: Services contain business logic, entities are just data holders
@Service
public class StudyService {
    public StudyResponseDto createStudy(StudyCreateRequestDto request) {
        // Business logic in service layer
        validationService.validateStudyCreation(request);
        StudyEntity study = studyMapper.toEntity(request);
        study.setCreatedBy(getCurrentUserId());
        return studyRepository.save(study);
    }
}

// StudyEntity is just a data container (no behavior)
@Entity
public class StudyEntity {
    private Long id;
    private String name;
    // ... 50+ fields, no business methods
}
```

#### 2. **Database-Driven Complexity**
- **6 triggers** automatically modifying study status ❌
- **5 stored procedures** with business logic in DB ❌
- **Status computation** split between Java and SQL ❌
- **Difficult to test** - requires database setup
- **Hidden business rules** - logic buried in SQL

#### 3. **No Event Sourcing/Audit Trail**
- Can't replay state changes
- Limited audit trail (just created_at/updated_at)
- No way to see WHY study status changed
- Compliance issues (FDA 21 CFR Part 11)

#### 4. **Tight Coupling**
- Study logic coupled to database schema
- Service dependencies create circular references
- Hard to change without breaking other services

#### 5. **Scalability Issues**
- All operations go through single database
- Status computation triggers create contention
- No async processing for heavy operations

---

## 🎯 **Target Architecture**

### **DDD Bounded Context: Study Design**

```
studydesign/                          ← New DDD module
├── aggregate/                        ← Aggregates (domain roots)
│   ├── StudyAggregate.java          ← Core study aggregate
│   ├── ProtocolVersionAggregate.java ← Protocol versioning
│   └── StudyDesignAggregate.java    ← Study design (arms, visits, forms)
│
├── domain/                           ← Domain model
│   ├── commands/                     ← Command messages
│   │   ├── study/
│   │   │   ├── CreateStudyCommand.java
│   │   │   ├── UpdateStudyCommand.java
│   │   │   ├── ChangeStudyStatusCommand.java
│   │   │   └── CloseStudyCommand.java
│   │   ├── protocol/
│   │   │   ├── CreateProtocolVersionCommand.java
│   │   │   ├── ApproveProtocolCommand.java
│   │   │   ├── ActivateProtocolCommand.java
│   │   │   └── CreateAmendmentCommand.java
│   │   └── design/
│   │       ├── AddStudyArmCommand.java
│   │       ├── DefineVisitScheduleCommand.java
│   │       └── AssignFormToVisitCommand.java
│   │
│   ├── events/                       ← Domain events
│   │   ├── study/
│   │   │   ├── StudyCreatedEvent.java
│   │   │   ├── StudyStatusChangedEvent.java
│   │   │   └── StudyClosedEvent.java
│   │   ├── protocol/
│   │   │   ├── ProtocolVersionCreatedEvent.java
│   │   │   ├── ProtocolApprovedEvent.java
│   │   │   ├── ProtocolActivatedEvent.java
│   │   │   └── AmendmentCreatedEvent.java
│   │   └── design/
│   │       ├── StudyArmAddedEvent.java
│   │       ├── VisitScheduleDefinedEvent.java
│   │       └── FormAssignedToVisitEvent.java
│   │
│   ├── valueobjects/                 ← Value Objects (immutable)
│   │   ├── StudyIdentifier.java
│   │   ├── ProtocolNumber.java
│   │   ├── StudyStatus.java         ← Enum with behavior
│   │   ├── ProtocolVersionNumber.java
│   │   ├── AmendmentType.java
│   │   └── StudyPhase.java
│   │
│   └── model/                        ← Domain entities (not JPA)
│       ├── Study.java                ← Rich domain model with behavior
│       ├── ProtocolVersion.java
│       ├── Amendment.java
│       ├── StudyArm.java
│       ├── Visit.java
│       └── FormAssignment.java
│
├── entity/                           ← JPA Entities (read model)
│   ├── StudyEntity.java              ← Projection entity
│   ├── ProtocolVersionEntity.java
│   ├── StudyArmEntity.java
│   └── VisitDefinitionEntity.java
│
├── projection/                       ← CQRS Query handlers
│   ├── StudyProjection.java          ← Event → Read model
│   ├── ProtocolProjection.java
│   └── DashboardProjection.java
│
├── repository/                       ← Read-side repositories
│   ├── StudyReadRepository.java      ← Queries only
│   └── ProtocolVersionReadRepository.java
│
├── service/                          ← Application services
│   ├── command/                      ← Command services
│   │   ├── StudyCommandService.java  ← Sends commands to aggregates
│   │   └── ProtocolCommandService.java
│   └── query/                        ← Query services
│       ├── StudyQueryService.java    ← Queries read models
│       └── DashboardQueryService.java
│
└── controller/                       ← API endpoints
    ├── StudyCommandController.java   ← POST/PUT/DELETE endpoints
    └── StudyQueryController.java     ← GET endpoints
```

---

## 📋 **Migration Strategy**

### **Phase 1: Foundation (Week 1-2)**
**Goal**: Set up DDD structure without breaking existing functionality

#### 1.1 Create Study Aggregate (Core Domain)
```java
@Aggregate
public class StudyAggregate {
    @AggregateIdentifier
    private UUID studyId;
    
    private StudyStatus status;
    private ProtocolNumber protocolNumber;
    private StudyPhase phase;
    private LocalDateTime createdAt;
    private Long createdBy;
    
    // Business rules enforced in aggregate
    @CommandHandler
    public StudyAggregate(CreateStudyCommand command) {
        // Validate business rules
        validateStudyCreation(command);
        
        // Apply event
        AggregateLifecycle.apply(StudyCreatedEvent.builder()
            .studyId(command.getStudyId())
            .name(command.getName())
            .protocolNumber(command.getProtocolNumber())
            .sponsor(command.getSponsor())
            .phase(command.getPhase())
            .status(StudyStatus.PLANNING)
            .createdBy(command.getCreatedBy())
            .build());
    }
    
    @CommandHandler
    public void handle(ChangeStudyStatusCommand command) {
        // Business rule: Validate status transition
        if (!canTransitionTo(command.getNewStatus())) {
            throw new IllegalStatusTransitionException(
                status, command.getNewStatus());
        }
        
        // Apply event
        AggregateLifecycle.apply(StudyStatusChangedEvent.builder()
            .studyId(this.studyId)
            .oldStatus(this.status)
            .newStatus(command.getNewStatus())
            .reason(command.getReason())
            .changedBy(command.getUserId())
            .build());
    }
    
    @EventSourcingHandler
    public void on(StudyCreatedEvent event) {
        this.studyId = event.getStudyId();
        this.status = event.getStatus();
        this.protocolNumber = event.getProtocolNumber();
        // ... update aggregate state
    }
    
    @EventSourcingHandler
    public void on(StudyStatusChangedEvent event) {
        this.status = event.getNewStatus();
    }
    
    // Domain behavior (business logic in aggregate)
    private boolean canTransitionTo(StudyStatus newStatus) {
        return switch (this.status) {
            case PLANNING -> 
                newStatus == StudyStatus.REGULATORY_SUBMISSION ||
                newStatus == StudyStatus.IRB_REVIEW;
            case REGULATORY_SUBMISSION -> 
                newStatus == StudyStatus.APPROVED ||
                newStatus == StudyStatus.PLANNING;
            case APPROVED -> 
                newStatus == StudyStatus.ACTIVE;
            // ... more transitions
            default -> false;
        };
    }
    
    private void validateStudyCreation(CreateStudyCommand command) {
        if (command.getName() == null || command.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        if (command.getPhase() == null) {
            throw new IllegalArgumentException("Study phase is required");
        }
        // ... more validation
    }
}
```

#### 1.2 Create Protocol Version Aggregate
```java
@Aggregate
public class ProtocolVersionAggregate {
    @AggregateIdentifier
    private UUID protocolVersionId;
    
    private UUID studyId;
    private VersionNumber versionNumber;
    private ProtocolStatus status;
    private AmendmentType amendmentType;
    
    @CommandHandler
    public ProtocolVersionAggregate(CreateProtocolVersionCommand command) {
        // Validate business rules
        validateVersionCreation(command);
        
        // Apply event
        AggregateLifecycle.apply(ProtocolVersionCreatedEvent.builder()
            .protocolVersionId(command.getProtocolVersionId())
            .studyId(command.getStudyId())
            .versionNumber(command.getVersionNumber())
            .amendmentType(command.getAmendmentType())
            .status(ProtocolStatus.DRAFT)
            .createdBy(command.getCreatedBy())
            .build());
    }
    
    @CommandHandler
    public void handle(ApproveProtocolCommand command) {
        // Business rule: Can only approve UNDER_REVIEW protocols
        if (this.status != ProtocolStatus.UNDER_REVIEW) {
            throw new IllegalStateException(
                "Cannot approve protocol in status: " + this.status);
        }
        
        // Apply event
        AggregateLifecycle.apply(ProtocolApprovedEvent.builder()
            .protocolVersionId(this.protocolVersionId)
            .studyId(this.studyId)
            .approvedBy(command.getApprovedBy())
            .approvalDate(LocalDateTime.now())
            .build());
    }
    
    @EventSourcingHandler
    public void on(ProtocolVersionCreatedEvent event) {
        this.protocolVersionId = event.getProtocolVersionId();
        this.studyId = event.getStudyId();
        this.versionNumber = event.getVersionNumber();
        this.status = ProtocolStatus.DRAFT;
    }
    
    @EventSourcingHandler
    public void on(ProtocolApprovedEvent event) {
        this.status = ProtocolStatus.APPROVED;
    }
}
```

#### 1.3 Create Projections (Read Models)
```java
@Component
@ProcessingGroup("study-projection")
public class StudyProjection {
    
    private final StudyReadRepository studyReadRepository;
    
    @EventHandler
    public void on(StudyCreatedEvent event) {
        StudyEntity entity = StudyEntity.builder()
            .aggregateUuid(event.getStudyId().toString())
            .name(event.getName())
            .protocolNumber(event.getProtocolNumber())
            .status(event.getStatus())
            .createdAt(LocalDateTime.now())
            .createdBy(event.getCreatedBy())
            .build();
        
        studyReadRepository.save(entity);
    }
    
    @EventHandler
    public void on(StudyStatusChangedEvent event) {
        StudyEntity entity = studyReadRepository
            .findByAggregateUuid(event.getStudyId().toString())
            .orElseThrow();
        
        entity.setStatus(event.getNewStatus());
        entity.setUpdatedAt(LocalDateTime.now());
        
        studyReadRepository.save(entity);
    }
}
```

#### 1.4 Database Schema Changes
```sql
-- Add aggregate_uuid column to existing tables
ALTER TABLE studies 
ADD COLUMN aggregate_uuid VARCHAR(36) UNIQUE,
ADD INDEX idx_aggregate_uuid (aggregate_uuid);

-- Populate aggregate_uuid for existing studies
UPDATE studies 
SET aggregate_uuid = UUID() 
WHERE aggregate_uuid IS NULL;

-- Create event store tables (Axon Framework)
-- These are created automatically by Axon, but we can customize

-- Create projection status tracking
CREATE TABLE projection_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    projection_name VARCHAR(255) NOT NULL,
    last_processed_event_sequence BIGINT,
    last_processed_at TIMESTAMP,
    status VARCHAR(50),
    UNIQUE KEY uk_projection_name (projection_name)
);
```

#### 1.5 Migration Service (Data Migration)
```java
@Service
public class StudyMigrationService {
    
    private final StudyRepository legacyRepository;
    private final CommandGateway commandGateway;
    
    @Transactional
    public void migrateStudiesToEventSourced() {
        List<StudyEntity> legacyStudies = legacyRepository.findAll();
        
        for (StudyEntity legacy : legacyStudies) {
            // Create aggregate UUID
            UUID aggregateId = UUID.randomUUID();
            
            // Send command to create event-sourced study
            CreateStudyCommand command = CreateStudyCommand.builder()
                .studyId(aggregateId)
                .name(legacy.getName())
                .protocolNumber(legacy.getProtocolNumber())
                .sponsor(legacy.getSponsor())
                .phase(legacy.getStudyPhase())
                .createdBy(legacy.getCreatedBy())
                .build();
            
            commandGateway.sendAndWait(command);
            
            // Update legacy entity with aggregate UUID
            legacy.setAggregateUuid(aggregateId.toString());
            legacyRepository.save(legacy);
            
            // Migrate status history if needed
            migrateStatusHistory(legacy, aggregateId);
        }
    }
}
```

---

### **Phase 2: Protocol Version Migration (Week 3-4)**
**Goal**: Move protocol versioning to event sourcing

#### 2.1 Commands & Events
```java
// Commands
public class CreateProtocolVersionCommand { ... }
public class ApproveProtocolCommand { ... }
public class ActivateProtocolCommand { ... }
public class CreateAmendmentCommand { ... }

// Events
public class ProtocolVersionCreatedEvent { ... }
public class ProtocolApprovedEvent { ... }
public class ProtocolActivatedEvent { ... }
public class AmendmentCreatedEvent { ... }
```

#### 2.2 Remove Database Triggers
```sql
-- Disable status computation triggers (from previous analysis)
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_delete;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_delete;

-- Keep stored procedures for manual use if needed
-- But don't call them automatically
```

#### 2.3 Event-Driven Status Management
```java
// Instead of triggers, use event handlers
@Component
public class StudyStatusEventHandler {
    
    private final CommandGateway commandGateway;
    
    @EventHandler
    public void on(ProtocolVersionCreatedEvent event) {
        // Business rule: When first protocol version is created,
        // study should remain in its current status
        // (NOT automatically change to DRAFT like the trigger did!)
        
        // No automatic status change!
        // Status changes only happen via explicit commands
    }
    
    @EventHandler
    public void on(ProtocolActivatedEvent event) {
        // Business rule: When protocol is activated,
        // study MAY transition to ACTIVE (if conditions met)
        
        // Send command to study aggregate
        commandGateway.send(ChangeStudyStatusCommand.builder()
            .studyId(event.getStudyId())
            .newStatus(StudyStatus.ACTIVE)
            .reason("Protocol " + event.getVersionNumber() + " activated")
            .userId(event.getActivatedBy())
            .build());
    }
}
```

---

### **Phase 3: Study Design Migration (Week 5-6)**
**Goal**: Move study arms, visits, forms to event sourcing

#### 3.1 Study Design Aggregate
```java
@Aggregate
public class StudyDesignAggregate {
    @AggregateIdentifier
    private UUID studyDesignId;
    
    private UUID studyId;
    private List<StudyArm> arms;
    private List<Visit> visits;
    private Map<UUID, List<FormAssignment>> visitForms;
    
    @CommandHandler
    public void handle(AddStudyArmCommand command) {
        // Business rules
        validateArmAddition(command);
        
        AggregateLifecycle.apply(StudyArmAddedEvent.builder()
            .studyDesignId(this.studyDesignId)
            .armId(UUID.randomUUID())
            .armName(command.getArmName())
            .armType(command.getArmType())
            .description(command.getDescription())
            .build());
    }
    
    @CommandHandler
    public void handle(DefineVisitScheduleCommand command) {
        validateVisitSchedule(command);
        
        AggregateLifecycle.apply(VisitScheduleDefinedEvent.builder()
            .studyDesignId(this.studyDesignId)
            .visits(command.getVisits())
            .build());
    }
    
    @EventSourcingHandler
    public void on(StudyArmAddedEvent event) {
        StudyArm arm = new StudyArm(
            event.getArmId(),
            event.getArmName(),
            event.getArmType()
        );
        this.arms.add(arm);
    }
}
```

---

### **Phase 4: Service Layer Refactoring (Week 7-8)**
**Goal**: Replace CRUD services with command/query services

#### 4.1 Command Service (Write Side)
```java
@Service
public class StudyCommandService {
    
    private final CommandGateway commandGateway;
    
    public UUID createStudy(CreateStudyRequest request, Long userId) {
        UUID studyId = UUID.randomUUID();
        
        CreateStudyCommand command = CreateStudyCommand.builder()
            .studyId(studyId)
            .name(request.getName())
            .protocolNumber(request.getProtocolNumber())
            .sponsor(request.getSponsor())
            .phase(request.getPhase())
            .createdBy(userId)
            .build();
        
        commandGateway.sendAndWait(command);
        
        return studyId;
    }
    
    public void changeStudyStatus(UUID studyId, StudyStatus newStatus, 
                                   String reason, Long userId) {
        ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
            .studyId(studyId)
            .newStatus(newStatus)
            .reason(reason)
            .userId(userId)
            .build();
        
        commandGateway.sendAndWait(command);
    }
}
```

#### 4.2 Query Service (Read Side)
```java
@Service
public class StudyQueryService {
    
    private final StudyReadRepository studyReadRepository;
    private final QueryGateway queryGateway;
    
    public StudyResponseDto getStudy(UUID studyId) {
        StudyEntity entity = studyReadRepository
            .findByAggregateUuid(studyId.toString())
            .orElseThrow(() -> new StudyNotFoundException(studyId));
        
        return mapToDto(entity);
    }
    
    public List<StudyResponseDto> findStudiesByStatus(StudyStatus status) {
        return studyReadRepository.findByStatus(status)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public StudyStatistics getStudyStatistics(UUID studyId) {
        // Use Axon Query Gateway for complex queries
        return queryGateway.query(
            new GetStudyStatisticsQuery(studyId),
            StudyStatistics.class
        ).join();
    }
}
```

#### 4.3 Controller Refactoring
```java
@RestController
@RequestMapping("/clinops-ws/api/studies")
public class StudyCommandController {
    
    private final StudyCommandService commandService;
    
    @PostMapping
    public ResponseEntity<StudyCreatedResponse> createStudy(
            @RequestBody @Valid CreateStudyRequest request) {
        
        UUID studyId = commandService.createStudy(
            request, 
            getCurrentUserId()
        );
        
        return ResponseEntity.ok(
            new StudyCreatedResponse(studyId)
        );
    }
    
    @PutMapping("/{studyId}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID studyId,
            @RequestBody @Valid ChangeStatusRequest request) {
        
        commandService.changeStudyStatus(
            studyId,
            request.getNewStatus(),
            request.getReason(),
            getCurrentUserId()
        );
        
        return ResponseEntity.ok().build();
    }
}

@RestController
@RequestMapping("/clinops-ws/api/studies")
public class StudyQueryController {
    
    private final StudyQueryService queryService;
    
    @GetMapping("/{studyId}")
    public ResponseEntity<StudyResponseDto> getStudy(
            @PathVariable UUID studyId) {
        
        StudyResponseDto study = queryService.getStudy(studyId);
        return ResponseEntity.ok(study);
    }
    
    @GetMapping
    public ResponseEntity<List<StudyResponseDto>> getStudies(
            @RequestParam(required = false) StudyStatus status) {
        
        List<StudyResponseDto> studies = status != null
            ? queryService.findStudiesByStatus(status)
            : queryService.findAllStudies();
        
        return ResponseEntity.ok(studies);
    }
}
```

---

### **Phase 5: Remove Database Logic (Week 9)**
**Goal**: Move all business logic to Java

#### 5.1 Remove Stored Procedures
```sql
-- Drop status computation procedures
DROP PROCEDURE IF EXISTS ComputeAndUpdateStudyStatus;
DROP PROCEDURE IF EXISTS DetermineStudyStatusFromVersions;
DROP PROCEDURE IF EXISTS LogStudyStatusChange;
DROP PROCEDURE IF EXISTS ManuallyComputeStudyStatus;
DROP PROCEDURE IF EXISTS BatchComputeAllStudyStatuses;

-- Drop views
DROP VIEW IF EXISTS recent_status_changes;
DROP VIEW IF EXISTS studies_frequent_status_changes;
DROP VIEW IF EXISTS status_computation_errors;

-- Keep audit log table for historical data
-- But don't write to it anymore
-- RENAME TABLE study_status_computation_log TO study_status_computation_log_legacy;
```

#### 5.2 Audit Trail via Events
```java
// Axon automatically provides complete audit trail
// Query all events for a study:
EventStore eventStore;
DomainEventStream events = eventStore.readEvents(studyId.toString());

// Replay events to see state at any point in time
while (events.hasNext()) {
    DomainEventMessage<?> event = events.next();
    System.out.println("Event: " + event.getPayload());
    System.out.println("Timestamp: " + event.getTimestamp());
    System.out.println("Metadata: " + event.getMetaData());
}
```

---

## 📊 **Benefits After Migration**

### 1. **Rich Domain Model**
✅ Business logic in aggregates (not services)  
✅ Clear business rules and validation  
✅ Domain experts can understand code  

### 2. **Complete Audit Trail**
✅ Every state change recorded as event  
✅ Can replay to any point in time  
✅ FDA 21 CFR Part 11 compliant  
✅ Clear WHY status changed (not just WHAT changed)

### 3. **Scalability**
✅ Read/Write separation (CQRS)  
✅ Async event processing  
✅ Can scale read and write sides independently  
✅ No database trigger contention

### 4. **Testability**
✅ Unit test aggregates without database  
✅ Test business rules in isolation  
✅ Event-driven tests are deterministic  

### 5. **Maintainability**
✅ Business logic in one place (aggregate)  
✅ No hidden logic in database triggers  
✅ Clear command → event → projection flow  
✅ Easy to add new features without breaking existing

### 6. **Database Simplicity**
✅ Minimal triggers (none for business logic)  
✅ No stored procedures with business rules  
✅ Tables are just read models  
✅ Easy to backup and restore

---

## 🚀 **Implementation Roadmap**

### **Week 1-2: Foundation**
- [ ] Create `studydesign` package structure
- [ ] Implement `StudyAggregate`
- [ ] Create commands/events for study lifecycle
- [ ] Set up projections for read models
- [ ] Add `aggregate_uuid` to database

### **Week 3-4: Protocol Versioning**
- [ ] Implement `ProtocolVersionAggregate`
- [ ] Create protocol commands/events
- [ ] Disable database triggers
- [ ] Implement event-driven status management
- [ ] Migrate existing protocol versions

### **Week 5-6: Study Design**
- [ ] Implement `StudyDesignAggregate`
- [ ] Migrate study arms, visits, forms
- [ ] Create design projections
- [ ] Test complete study design workflow

### **Week 7-8: Service Refactoring**
- [ ] Create command services
- [ ] Create query services
- [ ] Refactor controllers
- [ ] Update frontend integration
- [ ] Integration testing

### **Week 9: Database Cleanup**
- [ ] Remove stored procedures
- [ ] Remove triggers (all)
- [ ] Archive legacy audit tables
- [ ] Performance testing
- [ ] Production deployment

---

## 📝 **Migration Checklist**

### **Pre-Migration**
- [ ] Backup all production data
- [ ] Document current business rules
- [ ] Create rollback plan
- [ ] Set up monitoring

### **During Migration**
- [ ] Run both systems in parallel
- [ ] Compare outputs
- [ ] Gradual rollout (feature flags)
- [ ] Monitor performance

### **Post-Migration**
- [ ] Verify all features work
- [ ] Validate audit trail
- [ ] Performance benchmarks
- [ ] Remove legacy code
- [ ] Update documentation

---

## 🎓 **Training Requirements**

### **Team Training Needed**
1. **DDD Concepts** (2 days)
   - Aggregates, Entities, Value Objects
   - Bounded Contexts
   - Domain Events

2. **CQRS Pattern** (1 day)
   - Command/Query separation
   - Read models vs Write models
   - Eventual consistency

3. **Event Sourcing** (2 days)
   - Event Store concepts
   - Event versioning
   - Replay and projections

4. **Axon Framework** (3 days)
   - Aggregate lifecycle
   - Command/Event handling
   - Testing strategies

---

## 📚 **Key Differences: Before vs After**

### **Before (Current Legacy)**
```java
// Service contains business logic
@Service
public class StudyService {
    public StudyResponseDto createStudy(StudyCreateRequestDto request) {
        StudyEntity study = new StudyEntity();
        study.setName(request.getName());
        study.setStatus("PLANNING");
        return studyRepository.save(study); // ⚠️ Trigger fires and changes status!
    }
}
```

### **After (DDD/Event Sourcing)**
```java
// Aggregate contains business logic
@Aggregate
public class StudyAggregate {
    @CommandHandler
    public StudyAggregate(CreateStudyCommand command) {
        // Business rules enforced here
        if (command.getName().isEmpty()) {
            throw new IllegalArgumentException("Name required");
        }
        
        // Event applied
        AggregateLifecycle.apply(StudyCreatedEvent.builder()
            .studyId(command.getStudyId())
            .name(command.getName())
            .status(StudyStatus.PLANNING)
            .build());
        
        // ✅ Status change is explicit and audited
    }
}
```

---

## ⚠️ **Risks and Mitigation**

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data Migration Errors** | High | - Comprehensive testing<br>- Parallel run<br>- Rollback plan |
| **Performance Degradation** | Medium | - Load testing<br>- Index optimization<br>- Caching strategy |
| **Team Learning Curve** | Medium | - Training sessions<br>- Pair programming<br>- Documentation |
| **Breaking API Changes** | High | - Versioned APIs<br>- Gradual deprecation<br>- Feature flags |
| **Event Store Growth** | Low | - Event archiving strategy<br>- Snapshots<br>- Monitoring |

---

## 🎯 **Success Criteria**

- [ ] All database triggers removed
- [ ] All stored procedures removed (or not used)
- [ ] Complete audit trail via events
- [ ] Performance same or better
- [ ] All tests passing
- [ ] Zero data loss
- [ ] Team trained and confident

---

## 📞 **Next Steps**

1. **Review this plan** with team
2. **Estimate effort** for each phase
3. **Set up pilot** with one aggregate (StudyAggregate)
4. **Validate approach** before full migration
5. **Create detailed tickets** for Phase 1

Would you like me to start implementing Phase 1 (StudyAggregate) as a proof of concept?
