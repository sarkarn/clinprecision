# Study Build Technical Explanation

## Executive Summary

**Study Build** is a sophisticated database configuration process that "freezes" a study's protocol design (forms, visits, schedules) into a versioned, immutable snapshot. This enables:

1. **Protocol Versioning**: Multiple protocol versions for the same study (amendments, protocol changes)
2. **Data Integrity**: Patient data tied to specific protocol version they enrolled under
3. **Regulatory Compliance**: Audit trail of what protocol version was active when data was collected
4. **Multi-tenant Architecture**: Shared database tables with study isolation via `build_id`

**Technical Architecture**: Event Sourcing + CQRS + Async Worker Pattern

---

## CRITICAL DISTINCTION: Study Design vs. Study Build

### Study Design Phase (BEFORE Build)
**What happens**: User creates the protocol in the UI

| Action | Table | Example |
|--------|-------|---------|
| User designs forms | `form_definitions` | Demographics form with 10 fields |
| User creates visits | `visit_definitions` | Screening (Day 0), Baseline (Day 1), Week 4 (Day 28) |
| **User maps forms to visits** | **`visit_forms`** | **Screening requires Demographics + Vitals** |
| User defines visit timing | `visit_definitions` | Screening: timepoint=0, window_before=3, window_after=7 |

**Result**: Protocol design exists in database, but NO version tracking yet.

### Study Build Phase (Click "Build" Button)
**What happens**: System creates a versioned snapshot

| Action | Table | Example |
|--------|-------|---------|
| Create build record | `study_database_builds` | build_id=456, status=IN_PROGRESS |
| **Tag existing mappings** | **`visit_forms` (UPDATE)** | **SET build_id=456 WHERE study_id=123** |
| Extract validation rules | `study_form_validation_rules` | age: RANGE(18-85), consent_date: REQUIRED |
| Create edit checks | `study_edit_checks` | Age Range Check, Visit Date Consistency |
| Store event snapshot | `domain_event_entry` | StudyDatabaseBuildStartedEvent with full config |

**Result**: Protocol version is "frozen" with build_id. Changes to study design won't affect patients already enrolled.

### Why This Matters

```
WITHOUT BUILD (Just Study Design):
  - Patient 1 enrolls → sees current form-visit mappings
  - Protocol amended → forms/visits changed
  - Patient 1's data becomes inconsistent (expected visits changed!)

WITH BUILD (Versioned Protocol):
  - Build 1 created → form-visit mappings tagged with build_id=1
  - Patient 1 enrolls → build_id=1 stored with patient data
  - Protocol amended → Build 2 created with build_id=2
  - Patient 1's data STILL uses build_id=1 (original protocol)
  - New patients use build_id=2 (amended protocol)
```

---

## 1. The Problem Study Build Solves

### The Protocol Amendment Problem

**Scenario**: A clinical trial study changes its protocol during patient enrollment:

```
Timeline:
Day 1-100:   Protocol v1.0 - Patients 1-50 enrolled with 10 visits, 25 forms
Day 101:     Protocol Amendment 1.1 - Add 2 new safety visits, 5 new forms
Day 102-200: Protocol v1.1 - Patients 51-100 enrolled with 12 visits, 30 forms
```

**Critical Questions**:
- Which protocol version was Patient #25 enrolled under?
- When querying Patient #25's data, which visits should they have?
- If Visit 11 was added in v1.1, should Patient #25 be expected to have Visit 11?
- How do you prevent mixing protocol versions when analyzing data?

**Solution**: Study Build creates a versioned snapshot (build_id) for each protocol version.

**IMPORTANT**: Study Design vs. Study Build
- **Study Design Phase**: User creates forms, visits, and form-visit mappings (`visit_forms` table)
- **Study Build Phase**: Takes that design and creates a versioned snapshot with `build_id`

```
STUDY DESIGN PHASE (Before Build):
  form_definitions: Forms created by user
  visit_definitions: Visits created by user with schedules (timepoint, windows)
  visit_forms: Form-visit mappings created by user
  ↓
STUDY BUILD PHASE (Click "Build" button):
  study_database_builds: Create build record with build_id
  visit_forms: UPDATE existing records with build_id (tag with version)
  study_form_validation_rules: Extract validation rules from forms
  study_edit_checks: Create data quality rules
  ↓
PATIENT ENROLLMENT:
  study_visit_instances: Use build_id to know which protocol version
  study_form_data: Use build_id to tie data to protocol version
```

**Example**:
```
study_database_builds:
  build_id=1, study_id=123, protocol_version=1.0, build_date=2024-01-01, status=COMPLETED
  build_id=2, study_id=123, protocol_version=1.1, build_date=2024-04-10, status=COMPLETED

visit_forms: (CREATED during Study Design, TAGGED during Build)
  id=101, visit_id=10, form_id=1, build_id=1  ← Tagged with build 1
  id=102, visit_id=10, form_id=2, build_id=1  ← Tagged with build 1
  id=201, visit_id=10, form_id=1, build_id=2  ← Tagged with build 2 (after amendment)
  id=202, visit_id=11, form_id=5, build_id=2  ← NEW visit/form in build 2

study_visit_instances:
  patient_id=25, visit_id=5, build_id=1  ← Patient 25 uses Protocol v1.0
  patient_id=75, visit_id=5, build_id=2  ← Patient 75 uses Protocol v1.1
  patient_id=75, visit_id=11, build_id=2 ← Visit 11 only exists in v1.1
```

---

## 2. Study Build Architecture Overview

### Technology Stack

- **Event Sourcing**: Axon Framework (immutable event log)
- **CQRS**: Command/Query Separation (write vs read models)
- **Async Processing**: Spring @Async (non-blocking build execution)
- **Database**: MySQL with partitioned multi-tenant tables

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Study Build Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. API Layer
   ├── StudyDatabaseBuildController.java
   │   └── POST /api/v1/study-database/build
   │       Request: { studyId, studyName, protocolVersion, requestedBy }
   │       Response: { buildId, aggregateUuid, buildRequestId, status }

2. Command Service Layer (Orchestration)
   ├── StudyDatabaseBuildCommandService.java
   │   ├── buildStudyDatabase() - Orchestrates build initiation
   │   ├── validateStudyDatabase() - Validates completed build
   │   ├── completeStudyDatabaseBuild() - Marks build complete
   │   └── cancelStudyDatabaseBuild() - Cancels in-progress build

3. Domain Layer (Business Rules)
   ├── StudyDatabaseBuildAggregate.java (Event Sourcing Aggregate)
   │   ├── @CommandHandler BuildStudyDatabaseCommand
   │   ├── @CommandHandler CompleteStudyDatabaseBuildCommand
   │   ├── @CommandHandler ValidateStudyDatabaseCommand
   │   ├── @CommandHandler CancelStudyDatabaseBuildCommand
   │   ├── @EventSourcingHandler StudyDatabaseBuildStartedEvent
   │   ├── @EventSourcingHandler StudyDatabaseBuildCompletedEvent
   │   ├── @EventSourcingHandler StudyDatabaseBuildFailedEvent
   │   └── @EventSourcingHandler StudyDatabaseBuildCancelledEvent

