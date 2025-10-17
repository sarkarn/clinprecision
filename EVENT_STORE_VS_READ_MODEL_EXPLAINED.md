# Event Store vs Read Model: When to Use What?

**Date**: October 16, 2025  
**Context**: Patient visit creation and form management in ClinPrecision

---

## Executive Summary

### Quick Answer to Your Question

**Q: When creating patient visits and forms, do we use domain_event_entry or visit_definitions?**

**A: We use `visit_definitions` and `visit_forms` (READ MODEL tables), NOT `domain_event_entry` (EVENT STORE).**

---

## Architecture Overview

ClinPrecision uses **CQRS + Event Sourcing** with Axon Framework:

```
┌──────────────────────────────────────────────────────────────────┐
│                         WRITE SIDE                                │
│                                                                    │
│  User Action → Command → Aggregate → Event → EVENT STORE          │
│                                        ↓                           │
│                                 domain_event_entry                 │
│                                 (SOURCE OF TRUTH)                  │
└──────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────┐
│                        PROJECTORS                                 │
│                                                                    │
│  Event → Deserialize → Update Read Model Tables                   │
└──────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────┐
│                         READ SIDE                                 │
│                                                                    │
│  Query → visit_definitions, visit_forms, etc.                     │
│          (OPTIMIZED FOR QUERIES)                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Event Store Tables (Immutable Audit Trail)

### domain_event_entry Table

**Purpose**: Immutable event store - the **source of truth** for all changes

**Structure**:
```sql
CREATE TABLE domain_event_entry (
    global_index BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    meta_data LONGBLOB,           -- ← Contextual info about event
    payload LONGBLOB NOT NULL,    -- ← Serialized event object
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    
    UNIQUE KEY (aggregate_identifier, sequence_number)
);
```

### Column: `payload` (LONGBLOB)

**Contains**: Serialized domain event (Java object → JSON/Binary)

**Example: VisitDefinedEvent stored in payload**:
```json
{
  "eventType": "com.clinprecision.studydesign.events.VisitDefinedEvent",
  "aggregateId": "study-design-uuid-12345",
  "visitUuid": "visit-uuid-67890",
  "visitName": "Baseline Visit",
  "timepoint": 0,
  "windowBefore": 0,
  "windowAfter": 7,
  "visitType": "BASELINE",
  "isRequired": true,
  "sequenceNumber": 42,
  "timestamp": "2025-10-16T10:30:00Z"
}
```

**Example: FormAssignedToVisitEvent stored in payload**:
```json
{
  "eventType": "com.clinprecision.studydesign.events.FormAssignedToVisitEvent",
  "aggregateId": "study-design-uuid-12345",
  "assignmentUuid": "assignment-uuid-abcdef",
  "visitUuid": "visit-uuid-67890",
  "formUuid": "form-uuid-11111",
  "isRequired": true,
  "displayOrder": 1,
  "sequenceNumber": 43,
  "timestamp": "2025-10-16T10:31:00Z"
}
```

### Column: `meta_data` (LONGBLOB)

**Contains**: WHO, WHEN, WHY, WHERE about the event

**Example metadata**:
```json
{
  "userId": 12345,
  "username": "dr.smith@hospital.com",
  "correlationId": "http-request-uuid-xyz",
  "causationId": "command-uuid-abc",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 Chrome/118.0.0.0",
  "timestamp": "2025-10-16T10:30:00.123Z",
  "traceId": "distributed-trace-id-789",
  "command": "DefineVisitCommand",
  "studyId": 101,
  "studyName": "Phase III Trial"
}
```

### When domain_event_entry IS Used

1. **Aggregate Rehydration**: Load aggregate from events
   ```java
   // Load StudyDesignAggregate from event store
   List<DomainEventMessage<?>> events = eventStore.readEvents(aggregateId);
   StudyDesignAggregate aggregate = new StudyDesignAggregate();
   aggregate.initializeState(events); // Replay all events
   ```

2. **Audit Trail Queries**: "Who added Baseline Visit on Oct 15?"
   ```java
   // Query events for audit trail
   SELECT meta_data, payload, time_stamp
   FROM domain_event_entry
   WHERE aggregate_identifier = 'study-design-uuid-12345'
     AND payload_type LIKE '%VisitDefinedEvent%'
   ORDER BY sequence_number;
   ```

3. **Temporal Queries**: "What did the study design look like on March 1, 2025?"
   ```java
   // Replay events up to specific date
   List<DomainEventMessage<?>> eventsUpToDate = 
       eventStore.readEvents(aggregateId, 0, maxSequence);
   StudyDesignAggregate historicalState = new StudyDesignAggregate();
   historicalState.initializeState(eventsUpToDate);
   // Now you have study state as it was on March 1
   ```

4. **Projection Rebuild**: Rebuild read model from scratch
   ```java
   // If visit_definitions table is corrupted, rebuild it
   List<DomainEventMessage<?>> allEvents = eventStore.readEvents();
   for (DomainEventMessage<?> eventMsg : allEvents) {
       if (eventMsg.getPayload() instanceof VisitDefinedEvent) {
           VisitDefinedEvent event = (VisitDefinedEvent) eventMsg.getPayload();
           // Recreate visit_definitions row from event
           projector.on(event);
       }
   }
   ```

5. **Debugging**: Reproduce bugs by replaying events
   ```java
   // Debug: Why is visit missing?
   List<DomainEventMessage<?>> events = eventStore.readEvents(aggregateId);
   for (DomainEventMessage<?> event : events) {
       System.out.println("Event: " + event.getPayloadType() + 
                         " at " + event.getTimestamp());
   }
   // Find VisitDefinedEvent → VisitRemovedEvent → Understand what happened
   ```

### When domain_event_entry IS NOT Used

❌ **NOT for queries**: Never query event store for patient visit creation  
❌ **NOT for UI display**: Never deserialize payloads for form lists  
❌ **NOT for reports**: Never parse meta_data for analytics  
❌ **NOT for joins**: Never join domain_event_entry with other tables

**Why?**
- **Performance**: Deserializing BLOBs is SLOW
- **Complexity**: Events are Java objects, not relational data
- **Not designed for queries**: No indexes on payload content

---

## Part 2: Snapshot Tables (Performance Optimization)

### snapshot_event_entry Table

**Purpose**: Periodic checkpoints to speed up aggregate loading

**Structure**:
```sql
CREATE TABLE snapshot_event_entry (
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    meta_data LONGBLOB,        -- ← Snapshot metadata
    payload LONGBLOB NOT NULL, -- ← Serialized aggregate state
    time_stamp VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (aggregate_identifier, sequence_number)
);
```

### Column: `payload` (LONGBLOB)

**Contains**: Complete aggregate state at a point in time

**Example: StudyDesignAggregate snapshot**:
```json
{
  "aggregateType": "StudyDesignAggregate",
  "aggregateId": "study-design-uuid-12345",
  "sequenceNumber": 1500,
  "timestamp": "2025-10-16T10:30:00Z",
  "state": {
    "studyId": 101,
    "studyName": "Phase III Trial",
    "version": 1,
    "visits": [
      {
        "visitUuid": "visit-uuid-1",
        "name": "Screening",
        "timepoint": -7,
        "windowBefore": 0,
        "windowAfter": 3,
        "visitType": "SCREENING",
        "isRequired": true,
        "isDeleted": false
      },
      {
        "visitUuid": "visit-uuid-2",
        "name": "Baseline",
        "timepoint": 0,
        "windowBefore": 0,
        "windowAfter": 7,
        "visitType": "BASELINE",
        "isRequired": true,
        "isDeleted": false
      },
      {
        "visitUuid": "visit-uuid-3",
        "name": "Week 4",
        "timepoint": 28,
        "windowBefore": 3,
        "windowAfter": 3,
        "visitType": "TREATMENT",
        "isRequired": true,
        "isDeleted": false
      }
    ],
    "forms": [...],
    "visitFormAssignments": [
      {
        "assignmentUuid": "assignment-1",
        "visitUuid": "visit-uuid-2",
        "formUuid": "form-uuid-1",
        "isRequired": true,
        "displayOrder": 1
      }
    ]
  }
}
```

### Column: `meta_data` (LONGBLOB)

**Contains**: Why and when snapshot was taken

**Example**:
```json
{
  "snapshotTrigger": "EVENT_COUNT_THRESHOLD",
  "eventCountAtSnapshot": 1500,
  "snapshotStrategy": "EVERY_N_EVENTS",
  "threshold": 100,
  "previousSnapshotSequence": 1400,
  "aggregateType": "StudyDesignAggregate",
  "snapshotCreatedAt": "2025-10-16T10:30:00Z",
  "snapshotCreatedBy": "system-snapshotter"
}
```

### When Snapshots Are Used

**Problem**: Large aggregates take too long to rebuild

```java
// Without snapshot: SLOW (replay 10,000 events)
List<DomainEventMessage<?>> allEvents = 
    eventStore.readEvents(aggregateId, 0, Long.MAX_VALUE);
