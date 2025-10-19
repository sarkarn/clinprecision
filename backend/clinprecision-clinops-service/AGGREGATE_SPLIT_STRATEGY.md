# StudyDesignAggregate Split Strategy Analysis

**Date:** October 19, 2025  
**Phase:** 1.3 - Aggregate Structure Analysis  
**Current Branch:** `refactor/split-design-package`

---

## Executive Summary

**CRITICAL DECISION:** Should we split `StudyDesignAggregate` or keep it unified?

**RECOMMENDATION:** ✅ **Keep Single Aggregate with Package Reorganization**

**Rationale:**
- Strong cross-subdomain dependencies (visits reference arms, forms reference visits)
- Aggregate enforces critical business rules across all three subdomains
- Event sourcing works best with cohesive aggregates
- Splitting would require complex saga orchestration
- Better to organize by package while maintaining single aggregate root

---

## Current Aggregate Analysis

### 1. Aggregate Structure

```java
@Aggregate
public class StudyDesignAggregate {
    @AggregateIdentifier
    private UUID studyDesignId;                           // Single identifier
    
    private UUID studyAggregateUuid;                      // Reference to parent Study
    private Map<UUID, StudyArm> arms;                     // ARM subdomain
    private Map<UUID, Visit> visits;                      // VISIT subdomain  
    private Map<UUID, FormAssignment> formAssignments;    // FORM subdomain
}
```

**Key Characteristics:**
- **Single Aggregate ID:** `studyDesignId` - all operations scoped to one study design
- **Three State Collections:** Arms, Visits, FormAssignments (forms are assigned to visits)
- **Unified Event Store:** All events share the same aggregate stream
- **Cohesive Business Logic:** Strong dependencies between subdomains

---

### 2. Command Handler Breakdown

#### **ARM Commands** (3 commands, 3 handlers):
```java
@CommandHandler AddStudyArmCommand          → StudyArmAddedEvent
@CommandHandler UpdateStudyArmCommand       → StudyArmUpdatedEvent
@CommandHandler RemoveStudyArmCommand       → StudyArmRemovedEvent
```

**Business Rules:**
- ✅ Unique arm names within study design
- ✅ Unique sequence numbers
- ✅ Cannot delete arm with arm-specific visits (CROSS-SUBDOMAIN DEPENDENCY)

---

#### **VISIT Commands** (3 commands, 3 handlers):
```java
@CommandHandler DefineVisitCommand              → VisitDefinedEvent
@CommandHandler UpdateVisitDefinitionCommand    → VisitDefinitionUpdatedEvent
@CommandHandler RemoveVisitDefinitionCommand    → VisitDefinitionRemovedEvent
```

**Business Rules:**
- ✅ Visit can be arm-specific (references `armId`) (CROSS-SUBDOMAIN DEPENDENCY)
- ✅ Unique visit names within scope (arm-specific or general)
- ✅ Unique sequence numbers within scope
- ✅ Auto-calculate next sequence based on armId
- ✅ Cannot delete visit with form assignments (CROSS-SUBDOMAIN DEPENDENCY)

---

#### **FORM ASSIGNMENT Commands** (3 commands, 3 handlers):
```java
@CommandHandler AssignFormToVisitDefinitionCommand → FormAssignedToVisitEvent
@CommandHandler UpdateFormAssignmentCommand        → FormAssignmentUpdatedEvent
@CommandHandler RemoveFormAssignmentCommand        → FormAssignmentRemovedEvent
```

**Business Rules:**
- ✅ Visit must exist before assigning forms (CROSS-SUBDOMAIN DEPENDENCY)
- ✅ No duplicate form assignments per visit
- ✅ Unique display order per visit

---

#### **INITIALIZATION Command** (1 command):
```java
@CommandHandler InitializeStudyDesignCommand → StudyDesignInitializedEvent
```

**Purpose:** Create aggregate root when Study is created

---

### 3. Cross-Subdomain Dependencies

#### **Strong Dependencies:**

1. **Arms ← Visits** (CRITICAL)
   - Visits can reference a specific arm via `armId`
   - Cannot delete arm if it has arm-specific visits
   - Business rule enforced: `RemoveStudyArmCommand` checks for dependent visits

