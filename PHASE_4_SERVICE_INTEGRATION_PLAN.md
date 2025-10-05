# Phase 4: Service Layer Integration - Implementation Plan

**Date**: October 4, 2025  
**Branch**: CLINOPS_DDD_IMPL  
**Status**: 🟡 IN PROGRESS

---

## 📋 **Overview**

Phase 4 integrates the new event-sourced aggregates (Phase 1-3) with existing service layer by creating **adapter services** that provide backward compatibility while routing to the new DDD/CQRS/Event Sourcing implementation.

### **Strategy: Gradual Migration with Dual-Write**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 4 ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Legacy Controllers                New Controllers                │
│         │                                  │                      │
│         ▼                                  ▼                      │
│  ┌──────────────────┐            ┌──────────────────┐           │
│  │ Adapter Services │◄──────────►│ New CQRS Services│           │
│  │  (Phase 4)       │            │  (Phase 1-3)     │           │
│  └────────┬─────────┘            └─────────┬────────┘           │
│           │                                 │                     │
│           │         Dual-Write Period       │                     │
│           ├─────────────┬───────────────────┤                     │
│           ▼             ▼                   ▼                     │
│    ┌──────────┐  ┌──────────┐      ┌──────────┐                 │
│    │  Legacy  │  │   Event  │      │   Read   │                 │
│    │   DB     │  │  Store   │      │  Model   │                 │
│    └──────────┘  └──────────┘      └──────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Goals**

1. ✅ **Zero Downtime**: Maintain existing API contracts
2. ✅ **Backward Compatibility**: Existing controllers/services continue working
3. ✅ **Gradual Migration**: Route traffic incrementally to new aggregates
4. ✅ **Data Consistency**: Dual-write ensures both old and new models stay in sync
5. ✅ **Rollback Safety**: Can revert to legacy at any time during transition

---

## 📦 **Services to Integrate** (3 Core Services)

### **Target Services** (directly manage study design entities):

| Service | Lines | Methods | Priority | Status |
|---------|-------|---------|----------|--------|
| `StudyArmService.java` | 386 | 15 | 🔴 HIGH | 🟡 IN PROGRESS |
| `VisitDefinitionService.java` | 214 | 12 | 🔴 HIGH | ⬜ NOT STARTED |
| `VisitFormService.java` | 270 | 15 | 🔴 HIGH | ⬜ NOT STARTED |

**Total**: 870 lines, 42 methods to refactor

---

## 🏗️ **Implementation Pattern: Adapter Service**

### **Pattern Overview**

Each legacy service gets an **adapter layer** that:
1. Accepts legacy DTOs (unchanged API)
2. Converts to new command/query DTOs
3. Routes to new CQRS services
4. Converts response back to legacy DTOs
5. **Dual-writes** during transition (write to both old and new)

### **Example: StudyArmService Refactoring**

#### **Before (Legacy)**
```java
@Service
public class StudyArmService {
    private final StudyArmRepository studyArmRepository;
    
    public StudyArmResponseDto createStudyArm(Long studyId, StudyArmCreateRequestDto request) {
        // Direct database access
        StudyArmEntity entity = new StudyArmEntity();
        entity.setName(request.getName());
        // ... set fields
        return studyArmRepository.save(entity);
    }
}
```