4. Worker Service Layer (Async Execution)
   ├── StudyDatabaseBuildWorkerService.java
   │   └── @Async @EventHandler onBuildStarted()
   │       ├── Phase 1: Validate Study Design (forms, visits, arms)
   │       ├── Phase 2: Create Form-Visit Mappings & Validation Rules
   │       ├── Phase 3: Create Visit Schedules
   │       ├── Phase 4: Configure Edit Checks & Indexes
   │       └── Phase 5: Complete Build → Send CompleteCommand

5. Projection Layer (Read Model)
   ├── StudyDatabaseBuildProjectionHandler.java
   │   ├── @EventHandler on(StudyDatabaseBuildStartedEvent)
   │   ├── @EventHandler on(StudyDatabaseBuildCompletedEvent)
   │   ├── @EventHandler on(StudyDatabaseBuildFailedEvent)
   │   └── @EventHandler on(StudyDatabaseBuildCancelledEvent)
   │   → Updates: study_database_builds table (read model)

6. Event Store (Immutable Audit Trail)
   ├── domain_event_entry (all events, never deleted)
   ├── snapshot_event_entry (performance optimization)
   └── Provides: Complete audit trail for FDA compliance
```

---

## 3. Technical Process: Step-by-Step

### User Action: "Build Study Database" Button Clicked

**IMPORTANT**: By the time you click "Build", the study design is already complete:
- ✅ Forms created (`form_definitions` table)
- ✅ Visits created (`visit_definitions` table)
- ✅ **Form-visit mappings ALREADY EXIST** (`visit_forms` table - created during Study Design Phase)
- ✅ Visit schedules defined (timepoint, windows in `visit_definitions`)

**What Build Does**: Takes this existing design and creates a versioned snapshot with `build_id`.

**Frontend**:
```javascript
// BuildStudyDatabaseDialog.jsx
const handleBuildDatabase = async () => {
  const buildRequest = {
    studyId: 123,
    studyName: "ONCOLOGY-2024-01",
    studyProtocol: "PROTO-ABC-2024",
    requestedBy: currentUserId  // User ID from session
  };
  
  const response = await axios.post('/api/v1/study-database/build', buildRequest);
  // response: { id: 456, aggregateUuid: "uuid-123", buildRequestId: "BUILD-123-1705000000" }
};
```

---

### Step 1: API Request → Command Service

**StudyDatabaseBuildController.java**:
```java
@PostMapping("/build")
public ResponseEntity<StudyDatabaseBuildDto> buildStudyDatabase(
    @RequestBody BuildStudyDatabaseRequestDto request) {
    
    // Delegate to command service
    StudyDatabaseBuildDto result = commandService.buildStudyDatabase(request);
    return ResponseEntity.ok(result);
}
```

**StudyDatabaseBuildCommandService.java** (lines 51-106):
```java
public StudyDatabaseBuildDto buildStudyDatabase(BuildStudyDatabaseRequestDto requestDto) {
    log.info("Building study database for study: {}", requestDto.getStudyId());
    
    // ========================================
    // 1. Check for Existing In-Progress Build
    // ========================================
    // Business Rule: Only ONE build per study at a time
    boolean hasActiveBuild = buildRepository.existsByStudyIdAndBuildStatus(
        requestDto.getStudyId(), 
        StudyDatabaseBuildStatus.IN_PROGRESS
    );
    
    if (hasActiveBuild) {
        throw new IllegalStateException(
            "Study already has an in-progress build. " +
            "Please wait for it to complete or cancel it."
        );
    }
    
    // ========================================
    // 2. Generate UUIDs and Request ID
    // ========================================
    UUID studyDatabaseBuildId = UUID.randomUUID();  // Aggregate UUID (event store)
    String buildRequestId = "BUILD-" + requestDto.getStudyId() + "-" + System.currentTimeMillis();
    // Example: BUILD-123-1705000000
    
    // ========================================
    // 3. Seed Read Model Upfront (Performance)
    // ========================================
    // Problem: Projection handler might be slow, causing UI timeout
    // Solution: Pre-create minimal entity so UI can find it immediately
    seedReadModel(studyDatabaseBuildId.toString(), buildRequestId, requestDto);
    
    // ========================================
    // 4. Send Build Command to Aggregate
    // ========================================
    sendBuildCommand(studyDatabaseBuildId, buildRequestId, requestDto);
    
    // ========================================
    // 5. Wait for Projection (Polling)
    // ========================================
    // Wait up to 15 seconds for projection handler to update read model
    StudyDatabaseBuildEntity entity = waitForBuildProjection(
        studyDatabaseBuildId.toString(), 
        15000
    );
    
    // ========================================
    // 6. Return DTO to UI
    // ========================================
    return mapToDto(entity);
}
```

---

### Step 2: Send Build Command (Detailed)

**sendBuildCommand()** method (lines 320-451):

```java
private void sendBuildCommand(
    UUID studyDatabaseBuildId,
    String buildRequestId,
    BuildStudyDatabaseRequestDto requestDto) {
    
    Long studyId = requestDto.getStudyId();
    
    // ========================================
    // 1. Fetch Study Design Data
    // ========================================
    // CRITICAL: This is what gets "frozen" into the build
    
    // A. Fetch ALL form definitions for this study
    List<FormDefinitionEntity> formDefinitions = 
        formDefinitionRepository.findByStudyId(studyId);
    // Example: [
    //   {id: 1, name: "Demographics", fields: "[{...}]", version: "1.0"},
    //   {id: 2, name: "Vital Signs", fields: "[{...}]", version: "1.0"},
    //   {id: 3, name: "Adverse Events", fields: "[{...}]", version: "1.2"}
    // ]
    
    // B. Fetch ALL visit definitions for this study
    List<VisitDefinitionEntity> visitDefinitions =
        visitDefinitionRepository.findByStudyIdOrderBySequenceNumberAsc(studyId);
    // Example: [
    //   {id: 10, name: "Screening", visitType: "SCREENING", timepoint: 0, sequence: 1},
    //   {id: 11, name: "Baseline", visitType: "BASELINE", timepoint: 1, sequence: 2},
    //   {id: 12, name: "Week 4", visitType: "FOLLOW_UP", timepoint: 28, sequence: 3}
    // ]
    
    // C. Fetch ALL study arms
    List<StudyArmEntity> studyArms =
        studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
    // Example: [
    //   {id: 5, name: "Treatment A", type: "EXPERIMENTAL", plannedSubjects: 50},
    //   {id: 6, name: "Placebo", type: "CONTROL", plannedSubjects: 50}
    // ]
    
    // ========================================
    // 2. Build Study Design Configuration
    // ========================================
    // This Map<String, Object> captures EVERYTHING about the protocol version
    Map<String, Object> studyDesignConfig = new HashMap<>();
    
    // Add forms to configuration
    List<Map<String, Object>> forms = new ArrayList<>();
    for (FormDefinitionEntity form : formDefinitions) {
        Map<String, Object> formData = new HashMap<>();
        formData.put("id", form.getId());
        formData.put("name", form.getName());
        formData.put("fields", form.getFields());        // JSON string with ALL field definitions
        formData.put("structure", form.getStructure());  // JSON string with form layout
        formData.put("version", form.getVersion());      // Form version (e.g., "1.2")
        forms.add(formData);
    }
    studyDesignConfig.put("forms", forms);
    
    // Add visits to configuration
    List<Map<String, Object>> visits = new ArrayList<>();
    for (VisitDefinitionEntity visit : visitDefinitions) {
        Map<String, Object> visitData = new HashMap<>();
        visitData.put("id", visit.getId());
        visitData.put("name", visit.getName());
        visitData.put("visitType", visit.getVisitType().name());
        visitData.put("timepoint", visit.getTimepoint());     // Days from enrollment
        visitData.put("windowBefore", visit.getWindowBefore()); // -3 days
        visitData.put("windowAfter", visit.getWindowAfter());   // +7 days
        visits.add(visitData);
    }
    studyDesignConfig.put("visits", visits);
    
    // Add study arms to configuration
    studyDesignConfig.put("arms", /* similar structure */);
    
    // ========================================
    // 3. Create Validation Rules Configuration
    // ========================================
    Map<String, Object> validationRules = new HashMap<>();
    List<Map<String, Object>> rules = new ArrayList<>();
    
    for (FormDefinitionEntity form : formDefinitions) {
        Map<String, Object> rule = new HashMap<>();
        rule.put("formId", form.getId());
        rule.put("ruleType", "REQUIRED");
        rule.put("message", "Required fields must be completed for " + form.getName());
        rules.add(rule);
    }
    validationRules.put("rules", rules);
    
    // ========================================
    // 4. Create and Send Command
    // ========================================
    BuildStudyDatabaseCommand command = BuildStudyDatabaseCommand.builder()
        .studyDatabaseBuildId(studyDatabaseBuildId)
        .studyId(requestDto.getStudyId())
        .studyName(requestDto.getStudyName())
        .studyProtocol(requestDto.getStudyProtocol())
        .requestedBy(requestDto.getRequestedBy())
        .buildRequestId(buildRequestId)
        .studyDesignConfiguration(studyDesignConfig)  // ← ALL protocol design data
        .validationRules(validationRules)
        .build();
    
    // Send command to Axon CommandGateway (async)
    CompletableFuture<Void> future = commandGateway.send(command);
    future.get(10, TimeUnit.SECONDS);  // Wait max 10 seconds for command to complete
}
```

**Key Insight**: `studyDesignConfiguration` is a **complete snapshot** of the protocol at this moment. This is what gets versioned.

---

### Step 3: Aggregate Handles Command

**StudyDatabaseBuildAggregate.java** (lines 72-105):

```java
@Aggregate
public class StudyDatabaseBuildAggregate {
    