2. **Visits ← FormAssignments** (CRITICAL)
   - Forms are assigned TO visits (not standalone)
   - Cannot delete visit if it has form assignments
   - Business rule enforced: `RemoveVisitDefinitionCommand` checks for assignments

3. **Arms → Visits** (BIDIRECTIONAL)
   - When defining visit, arm must exist if `armId` is specified
   - Visit sequence numbers are scoped by arm

**Dependency Graph:**
```
Study (Parent)
    ↓
StudyDesignAggregate (ROOT)
    ├─ Arms (Collection)
    ├─ Visits (Collection) ──references──> Arms (armId)
    └─ FormAssignments (Collection) ──references──> Visits (visitId)
```

---

## Split Options Analysis

### Option A: Keep Single Aggregate ✅ RECOMMENDED

**Structure:**
```
studydesign/design/
├── aggregate/
│   └── StudyDesignAggregate.java          (UNCHANGED - single root)
├── armmgmt/
│   ├── domain/
│   │   ├── commands/                      (Arm commands)
│   │   └── events/                        (Arm events)
│   ├── model/
│   │   └── StudyArm.java
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── visitdefinitionmgmt/
│   ├── domain/
│   │   ├── commands/                      (Visit commands)
│   │   └── events/                        (Visit events)
│   ├── model/
│   │   ├── Visit.java
│   │   └── VisitWindow.java
│   ├── dto/
│   ├── entity/
│   └── repository/
└── formmgmt/
    ├── domain/
    │   ├── commands/                      (Form assignment commands)
    │   └── events/                        (Form assignment events)
    ├── model/
    │   └── FormAssignment.java
    ├── dto/
    ├── entity/
    └── repository/
```

**Pros:**
- ✅ No breaking changes to event sourcing
- ✅ All business rules remain in one place
- ✅ No need for saga orchestration
- ✅ Maintains transaction boundaries
- ✅ Simpler to understand and maintain
- ✅ Better performance (no distributed transactions)
- ✅ Event replay works seamlessly

**Cons:**
- ❌ Larger aggregate (but manageable - only 3 collections)
- ❌ All commands go to same aggregate (but properly organized by package)

---

### Option B: Split into 3 Separate Aggregates ❌ NOT RECOMMENDED

**Structure:**
```
studydesign/design/
├── armmgmt/
│   └── aggregate/
│       └── ArmAggregate.java              (NEW - separate root)
├── visitdefinitionmgmt/
│   └── aggregate/
│       └── VisitDefinitionAggregate.java  (NEW - separate root)
└── formmgmt/
    └── aggregate/
        └── FormAssignmentAggregate.java   (NEW - separate root)
```

**Pros:**
- ✅ Smaller, focused aggregates
- ✅ Potential for independent scaling (overkill for this use case)

**Cons:**
- ❌ **MAJOR:** Cannot enforce cross-aggregate business rules atomically
  - "Cannot delete arm with visits" requires saga
  - "Visit must reference valid arm" requires saga
  - "Cannot delete visit with forms" requires saga
- ❌ **MAJOR:** Complex saga orchestration needed
- ❌ **MAJOR:** Event sourcing becomes complicated
  - 3 separate event streams instead of 1
  - Replay complexity increases
  - Temporal consistency issues
- ❌ **MAJOR:** Must migrate existing event store (HIGH RISK)
- ❌ Higher latency (3 aggregates instead of 1)
- ❌ More complex error handling
- ❌ Eventual consistency issues
- ❌ Harder to maintain transactional boundaries

---

## Decision Matrix

