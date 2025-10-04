# Database Build Issue - Visual Flow Diagram

## 🔴 Current Broken Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER ACTION                                   │
│              User clicks "Build Database" button                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (BuildStudyDatabaseModal)               │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ buildRequest = {                                        │         │
│  │   studyId: 1,                                           │         │
│  │   studyName: "Study XYZ",                               │         │
│  │   requestedBy: 123,                                     │         │
│  │   buildConfiguration: {}                                │         │
│  │ }                                                        │         │
│  └────────────────────────────────────────────────────────┘         │
│                               │                                       │
│  POST /studydesign-ws/api/v1/study-database-builds                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│               API GATEWAY (Port 8082)                                │
│  Route: /studydesign-ws/api/** → lb://studydesign-ws               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│       BACKEND: StudyDatabaseBuildController (Port 8085)              │
│  @PostMapping("/api/v1/study-database-builds")                      │
│                               │                                       │
│  buildDatabase(BuildStudyDatabaseRequestDto)                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│       StudyDatabaseBuildCommandService                               │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ 1. Check for existing in-progress build                │         │
│  │ 2. Generate UUID and buildRequestId                    │         │
│  │ 3. Seed minimal read model                             │         │
│  │ 4. Send BuildStudyDatabaseCommand                      │         │
│  └────────────────────────────────────────────────────────┘         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                AXON CommandGateway                                   │
│         Dispatches command to aggregate                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│       StudyDatabaseBuildAggregate                                    │
│  @CommandHandler                                                     │
│  BuildStudyDatabaseCommand(command) {                                │
│    ┌──────────────────────────────────────────────┐                │
│    │ validateBuildCommand(command);                │                │
│    │                                                │                │
│    │ AggregateLifecycle.apply(                     │                │
│    │   StudyDatabaseBuildStartedEvent {            │                │
│    │     studyDatabaseBuildId: UUID                │                │
│    │     studyId: 1                                 │                │
│    │     status: IN_PROGRESS                        │                │
│    │     requestedBy: 123                           │                │
│    │     buildConfiguration: {}                     │                │
│    │   }                                            │                │
│    │ );                                             │                │
│    └──────────────────────────────────────────────┘                │
│  }                                                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AXON Event Store                                  │
│  Persists StudyDatabaseBuildStartedEvent to domain_event_entry      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│       StudyDatabaseBuildProjectionHandler                            │
│  @EventHandler                                                       │
│  on(StudyDatabaseBuildStartedEvent event) {                          │
│    ┌──────────────────────────────────────────────┐                │
│    │ Create StudyDatabaseBuildEntity:              │                │
│    │   id: (auto)                                   │                │
│    │   aggregateUuid: UUID                          │                │
│    │   studyId: 1                                   │                │
│    │   buildStatus: IN_PROGRESS                     │                │
│    │   buildStartTime: now()                        │                │
│    │   formsConfigured: 0  ← ❌ STAYS ZERO         │                │
│    │   tablesCreated: 0    ← ❌ STAYS ZERO         │                │
│    │   validationRulesSetup: 0 ← ❌ STAYS ZERO     │                │
│    │                                                │                │
│    │ buildRepository.save(entity)                   │                │
│    └──────────────────────────────────────────────┘                │
│  }                                                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MySQL Database                                    │
│  study_database_builds table:                                        │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ id: 1                                                   │         │
│  │ aggregate_uuid: "abc-123..."                            │         │
│  │ study_id: 1                                             │         │
│  │ build_status: IN_PROGRESS                               │         │
│  │ build_start_time: "2025-10-03 10:00:00"                │         │
│  │ forms_configured: 0     ← ❌ NEVER UPDATED             │         │
│  │ tables_created: 0       ← ❌ NEVER UPDATED             │         │
│  │ validation_rules_setup: 0 ← ❌ NEVER UPDATED           │         │
│  └────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
        ▼                                               ▼
┌──────────────────────┐                    ┌──────────────────────┐
│   🔴 NO WORKER       │                    │  Frontend Polling    │
│                      │                    │                      │
│  ❌ No background    │                    │  GET /builds/{id}    │
│     process          │                    │  Every 5 seconds     │
│  ❌ No table         │                    │                      │
│     creation         │                    │  Returns:            │
│  ❌ No progress      │                    │  {                   │
│     updates          │                    │   status: IN_PROGRESS│
│  ❌ No completion    │                    │   formsConfigured: 0 │
│     event            │                    │   tablesCreated: 0   │
│                      │                    │   validationRules: 0 │
└──────────────────────┘                    │  }                   │
                                            └──────────────────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │  BuildProgressBar    │
                                            │                      │
                                            │  progress = 0%       │
                                            │  ↓                   │
                                            │  "Initializing       │
                                            │   build..."          │
                                            │  ↓                   │
                                            │  FOREVER 🔄          │
                                            └──────────────────────┘
```

---

## ✅ Expected Correct Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  After BuildStudyDatabaseCommand creates IN_PROGRESS record...      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NEW: StudyDatabaseBuildWorkerService (MISSING!)                    │
│  @Async("databaseBuildExecutor")                                    │
│  @EventHandler                                                       │
│  public void processBuild(StudyDatabaseBuildStartedEvent event) {   │
│                                                                      │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ PHASE 1: Fetch Study Design (Progress: 0-20%)        │        │
│    │ ────────────────────────────────────────────          │        │
│    │ forms = formRepository.findByStudyId(studyId)         │        │
│    │ visits = visitRepository.findByStudyId(studyId)       │        │
│    │ arms = armRepository.findByStudyId(studyId)           │        │
│    │                                                        │        │
│    │ updateProgress(buildId, 20, 0, 0, 0)                  │        │
│    └──────────────────────────────────────────────────────┘        │
│                         │                                            │
│                         ▼                                            │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ PHASE 2: Create Tables (Progress: 20-50%)            │        │
│    │ ────────────────────────────────────────────          │        │
│    │ for (form : forms) {                                  │        │
│    │   String tableName = "study_" + studyId + "_"        │        │
│    │                      + form.getId()                    │        │
│    │   createDynamicTable(tableName, form.fields)          │        │
│    │   tablesCreated++                                      │        │
│    │                                                        │        │
│    │   updateProgress(buildId, 50, formsConfigured,        │        │
│    │                  tablesCreated, 0)                     │        │
│    │ }                                                      │        │
│    └──────────────────────────────────────────────────────┘        │
│                         │                                            │
│                         ▼                                            │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ PHASE 3: Create Indexes (Progress: 50-70%)           │        │
│    │ ────────────────────────────────────────────          │        │
│    │ createIndexes(tables)                                  │        │
│    │ indexesCreated += count                                │        │
│    │                                                        │        │
│    │ updateProgress(buildId, 70, formsConfigured,          │        │
│    │                tablesCreated, indexesCreated)          │        │
│    └──────────────────────────────────────────────────────┘        │
│                         │                                            │
│                         ▼                                            │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ PHASE 4: Validation Rules (Progress: 70-90%)         │        │
│    │ ────────────────────────────────────────────          │        │
│    │ for (form : forms) {                                  │        │
│    │   rules = extractValidationRules(form.fields)         │        │
│    │   createDatabaseConstraints(tableName, rules)         │        │
│    │   validationRulesSetup++                               │        │
│    │                                                        │        │
│    │   updateProgress(buildId, 90, formsConfigured,        │        │
│    │                  tablesCreated, validationRulesSetup)  │        │
│    │ }                                                      │        │
│    └──────────────────────────────────────────────────────┘        │
│                         │                                            │
│                         ▼                                            │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ PHASE 5: Completion (Progress: 100%)                 │        │
│    │ ────────────────────────────────────────────          │        │
│    │ commandGateway.send(                                  │        │
│    │   CompleteStudyDatabaseBuildCommand {                 │        │
│    │     buildRequestId: event.buildRequestId              │        │
│    │     completedBy: "system"                             │        │
│    │     formsConfigured: formsConfigured                  │        │
│    │     tablesCreated: tablesCreated                      │        │
│    │     validationRulesSetup: validationRulesSetup        │        │
│    │     validationResult: {...}                           │        │
│    │   }                                                    │        │
│    │ )                                                      │        │
│    └──────────────────────────────────────────────────────┘        │
│  }                                                                   │
│                                                                      │
│  private void updateProgress(UUID buildId, int phase,               │
│                              int forms, int tables, int rules) {    │
│    entity = buildRepository.findByAggregateUuid(buildId)            │
│    entity.setFormsConfigured(forms)                                 │
│    entity.setTablesCreated(tables)                                  │
│    entity.setValidationRulesSetup(rules)                            │
│    buildRepository.save(entity)  ← UPDATES DATABASE                │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MySQL Database - NOW UPDATED!                                      │
│  study_database_builds table:                                        │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ build_status: IN_PROGRESS → COMPLETED                  │         │
│  │ forms_configured: 0 → 5 → 5 ✅                         │         │
│  │ tables_created: 0 → 3 → 5 → 5 ✅                       │         │
│  │ validation_rules_setup: 0 → 12 → 15 ✅                │         │
│  │ build_end_time: "2025-10-03 10:02:30"                  │         │
│  └────────────────────────────────────────────────────────┘         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend Polling (Every 5 seconds)                                 │
│  GET /builds/{id}                                                    │
│                                                                      │
│  Response changes over time:                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ T=0s:  { status: IN_PROGRESS, forms: 0,  progress: 0%  │         │
│  │ T=5s:  { status: IN_PROGRESS, forms: 2,  progress: 30% │         │
│  │ T=10s: { status: IN_PROGRESS, forms: 5,  progress: 60% │         │
│  │ T=15s: { status: IN_PROGRESS, rules: 12, progress: 85% │         │
│  │ T=20s: { status: COMPLETED,   all done,  progress:100% │         │
│  └────────────────────────────────────────────────────────┘         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BuildProgressBar - ANIMATES! ✅                                     │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ "Initializing build..."        (0-30%)                 │         │
│  │    ▓▓▓░░░░░░░░░░░░░░░░░ 15%                            │         │
│  │                                                         │         │
│  │ "Configuring forms and tables..." (30-60%)             │         │
│  │    ▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 45%                             │         │
│  │                                                         │         │
│  │ "Setting up validation rules..." (60-90%)              │         │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 75%                              │         │
│  │                                                         │         │
│  │ "Finalizing build..."           (90-100%)              │         │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 95%                              │         │
│  │                                                         │         │
│  │ ✅ Build Completed!             (100%)                 │         │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%                           │         │
│  └────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Differences

| Aspect | Current (Broken) | Required (Fixed) |
|--------|------------------|------------------|
| **Background Worker** | ❌ None | ✅ `StudyDatabaseBuildWorkerService` |
| **Table Creation** | ❌ Never happens | ✅ Dynamic DDL execution |
| **Progress Updates** | ❌ Stays at 0 | ✅ Updates every phase |
| **Completion Event** | ❌ Never fired | ✅ Fired after work done |
| **Database Records** | ❌ Static (forms=0) | ✅ Updated progressively |
| **Frontend Experience** | 🔴 "Initializing..." forever | ✅ Animated progress bar |

---

## 📝 Implementation Checklist

- [ ] Create `StudyDatabaseBuildWorkerService.java`
- [ ] Add `@Async` configuration with custom executor
- [ ] Implement `@EventHandler` for `StudyDatabaseBuildStartedEvent`
- [ ] Phase 1: Fetch study design data
- [ ] Phase 2: Dynamic table creation (DDL)
- [ ] Phase 3: Create indexes and constraints
- [ ] Phase 4: Set up validation rules
- [ ] Phase 5: Fire `CompleteStudyDatabaseBuildCommand`
- [ ] Add error handling and `FailedEvent` triggers
- [ ] Test full flow from button click to completion
- [ ] Verify progress bar animates correctly