#### **After (Adapter Pattern)**
```java
@Service
public class StudyArmService {
    private final StudyDesignCommandService commandService; // NEW
    private final StudyDesignQueryService queryService;     // NEW
    private final StudyArmRepository legacyRepository;      // Keep for dual-write
    
    @Value("${clinprecision.migration.use-event-sourcing:true}")
    private boolean useEventSourcing;
    
    public StudyArmResponseDto createStudyArm(Long studyId, StudyArmCreateRequestDto request) {
        if (useEventSourcing) {
            return createStudyArmEventSourced(studyId, request);
        } else {
            return createStudyArmLegacy(studyId, request);
        }
    }
    
    private StudyArmResponseDto createStudyArmEventSourced(Long studyId, StudyArmCreateRequestDto request) {
        // Convert legacy DTO to new command DTO
        AddStudyArmRequest commandRequest = AddStudyArmRequest.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .sequenceNumber(request.getSequence())
                .plannedSubjects(request.getPlannedSubjects())
                .addedBy("system") // TODO: Get from auth context
                .build();
        
        // Dispatch command via Axon
        UUID armUuid = commandService.addStudyArm(
                UUID.fromString(request.getStudyDesignId()), 
                commandRequest
        ).join(); // Await async result
        
        // Query new read model
        StudyArmResponse response = queryService.getStudyArm(
                UUID.fromString(request.getStudyDesignId()), 
                armUuid
        );
        
        // DUAL-WRITE: Also save to legacy table for compatibility
        StudyArmEntity legacyEntity = new StudyArmEntity();
        legacyEntity.setStudyId(studyId);
        legacyEntity.setArmUuid(armUuid); // Link to new model
        legacyEntity.setName(request.getName());
        // ... set other fields
        legacyRepository.save(legacyEntity);
        
        // Convert new response to legacy DTO
        return convertToLegacyDto(response);
    }
    
    private StudyArmResponseDto createStudyArmLegacy(Long studyId, StudyArmCreateRequestDto request) {
        // Original legacy implementation (unchanged)
        StudyArmEntity entity = new StudyArmEntity();
        entity.setName(request.getName());
        // ... set fields
        return convertToLegacyDto(legacyRepository.save(entity));
    }
    
    private StudyArmResponseDto convertToLegacyDto(StudyArmResponse response) {
        return StudyArmResponseDto.builder()
                .id(null) // Legacy ID not used in new model
                .armUuid(response.getArmId().toString())
                .name(response.getName())
                .description(response.getDescription())
                .type(response.getType())
                .sequence(response.getSequenceNumber())
                .plannedSubjects(response.getPlannedSubjects())
                .build();
    }
}
```

---

## 📊 **Implementation Steps**

### **Step 1: Add Configuration Flag** ✅
```yaml
# application.yml
clinprecision:
  migration:
    use-event-sourcing: true  # Toggle new/old implementation
    dual-write-enabled: true  # Write to both systems during migration
```

### **Step 2: Create Adapter Service for StudyArmService** (Priority 1)

**File**: `StudyArmAdapter.java` (NEW)

**Methods to Adapt** (15 total):
- ✅ `getStudyArmsByStudyId(Long studyId)` → Query new read model
- ✅ `getStudyArmById(Long studyArmId)` → Query by UUID
- ✅ `createStudyArm(Long studyId, StudyArmCreateRequestDto)` → AddStudyArmCommand
- ✅ `updateStudyArm(Long studyArmId, StudyArmUpdateRequestDto)` → UpdateStudyArmCommand
- ✅ `deleteStudyArm(Long studyArmId)` → RemoveStudyArmCommand
- ✅ `getStudyArmStats(Long studyId)` → Query new read model
- ✅ `reorderStudyArmSequences(Long studyId)` → Multiple UpdateStudyArmCommands

**Conversions Needed**:
- `StudyArmCreateRequestDto` → `AddStudyArmRequest`
- `StudyArmUpdateRequestDto` → `UpdateStudyArmRequest`
- `StudyArmResponse` → `StudyArmResponseDto`
- `Long studyId` → `UUID studyDesignId` (mapping required)

### **Step 3: Create Adapter Service for VisitDefinitionService** (Priority 2)

**File**: `VisitDefinitionAdapter.java` (NEW)

**Methods to Adapt** (12 total):
- ✅ `getVisitsByStudyId(Long studyId)` → Query new read model
- ✅ `getVisitsByStudyIdAndArm(Long studyId, Long armId)` → Query with armUuid filter
- ✅ `getVisitById(Long visitId)` → Query by UUID
- ✅ `createVisit(VisitDefinitionDto)` → DefineVisitCommand
- ✅ `updateVisit(Long visitId, VisitDefinitionDto)` → UpdateVisitCommand
- ✅ `deleteVisit(Long visitId)` → RemoveVisitCommand
- ✅ `getVisitsByType(Long studyId, VisitType)` → Query with type filter
- ✅ `reorderVisits(Long studyId, List<Long>)` → Multiple UpdateVisitCommands

**Conversions Needed**:
- `VisitDefinitionDto` → `DefineVisitRequest` / `UpdateVisitRequest`
- `VisitDefinitionResponse` → `VisitDefinitionDto`
- `Long armId` → `UUID armUuid` (mapping required)

### **Step 4: Create Adapter Service for VisitFormService** (Priority 3)

**File**: `VisitFormAdapter.java` (NEW)