| Criteria | Single Aggregate | Split Aggregates |
|----------|-----------------|------------------|
| **Business Rule Enforcement** | ✅ Strong (atomic) | ❌ Weak (eventual) |
| **Transaction Boundaries** | ✅ Simple (single) | ❌ Complex (distributed) |
| **Event Sourcing Complexity** | ✅ Low (1 stream) | ❌ High (3 streams) |
| **Cross-Subdomain Dependencies** | ✅ Handled natively | ❌ Requires sagas |
| **Code Organization** | ✅ Good (packages) | ⚠️ Better (aggregates) |
| **Performance** | ✅ Fast (1 aggregate) | ❌ Slower (3 aggregates) |
| **Migration Risk** | ✅ Low (no event changes) | ❌ HIGH (event store migration) |
| **Maintainability** | ✅ Simple | ❌ Complex |
| **Scalability** | ⚠️ Single instance | ✅ Independent (overkill) |
| **DDD Alignment** | ✅ Cohesive aggregate | ⚠️ Forced separation |

**Winner:** ✅ **Single Aggregate with Package Reorganization**

---

## Recommended Implementation Strategy

### Phase 2: Extract Form Management (Week 1)

**Step 2.1: Create formmgmt package structure**
```
studydesign/design/formmgmt/
├── domain/
│   ├── commands/
│   │   ├── AssignFormToVisitDefinitionCommand.java
│   │   ├── UpdateFormAssignmentCommand.java
│   │   └── RemoveFormAssignmentCommand.java
│   └── events/
│       ├── FormAssignedToVisitEvent.java
│       ├── FormAssignmentUpdatedEvent.java
│       └── FormAssignmentRemovedEvent.java
├── model/
│   └── FormAssignment.java
├── dto/
│   └── (form assignment DTOs)
├── entity/
│   └── (form entities - from existing form/ directory)
├── repository/
│   └── (form repositories)
└── service/
    └── (form services)
```

**Step 2.2: Move files to formmgmt**
- Move 3 commands from `design/domain/commands/`
- Move 3 events from `design/domain/events/`
- Move `FormAssignment.java` from `design/model/`
- Move form-related files from `design/form/`, `design/dto/`, etc.

**Step 2.3: Update imports**
- Update `StudyDesignAggregate.java` imports
- Update external references (16 files identified in Step 1.1)

---

### Phase 3: Extract Arm Management (Week 2)

**Step 3.1: Create armmgmt package structure**
```
studydesign/design/armmgmt/
├── domain/
│   ├── commands/
│   │   ├── AddStudyArmCommand.java
│   │   ├── UpdateStudyArmCommand.java
│   │   └── RemoveStudyArmCommand.java
│   └── events/
│       ├── StudyArmAddedEvent.java
│       ├── StudyArmUpdatedEvent.java
│       └── StudyArmRemovedEvent.java
├── model/
│   └── StudyArm.java
├── dto/
│   └── (arm DTOs)
├── entity/
│   └── (arm entities)
├── repository/
│   └── (arm repositories)
└── service/
    └── (arm services)
```

**Step 3.2: Move files to armmgmt**
- Move 3 arm commands
- Move 3 arm events
- Move `StudyArm.java` model
- Move arm-related DTOs, entities, repositories

---

### Phase 4: Extract Visit Definition Management (Week 3)

**Step 4.1: Create visitdefinitionmgmt package structure**
```
studydesign/design/visitdefinitionmgmt/
├── domain/
│   ├── commands/
│   │   ├── DefineVisitCommand.java
│   │   ├── UpdateVisitDefinitionCommand.java
│   │   └── RemoveVisitDefinitionCommand.java
│   └── events/
│       ├── VisitDefinedEvent.java
│       ├── VisitDefinitionUpdatedEvent.java
│       └── VisitDefinitionRemovedEvent.java
├── model/
│   ├── Visit.java
│   └── VisitWindow.java
├── dto/
│   └── (visit DTOs)
├── entity/
│   └── (visit entities - from existing visitdefinition/)
├── repository/
│   └── (visit repositories)
└── service/
    └── (visit services)
```

**Step 4.2: Move files to visitdefinitionmgmt**
- Move 3 visit commands
- Move 3 visit events
- Move `Visit.java` and `VisitWindow.java` models
- Move visit-related files from `design/visitdefinition/`

---

### Phase 5: Cleanup Shared Files (Week 4)

