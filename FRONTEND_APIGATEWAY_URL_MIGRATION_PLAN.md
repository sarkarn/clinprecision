# Frontend & API Gateway URL Migration Plan

**Date:** October 19, 2025  
**Module:** 1.1 Study Management (32 endpoints)  
**Status:** Backend refactoring complete ✅ | Frontend & Gateway updates needed 🎯

---

## Overview

This document outlines the required changes to the **Frontend** and **API Gateway** to support the new DDD-aligned REST API URLs that were implemented in the backend controllers.

### Migration Strategy
- **Backward Compatibility:** Both old and new URLs supported during migration period
- **Deprecation Timeline:** 6 months (Oct 19, 2025 → Apr 19, 2026)
- **Zero Breaking Changes:** All existing functionality continues to work
- **Gradual Transition:** Frontend will use new URLs; old URLs remain for legacy consumers

---

## 1. API Gateway Route Updates

**File:** `backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/GatewayRoutesConfig.java`

### Current State
```java
// Clinical Operations Service - Direct routes
.route("clinops-direct", r -> r
    .path("/studies/**", "/arms/**", "/api/studies/**", "/api/arms/**", "/api/visits/**", "/api/study-versions/**")
    .and()
    .method("GET","POST","PUT","DELETE","PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://clinops-ws")
)
```

### Required Changes

#### Add New Route for Study Design Module
```java
// Study Design Module - New DDD-aligned routes (highest priority)
.route("clinops-study-design", r -> r
    .path("/api/v1/study-design/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
            .filter(authFilter)
    )
    .uri("lb://clinops-ws")
)

// Keep existing route for backward compatibility (lower priority)
.route("clinops-direct", r -> r
    .path("/studies/**", "/arms/**", "/api/studies/**", "/api/arms/**", "/api/visits/**", "/api/study-versions/**")
    .and()
    .method("GET","POST","PUT","DELETE","PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
    )
    .uri("lb://clinops-ws")
)
```

**Key Changes:**
1. ✅ Add new route for `/api/v1/study-design/**` pattern (HIGHEST PRIORITY)
2. ✅ Expose new deprecation headers in response
3. ✅ Keep old routes for backward compatibility
4. ✅ Order matters - more specific routes should be declared first

---

## 2. Frontend Service Updates

### 2.1 StudyService.js

**File:** `frontend/clinprecision/src/services/StudyService.js`

#### Current API Paths
```javascript
const API_PATH = '/clinops-ws/api/studies';
const LOOKUP_API_PATH = '/clinops-ws/api/studies/lookup';
```

#### New API Paths (Updated)
```javascript
// New DDD-aligned API paths
const API_BASE = '/clinops-ws/api/v1/study-design';
const API_PATH = `${API_BASE}/studies`;
const METADATA_API_PATH = `${API_BASE}/metadata`;
const ANALYTICS_API_PATH = `${API_BASE}/analytics`;

// Legacy paths (for fallback if needed)
const LEGACY_API_PATH = '/clinops-ws/api/studies';
const LEGACY_LOOKUP_PATH = '/clinops-ws/api/studies/lookup';
```

#### Method Updates Required

| Method | Old URL | New URL | Status |
|--------|---------|---------|--------|
| `getStudies()` | `/clinops-ws/api/studies` | `/clinops-ws/api/v1/study-design/studies` | 🔄 UPDATE |
| `registerStudy()` | `/clinops-ws/api/studies` | `/clinops-ws/api/v1/study-design/studies` | 🔄 UPDATE |
| `getStudyById()` | `/clinops-ws/api/studies/{id}` | `/clinops-ws/api/v1/study-design/studies/{id}` | 🔄 UPDATE |
| `getStudyOverview()` | `/clinops-ws/api/studies/{id}/overview` | `/clinops-ws/api/v1/study-design/studies/{id}/summary` | 🔄 UPDATE |
| `updateStudy()` | `/clinops-ws/api/studies/{id}` | `/clinops-ws/api/v1/study-design/studies/{id}` | 🔄 UPDATE |
| `deleteStudy()` | `/clinops-ws/api/studies/{id}` | `/clinops-ws/api/v1/study-design/studies/{id}` | 🔄 UPDATE |
| `getStudyStatuses()` | `/clinops-ws/api/studies/lookup/statuses` | `/clinops-ws/api/v1/study-design/metadata/study-statuses` | 🔄 UPDATE |
| `getRegulatoryStatuses()` | `/clinops-ws/api/studies/lookup/regulatory-statuses` | `/clinops-ws/api/v1/study-design/metadata/regulatory-statuses` | 🔄 UPDATE |
| `getStudyPhases()` | `/clinops-ws/api/studies/lookup/phases` | `/clinops-ws/api/v1/study-design/metadata/study-phases` | 🔄 UPDATE |
| `getDashboardMetrics()` | `/clinops-ws/api/studies/dashboard/metrics` | `/clinops-ws/api/v1/study-design/analytics/dashboard-metrics` | 🔄 UPDATE |

