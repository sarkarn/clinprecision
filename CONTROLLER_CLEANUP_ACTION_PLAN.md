# Controller Cleanup Action Plan
**Date:** October 5, 2025  
**Branch:** CLINOPS_DDD_IMPL  
**Service:** clinprecision-clinops-service

## Executive Summary

Analysis of 14 controllers in `com.clinprecision.clinopsservice.controller` package to determine which should be deleted (Rule 1), kept (Rule 2), or require DDD replacement creation (Rule 3).

**Total Controllers:** 14  
**To Delete (Rule 1):** 4 controllers (DDD versions exist)  
**To Keep (Rule 2):** 7 controllers (cannot be replaced or already migrated)  
**To Create DDD + Delete (Rule 3):** 3 controllers (need DDD versions first)

---

## Rule 1: DELETE - DDD Version Exists ✅

These controllers have corresponding DDD/CQRS implementations and should be **deleted immediately**.

### 1. ❌ DELETE: `StudyController.java` (328 lines)
**Reason:** DDD versions exist in studydesign package  
**Replacements:**
- ✅ `com.clinprecision.clinopsservice.studydesign.controller.StudyCommandController.java` (236 lines)
- ✅ `com.clinprecision.clinopsservice.studydesign.controller.StudyQueryController.java` (272 lines)

**Endpoints Migrated:**
- `POST /api/studies` → StudyCommandController
- `GET /api/studies` → StudyQueryController
- `GET /api/studies/{id}` → StudyQueryController
- `PUT /api/studies/{id}` → StudyCommandController
- `DELETE /api/studies/{id}` → StudyCommandController

**Action:** DELETE `controller/StudyController.java`

---

### 2. ❌ DELETE: `StudyVersionController.java` (193 lines)
**Reason:** Protocol version functionality exists in DDD form  
**Replacements:**
- ✅ `com.clinprecision.clinopsservice.protocolversion.controller.ProtocolVersionCommandController.java`
- ✅ `com.clinprecision.clinopsservice.protocolversion.controller.ProtocolVersionQueryController.java`

**Legacy Endpoints:**
- `GET /api/studies/{studyId}/versions`
- `POST /api/studies/{studyId}/versions`
- `GET /api/studies/{studyId}/versions/{versionId}`
- `GET /api/studies/{studyId}/versions/active`
- `GET /api/studies/{studyId}/versions/latest`

**New Endpoints:**
- `GET /api/clinops/protocol-versions/protocol/{protocolId}`
- `POST /api/clinops/protocol-versions`
- `GET /api/clinops/protocol-versions/{versionId}`

**Action:** DELETE `controller/StudyVersionController.java`

---

### 3. ❌ DELETE: `StudyAmendmentController.java` (70 lines)
**Reason:** Amendments are part of ProtocolVersion aggregate  
**Replacement:** ProtocolVersionQueryController (amendments are protocol versions with amendmentType)

**Legacy Endpoints:**
- `GET /api/studies/{studyId}/amendments`
- `GET /api/studies/{studyId}/versions/{versionId}/amendments`
- `GET /api/studies/{studyId}/amendments/{amendmentId}`

**New Approach:** Query ProtocolVersions filtered by amendmentType field

**Action:** DELETE `controller/StudyAmendmentController.java`

---

### 4. ❌ DELETE: `ReferenceDataController.java` (218 lines)
**Reason:** Duplicate functionality - StudyController already has lookup endpoints  
**Legacy Endpoints:**
- `GET /api/v2/reference-data/regulatory-statuses`
- `GET /api/v2/reference-data/study-phases`
- `GET /api/v2/reference-data/study-statuses`

**Replacement:** StudyController already has:
- `GET /api/studies/lookup/regulatory-statuses`
- `GET /api/studies/lookup/phases`
- `GET /api/studies/lookup/statuses`

**Action:** DELETE `controller/ReferenceDataController.java`

---

## Rule 2: KEEP - Cannot Be Replaced ✅

These controllers serve specific purposes that are not part of DDD aggregates or were intentionally migrated.

### 5. ✅ KEEP: `CodeListController.java` (317 lines)
**Reason:** Phase 4 migration from site-service - Admin UI + microservice API  
**Path:** `/api/admin/codelists/**`  
**Purpose:** Manage reference data for admin UI  
**Status:** Recently migrated and documented in `FRONTEND_ENDPOINT_UPDATE_SUMMARY.md`