aggregate.initializeState(allEvents); // Takes 5 seconds!

// With snapshot: FAST (load snapshot + replay 100 events)
Optional<DomainEventMessage<?>> snapshot = 
    eventStore.readSnapshot(aggregateId);
if (snapshot.isPresent()) {
    aggregate.initializeState(snapshot.get()); // Load at sequence 9900
    List<DomainEventMessage<?>> recentEvents = 
        eventStore.readEvents(aggregateId, 9901, Long.MAX_VALUE);
    aggregate.apply(recentEvents); // Only 100 events - Takes 0.05 seconds!
}
```

**When snapshot is created**:
- Every N events (e.g., every 100 events)
- After N minutes of inactivity
- Manual trigger (e.g., after major protocol amendment)

---

## Part 3: Read Model Tables (Query Optimization)

### visit_definitions Table

**Purpose**: Fast queries for patient visit creation

**Structure**:
```sql
CREATE TABLE visit_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_uuid VARCHAR(255),  -- Link to StudyDesignAggregate
    build_id BIGINT,              -- Protocol version
    visit_uuid VARCHAR(255),      -- Business UUID from event
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timepoint INT NOT NULL,       -- Days from baseline
    window_before INT DEFAULT 0,
    window_after INT DEFAULT 0,
    visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP'),
    is_required BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    sequence_number INT,
    created_at TIMESTAMP,
    
    INDEX idx_study (study_id),
    INDEX idx_build (build_id),
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id)
);
```

**Created by**: `VisitDefinitionProjector` listening to `VisitDefinedEvent`

**Projector code**:
```java
@EventHandler
public void on(VisitDefinedEvent event) {
    VisitDefinitionEntity entity = VisitDefinitionEntity.builder()
        .aggregateUuid(event.getAggregateId())
        .visitUuid(event.getVisitUuid())
        .studyId(event.getStudyId())
        .name(event.getVisitName())
        .timepoint(event.getTimepoint())
        .windowBefore(event.getWindowBefore())
        .windowAfter(event.getWindowAfter())
        .visitType(event.getVisitType())
        .isRequired(event.getIsRequired())
        .build();
    
    visitDefinitionRepository.save(entity);
    // ↑ This creates row in visit_definitions table
}
```

### visit_forms Table

**Purpose**: Fast queries for form assignments

**Structure**:
```sql
CREATE TABLE visit_forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_uuid VARCHAR(255),
    build_id BIGINT,
    assignment_uuid VARCHAR(255),
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id)
);
```

---

## Part 4: Real Code Example - Patient Visit Creation

### Actual Code from ProtocolVisitInstantiationService.java

```java
/**
 * Creates visit instances from protocol schedule.
 * 
 * THIS IS WHERE YOUR QUESTION IS ANSWERED!
 */