    @AggregateIdentifier
    private UUID studyDatabaseBuildId;
    
    private Long studyId;
    private String studyName;
    private String buildRequestId;
    private StudyDatabaseBuildStatus buildStatus;
    private Map<String, Object> studyDesignConfiguration;
    
    // ========================================
    // Command Handler: BuildStudyDatabaseCommand
    // ========================================
    // This is the WRITE MODEL - applies business rules
    
    @CommandHandler
    public StudyDatabaseBuildAggregate(BuildStudyDatabaseCommand command) {
        log.info("Handling BuildStudyDatabaseCommand for study: {}", command.getStudyId());
        
        // ========================================
        // Business Rule Validations
        // ========================================
        
        // 1. Validate study ID exists
        if (command.getStudyId() == null || command.getStudyId() <= 0) {
            throw new IllegalArgumentException("Study ID is required");
        }
        
        // 2. Validate study design configuration exists
        if (command.getStudyDesignConfiguration() == null || 
            command.getStudyDesignConfiguration().isEmpty()) {
            throw new IllegalArgumentException(
                "Study design configuration is required for database build"
            );
        }
        
        // 3. Validate forms exist
        Map<String, Object> designConfig = command.getStudyDesignConfiguration();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> forms = 
            (List<Map<String, Object>>) designConfig.get("forms");
        
        if (forms == null || forms.isEmpty()) {
            throw new IllegalArgumentException(
                "At least one form is required to build study database"
            );
        }
        
        // ========================================
        // Apply Event: StudyDatabaseBuildStartedEvent
        // ========================================
        // If validations pass, apply the event
        AggregateLifecycle.apply(StudyDatabaseBuildStartedEvent.builder()
            .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
            .studyId(command.getStudyId())
            .studyName(command.getStudyName())
            .studyProtocol(command.getStudyProtocol())
            .buildRequestId(command.getBuildRequestId())
            .requestedBy(command.getRequestedBy())
            .buildConfiguration(command.getStudyDesignConfiguration())
            .validationRulesConfiguration(command.getValidationRules())
            .startedAt(LocalDateTime.now())
            .build());
        
        log.info("StudyDatabaseBuildStartedEvent applied for build: {}", 
                 command.getStudyDatabaseBuildId());
    }
    
    // ========================================
    // Event Sourcing Handler: Updates Aggregate State
    // ========================================
    @EventSourcingHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        // Update aggregate state from event
        this.studyDatabaseBuildId = event.getStudyDatabaseBuildId();
        this.studyId = event.getStudyId();
        this.studyName = event.getStudyName();
        this.buildRequestId = event.getBuildRequestId();
        this.buildStatus = StudyDatabaseBuildStatus.IN_PROGRESS;
        this.studyDesignConfiguration = event.getBuildConfiguration();
        
        log.info("Aggregate state updated from StudyDatabaseBuildStartedEvent");
    }
}
```

**What Just Happened**:
1. ✅ Command validated (business rules enforced)
2. ✅ Event applied (StudyDatabaseBuildStartedEvent)
3. ✅ Event stored in `domain_event_entry` (immutable audit trail)
4. ✅ Aggregate state updated
5. ✅ Event published to event bus → triggers downstream handlers

---

### Step 4: Projection Handler Updates Read Model

**StudyDatabaseBuildProjectionHandler.java** (lines 49-79):

```java
@Component
@ProcessingGroup("studydatabase-projection")
public class StudyDatabaseBuildProjectionHandler {
    
    @Autowired
    private StudyDatabaseBuildRepository buildRepository;
    
    // ========================================
    // Event Handler: StudyDatabaseBuildStartedEvent
    // ========================================
    // This updates the READ MODEL (study_database_builds table)
    
    @EventHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        log.info("Processing StudyDatabaseBuildStartedEvent for build: {}", 
                 event.getStudyDatabaseBuildId());
        
        // Check if entity already exists (idempotency)
        Optional<StudyDatabaseBuildEntity> existing = 
            buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
        