---

### 6. ✅ KEEP: `FormTemplateController.java` (171 lines)
**Reason:** Phase 4 migration from site-service  
**Path:** `/api/form-templates/**`  
**Purpose:** Template management (create, publish, archive, search)  
**Status:** Recently migrated

---

### 7. ✅ KEEP: `FormDefinitionController.java` (252 lines)
**Reason:** Core clinops functionality - study-specific form definitions  
**Path:** `/api/form-definitions/**`  
**Purpose:** CRUD + lock/unlock, approve, retire workflows  
**Status:** Core study forms functionality

---

### 8. ✅ KEEP: `StudyDocumentController.java` (320 lines)
**Reason:** Document storage is cross-cutting infrastructure concern  
**Path:** `/api/studies/{studyId}/documents`  
**Purpose:** Study document management (upload, download, metadata)  
**Note:** File storage typically handled separately from DDD aggregates  
**Alternative Location:** Already has DDD version in `document` package!

**UPDATE:** Check if there's a DDD version:
- Path: `com.clinprecision.clinopsservice.document.controller.StudyDocumentController.java`
- If exists: Move to Rule 1 (DELETE)
- If not: Keep as infrastructure controller

---

### 9. ✅ KEEP: `AutomatedStatusComputationController.java` (? lines)
**Reason:** Automation triggers - cross-cutting concern  
**Purpose:** Trigger automated status computations  
**Documentation:** `AUTOMATED_TRIGGERS_IMPLEMENTATION.md`  
**Status:** Valid utility controller for automation

---

### 10. ✅ KEEP: `StudyStatusController.java` (? lines)
**Reason:** May be automation utility or computation service  
**Documentation:** `STUDY_STATUS_COMPUTATION_SERVICE.md`  
**Action:** REVIEW - Check if it's for automated status computation  
**Status:** Need to verify purpose before deciding

---

### 11. ✅ KEEP: `StudyVersionStatusController.java` (? lines)
**Reason:** Pending review  
**Action:** REVIEW - Check if it's part of ProtocolVersion or separate utility  
**Status:** Need to verify purpose

---

## Rule 3: CREATE DDD VERSION FIRST, THEN DELETE 🔨

These controllers need DDD/CQRS replacements created before deletion.

### 12. 🔨 CREATE DDD: `StudyArmController.java` (193 lines)
**Current Path:** `/api/studies/{studyId}/arms`  
**Purpose:** Study arm management (treatment arms/groups in clinical trials)

**Endpoints:**
- `GET /studies/{studyId}/arms` - List all arms for study
- `GET /arms/{armId}` - Get specific arm
- `POST /studies/{studyId}/arms` - Create arm
- `PUT /arms/{armId}` - Update arm
- `DELETE /arms/{armId}` - Delete arm

**DDD Implementation Needed:**
```
StudyArmAggregate (Domain)
├── StudyArmCommandController (Write operations)
├── StudyArmQueryController (Read operations)
├── StudyArmEntity (Projection)
└── StudyArmRepository (Query repository)
```

**Package:** `com.clinprecision.clinopsservice.studyarm.controller`  
**Priority:** HIGH - Study arms are core to study design

---

### 13. 🔨 CREATE DDD: `VisitDefinitionController.java` (190 lines)
**Current Path:** `/api/studies/{studyId}/visits`  
**Purpose:** Visit schedule management

**Endpoints:**
- `GET /api/studies/{studyId}/visits` - List all visits
- `GET /api/studies/{studyId}/visits?armId={armId}` - Visits by arm
- `GET /api/studies/{studyId}/visits/type/{visitType}` - Visits by type
- `POST /api/studies/{studyId}/visits` - Create visit
- `PUT /api/visits/{visitId}` - Update visit
- `DELETE /api/visits/{visitId}` - Delete visit

**DDD Implementation Needed:**
```
VisitDefinitionAggregate (Domain)
├── VisitCommandController
├── VisitQueryController
├── VisitDefinitionEntity (Projection)
└── VisitDefinitionRepository (Query repository)
```

**Package:** `com.clinprecision.clinopsservice.visitdefinition.controller`  
**Priority:** HIGH - Visits are core to study schedule

---

