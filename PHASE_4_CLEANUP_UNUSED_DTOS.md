# Phase 4: Clean Up Unused DTOs - Execution Plan

**Date:** October 5, 2025  
**Status:** 🚀 **STARTING**  
**Phase:** 4 - Clean Up Unused DTOs from Common-Lib  
**Branch:** CLINOPS_DDD_IMPL

---

## 🎯 **Phase 4 Objective**

Remove ALL unused DTOs from common-lib to complete the cleanup and achieve 100% truly shared code.

---

## 📊 **Discovery Results**

### **Unused DTOs in Shared Folder (8 files) - SAFE TO DELETE:**

| File | Status | Usage |
|------|--------|-------|
| `CertificationRequest.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `CertificationResult.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `TrainingRequest.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `TrainingResult.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `UserAccessRequest.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `UserAccessResult.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `SiteActivationRequest.java` | 🗑️ **DELETE** | 0 usages (only in own file) |
| `SiteActivationResult.java` | 🗑️ **DELETE** | 0 usages (only in own file) |

**Total:** 8 unused DTOs

---

### **Clinops Package Still Exists (31 files) - SHOULD HAVE BEEN DELETED:**

**Discovery:** The `common-lib/dto/clinops/` folder still exists with 31 files!

**Issue:** These were supposed to be deleted in Phase 2 after migration to clinops-service.

**Exception:** `StudyResponseDto.java` is used by user-service (Feign client):
- `StudyServiceClient.java` (line 4)
- `UserStudyRoleServiceImpl.java` (line 5)

**Action Required:**
1. Keep `StudyResponseDto.java` in common-lib (shared via Feign)
2. Delete remaining 30 files from clinops package
3. Update Phase 2 documentation

---

## 📋 **Execution Plan**

### **Step 1: Delete 8 Unused DTOs from Shared Folder** ✅

**Files to Delete:**
```
common-lib/src/main/java/com/clinprecision/common/dto/
├── CertificationRequest.java
├── CertificationResult.java
├── TrainingRequest.java
├── TrainingResult.java
├── UserAccessRequest.java
├── UserAccessResult.java
├── SiteActivationRequest.java
└── SiteActivationResult.java
```

**PowerShell Command:**
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib\src\main\java\com\clinprecision\common\dto

Remove-Item CertificationRequest.java, CertificationResult.java, `
          TrainingRequest.java, TrainingResult.java, `
          UserAccessRequest.java, UserAccessResult.java, `
          SiteActivationRequest.java, SiteActivationResult.java -Force

Write-Host "✅ Deleted 8 unused DTOs" -ForegroundColor Green
```

---

### **Step 2: Delete 30 Files from Clinops Package** ✅

**Keep (1 file):**
- `StudyResponseDto.java` - Used by user-service Feign client

**Delete (30 files):**
```
common-lib/src/main/java/com/clinprecision/common/dto/clinops/
├── CreateCodeListRequest.java ❌
├── CreateFormTemplateDto.java ❌
├── DesignProgressDto.java ❌
├── DesignProgressResponseDto.java ❌
├── DesignProgressUpdateRequestDto.java ❌
├── FormDefinitionCreateRequestDto.java ❌
├── FormDefinitionDto.java ❌
├── FormTemplateCreateRequestDto.java ❌
├── FormTemplateDto.java ❌
├── OrganizationAssignmentDto.java ❌
├── OrganizationStudyDto.java ❌
├── RegulatoryStatusDto.java ❌
├── StudyAmendmentDto.java ❌
├── StudyArmCreateRequestDto.java ❌
├── StudyArmResponseDto.java ❌
├── StudyArmUpdateRequestDto.java ❌
├── StudyCreateRequestDto.java ❌
├── StudyDashboardMetricsDto.java ❌
├── StudyDocumentDto.java ❌
├── StudyInterventionResponseDto.java ❌
├── StudyInterventionUpdateRequestDto.java ❌
├── StudyPhaseDto.java ❌
├── StudyStatusDto.java ❌
├── StudyUpdateRequestDto.java ❌
├── StudyVersionCreateRequestDto.java ❌
├── StudyVersionDto.java ❌
├── StudyVersionUpdateRequestDto.java ❌
├── UpdateCodeListRequest.java ❌
├── UpdateFormTemplateDto.java ❌
└── VisitDefinitionDto.java ❌
```

