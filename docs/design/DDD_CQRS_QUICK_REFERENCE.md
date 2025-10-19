# DDD/CQRS/Event Sourcing - Quick Reference

## 🏗️ **Architecture Comparison**

### **BEFORE: Traditional CRUD (Current)**
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTP Requests
                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Controllers                             │
│  StudyController, StudyVersionController, etc.              │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (19 Services)                 │
│  StudyService, StudyVersionService,                         │
│  StudyStatusComputationService, etc.                        │
│  ⚠️ Contains ALL business logic                             │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              JPA Repositories                                │
│  StudyRepository, StudyVersionRepository, etc.              │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│  • Tables (studies, study_versions, etc.)                   │
│  • ⚠️ 6 Triggers (auto-compute study status)                │
│  • ⚠️ 5 Stored Procedures (business logic in SQL!)          │
│  • Audit log tables                                          │
└─────────────────────────────────────────────────────────────┘

Problems:
❌ Business logic split: Java + SQL triggers
❌ Anemic domain model (entities are just data)
❌ Services contain all logic (procedural)
❌ Hidden business rules in database
❌ Limited audit trail
❌ Difficult to test
❌ Tight coupling
```

### **AFTER: DDD + CQRS + Event Sourcing (Target)**
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
└────┬───────────────────────────────────────────┬────────────┘
     │ Commands (Write)                          │ Queries (Read)
     ▼                                           ▼
┌──────────────────────┐              ┌────────────────────────┐
│  Command Controllers │              │   Query Controllers    │
│  POST/PUT/DELETE     │              │   GET                  │
└──────────┬───────────┘              └────────────┬───────────┘
           │                                       │
           ▼                                       ▼
┌──────────────────────┐              ┌────────────────────────┐
│  Command Services    │              │   Query Services       │
│  Send commands       │              │   Read from projections│
└──────────┬───────────┘              └────────────┬───────────┘
           │                                       │
           ▼                                       ▼
┌──────────────────────────────────┐  ┌────────────────────────┐
│      COMMAND GATEWAY             │  │   Read Repositories    │
│      (Axon Framework)            │  │   JPA queries only     │
└──────────┬───────────────────────┘  └────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                        AGGREGATES                            │
│  ✅ Rich Domain Model (Business Logic Here!)                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ StudyAggregate                                      │   │
│  │  - Business rules for study lifecycle               │   │
│  │  - Status transition validation                     │   │
│  │  - Study creation rules                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ProtocolVersionAggregate                            │   │
│  │  - Protocol versioning rules                        │   │
│  │  - Amendment validation                             │   │
│  │  - Approval workflow                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ StudyDesignAggregate                                │   │
│  │  - Study arm management                             │   │
│  │  - Visit schedule validation                        │   │
│  │  - Form assignment rules                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────┘
              │ Apply Events
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EVENT STORE                             │
│  ✅ Complete audit trail (FDA compliant)                    │
│  ✅ Can replay to any point in time                         │
│  ✅ Immutable event history                                 │
└─────────────┬───────────────────────────────────────────────┘
              │ Publish Events
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EVENT HANDLERS                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ StudyProjection                                    │    │
│  │  - Updates read model (StudyEntity)                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ProtocolProjection                                 │    │
│  │  - Updates read model (ProtocolVersionEntity)      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ DashboardProjection                                │    │
│  │  - Updates dashboard statistics                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────┬───────────────────────────────────────────────┘
              │ Update
              ▼
┌─────────────────────────────────────────────────────────────┐
│                  READ MODEL (Database)                       │
│  ✅ Simple tables (no triggers!)                            │
│  ✅ No stored procedures with business logic                │
│  ✅ Just projections of events                              │
│  ✅ Can be rebuilt from event store                         │
└─────────────────────────────────────────────────────────────┘

Benefits:
✅ Business logic in aggregates (domain-driven)
✅ Complete audit trail via events
✅ No database triggers or stored procedures
✅ Read/Write separation (scalable)
✅ Testable without database
✅ Clear command → event → projection flow
```

---

## 📝 **Key Concepts Explained**