---

### 2.2 StudyDesignService.js

**File:** `frontend/clinprecision/src/services/StudyDesignService.js`

#### Method Updates Required

| Method | Old URL | New URL | Change Type |
|--------|---------|---------|-------------|
| `getStudyDetails()` | `/api/studies/{id}` | `/api/v1/study-design/studies/{id}` | Path update |
| `getStudyArms()` | `/api/studies/{id}/arms` | `/api/v1/study-design/studies/{id}/arms` | Path update |
| `createStudyArm()` | `/api/studies/{id}/arms` | `/api/v1/study-design/studies/{id}/arms` | Path update |
| `bulkUpdateArms()` | `/api/studies/{id}/arms` | `/api/v1/study-design/studies/{id}/arms` | Path update |
| `getStudyVisits()` | `/api/studies/{id}/visits` | `/api/v1/study-design/studies/{id}/visits` | Path update |
| `updateVisits()` | `/api/studies/{id}/visits` | `/api/v1/study-design/studies/{id}/visits` | Path update |
| `getFormBindings()` | `/api/studies/{id}/form-bindings` | `/api/v1/study-design/studies/{id}/form-bindings` | Path update |
| `updateFormBindings()` | `/api/studies/{id}/form-bindings` | `/api/v1/study-design/studies/{id}/form-bindings` | Path update |
| `validateStudy()` | `/api/studies/{id}/validate` | `/api/v1/study-design/studies/{id}/validation` | Path update |
| `publishStudy()` | `/api/studies/{id}/publish` | `/api/v1/study-design/studies/{id}/publish` | Path update |
| `changeStudyStatus()` | `/api/studies/{id}/status` | `/api/v1/study-design/studies/{id}/status` | Path update |
| `getRevisions()` | `/api/studies/{id}/revisions` | `/api/v1/study-design/studies/{id}/revisions` | Path update |
| `createRevision()` | `/api/studies/{id}/revisions` | `/api/v1/study-design/studies/{id}/revisions` | Path update |
| `getDesignProgress()` | `/api/studies/{id}/design-progress` | `/api/v1/study-design/studies/{id}/design-progress` | Path update |

---

### 2.3 StudyDocumentService.js

**File:** `frontend/clinprecision/src/services/StudyDocumentService.js`

#### Method Updates Required

| Method | Old URL | New URL |
|--------|---------|---------|
| `getStudyDocuments()` | `/api/studies/{id}/documents` | `/api/v1/study-design/studies/{id}/documents` |
| `getCurrentDocument()` | `/api/studies/{id}/documents/current` | `/api/v1/study-design/studies/{id}/documents/current` |
| `getDocumentById()` | `/api/studies/{id}/documents/{docId}` | `/api/v1/study-design/studies/{id}/documents/{docId}` |
| `uploadDocument()` | `/api/studies/{id}/documents` | `/api/v1/study-design/studies/{id}/documents` |
| `downloadDocument()` | `/api/studies/{id}/documents/{docId}/download` | `/api/v1/study-design/studies/{id}/documents/{docId}/download` |
| `deleteDocument()` | `/api/studies/{id}/documents/{docId}` | `/api/v1/study-design/studies/{id}/documents/{docId}` |
| `updateDocument()` | `/api/studies/{id}/documents/{docId}` | `/api/v1/study-design/studies/{id}/documents/{docId}` |
| `getDocumentStatistics()` | `/api/studies/{id}/documents/statistics` | `/api/v1/study-design/studies/{id}/documents/statistics` |

---

### 2.4 StudyVersioningService.js

**File:** `frontend/clinprecision/src/services/StudyVersioningService.js`

#### Method Updates Required

| Method | Old URL | New URL |
|--------|---------|---------|
| `getStudyVersions()` | `/api/studies/{id}/versions` | `/api/v1/study-design/studies/{id}/versions` |
| `getVersionHistory()` | `/api/studies/{id}/versions/history` | `/api/v1/study-design/studies/{id}/versions/history` |
| `createVersion()` | `/api/studies/{id}/versions` | `/api/v1/study-design/studies/{id}/versions` |

---

### 2.5 VisitDefinitionService.js & VisitFormService.js

**Files:** 
- `frontend/clinprecision/src/services/VisitDefinitionService.js`
- `frontend/clinprecision/src/services/VisitFormService.js`

#### Method Updates Required