**PowerShell Command:**
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib\src\main\java\com\clinprecision\common\dto\clinops

# Get all files except StudyResponseDto.java
$filesToDelete = Get-ChildItem -File | Where-Object { $_.Name -ne "StudyResponseDto.java" }

# Delete them
$filesToDelete | Remove-Item -Force

Write-Host "✅ Deleted 30 files from clinops package" -ForegroundColor Green
Write-Host "✅ Kept StudyResponseDto.java for Feign client" -ForegroundColor Yellow

# List remaining
Get-ChildItem
```

---

### **Step 3: Verify Build** ✅

**Check all services:**
```powershell
# Build clinops-service
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
mvn clean compile -DskipTests

# Build user-service (uses StudyResponseDto via Feign)
cd c:\nnsproject\clinprecision\backend\clinprecision-user-service
mvn clean compile -DskipTests

# Build common-lib
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib
mvn clean compile -DskipTests
```

**Expected Result:** ✅ All builds successful

---

### **Step 4: Delete Common-Lib Entities Package (Optional)** ⚠️

Check if `common/entity/clinops/` still exists:

```powershell
Test-Path c:\nnsproject\clinprecision\backend\clinprecision-common-lib\src\main\java\com\clinprecision\common\entity\clinops
```

If YES, delete all files (they should have been migrated in Phase 2).

---

## 📊 **Expected Results**

### **Files Deleted:**
- **8 unused DTOs** from shared folder
- **30 DTOs** from clinops package
- **Total:** 38 files deleted

### **Files Remaining in Common-Lib:**

**Shared DTOs (7 files):**
```
common-lib/dto/
├── AuthUserDto.java ✅ Multi-service
├── OrganizationDto.java ✅ Multi-service
├── RoleDto.java ✅ Multi-service
├── SiteDto.java ✅ Multi-service
├── UserDto.java ✅ Multi-service
├── UserStudyRoleDto.java ✅ Multi-service
└── UserTypeDto.java ✅ Multi-service
```

**Feign Shared (1 file):**
```
common-lib/dto/clinops/
└── StudyResponseDto.java ✅ Feign client (user-service)
```

**Total Remaining:** 8 files (all truly shared!)

---

## 🎯 **Success Criteria**

- ✅ All unused DTOs deleted (8 files)
- ✅ All migrated clinops DTOs deleted (30 files)
- ✅ StudyResponseDto.java retained for Feign client
- ✅ All services build successfully
- ✅ Common-lib contains only truly shared code

---

## ⚠️ **Important Notes**

### **Why Keep StudyResponseDto.java?**

**Reason:** User-service uses Feign client to call clinops-service:

```java
// user-service/service/StudyServiceClient.java
@FeignClient(name = "clinops-service")
public interface StudyServiceClient {
    @GetMapping("/api/studies/{uuid}")
    StudyResponseDto getStudy(@PathVariable String uuid);
}
```

**Options:**
1. ✅ **Keep in common-lib** (current approach) - Shared contract
2. Duplicate in user-service - Creates maintenance burden
3. Create shared-contracts module - Over-engineering for one DTO

**Decision:** Keep in common-lib as it's a legitimate shared contract.

---

## 🚀 **Execution**

Ready to execute! This will complete Phase 4 and achieve 100% truly shared code in common-lib.

**Estimated Time:** 15-20 minutes

---

**Status:** 📋 **READY TO EXECUTE**  
**Risk Level:** LOW (all files verified unused)  
**Last Updated:** October 5, 2025
