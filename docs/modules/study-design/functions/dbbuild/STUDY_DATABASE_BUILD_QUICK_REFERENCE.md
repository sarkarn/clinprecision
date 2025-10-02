# Study Database Build DDD/CQRS - Quick Reference

**Implementation Status:** Phase 1-3 Complete ✅  
**Date:** October 2, 2025

---

## 📦 Package Structure

```
com.clinprecision.datacaptureservice.studydatabase/
├── aggregate/
│   └── StudyDatabaseBuildAggregate.java          (Phase 2 - Write Model)
├── domain/
│   ├── commands/
│   │   ├── BuildStudyDatabaseCommand.java        (Phase 1 - Command)
│   │   ├── ValidateStudyDatabaseCommand.java     (Phase 1 - Command)
│   │   ├── CancelStudyDatabaseBuildCommand.java  (Phase 1 - Command)
│   │   └── CompleteStudyDatabaseBuildCommand.java (Phase 1 - Command)
│   └── events/
│       ├── StudyDatabaseBuildStartedEvent.java   (Phase 1 - Event)
│       ├── StudyDatabaseBuildCompletedEvent.java (Phase 1 - Event)
│       ├── StudyDatabaseBuildFailedEvent.java    (Phase 1 - Event)
│       ├── StudyDatabaseBuildCancelledEvent.java (Phase 1 - Event)
│       └── StudyDatabaseValidationCompletedEvent.java (Phase 1 - Event)
├── entity/
│   ├── StudyDatabaseBuildStatus.java             (Phase 3 - Enum)
│   └── StudyDatabaseBuildEntity.java             (Phase 3 - Read Model)
├── repository/
│   └── StudyDatabaseBuildRepository.java         (Phase 3 - Data Access)
└── projection/
    └── StudyDatabaseBuildProjectionHandler.java  (Phase 3 - Event Handler)
```

---

## 🔄 CQRS Flow

### Write Side (Commands → Aggregate → Events)
```
1. Client sends command
   ↓
2. CommandGateway routes to Aggregate
   ↓
3. Aggregate validates business rules
   ↓
4. Aggregate applies event
   ↓
5. Event stored in Event Store
```

### Read Side (Events → Projection → Entity)
```
1. Event emitted from Aggregate
   ↓
2. ProjectionHandler receives event
   ↓
3. Handler updates read model
   ↓
4. Entity saved to database
   ↓
5. Available for queries
```

---

## 💻 Usage Examples

### Building a Study Database
```java
// Create command
BuildStudyDatabaseCommand command = BuildStudyDatabaseCommand.builder()
    .studyDatabaseBuildId(UUID.randomUUID())
    .studyId(123L)
    .studyName("CARDIO-2024")
    .studyProtocol("CARD-001")
    .requestedBy(456L)
    .buildRequestId("BUILD-" + System.currentTimeMillis())
    .buildConfiguration(Map.of(
        "formsConfigured", 10,
        "validationRulesSetup", 50
    ))
    .build();

// Send via CommandGateway (Phase 4)
commandGateway.sendAndWait(command);
```

### Querying Build Status
```java
// Find by aggregate UUID
Optional<StudyDatabaseBuildEntity> build = 
    buildRepository.findByAggregateUuid(aggregateUuid);

// Find latest build for study
Optional<StudyDatabaseBuildEntity> latestBuild = 
    buildRepository.findTopByStudyIdOrderByBuildStartTimeDesc(studyId);

// Find all in-progress builds
List<StudyDatabaseBuildEntity> inProgress = 
    buildRepository.findByBuildStatus(StudyDatabaseBuildStatus.IN_PROGRESS);

// Check if study has active build
boolean hasActiveBuild = 
    buildRepository.existsByStudyIdAndBuildStatus(
        studyId, 
        StudyDatabaseBuildStatus.IN_PROGRESS
    );
```

### Cancelling a Build
```java
// Create cancel command
CancelStudyDatabaseBuildCommand command = CancelStudyDatabaseBuildCommand.builder()
    .studyDatabaseBuildId(buildId)
    .studyId(studyId)
    .cancelledBy(userId)
    .cancellationReason("User requested cancellation")
    .build();

// Send via CommandGateway
commandGateway.sendAndWait(command);
```

---

## 🎯 Key Design Decisions

### 1. Aggregate Identifier
- **Type:** UUID (not auto-generated Long)
- **Reason:** Distributed system best practice, allows client-side ID generation
- **Pattern:** Same as PatientAggregate and SiteAggregate