| Method | Old URL | New URL |
|--------|---------|---------|
| `getVisitForms()` | `/api/studies/{id}/visit-forms` | `/api/v1/study-design/studies/{id}/visit-forms` |
| `getFormBindings()` | `/api/studies/{id}/form-bindings` | `/api/v1/study-design/studies/{id}/form-bindings` |
| `getConditionalForms()` | `/api/studies/{id}/visit-forms/conditional` | `/api/v1/study-design/studies/{id}/visit-forms/conditional` |
| `bindFormToVisit()` | `/api/studies/{id}/visits/{visitId}/forms/{formId}` | `/api/v1/study-design/studies/{id}/visits/{visitId}/forms/{formId}` |
| `unbindFormFromVisit()` | `/api/studies/{id}/visits/{visitId}/forms/{formId}` | `/api/v1/study-design/studies/{id}/visits/{visitId}/forms/{formId}` |
| `getVisitsByArm()` | `/api/studies/{id}/visits?armId={armId}` | `/api/v1/study-design/studies/{id}/visits?armId={armId}` |
| `updateVisit()` | `/api/studies/{id}/visits/{visitId}` | `/api/v1/study-design/studies/{id}/visits/{visitId}` |
| `updateVisitOrder()` | `/api/studies/{id}/visits/order` | `/api/v1/study-design/studies/{id}/visits/order` |

---

## 3. Implementation Plan

### Phase 1: API Gateway Update (10 minutes)
1. ✅ Add new route for `/api/v1/study-design/**` 
2. ✅ Expose deprecation headers
3. ✅ Test route priority
4. ✅ Verify backward compatibility

### Phase 2: Frontend Services Update (30 minutes)
1. ✅ Update `StudyService.js` - Base API paths and all methods
2. ✅ Update `StudyDesignService.js` - Study design operations
3. ✅ Update `StudyDocumentService.js` - Document management
4. ✅ Update `StudyVersioningService.js` - Version control
5. ✅ Update `VisitDefinitionService.js` - Visit management
6. ✅ Update `VisitFormService.js` - Form bindings

### Phase 3: Testing (20 minutes)
1. ✅ Test all GET endpoints (read operations)
2. ✅ Test all POST/PUT/PATCH endpoints (write operations)
3. ✅ Verify deprecation headers appear for old URLs
4. ✅ Verify new URLs work correctly
5. ✅ Test error handling and fallbacks

### Phase 4: Documentation (10 minutes)
1. ✅ Update API documentation
2. ✅ Create frontend migration guide
3. ✅ Document breaking changes (if any)

---

## 4. Verification Checklist

### Backend ✅ COMPLETE
- [x] StudyCommandController refactored (12 endpoints)
- [x] StudyQueryController refactored (11 endpoints)
- [x] AutomatedStatusComputationController refactored (9 endpoints)
- [x] All controllers compile successfully
- [x] Deprecation headers implemented
- [x] Constants defined in StudyApiConstants.java

### API Gateway 🎯 IN PROGRESS
- [ ] New route added for `/api/v1/study-design/**`
- [ ] Deprecation headers exposed in CORS
- [ ] Route priority verified
- [ ] Backward compatibility tested

### Frontend 🎯 IN PROGRESS
- [ ] StudyService.js updated
- [ ] StudyDesignService.js updated
- [ ] StudyDocumentService.js updated
- [ ] StudyVersioningService.js updated
- [ ] VisitDefinitionService.js updated
- [ ] VisitFormService.js updated

### Testing ⏳ PENDING
- [ ] GET endpoints tested
- [ ] POST/PUT/PATCH endpoints tested
- [ ] Deprecation headers verified
- [ ] Error handling tested
- [ ] Browser console errors checked

---

## 5. Risk Assessment

### Low Risk ✅
- Backend changes (already tested and compiled)
- API Gateway routing (additive change)

### Medium Risk ⚠️
- Frontend service URL updates (many files to update)
- Testing coverage (manual testing required)

### Mitigation
- Keep old URLs working (backward compatibility)
- Deploy during low-traffic period
- Monitor deprecation header usage
- Gradual rollout to production

---

## 6. Rollback Plan

If issues occur:
1. **API Gateway:** Remove new route, keep old routes
2. **Frontend:** Revert to old API paths (git revert)
3. **Backend:** Old URLs continue working (no changes needed)

---

## 7. Success Metrics

- ✅ Zero breaking changes
- ✅ All 32 endpoints accessible via new URLs
- ✅ Deprecation headers visible in network tab
- ✅ Frontend UI functions normally
- ✅ No increase in error rates

---

## 8. Next Steps

1. **Immediate:** Update API Gateway routes
2. **Next:** Update frontend services (6 files)
3. **Then:** Manual testing of key flows
4. **Finally:** Monitor production for 1 week

---

**Last Updated:** October 19, 2025  
**Status:** Ready for implementation  
**Estimated Time:** 70 minutes total
