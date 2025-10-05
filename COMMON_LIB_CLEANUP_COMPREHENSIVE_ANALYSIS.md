# Common-Lib Comprehensive Cleanup Analysis

**Date:** October 5, 2025  
**Status:** 🚨 **CRITICAL ISSUE - Major Architecture Violation**  
**Impact:** High complexity, tight coupling, difficult maintenance

---

## 📊 **Executive Summary**

### **The Problem**
The `clinprecision-common-lib` module has become a **dumping ground** for code that:
- ✅ Is **only used by clinops service** (not shared)
- ❌ Creates **tight coupling** between all services
- ❌ Forces **unnecessary dependencies** on services that don't need them
- ❌ Makes **testing difficult** (need to include entire common-lib)
- ❌ Violates **microservice principles** (shared database entities)

### **Current Stats**
| Category | Total Files | Clinops-Specific | Truly Shared | Percentage Clinops-Only |
|----------|-------------|------------------|--------------|-------------------------|
| **DTOs (clinops package)** | 31 | 31 | 0 | **100%** |
| **DTOs (shared package)** | 17 | ~8 | ~9 | **~47%** |
| **Entities (clinops package)** | 20 | 20 | 0 | **100%** |
| **Entities (shared package)** | 13 | 0 | 13 | **0%** |
| **Mappers (clinops)** | 3 | 3 | 0 | **100%** |
| **Mappers (shared)** | 5 | ~2 | ~3 | **~40%** |
| **TOTAL** | **~105 files** | **~70 files** | **~35 files** | **~67%** |

### **Verdict**
**67% of common-lib is clinops-specific code that should NOT be in a shared library!**

---

## 🎯 **Migration Strategy**

### **Phase 1: Move Clinops-Specific Code (HIGH PRIORITY)**
Move all `com.clinprecision.common.*.clinops.*` to clinops service

### **Phase 2: Extract Clinops-Only Shared DTOs (MEDIUM PRIORITY)**
Move shared DTOs that are only used by clinops

### **Phase 3: Keep Truly Shared Code (LOW PRIORITY)**
Keep only code used by 2+ services

### **Phase 4: Delete Unused Code (FINAL)**
Delete any remaining unused code

---

## 📦 **Detailed Analysis**

## **CATEGORY 1: Clinops Package (100% Clinops-Only)**

### **1.1 DTOs - com.clinprecision.common.dto.clinops (31 files)**

| File | Status | Reason | Move To |
|------|--------|--------|---------|
| `CreateCodeListRequest.java` | 🔴 **MOVE** | Only used in clinops | `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/` |
| `CreateFormTemplateDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `DesignProgressDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `DesignProgressResponseDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `DesignProgressUpdateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `FormDefinitionCreateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `FormDefinitionDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `FormTemplateCreateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `FormTemplateDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `OrganizationAssignmentDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `OrganizationStudyDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `RegulatoryStatusDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyAmendmentDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyArmCreateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyArmResponseDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyArmUpdateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyCreateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyDashboardMetricsDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyDocumentDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyInterventionResponseDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyInterventionUpdateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyPhaseDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyResponseDto.java` | 🔴 **MOVE** | Only used in clinops (⚠️ user-service uses for Feign) | ↑ |
| `StudyStatusDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyUpdateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyVersionCreateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyVersionDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `StudyVersionUpdateRequestDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `UpdateCodeListRequest.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `UpdateFormTemplateDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `VisitDefinitionDto.java` | 🔴 **MOVE** | Only used in clinops | ↑ |

**Summary:** All 31 files should move to clinops service

---

### **1.2 Entities - com.clinprecision.common.entity.clinops (20 files)**

| File | Status | Reason | Move To |
|------|--------|--------|---------|
| `DesignProgressEntity.java` | 🔴 **MOVE** | Clinops domain entity | `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/entity/` |
| `FormDefinitionEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `FormTemplateEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `InterventionType.java` | 🔴 **MOVE** | Clinops enum | ↑ |
| `OrganizationRole.java` | 🔴 **MOVE** | Clinops enum | ↑ |
| `OrganizationStudyEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `RegulatoryStatusEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyAmendmentEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyArmEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyArmType.java` | 🔴 **MOVE** | Clinops enum | ↑ |
| `StudyDocumentAuditEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyDocumentEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyInterventionEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyPhaseEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyStatus.java` | 🔴 **MOVE** | Clinops enum | ↑ |
| `StudyStatusEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `StudyVersionEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `VisitDefinitionEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |
| `VisitFormEntity.java` | 🔴 **MOVE** | Clinops domain entity | ↑ |

