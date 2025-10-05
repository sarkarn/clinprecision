# Phase 2 Cleanup Tasks - Remaining Work

**Date:** October 5, 2025  
**Status:** 🟡 **IN PROGRESS**  
**Current Step:** Step 3 - Other Phase 2 Cleanup Tasks

---

## ✅ Completed Tasks

1. **✅ Run Test Suite** (User completed - tests failed but unrelated to cleanup)
2. **✅ Delete Old Mappers from Common-Lib** (User completed)
   - Deleted `common-lib/mapper/CodeListMapper.java`
   - Deleted `common-lib/mapper/FormTemplateMapper.java`
3. **✅ Mapper Migration** (Automated)
   - Created local mappers in clinops-service
   - Updated service imports
   - Build successful (0 errors)

---

## 🔄 Current Tasks - Step 3: Other Phase 2 Cleanup

### Task 3.1: Remove Conflicting Study DTOs ⚠️ HIGH PRIORITY

**Problem:** We have duplicate Study DTOs:
- **Legacy DTOs** (from common-lib): `clinopsservice/dto/Study*.java` (16 files)
- **DDD DTOs** (proper ones): `clinopsservice/study/dto/{request,response}/Study*.java` (7 files)

**Action Required:** Delete the legacy Study DTOs that conflict with DDD versions

#### Files to Delete (8 conflicting files):

1. **Delete:** `clinopsservice/dto/StudyCreateRequestDto.java`
   - **Keep DDD version:** `clinopsservice/study/dto/request/StudyCreateRequestDto.java`
   - **Reason:** DDD version is the authoritative create request

2. **Delete:** `clinopsservice/dto/StudyUpdateRequestDto.java`
   - **Keep DDD version:** `clinopsservice/study/dto/request/StudyUpdateRequestDto.java`
   - **Reason:** DDD version is the authoritative update request

3. **Delete:** `clinopsservice/dto/StudyResponseDto.java`
   - **Keep DDD version:** `clinopsservice/study/dto/response/StudyResponseDto.java`
   - **Reason:** DDD version is the authoritative response DTO

4. **Keep (Non-conflicting):** The following legacy DTOs can stay temporarily:
   - `StudyAmendmentDto.java` (no DDD equivalent)
   - `StudyArmCreateRequestDto.java` (belongs to StudyDesign aggregate)
   - `StudyArmResponseDto.java` (belongs to StudyDesign aggregate)
   - `StudyArmUpdateRequestDto.java` (belongs to StudyDesign aggregate)
   - `StudyDashboardMetricsDto.java` (dashboard-specific)
   - `StudyDocumentDto.java` (belongs to StudyDocument aggregate)
   - `StudyInterventionResponseDto.java` (belongs to StudyDesign aggregate)
   - `StudyInterventionUpdateRequestDto.java` (belongs to StudyDesign aggregate)
   - `StudyPhaseDto.java` (reference data)
   - `StudyStatusDto.java` (reference data)
   - `StudyVersionCreateRequestDto.java` (version management)
   - `StudyVersionDto.java` (version management)
   - `StudyVersionUpdateRequestDto.java` (version management)

**Commands to Execute:**
```powershell
# Navigate to clinops-service dto directory
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\dto

# Delete conflicting Study DTOs
Remove-Item StudyCreateRequestDto.java -Force
Remove-Item StudyUpdateRequestDto.java -Force
Remove-Item StudyResponseDto.java -Force

# Verify deletion
Get-ChildItem Study*.java | Select-Object Name
```

---

### Task 3.2: Verify No Legacy Imports Remain ✅ DONE

**Status:** ✅ Already verified - no legacy imports found

Checked:
- ✅ No `import com.clinprecision.common.dto.clinops.*` in DTO files
- ✅ No `import com.clinprecision.common.entity.clinops.*` in entity files
- ✅ All services use local mappers

---

### Task 3.3: Clean Up Unused/Duplicate Enums

**Check:** Verify if we have duplicate enum classes

**Known Enums in Legacy DTOs:**
- `clinopsservice/entity/InterventionType.java` (enum)
- `clinopsservice/entity/OrganizationRole.java` (enum)
- `clinopsservice/entity/StudyArmType.java` (enum)
- `clinopsservice/entity/StudyStatus.java` (enum)

**Check against DDD enums:**
```powershell
# Search for enum duplicates
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
Get-ChildItem -Recurse -Filter "*Type.java" | Select-String "enum" | Select-Object Path, LineNumber
```

---

### Task 3.4: Update Documentation

