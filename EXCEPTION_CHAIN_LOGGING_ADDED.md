# Exception Chain Logging Implementation

**Date:** October 21, 2025  
**Purpose:** Add comprehensive exception chain logging to diagnose wrapped Axon Framework exceptions

## Problem Statement

When Axon Framework command handlers throw exceptions, they are often wrapped in `CommandExecutionException`. The logs typically show only the outer exception message (e.g., "Cannot reuse aggregate identifier"), making it difficult to identify the root cause.

## Solution Implemented

Added comprehensive exception chain logging to capture the entire exception hierarchy, including:
- Exception class names at each level
- Exception messages at each level
- Stack traces (first 5 elements) for each exception in the chain
- Protection against infinite loops (max 10 levels)

## Files Modified

### 1. StudyCommandService.java
**Location:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydesign/studymgmt/service/StudyCommandService.java`

**Changes:**
- Added try-catch blocks around all `commandGateway.sendAndWait()` calls
- Added `logExceptionChain()` helper method
- Wrapped the following command dispatch methods:
  - `createStudy()` - Study creation
  - `updateStudy()` - Study updates
  - `suspendStudy()` - Study suspension
  - `terminateStudy()` - Study termination
  - `withdrawStudy()` - Study withdrawal
  - `completeStudy()` - Study completion
  - `changeStudyStatus()` - Generic status changes
  - `migrateLegacyStudyToEventStore()` - Legacy study migration

**New Helper Method:**
```java
private void logExceptionChain(Throwable throwable) {
    log.error("=== EXCEPTION CHAIN START ===");
    int level = 0;
    Throwable current = throwable;
    
    while (current != null) {
        log.error("Exception level {}: {} - {}", 
            level, 
            current.getClass().getName(), 
            current.getMessage());
        
        // Log stack trace for this level (first 5 elements)
        StackTraceElement[] stackTrace = current.getStackTrace();
        if (stackTrace != null && stackTrace.length > 0) {
            log.error("  Stack trace (first 5 elements):");
            int limit = Math.min(5, stackTrace.length);
            for (int i = 0; i < limit; i++) {
                log.error("    at {}", stackTrace[i]);
            }
        }
        
        current = current.getCause();
        level++;
        
        if (level > 10) {
            log.error("Exception chain too deep (>10 levels), stopping trace");
            break;
        }
    }
    
    log.error("=== EXCEPTION CHAIN END ===");
}
```

### 2. StudyDesignAutoInitializationService.java
**Location:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydesign/design/service/StudyDesignAutoInitializationService.java`

**Changes:**
- Enhanced `isDuplicateAggregateError()` to log each level of exception chain at DEBUG level
- Added `logExceptionChain()` helper method (similar to StudyCommandService)
- Updated exception handlers in `initializeStudyDesign()` to use `logExceptionChain()`
- Added detailed diagnostic logging to understand exception propagation

**Enhanced Duplicate Detection:**
```java
private boolean isDuplicateAggregateError(Throwable throwable) {
    log.debug("Checking if exception is duplicate aggregate error");
    Throwable current = throwable;
    int level = 0;
    while (current != null) {
        log.debug("  Level {}: {} - {}", level, current.getClass().getName(), current.getMessage());
        if (current.getMessage() != null) {
            String message = current.getMessage();
            if (message.contains("Cannot reuse aggregate identifier") || message.contains("already exists")) {
                log.debug("  -> Matched duplicate aggregate error at level {}", level);
                return true;
            }
        }
        // ... additional checks
        current = current.getCause();
        level++;
    }
    log.debug("  -> Not a duplicate aggregate error");
    return false;
}
```

## How to Use

### 1. When creating a new study fails:
```
ERROR - Failed to create study: Test Study with UUID: 123e4567-e89b-12d3-a456-426614174000
ERROR - === EXCEPTION CHAIN START ===
ERROR - Exception level 0: org.axonframework.commandhandling.CommandExecutionException - Error handling command
ERROR -   Stack trace (first 5 elements):
ERROR -     at org.axonframework.commandhandling.gateway.DefaultCommandGateway.sendAndWait(...)
ERROR -     at com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyCommandService.createStudy(...)
ERROR - Exception level 1: java.lang.IllegalStateException - Cannot reuse aggregate identifier
ERROR -   Stack trace (first 5 elements):
ERROR -     at org.axonframework.eventsourcing.EventSourcingRepository.doCreateNew(...)
ERROR -     at org.axonframework.modelling.command.AbstractRepository.newInstance(...)
ERROR - Exception level 2: com.yourapp.YourActualException - The real root cause
ERROR -   Stack trace (first 5 elements):
ERROR -     at com.clinprecision.clinopsservice.studydesign.studymgmt.aggregate.StudyAggregate.<init>(...)
ERROR - === EXCEPTION CHAIN END ===
```

### 2. When StudyDesign initialization fails:
```
ERROR - Failed to auto-initialize StudyDesign for study: Test Study
ERROR - === STUDYDESIGN EXCEPTION CHAIN START ===
ERROR - Exception level 0: java.util.concurrent.CompletionException - ...
ERROR - Exception level 1: org.axonframework.commandhandling.CommandExecutionException - ...
ERROR - Exception level 2: [Root cause exception class] - [Actual error message]
ERROR - === STUDYDESIGN EXCEPTION CHAIN END ===
```

### 3. Enable DEBUG logging for detailed duplicate detection:
Add to `application.properties`:
```properties
logging.level.com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignAutoInitializationService=DEBUG
```

## Benefits

1. **Root Cause Visibility:** Can now see the actual exception that caused the failure, not just the Axon wrapper
2. **Faster Debugging:** Stack traces at each level help identify where in the code the problem originated
3. **Better Diagnostics:** Can distinguish between actual duplicate aggregate errors and other validation failures
4. **Production Support:** Exception chains are logged in production environments for post-mortem analysis

## Next Steps

1. **Test the logging:** Create a new study and observe the exception chain if it fails
2. **Verify database state:** Use the exception chain to determine if it's a true duplicate or another issue
3. **Check event store:** Query `domain_event_entry` table to confirm event presence
4. **Adjust log levels:** If logs are too verbose, adjust to ERROR for production

## Example Queries to Complement Logging

```sql
-- Check if events exist for a study aggregate
SELECT * FROM domain_event_entry 
WHERE aggregate_identifier = '<study-uuid>' 
ORDER BY sequence_number;

-- Check if StudyDesign events exist
SELECT * FROM domain_event_entry 
WHERE aggregate_identifier = '<studydesign-uuid>' 
ORDER BY sequence_number;

-- Count events by aggregate type
SELECT type, COUNT(*) 
FROM domain_event_entry 
GROUP BY type;
```

## Related Issues

- Duplicate aggregate identifier errors during study creation
- Unclear exception messages from Axon Framework
- Difficulty diagnosing wrapped exceptions in CQRS/Event Sourcing

## Verification

To verify the changes are working:
1. Restart the backend service
2. Attempt to create a study
3. If it fails, check the logs for `=== EXCEPTION CHAIN START ===`
4. Review each exception level to identify the root cause
5. Enable DEBUG logging on `StudyDesignAutoInitializationService` to see duplicate detection logic