        if (existing.isPresent()) {
            // Update existing entity (event replay scenario)
            StudyDatabaseBuildEntity entity = existing.get();
            updateFromStartedEvent(entity, event);
            buildRepository.save(entity);
        } else {
            // Create new entity
            StudyDatabaseBuildEntity newEntity = StudyDatabaseBuildEntity.builder()
                .aggregateUuid(event.getStudyDatabaseBuildId().toString())
                .buildRequestId(event.getBuildRequestId())
                .studyId(event.getStudyId())
                .studyName(event.getStudyName())
                .studyProtocol(event.getStudyProtocol())
                .buildStatus(StudyDatabaseBuildStatus.IN_PROGRESS)
                .buildStartTime(event.getStartedAt())
                .requestedBy(event.getRequestedBy())
                .buildConfiguration(formatBuildConfiguration(event.getBuildConfiguration()))
                .tablesCreated(0)
                .indexesCreated(0)
                .triggersCreated(0)
                .formsConfigured(0)
                .validationRulesCreated(0)
                .createdAt(event.getStartedAt())
                .build();
            
            buildRepository.save(newEntity);
        }
        
        log.info("READ MODEL updated: study_database_builds table");
    }
}
```

**Database State After Projection**:
```sql
-- study_database_builds table
INSERT INTO study_database_builds (
    id,                     -- Auto-increment: 456
    aggregate_uuid,         -- "uuid-123"
    build_request_id,       -- "BUILD-123-1705000000"
    study_id,               -- 123
    study_name,             -- "ONCOLOGY-2024-01"
    study_protocol,         -- "PROTO-ABC-2024"
    build_status,           -- "IN_PROGRESS"
    build_start_time,       -- 2024-01-01 10:00:00
    requested_by,           -- User ID: 42
    tables_created,         -- 0 (initial)
    indexes_created,        -- 0 (initial)
    triggers_created,       -- 0 (initial)
    forms_configured,       -- 0 (initial)
    validation_rules_created -- 0 (initial)
);
```

---

### Step 5: Worker Service Executes Build Async

**StudyDatabaseBuildWorkerService.java** (lines 85-120):

```java
@Service
@RequiredArgsConstructor
public class StudyDatabaseBuildWorkerService {
    
    // ========================================
    // Event Handler: Async Build Execution
    // ========================================
    // This runs in a SEPARATE THREAD POOL
    // Does NOT block the HTTP response
    
    @Async("databaseBuildExecutor")
    @EventHandler
    public void onBuildStarted(StudyDatabaseBuildStartedEvent event) {
        log.info("Worker received StudyDatabaseBuildStartedEvent: buildId={}", 
                 event.getStudyDatabaseBuildId());
        
        // ========================================
        // Idempotency Check (Event Replay Safety)
        // ========================================
        // Problem: If service restarts, Axon replays ALL events
        // Solution: Check if build already completed, skip if so
        
        Optional<StudyDatabaseBuildEntity> buildOpt = 
            buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
        
        if (buildOpt.isPresent()) {
            StudyDatabaseBuildEntity build = buildOpt.get();
            if (build.getBuildStatus() == StudyDatabaseBuildStatus.COMPLETED || 
                build.getBuildStatus() == StudyDatabaseBuildStatus.FAILED) {
                log.info("Build already in terminal state ({}), skipping execution", 
                         build.getBuildStatus());
                return;  // ← Skip re-execution
            }
        }
        
        try {
            // ========================================
            // Execute the Build Process
            // ========================================
            executeBuild(event);
            
        } catch (Exception e) {
            log.error("Database build failed: {}", e.getMessage(), e);
            updateBuildFailure(event.getStudyDatabaseBuildId(), e.getMessage());
            // TODO: Fire BuildFailedEvent via CommandGateway
        }
    }
}
```

---

### Step 6: Build Execution (5 Phases)

**executeBuild()** method (lines 125-430):

```java
private void executeBuild(StudyDatabaseBuildStartedEvent event) {
    UUID buildId = event.getStudyDatabaseBuildId();
    Long studyId = event.getStudyId();
    
    // Counters
    int formsConfigured = 0;
    int mappingsCreated = 0;
    int validationRulesCreated = 0;
    int schedulesCreated = 0;
    int editChecksCreated = 0;
    int indexesCreated = 0;
    
    // ========================================
    // PHASE 1: Validate Study Design (0-20%)
    // ========================================
    log.info("Phase 1: Validating study design for studyId={}", studyId);
    
    // NOTE: These entities ALREADY EXIST from Study Design Phase:
    // - form_definitions table (created when user designed forms)
    // - visit_definitions table (created when user designed visits)
    // - visit_forms table (created when user mapped forms to visits)
    // Build just VALIDATES and creates a versioned SNAPSHOT
    
    List<FormDefinitionEntity> forms = formDefinitionRepository.findByStudyId(studyId);
    List<VisitDefinitionEntity> visits = visitDefinitionRepository.findByStudyIdOrderBySequenceNumberAsc(studyId);
    List<StudyArmEntity> arms = studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
    List<VisitFormEntity> existingMappings = visitFormRepository.findByVisitDefinition_StudyId(studyId);
    
    // Validation: Must have forms, visits, AND form-visit mappings
    if (forms.isEmpty()) {
        throw new IllegalStateException("No forms found for study " + studyId);
    }
    if (visits.isEmpty()) {
        throw new IllegalStateException("No visits found for study " + studyId);
    }
    if (existingMappings.isEmpty()) {
        throw new IllegalStateException("No form-visit mappings found. Please complete Study Design first.");
    }
    
    log.info("Found {} forms, {} visits, {} arms, {} form-visit mappings", 
             forms.size(), visits.size(), arms.size(), existingMappings.size());
    
    updateProgress(buildId, formsConfigured, mappingsCreated, indexesCreated, 
                  schedulesCreated, validationRulesCreated);
    
    // ========================================
    // PHASE 2: Tag Existing Mappings with build_id (20-40%)
    // ========================================
    log.info("Phase 2: Tagging existing form-visit mappings with build_id and creating validation rules");
    
    // UPDATE existing visit_forms records with this build_id
    // This "freezes" the mappings to this protocol version
    mappingsCreated = tagFormVisitMappingsWithBuildId(studyId, buildId, existingMappings);
    // UPDATE visit_forms SET build_id = 456 
    // WHERE visit_definition_id IN (SELECT id FROM visit_definitions WHERE study_id = 123)
    
    validationRulesCreated = createValidationRules(studyId, buildId, forms);
    // INSERT INTO study_form_validation_rules (study_id, form_id, field_name, rule_type, rule_value)
    // Example: { field: "age", rule: "RANGE", value: "18-85" }
    //          { field: "consent_date", rule: "REQUIRED", value: "true" }
    
    formsConfigured = forms.size();
    
    updateProgress(buildId, formsConfigured, mappingsCreated, indexesCreated, 
                  schedulesCreated, validationRulesCreated);
    
    // ========================================
    // PHASE 3: Validate Visit Schedules (40-60%)
    // ========================================
    log.info("Phase 3: Validating visit schedules (already defined in visit_definitions)");
    
    // NOTE: Visit schedules (timepoint, window_before, window_after) are already in visit_definitions table
    // Build just VALIDATES them
    schedulesCreated = validateVisitSchedules(studyId, buildId, visits);
    // Just counts and validates existing schedule data in visit_definitions
    // Example: Visit 1 has timepoint=0, window_before=3, window_after=7 (already in DB)
    
    updateProgress(buildId, formsConfigured, mappingsCreated, indexesCreated, 
                  schedulesCreated, validationRulesCreated);
    
    // ========================================
    // PHASE 4: Configure Edit Checks (60-80%)
    // ========================================
    log.info("Phase 4: Configuring data quality and compliance rules");
    
    editChecksCreated = createEditChecks(studyId, buildId, forms, visits);
    // INSERT INTO study_edit_checks (study_id, check_name, check_type, check_logic, severity)
    // Example: Age Range Check (RANGE): age between 18-85
    //          Visit Date Consistency (CONSISTENCY): visit_date >= consent_date
    
    indexesCreated = createStudySpecificIndexes(studyId, forms, visits);
    // Note: Most indexes already exist on shared tables
    // This creates any study-specific composite indexes if needed
    
    updateProgress(buildId, formsConfigured, mappingsCreated, indexesCreated, 
                  schedulesCreated, validationRulesCreated);
    
    // ========================================
    // PHASE 5: Complete Build (80-100%)
    // ========================================
    log.info("Phase 5: Completing build");
    
    // Prepare validation results
    Map<String, Object> validationResults = new HashMap<>();
    validationResults.put("formsValidated", forms.size());
    validationResults.put("visitsValidated", visits.size());
    validationResults.put("mappingsCreated", mappingsCreated);
    validationResults.put("validationStatus", "PASSED");
    
    // Prepare build metrics
    Map<String, Object> buildMetrics = new HashMap<>();
    buildMetrics.put("totalForms", forms.size());
    buildMetrics.put("totalVisits", visits.size());
    buildMetrics.put("totalMappings", mappingsCreated);
    buildMetrics.put("totalValidationRules", validationRulesCreated);
    buildMetrics.put("architecture", "Shared multi-tenant tables with partitioning");
    
    // Create validation result data
    CompleteStudyDatabaseBuildCommand.ValidationResultData validationResult = 
        CompleteStudyDatabaseBuildCommand.ValidationResultData.builder()
            .isValid(true)
            .overallAssessment("Database build completed successfully")
            .complianceStatus("COMPLIANT")
            .performanceScore(95)
            .build();
    
    // ========================================
    // Send CompleteStudyDatabaseBuildCommand
    // ========================================
    CompleteStudyDatabaseBuildCommand completeCommand = 
        CompleteStudyDatabaseBuildCommand.builder()
            .studyDatabaseBuildId(buildId)
            .completedBy(event.getRequestedBy())
            .validationResult(validationResult)
            .formsConfigured(formsConfigured)
            .validationRulesSetup(validationRulesCreated)
            .buildMetrics(buildMetrics)
            .build();
    
    commandGateway.sendAndWait(completeCommand);  // ← Sends command back to aggregate
    
    log.info("Database build completed successfully: buildId={}, forms={}, mappings={}, rules={}", 
             buildId, formsConfigured, mappingsCreated, validationRulesCreated);
}
```

---

### Step 7: Aggregate Handles Complete Command

**StudyDatabaseBuildAggregate.java** (lines 143-192):

```java
@CommandHandler
public void handle(CompleteStudyDatabaseBuildCommand command) {
    log.info("Handling CompleteStudyDatabaseBuildCommand for build: {}", 
             command.getStudyDatabaseBuildId());
    
    // ========================================
    // Business Rule Validations
    // ========================================
    
    // 1. Validate build exists and is in progress
    if (this.buildStatus != StudyDatabaseBuildStatus.IN_PROGRESS) {
        throw new IllegalStateException(
            "Cannot complete build in status: " + this.buildStatus + 
            ". Only IN_PROGRESS builds can be completed."
        );
    }
    
    // 2. Validate validation result exists
    if (command.getValidationResult() == null) {
        throw new IllegalArgumentException(
            "Validation result is required to complete build"
        );
    }
    
    // 3. Validate forms were configured
    if (command.getFormsConfigured() == null || command.getFormsConfigured() == 0) {
        throw new IllegalArgumentException(
            "At least one form must be configured to complete build"
        );
    }
    
    // ========================================
    // Apply Event: StudyDatabaseBuildCompletedEvent
    // ========================================
    AggregateLifecycle.apply(StudyDatabaseBuildCompletedEvent.builder()
        .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
        .completedAt(LocalDateTime.now())
        .formsConfigured(command.getFormsConfigured())
        .validationRulesSetup(command.getValidationRulesSetup())
        .validationResult(/* convert to event DTO */)
        .buildMetrics(command.getBuildMetrics())
        .build());
    
    log.info("StudyDatabaseBuildCompletedEvent applied");
}