**Summary:** All 20 files should move to clinops service

---

### **1.3 Mappers - com.clinprecision.common.mapper.clinops (3 files)**

| File | Status | Reason | Move To |
|------|--------|--------|---------|
| `FormDefinitionMapper.java` | 🔴 **MOVE** | Only used in clinops | `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/mapper/` |
| `StudyDocumentMapper.java` | 🔴 **MOVE** | Only used in clinops | ↑ |
| `VisitTypeConverter.java` | 🔴 **MOVE** | Only used in clinops | ↑ |

**Summary:** All 3 files should move to clinops service

---

## **CATEGORY 2: Shared Package - Mixed Usage**

### **2.1 DTOs - com.clinprecision.common.dto (17 files)**

| File | Used By | Status | Action | Reason |
|------|---------|--------|--------|--------|
| `AuthUserDto.java` | user-service | 🟢 **KEEP** | None | Truly shared (auth) |
| `CertificationRequest.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `CertificationResult.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `CodeListDto.java` | clinops, (others?) | 🟢 **KEEP** | None | Shared across services |
| `OrganizationDto.java` | organization, user, site | 🟢 **KEEP** | None | Truly shared |
| `RoleDto.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `SiteActivationRequest.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `SiteActivationResult.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `SiteDto.java` | site-service | 🟢 **KEEP** | None | Truly shared |
| `TrainingRequest.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `TrainingResult.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `UserAccessRequest.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `UserAccessResult.java` | ❓ Unknown | 🟡 **CHECK** | Verify usage | Might be unused |
| `UserDto.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserStudyRoleDto.java` | user-service, clinops (Feign) | 🟢 **KEEP** | None | Truly shared |
| `UserTypeDto.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `VisitFormDto.java` | clinops | 🔴 **MOVE** | Move to clinops | Only used by clinops |

**Summary:**
- **KEEP**: 9 files (truly shared)
- **MOVE**: 1 file (clinops-only)
- **CHECK**: 7 files (verify if used)

---

### **2.2 Entities - com.clinprecision.common.entity (13 files)**

| File | Used By | Status | Action | Reason |
|------|---------|--------|--------|--------|
| `AuthorityEntity.java` | user-service | 🟢 **KEEP** | None | Truly shared (auth) |
| `CodeListEntity.java` | clinops | 🔴 **MOVE** | Move to clinops | Only clinops uses |
| `OrganizationContactEntity.java` | organization-service | 🟢 **KEEP** | None | Truly shared |
| `OrganizationEntity.java` | organization, site | 🟢 **KEEP** | None | Truly shared |
| `RoleEntity.java` | user, site | 🟢 **KEEP** | None | Truly shared |
| `SiteEntity.java` | site-service | 🟢 **KEEP** | None | Truly shared |
| `SiteStudyEntity.java` | site, clinops | 🟡 **DEBATE** | Keep or move? | Used by 2 services |
| `UserEntity.java` | user, site | 🟢 **KEEP** | None | Truly shared |
| `UserQualificationEntity.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserSessionEntity.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserSiteAssignmentEntity.java` | user, site | 🟢 **KEEP** | None | Truly shared |
| `UserStudyRoleEntity.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserTypeEntity.java` | user-service | 🟢 **KEEP** | None | Truly shared |

**Summary:**
- **KEEP**: 11 files (truly shared)
- **MOVE**: 1 file (clinops-only)
- **DEBATE**: 1 file (SiteStudyEntity)

---

### **2.3 Mappers - com.clinprecision.common.mapper (5 files)**

| File | Used By | Status | Action | Reason |
|------|---------|--------|--------|--------|
| `CodeListMapper.java` | clinops | 🔴 **MOVE** | Move to clinops | Only clinops uses |
| `FormTemplateMapper.java` | clinops | 🔴 **MOVE** | Move to clinops | Only clinops uses |
| `OrganizationMapper.java` | organization, site | 🟢 **KEEP** | None | Truly shared |
| `SiteMapper.java` | site-service | 🟢 **KEEP** | None | Truly shared |
| `UserMapper.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserStudyRoleMapper.java` | user-service | 🟢 **KEEP** | None | Truly shared |
| `UserTypeMapper.java` | user-service | 🟢 **KEEP** | None | Truly shared |

**Summary:**
- **KEEP**: 5 files (truly shared)
- **MOVE**: 2 files (clinops-only)

---

### **2.4 Other Shared Code**

| Category | Files | Status | Reason |
|----------|-------|--------|--------|
| **Exceptions** | 6 files | 🟢 **KEEP** | Truly shared error handling |
| `com.clinprecision.common.exception.*` | | | |
| `ErrorResponse.java` | | 🟢 **KEEP** | Used by all services |
| `EntityNotFoundException.java` | | 🟢 **KEEP** | Used by all services |
| `EntityLockedException.java` | | 🟢 **KEEP** | Used by all services |
| `DuplicateEntityException.java` | | 🟢 **KEEP** | Used by all services |
| `LockingException.java` | | 🟢 **KEEP** | Used by all services |
| `LockingExceptionHandler.java` | | 🟢 **KEEP** | Used by all services |
| `ResourceNotFoundException.java` | | 🟢 **KEEP** | Used by all services |
| | | | |
| **Utilities** | 1 file | 🟢 **KEEP** | Truly shared utility |
| `SecurityUtil.java` | | 🟢 **KEEP** | Used by multiple services |
| | | | |
| **Config** | 3 files | 🟢 **KEEP** | Truly shared config |
| `CacheConfig.java` | | 🟢 **KEEP** | Cache configuration |
| `CodeListClientConfig.java` | | 🟢 **KEEP** | Feign client config |
| | | | |
| **Client** | 3 files | 🟢 **KEEP** | Truly shared Feign clients |
| `CodeListClient.java` | | 🟢 **KEEP** | Feign client interface |
| `CodeListClientFallback.java` | | 🟢 **KEEP** | Circuit breaker |
| `EnableCodeListClient.java` | | 🟢 **KEEP** | Annotation |
| | | | |
| **Service** | 1 file | 🟢 **KEEP** | Truly shared service |
| `CodeListClientService.java` | | 🟢 **KEEP** | Feign client wrapper |

---

## 🚀 **Migration Plan**

### **Phase 1: Preparation (Day 1)**

#### **Step 1.1: Create Feature Branch**
```bash
git checkout CLINOPS_DDD_IMPL
git pull origin CLINOPS_DDD_IMPL
git checkout -b feature/common-lib-cleanup
```

#### **Step 1.2: Create New Package Structure in Clinops**
```
clinprecision-clinops-service/
├── src/main/java/com/clinprecision/clinopsservice/
    ├── dto/              (NEW - for DTOs from common-lib)
    │   ├── study/       
    │   ├── document/    
    │   ├── design/      
    │   └── form/        
    ├── entity/           (NEW - for entities from common-lib)
    │   ├── study/       
    │   ├── document/    
    │   ├── design/      
    │   └── form/        
    └── mapper/           (EXISTING - add more mappers)
