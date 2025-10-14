# CRITICAL ISSUE SUMMARY: Events Not Being Persisted to Event Store

**Date:** October 13, 2025  
**Status:** 🔴 **UNRESOLVED** - Events emitted but NOT persisted  
**Impact:** BLOCKING - Cannot complete patient screening workflow

---

## Problem Statement

**Symptoms:**
- ✅ Commands execute successfully
- ✅ Aggregates emit events (logs confirm "Event emitted")
- ✅ Event sourcing handlers update aggregate state
- ❌ **Events are NOT persisted to `domain_event_entry` table**
- ❌ Projectors never receive events
- ❌ Read models never updated

**Evidence:**
```sql
-- Event store state:
Latest event: index=53, timestamp=2025-10-12T21:26:33 (YESTERDAY)
Events from today (2025-10-13): ZERO

-- Missing events:
PatientStatusChangedEvent (multiple attempts)
FormDataSubmittedEvent (multiple attempts)
```

---

## Investigation Timeline

### Phase 1: Database Schema Issues ✅ FIXED
- **Issue:** Missing columns in `study_form_data` table
- **Fix:** Created V1.17 (aggregate_uuid) and V1.18 (related_record_id) migrations
- **Result:** Form submission no longer throws SQL errors, but events still not persisted

### Phase 2: Projection Timing ✅ ADDRESSED
- **Issue:** Service querying database immediately after command
- **Fix:** Added `waitForFormDataProjection()` with exponential backoff
- **Result:** Service now waits up to 5 seconds, but projector never called because events not persisted

### Phase 3: Axon Transaction Manager ❌ DID NOT FIX
- **Issue:** Suspected transaction manager misconfiguration
- **Fix:** Added explicit `SpringTransactionManager` bean in `AxonConfig`
- **Result:** Bean is created (`SpringTransactionManager@3022a40e`), but events still not persisted

---

## Technical Analysis

### What's Working ✅
```java
// Patient Registration (WORKS)
@CommandHandler
public PatientAggregate(RegisterPatientCommand command) {
    AggregateLifecycle.apply(PatientRegisteredEvent);  // ← Event IS persisted
}
```

**Why it works:** Constructor command handler creates NEW aggregate with NO prior state

### What's Broken ❌
```java
// Patient Status Change (FAILS)
@CommandHandler
public void handle(ChangePatientStatusCommand command) {
    AggregateLifecycle.apply(PatientStatusChangedEvent);  // ← Event NOT persisted
}

// Form Data Submission (FAILS)
@CommandHandler  
public FormDataAggregate(SubmitFormDataCommand command) {
    AggregateLifecycle.apply(FormDataSubmittedEvent);  // ← Event NOT persisted
}
```

**Why it fails:** Instance method handler loads EXISTING aggregate, events applied but NOT committed

---

## Key Observations

### 1. Command Returns NULL
```
ChangePatientStatusCommand processed successfully: null
```
- Void command handlers return `null` in Axon
- This is NORMAL behavior
- **BUT**: The event should still be persisted!

### 2. No Axon Errors
```
$ grep -i "error|exception|failed" logs | grep -i axon
(no results)
```
- No transaction rollback logs
- No constraint violation errors
- No event store errors
- **Silent failure** - events not persisted without any error

### 3. Transaction Manager Configured
```
2025-10-13 11:55:15 [main] DEBUG org.axonframework.config.Component -
Instantiated component [TransactionManager]:
org.axonframework.spring.messaging.unitofwork.SpringTransactionManager@3022a40e
```
- SpringTransactionManager IS being created
- Should wrap Spring's PlatformTransactionManager
- **BUT**: Still not working

### 4. Aggregate Loading Works
```
Aggregate state:
- event_count: 1 (PatientRegisteredEvent exists)
- last_sequence: 0
- Aggregate loaded successfully for status change command
- Command handler executes
- Event sourcing handler updates state
```
- Aggregate CAN be loaded from event store
- Event sourcing IS working for existing events
- **BUT**: New events not persisted

---

## Root Cause Hypotheses

### Hypothesis 1: Unit of Work Not Committing ⚠️ **MOST LIKELY**
**Theory:** Axon's Unit of Work is starting transactions but not committing them

**Evidence:**
- Events applied to in-memory aggregate ✅
- Events NOT in database ❌
- No rollback errors ❌
- Silent failure pattern