@EventSourcingHandler
public void on(StudyDatabaseBuildCompletedEvent event) {
    // Update aggregate state
    this.buildStatus = StudyDatabaseBuildStatus.COMPLETED;
    this.formsConfigured = event.getFormsConfigured();
    this.validationRulesCreated = event.getValidationRulesSetup();
    
    log.info("Aggregate state updated: Build COMPLETED");
}
```

---

### Step 8: Projection Handler Updates Read Model (Final)

**StudyDatabaseBuildProjectionHandler.java** (lines 83-120):

```java
@EventHandler
public void on(StudyDatabaseBuildCompletedEvent event) {
    log.info("Processing StudyDatabaseBuildCompletedEvent for build: {}", 
             event.getStudyDatabaseBuildId());
    
    StudyDatabaseBuildEntity entity = 
        buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString())
            .orElseThrow(() -> new IllegalStateException("Build entity not found"));
    
    // Update entity with completion details
    entity.setBuildStatus(StudyDatabaseBuildStatus.COMPLETED);
    entity.setBuildEndTime(event.getCompletedAt());
    entity.setFormsConfigured(event.getFormsConfigured());
    entity.setValidationRulesCreated(event.getValidationRulesSetup());
    entity.setValidationStatus(event.getValidationResult().getOverallAssessment());
    
    // Set build metrics
    if (event.getBuildMetrics() != null) {
        entity.setTablesCreated(getMetricAsInteger(event.getBuildMetrics().get("totalMappings")));
        entity.setIndexesCreated(getMetricAsInteger(event.getBuildMetrics().get("indexesCreated")));
        entity.setTriggersCreated(getMetricAsInteger(event.getBuildMetrics().get("schedulesCreated")));
    }
    
    buildRepository.save(entity);
    
    log.info("Build marked as COMPLETED successfully");
}
```

**Final Database State**:
```sql
-- study_database_builds table (READ MODEL)
UPDATE study_database_builds SET
    build_status = 'COMPLETED',
    build_end_time = '2024-01-01 10:05:23',
    build_duration_seconds = 323,
    forms_configured = 25,
    tables_created = 250,  -- Actually form-visit mappings
    indexes_created = 0,
    triggers_created = 12, -- Actually visit schedules
    validation_rules_created = 50,
    validation_status = 'PASSED'
WHERE id = 456;