```

#### **Step 1.3: Backup Current State**
```bash
# Create backup branch
git branch backup/common-lib-before-cleanup

# Document current dependencies
mvn dependency:tree -f backend/clinprecision-clinops-service/pom.xml > clinops-dependencies-before.txt
mvn dependency:tree -f backend/clinprecision-common-lib/pom.xml > common-lib-dependencies-before.txt
```

---

### **Phase 2: Move Clinops Package (Day 2-3)**

#### **Step 2.1: Move DTOs (31 files)**
```bash
# Move entire clinops DTO package
mkdir -p backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto
cp -r backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/clinops/* \
      backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/
```

**Update package declarations:**
```java
// OLD
package com.clinprecision.common.dto.clinops;

// NEW
package com.clinprecision.clinopsservice.dto;
```

**Update all imports in clinops-service:**
```java
// OLD
import com.clinprecision.common.dto.clinops.StudyCreateRequestDto;

// NEW
import com.clinprecision.clinopsservice.dto.StudyCreateRequestDto;
```

#### **Step 2.2: Move Entities (20 files)**
```bash
# Move entire clinops entity package
mkdir -p backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/entity
cp -r backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/clinops/* \
      backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/entity/
```

**Update package declarations:**
```java
// OLD
package com.clinprecision.common.entity.clinops;

// NEW
package com.clinprecision.clinopsservice.entity;
```

**Update all imports in clinops-service:**
```java
// OLD
import com.clinprecision.common.entity.clinops.StudyEntity;

// NEW
import com.clinprecision.clinopsservice.entity.StudyEntity;
```

#### **Step 2.3: Move Mappers (3 files)**
```bash
# Move clinops mappers
cp backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/clinops/*.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/mapper/
```

**Update package and imports:**
```java
// OLD
package com.clinprecision.common.mapper.clinops;
import com.clinprecision.common.entity.clinops.*;

// NEW
package com.clinprecision.clinopsservice.mapper;
import com.clinprecision.clinopsservice.entity.*;
```

#### **Step 2.4: Fix User-Service StudyResponseDto Reference**
```java
// user-service: StudyServiceClient.java
// OLD
import com.clinprecision.common.dto.clinops.StudyResponseDto;

// NEW - Add StudyResponseDto to user-service's own DTO package
// This is a Feign client response DTO, should be in user-service
package com.clinprecision.userservice.dto;

public class StudyResponseDto {
    // Copy fields needed by user-service only
    private Long id;
    private String studyNumber;
    private String studyTitle;
    // ... only fields user-service needs
}
```

#### **Step 2.5: Test Build**
```bash
# Build clinops service
cd backend/clinprecision-clinops-service
mvn clean install -DskipTests

# Build common-lib
cd ../clinprecision-common-lib
mvn clean install -DskipTests
```

---

### **Phase 3: Move Clinops-Only Shared Code (Day 4)**

#### **Step 3.1: Move VisitFormDto**
```bash
cp backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/VisitFormDto.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/
```

#### **Step 3.2: Move CodeListEntity**
```bash
cp backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/CodeListEntity.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/entity/
```

#### **Step 3.3: Move Clinops-Only Mappers**
```bash
cp backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/CodeListMapper.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/mapper/
cp backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/FormTemplateMapper.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/mapper/
```

---

### **Phase 4: Clean Up Unused DTOs (Day 5)**

#### **Step 4.1: Verify Unused DTOs**
```bash
# Check if these DTOs are used anywhere
grep -r "CertificationRequest" backend --include="*.java"
grep -r "CertificationResult" backend --include="*.java"
grep -r "SiteActivationRequest" backend --include="*.java"
grep -r "SiteActivationResult" backend --include="*.java"
grep -r "TrainingRequest" backend --include="*.java"
grep -r "TrainingResult" backend --include="*.java"
grep -r "UserAccessRequest" backend --include="*.java"
grep -r "UserAccessResult" backend --include="*.java"
```

#### **Step 4.2: Delete If Unused**
If grep returns 0 matches (except in common-lib itself), DELETE:
```bash
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/CertificationRequest.java
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/CertificationResult.java
# ... etc
```

---

### **Phase 5: Delete From Common-Lib (Day 6)**

#### **Step 5.1: Delete Clinops Package**
```bash
# Delete entire clinops packages
rm -rf backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/clinops
rm -rf backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/clinops
rm -rf backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/clinops
```

#### **Step 5.2: Delete Moved Files**
```bash
# Delete files moved to clinops
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/VisitFormDto.java
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/CodeListEntity.java
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/CodeListMapper.java
rm backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/mapper/FormTemplateMapper.java
```

---

### **Phase 6: Final Testing (Day 7)**

#### **Step 6.1: Build All Services**
```bash
cd backend
mvn clean install -DskipTests
```

#### **Step 6.2: Run Tests**
```bash
# Run all tests
mvn test

# Or run service by service
cd clinprecision-clinops-service && mvn test
cd ../clinprecision-user-service && mvn test
cd ../clinprecision-organization-service && mvn test
cd ../clinprecision-site-service && mvn test
```

#### **Step 6.3: Test Application**
```bash
# Start all services
./rebuild-services.ps1

# Verify:
# 1. Login works (user-service)
# 2. Studies list works (clinops-service)
# 3. Organizations list works (organization-service)
# 4. Sites list works (site-service)
```

---

## 📊 **Expected Results**

### **Before Cleanup:**
```
common-lib/
├── dto/
│   ├── clinops/ (31 files) ❌ Clinops-only
│   └── (17 files) (8 unused?)
├── entity/
│   ├── clinops/ (20 files) ❌ Clinops-only
│   └── (13 files)
└── mapper/
    ├── clinops/ (3 files) ❌ Clinops-only
    └── (5 files, 2 clinops-only)

TOTAL: ~105 files
```

### **After Cleanup:**
```
common-lib/ (truly shared only)
├── dto/ (~9 files) ✅ Used by 2+ services
├── entity/ (~12 files) ✅ Used by 2+ services
├── mapper/ (~5 files) ✅ Used by 2+ services
├── exception/ (6 files) ✅ Truly shared
├── util/ (1 file) ✅ Truly shared
├── config/ (2 files) ✅ Truly shared
└── client/ (3 files) ✅ Truly shared

TOTAL: ~38 files (64% reduction!)

clinprecision-clinops-service/ (clinops-specific)
├── dto/ (~40 files) ✅ All clinops DTOs
├── entity/ (~21 files) ✅ All clinops entities
└── mapper/ (~8 files) ✅ All clinops mappers

TOTAL: ~69 files moved from common-lib
```

---

## 🎯 **Benefits**

### **1. Better Separation of Concerns**
- ✅ Common-lib only has truly shared code
- ✅ Clinops service owns its domain models
- ✅ Each service has clear boundaries

### **2. Reduced Coupling**
- ✅ User-service doesn't need clinops entities
- ✅ Organization-service doesn't need study DTOs
- ✅ Site-service doesn't need form definitions

### **3. Easier Testing**
- ✅ Smaller common-lib = faster test setup
- ✅ Mock only what you need
- ✅ No unnecessary dependencies

### **4. Better Maintainability**
- ✅ Change clinops entities without affecting other services
- ✅ Clear ownership of code
- ✅ Easier to understand dependencies

### **5. True Microservice Architecture**
- ✅ Each service owns its data models
- ✅ Communication via DTOs (Feign clients)
- ✅ No shared database entities across services

---

## ⚠️ **Risks & Mitigation**

### **Risk 1: Breaking Feign Clients**
**Mitigation:**
- Keep DTOs used in Feign client interfaces in common-lib
- Or duplicate DTOs in each service (better for microservices)
- Test all Feign clients after migration

### **Risk 2: Compile Errors**
**Mitigation:**
- Use IDE refactoring tools (IntelliJ: Refactor → Move)
- Search and replace import statements
- Build incrementally, fix errors as you go

### **Risk 3: Database Schema Changes**
**Mitigation:**
- NO database changes needed
- Only moving Java code between modules
- Entities still map to same tables

### **Risk 4: Version Control Conflicts**
**Mitigation:**
- Do migration in dedicated feature branch
- Communicate with team
- Merge frequently from main branch

---

## 📋 **Quick Reference Commands**

### **Search for Usage**
```bash
# Find all usages of a class
grep -r "StudyEntity" backend --include="*.java"

# Find imports
grep -r "import com.clinprecision.common.dto.clinops" backend --include="*.java"

# Count usages per service
grep -r "StudyEntity" backend/clinprecision-clinops-service --include="*.java" | wc -l
grep -r "StudyEntity" backend/clinprecision-user-service --include="*.java" | wc -l
```

### **Move Files**
```bash
# Move single file
mv backend/clinprecision-common-lib/src/main/java/com/clinprecision/common/dto/clinops/StudyDto.java \
   backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/

# Move entire package
cp -r source_path/* destination_path/
```

### **Update Imports**
```bash
# Using sed (Linux/Mac)
find backend/clinprecision-clinops-service -name "*.java" -exec sed -i \
  's/com.clinprecision.common.dto.clinops/com.clinprecision.clinopsservice.dto/g' {} +

# Or use IntelliJ: Ctrl+Shift+R (Find and Replace in Path)
```

---

## 🎓 **Key Learnings**

### **What Went Wrong?**
1. ❌ **No clear ownership** - common-lib became dumping ground
2. ❌ **No review process** - "just add it to common-lib"
3. ❌ **Confusion about "shared"** - "clinops might share it someday"
4. ❌ **Fear of duplication** - "DRY at all costs"

### **What Should We Do?**
1. ✅ **Clear rules**: common-lib only for code used by 2+ services TODAY
2. ✅ **Review process**: PR review must justify common-lib additions
3. ✅ **Accept duplication**: Better than wrong abstraction
4. ✅ **Ownership**: Each service owns its domain models

### **Rule of Thumb**
> **"If it's only used by one service, it belongs in that service."**
>
> **"If it's used by two services, consider common-lib."**
>
> **"If it's used by all services, definitely common-lib."**

---

## 📝 **Next Steps**

1. ✅ **Review this analysis** with team
2. ✅ **Get approval** for migration plan
3. ✅ **Schedule cleanup** (1 week of work)
4. ✅ **Execute Phase 1** (preparation)
5. ✅ **Execute Phase 2** (move clinops package)
6. ✅ **Execute Phase 3** (move clinops-only shared)
7. ✅ **Execute Phase 4** (delete unused)
8. ✅ **Execute Phase 5** (clean up common-lib)
9. ✅ **Execute Phase 6** (test everything)
10. ✅ **Document new rules** for common-lib usage

---

**Last Updated:** October 5, 2025  
**Status:** 📋 **Ready for Review**  
**Priority:** 🔴 **HIGH** - Technical debt reduction  
**Estimated Effort:** 7 days  
**Risk Level:** 🟡 **MEDIUM** - Large refactoring, but no logic changes

---

## 🏆 **Success Criteria**

- ✅ All clinops-specific code moved to clinops service
- ✅ Common-lib < 40 files (from ~105)
- ✅ All tests pass
- ✅ All services build successfully
- ✅ Application works end-to-end
- ✅ No compilation errors
- ✅ Clear documentation of new rules
