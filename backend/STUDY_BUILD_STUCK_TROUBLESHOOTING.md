# Study Build Stuck - Troubleshooting Guide

**Issue**: Study build is not progressing. Frontend is polling every 30 seconds but build remains stuck.

**Symptoms**:
- Continuous logs showing: "API Request: Get builds from last 30 days"
- No worker service logs: "Worker received StudyDatabaseBuildStartedEvent"
- No phase logs: "Phase 1: Validating study design"
- Build status stuck at low progress percentage

---

## Step 1: Check Build Status in Database

Run this SQL query to see what's happening:

```sql
-- Check current build status
SELECT 
    id,
    aggregate_uuid,
    study_id,
    build_status,
    build_progress,
    phase_number,
    build_started_at,
    TIMESTAMPDIFF(MINUTE, build_started_at, NOW()) as minutes_running,
    error_message
FROM study_database_builds
WHERE build_status = 'IN_PROGRESS'
ORDER BY build_started_at DESC;
```

### Expected Results:

**Scenario A: Build stuck for >5 minutes**
- `build_status = 'IN_PROGRESS'`
- `minutes_running > 5`
- This indicates a hung build

**Scenario B: No builds in progress**
- Query returns 0 rows
- But frontend shows a build running
- This indicates a frontend/backend sync issue

**Scenario C: Multiple builds stuck**
- Multiple rows with `IN_PROGRESS`
- Indicates worker service not processing events

---

## Step 2: Check Event Store

Verify that build events are being created:

```sql
-- Check recent build events
SELECT 
    event_id,
    event_type,
    aggregate_id,
    occurred_at,
    event_data
FROM event_store
WHERE aggregate_type = 'StudyDatabaseBuild'
  AND event_type = 'StudyDatabaseBuildStartedEvent'
ORDER BY occurred_at DESC
LIMIT 5;
```

### Expected Results:

**Scenario A: Events exist but no worker logs**
- Events are in event_store
- But worker service never logged "Worker received StudyDatabaseBuildStartedEvent"
- **Root Cause**: Worker event handler not subscribed or Axon event processing is broken

**Scenario B: No events created**
- No events in event_store
- **Root Cause**: Command handler not creating events properly

---

## Step 3: Check Axon Event Processor Status

The worker service uses Axon Framework's event processing. Check if the event processor is running:

### Check Application Logs

Look for these Axon-related logs at service startup:

```
Starting EventProcessor 'org.axonframework.eventhandling'
Subscribing event processor
```

### Check for Errors

Search logs for these error patterns:

```
EventProcessingException
AxonServerConnectionException
Failed to process event
```

---

## Step 4: Check Thread Pool Configuration

The worker service uses `@Async("databaseBuildExecutor")`. Check if the thread pool is configured:

### Look for AsyncConfig.java

File: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/config/AsyncConfig.java`

Expected configuration:
```java
@Bean(name = "databaseBuildExecutor")
public ThreadPoolTaskExecutor databaseBuildExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("db-build-");
    executor.initialize();
    return executor;
}
```

### Check if @EnableAsync is present

File: `ClinopsServiceApplication.java` should have:
```java
@EnableAsync
@SpringBootApplication
public class ClinopsServiceApplication {
    // ...
}
```

---

## Step 5: Immediate Fixes

### Fix 1: Manually Mark Stuck Build as Failed

If a build is stuck in IN_PROGRESS for >5 minutes:

```sql
-- Get the stuck build UUID
SELECT aggregate_uuid, study_id, build_started_at 
FROM study_database_builds 
WHERE build_status = 'IN_PROGRESS' 
  AND TIMESTAMPDIFF(MINUTE, build_started_at, NOW()) > 5;

-- Mark it as failed (replace YOUR-BUILD-UUID)
UPDATE study_database_builds 
SET build_status = 'FAILED',
    build_failed_at = NOW(),
    error_message = 'Build timeout - manually marked as failed after investigation'
WHERE aggregate_uuid = 'YOUR-BUILD-UUID-HERE';
```

### Fix 2: Restart Clinops Service

The worker service might be stuck. Restart it:

**Windows PowerShell:**
```powershell
# Stop the service (Ctrl+C in the terminal running it)

# Restart it
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

**Docker:**
```bash
docker-compose restart clinops-service
```

### Fix 3: Clear Event Processor Token Store

If Axon event processing is stuck, you may need to reset the token store:

```sql
-- Check if token_entry table exists
SHOW TABLES LIKE '%token%';

-- If it exists, reset the event processor position
-- WARNING: This will cause ALL events to be replayed
-- DELETE FROM token_entry WHERE processor_name = 'org.axonframework.eventhandling.TrackingEventProcessor';
```

---

## Step 6: Check Logs in the Right Place

### Find the Correct Log File

The worker service logs might be in a different location:

**Spring Boot default locations:**
1. Console output (stdout)
2. `backend/clinprecision-clinops-service/logs/spring.log`
3. `backend/clinprecision-clinops-service/logs/clinops-service.log`

