# ClinOps Service Legacy Code Cleanup

## Overview
This document tracks the removal of legacy reference data services that have been replaced by the unified `CodeListService` approach in Phase 4 migration.

## Problem Statement
The ClinOps service still contains three legacy services that were replaced during Phase 4 migration:
- `RegulatoryStatusService`
- `StudyPhaseService`
- `StudyStatusService`

These services are still being injected and used in:
1. `StudyController` - For lookup endpoints
2. `StudyMapper` - For entity/DTO conversion

However, `AdminServiceProxy` now provides all this functionality through `CodeListService`, making these legacy services redundant.

## Legacy Services to Remove

### 1. RegulatoryStatusService
**Location**: `com.clinprecision.clinopsservice.service.RegulatoryStatusService`
**Purpose**: Lookup regulatory status reference data
**Replacement**: `AdminServiceProxy.getAllRegulatoryStatuses()`
**Usage**:
- `StudyController.getRegulatoryStatuses()` - Line 178
- `StudyMapper` constructor injection - Lines 27, 31, 34

### 2. StudyPhaseService
**Location**: `com.clinprecision.clinopsservice.service.StudyPhaseService`
**Purpose**: Lookup study phase reference data
**Replacement**: `AdminServiceProxy.getAllStudyPhases()`
**Usage**:
- `StudyController.getStudyPhases()` - Line 198
- `StudyMapper.toEntity()` - Line 75
- `StudyMapper.updateEntity()` - Line 300

### 3. StudyStatusService
**Location**: `com.clinprecision.clinopsservice.service.StudyStatusService`
**Purpose**: Lookup study status reference data
**Replacement**: `AdminServiceProxy.getAllStudyStatuses()`
**Usage**:
- `StudyController.getStudyStatuses()` - Line 168
- `StudyMapper` constructor injection - Lines 26, 30, 33

## Migration Strategy

### Phase 1: Update StudyController ✅
Replace legacy service calls with AdminServiceProxy calls in lookup endpoints.

**Changes Required**:
1. Remove legacy service injections
2. Add `AdminServiceProxy` injection
3. Update three lookup methods:
   - `getStudyStatuses()` → Use `adminServiceProxy.getAllStudyStatuses()`
   - `getRegulatoryStatuses()` → Use `adminServiceProxy.getAllRegulatoryStatuses()`
   - `getStudyPhases()` → Use `adminServiceProxy.getAllStudyPhases()`

### Phase 2: Update StudyMapper ✅
Replace legacy service calls with direct repository or AdminServiceProxy calls.

**Changes Required**:
1. Remove legacy service injections
2. Keep direct repository access for entity lookups (studyPhaseRepository, regulatoryStatusRepository, studyStatusRepository)
3. Alternatively, extend AdminServiceProxy to provide entity lookup methods

**Note**: StudyMapper needs entity objects (not DTOs) for persistence, so it should use repositories directly rather than AdminServiceProxy.

### Phase 3: Delete Legacy Services ✅
Once all usages are removed, delete the three legacy service files.

**Files to Delete**:
- `src/main/java/com/clinprecision/clinopsservice/service/RegulatoryStatusService.java`
- `src/main/java/com/clinprecision/clinopsservice/service/StudyPhaseService.java`
- `src/main/java/com/clinprecision/clinopsservice/service/StudyStatusService.java`

### Phase 4: Update Documentation ✅
Update any references to these services in documentation.

## Implementation Plan