**Test:**
```java
// Add to PatientAggregate command handler
@CommandHandler
public void handle(ChangePatientStatusCommand command) {
    logger.info("=== UOW STATUS: {}", CurrentUnitOfWork.isStarted());
    logger.info("=== Transaction: {}", TransactionSynchronizationManager.isActualTransactionActive());
    
    AggregateLifecycle.apply(event);
    
    logger.info("=== After apply - UOW phase: {}", CurrentUnitOfWork.get().phase());
}
```

### Hypothesis 2: Event Store Engine Misconfiguration ⚠️ **POSSIBLE**
**Theory:** JpaEventStorageEngine not properly connected to EntityManager

**Evidence:**
- No SQL INSERT logs for `domain_event_entry`
- Events applied but not persisted
- EntityManager might be in wrong scope

**Test:**
```java
// Check if EntityManager is working
@EventSourcingHandler
public void on(PatientStatusChangedEvent event) {
    logger.info("EntityManager: {}", entityManager);
    logger.info("EntityManager open: {}", entityManager.isOpen());
    logger.info("Transaction active: {}", entityManager.getTransaction().isActive());
}
```

### Hypothesis 3: Repository Configuration Issue ⚠️ **LESS LIKELY**
**Theory:** Axon not creating repository beans correctly

**Evidence:**
- PatientAggregate has `@Aggregate` annotation ✅
- Axon logs show aggregate instantiation ✅
- Constructor handler works (PatientRegisteredEvent) ✅

### Hypothesis 4: Spring Boot Auto-Configuration Conflict ⚠️ **POSSIBLE**
**Theory:** Spring Boot's Axon auto-configuration conflicting with manual config

**Evidence:**
- We have custom `AxonConfig` class
- Spring Boot might be creating duplicate beans
- Transaction manager might be wrong instance

**Test:**
```properties
# Disable Axon auto-configuration
spring.autoconfigure.exclude=org.axonframework.springboot.autoconfig.AxonAutoConfiguration
```

---

## Diagnostic Steps (Priority Order)

### 🔴 **CRITICAL - DO FIRST**

#### 1. Enable Axon TRACE Logging
Edit `application.properties`:
```properties
logging.level.org.axonframework=TRACE
logging.level.org.axonframework.eventsourcing=TRACE
logging.level.org.axonframework.eventsourcing.eventstore.jpa=TRACE
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.level.org.springframework.transaction=DEBUG
```

**What to look for:**
- "Storing event" or "Persisting event" messages
- SQL INSERT statements for `domain_event_entry`
- Transaction BEGIN/COMMIT/ROLLBACK logs
- Unit of Work lifecycle logs

#### 2. Add Unit of Work Diagnostics
In `PatientAggregate.handle()`:
```java
@CommandHandler
public void handle(ChangePatientStatusCommand command) {
    logger.info("===== DIAGNOSTICS START =====");
    logger.info("UnitOfWork started: {}", CurrentUnitOfWork.isStarted());
    if (CurrentUnitOfWork.isStarted()) {
        logger.info("UnitOfWork phase: {}", CurrentUnitOfWork.get().phase());
        logger.info("UnitOfWork transaction: {}", CurrentUnitOfWork.get().getExecutionResult().getTransactionIdentifier());
    }
    logger.info("Spring transaction active: {}", TransactionSynchronizationManager.isActualTransactionActive());
    logger.info("Spring transaction name: {}", TransactionSynchronizationManager.getCurrentTransactionName());
    
    // Existing code...
    AggregateLifecycle.apply(event);
    
    logger.info("After apply - UnitOfWork phase: {}", CurrentUnitOfWork.get().phase());
    logger.info("===== DIAGNOSTICS END =====");
}
```

#### 3. Check EntityManager State
In `AxonConfig`:
```java
@Bean
public JpaEventStorageEngine eventStorageEngine(
    TransactionManager axonTransactionManager,
    Serializer eventSerializer
) {
    logger.info("===== CREATING EVENT STORAGE ENGINE =====");
    logger.info("EntityManager: {}", entityManager);
    logger.info("EntityManager class: {}", entityManager.getClass().getName());
    logger.info("Transaction Manager: {}", axonTransactionManager);
    
    JpaEventStorageEngine engine = JpaEventStorageEngine.builder()
        .entityManagerProvider(() -> {
            logger.debug("Providing EntityManager: {}", entityManager);
            return entityManager;
        })
        .transactionManager(axonTransactionManager)
        .eventSerializer(eventSerializer)
        .snapshotSerializer(eventSerializer)
        .build();
        
    logger.info("Event Storage Engine created: {}", engine);
    return engine;
}
```

