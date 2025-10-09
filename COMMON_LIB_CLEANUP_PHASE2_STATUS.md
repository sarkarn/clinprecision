# Common-Lib Cleanup - Phase 2 Status Report

**Date:** October 5, 2025  
**Status:** 🟡 **IN PROGRESS - Issues Encountered**  
**Phase:** 2 - Move Clinops Package

---

## ✅ **What Was Done Successfully**

### **Files Copied:**
- ✅ **31 DTOs** copied from `common.dto.clinops` → `clinopsservice.dto`
- ✅ **20 Entities** copied from `common.entity.clinops` → `clinopsservice.entity`
- ✅ **3 Mappers** copied from `common.mapper.clinops` → `clinopsservice.mapper`

### **Package Declarations Updated:**
- ✅ All 54 files have updated package declarations
- ✅ Package changed from `com.clinprecision.common.*` to `com.clinprecision.clinopsservice.*`

### **Imports Updated:**
- ✅ **60 files** in clinops-service had imports updated
- ✅ **98 total import replacements** made

---

## ❌ **Compilation Errors Discovered**

### **Problem 1: Study DDD Structure Already Exists**
The clinops-service already has a **DDD/CQRS structure** for Study aggregate:
```
clinopsservice/study/
├── dto/
│   ├── request/      (StudyCreateRequestDto, StudyUpdateRequestDto, etc.)
│   └── response/     (StudyResponseDto, StudyListResponseDto, etc.)
├── command/          (CreateStudyCommand, UpdateStudyCommand, etc.)
├── mapper/           (StudyCommandMapper, StudyResponseMapper, etc.)
└── service/          (StudyCommandService, StudyQueryService, etc.)
```

The copied DTOs from common-lib are **LEGACY** and conflict with new DDD structure!

### **Problem 2: Multiple DTO Files for Same Concepts**
| Legacy (Common-Lib) | New (DDD) | Issue |
|---------------------|-----------|-------|
| `StudyCreateRequestDto` (copied) | `study/dto/request/StudyCreateRequestDto` (existing) | ❌ Name collision |
| `StudyResponseDto` (copied) | `study/dto/response/StudyResponseDto` (existing) | ❌ Name collision |
| `StudyUpdateRequestDto` (copied) | `study/dto/request/StudyUpdateRequestDto` (existing) | ❌ Name collision |

### **Problem 3: Missing @Slf4j Annotations**
100+ errors like:
```
cannot find symbol: variable log
```
**Cause:** Classes use `log` but missing `@Slf4j` annotation

### **Problem 4: Mapper Type Mismatches**
Mappers still trying to convert between:
- ❌ `common.entity.clinops.FormTemplateEntity` (old)
- ✅ `clinopsservice.entity.FormTemplateEntity` (new)

### **Problem 5: VisitTypeConverter Duplicate**
```
duplicate class: com.clinprecision.common.mapper.clinops.VisitTypeConverter
```
**Cause:** File still has old package declaration internally

---

## 🔍 **Root Cause Analysis**

### **The Real Problem:**
The clinops-service has **TWO PARALLEL IMPLEMENTATIONS**:

1. **Legacy (Common-Lib Based)**
   - Uses DTOs from `common-lib`
   - Traditional service layer
   - Used by old controllers

2. **New (DDD/CQRS)**
   - Uses local DTOs in `study/dto/`
   - Command/Query separation
   - Event sourcing with Axon
   - Used by new StudyAggregate

**We can't just blindly copy everything!**

---

## 🎯 **What Should Be Done Instead**

### **Strategy A: Keep Both During Transition (RECOMMENDED)**

#### **Step 1: Categorize DTOs**
| Category | Files | Action |
|----------|-------|--------|
| **Study-related (has DDD equivalent)** | StudyCreateRequestDto, StudyResponseDto, etc. | ❌ **DON'T MOVE** - Already have DDD versions |
| **Form/Template-related** | FormDefinitionDto, FormTemplateDto, VisitDefinitionDto | ✅ **MOVE** - No DDD equivalent yet |
| **Progress-related** | DesignProgressDto, etc. | ✅ **MOVE** - No DDD equivalent yet |
| **Organization/Assignment** | OrganizationAssignmentDto, OrganizationStudyDto | ✅ **MOVE** - No DDD equivalent yet |