@Transactional
public List<StudyVisitInstanceEntity> instantiateProtocolVisits(
        Long patientId,
        Long studyId,
        Long siteId,
        Long armId,
        LocalDate baselineDate) {

    log.info("Instantiating protocol visits for patient: {}", patientId);

    // STEP 1: Get active study database build
    StudyDatabaseBuildEntity activeBuild = getActiveStudyBuild(studyId);
    
    if (activeBuild == null) {
        throw new IllegalStateException("No active build found");
    }
    
    log.info("Using build: id={}, version={}", 
             activeBuild.getId(), activeBuild.getBuildRequestId());

    // STEP 2: Query visit_definitions for this study (READ MODEL)
    // ✅ THIS IS THE ANSWER: We query visit_definitions, NOT domain_event_entry
    List<VisitDefinitionEntity> protocolVisits = getProtocolVisits(studyId, armId);

    if (protocolVisits.isEmpty()) {
        log.warn("No protocol visits found for studyId: {}", studyId);
        return List.of();
    }

    log.info("Found {} protocol visits to instantiate", protocolVisits.size());

    // STEP 3: For each protocol visit, create study_visit_instance
    List<StudyVisitInstanceEntity> instances = new ArrayList<>();

    for (VisitDefinitionEntity visitDef : protocolVisits) {
        // Create visit instance FROM visit_definition (READ MODEL)
        StudyVisitInstanceEntity instance = createVisitInstance(
                patientId,
                studyId,
                siteId,
                visitDef,        // ← Using visit_definitions data
                baselineDate,
                activeBuild.getId()
        );

        instances.add(studyVisitInstanceRepository.save(instance));

        log.debug("Created visit instance: name={}, date={}, buildId={}",
                visitDef.getName(), instance.getVisitDate(), activeBuild.getId());
    }

    return instances;
}

/**
 * Get protocol visits for study
 * ✅ QUERIES READ MODEL, NOT EVENT STORE
 */
