# Protocol Version `created_by` Field Missing in Projection

**Date:** October 8, 2025
**Issue:** Database error "Field 'created_by' doesn't have a default value" during protocol version creation
**Type:** Event Projection Bug
**Status:** ✅ FIXED

## Problem

### Error Message
```
SQL Error: 1364, SQLState: HY000
Field 'created_by' doesn't have a default value

insert into study_versions (aggregate_uuid,amendment_type,...,version_number,withdrawal_reason,withdrawn_by) 
values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
```

**Notice:** The `created_by` column is **MISSING** from the INSERT statement!

### Why UI Didn't Show Error

The error occurred in the **Event Projection** layer (asynchronous), not in command handling (synchronous).

## Event Sourcing Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ SYNCHRONOUS - Controller Waits For This                        │
└─────────────────────────────────────────────────────────────────┘

Frontend → POST /api/studies/11/versions
    ↓
StudyCommandController.createProtocolVersion()
    ↓ Builds CreateProtocolVersionCommand
    ↓
ProtocolVersionCommandService.createVersionSync(command)
    ↓
commandGateway.sendAndWait(command)
    ↓
┌────────────────────────────────────────────┐
│ Command Handling (SYNCHRONOUS)             │
│                                            │
│ 1. ProtocolVersionAggregate constructor    │
│    - Validates business rules ✅           │
│    - Applies ProtocolVersionCreatedEvent ✅│
│                                            │
│ 2. Event Store                            │
│    - Stores event in event_entry table ✅  │
│                                            │
│ 3. Returns versionId to controller ✅      │
└────────────────────────────────────────────┘
    ↓
Controller: return 201 CREATED + versionId ✅
    ↓
Frontend: Shows success message ✅

┌─────────────────────────────────────────────────────────────────┐
│ ASYNCHRONOUS - Controller Already Returned to UI               │
└─────────────────────────────────────────────────────────────────┘

[Background Thread - Tracking Event Processor]
    ↓
Picks up ProtocolVersionCreatedEvent from event store
    ↓
Dispatches to @EventHandler methods
    ↓
┌────────────────────────────────────────────┐
│ Event Projection (ASYNCHRONOUS)            │
│                                            │
│ ProtocolVersionProjection.on(event)       │
│   - Creates ProtocolVersionEntity         │
│   - Sets fields from event                │
│   - ❌ MISSING: entity.setCreatedBy()     │
│   - repository.save(entity)               │
│                                            │
│ Database INSERT                           │
│   - SQL Error: created_by missing ❌       │
└────────────────────────────────────────────┘
    ↓
Error logged in backend (not propagated to UI)
    ↓
Axon Framework retries after 30s, 60s, 120s...
    ↓