#### **Step 2: Move Only Non-Conflicting Items**
```
MOVE:
✅ FormDefinitionDto
✅ FormTemplateDto  
✅ VisitDefinitionDto
✅ DesignProgressDto
✅ OrganizationAssignmentDto
✅ RegulatoryStatusDto
✅ And their related entities

DON'T MOVE (keep in common-lib temporarily):
❌ StudyCreateRequestDto (conflicts with DDD version)
❌ StudyResponseDto (conflicts with DDD version)
❌ StudyUpdateRequestDto (conflicts with DDD version)
❌ StudyVersionDto (conflicts with DDD version)
❌ StudyAmendmentDto (conflicts with DDD version)
❌ StudyDocumentDto (already has DDD implementation)
```

#### **Step 3: Fix Compilation Errors**
1. Delete conflicting copied DTOs
2. Fix mapper imports
3. Add missing `@Slf4j` annotations
4. Fix VisitTypeConverter package declaration

#### **Step 4: Gradual Migration**
1. Keep Study-related DTOs in common-lib for now
2. Migrate forms/templates/progress to clinops
3. Later: Migrate remaining when DDD is complete

---

### **Strategy B: Complete DDD Migration First (ALTERNATIVE)**
1. Stop this cleanup
2. Complete DDD migration for ALL aggregates
3. Then remove common-lib entirely
4. More disruptive but cleaner end result

---

## 🚀 **Recommended Next Steps**

### **Option 1: Continue with Selective Migration (Quick Fix)**
1. ✅ Revert Study-related DTOs (delete copied files)
2. ✅ Keep only non-conflicting DTOs/Entities
3. ✅ Fix compilation errors
4. ✅ Update documentation to reflect partial migration

**Time:** 2-3 hours  
**Risk:** Low  
**Result:** Partial cleanup, Study DTOs stay in common-lib temporarily

### **Option 2: Rollback and Rethink (Conservative)**
1. ❌ Delete all copied files
2. ❌ Revert import changes
3. ✅ Document the problem
4. ✅ Wait until DDD migration is complete
5. ✅ Then do comprehensive cleanup

**Time:** 30 minutes to rollback  
**Risk:** None  
**Result:** Back to starting point, no progress

### **Option 3: Force Complete Migration (Aggressive)**
1. ✅ Delete old DTOs from common-lib
2. ✅ Fix all compilation errors
3. ✅ Merge DDD and legacy DTOs
4. ✅ Update all services

**Time:** 1-2 days  
**Risk:** High (might break things)  
**Result:** Clean but requires extensive testing

---

## 📊 **Current File Status**

### **Copied Files (Need Review):**
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/
├── dto/ (31 files) - ⚠️ Some conflict with existing
├── entity/ (20 files) - ⚠️ Need to verify no conflicts
└── mapper/ (3 files) - ⚠️ Have import errors
```

### **Original Files (Still in common-lib):**
```
backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/
├── dto/clinops/ (31 files) - ⚠️ Still present
├── entity/clinops/ (20 files) - ⚠️ Still present  
└── mapper/clinops/ (3 files) - ⚠️ Still present
```

---

## 💡 **My Recommendation**

**Go with Option 1: Selective Migration**

**Reasoning:**
1. ✅ You've already invested time in this
2. ✅ Some progress is better than none
3. ✅ Forms/Templates/Progress can be safely moved
4. ✅ Study DTOs can wait for complete DDD migration
5. ✅ Low risk, measurable progress

**What I'll Do:**
1. Delete conflicting Study-related DTOs from copied files
2. Fix remaining compilation errors
3. Test build
4. Document what was moved and what remains

---

## ❓ **Your Decision Needed**

**Please choose:**
- **Option 1:** Continue with selective migration (my recommendation)
- **Option 2:** Rollback everything and wait
- **Option 3:** Force complete migration (high risk)

**Or provide your own strategy!**

---

**Last Updated:** October 5, 2025  
**Status:** ⏸️ **PAUSED - Awaiting Decision**  
**Errors:** ~100 compilation errors  
**Progress:** 54 files copied, 60 files updated, 0 files deleted from common-lib yet