**Step 5.1: Handle shared files**
```
studydesign/design/
├── aggregate/
│   └── StudyDesignAggregate.java          (KEEP - single root)
├── domain/
│   ├── commands/
│   │   └── InitializeStudyDesignCommand.java   (KEEP - shared)
│   └── events/
│       └── StudyDesignInitializedEvent.java    (KEEP - shared)
├── dto/                                   (shared DTOs if any)
├── service/                               (shared services)
└── controller/                            (shared controllers)
```

**Step 5.2: Delete empty design/ subdirectories**
- Remove `design/form/` (moved to formmgmt)
- Remove `design/arm/` (moved to armmgmt)
- Remove `design/visitdefinition/` (moved to visitdefinitionmgmt)

---

## File Movement Summary

### Current State (106 files):
```
studydesign/design/
├── aggregate/ (1)
├── arm/ (15)
├── controller/ (4)
├── domain/ (20)
├── dto/ (8)
├── entity/ (2)
├── exception/ (1)
├── form/ (30)
├── model/ (7)
├── projection/ (2)
├── repository/ (4)
├── service/ (5)
└── visitdefinition/ (7)
```

### Target State (106 files):
```
studydesign/design/
├── aggregate/ (1)                         ← UNCHANGED
├── domain/ (2)                            ← ONLY shared init command/event
├── controller/ (4)                        ← MAY STAY OR SPLIT
├── service/ (5)                           ← MAY STAY OR SPLIT
├── armmgmt/ (~20 files)
│   ├── domain/ (6)                        ← 3 commands + 3 events
│   ├── model/ (1)                         ← StudyArm.java
│   ├── entity/ (...)                      ← From arm/
│   └── ...
├── visitdefinitionmgmt/ (~15 files)
│   ├── domain/ (6)                        ← 3 commands + 3 events
│   ├── model/ (2)                         ← Visit.java, VisitWindow.java
│   ├── entity/ (...)                      ← From visitdefinition/
│   └── ...
└── formmgmt/ (~40 files)
    ├── domain/ (6)                        ← 3 commands + 3 events
    ├── model/ (1)                         ← FormAssignment.java
    ├── entity/ (...)                      ← From form/
    └── ...
```

---

## StudyDesignAggregate Post-Refactoring

**Location:** `studydesign/design/aggregate/StudyDesignAggregate.java`

**Import Changes Required:**
```java
// BEFORE (all from design.domain)
import com.clinprecision.clinopsservice.studydesign.design.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.design.domain.events.*;

// AFTER (from specific subdomains)
import com.clinprecision.clinopsservice.studydesign.design.domain.commands.InitializeStudyDesignCommand;
import com.clinprecision.clinopsservice.studydesign.design.domain.events.StudyDesignInitializedEvent;

import com.clinprecision.clinopsservice.studydesign.design.armmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.design.armmgmt.domain.events.*;

import com.clinprecision.clinopsservice.studydesign.design.visitdefinitionmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinitionmgmt.domain.events.*;

import com.clinprecision.clinopsservice.studydesign.design.formmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.design.formmgmt.domain.events.*;

import com.clinprecision.clinopsservice.studydesign.design.armmgmt.model.StudyArm;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinitionmgmt.model.Visit;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinitionmgmt.model.VisitWindow;
import com.clinprecision.clinopsservice.studydesign.design.formmgmt.model.FormAssignment;
```

**Structure Unchanged:**
- Same @Aggregate annotation
- Same @AggregateIdentifier
- Same command handlers (10 handlers)
- Same event sourcing handlers (12 handlers)
- Same business rules enforcement

**Benefits:**
- ✅ Code organized by subdomain
- ✅ Aggregate remains cohesive
- ✅ Event sourcing unchanged
- ✅ Business rules atomic

---

## External Dependencies (from Step 1.1)

**16 files outside design package depend on it:**