private List<VisitDefinitionEntity> getProtocolVisits(Long studyId, Long armId) {
    List<VisitDefinitionEntity> protocolVisits = new ArrayList<>();

    if (armId != null) {
        // Query visit_definitions table (READ MODEL)
        List<VisitDefinitionEntity> armVisits =
                visitDefinitionRepository
                    .findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId);
        protocolVisits.addAll(armVisits);
    }

    // Query visit_definitions table (READ MODEL)
    List<VisitDefinitionEntity> commonVisits =
            visitDefinitionRepository
                .findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(studyId);
    protocolVisits.addAll(commonVisits);

    protocolVisits.sort(Comparator.comparing(VisitDefinitionEntity::getTimepoint));

    return protocolVisits;
}

/**
 * Create a visit instance from a visit definition
 * ✅ USES DATA FROM visit_definitions (READ MODEL)
 */
private StudyVisitInstanceEntity createVisitInstance(
        Long patientId,
        Long studyId,
        Long siteId,
        VisitDefinitionEntity visitDef,  // ← From visit_definitions table
        LocalDate baselineDate,
        Long buildId) {

    LocalDate visitDate = calculateVisitDate(baselineDate, visitDef.getTimepoint());

    return StudyVisitInstanceEntity.builder()
            .subjectId(patientId)
            .studyId(studyId)
            .siteId(siteId)
            .visitId(visitDef.getId())    // ← FK to visit_definitions.id
            .visitDate(visitDate)
            .visitStatus("Scheduled")
            .completionPercentage(0.0)
            .buildId(buildId)              // ← Track protocol version
            .build();
}
```

### Key Takeaway

```
❌ NEVER USED: domain_event_entry.payload
✅ ALWAYS USED: visit_definitions table

Flow:
1. Query visit_definitions (fast SQL query)
2. Loop through visit definitions
3. Create study_visit_instances (one per protocol visit)
4. Save to database