-- domain_event_entry table (EVENT STORE - immutable)
-- Contains complete audit trail:
-- 1. StudyDatabaseBuildStartedEvent
-- 2. StudyDatabaseBuildCompletedEvent
-- Both events stored forever for FDA compliance (21 CFR Part 11)
```

---

## 4. How build_id is Used

### Patient Enrollment Ties to Build

**ProtocolVisitInstantiationService.java** (simplified):

```java
public void instantiateVisitsForPatient(Long patientId, Long studyId, Long armId) {
    
    // ========================================
    // Step 1: Get Active Build for Study
    // ========================================
    Optional<StudyDatabaseBuildEntity> activeBuild = 
        buildRepository.findTopByStudyIdAndBuildStatusOrderByBuildEndTimeDesc(
            studyId, 
            StudyDatabaseBuildStatus.COMPLETED
        );
    
    if (activeBuild.isEmpty()) {
        throw new IllegalStateException("No completed build found for study " + studyId);
    }
    
    Long buildId = activeBuild.get().getId();  // ← This build_id gets stored
    
    // ========================================
    // Step 2: Get Visit Definitions from Build
    // ========================================
    // Query visit_definitions table (READ MODEL)
    // These definitions are what existed when build was created
    List<VisitDefinitionEntity> visitDefs = 
        visitDefinitionRepository.findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId);
    
    // ========================================
    // Step 3: Create Visit Instances for Patient
    // ========================================
    for (VisitDefinitionEntity visitDef : visitDefs) {
        StudyVisitInstanceEntity visitInstance = new StudyVisitInstanceEntity();
        visitInstance.setPatientId(patientId);
        visitInstance.setStudyId(studyId);
        visitInstance.setVisitDefinitionId(visitDef.getId());
        visitInstance.setBuildId(buildId);  // ← CRITICAL: Ties patient to protocol version
        visitInstance.setVisitType(visitDef.getVisitType());
        visitInstance.setExpectedDate(calculateExpectedDate(visitDef.getTimepoint()));
        visitInstance.setVisitStatus("SCHEDULED");
        
        visitInstanceRepository.save(visitInstance);
    }
    
    log.info("Created {} visit instances for patient {} using build {}", 
             visitDefs.size(), patientId, buildId);
}
```

**Database Result**:
```sql
-- study_visit_instances table
-- Patient 1 enrolled on 2024-01-15 (Protocol v1.0, build_id=1)
INSERT INTO study_visit_instances (patient_id, study_id, visit_definition_id, build_id, visit_status)
VALUES
    (1, 123, 10, 1, 'SCHEDULED'),  -- Screening
    (1, 123, 11, 1, 'SCHEDULED'),  -- Baseline
    (1, 123, 12, 1, 'SCHEDULED'),  -- Week 4
    (1, 123, 13, 1, 'SCHEDULED'),  -- Week 8
    (1, 123, 14, 1, 'SCHEDULED'); -- Week 12

-- Patient 51 enrolled on 2024-05-01 (Protocol v1.1, build_id=2 - AFTER AMENDMENT)
INSERT INTO study_visit_instances (patient_id, study_id, visit_definition_id, build_id, visit_status)
VALUES
    (51, 123, 10, 2, 'SCHEDULED'),  -- Screening
    (51, 123, 11, 2, 'SCHEDULED'),  -- Baseline
    (51, 123, 12, 2, 'SCHEDULED'),  -- Week 4
    (51, 123, 13, 2, 'SCHEDULED'),  -- Week 8
    (51, 123, 14, 2, 'SCHEDULED'),  -- Week 12
    (51, 123, 15, 2, 'SCHEDULED'),  -- Week 16 (NEW in v1.1)
    (51, 123, 16, 2, 'SCHEDULED'); -- Week 20 (NEW in v1.1)
```

**Querying Data by Protocol Version**:
```sql
-- Get all patients on Protocol v1.0
SELECT DISTINCT patient_id 
FROM study_visit_instances 
WHERE study_id = 123 AND build_id = 1;
-- Result: Patients 1-50

-- Get all patients on Protocol v1.1
SELECT DISTINCT patient_id 
FROM study_visit_instances 
WHERE study_id = 123 AND build_id = 2;
-- Result: Patients 51-100

-- Get all visits for Patient 1 (Protocol v1.0)
SELECT * 
FROM study_visit_instances 
WHERE patient_id = 1 AND build_id = 1;
-- Result: 5 visits (Protocol v1.0 only had 5 visits)

-- Get all visits for Patient 51 (Protocol v1.1)
SELECT * 
FROM study_visit_instances 
WHERE patient_id = 51 AND build_id = 2;
-- Result: 7 visits (Protocol v1.1 has 7 visits)
```

---

## 5. Build Lifecycle States

### State Machine

```
                  BuildStudyDatabaseCommand
                           │
                           ▼
    ┌──────────────────────────────────────────┐
    │         IN_PROGRESS                       │
    │  - Worker executing 5 phases              │
    │  - Can be cancelled by user               │
    └──────────────────────────────────────────┘
                    │      │
    ┌───────────────┘      └───────────────┐
    │                                       │
    ▼                                       ▼
┌─────────────┐                    ┌──────────────┐
│  COMPLETED  │                    │    FAILED    │
│  (Terminal) │                    │  (Terminal)  │
└─────────────┘                    └──────────────┘
    │                                       │
    │ CompleteCommand                       │ Exception in Worker
    │                                       │
    ▼                                       ▼
StudyDatabaseBuildCompletedEvent    StudyDatabaseBuildFailedEvent

                    OR
                    
    CancelStudyDatabaseBuildCommand
                    │
                    ▼
            ┌──────────────┐
            │  CANCELLED   │
            │  (Terminal)  │
            └──────────────┘
                    │
                    ▼
    StudyDatabaseBuildCancelledEvent
