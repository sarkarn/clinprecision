# Study Status NULL Bug - Deep Investigation with Entity Lifecycle Logging

## 🚨 **Bug Confirmed: Study 7 Status is NULL**

User confirmed that despite logs showing:
```
12:40:32 - BEFORE version save - Study 7 status: PLANNING ✅
12:40:32 - AFTER version save - Study 7 status: PLANNING ✅
```

The database has `study_status_id = NULL` and frontend shows "DRAFT".

## 🔍 **Critical Discovery**

**The bug is happening SILENTLY** - no `PUT /api/studies` logs appear, meaning:
1. Not going through `StudyService.updateStudy()` 
2. Not triggering our BEFORE/AFTER logging
3. Happening via a different code path

## 🎯 **New Diagnostic Approach: JPA Lifecycle Logging**

Added comprehensive logging to `StudyEntity` JPA lifecycle callbacks:

### @PrePersist Logging
```java
@PrePersist
protected void onCreate() {
    logger.info("🟢 @PrePersist - Study {} being created, status: {}", name, status);
    if (studyStatus == null) {
        logger.warn("🔴 Study {} has NULL status during @PrePersist!", name);
    }
    // ... rest of onCreate logic
}
```

### @PreUpdate Logging with Stack Trace
```java
@PreUpdate  
protected void onUpdate() {
    logger.info("🔵 @PreUpdate - Study {} (id:{}) being updated, status: {}", name, id, status);
    
    if (studyStatus == null) {
        logger.error("🚨 CRITICAL @PreUpdate - Study {} status is NULL! This will write NULL to database!", name);
        // Print full stack trace to see what triggered this update
        try {
            throw new RuntimeException("Stack trace for NULL status during @PreUpdate");
        } catch (Exception e) {
            logger.error("Call stack for NULL status update:", e);
        }
    }
    
    updatedAt = LocalDateTime.now();
}
```

## 🔬 **What This Will Reveal**

### Expected Log Output When Bug Occurs:

```
12:40:32 - Creating version for study 7
12:40:32 - BEFORE version save - Study 7 status: PLANNING
12:40:32 - Saving version v1.0 for study 7
12:40:32 - Version saved with id: 8

[Sometime between 12:40:32 and 12:42:47...]

🔵 @PreUpdate - Study Oncology Immunotherapy Combination Study (id:7) being updated, status: NULL
🚨 CRITICAL @PreUpdate - Study Oncology Immunotherapy Combination Study (id:7) status is NULL!
Call stack for NULL status update:
    at com.clinprecision.common.entity.clinops.StudyEntity.onUpdate(StudyEntity.java:208)
    at [JPA framework calls]
    at [Service method that triggered update]
    at [Controller or scheduled task]
```

The **stack trace will show EXACTLY** what code path is updating the study with NULL status!

## 🎯 **Possible Culprits Revealed by Stack Trace**

### 1. JPA Merge During Transaction
```
at org.hibernate.event.internal.DefaultMergeEventListener.onMerge(...)
at com.clinprecision.clinopsservice.service.SomeService.someMethod(...)
```

### 2. Cascade Save from Related Entity
```
at org.hibernate.engine.spi.CascadingActions$SaveUpdateAction.cascade(...)
at com.clinprecision.clinopsservice.service.OrganizationService.updateOrg(...)
```

### 3. Automated Status Computation
```
at com.clinprecision.clinopsservice.service.StudyStatusComputationService.computeAndUpdateStudyStatus(...)
at com.clinprecision.clinopsservice.controller.StudyStatusController.computeStatus(...)
```

### 4. Scheduled Task or Background Job
```
at com.clinprecision.clinopsservice.service.AutomatedStatusComputationService.run(...)
at org.springframework.scheduling.support.ScheduledMethodRunnable.run(...)
```

### 5. Entity Graph Loading Issue
```
at org.hibernate.loader.entity.plan.AbstractLoadPlanBasedEntityLoader.load(...)
at com.clinprecision.clinopsservice.service.StudyService.someMethod(...)
```

## 🔧 **Next Test Steps**

### 1. Rebuild Common Lib and Service
```powershell
# Rebuild common lib (where StudyEntity lives)
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib
mvn clean install

# Rebuild clinops service
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
mvn clean install
```

### 2. Restart Service
Restart clinops-service to load the new code.

### 3. Reproduce the Bug
- Create a new study with PLANNING status
- Create protocol version v1.0
- Wait or navigate around the UI

### 4. Check Logs for Stack Trace
Look for:
```
🔵 @PreUpdate - Study ... being updated
🚨 CRITICAL @PreUpdate - Study ... status is NULL!
Call stack for NULL status update:
```

### 5. Analyze Stack Trace
The stack trace will show the **exact line of code** that's triggering the update.

## 📊 **Hypotheses to Verify**

### Hypothesis A: Status Computation Service
- `StudyStatusComputationService.computeAndUpdateStudyStatus()` might be called automatically
- If it can't find proper status, might set NULL
- Stack trace would show: `...StatusComputationService...`

### Hypothesis B: JPA Session Flush
- Hibernate might be flushing dirty entities
- If `studyStatus` field was not properly initialized
- Stack trace would show: `...DefaultFlushEventListener...`

### Hypothesis C: Entity Manager Merge
- Some code might be calling `entityManager.merge()` with detached entity
- If detached entity has NULL status
- Stack trace would show: `...DefaultMergeEventListener...`

### Hypothesis D: Cascade from OrganizationStudyEntity
- Updating organization associations might cascade to study
- Stack trace would show: `...CascadingActions...`

### Hypothesis E: Scheduled Background Task
- Automated process updating studies
- Stack trace would show: `...ScheduledMethodRunnable...`

## ✅ **What Makes This Approach Definitive**

1. **Catches ALL updates** - Every JPA update goes through @PreUpdate
2. **Shows full call stack** - We'll see exact code path
3. **Cannot be bypassed** - JPA always calls lifecycle callbacks
4. **Happens at the moment** - Right when NULL is about to be written

## 📝 **Files Modified**

1. **StudyEntity.java**
   - Added Logger import
   - Added static logger field
   - Enhanced @PrePersist with status logging
   - **Enhanced @PreUpdate with NULL detection and stack trace logging**

## 🎯 **Expected Outcome**

After rebuilding and testing, the logs will show:
1. 🟢 When study is created
2. 🔵 Every time study is updated
3. 🚨 **CRITICAL alert with full stack trace when status is NULL**

**This will give us the smoking gun** - the exact code path causing the bug!

## 💡 **Once We Have Stack Trace**

We can:
1. Identify the exact service/repository/controller method
2. Understand why status is NULL at that point
3. Add proper fix at the source
4. Test to confirm fix works

---

## 🔄 **Action Required**

Please:
1. Rebuild both common-lib and clinops-service
2. Restart the service
3. Create new study + version
4. Share the **complete stack trace** from the logs

The stack trace will tell us everything! 🎯