### 14. 🔨 CREATE DDD: `VisitFormController.java` (281 lines)
**Current Path:** `/api/visits/{visitId}/forms`, `/api/forms/{formId}/visits`  
**Purpose:** Visit-Form association (which forms are used at which visits)

**Endpoints:**
- `GET /api/visits/{visitId}/forms` - Forms for visit
- `GET /api/visits/{visitId}/forms/required` - Required forms
- `GET /api/visits/{visitId}/forms/optional` - Optional forms
- `GET /api/forms/{formId}/visits` - Visits using form
- `POST /api/visits/{visitId}/forms` - Bind form to visit
- `DELETE /api/visits/{visitId}/forms/{formId}` - Unbind form

**DDD Implementation Needed:**
```
VisitFormAssociationAggregate (Domain)
├── VisitFormCommandController
├── VisitFormQueryController
├── VisitFormEntity (Projection)
└── VisitFormRepository (Query repository)
```

**Package:** `com.clinprecision.clinopsservice.visitform.controller`  
**Priority:** MEDIUM - Association management, depends on Visit and Form

---

## Action Summary

| Rule | Controllers | Action Required |
|------|-------------|-----------------|
| Rule 1 (DELETE) | 4 | Delete immediately - DDD exists |
| Rule 2 (KEEP) | 7 | Keep as-is or review |
| Rule 3 (CREATE+DELETE) | 3 | Create DDD first, then delete |

**Total to Delete Eventually:** 7 controllers  
**Total to Keep:** 7 controllers  
**Lines to Remove:** ~1,000+ lines

---

## Execution Plan

### Phase 1: Immediate Deletions (Rule 1) ⚡
**Time:** 10 minutes  
**Risk:** Low (DDD replacements exist)

1. ❌ DELETE `StudyController.java`
2. ❌ DELETE `StudyVersionController.java`
3. ❌ DELETE `StudyAmendmentController.java`
4. ❌ DELETE `ReferenceDataController.java`

**Commands:**
```powershell
cd backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\controller

# Delete legacy controllers
Remove-Item StudyController.java
Remove-Item StudyVersionController.java
Remove-Item StudyAmendmentController.java
Remove-Item ReferenceDataController.java

# Verify compilation
cd ..\..\..\..\..\..
mvn clean compile
```

---

### Phase 2: Create DDD Implementations (Rule 3) 🔨
**Time:** 2-4 hours  
**Risk:** Medium (new implementations)

#### 2A: StudyArm DDD Implementation
1. Create `studyarm` package structure
2. Implement StudyArmAggregate
3. Implement StudyArmCommandController
4. Implement StudyArmQueryController
5. Test endpoints
6. Delete `controller/StudyArmController.java`

#### 2B: VisitDefinition DDD Implementation
1. Create `visitdefinition` package structure
2. Implement VisitDefinitionAggregate
3. Implement VisitCommandController
4. Implement VisitQueryController
5. Test endpoints
6. Delete `controller/VisitDefinitionController.java`

#### 2C: VisitForm DDD Implementation
1. Create `visitform` package structure
2. Implement VisitFormAssociationAggregate
3. Implement VisitFormCommandController
4. Implement VisitFormQueryController
5. Test endpoints
6. Delete `controller/VisitFormController.java`

---

### Phase 3: Review Controllers (Rule 2) 🔍
**Time:** 30 minutes  
**Risk:** Low (just review)

1. Check `StudyDocumentController.java` - Is there a DDD version in `document` package?
2. Review `StudyStatusController.java` - Automation or legacy?
3. Review `StudyVersionStatusController.java` - Needed or redundant?
4. Review `AutomatedStatusComputationController.java` - Confirm it's utility

---

## Verification Steps

After each deletion:
1. ✅ Run compilation: `mvn clean compile`
2. ✅ Run tests: `mvn test`
3. ✅ Check for missing imports
4. ✅ Verify application starts: `mvn spring-boot:run`

---

## Frontend Impact

### Endpoints That Will Break (Need Frontend Updates):

**StudyController (Rule 1 - DELETE):**
- Frontend must use StudyCommandController / StudyQueryController
- Update: `axios.get('/api/studies')` → `axios.get('/api/studies')` (same path, different controller)