1. **studydesign/build/** (2 files)
   - `StudyDatabaseBuildCommandService.java`
   - `StudyDatabaseBuildWorkerService.java`

2. **studydesign/studymgmt/** (9 files)
   - Controllers, projections, entities using design package

3. **studyoperation/patientenrollment/** (1 file)
   - `PatientEnrollmentService.java`

4. **studyoperation/visit/** (5 files)
   - Controllers, services using visit definitions

**Import Update Strategy:**
- Start with form subdomain (lowest external dependencies: 37 imports)
- Then arms (33 imports)
- Finally visits (26 imports - highest external dependencies)

---

## Event Sourcing Considerations

### Event Store Structure (UNCHANGED)

**Current Event Stream:**
```
AggregateID: studyDesignId (UUID)
Events: [
  StudyDesignInitializedEvent,
  StudyArmAddedEvent,
  StudyArmAddedEvent,
  VisitDefinedEvent,
  FormAssignedToVisitEvent,
  StudyArmRemovedEvent,
  ...
]
```

**Post-Refactoring (SAME STREAM):**
```
AggregateID: studyDesignId (UUID)
Events: [
  StudyDesignInitializedEvent,                     ← design.domain.events
  StudyArmAddedEvent,                              ← armmgmt.domain.events
  StudyArmAddedEvent,                              ← armmgmt.domain.events
  VisitDefinedEvent,                               ← visitdefinitionmgmt.domain.events
  FormAssignedToVisitEvent,                        ← formmgmt.domain.events
  StudyArmRemovedEvent,                            ← armmgmt.domain.events
  ...
]
```

**Key Point:** Event class names unchanged, only package paths change
- Axon will deserialize events correctly (uses fully qualified class name)
- No event migration needed
- Event replay works seamlessly

---

## Risk Assessment

### Keeping Single Aggregate (Recommended)

| Risk | Level | Mitigation |
|------|-------|------------|
| Aggregate too large | LOW | Only 3 collections, well-scoped |
| Performance | LOW | No observed issues, study designs are small |
| Concurrency conflicts | LOW | Study design edits are infrequent |
| Package organization confusion | LOW | Clear subdomain boundaries |

### Splitting into 3 Aggregates (NOT Recommended)

| Risk | Level | Mitigation |
|------|-------|------------|
| Event store migration | **HIGH** | Would require complex migration scripts |
| Saga complexity | **HIGH** | 3+ sagas needed for cross-aggregate rules |
| Lost atomicity | **HIGH** | Business rules become eventually consistent |
| Development effort | **HIGH** | 3-4x more code changes needed |
| Production bugs | **HIGH** | Distributed transaction edge cases |

---

## Validation Checklist

After each phase of refactoring:

- [ ] **Compilation:** `mvn clean compile`
- [ ] **Unit Tests:** `mvn test`
- [ ] **Import Validation:** All imports resolve correctly
- [ ] **Package Structure:** No circular dependencies
- [ ] **Aggregate Reconstitution:** Event replay works
- [ ] **Business Rules:** All command validations still enforced
- [ ] **External References:** 16 external files updated
- [ ] **Documentation:** Javadocs updated with new package paths

---

## Timeline Estimate

**Total: 3-4 weeks**

| Phase | Duration | Files Affected |
|-------|----------|----------------|
| **Phase 1: Preparation** | 1 week | Analysis complete ✅ |
| **Phase 2: Extract Forms** | 1 week | ~40 files + aggregate |
| **Phase 3: Extract Arms** | 3 days | ~20 files + aggregate |
| **Phase 4: Extract Visits** | 3 days | ~15 files + aggregate |
| **Phase 5: Cleanup** | 1 day | Delete empty dirs |
| **Phase 6: Validation** | 3 days | Build, test, verify |

---

## Conclusion

**RECOMMENDATION: Keep Single `StudyDesignAggregate` with Package Reorganization**

**Reasoning:**
1. Strong cross-subdomain dependencies make splitting impractical
2. Business rules require atomic enforcement (arms → visits → forms)
3. Event sourcing complexity would increase significantly
4. Package organization provides 90% of the benefits with 10% of the risk
5. Maintains transaction boundaries and data consistency
6. No event store migration needed

**Next Steps:**
1. ✅ Commit this analysis document
2. Begin Phase 2: Extract Form Management subdomain
3. Update `StudyDesignAggregate` imports incrementally
4. Validate at each step with compilation and tests

**Grade:** This approach maintains the A- architecture grade while improving organization!