### 2. Status Enumeration
- **Values:** IN_PROGRESS, COMPLETED, FAILED, CANCELLED
- **Location:** Both Aggregate (write) and Entity (read)
- **Consistency:** Ensures status alignment between models

### 3. Build Request ID
- **Type:** Human-readable string (e.g., "BUILD-1696252800000")
- **Purpose:** User-friendly identifier
- **Uniqueness:** Unique constraint in database

### 4. Event Sourcing
- **Store:** Axon Event Store (MySQL with JPA)
- **Serialization:** Jackson (secure, no XStream)
- **Replay:** Can rebuild read model from events

### 5. Projection Handler
- **Processing Group:** "studydatabase-projection"
- **Idempotency:** Checks for existing entities before creating
- **Error Handling:** Try-catch with logging and re-throw

---

## 🔍 Repository Query Methods

### Primary Lookups
- `findByAggregateUuid(String)` - For event handlers
- `findByBuildRequestId(String)` - For human-readable ID

### Study-Based Queries
- `findByStudyId(Long)` - All builds for study
- `findByStudyIdOrderByBuildStartTimeDesc(Long)` - Recent first
- `findTopByStudyIdOrderByBuildStartTimeDesc(Long)` - Latest only

### Status Queries
- `findByBuildStatus(Status)` - By status
- `findByStudyIdAndBuildStatus(Long, Status)` - Study + status
- `existsByStudyIdAndBuildStatus(Long, Status)` - Check existence

### Monitoring Queries
- `findLongRunningBuilds(Status, Long)` - Performance monitoring
- `findBuildsWithValidationWarnings()` - Quality checks
- `getBuildStatisticsByStudy(Long)` - Statistics

---

## 📊 Database Schema

### Table: study_database_builds

#### Primary Columns
- `id` - Auto-increment primary key
- `aggregate_uuid` - UUID from Axon (unique)
- `build_request_id` - Human-readable ID (unique)
- `study_id` - Foreign key to studies
- `build_status` - ENUM (IN_PROGRESS, COMPLETED, FAILED, CANCELLED)

#### Tracking Columns
- `build_start_time` - When build started
- `build_end_time` - When build ended
- `requested_by` - User ID who requested
- `cancelled_by` - User ID who cancelled
- `validated_by` - User ID who validated

#### Metrics Columns
- `tables_created` - Number of tables
- `indexes_created` - Number of indexes
- `triggers_created` - Number of triggers
- `forms_configured` - Number of forms
- `validation_rules_created` - Number of rules

#### Result Columns
- `build_configuration` - JSON configuration
- `validation_results` - JSON validation results
- `error_details` - Error message if failed
- `cancellation_reason` - Reason if cancelled

---

## 🛠️ Migration Required

Before running application:
```bash
mysql -u root -p clinprecision_dev < backend/clinprecision-db/ddl/migrations/001_add_study_database_build_ddd_support.sql
```

This adds:
- `aggregate_uuid` column
- Additional tracking columns
- Performance indexes

---

## ✅ Completed Phases

### Phase 1: Domain Commands & Events ✅
- 4 Commands
- 5 Events
- Complete validation

### Phase 2: Aggregate Design ✅
- Write model
- Command handlers
- Event sourcing handlers
- Business rules

### Phase 3: CQRS Read Model ✅
- Entity
- Repository (20+ methods)
- Projection handler
- Migration script

---

## 🚀 Next Phase

### Phase 4: Service Layer (TODO)
- Command service (uses CommandGateway)
- Query service (uses Repository)
- REST controller
- DTOs
- Exception handling

---

## 📚 References

- **Implementation Plan:** STUDY_DATABASE_BUILD_DDD_CQRS_IMPLEMENTATION_PLAN.md
- **Phase 1-2 Summary:** STUDY_DATABASE_BUILD_PHASE_1_2_IMPLEMENTATION_COMPLETE.md
- **Phase 3 Summary:** STUDY_DATABASE_BUILD_PHASE_3_IMPLEMENTATION_COMPLETE.md
- **Overall Status:** STUDY_DATABASE_BUILD_IMPLEMENTATION_STATUS.md

---

**Phase 1-3: COMPLETE** ✅  
**Total Files:** 15 files  
**Total Lines:** ~1,490 lines  
**Compilation:** No errors
