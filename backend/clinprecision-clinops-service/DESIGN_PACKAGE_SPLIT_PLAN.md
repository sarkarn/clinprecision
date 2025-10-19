# Study Design Package Split Plan

## Executive Summary

**Current State:** `studydesign/design` contains **106 files** across 13 subdirectories  
**Problem:** Too large and mixing multiple bounded contexts (forms, arms, visit definitions)  
**Solution:** Split into 3 focused subdomains based on domain cohesion

---

## Current Structure Analysis

```
studydesign/design/ (106 files total)
├── aggregate/        1 file   - StudyDesignAggregate
├── arm/             15 files  - Treatment arm management
├── controller/       4 files  - REST endpoints
├── domain/          20 files  - Commands & Events
├── dto/              8 files  - Data transfer objects
├── entity/           2 files  - JPA entities
├── exception/        1 file   - Design exceptions
├── form/            30 files  - Form & field definitions
├── model/            7 files  - Domain models
├── projection/       2 files  - Read model projections
├── repository/       4 files  - JPA repositories
├── service/          5 files  - Domain services
└── visitdefinition/  7 files  - Visit schedule definitions
```

### Key Issues
1. **Multiple Bounded Contexts Mixed Together**
   - Forms (30 files) - Managing data collection structures
   - Arms (15 files) - Managing treatment groups
   - Visit Definitions (7 files) - Managing visit schedules

2. **File Distribution**
   - Form-related: ~30 files (28%)
   - Arm-related: ~15 files (14%)
   - Visit Definition-related: ~7 files (7%)
   - Shared infrastructure: ~54 files (51%)

3. **Aggregate Confusion**
   - Single `StudyDesignAggregate` trying to manage all three concepts
   - Commands/Events for forms, arms, and visits all in one domain package

---

## Proposed Split: 3 Subdomains

### **Option A: Split into 3 Subdomains** ✅ RECOMMENDED

```
studydesign/
├── formmgmt/              (~40 files)
│   ├── aggregate/
│   │   └── FormAggregate.java
│   ├── controller/
│   │   ├── FormController.java
│   │   └── FormFieldController.java
│   ├── domain/
│   │   ├── commands/
│   │   │   ├── CreateFormCommand.java
│   │   │   ├── AddFormFieldCommand.java
│   │   │   └── UpdateFormMetadataCommand.java
│   │   └── events/
│   │       ├── FormCreatedEvent.java
│   │       ├── FormFieldAddedEvent.java
│   │       └── FormMetadataUpdatedEvent.java
│   ├── dto/
│   │   ├── FormDTO.java
│   │   ├── FormFieldDTO.java
│   │   └── FormMetadataDTO.java
│   ├── entity/
│   │   ├── Form.java
│   │   └── FormField.java
│   ├── exception/
│   │   └── FormValidationException.java
│   ├── mapper/
│   │   └── FormMapper.java
│   ├── projection/
│   │   └── FormProjection.java
│   ├── repository/
│   │   ├── FormRepository.java
│   │   └── FormFieldRepository.java
│   └── service/
│       ├── FormCommandService.java
│       └── FormQueryService.java
│
├── armmgmt/               (~20 files)
│   ├── aggregate/
│   │   └── ArmAggregate.java
│   ├── controller/
│   │   └── ArmController.java
│   ├── domain/
│   │   ├── commands/
│   │   │   ├── CreateArmCommand.java
│   │   │   ├── UpdateArmCommand.java
│   │   │   └── AssignTreatmentToArmCommand.java
│   │   └── events/
│   │       ├── ArmCreatedEvent.java
│   │       ├── ArmUpdatedEvent.java
│   │       └── TreatmentAssignedToArmEvent.java
│   ├── dto/
│   │   └── ArmDTO.java
│   ├── entity/
│   │   └── Arm.java
│   ├── projection/
│   │   └── ArmProjection.java
│   ├── repository/
│   │   └── ArmRepository.java
│   └── service/
│       ├── ArmCommandService.java
│       └── ArmQueryService.java
│
└── visitdefinitionmgmt/   (~15 files)
    ├── aggregate/
    │   └── VisitDefinitionAggregate.java
    ├── controller/
    │   └── VisitDefinitionController.java
    ├── domain/
    │   ├── commands/
    │   │   ├── CreateVisitDefinitionCommand.java
    │   │   └── UpdateVisitDefinitionCommand.java
    │   └── events/
    │       ├── VisitDefinitionCreatedEvent.java
    │       └── VisitDefinitionUpdatedEvent.java
    ├── dto/
    │   └── VisitDefinitionDTO.java
    ├── entity/
    │   └── VisitDefinition.java
    ├── projection/
    │   └── VisitDefinitionProjection.java
    ├── repository/
    │   └── VisitDefinitionRepository.java
    └── service/
        ├── VisitDefinitionCommandService.java
        └── VisitDefinitionQueryService.java
```