Keeps failing because projection still missing the field
```

## Root Cause Analysis

### 1. Event Has the Field ✅
**File:** `ProtocolVersionCreatedEvent.java`
```java
@Value
@Builder
public class ProtocolVersionCreatedEvent {
    UUID versionId;
    UUID studyAggregateUuid;
    VersionNumber versionNumber;
    // ... other fields ...
    Long createdBy; // ✅ PRESENT in event
    LocalDateTime occurredAt;
    // ...
}
```

### 2. Command Has the Field ✅
**File:** `CreateProtocolVersionCommand.java`
```java
@Value
@Builder
public class CreateProtocolVersionCommand {
    @TargetAggregateIdentifier
    UUID versionId;
    UUID studyAggregateUuid;
    VersionNumber versionNumber;
    // ... other fields ...
    Long createdBy; // ✅ PRESENT in command
    // ...
}
```

### 3. Aggregate Passes the Field ✅
**File:** `ProtocolVersionAggregate.java` (constructor)
```java
AggregateLifecycle.apply(
    ProtocolVersionCreatedEvent.from(
        command.getVersionId(),
        command.getStudyAggregateUuid(),
        command.getVersionNumber(),
        // ... other fields ...
        command.getCreatedBy() // ✅ PASSED to event
    )
);
```

### 4. Projection MISSING the Field ❌
**File:** `ProtocolVersionProjection.java` (BEFORE FIX)
```java
@EventHandler
@Transactional
public void on(ProtocolVersionCreatedEvent event) {
    log.info("Projecting ProtocolVersionCreatedEvent: {}", event.getVersionNumber());
    
    ProtocolVersionEntity entity = new ProtocolVersionEntity();
    entity.setAggregateUuid(event.getVersionId());
    entity.setStudyAggregateUuid(event.getStudyAggregateUuid());
    entity.setVersionNumber(event.getVersionNumber().getValue());
    entity.setStatus(event.getInitialStatus());
    entity.setAmendmentType(event.getAmendmentType());
    entity.setDescription(event.getDescription());
    entity.setChangesSummary(event.getChangesSummary());
    entity.setImpactAssessment(event.getImpactAssessment());
    entity.setRequiresRegulatoryApproval(event.getRequiresRegulatoryApproval());
    // ❌ MISSING: entity.setCreatedBy(event.getCreatedBy());
    entity.setCreatedAt(event.getOccurredAt());
    entity.setUpdatedAt(event.getOccurredAt());
    
    repository.save(entity); // ❌ FAILS: created_by not set
}
```

## The Fix

**File:** `ProtocolVersionProjection.java` (AFTER FIX)

Added the missing line to map `createdBy` from event to entity:

```java
@EventHandler
@Transactional
public void on(ProtocolVersionCreatedEvent event) {
    log.info("Projecting ProtocolVersionCreatedEvent: {}", event.getVersionNumber());
    
    ProtocolVersionEntity entity = new ProtocolVersionEntity();
    entity.setAggregateUuid(event.getVersionId());
    entity.setStudyAggregateUuid(event.getStudyAggregateUuid());
    entity.setVersionNumber(event.getVersionNumber().getValue());
    entity.setStatus(event.getInitialStatus());
    entity.setAmendmentType(event.getAmendmentType());
    entity.setDescription(event.getDescription());
    entity.setChangesSummary(event.getChangesSummary());
    entity.setImpactAssessment(event.getImpactAssessment());
    entity.setRequiresRegulatoryApproval(event.getRequiresRegulatoryApproval());
    entity.setCreatedBy(event.getCreatedBy()); // ✅ FIXED: Map createdBy from event
    entity.setCreatedAt(event.getOccurredAt());
    entity.setUpdatedAt(event.getOccurredAt());
    
    repository.save(entity); // ✅ NOW INCLUDES created_by
}
```

## Why Frontend Got Success But Backend Failed

This is a **classic Event Sourcing gotcha**:

### Synchronous vs Asynchronous Boundary

**Synchronous (UI sees this):**
1. ✅ Command validation
2. ✅ Aggregate business logic
3. ✅ Event stored in event store
4. ✅ Return versionId to controller
5. ✅ UI shows success message

**Asynchronous (UI doesn't see this):**
6. ❌ Event projection fails
7. ❌ Read model not updated
8. ❌ Error only visible in backend logs
9. ❌ Axon retries in background

### The Consequence

**From Frontend Perspective:**
- ✅ API returns 201 CREATED
- ✅ "Version created successfully!" message
- ✅ User thinks it worked

**From Backend Perspective:**
- ✅ Write model (aggregate) succeeded
- ✅ Event stored in event store
- ❌ Read model (projection) failed
- ❌ Version not visible in list queries
- ❌ Data inconsistency

**User Experience:**
- User creates version → Gets success message ✅
- User refreshes page → Version not in list ❌
- User confused: "I just created it!" 🤔
- Backend logs: "Field 'created_by' doesn't have a default value" ❌

## Data Flow Validation

### Request Data (Frontend → Backend)
```json
POST /api/studies/11/versions
{
  "versionNumber": "1.0",
  "description": "Initial protocol",
  "amendmentType": "INITIAL",
  "changesSummary": "Initial protocol version",
  "requiresRegulatoryApproval": true,
  "createdBy": 1  // ✅ Frontend sends it
}
```

### Command (Controller → Command Service)
```java
CreateProtocolVersionCommand command = CreateProtocolVersionCommand.builder()
    .versionId(versionId)
    .studyAggregateUuid(studyAggregateUuid)
    .versionNumber(VersionNumber.of("1.0"))
    .description("Initial protocol")
    .amendmentType(AmendmentType.INITIAL)
    .changesSummary("Initial protocol version")
    .requiresRegulatoryApproval(true)
    .createdBy(1L)  // ✅ Command has it
    .build();
