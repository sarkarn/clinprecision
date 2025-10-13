# Event Sourcing Diagnostic Guide

**Date:** October 13, 2025  
**Issue:** Events emitted but not persisted to event store  
**Symptoms:** PatientStatusChangedEvent and FormDataSubmittedEvent show as "applied" in logs but projectors never receive them

---

## Problem Summary

### What's Happening
1. ✅ Commands are received and handled correctly
2. ✅ Aggregates emit events (logs show "Event applied")
3. ❌ Events are **NOT persisted** to `domain_event_entry` table
4. ❌ Projectors never receive events (no projection logs)
5. ❌ Status history and form data records never created

### Evidence
```sql
-- Last event in store from YESTERDAY
SELECT MAX(global_index), MAX(time_stamp) FROM domain_event_entry;
-- Result: index=53, timestamp=2025-10-12T21:26:33

-- FormDataSubmittedEvent from today: NOT FOUND
SELECT * FROM domain_event_entry 
WHERE aggregate_identifier = '746f9b1a-d9d6-4743-a2aa-2360f6e0c259';
-- Result: 0 rows

-- PatientStatusChangedEvent from today: NOT FOUND  
SELECT * FROM domain_event_entry 
WHERE aggregate_identifier = 'c7118e02-49cb-4524-aeea-3fc05d4bfa3c' 
  AND payload_type LIKE '%StatusChanged%';
-- Result: 0 rows (only PatientRegisteredEvent exists)
```

---

## Root Cause Analysis

### Possible Causes

#### 1. **Transaction Rollback (Most Likely)**
The event is applied in the aggregate, but the transaction is rolled back before commit, so the event is never persisted to the database.

**Check:**
- Look for exceptions AFTER "Event applied" log
- Check for constraint violations
- Look for transaction rollback logs

**Evidence from logs:**
```
2025-10-13 13:52:04 - FormDataSubmittedEvent applied
2025-10-13 13:52:04 - Error submitting form data: Form data not found after submission
```

The service queries for the record immediately after command completion, but:
1. Projector runs asynchronously
2. If this throws exception, transaction might roll back
3. Event never persisted

#### 2. **Axon Transaction Manager Misconfiguration**
The Axon `TransactionManager` might not be properly configured to use JPA transactions.

**Check:**
```java
// In AxonConfig.java
@Bean
public JpaEventStorageEngine eventStorageEngine(
    TransactionManager transactionManager,  // ← Is this correct?
    Serializer eventSerializer
) {
    return JpaEventStorageEngine.builder()
        .transactionManager(transactionManager)
        .build();
}
```

#### 3. **EntityManager Issues**
The `EntityManager` injected into `JpaEventStorageEngine` might not be in the correct transaction scope.

**Check:**
```java
@PersistenceContext
private EntityManager entityManager;  // ← Is this shared correctly?

.entityManagerProvider(() -> entityManager)
```

#### 4. **Missing @Aggregate Annotation Configuration**
The aggregates might need explicit repository configuration.

**Check:**
```java
@Aggregate(repository = "myAggregateRepository")
public class FormDataAggregate {
    // ...
}
```

---

## Diagnostic Steps

### Step 1: Enable Axon Debug Logging
Add to `application.properties`:
```properties
logging.level.org.axonframework=DEBUG
logging.level.org.axonframework.eventsourcing=TRACE
logging.level.org.axonframework.eventhandling=TRACE
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

Restart and check for:
- "Storing event" logs
- "Committing UnitOfWork" logs
- SQL INSERT statements for `domain_event_entry`
- Transaction BEGIN/COMMIT logs

### Step 2: Check Transaction Boundaries
Add logging to catch transaction issues:

```java
// In FormDataAggregate constructor
@CommandHandler
public FormDataAggregate(SubmitFormDataCommand command) {
    logger.info("=== COMMAND HANDLER START ===");
    logger.info("Transaction active: {}", 
        TransactionSynchronizationManager.isActualTransactionActive());
    
    // ... existing code ...
    
    AggregateLifecycle.apply(event);
    
    logger.info("=== EVENT APPLIED - Transaction status: {} ===", 
        TransactionSynchronizationManager.getCurrentTransactionName());
}
```

### Step 3: Check for Silent Exceptions
Wrap aggregate logic:

```java
@CommandHandler
public FormDataAggregate(SubmitFormDataCommand command) {
    try {
        logger.info("BEFORE event apply");
        AggregateLifecycle.apply(event);
        logger.info("AFTER event apply - SUCCESS");
    } catch (Exception e) {
        logger.error("EXCEPTION during event apply", e);
        throw e;
    }
}
```

### Step 4: Verify Axon Repository Bean
Check if Axon is creating the repository:

```java
// Add to your service
@Autowired
private Repository<FormDataAggregate> formDataRepository;