### Step 1: Update StudyController
```java
// BEFORE
private final StudyStatusService studyStatusService;
private final RegulatoryStatusService regulatoryStatusService;
private final StudyPhaseService studyPhaseService;

public StudyController(..., StudyStatusService studyStatusService,
                      RegulatoryStatusService regulatoryStatusService,
                      StudyPhaseService studyPhaseService, ...) {
    this.studyStatusService = studyStatusService;
    this.regulatoryStatusService = regulatoryStatusService;
    this.studyPhaseService = studyPhaseService;
}

@GetMapping("/lookup/statuses")
public ResponseEntity<List<StudyStatusDto>> getStudyStatuses() {
    List<StudyStatusDto> response = studyStatusService.getAllActiveStatuses();
    return ResponseEntity.ok(response);
}

// AFTER
private final AdminServiceProxy adminServiceProxy;

public StudyController(..., AdminServiceProxy adminServiceProxy, ...) {
    this.adminServiceProxy = adminServiceProxy;
}

@GetMapping("/lookup/statuses")
public ResponseEntity<List<Map<String, Object>>> getStudyStatuses() {
    List<Map<String, Object>> response = adminServiceProxy.getAllStudyStatuses();
    return ResponseEntity.ok(response);
}
```

### Step 2: Update StudyMapper
```java
// BEFORE
private final StudyStatusService studyStatusService;
private final RegulatoryStatusService regulatoryStatusService;
private final StudyPhaseService studyPhaseService;

// AFTER - Use repositories directly for entity lookups
private final StudyStatusRepository studyStatusRepository;
private final RegulatoryStatusRepository regulatoryStatusRepository;
private final StudyPhaseRepository studyPhaseRepository;

// Then in toEntity():
studyPhaseRepository.findById(dto.getStudyPhaseId())
    .orElseThrow(() -> new IllegalArgumentException("Invalid study phase ID"));
```

### Step 3: Delete Legacy Service Files
```powershell
Remove-Item "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\service\RegulatoryStatusService.java"
Remove-Item "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\service\StudyPhaseService.java"
Remove-Item "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\service\StudyStatusService.java"
```

## Benefits

1. **Simplified Architecture**: Single source of truth for reference data
2. **Reduced Code Duplication**: Eliminates redundant service layer
3. **Better Caching**: AdminServiceProxy provides comprehensive caching
4. **Consistent API**: All reference data accessed through same interface
5. **Easier Maintenance**: Fewer files to maintain and update

## API Impact

### Before (Legacy DTOs)
```json
GET /api/studies/lookup/statuses
Response: [
  {
    "id": 1,
    "code": "DRAFT",
    "name": "Draft",
    "description": "Study in draft status",
    "displayOrder": 1,
    "isActive": true,
    "allowsModification": true,
    "isFinalStatus": false
  }
]
```

### After (Generic Map Format)
```json
GET /api/studies/lookup/statuses
Response: [
  {
    "id": 1,
    "category": "STUDY_STATUS",
    "code": "DRAFT",
    "label": "Draft",
    "description": "Study in draft status",
    "sortOrder": 1,
    "isActive": true,
    "metadata": {
      "allowsModification": true,
      "isFinalStatus": false
    }
  }
]
```

**Note**: Frontend should already be compatible with generic Map format from Phase 3 integration.

## Verification Steps

After cleanup:
1. ✅ No compile errors
2. ✅ All lookup endpoints return data
3. ✅ StudyMapper entity conversion works
4. ✅ Frontend study forms populate dropdowns correctly
5. ✅ No references to deleted services in codebase

## Rollback Plan

If issues occur:
1. Restore deleted service files from git history
2. Revert controller and mapper changes
3. Investigate why AdminServiceProxy approach failed

Git commands:
```bash
git checkout HEAD~1 -- backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/service/RegulatoryStatusService.java
git checkout HEAD~1 -- backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/service/StudyPhaseService.java
git checkout HEAD~1 -- backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/service/StudyStatusService.java
```

## Related Documentation
- `PHASE_4_SERVICE_INTEGRATION_PLAN.md` - Original migration plan
- `PHASE_4_COMPLETION_REPORT.md` - Migration completion status
- `FRONTEND_ENDPOINT_UPDATE_SUMMARY.md` - Frontend changes for Phase 4

---
**Status**: Ready for Implementation
**Date**: December 2024
**Branch**: CLINOPS_DDD_IMPL