### **1. Aggregate**
**What**: Domain object that enforces business rules  
**Example**:
```java
@Aggregate
public class StudyAggregate {
    @AggregateIdentifier
    private UUID studyId;
    
    private StudyStatus status;
    
    // ✅ Business logic HERE (not in service)
    @CommandHandler
    public void handle(ChangeStudyStatusCommand command) {
        // Validate business rule
        if (!canTransitionTo(command.getNewStatus())) {
            throw new IllegalStatusTransitionException();
        }
        
        // Apply event
        AggregateLifecycle.apply(
            new StudyStatusChangedEvent(...)
        );
    }
    
    private boolean canTransitionTo(StudyStatus newStatus) {
        // Business rules about valid status transitions
        return ...;
    }
}
```

### **2. Command**
**What**: Intent to change state  
**Example**:
```java
@Data
public class CreateStudyCommand {
    private final UUID studyId;
    private final String name;
    private final String protocolNumber;
    private final StudyPhase phase;
    private final Long createdBy;
}
```

### **3. Event**
**What**: Something that happened (past tense!)  
**Example**:
```java
@Data
public class StudyCreatedEvent {
    private final UUID studyId;
    private final String name;
    private final String protocolNumber;
    private final StudyStatus status;
    private final LocalDateTime occurredAt;
    private final Long createdBy;
}
```

### **4. Event Handler / Projection**
**What**: Updates read model when event occurs  
**Example**:
```java
@Component
public class StudyProjection {
    
    @EventHandler
    public void on(StudyCreatedEvent event) {
        // Update read model
        StudyEntity entity = new StudyEntity();
        entity.setAggregateUuid(event.getStudyId());
        entity.setName(event.getName());
        entity.setStatus(event.getStatus());
        studyRepository.save(entity);
    }
}
```

### **5. CQRS (Command Query Responsibility Segregation)**
**What**: Separate models for write (commands) and read (queries)

```
Write Side (Commands):           Read Side (Queries):
┌─────────────────┐             ┌─────────────────┐
│ CreateStudy     │             │ GetStudy        │
│ ChangeStatus    │             │ ListStudies     │
│ CloseStudy      │             │ GetStatistics   │
└─────────────────┘             └─────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│ Aggregates      │─── Events ──▶│ Projections    │
│ (Business Logic)│             │ (Read Models)   │
└─────────────────┘             └─────────────────┘
```

---

## 🔄 **Typical Flow**

### **Creating a Study**
```
1. User clicks "Create Study"
   │
2. Frontend sends CreateStudyRequest
   │
3. Controller receives request
   │
4. Command Service creates CreateStudyCommand
   │
5. CommandGateway sends command to StudyAggregate
   │
6. StudyAggregate validates business rules
   │
7. StudyAggregate applies StudyCreatedEvent
   │
8. Event saved to Event Store
   │
9. Event published to Event Handlers
   │
10. StudyProjection handles event
    │
11. StudyProjection updates read model (StudyEntity)
    │
12. User can now query the study
```

### **Changing Study Status**
```
1. User clicks "Change Status to APPROVED"
   │
2. Frontend sends ChangeStatusRequest
   │
3. Controller receives request
   │
4. Command Service creates ChangeStudyStatusCommand
   │
5. CommandGateway sends command to StudyAggregate
   │
6. StudyAggregate checks: canTransitionTo(APPROVED)?
   │   YES: Apply StudyStatusChangedEvent ✅
   │   NO:  Throw IllegalStatusTransitionException ❌
   │
7. Event saved to Event Store
   │
8. StudyProjection updates read model
   │
9. No database trigger fires! ✅
   Status change is explicit and audited ✅
```

---

## 📊 **Migration Comparison**

| Aspect | Before (CRUD) | After (DDD/ES) |
|--------|---------------|----------------|
| **Business Logic** | Services + SQL triggers | Aggregates |
| **Database Triggers** | 6 triggers | 0 triggers |
| **Stored Procedures** | 5 procedures | 0 procedures |
| **Audit Trail** | Limited (created_at/updated_at) | Complete (all events) |
| **Status Changes** | Automatic (trigger-driven) | Explicit (command-driven) |
| **Testability** | Requires database | Unit tests without DB |
| **Scalability** | Single database | Read/Write separation |
| **Domain Model** | Anemic (data only) | Rich (behavior + data) |