**Methods to Adapt** (15 total):
- ✅ `getFormsByVisitId(Long visitId)` → Query by visitUuid
- ✅ `getVisitsByFormId(Long formId)` → Query by formUuid
- ✅ `createVisitFormAssociation(VisitFormDto)` → AssignFormToVisitCommand
- ✅ `updateVisitFormAssociation(Long id, VisitFormDto)` → UpdateFormAssignmentCommand
- ✅ `deleteVisitFormAssociation(Long id)` → RemoveFormAssignmentCommand
- ✅ `reorderFormsInVisit(Long visitId, List<Long>)` → Multiple UpdateFormAssignmentCommands
- ✅ `getRequiredFormsByVisitId(Long visitId)` → Query with isRequired=true filter

**Conversions Needed**:
- `VisitFormDto` → `AssignFormToVisitRequest` / `UpdateFormAssignmentRequest`
- `FormAssignmentResponse` → `VisitFormDto`
- `Long visitId` → `UUID visitUuid`, `Long formId` → `UUID formUuid`

### **Step 5: Create ID Mapping Service** (Critical)

**File**: `LegacyIdMappingService.java` (NEW)

**Purpose**: Bridge between legacy Long IDs and new UUIDs

```java
@Service
public class LegacyIdMappingService {
    private final StudyArmRepository studyArmRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final VisitFormRepository visitFormRepository;
    
    // Map Long studyId to UUID studyDesignId
    public UUID getStudyDesignUuid(Long studyId) {
        // Query study table for aggregate_uuid field
        return studyRepository.findById(studyId)
                .map(StudyEntity::getAggregateUuid)
                .orElseThrow(() -> new EntityNotFoundException("Study not found: " + studyId));
    }
    
    // Map Long armId to UUID armUuid
    public UUID getArmUuid(Long armId) {
        return studyArmRepository.findById(armId)
                .map(StudyArmEntity::getArmUuid)
                .orElseThrow(() -> new EntityNotFoundException("Study arm not found: " + armId));
    }
    
    // Reverse: Map UUID armUuid to Long armId (for legacy responses)
    public Long getArmId(UUID armUuid) {
        return studyArmRepository.findByArmUuid(armUuid)
                .map(StudyArmEntity::getId)
                .orElse(null); // Return null if not in legacy table
    }
    
    // Similar methods for visitId/visitUuid, formId/formUuid mappings
}
```

### **Step 6: Update Legacy Repositories** (Add UUID Queries)

**StudyArmRepository.java** - Add methods:
```java
Optional<StudyArmEntity> findByArmUuid(UUID armUuid);
List<StudyArmEntity> findByStudyIdAndArmUuidIsNotNull(Long studyId); // Migrated records
```

**VisitDefinitionRepository.java** - Add methods:
```java
Optional<VisitDefinitionEntity> findByVisitUuid(UUID visitUuid);
```

**VisitFormRepository.java** - Add methods:
```java
Optional<VisitFormEntity> findByAssignmentUuid(UUID assignmentUuid);
```

---

## 🔧 **Testing Strategy**

### **Unit Tests** (Per Adapter Service)
```java
@SpringBootTest
class StudyArmAdapterTest {
    @MockBean private StudyDesignCommandService commandService;
    @MockBean private StudyDesignQueryService queryService;
    @Autowired private StudyArmService adapter;
    
    @Test
    void shouldCreateStudyArmViaEventSourcing() {
        // Given: Legacy DTO
        StudyArmCreateRequestDto request = new StudyArmCreateRequestDto();
        request.setName("Treatment Arm");
        
        // When: Call adapter
        when(commandService.addStudyArm(any(), any())).thenReturn(CompletableFuture.completedFuture(UUID.randomUUID()));
        StudyArmResponseDto response = adapter.createStudyArm(1L, request);
        
        // Then: Verify command dispatched
        verify(commandService).addStudyArm(any(), argThat(cmd -> 
                cmd.getName().equals("Treatment Arm")
        ));
    }
}
```