```

### State Transitions

| Current State | Command                              | New State  | Event                                      |
|---------------|--------------------------------------|------------|--------------------------------------------|
| (none)        | BuildStudyDatabaseCommand            | IN_PROGRESS| StudyDatabaseBuildStartedEvent             |
| IN_PROGRESS   | CompleteStudyDatabaseBuildCommand    | COMPLETED  | StudyDatabaseBuildCompletedEvent           |
| IN_PROGRESS   | (Worker Exception)                   | FAILED     | StudyDatabaseBuildFailedEvent              |
| IN_PROGRESS   | CancelStudyDatabaseBuildCommand      | CANCELLED  | StudyDatabaseBuildCancelledEvent           |
| IN_PROGRESS   | ValidateStudyDatabaseCommand         | IN_PROGRESS| StudyDatabaseValidationCompletedEvent      |
| COMPLETED     | (any command)                        | COMPLETED  | IllegalStateException (terminal state)     |
| FAILED        | (any command)                        | FAILED     | IllegalStateException (terminal state)     |
| CANCELLED     | (any command)                        | CANCELLED  | IllegalStateException (terminal state)     |

**Business Rules**:
- Only ONE build per study in IN_PROGRESS state at a time
- Terminal states (COMPLETED, FAILED, CANCELLED) cannot transition
- Validation can be run during IN_PROGRESS state
- Build can be cancelled only when IN_PROGRESS

---

## 6. Build Configuration Details

### What Gets "Frozen" in a Build

**Study Design Snapshot** (stored in event store):

```json
{
  "studyDesignConfiguration": {
    "studyId": 123,
    "studyName": "ONCOLOGY-2024-01",
    "protocolNumber": "PROTO-ABC-2024",
    "forms": [
      {
        "id": 1,
        "name": "Demographics",
        "version": "1.0",
        "fields": "[{\"name\":\"age\",\"type\":\"number\",\"required\":true,\"validation\":{\"min\":18,\"max\":85}}]",
        "structure": "{\"sections\":[{\"title\":\"Basic Info\",\"fields\":[\"age\",\"gender\",\"ethnicity\"]}]}"
      },
      {
        "id": 2,
        "name": "Vital Signs",
        "version": "1.2",
        "fields": "[{\"name\":\"systolic_bp\",\"type\":\"number\"},{\"name\":\"diastolic_bp\",\"type\":\"number\"}]",
        "structure": "{\"sections\":[{\"title\":\"Blood Pressure\",\"fields\":[\"systolic_bp\",\"diastolic_bp\"]}]}"
      }
    ],
    "visits": [
      {
        "id": 10,
        "name": "Screening",
        "visitType": "SCREENING",
        "timepoint": 0,
        "windowBefore": 3,
        "windowAfter": 7,
        "isRequired": true,
        "sequenceNumber": 1
      },
      {
        "id": 11,
        "name": "Baseline",
        "visitType": "BASELINE",
        "timepoint": 1,
        "windowBefore": 0,
        "windowAfter": 3,
        "isRequired": true,
        "sequenceNumber": 2
      }
    ],
    "arms": [
      {
        "id": 5,
        "name": "Treatment A",
        "type": "EXPERIMENTAL",
        "plannedSubjects": 50
      }
    ]
  },
  "validationRules": {
    "rules": [
      {
        "formId": 1,
        "ruleType": "REQUIRED",
        "message": "Required fields must be completed for Demographics"
      }
    ]
  }
}
```

**What Gets Created in Database**:

**CLARIFICATION**: Most of these tables are populated DURING STUDY DESIGN, not during build!

1. **visit_forms** (Form-Visit Associations) - **CREATED DURING STUDY DESIGN, TAGGED DURING BUILD**:
```sql
-- STUDY DESIGN PHASE: User creates these mappings in UI
INSERT INTO visit_forms (visit_definition_id, form_definition_id, is_required, display_order)
VALUES
    (10, 1, true, 1),  -- Screening requires Demographics
    (10, 2, true, 2),  -- Screening requires Vital Signs
    (11, 1, true, 1),  -- Baseline requires Demographics
    (11, 2, true, 2);  -- Baseline requires Vital Signs

-- STUDY BUILD PHASE: Tag existing records with build_id
UPDATE visit_forms 
SET build_id = 456 
WHERE visit_definition_id IN (
    SELECT id FROM visit_definitions WHERE study_id = 123
);
```

2. **study_form_validation_rules** (Validation Rules) - **CREATED DURING BUILD**:
```sql
INSERT INTO study_form_validation_rules (study_id, form_id, field_name, rule_type, rule_value, severity)
VALUES
    (123, 1, 'age', 'RANGE', '{"min":18,"max":85}', 'ERROR'),
    (123, 1, 'subject_id', 'REQUIRED', '{"required":true}', 'ERROR'),
    (123, 2, 'systolic_bp', 'RANGE', '{"min":80,"max":200}', 'WARNING');
```

3. **visit_definitions** (Visit Timing) - **CREATED DURING STUDY DESIGN, VALIDATED DURING BUILD**:
```sql
-- Already exists from Study Design Phase:
-- Visit schedules (timepoint, window_before, window_after) are columns in visit_definitions
SELECT id, name, timepoint, window_before, window_after 
FROM visit_definitions 
WHERE study_id = 123;

-- Result:
-- id=10, name='Screening', timepoint=0, window_before=3, window_after=7
-- id=11, name='Baseline', timepoint=1, window_before=0, window_after=3
-- id=12, name='Week 4', timepoint=28, window_before=3, window_after=7
```

4. **study_edit_checks** (Data Quality Rules) - **CREATED DURING BUILD**:
```sql
INSERT INTO study_edit_checks (study_id, check_name, check_type, check_logic, severity, action_required)
VALUES
    (123, 'Age Range Check', 'RANGE', '{"field":"age","min":18,"max":85}', 'MAJOR', 'QUERY'),
    (123, 'Visit Date Consistency', 'CONSISTENCY', '{"rule":"visit_date >= consent_date"}', 'MAJOR', 'QUERY');
```

---

## 7. Regulatory Compliance

### FDA 21 CFR Part 11 Compliance

**Requirement**: Electronic records must have complete audit trail

**How Study Build Addresses This**:

1. **Event Sourcing** = Immutable Audit Trail
   - ALL build events stored in `domain_event_entry` (never deleted)
   - Can reconstruct exact state at any point in time
   - Who initiated build, when, what protocol version

2. **build_id Tracking**
   - Every patient data record has `build_id`
   - Can trace: "Patient 25's Visit 3 data was collected under Protocol v1.0"
   - Answers regulatory question: "What was the approved protocol when this data was collected?"

3. **Complete Traceability**
```sql
-- Regulatory query: "Show me complete audit trail for Build 1"
SELECT 
    e.event_identifier,
    e.event_type,
    e.timestamp,
    e.payload,
    e.meta_data
FROM domain_event_entry e
WHERE e.aggregate_identifier = 'build-uuid-123'
ORDER BY e.global_index;