**Rationale:**
- Each subdomain manages a distinct bounded context
- Clear separation of concerns
- Independent evolution of each subdomain
- Easier testing and maintenance

---

### **Option B: Keep Unified with Better Organization** (Alternative)

If splitting is too disruptive, reorganize within `design`:

```
studydesign/design/
├── aggregate/
│   ├── StudyDesignAggregate.java      (orchestrates all)
│   ├── FormAggregate.java             (NEW - delegate)
│   ├── ArmAggregate.java              (NEW - delegate)
│   └── VisitDefinitionAggregate.java  (NEW - delegate)
├── form/
│   ├── commands/
│   ├── events/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── arm/
│   ├── commands/
│   ├── events/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── visitdefinition/
│   ├── commands/
│   ├── events/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
└── shared/
    ├── controller/
    ├── exception/
    └── model/
```

---

## Recommended Approach: **Option A (3 Subdomains)**

### Step-by-Step Implementation

#### **Phase 1: Create New Package Structure** (Day 1)
```bash
# Create formmgmt subdomain
studydesign/formmgmt/aggregate/
studydesign/formmgmt/controller/
studydesign/formmgmt/domain/commands/
studydesign/formmgmt/domain/events/
studydesign/formmgmt/dto/
studydesign/formmgmt/entity/
studydesign/formmgmt/exception/
studydesign/formmgmt/mapper/
studydesign/formmgmt/projection/
studydesign/formmgmt/repository/
studydesign/formmgmt/service/

# Create armmgmt subdomain
studydesign/armmgmt/aggregate/
studydesign/armmgmt/controller/
studydesign/armmgmt/domain/commands/
studydesign/armmgmt/domain/events/
studydesign/armmgmt/dto/
studydesign/armmgmt/entity/
studydesign/armmgmt/projection/
studydesign/armmgmt/repository/
studydesign/armmgmt/service/

# Create visitdefinitionmgmt subdomain
studydesign/visitdefinitionmgmt/aggregate/
studydesign/visitdefinitionmgmt/controller/
studydesign/visitdefinitionmgmt/domain/commands/
studydesign/visitdefinitionmgmt/domain/events/
studydesign/visitdefinitionmgmt/dto/
studydesign/visitdefinitionmgmt/entity/
studydesign/visitdefinitionmgmt/projection/
studydesign/visitdefinitionmgmt/repository/
studydesign/visitdefinitionmgmt/service/
```

#### **Phase 2: Move Form-Related Files** (Day 2-3)
**Move from `design/form/` to `formmgmt/`:**
- All 30 files in `design/form/` directory
- Form-related DTOs from `design/dto/`
- Form-related commands from `design/domain/commands/`
- Form-related events from `design/domain/events/`
- Form-related services from `design/service/`
- `FormController.java` from `design/controller/`
- Form-related repositories from `design/repository/`
- Form-related entities from `design/entity/`

**Create New:**
- `formmgmt/aggregate/FormAggregate.java` (extract from StudyDesignAggregate)
- `formmgmt/exception/FormValidationException.java`

#### **Phase 3: Move Arm-Related Files** (Day 4)
**Move from `design/arm/` to `armmgmt/`:**
- All 15 files in `design/arm/` directory
- Arm-related DTOs from `design/dto/`
- Arm-related commands from `design/domain/commands/`
- Arm-related events from `design/domain/events/`
- Arm-related services from `design/service/`
- `ArmController.java` from `design/controller/`
- Arm-related repositories from `design/repository/`
- Arm-related entities from `design/entity/`

**Create New:**
- `armmgmt/aggregate/ArmAggregate.java` (extract from StudyDesignAggregate)

#### **Phase 4: Move Visit Definition Files** (Day 5)
**Move from `design/visitdefinition/` to `visitdefinitionmgmt/`:**
- All 7 files in `design/visitdefinition/` directory
- Visit-related DTOs from `design/dto/`
- Visit-related commands from `design/domain/commands/`
- Visit-related events from `design/domain/events/`
- Visit-related services from `design/service/`
- `VisitDefinitionController.java` from `design/controller/`
- Visit-related repositories from `design/repository/`
- Visit-related entities from `design/entity/`

**Create New:**
- `visitdefinitionmgmt/aggregate/VisitDefinitionAggregate.java` (extract from StudyDesignAggregate)

#### **Phase 5: Handle Shared Files** (Day 6-7)
**Analyze remaining files in `design/`:**
- `design/model/` (7 files) - Determine if value objects or move to appropriate subdomain
- `design/exception/` (1 file) - Move to common or duplicate per subdomain
- Remaining DTOs/services - Assign to appropriate subdomain

**Decision Tree for Shared Files:**
1. **If used by multiple subdomains** → Move to `studydesign/common/`
2. **If domain-specific** → Move to appropriate subdomain
3. **If truly shared value object** → Consider moving to `clinopsservice/common/`

#### **Phase 6: Update Package Declarations** (Day 8)
- Update all `package` statements
- Update all `import` statements
- Update Spring `@ComponentScan` if needed
- Update Axon event handlers package scanning