**StudyVersionController (Rule 1 - DELETE):**
- Frontend must use ProtocolVersionController
- Update: `/api/studies/{studyId}/versions` → `/api/clinops/protocol-versions/protocol/{protocolId}`

**ReferenceDataController (Rule 1 - DELETE):**
- Frontend must use StudyController lookup endpoints
- Update: `/api/v2/reference-data/study-phases` → `/api/studies/lookup/phases`

**StudyArmController (Rule 3 - CREATE DDD FIRST):**
- No immediate break (create DDD first)
- After DDD creation: `/api/studies/{studyId}/arms` → `/api/studyarms/study/{studyId}`

**VisitDefinitionController (Rule 3 - CREATE DDD FIRST):**
- No immediate break (create DDD first)
- After DDD creation: `/api/studies/{studyId}/visits` → `/api/visits/study/{studyId}`

**VisitFormController (Rule 3 - CREATE DDD FIRST):**
- No immediate break (create DDD first)
- After DDD creation: `/api/visits/{visitId}/forms` → `/api/visitforms/visit/{visitId}`

---

## Risk Assessment

| Controller | Risk Level | Reason |
|------------|-----------|--------|
| StudyController | LOW | DDD replacement exists, same path |
| StudyVersionController | MEDIUM | Frontend may use old paths |
| StudyAmendmentController | LOW | Likely unused |
| ReferenceDataController | LOW | StudyController has replacements |
| StudyArmController | HIGH | Core functionality, needs DDD first |
| VisitDefinitionController | HIGH | Core functionality, needs DDD first |
| VisitFormController | MEDIUM | Association management, needs DDD first |

---

## Decision Matrix

```
┌─────────────────────────────┬──────────────┬────────────────────────┐
│ Controller                  │ Has DDD?     │ Action                 │
├─────────────────────────────┼──────────────┼────────────────────────┤
│ StudyController             │ ✅ Yes       │ DELETE (Rule 1)        │
│ StudyVersionController      │ ✅ Yes       │ DELETE (Rule 1)        │
│ StudyAmendmentController    │ ✅ Yes       │ DELETE (Rule 1)        │
│ ReferenceDataController     │ ✅ Yes       │ DELETE (Rule 1)        │
├─────────────────────────────┼──────────────┼────────────────────────┤
│ CodeListController          │ N/A          │ KEEP (Rule 2)          │
│ FormTemplateController      │ N/A          │ KEEP (Rule 2)          │
│ FormDefinitionController    │ N/A          │ KEEP (Rule 2)          │
│ StudyDocumentController     │ ❓ Check     │ KEEP or DELETE?        │
│ AutomatedStatusController   │ N/A          │ KEEP (Rule 2)          │
│ StudyStatusController       │ ❓ Review    │ KEEP (Rule 2)          │
│ StudyVersionStatusCtrl      │ ❓ Review    │ KEEP or DELETE?        │
├─────────────────────────────┼──────────────┼────────────────────────┤
│ StudyArmController          │ ❌ No        │ CREATE DDD (Rule 3)    │
│ VisitDefinitionController   │ ❌ No        │ CREATE DDD (Rule 3)    │
│ VisitFormController         │ ❌ No        │ CREATE DDD (Rule 3)    │
└─────────────────────────────┴──────────────┴────────────────────────┘
```

---

## Next Steps

### Immediate Action (Now):
1. Execute Phase 1 deletions (Rule 1)
2. Run compilation and tests
3. Verify no errors

### Short Term (Next Session):
4. Create StudyArm DDD implementation (Rule 3)
5. Create VisitDefinition DDD implementation (Rule 3)
6. Create VisitForm DDD implementation (Rule 3)

### Medium Term:
7. Review and update frontend endpoints
8. Update API documentation
9. Create migration guide for frontend team

---

## Documentation Updates After Completion

1. **Create** `CONTROLLER_CLEANUP_COMPLETE.md`
2. **Update** `PHASE_4_COMPLETION_REPORT.md`
3. **Update** `QUICK_REFERENCE_SERVICE_SPLIT.md`
4. **Create** `FRONTEND_API_MIGRATION_GUIDE.md`

---

## Conclusion

**Ready to Execute Phase 1 (Rule 1 Deletions)?**
- 4 controllers to delete immediately
- DDD replacements exist
- Low risk
- ~10 minutes

**Would you like me to proceed with Phase 1 deletions?**
