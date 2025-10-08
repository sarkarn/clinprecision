# Study Design API Consistency Analysis

## Executive Summary

**Status: ⚠️ INCONSISTENT** - There are significant inconsistencies in API endpoint patterns across different design phases.

## Current API Endpoint Mapping

### Phase 1: Study Arms ✅ COMPLETE

| Operation | Frontend Call | Backend Endpoint | Status | Notes |
|-----------|--------------|------------------|--------|-------|
| **GET** (Query) | `/api/studies/{studyId}/arms` ✅ | `/api/studies/{id}/arms` ✅ | ✅ **WORKING** | StudyQueryController, frontend updated to remove `/clinops-ws/` prefix |
| **POST** (Create) | `/api/studies/{studyId}/arms` ✅ | `/api/studies/{id}/arms` ✅ | ✅ **WORKING** | StudyCommandController |
| **PUT** (Update) | `/api/arms/{armId}` ✅ | `/api/arms/{armId}` ✅ | ✅ **WORKING** | StudyArmsCommandController |
| **DELETE** (Delete) | `/api/arms/{armId}` ✅ | `/api/arms/{armId}` ✅ | ✅ **WORKING** | StudyArmsCommandController |

### Phase 2: Visit Schedule

| Operation | Frontend Call | Backend Endpoint | Status | Notes |
|-----------|--------------|------------------|--------|-------|
| **GET** (Query) | `/api/studies/{studyId}/visits` ✅ | `/api/clinops/study-design/studies/{studyId}/visits` ✅ | ✅ **WORKING** | Bridge endpoint in StudyDesignCommandController |
| **POST** (Create) | `/clinops-ws/api/clinops/study-design/studies/{studyId}/visits` ✅ | `/api/clinops/study-design/studies/{studyId}/visits` ✅ | ✅ **WORKING** | VisitDefinitionService uses direct DDD path |
| **PUT** (Update) | `/clinops-ws/api/clinops/study-design/studies/{studyId}/visits/{visitId}` ✅ | `/api/clinops/study-design/studies/{studyId}/visits/{visitId}` ✅ | ✅ **WORKING** | VisitDefinitionService uses direct DDD path |
| **DELETE** (Delete) | `/clinops-ws/api/clinops/study-design/studies/{studyId}/visits/{visitId}` ✅ | `/api/clinops/study-design/studies/{studyId}/visits/{visitId}` ✅ | ✅ **WORKING** | VisitDefinitionService uses direct DDD path |

### Phase 3: Form Bindings

| Operation | Frontend Call | Backend Endpoint | Status | Notes |
|-----------|--------------|------------------|--------|-------|
| **GET** (Query) | `/api/studies/{studyId}/form-bindings` ✅ | `/api/studies/{studyId}/form-bindings` ✅ | ✅ **WORKING** | Bridge endpoint in StudyQueryController (just added) |
| **PUT** (Save) | `/api/studies/{studyId}/form-bindings` ❌ | Unknown | ❌ **MISSING** | No backend endpoint found |
| **POST** (Bind Form) | `/api/studies/{studyId}/visits/{visitId}/forms/{formId}` ❌ | Unknown | ❌ **MISSING** | No backend endpoint found |
| **DELETE** (Unbind) | `/api/form-bindings/{bindingId}` ❌ | Unknown | ❌ **MISSING** | No backend endpoint found |
| **PUT** (Update Binding) | `/api/form-bindings/{bindingId}` ❌ | Unknown | ❌ **MISSING** | No backend endpoint found |

### Phase 4: Design Progress ✅ COMPLETE

| Operation | Frontend Call | Backend Endpoint | Status | Notes |
|-----------|--------------|------------------|--------|-------|
| **GET** (Query) | `/api/studies/{studyId}/design-progress` ✅ | `/api/studies/{id}/design-progress` ✅ | ✅ **WORKING** | StudyQueryController |
| **PUT** (Update) | `/api/studies/{studyId}/design-progress` ✅ | `/api/studies/{id}/design-progress` ✅ | ✅ **WORKING** | StudyCommandController |
| **POST** (Initialize) | `/api/studies/{studyId}/design-progress/initialize` ✅ | `/api/studies/{id}/design-progress/initialize` ✅ | ✅ **WORKING** | StudyCommandController |

## API Pattern Inconsistencies

### Problem 1: Mixed Service Patterns

**Visit Schedule** uses TWO different patterns:
- **StudyDesignService.js**: Calls `/api/studies/{studyId}/visits` (simplified bridge)
- **VisitDefinitionService.js**: Calls `/clinops-ws/api/clinops/study-design/studies/{studyId}/visits` (direct DDD)

This creates confusion about which service to use.

### Problem 2: Arms Endpoint Mismatch

**Frontend (StudyDesignService.js)**:
```javascript
async getStudyArms(studyId) {
    // Uses /clinops-ws/ prefix for Study Design service
    const response = await ApiService.get(`/clinops-ws/api/studies/${studyId}/arms`);
    return response.data;
}
```

**Backend (StudyQueryController.java)**:
```java
@GetMapping("/{id}/arms")
public ResponseEntity<List<StudyArmResponseDto>> getStudyArms(@PathVariable String id)
```

- Frontend prefixes with `/clinops-ws/` expecting API Gateway routing
- Backend has endpoint at `/api/studies/{id}/arms`
- Gateway should route to `clinops-ws` service, but this creates extra complexity