#### **Phase 7: Update Tests** (Day 9)
- Move corresponding test files to match new structure
- Update test package declarations
- Update test imports
- Verify all tests pass

#### **Phase 8: Update Documentation** (Day 10)
- Update architecture diagrams
- Update API documentation
- Create ADR (Architecture Decision Record) for the split
- Update README files

---

## Impact Analysis

### Benefits
✅ **Smaller, Focused Packages**
- formmgmt: ~40 files (vs 106)
- armmgmt: ~20 files
- visitdefinitionmgmt: ~15 files

✅ **Clear Bounded Contexts**
- Each subdomain has distinct responsibility
- Easier to understand and navigate

✅ **Independent Evolution**
- Changes to forms don't affect arms or visits
- Reduced merge conflicts

✅ **Better Testability**
- Isolated unit tests per subdomain
- Clear integration boundaries

### Risks
⚠️ **Breaking Changes**
- API endpoints remain same, but package structure changes
- Import statements need updating across codebase

⚠️ **Aggregate Complexity**
- Need to decide if `StudyDesignAggregate` still needed as orchestrator
- Or if each subdomain has independent aggregates

⚠️ **Shared Dependencies**
- Some files may be used across subdomains
- Need clear strategy for shared code

---

## File Movement Mapping

### Example: Form Files Migration

**Before:**
```
design/
├── form/
│   ├── controller/FormController.java
│   ├── dto/FormDTO.java
│   ├── entity/Form.java
│   └── service/FormService.java
├── domain/
│   ├── commands/CreateFormCommand.java
│   └── events/FormCreatedEvent.java
└── aggregate/StudyDesignAggregate.java (handles form commands)
```

**After:**
```
formmgmt/
├── aggregate/FormAggregate.java (NEW - extracted from StudyDesignAggregate)
├── controller/FormController.java (MOVED from design/form/controller/)
├── domain/
│   ├── commands/CreateFormCommand.java (MOVED from design/domain/commands/)
│   └── events/FormCreatedEvent.java (MOVED from design/domain/events/)
├── dto/FormDTO.java (MOVED from design/form/dto/)
├── entity/Form.java (MOVED from design/form/entity/)
├── repository/FormRepository.java (MOVED from design/repository/)
└── service/FormCommandService.java (MOVED from design/form/service/)
```

---

## Validation Checklist

After split is complete:

- [ ] All 106 files accounted for (moved or intentionally deleted)
- [ ] No compilation errors
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] API endpoints still work (manual testing)
- [ ] Axon event handling still works
- [ ] Database projections still update correctly
- [ ] No broken imports or missing classes
- [ ] Spring component scanning finds all beans
- [ ] Documentation updated

---

## Alternative: Gradual Migration

If full split is too risky, consider incremental approach:

### **Iteration 1: Extract Forms** (Week 1)
- Move only form-related files to `formmgmt/`
- Keep `armmgmt/` and `visitdefinitionmgmt/` in `design/` for now
- Test thoroughly

### **Iteration 2: Extract Arms** (Week 2)
- Move arm-related files to `armmgmt/`
- Keep `visitdefinitionmgmt/` in `design/` for now
- Test thoroughly

### **Iteration 3: Extract Visits** (Week 3)
- Move visit-related files to `visitdefinitionmgmt/`
- Delete now-empty `design/` package
- Final testing

---

## Recommendation

**Execute Option A (3 Subdomains) using Gradual Migration approach**

**Why:**
- Lower risk (validate each subdomain independently)
- Easier rollback if issues arise
- Team can learn patterns with first subdomain
- Maintains working system throughout migration

**Timeline:**
- Week 1: Extract `formmgmt/` (highest complexity, most files)
- Week 2: Extract `armmgmt/` (medium complexity)
- Week 3: Extract `visitdefinitionmgmt/` (lowest complexity)
- Week 4: Final cleanup and documentation

**Effort:** 3-4 weeks with proper testing

---

## Questions to Answer Before Starting

1. **Aggregate Strategy:**
   - Keep `StudyDesignAggregate` as orchestrator?
   - Or create 3 independent aggregates (`FormAggregate`, `ArmAggregate`, `VisitDefinitionAggregate`)?

2. **Shared Code:**
   - What files in `design/model/` are truly shared?
   - Should shared exceptions go to `studydesign/common/` or `clinopsservice/common/`?

3. **API Versioning:**
   - Do we need to version APIs if controller packages change?
   - Can we maintain backward compatibility?

4. **Event Handling:**
   - Will event handlers across subdomains still work?
   - Do we need cross-subdomain sagas?

5. **Testing Strategy:**
   - Unit tests per subdomain?
   - Integration tests across subdomains?
   - End-to-end tests?

---

**Next Step:** Review this plan and decide:
- Option A (3 subdomains) or Option B (reorganize within design)?
- Full migration or gradual migration?
- Answer the 5 questions above to finalize strategy