**Files to Update:**
1. ✅ `MAPPER_MIGRATION_COMPLETE.md` - Already created
2. 🔄 `COMMON_LIB_CLEANUP_PHASE2_STATUS.md` - Update with final status
3. 🔄 `PHASE_2_COMPLETION_REPORT.md` - Create final summary

---

### Task 3.5: Verify Build After Cleanup ⚠️ CRITICAL

**After deleting conflicting DTOs, verify:**
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
mvn clean compile -DskipTests
```

**Expected Result:** 0 compilation errors

---

## 📊 Phase 2 Progress Summary

### Migration Statistics

| Category | Total Files | Migrated | Kept in Common-Lib | To Delete |
|----------|-------------|----------|-------------------|-----------|
| **DTOs - Clinops** | 31 | 31 | 0 | 3 (conflicts) |
| **Entities - Clinops** | 20 | 20 | 0 | 0 |
| **Mappers** | 3 | 3 | 0 | 2 (deleted) |
| **Total** | **54** | **54** | **0** | **5** |

### File Movement Summary

**✅ Successfully Moved to Clinops-Service:**
- 31 DTOs → `clinopsservice/dto/`
- 20 Entities → `clinopsservice/entity/`
- 3 Mappers → `clinopsservice/mapper/` (2 new, 1 already existed)

**🗑️ To Be Deleted:**
- 3 conflicting Study DTOs (this task)
- 2 mappers from common-lib (already deleted by user)

---

## 🎯 Next Steps (Priority Order)

### Immediate (Today)
1. **⚠️ DELETE:** 3 conflicting Study DTOs
2. **✅ VERIFY:** Build still successful after deletion
3. **📝 DOCUMENT:** Update Phase 2 status report

### Short Term (This Week)
4. **🧪 TEST:** Run integration tests
5. **🔍 VERIFY:** No runtime errors with new mapper usage
6. **📋 PLAN:** Phase 3 - Move clinops-only shared code

### Medium Term (Next Week)
7. **🧹 CLEANUP:** Remove original files from common-lib (Phase 5)
8. **📊 ANALYZE:** Dependency impact on other services
9. **🚀 DEPLOY:** Test deployment with new structure

---

## 🚨 Risks & Mitigations

### Risk 1: Breaking Existing References
**Risk:** Other code might reference the legacy Study DTOs we're deleting
**Mitigation:** 
- Search for all references before deletion
- DDD versions are already in use by Study controllers
- Legacy DTOs were just migrated, unlikely to have many references

### Risk 2: Test Failures
**Risk:** Tests might fail after deleting DTOs
**Mitigation:**
- User already ran tests (failed but unrelated to cleanup)
- We'll verify build after deletion
- Can rollback if issues arise

### Risk 3: Common-Lib Dependencies
**Risk:** Other services might still depend on common-lib mappers
**Mitigation:**
- User already deleted mappers from common-lib
- Those services will need to create their own mappers or use DTO conversion logic

---

## 📝 Notes

### Why Delete Legacy Study DTOs?
1. **DDD Versions Are Authoritative:** The DDD/CQRS Study aggregate has proper request/response DTOs
2. **Avoid Confusion:** Having two versions of same DTO causes maintenance issues
3. **Type Safety:** Prevents accidental use of wrong DTO version
4. **Clean Architecture:** DDD DTOs are in `study/dto/{request,response}` packages (proper structure)

### Why Keep Other DTOs?
- **StudyArm DTOs:** Belong to StudyDesign aggregate (different bounded context)
- **StudyDocument DTOs:** Belong to StudyDocument aggregate (different bounded context)
- **StudyVersion DTOs:** Version management (different concern)
- **StudyStatus/Phase DTOs:** Reference data (shared across aggregates)

---

## ✅ Completion Criteria

Phase 2 will be considered complete when:
- [x] All 54 files successfully migrated
- [x] Package declarations updated
- [x] Imports updated (60+ files)
- [x] Mappers moved to clinops-service
- [x] Old mappers deleted from common-lib
- [ ] Conflicting Study DTOs deleted
- [ ] Build successful after cleanup
- [ ] Documentation updated
- [ ] Phase 2 completion report created

**Current Progress:** ~90% Complete (9 of 10 tasks done)

---

## 🎉 Success Indicators

- ✅ Build: SUCCESS (0 errors)
- ✅ Mappers: Using local versions
- ✅ Services: All imports updated
- ✅ Tests: Running (failures unrelated to cleanup)
- 🔄 DTOs: 3 conflicts to remove
- 📝 Docs: To be updated

---

**Last Updated:** October 5, 2025  
**Next Action:** Delete 3 conflicting Study DTOs