@PostConstruct
public void init() {
    logger.info("FormDataAggregate repository: {}", formDataRepository.getClass());
}
```

### Step 5: Manual Event Store Test
Try manually inserting an event:

```sql
INSERT INTO domain_event_entry (
    event_identifier,
    aggregate_identifier, 
    sequence_number,
    type,
    payload,
    payload_type,
    time_stamp
) VALUES (
    UUID(),
    'test-aggregate-id',
    0,
    'TestEvent',
    '{}',
    'com.test.TestEvent',
    NOW()
);
```

If this fails, there's a database-level issue.

---

## Quick Fixes to Try

### Fix 1: Add Explicit Transaction Management

```java
// In StudyFormDataService
@Transactional(propagation = Propagation.REQUIRES_NEW)
public FormSubmissionResponse submitFormData(FormSubmissionRequest request) {
    // Existing code
}
```

### Fix 2: Configure Axon Transaction Manager Explicitly

```java
// In AxonConfig
@Bean
public TransactionManager axonTransactionManager(
    EntityManagerFactory entityManagerFactory
) {
    return new JpaTransactionManager(entityManagerFactory);
}
```

### Fix 3: Use CommandGateway with Callback

```java
// In StudyFormDataService
CompletableFuture<String> future = commandGateway.send(command);
future.whenComplete((result, exception) -> {
    if (exception != null) {
        logger.error("Command failed", exception);
    } else {
        logger.info("Command succeeded: {}", result);
    }
});
```

### Fix 4: Configure Event Store Explicitly

```java
// In AxonConfig
@Bean
public EventStorageEngine eventStorageEngine(
    EntityManager entityManager,
    TransactionManager transactionManager
) {
    return JpaEventStorageEngine.builder()
        .snapshotSerializer(eventSerializer())
        .upcasterChain(new NoOpUpcasterChain())
        .persistenceExceptionResolver(new SQLStateAgnosticPersistenceExceptionResolver())
        .entityManagerProvider(() -> entityManager)
        .transactionManager(transactionManager)
        .build();
}
```

---

## Current Workaround

### ✅ Added Projection Wait Logic
Updated `StudyFormDataService.submitFormData()` to wait for projection with exponential backoff (same as `PatientStatusService`):

```java
private StudyFormDataEntity waitForFormDataProjection(String aggregateUuid) {
    // Polls database for up to 5 seconds
    // Attempts: 50ms, 100ms, 200ms, then 500ms x 10
    // Returns entity when found or throws exception
}
```

**This is a BAND-AID solution** - it works around the symptom but doesn't fix the root cause (events not being persisted).

---

## Next Steps

1. **RESTART APPLICATION** with new JAR (built at 14:37:29)
2. **Enable DEBUG logging** for Axon and Hibernate
3. **Test screening workflow** again
4. **Analyze new logs** for:
   - Transaction boundaries
   - SQL INSERT attempts
   - Axon event store operations
   - Any exceptions or warnings

5. **If still failing:**
   - Add transaction logging (Step 2)
   - Check Axon repository bean (Step 4)
   - Try manual event insert (Step 5)

---

## Expected Behavior

### Correct Event Flow
```
1. Command received
2. Aggregate loaded (or created)
3. Command handler executes
4. AggregateLifecycle.apply(event) called
5. Event persisted to domain_event_entry  ← FAILING HERE
6. Event published to event bus
7. Projector receives event
8. Projector updates read model
9. Transaction commits
10. Service can query read model
```

### Current (Broken) Flow
```
1. Command received ✅
2. Aggregate created ✅
3. Command handler executes ✅
4. AggregateLifecycle.apply(event) called ✅
5. Event NOT persisted ❌  ← PROBLEM
6. Event NOT published ❌
7. Projector never called ❌
8. Read model never updated ❌
9. Service times out waiting ❌
```

---

## Database Schema Reference

### domain_event_entry Table
```sql
CREATE TABLE domain_event_entry (
    global_index BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    INDEX idx_aggregate (aggregate_identifier, sequence_number),
    INDEX idx_timestamp (time_stamp),
    UNIQUE KEY uk_event_sequence (aggregate_identifier, sequence_number)
);
```

### Check for Constraints
```sql
SHOW CREATE TABLE domain_event_entry;
-- Look for UNIQUE constraints that might be violated
```

---

## Related Files

**Configuration:**
- `backend/clinprecision-axon-lib/src/main/java/com/clinprecision/axon/config/AxonConfig.java`

**Aggregates:**
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/formdata/aggregate/FormDataAggregate.java`
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/aggregate/PatientAggregate.java`

**Services:**
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/formdata/service/StudyFormDataService.java`
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/service/PatientStatusService.java`

**Projectors:**
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/formdata/projection/FormDataProjector.java`
- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/patientenrollment/projection/PatientEnrollmentProjector.java`

---

## References

- [Axon Framework Transactions](https://docs.axoniq.io/reference-guide/axon-framework/tuning/transaction-management)
- [Axon JPA Event Store](https://docs.axoniq.io/reference-guide/axon-framework/events/event-store#jpa-event-store)
- [Spring Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
