# Study Database Build - Architecture Diagram

## Complete CQRS/Event Sourcing Architecture (Phase 1-3)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT / REST API                              │
│                         (Phase 4 - TODO)                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMMAND SERVICE                                 │
│                         (Phase 4 - TODO)                                │
│  - Validates requests                                                   │
│  - Sends commands via CommandGateway                                    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          AXON FRAMEWORK                                 │
│                         COMMAND GATEWAY                                 │
│  - Routes commands to aggregates                                        │
│  - Handles command dispatching                                          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────────┐
        │            WRITE SIDE (Phase 1-2) ✅                  │
        │                                                        │
        │  ┌──────────────────────────────────────────────┐    │
        │  │         COMMANDS (Phase 1) ✅                │    │
        │  │  - BuildStudyDatabaseCommand                 │    │
        │  │  - ValidateStudyDatabaseCommand              │    │
        │  │  - CancelStudyDatabaseBuildCommand           │    │
        │  │  - CompleteStudyDatabaseBuildCommand         │    │
        │  └──────────────────┬───────────────────────────┘    │
        │                     ▼                                 │
        │  ┌──────────────────────────────────────────────┐    │
        │  │    AGGREGATE (Phase 2) ✅                    │    │
        │  │    StudyDatabaseBuildAggregate               │    │
        │  │  ┌────────────────────────────────────────┐  │    │
        │  │  │  @CommandHandler methods               │  │    │
        │  │  │  - handle(BuildStudyDatabaseCommand)   │  │    │
        │  │  │  - handle(ValidateStudyDatabase...)    │  │    │
        │  │  │  - handle(CancelStudyDatabase...)      │  │    │
        │  │  │  - handle(CompleteStudyDatabase...)    │  │    │
        │  │  └────────────────┬───────────────────────┘  │    │
        │  │                   │ Business Rules           │    │
        │  │                   │ Validation               │    │
        │  │                   ▼                          │    │
        │  │  ┌────────────────────────────────────────┐  │    │
        │  │  │  AggregateLifecycle.apply(Event)      │  │    │
        │  │  └────────────────┬───────────────────────┘  │    │
        │  │                   ▼                          │    │
        │  │  ┌────────────────────────────────────────┐  │    │
        │  │  │  @EventSourcingHandler methods        │  │    │
        │  │  │  - on(StudyDatabaseBuildStartedEvent) │  │    │
        │  │  │  - on(StudyDatabaseBuildCompleted...) │  │    │
        │  │  │  - on(StudyDatabaseBuildFailed...)    │  │    │
        │  │  │  - on(StudyDatabaseBuildCancelled...) │  │    │
        │  │  │  - on(StudyDatabaseValidation...)     │  │    │
        │  │  └────────────────────────────────────────┘  │    │
        │  └──────────────────────────────────────────────┘    │
        │                     │                                 │
        │                     ▼                                 │
        │  ┌──────────────────────────────────────────────┐    │
        │  │         EVENTS (Phase 1) ✅                  │    │
        │  │  - StudyDatabaseBuildStartedEvent            │    │
        │  │  - StudyDatabaseBuildCompletedEvent          │    │
        │  │  - StudyDatabaseBuildFailedEvent             │    │
        │  │  - StudyDatabaseBuildCancelledEvent          │    │
        │  │  - StudyDatabaseValidationCompletedEvent     │    │
        │  └──────────────────┬───────────────────────────┘    │
        └────────────────────┼────────────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────────────┐
        │             AXON EVENT STORE (MySQL)                │
        │  - domain_event_entry                               │
        │  - Stores all events with Jackson serialization     │
        │  - Provides complete audit trail                    │
        └─────────────────────┬───────────────────────────────┘
                             │
                             │ Event Bus
                             │
                             ▼
        ┌───────────────────────────────────────────────────────┐
        │            READ SIDE (Phase 3) ✅                     │
        │                                                        │
        │  ┌──────────────────────────────────────────────┐    │
        │  │   PROJECTION HANDLER (Phase 3) ✅            │    │
        │  │   StudyDatabaseBuildProjectionHandler        │    │
        │  │   @ProcessingGroup("studydatabase-projection")│   │
        │  │  ┌────────────────────────────────────────┐  │    │
        │  │  │  @EventHandler methods                 │  │    │
        │  │  │  - on(StudyDatabaseBuildStartedEvent) │  │    │
        │  │  │      → CREATE entity                   │  │    │
        │  │  │  - on(StudyDatabaseBuildCompleted...) │  │    │
        │  │  │      → UPDATE status, metrics          │  │    │
        │  │  │  - on(StudyDatabaseBuildFailed...)    │  │    │
        │  │  │      → UPDATE status, errors           │  │    │
        │  │  │  - on(StudyDatabaseBuildCancelled...) │  │    │
        │  │  │      → UPDATE status, cancellation     │  │    │
        │  │  │  - on(StudyDatabaseValidation...)     │  │    │
        │  │  │      → UPDATE validation results       │  │    │
        │  │  └────────────────┬───────────────────────┘  │    │
        │  └─────────────────────┼──────────────────────────┘   │
        │                        ▼                               │
        │  ┌──────────────────────────────────────────────┐    │
        │  │     REPOSITORY (Phase 3) ✅                  │    │
        │  │     StudyDatabaseBuildRepository             │    │
        │  │  - findByAggregateUuid()                     │    │
        │  │  - findByBuildRequestId()                    │    │
        │  │  - findByStudyId()                           │    │
        │  │  - 20+ query methods                         │    │
        │  └────────────────────┬─────────────────────────┘    │
        │                       ▼                               │
        │  ┌──────────────────────────────────────────────┐    │
        │  │       ENTITY (Phase 3) ✅                    │    │
        │  │       StudyDatabaseBuildEntity               │    │
        │  │  - aggregate_uuid (links to aggregate)       │    │
        │  │  - build_request_id                          │    │
        │  │  - study_id, study_name, study_protocol      │    │
        │  │  - build_status, build_start_time, ...       │    │
        │  │  - All metrics and tracking fields           │    │
        │  └────────────────────┬─────────────────────────┘    │
        └────────────────────────┼────────────────────────────┘
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │           MySQL Database (clinprecision_dev)        │
        │           Table: study_database_builds              │
        │  - Stores read model for queries                    │
        │  - Optimized for read performance                   │
        │  - Indexed on key columns                           │
        └─────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │                   QUERY SERVICE                     │
        │                   (Phase 4 - TODO)                  │
        │  - Uses Repository for queries                      │
        │  - Returns DTOs to clients                          │
        └─────────────────────────────────────────────────────┘