NO event store deserialization!
NO payload parsing!
NO meta_data reading!
```

---

## Part 5: Summary - When to Use What

### Use Event Store (domain_event_entry, snapshot_event_entry)

| Use Case | Example |
|----------|---------|
| **Aggregate Rehydration** | Load StudyDesignAggregate from events |
| **Audit Trail** | "Who changed visit window on Oct 15?" |
| **Temporal Queries** | "What was protocol on March 1?" |
| **Projection Rebuild** | Recreate visit_definitions from scratch |
| **Debugging** | Replay events to find bug |
| **Event Replay** | Reprocess events after bug fix |
| **Compliance** | FDA audit - prove immutable history |

### Use Read Model (visit_definitions, visit_forms, etc.)

| Use Case | Example |
|----------|---------|
| **Patient Visit Creation** | ✅ Query visit_definitions |
| **Form List Display** | ✅ Query visit_forms |
| **Visit Schedule UI** | ✅ Query visit_definitions |
| **Form Assignment Display** | ✅ Query visit_forms |
| **Reports** | ✅ Join visit_definitions + study_visit_instances |
| **Search/Filter** | ✅ WHERE clauses on indexed columns |
| **Analytics** | ✅ Aggregate functions on read model |

### Architecture Comparison

```
┌────────────────────────────────────────────────────────────┐
│                    EVENT STORE                              │
├────────────────────────────────────────────────────────────┤
│  Purpose: SOURCE OF TRUTH                                   │
│  Data: Serialized events (BLOB)                             │
│  Speed: SLOW (deserialization required)                     │
│  Use: Rehydration, audit, temporal queries                  │
│  Mutation: IMMUTABLE (append-only)                          │
│  Query: By aggregate_identifier + sequence                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    READ MODEL                               │
├────────────────────────────────────────────────────────────┤
│  Purpose: OPTIMIZED FOR QUERIES                             │
│  Data: Denormalized relational tables                       │
│  Speed: FAST (indexed columns, SQL)                         │
│  Use: UI display, reports, patient management               │
│  Mutation: MUTABLE (updated by projectors)                  │
│  Query: By any indexed column (study_id, build_id, etc.)    │
└────────────────────────────────────────────────────────────┘
```

---

## Part 6: Data Flow Diagram

### Complete Flow from Study Design to Patient Visit

```
┌────────────────────────────────────────────────────────────┐
│  STEP 1: Study Designer Defines Visit                      │
├────────────────────────────────────────────────────────────┤
│  UI: "Add Baseline Visit"                                   │
│  → POST /api/study-design/visits                            │
│  → DefineVisitCommand                                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 2: Aggregate Processes Command                        │
├────────────────────────────────────────────────────────────┤
│  StudyDesignAggregate.handle(DefineVisitCommand)            │
│  → Validate                                                  │
│  → Generate visitUuid                                        │
│  → AggregateLifecycle.apply(VisitDefinedEvent)              │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 3: Event Stored in Event Store                        │
├────────────────────────────────────────────────────────────┤
│  VisitDefinedEvent → Axon EventStore                        │
│  → Serialized to JSON/Binary                                │
│  → INSERT INTO domain_event_entry                           │
│     (payload = serialized event,                            │
│      meta_data = user/timestamp/ip)                         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 4: Projector Updates Read Model                       │
├────────────────────────────────────────────────────────────┤
│  VisitDefinitionProjector.on(VisitDefinedEvent)             │
│  → Deserialize event from payload                           │
│  → Extract: name, timepoint, window, etc.                   │
│  → INSERT INTO visit_definitions                            │
│     (name = "Baseline Visit",                               │
│      timepoint = 0,                                          │
│      window_before = 0,                                      │
│      window_after = 7)                                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 5: Patient Enrolled (weeks/months later)              │
├────────────────────────────────────────────────────────────┤
│  PatientService.enrollPatient(studyId=101, patientId=5001) │
│  → Patient status changes to ACTIVE                          │
│  → Trigger: ProtocolVisitInstantiationService               │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 6: Query Read Model (NOT EVENT STORE!)                │
├────────────────────────────────────────────────────────────┤
│  visitDefinitionRepository                                   │
│    .findByStudyIdOrderBySequenceNumberAsc(studyId=101)      │
│                                                               │
│  ✅ SQL: SELECT * FROM visit_definitions                    │
│          WHERE study_id = 101                                │
│          ORDER BY sequence_number                            │
│                                                               │
│  ❌ NOT: SELECT payload FROM domain_event_entry              │
│          WHERE aggregate_identifier = '...'                  │
│          AND payload_type = 'VisitDefinedEvent'              │
│                                                               │
│  Result: List<VisitDefinitionEntity>                         │
│    [0] → {id=1, name="Screening", timepoint=-7, ...}        │
│    [1] → {id=2, name="Baseline", timepoint=0, ...}          │
│    [2] → {id=3, name="Week 4", timepoint=28, ...}           │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 7: Create Visit Instances                             │
├────────────────────────────────────────────────────────────┤
│  For each VisitDefinitionEntity:                             │
│    visitDate = baselineDate + timepoint                      │
│    INSERT INTO study_visit_instances                         │
│      (subject_id = 5001,                                     │
│       visit_id = visitDef.id,  ← FK to visit_definitions    │
│       visit_date = calculated date,                          │
│       build_id = activeBuild.id,                             │
│       visit_status = 'Scheduled')                            │
│                                                               │
│  Result: Patient 5001 now has all protocol visits scheduled │
└────────────────────────────────────────────────────────────┘
```

---

## Part 7: Why This Architecture?

### Benefits of CQRS + Event Sourcing

1. **Separation of Concerns**
   - Write model: Focus on business logic
   - Read model: Optimized for queries

2. **Performance**
   - Event store: Append-only (fast writes)
   - Read model: Indexed tables (fast reads)

3. **Complete Audit Trail**
   - Every change captured as event
   - Immutable history
   - FDA compliance

4. **Temporal Queries**
   - Reconstruct state at any point in time
   - "What was protocol on March 1?"

5. **Flexibility**
   - Add new read models without changing write side
   - Rebuild read models from events

6. **Scalability**
   - Separate read/write databases
   - Scale reads independently

---

## Conclusion

### Direct Answer to Your Question

**When creating patient visits and displaying forms:**

✅ **USE**: `visit_definitions`, `visit_forms` (Read Model)  
❌ **DON'T USE**: `domain_event_entry.payload`, `domain_event_entry.meta_data`

**Purpose of Event Store Tables:**

| Table | Purpose |
|-------|---------|
| `domain_event_entry.payload` | Serialized event for aggregate rehydration, audit, temporal queries |
| `domain_event_entry.meta_data` | Who/when/where context for compliance and debugging |
| `snapshot_event_entry.payload` | Aggregate state checkpoint for performance |
| `snapshot_event_entry.meta_data` | Snapshot metadata (why/when taken) |

**The Pattern:**
```
Event Store = SOURCE OF TRUTH (but slow to query)
Read Model = QUERY OPTIMIZATION (fast, indexed, relational)

Use event store for: Rehydration, audit, temporal queries
Use read model for: UI, reports, patient management
```

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Maintained By**: ClinPrecision Development Team
