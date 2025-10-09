# Phase 4 - Bean Conflict Resolution

## Date
October 5, 2025

## Issue Discovered

During Phase 4 testing, Spring Boot detected **duplicate bean name conflicts**:

### Conflict 1: StudyDocumentController ❌ RESOLVED
```
'studyDocumentController' conflicts between:
- com.clinprecision.clinopsservice.document.controller.StudyDocumentController (DDD - NEW)
- com.clinprecision.clinopsservice.controller.StudyDocumentController (Legacy - OLD)
```

**Solution**: Legacy controller was already deleted in prior cleanup ✅

### Conflict 2: StudyCommandService ❌ RESOLVED
```
'studyCommandService' conflicts between:
- com.clinprecision.clinopsservice.study.service.StudyCommandService (Study Aggregate)
- com.clinprecision.clinopsservice.studydesign.service.StudyCommandService (StudyDesign Aggregate)
```

**Root Cause**: Both packages have services with the same name but serve **different DDD aggregates**:
- `study/` package → **Study Aggregate** (study entity itself: name, phase, status)
- `studydesign/` package → **StudyDesign Aggregate** (study arms, visits, forms)

### Conflict 3: StudyQueryService ❌ RESOLVED
```
'studyQueryService' conflicts between:
- com.clinprecision.clinopsservice.study.service.StudyQueryService (Study Aggregate)
- com.clinprecision.clinopsservice.studydesign.service.StudyQueryService (StudyDesign Aggregate)
```

**Same Root Cause**: Bean name collision between two different aggregates

---

## Resolution Strategy

### ❌ WRONG Approach (Initially Attempted)
Deleting the entire `studydesign/` package (70 files) - **This was a mistake!**

The studydesign package is NOT legacy. It's a separate DDD aggregate:
- **StudyAggregate** (study/ package) - Handles study lifecycle, metadata
- **StudyDesignAggregate** (studydesign/ package) - Handles arms, visits, forms

### ✅ CORRECT Approach
**Rename services to disambiguate** using explicit bean names:

---

## Changes Made

### 1. Renamed StudyCommandService in studydesign package

**File**: `studydesign/service/StudyCommandService.java`

**Before**:
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyCommandService {
```

**After**:
```java
@Service("studyDesignCommandService")
@RequiredArgsConstructor
@Slf4j
public class StudyDesignCommandService {
```

**Reason**: Explicit bean name prevents Spring from auto-generating "studyCommandService"

---

### 2. Renamed StudyQueryService in studydesign package

**File**: `studydesign/service/StudyQueryService.java`

**Before**:
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyQueryService {
```

**After**:
```java
@Service("studyDesignQueryService")
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyDesignQueryService {
```

---

### 3. Updated Controller References

**Files Updated**: 2 controllers in studydesign package

#### StudyCommandController.java
```java
// OLD import
import com.clinprecision.clinopsservice.studydesign.service.StudyCommandService;

// NEW import
import com.clinprecision.clinopsservice.studydesign.service.StudyDesignCommandService;

// Field declaration
private final StudyDesignCommandService studyCommandService;
```

#### StudyQueryController.java
```java
// OLD import
import com.clinprecision.clinopsservice.studydesign.service.StudyQueryService;

// NEW import
import com.clinprecision.clinopsservice.studydesign.service.StudyDesignQueryService;

// Field declaration
private final StudyDesignQueryService studyQueryService;
```

---

## Final Bean Names

### Study Aggregate (study/ package)
- `studyCommandService` → `StudyCommandService`
- `studyQueryService` → `StudyQueryService`

### StudyDesign Aggregate (studydesign/ package)
- `studyDesignCommandService` → `StudyDesignCommandService`
- `studyDesignQueryService` → `StudyDesignQueryService`

**No more conflicts!** ✅

---

## Testing Status

### ✅ Bean Conflicts Resolved
All duplicate bean definition exceptions eliminated.

### ⚠️ New Issue Found
```
StudyDocumentAggregate compilation errors:
- getDeletedBy() method not found in DeleteStudyDocumentCommand
- getDeletionReason() method not found
- getIpAddress() method not found
```

**Status**: Different issue (command class incomplete) - needs separate fix

---

## Lessons Learned

1. **Don't delete packages without investigation** - studydesign is a valid aggregate
2. **Bean name conflicts != duplicate code** - Can have same class names in different packages
3. **Use explicit @Service names** when ambiguity possible
4. **Understand DDD boundaries** - Each aggregate should have its own package

---

## Architecture Clarification

### Study Aggregate (study/)
**Purpose**: Manages study entity lifecycle
- Study creation, updates, status changes
- Study metadata (name, phase, sponsor)
- Study-level business logic

### StudyDesign Aggregate (studydesign/)
**Purpose**: Manages study protocol design
- Study arms (treatment groups)
- Visit schedules
- Form assignments to visits
- Protocol-level business logic

**Relationship**: Study aggregate references StudyDesign aggregate by UUID

---

## Next Steps

1. ✅ Bean conflicts resolved
2. ⏳ Fix StudyDocumentAggregate command issues
3. ⏳ Run full test suite
4. ⏳ Continue Phase 4 cleanup