-- Result:
-- 1. StudyDatabaseBuildStartedEvent (2024-01-01 10:00:00)
-- 2. StudyDatabaseBuildCompletedEvent (2024-01-01 10:05:23)
```

---

## 8. Performance Optimizations

### 1. Read Model Seeding

**Problem**: Projection handler might be slow (event processing delay)

**Solution**: Pre-seed read model entity before command completes

```java
// StudyDatabaseBuildCommandService.java
private void seedReadModel(String aggregateUuid, String buildRequestId, BuildStudyDatabaseRequestDto requestDto) {
    // Create minimal entity IMMEDIATELY (before events processed)
    StudyDatabaseBuildEntity seed = StudyDatabaseBuildEntity.builder()
        .aggregateUuid(aggregateUuid)
        .buildRequestId(buildRequestId)
        .studyId(requestDto.getStudyId())
        .buildStatus(StudyDatabaseBuildStatus.IN_PROGRESS)
        .buildStartTime(LocalDateTime.now())
        .tablesCreated(0)
        .build();
    buildRepository.save(seed);
    
    // UI can find this entity immediately (no 15-second wait)
}
```

**Result**: UI finds build record in <200ms instead of waiting for projection

---

### 2. Async Worker Execution

**Problem**: Build process takes 5-10 seconds (blocks HTTP response)

**Solution**: @Async execution in separate thread pool

```java
@Async("databaseBuildExecutor")
@EventHandler
public void onBuildStarted(StudyDatabaseBuildStartedEvent event) {
    // This runs in SEPARATE THREAD
    // HTTP request already returned (non-blocking)
    executeBuild(event);  // ← Long-running work happens here
}
```

**Result**: API responds in <1 second, build continues in background

---

### 3. Idempotency on Event Replay

**Problem**: Service restart replays ALL events (builds re-execute)

**Solution**: Check build status before execution

```java
@EventHandler
public void onBuildStarted(StudyDatabaseBuildStartedEvent event) {
    // Check if already completed
    Optional<StudyDatabaseBuildEntity> buildOpt = 
        buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
    
    if (buildOpt.isPresent() && 
        buildOpt.get().getBuildStatus() == StudyDatabaseBuildStatus.COMPLETED) {
        return;  // ← Skip re-execution
    }
    
    executeBuild(event);
}
```

**Result**: Service restarts don't trigger duplicate builds

---

## 9. Error Handling

### Build Failure Scenarios

**Scenario 1: No Forms in Study**
```java
// Phase 1 validation
if (forms.isEmpty()) {
    throw new IllegalStateException("No forms found for study " + studyId);
}
```

**Result**:
- Exception caught by worker
- `updateBuildFailure()` sets status to FAILED
- Error details stored in `error_details` column
- UI shows error message: "Build failed: No forms found"

---

**Scenario 2: Database Connection Error**
```java
try {
    mappingsCreated = createFormVisitMappings(studyId, buildId, forms, visits);
} catch (DataAccessException e) {
    log.error("Phase 2 failed: {}", e.getMessage());
    throw new RuntimeException("Failed to create form-visit mappings: " + e.getMessage(), e);
}
```

**Result**:
- Worker catches exception
- Build marked as FAILED
- Event store has `StudyDatabaseBuildFailedEvent`
- Admin can retry build after fixing database issue

---

## 10. Key Insights

### Why Build vs. Simple Configuration?

**Alternative (Without Build)**:
```sql
-- Just use current study configuration
SELECT * FROM visit_definitions WHERE study_id = 123;
-- Problem: If visit definitions change, historical data becomes inconsistent
```

**Build Approach**:
```sql
-- Patient data is tied to specific build (protocol version)
SELECT * FROM study_visit_instances WHERE patient_id = 25 AND build_id = 1;
-- Result: Patient 25's data is locked to Protocol v1.0 (immutable)
```

---

### Multi-Tenant Shared Tables vs. Dynamic Tables

**OLD APPROACH (Dynamic Tables)**:
- Build process creates new tables: `study_123_forms`, `study_123_visits`
- Problem: 100 studies = 200+ tables
- Problem: Database migrations nightmare
- Problem: Query complexity (which table to query?)

**NEW APPROACH (Shared Tables + build_id)**:
- ALL studies use same tables: `study_visit_instances`, `study_form_data`
- Partitioned by `(study_id, build_id)` composite key
- 1000 studies = same 9 tables
- Query simplicity: `WHERE study_id = 123 AND build_id = 1`

---

### Event Sourcing Benefits

1. **Complete Audit Trail**: Every build action is logged
2. **Temporal Queries**: "What was the protocol on Jan 15, 2024?"
3. **Regulatory Compliance**: FDA requires immutable audit trail
4. **Debugging**: Replay events to reproduce issues
5. **Business Analytics**: "How many protocol amendments per study?"

---

## 11. Summary: What Happens When You Click "Build"

**PREREQUISITE**: Study Design must be complete BEFORE building:
- ✅ Forms created in `form_definitions` table
- ✅ Visits created in `visit_definitions` table (with schedules: timepoint, windows)
- ✅ **Form-visit mappings created in `visit_forms` table**
- ✅ Study arms created (if applicable)

**BUILD PROCESS**:

1. ✅ **API receives request** → `StudyDatabaseBuildCommandService.buildStudyDatabase()`
2. ✅ **Validates**: No existing IN_PROGRESS build for study
3. ✅ **Generates**: UUID (aggregate ID), buildRequestId (human-readable)
4. ✅ **Seeds read model**: Pre-creates entity for fast UI lookup
5. ✅ **Fetches protocol design**: Forms, visits, arms, **existing visit_forms** from database
6. ✅ **Sends command**: `BuildStudyDatabaseCommand` → Axon CommandGateway
7. ✅ **Aggregate validates**: Business rules (forms exist, visits exist, **mappings exist**)
8. ✅ **Event applied**: `StudyDatabaseBuildStartedEvent` stored in event store
9. ✅ **Projection updates**: Read model (`study_database_builds` table)
10. ✅ **Worker executes async**: 5 phases (validate, tag mappings, validate schedules, create checks, complete)
11. ✅ **Tags existing data**: **UPDATE visit_forms SET build_id = 456** (version tagging)
12. ✅ **Creates new data**: Validation rules, edit checks (extracted from form schemas)
13. ✅ **Complete command sent**: `CompleteStudyDatabaseBuildCommand`
14. ✅ **Event applied**: `StudyDatabaseBuildCompletedEvent` stored
15. ✅ **Projection updates**: Status = COMPLETED, metrics populated
16. ✅ **Result**: Build ID ready to use for patient enrollments

**Key Operations**:
- **VALIDATE** existing study design (forms, visits, form-visit mappings, schedules)
- **TAG** existing visit_forms records with build_id (version stamping)
- **EXTRACT** validation rules from form JSON schemas
- **CREATE** data quality edit checks
- **SNAPSHOT** protocol version in event store

**Time**: 5-10 seconds total

**Result**: Frozen protocol version (build_id) that will never change

---

## 12. Code References

| Component | File | Lines |
|-----------|------|-------|
| **API Layer** | `StudyDatabaseBuildController.java` | 46-53 (POST endpoint) |
| **Command Service** | `StudyDatabaseBuildCommandService.java` | 51-106 (buildStudyDatabase) |
|  | | 320-451 (sendBuildCommand) |
| **Aggregate** | `StudyDatabaseBuildAggregate.java` | 72-105 (BuildCommand handler) |
|  | | 143-192 (CompleteCommand handler) |
| **Worker** | `StudyDatabaseBuildWorkerService.java` | 85-120 (Event handler) |
|  | | 125-430 (executeBuild) |
| **Projection** | `StudyDatabaseBuildProjectionHandler.java` | 49-79 (StartedEvent) |
|  | | 83-120 (CompletedEvent) |

---

## 13. Related Documentation

- **DATABASE_SPECIFICATION.md**: Complete schema documentation (50+ tables, indexes, relationships)
- **EVENT_STORE_VS_READ_MODEL_EXPLAINED.md**: CQRS architecture explanation
- **MIGRATION_SCRIPT_UPDATED.md**: Build tracking column additions
- **PHASE_6_BACKEND_NECESSITY_ANALYSIS.md**: Metadata storage approach (JSON vs tables)

---

**Document Status**: ✅ COMPLETE - Technical explanation of Study Build process from architecture to execution

**Last Updated**: January 2025

**Author**: AI Technical Documentation Assistant