**Check logging configuration:**
File: `backend/clinprecision-clinops-service/src/main/resources/application.yml`

```yaml
logging:
  level:
    com.clinprecision.clinopsservice.studydatabase: DEBUG  # Enable debug logs for worker
    org.axonframework.eventhandling: DEBUG                  # Enable Axon event processing logs
  file:
    name: logs/clinops-service.log
```

### Tail the Log File

**Windows PowerShell:**
```powershell
Get-Content -Path "backend\clinprecision-clinops-service\logs\clinops-service.log" -Wait -Tail 50
```

**Windows CMD:**
```cmd
tail -f backend\clinprecision-clinops-service\logs\clinops-service.log
```

---

## Step 7: Test Event Handler Directly

Create a test to verify the worker service event handler:

### Check if Worker Service Bean Exists

Add temporary logging to ClinopsServiceApplication.java:

```java
@SpringBootApplication
@EnableAsync
public class ClinopsServiceApplication {
    
    @Autowired(required = false)
    private StudyDatabaseBuildWorkerService workerService;
    
    public static void main(String[] args) {
        SpringApplication.run(ClinopsServiceApplication.class, args);
    }
    
    @PostConstruct
    public void checkWorkerService() {
        if (workerService != null) {
            log.info("✓ StudyDatabaseBuildWorkerService bean found");
        } else {
            log.error("✗ StudyDatabaseBuildWorkerService bean NOT FOUND - Worker will not process events!");
        }
    }
}
```

---

## Step 8: Common Root Causes

### Root Cause 1: Missing @Component or @Service Annotation

Check if `StudyDatabaseBuildWorkerService` has proper Spring annotations:

```java
@Service  // <-- Must be present
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildWorkerService {
    // ...
}
```

### Root Cause 2: Axon Event Processor Not Subscribed

Check if the event processor is subscribed to the event bus. Look for this in logs:

```
Subscribing Tracking Event Processor 'org.axonframework.eventhandling.TrackingEventProcessor'
```

If missing, Axon is not set up correctly.

### Root Cause 3: @Async Not Working

The `@Async("databaseBuildExecutor")` might not be working if:
- `@EnableAsync` is missing from main application class
- Thread pool executor bean not configured
- Method calling `@Async` method is in same class (Spring proxy issue)

### Root Cause 4: Event Handler Method Signature Wrong

Check if the event handler method signature is correct:

```java
@EventHandler  // <-- Must be present
@Async("databaseBuildExecutor")  // <-- Correct executor name
public void onBuildStarted(StudyDatabaseBuildStartedEvent event) {  // <-- Correct event type
    // ...
}
```

---

## Step 9: Enable Detailed Logging

Update `application.yml` to enable debug logging:

```yaml
logging:
  level:
    # Worker service debug logs
    com.clinprecision.clinopsservice.studydatabase: DEBUG
    
    # Axon Framework debug logs
    org.axonframework.eventhandling: DEBUG
    org.axonframework.eventsourcing: DEBUG
    org.axonframework.commandhandling: DEBUG
    
    # Spring async debug logs
    org.springframework.scheduling: DEBUG
    org.springframework.aop.interceptor.AsyncExecutionInterceptor: DEBUG
    
    # Database debug logs
    org.hibernate.SQL: DEBUG
```

Restart the service after making this change.

---

## Step 10: Quick Diagnostic Script

Run this to check everything:

```bash
# Check if clinops-service is running
curl http://localhost:8081/actuator/health

# Check if study exists
curl http://localhost:8081/api/studies/{studyId}

# Manually trigger a new build via REST API
curl -X POST http://localhost:8081/api/studies/{studyId}/database/build \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# Watch the logs
tail -f backend/clinprecision-clinops-service/logs/clinops-service.log | grep -E "(Worker received|Phase [1-5]|executeBuild|FAILED|ERROR)"
```

---

## Most Likely Causes (Ranked by Probability)

1. **90% - Worker service not subscribed to Axon event bus**
   - Axon configuration issue
   - Event handler annotation missing/incorrect
   - Fix: Check Axon config, verify @EventHandler present

2. **5% - Build genuinely stuck in long-running operation**
   - Database query taking too long
   - Large number of forms/visits
   - Fix: Check database performance, add query timeouts

3. **3% - Async thread pool exhausted**
   - All worker threads busy with previous builds
   - Fix: Check thread pool configuration, increase pool size

4. **2% - Database connection issue**
   - Worker can't connect to database
   - Transaction timeout
   - Fix: Check database connection pool, increase timeout

---

## Next Steps

1. **Run the SQL query** from Step 1 to see build status
2. **Check application logs** for "Worker received" message
3. **Enable debug logging** (Step 9)
4. **Restart clinops-service** (Fix 2)
5. **Report back** with SQL query results and log output

---

## Expected Timeline

**Normal build**: 5-10 seconds
**Stuck build**: >5 minutes with no progress

If your build has been running for >5 minutes with no log output from the worker service, it's definitely stuck and needs intervention.
