# Design Package Dependency Analysis

**Date:** October 19, 2025  
**Phase:** Step 1.1 - Preparation & Analysis  
**Status:** In Progress  

---

## Analysis Scope

Analyzing dependencies for:
- `studydesign/design/` package (106 files)
- Who imports from `design` package
- Cross-dependencies within `design` package
- External dependencies on `design` package

---

## Import Analysis Results

### Analysis Commands Used
```powershell
# Find all imports of design package
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\." | Group-Object Filename

# Count by subdomain
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.form\."
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.arm\."
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.visitdefinition\."
```

---

## Dependencies Found

### Summary Statistics

| Metric | Count |
|--------|-------|
| **Total import statements** | 153 |
| **Unique files importing from design** | 54 |
| **External files (outside design package)** | 16 |
| **Form-related imports** | 37 |
| **Arm-related imports** | 33 |
| **Visit definition imports** | 26 |
| **Domain layer imports (commands/events)** | 8 |
| **Aggregate imports** | 0 |

### Key Findings

✅ **Low External Coupling** - Only 16 files outside `design` package depend on it (good!)  
⚠️ **High Internal Coupling** - 38 files within `design` import from other `design` subdirectories  
✅ **No Direct Aggregate Dependencies** - No files import `StudyDesignAggregate` directly (encapsulated!)  

---

## External Dependencies (Files Outside design/ that import it)

These 16 files will need their imports updated during migration:

### From studydesign/ (same bounded context)

1. **studydesign/build/**
   - `StudyDatabaseBuildCommandService.java` - Imports design DTOs
   - `StudyDatabaseBuildWorkerService.java` - Imports design entities

2. **studydesign/studymgmt/**
   - `StudyCommandController.java` - Imports design DTOs for responses
   - `StudyQueryController.java` - Imports design DTOs for responses
   - `StudyEntity.java` - Relationship to design entities
   - `StudyRandomizationStrategyEntity.java` - References design entities
   - `StudyProjection.java` - Reads design projections
   - `StudyCommandService.java` - Uses design commands
   - `StudyQueryService.java` - Uses design DTOs

3. **studydesign/protocolmgmt/**
   - `ProtocolVisitInstantiationService.java` - Imports visit definitions

### From studyoperation/ (different bounded context)

4. **studyoperation/patientenrollment/**
   - `PatientEnrollmentService.java` - Uses design DTOs (arms, visits)

5. **studyoperation/visit/**
   - `VisitController.java` - Returns visit definition DTOs
   - `VisitProjector.java` - Projects visit definitions
   - `ProtocolVisitInstantiationService.java` - Creates visits from definitions
   - `UnscheduledVisitService.java` - References visit definitions
   - `VisitFormQueryService.java` - Queries form definitions

6. **studyoperation/datacapture/formdata/**
   - `VisitFormEntity.java` - References form definitions

---

## Import Distribution by Category

### Form-Related (37 imports)
- Mostly within `design/form/` package (internal)
- External consumers:
  - `VisitFormEntity.java` (studyoperation)
  - `VisitFormQueryService.java` (studyoperation)
  - `StudyDatabaseBuildCommandService.java` (studydesign/build)

### Arm-Related (33 imports)
- Mostly within `design/` package (internal)
- External consumers:
  - `StudyEntity.java` (studydesign/studymgmt)
  - `StudyCommandController.java` (studydesign/studymgmt)
  - `PatientEnrollmentService.java` (studyoperation)

### Visit Definition (26 imports)
- Mostly within `design/visitdefinition/` package (internal)
- External consumers:
  - `VisitController.java` (studyoperation)
  - `VisitProjector.java` (studyoperation)
  - `ProtocolVisitInstantiationService.java` (studyoperation)
  - `UnscheduledVisitService.java` (studyoperation)

### Domain Layer (8 imports)
- Commands and Events used by:
  - `StudyDesignAggregate.java` (within design)
  - Controllers (within design)
  - External services (minimal)

---

## Cross-Package Dependencies Within design/

Files within `design/` that import from other `design/` subdirectories:

### design/aggregate/
- `StudyDesignAggregate.java` imports from:
  - `design/domain/commands/*` (all command types)
  - `design/domain/events/*` (all event types)
  - `design/form/*`
  - `design/arm/*`
  - `design/visitdefinition/*`

### design/controller/
- Controllers import from:
  - `design/dto/*`
  - `design/service/*`
  - `design/domain/commands/*`

### design/service/
- Services import from:
  - `design/domain/commands/*`
  - `design/domain/events/*`
  - `design/repository/*`
  - `design/dto/*`
  - `design/entity/*`

### design/projection/
- Projectors import from:
  - `design/domain/events/*`
  - `design/repository/*`
  - `design/entity/*`

---

## Risk Assessment

### Low Risk Areas ✅
1. **DTOs** - Mostly used within design, few external references
2. **Entities** - JPA entities have minimal external usage
3. **Repositories** - Only accessed by services within design
4. **Projections** - Isolated, event-driven updates

### Medium Risk Areas ⚠️
1. **Controllers** - API endpoints must maintain backward compatibility
2. **Services** - Used by external build and study management services
3. **Domain Events** - Event store relies on event class names/packages

### High Risk Areas 🔴
1. **StudyDesignAggregate** - Central orchestrator, needs careful splitting
2. **Cross-bounded-context usage** - studyoperation depends on design DTOs
3. **Database relationships** - Foreign keys between entities

---

## Migration Strategy Recommendations

### Phase 1: Forms (Lowest External Dependency)
- Only 2 external files depend on forms
- Can be extracted relatively independently
- Test with `VisitFormEntity` and `VisitFormQueryService`

### Phase 2: Arms (Medium Coupling)
- 3-4 external files depend on arms
- Tightly coupled with `StudyEntity`
- Need to preserve relationships

### Phase 3: Visit Definitions (Highest External Dependency)
- 5+ external files in studyoperation depend on visit definitions
- Critical for visit instantiation workflow
- Must maintain API contracts carefully

---

## Action Items for Next Steps

- [ ] **Step 1.2**: Create feature branch `refactor/split-design-package`
- [ ] **Step 1.2**: Create backup tag `backup-before-design-split`
- [ ] **Step 1.3**: Document test baseline
- [ ] **Step 1.4**: Analyze `StudyDesignAggregate.java` in detail
- [ ] **Step 1.5**: Create validation script

---

## Conclusion

**Overall Risk**: MEDIUM

**Key Insight**: The `design` package is well-encapsulated! Only 16 external files depend on it, and most are within the same bounded context (`studydesign`). The cross-context dependencies (to `studyoperation`) are through DTOs and read models, which are easier to migrate.

**Recommendation**: Proceed with incremental migration starting with forms (lowest risk), then arms, then visit definitions.

**Estimated Effort**: 3-4 weeks as planned is realistic given the dependency count.