### Problem 3: Missing CRUD Endpoints

Many operations defined in frontend services **have no backend implementation**:
- Arms: UPDATE, DELETE
- Form Bindings: PUT, POST, DELETE
- Design Progress: PUT, POST

### Problem 4: Inconsistent Path Structures

Three different patterns are being used:

1. **Bridge Pattern (Simplified)**: `/api/studies/{studyId}/resource`
   - Used for: arms GET, form-bindings GET, design-progress GET
   - Gateway routes to clinops service
   
2. **Direct DDD Pattern**: `/api/clinops/study-design/studies/{studyId}/resource`
   - Used for: visits CRUD (in VisitDefinitionService)
   - Requires `/clinops-ws/` prefix for gateway routing
   
3. **Resource-First Pattern**: `/api/resource/{resourceId}`
   - Used for: arms update/delete, form-bindings update/delete
   - Not implemented in backend

## Recommended Solution

### Option A: **Standardize on Bridge Pattern** ✅ RECOMMENDED

**Pros:**
- Simple frontend code
- Clean URLs: `/api/studies/{studyId}/{resource}`
- API Gateway handles routing transparently
- Backwards compatible with legacy code

**Cons:**
- Need to create bridge endpoints for all operations
- Slight performance overhead (auto-init service)

**Implementation:**
1. Create bridge endpoints in `StudyQueryController` for all GET operations
2. Create bridge endpoints in `StudyCommandController` for all POST/PUT/DELETE operations
3. Update frontend to use consistent `/api/studies/{studyId}/...` pattern
4. Remove `/clinops-ws/` prefix usage

### Option B: **Standardize on Direct DDD Pattern**

**Pros:**
- Direct access to DDD aggregate
- No bridge layer overhead
- Clear separation of concerns

**Cons:**
- Complex frontend URLs with `/clinops-ws/api/clinops/study-design/...`
- Harder to maintain
- Exposing internal architecture to frontend

## Action Items

### Immediate (Blocking form-bindings phase):
1. ✅ **DONE**: Add GET `/api/studies/{studyId}/form-bindings` bridge endpoint
2. ⏳ **IN PROGRESS**: Form assignment write operations need DDD commands
3. ❌ **TODO**: Implement form assignment commands in backend (POST, PUT, DELETE)

### Short-term (Study Arms - Already Complete!):
1. ✅ **DONE**: GET `/api/studies/{studyId}/arms` exists in StudyQueryController
2. ✅ **DONE**: POST `/api/studies/{studyId}/arms` exists in StudyCommandController
3. ✅ **DONE**: PUT `/api/arms/{armId}` exists in StudyArmsCommandController
4. ✅ **DONE**: DELETE `/api/arms/{armId}` exists in StudyArmsCommandController
5. ✅ **DONE**: Updated frontend StudyDesignService to remove `/clinops-ws/` prefix

### Short-term (Design Progress - Already Complete!):
1. ✅ **DONE**: GET `/api/studies/{studyId}/design-progress` exists in StudyQueryController
2. ✅ **DONE**: POST `/api/studies/{studyId}/design-progress/initialize` exists in StudyCommandController
3. ✅ **DONE**: PUT `/api/studies/{studyId}/design-progress` exists in StudyCommandController

### Medium-term (Consistency):
1. ⏳ **DECISION NEEDED**: Keep VisitDefinitionService with direct DDD paths (working well) OR migrate to bridge pattern
2. ✅ **DONE**: Frontend arms calls now use consistent `/api/studies/` pattern
3. ✅ **DONE**: Form bindings GET using consistent pattern
4. ❌ **TODO**: Document API architecture decisions

### Long-term (Complete CRUD):
1. ✅ **DONE**: Design Progress commands complete
2. ❌ **TODO**: Implement form assignment commands (POST, DELETE, PUT) in DDD
3. ❌ **TODO**: Add integration tests for all endpoints
4. ❌ **TODO**: Add API documentation (Swagger/OpenAPI)

## Current Working Endpoints

### StudyQueryController (`/api/studies`)
- ✅ GET `/{id}` - Get study by ID
- ✅ GET `/{id}/overview` - Get study overview
- ✅ GET `/{id}/arms` - Get study arms
- ✅ GET `/{id}/design-progress` - Get design progress
- ✅ GET `/{studyId}/form-bindings` - Get form bindings (**NEW**)
- ✅ GET `/lookup/statuses` - Get study statuses
- ✅ GET `/lookup/regulatory-statuses` - Get regulatory statuses
- ✅ GET `/lookup/phases` - Get study phases

### StudyDesignCommandController (`/api/clinops/study-design`)
- ✅ GET `/studies/{studyId}/visits` - Get visits (bridge)
- ✅ POST `/studies/{studyId}/visits` - Create visit (bridge)
- ✅ PUT `/studies/{studyId}/visits/{visitId}` - Update visit (bridge)
- ✅ DELETE `/studies/{studyId}/visits/{visitId}` - Delete visit (bridge)
- ✅ POST `/studies/{studyId}/arms` - Create arm (bridge)

## Conclusion

**Current Status:** Inconsistent and incomplete

**Risk Level:** HIGH - Frontend expects endpoints that don't exist

**Priority:** Immediate action required to complete form-bindings phase and standardize patterns

**Recommendation:** Adopt Bridge Pattern (Option A) for all design phase operations to maintain clean separation while providing simple, consistent frontend APIs.