```

---

## Event Flow Sequence

### 1. Build Started Flow
```
Client
  │
  ▼ BuildStudyDatabaseCommand
CommandService
  │
  ▼ CommandGateway.send()
StudyDatabaseBuildAggregate
  │ @CommandHandler
  ▼ validates & applies
StudyDatabaseBuildStartedEvent
  │
  ├──▶ Event Store (persisted)
  │
  └──▶ ProjectionHandler
       │ @EventHandler
       ▼ creates entity
     Repository.save()
       │
       ▼
   MySQL Database
```

### 2. Build Completed Flow
```
System/Process
  │
  ▼ CompleteStudyDatabaseBuildCommand
CommandService
  │
  ▼ CommandGateway.send()
StudyDatabaseBuildAggregate
  │ @CommandHandler
  │ checks status = IN_PROGRESS
  ▼ applies
StudyDatabaseBuildCompletedEvent
  │
  ├──▶ Event Store (persisted)
  │
  └──▶ ProjectionHandler
       │ @EventHandler
       ▼ updates entity
     Repository.save()
       │
       ▼ status = COMPLETED
   MySQL Database
```

### 3. Query Flow (Read Side)
```
Client
  │
  ▼ GET /api/builds/{id}
QueryService
  │
  ▼ findByBuildRequestId()
Repository
  │
  ▼ SELECT * FROM study_database_builds
MySQL Database
  │
  ▼ StudyDatabaseBuildEntity
QueryService
  │ converts to DTO
  ▼
Client (JSON response)
```

---

## Key Architectural Principles

### 1. Command Query Responsibility Segregation (CQRS)
- **Write Model:** Aggregate (optimized for business rules)
- **Read Model:** Entity (optimized for queries)
- **Separation:** Complete independence

### 2. Event Sourcing
- **Events:** Immutable facts of what happened
- **Event Store:** Single source of truth
- **Replay:** Can rebuild state from events

### 3. Eventual Consistency
- **Write Side:** Synchronous command handling
- **Read Side:** Asynchronous event processing
- **Consistency:** Eventually consistent (milliseconds)

### 4. Single Responsibility
- **Commands:** Intent to change state
- **Aggregates:** Business rules and validation
- **Events:** Facts of state changes
- **Projections:** Read model updates

---

## Phase Status

✅ **Phase 1:** Commands & Events (4 commands, 5 events)  
✅ **Phase 2:** Aggregate (write model with business rules)  
✅ **Phase 3:** Projection & Repository (read model)  
⏳ **Phase 4:** Service Layer & REST API (TODO)  
⏳ **Phase 5:** Integration Tests (TODO)

---

**Architecture Complete for Phases 1-3!** ✅