```

### Event (Aggregate → Event Store)
```java
ProtocolVersionCreatedEvent event = ProtocolVersionCreatedEvent.from(
    command.getVersionId(),
    command.getStudyAggregateUuid(),
    command.getVersionNumber(),
    // ...
    command.getCreatedBy()  // ✅ Event has it
);
```

### Entity (Event → Read Model) - BEFORE FIX
```java
ProtocolVersionEntity entity = new ProtocolVersionEntity();
entity.setAggregateUuid(event.getVersionId());
entity.setStudyAggregateUuid(event.getStudyAggregateUuid());
// ... other fields ...
// ❌ MISSING: entity.setCreatedBy(event.getCreatedBy());
entity.setCreatedAt(event.getOccurredAt());
```

### SQL INSERT - BEFORE FIX
```sql
INSERT INTO study_versions (
    aggregate_uuid,
    amendment_type,
    approval_comments,
    -- ... many fields ...
    version_number,
    withdrawal_reason,
    withdrawn_by
    -- ❌ created_by NOT IN COLUMN LIST!
) VALUES (?, ?, ?, ?, ...);
```

### SQL INSERT - AFTER FIX
```sql
INSERT INTO study_versions (
    aggregate_uuid,
    amendment_type,
    approval_comments,
    -- ... many fields ...
    created_by,     -- ✅ NOW INCLUDED!
    created_at,
    version_number,
    withdrawal_reason,
    withdrawn_by
) VALUES (?, ?, ?, ?, ...);
```

## Testing After Fix

### Step 1: Restart Backend
After fixing the projection, restart the backend service so Axon can retry the failed event.

### Step 2: Check Event Replay
Axon will automatically retry the failed event:
```
2025-10-08 19:29:29 - Fetched token: ReplayToken{...}
2025-10-08 19:29:29 - Projecting ProtocolVersionCreatedEvent: 1.0
2025-10-08 19:29:29 - Created read model for version: 1.0 ✅
```

### Step 3: Verify Database
```sql
SELECT aggregate_uuid, version_number, created_by, created_at 
FROM study_versions 
WHERE version_number = '1.0';

-- Expected result:
-- aggregate_uuid                      | version_number | created_by | created_at
-- ----------------------------------- | -------------- | ---------- | -------------------
-- 3af12585-1591-4e50-8e86-280ecffbc4b7| 1.0            | 1          | 2025-10-08 19:29:29
```

### Step 4: Test New Version Creation
```bash
curl -X POST http://localhost:8080/api/studies/11/versions \
  -H "Content-Type: application/json" \
  -d '{
    "versionNumber": "2.0",
    "description": "Second version",
    "amendmentType": "MINOR",
    "changesSummary": "Minor protocol amendment",
    "requiresRegulatoryApproval": false,
    "createdBy": 1
  }'

# Expected: 201 CREATED
# Expected: Version appears in list immediately
# Expected: No errors in backend logs
```

## Modified Files

1. **ProtocolVersionProjection.java**
   - Added: `entity.setCreatedBy(event.getCreatedBy());`
   - Location: Line 50 (in `on(ProtocolVersionCreatedEvent event)` handler)

## Key Learnings

### 1. Event Sourcing Has Asynchronous Boundaries
- Commands are synchronous (UI waits)
- Events are asynchronous (UI doesn't wait)
- Success response doesn't guarantee read model update

### 2. Field Mapping Must Be Complete
- Event has field → Projection must map field
- Missing mappings = silent failures in projections
- Database constraints catch these issues

### 3. Error Propagation in Event Sourcing
- Command errors → Propagate to UI immediately
- Projection errors → Only visible in logs
- Need monitoring for projection failures

### 4. Testing Must Cover Full Cycle
- Test command handling ✅
- Test event storage ✅
- Test event projection ✅ (often forgotten!)
- Test end-to-end (create → query) ✅

### 5. Axon Retry Mechanism
- Failed projections automatically retry (30s, 60s, 120s...)
- Fix projection code + restart = automatic replay
- Don't need to manually replay events (Axon handles it)

## Best Practices Going Forward

### 1. Projection Field Checklist
When creating new events, ensure projection maps ALL fields:
```java
// Event fields
@Value
@Builder
public class SomeEvent {
    UUID id;
    String field1;
    String field2;
    Long field3; // Don't forget this!
}

// Projection must map ALL fields
@EventHandler
public void on(SomeEvent event) {
    entity.setField1(event.getField1()); ✅
    entity.setField2(event.getField2()); ✅
    entity.setField3(event.getField3()); ✅ Don't forget!
}
```

### 2. Database Constraints Help
Use NOT NULL constraints to catch missing mappings:
```sql
CREATE TABLE study_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,  -- ✅ Forces projection to provide value
    -- ...
);
```

### 3. Integration Tests for Projections
```java
@Test
void testProtocolVersionCreatedEventProjection() {
    // Given
    ProtocolVersionCreatedEvent event = createTestEvent();
    
    // When
    projection.on(event);
    
    // Then
    ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId()).get();
    assertNotNull(entity.getCreatedBy()); // ✅ Verify ALL fields
    assertEquals(event.getCreatedBy(), entity.getCreatedBy());
}
```

### 4. Monitor Projection Failures
Set up alerts for:
- Event processor errors
- Retry attempts
- Failed projections after max retries

---

**Status:** ✅ FIXED
**Modified Files:** 1 (ProtocolVersionProjection.java)
**Lines Changed:** 1 line added
**Impact:** High (blocks all protocol version creation)
**Deployment:** Requires backend restart for Axon to replay failed event