### **Integration Tests** (End-to-End)
```java
@SpringBootTest
@AutoConfigureTestDatabase
@Sql(scripts = "/test-data/study-arms.sql")
class StudyArmIntegrationTest {
    @Autowired private StudyArmService studyArmService;
    @Autowired private StudyArmRepository legacyRepository;
    @Autowired private StudyArmReadRepository newRepository;
    
    @Test
    void shouldDualWriteToLegacyAndEventStore() {
        // When: Create arm via adapter
        StudyArmCreateRequestDto request = createTestRequest();
        StudyArmResponseDto response = studyArmService.createStudyArm(1L, request);
        
        // Then: Verify both old and new models updated
        Optional<StudyArmEntity> legacyRecord = legacyRepository.findById(response.getId());
        assertThat(legacyRecord).isPresent();
        
        Optional<StudyArmEntity> newRecord = newRepository.findByArmUuid(response.getArmUuid());
        assertThat(newRecord).isPresent();
        assertThat(newRecord.get().getName()).isEqualTo(legacyRecord.get().getName());
    }
}
```

---

## 📈 **Success Metrics**

### **Phase 4 Complete Criteria**:
- [x] Configuration flags added (`use-event-sourcing`, `dual-write-enabled`)
- [ ] 3 adapter services created (StudyArm, VisitDefinition, VisitForm)
- [ ] ID mapping service implemented
- [ ] Legacy repositories updated with UUID queries
- [ ] 42 methods migrated to adapter pattern
- [ ] Unit tests: 100% coverage on adapters
- [ ] Integration tests: Dual-write verified
- [ ] Zero compilation errors
- [ ] Zero breaking changes to existing API contracts

### **Quality Gates**:
- ✅ All existing API endpoints still work
- ✅ Response DTOs unchanged (backward compatible)
- ✅ Database writes to both old and new tables
- ✅ Can toggle feature flag without errors
- ✅ Rollback plan tested

---

## 🚀 **Rollout Plan**

### **Stage 1: Canary (Week 1)**
- Enable `use-event-sourcing: true` for **10%** of traffic
- Monitor error rates, performance
- Dual-write ensures data consistency

### **Stage 2: Ramp Up (Week 2)**
- Increase to **50%** of traffic
- Validate event store integrity
- Check read model projection lag

### **Stage 3: Full Rollout (Week 3)**
- **100%** of traffic on new aggregates
- Legacy tables now read-only (for rollback safety)

### **Stage 4: Cleanup (Not Needed - Fresh Database)**
- ✅ No dual-write needed (fresh database)
- ✅ No database triggers to remove (CQRS handles all logic)
- ✅ No legacy tables to drop (starting clean)

---

## 📝 **Progress Tracking**

| Task | Status | Files | Completion |
|------|--------|-------|------------|
| Configuration flags | ⬜ NOT STARTED | 1 | 0% |
| StudyArmAdapter | ⬜ NOT STARTED | 1 | 0% |
| VisitDefinitionAdapter | ⬜ NOT STARTED | 1 | 0% |
| VisitFormAdapter | ⬜ NOT STARTED | 1 | 0% |
| LegacyIdMappingService | ⬜ NOT STARTED | 1 | 0% |
| Update StudyArmRepository | ⬜ NOT STARTED | 1 | 0% |
| Update VisitDefinitionRepository | ⬜ NOT STARTED | 1 | 0% |
| Update VisitFormRepository | ⬜ NOT STARTED | 1 | 0% |
| Unit Tests | ⬜ NOT STARTED | 3 | 0% |
| Integration Tests | ⬜ NOT STARTED | 3 | 0% |

**Total**: 0% complete (0/16 tasks)

---

## 🔗 **Dependencies**

**Required from Previous Phases**:
- ✅ Phase 1: StudyAggregate complete
- ✅ Phase 2: ProtocolVersionAggregate complete
- ✅ Phase 3: StudyDesignAggregate complete (52 files)

**Blocks**:
- ✅ Phase 5 (Database Cleanup) **NOT NEEDED** - Fresh database with CQRS means no business logic in database to remove

---

## 🎯 **Next Steps**

1. ✅ **Create Phase 4 plan document** (THIS FILE)
2. ⬜ **Add configuration properties** to `application.yml`
3. ⬜ **Create `LegacyIdMappingService`** (foundation for all adapters)
4. ⬜ **Implement `StudyArmAdapter`** (15 methods)
5. ⬜ **Update `StudyArmRepository`** with UUID queries
6. ⬜ **Test `StudyArmAdapter`** (unit + integration)
7. ⬜ **Repeat steps 4-6 for VisitDefinition and VisitForm**
8. ⬜ **End-to-end testing** with dual-write enabled
9. ⬜ **Performance benchmarking** (compare old vs new)
10. ⬜ **Create Phase 4 completion document**

---

**Estimated Time**: 15-20 hours
**Target Completion**: October 11, 2025