### ⚠️ **HIGH PRIORITY**

#### 4. Test Direct Event Store Insert
Create a test endpoint:
```java
@RestController
@RequestMapping("/api/test")
public class AxonTestController {
    
    @Autowired
    private EventStore eventStore;
    
    @Autowired
    private EntityManager entityManager;
    
    @PostMapping("/test-event-store")
    @Transactional
    public String testEventStore() {
        // Try to manually insert an event
        DomainEventMessage<?> event = new GenericDomainEventMessage<>(
            "TestAggregate",
            UUID.randomUUID().toString(),
            0L,
            new TestEvent("test data"),
            MetaData.empty()
        );
        
        eventStore.publish(event);
        entityManager.flush();
        
        return "Event published";
    }
}
```

#### 5. Check for Duplicate Transaction Managers
```java
@RestController
@RequestMapping("/api/test")
public class BeanTestController {
    
    @Autowired
    private ApplicationContext context;
    
    @GetMapping("/transaction-managers")
    public Map<String, String> listTransactionManagers() {
        Map<String, String> result = new HashMap<>();
        
        // List ALL beans
        String[] beanNames = context.getBeanDefinitionNames();
        for (String name : beanNames) {
            if (name.toLowerCase().contains("transaction")) {
                Object bean = context.getBean(name);
                result.put(name, bean.getClass().getName());
            }
        }
        
        return result;
    }
}
```

---

## Workaround Options

### Option 1: Use Direct Database Access (NOT RECOMMENDED)
Bypass event sourcing temporarily:
```java
// In PatientStatusService
@Transactional
public void changePatientStatus(...) {
    // Skip CommandGateway, write directly to database
    PatientStatusHistoryEntity history = new PatientStatusHistoryEntity();
    // ... populate fields
    repository.save(history);
}
```
**Pros:** Immediate fix  
**Cons:** Loses event sourcing benefits, audit trail incomplete

### Option 2: Switch to Different Event Store (MAJOR CHANGE)
Use AxonDB or Axon Server instead of JPA event store.

**Pros:** Might avoid JPA transaction issues  
**Cons:** Requires infrastructure setup, migration

### Option 3: Use Synchronous Event Processing (TEMPORARY)
Force synchronous event handling:
```java
@Bean
public EventProcessingConfigurer eventProcessingConfigurer() {
    return configurer -> configurer
        .registerTrackingEventProcessor("default", 
            config -> TrackingEventProcessorConfiguration.forSingleThreadedProcessing());
}
```

---

## Next Immediate Actions

1. **Enable TRACE logging** (see above)
2. **Add diagnostics** to PatientAggregate
3. **Restart application**
4. **Test screening workflow**
5. **Send complete logs** from startup through failure

The TRACE logs will reveal:
- ✅ Exactly where event persistence fails
- ✅ What transaction state is at failure point
- ✅ Which component is not committing

---

## Files Modified

**Configuration:**
- ✅ `backend/clinprecision-axon-lib/src/main/java/com/clinprecision/axon/config/AxonConfig.java`
  - Added `SpringTransactionManager` bean

**Services:**
- ✅ `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/formdata/service/StudyFormDataService.java`
  - Added `waitForFormDataProjection()` method

**Database:**
- ✅ Created `V1.17__add_aggregate_uuid_to_study_form_data.sql`
- ✅ Created `V1.18__add_missing_columns_to_study_form_data.sql`
- ✅ Created `URGENT_FIX_FORM_DATA_TABLE.sql`

**Documentation:**
- ✅ Created `EVENT_SOURCING_DIAGNOSTIC_GUIDE.md`
- ✅ Created this summary document

---

##References

- [Axon Framework Unit of Work](https://docs.axoniq.io/reference-guide/axon-framework/tuning/unit-of-work)
- [Axon JPA Event Store Configuration](https://docs.axoniq.io/reference-guide/axon-framework/events/event-store#jpa-event-store)
- [Spring Transaction Management with Axon](https://docs.axoniq.io/reference-guide/axon-framework/tuning/transaction-management)

---

**Status:** Awaiting TRACE logs to identify exact failure point