---

## 🎯 **What Changes for Developers**

### **Old Way (Service-Oriented)**
```java
// Service contains everything
@Service
public class StudyService {
    
    public StudyDto createStudy(CreateRequest request) {
        // 1. Validation
        if (request.getName().isEmpty()) {
            throw new ValidationException();
        }
        
        // 2. Create entity
        StudyEntity entity = new StudyEntity();
        entity.setName(request.getName());
        entity.setStatus("PLANNING");
        
        // 3. Save (trigger fires here!)
        entity = repository.save(entity);
        
        // 4. Return DTO
        return toDto(entity);
    }
}
```

### **New Way (DDD)**
```java
// 1. Command (intent)
CreateStudyCommand command = CreateStudyCommand.builder()
    .studyId(UUID.randomUUID())
    .name(request.getName())
    .build();

// 2. Send command to aggregate
commandGateway.sendAndWait(command);

// 3. Aggregate handles it
@Aggregate
public class StudyAggregate {
    @CommandHandler
    public StudyAggregate(CreateStudyCommand command) {
        // Validation (business rules)
        if (command.getName().isEmpty()) {
            throw new IllegalArgumentException("Name required");
        }
        
        // Apply event
        AggregateLifecycle.apply(new StudyCreatedEvent(...));
    }
    
    @EventSourcingHandler
    public void on(StudyCreatedEvent event) {
        this.studyId = event.getStudyId();
        this.status = StudyStatus.PLANNING;
    }
}

// 4. Projection updates read model
@Component
public class StudyProjection {
    @EventHandler
    public void on(StudyCreatedEvent event) {
        StudyEntity entity = new StudyEntity();
        entity.setAggregateUuid(event.getStudyId());
        entity.setName(event.getName());
        repository.save(entity);
    }
}
```

---

## 📚 **Learning Path**

### **Step 1: Understanding Aggregates** (2 hours)
- Read: `PatientAggregate.java` (already implemented!)
- Read: `StudyDatabaseBuildAggregate.java` (already implemented!)
- Key concept: Business logic lives in aggregates

### **Step 2: Understanding Events** (2 hours)
- Read: `patientenrollment/domain/events/`
- Read: `studydatabase/domain/events/`
- Key concept: Events describe WHAT happened (past tense)

### **Step 3: Understanding Commands** (2 hours)
- Read: `patientenrollment/domain/commands/`
- Read: `studydatabase/domain/commands/`
- Key concept: Commands describe INTENT (what you want to do)

### **Step 4: Understanding Projections** (2 hours)
- Read: `studydatabase/projection/`
- Key concept: Projections build read models from events

### **Step 5: Practice** (4 hours)
- Implement a simple aggregate (e.g., StudyAggregate)
- Write unit tests
- See it work end-to-end

---

## 🔧 **Tools & Frameworks**

| Tool | Purpose | Already Have? |
|------|---------|---------------|
| **Axon Framework** | Event Sourcing + CQRS | ✅ Yes (4.9.1) |
| **Spring Boot** | Application framework | ✅ Yes (3.5.5) |
| **JPA/Hibernate** | Read model persistence | ✅ Yes |
| **MySQL** | Database | ✅ Yes |
| **Lombok** | Reduce boilerplate | ✅ Yes |

---

## ✅ **Success Criteria**

After migration, you should have:

- [ ] ✅ Zero database triggers for business logic
- [ ] ✅ Zero stored procedures with business rules
- [ ] ✅ All business logic in aggregates
- [ ] ✅ Complete audit trail via events
- [ ] ✅ Can replay state to any point in time
- [ ] ✅ Unit tests without database
- [ ] ✅ Read/Write separation (CQRS)
- [ ] ✅ Clear domain model
- [ ] ✅ FDA 21 CFR Part 11 compliant

---

## 📞 **Next Actions**

1. **Review** this quick reference
2. **Study** existing DDD implementations:
   - `patientenrollment` module
   - `studydatabase` module
3. **Discuss** Phase 1 approach with team
4. **Start** with pilot: StudyAggregate
5. **Validate** before full migration

**Ready to start Phase 1?** Let me know!
