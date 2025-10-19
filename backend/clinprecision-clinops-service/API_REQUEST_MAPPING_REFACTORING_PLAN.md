# ClinOps Service - REST API Request Mapping Refactoring Plan
## Comprehensive API URL Restructuring for Future Implementation

**Document Version**: 1.0  
**Created**: October 19, 2025  
**Status**: PLANNING - For Future Refactoring  
**Priority**: MEDIUM - Post Bounded Context Validation

---

## 📋 Executive Summary

This document proposes a comprehensive refactoring of all REST API endpoints in the `clinprecision-clinops-service` to follow:
- **RESTful best practices**
- **Bounded context alignment** (DDD principles)
- **Consistent URL patterns**
- **API versioning strategy**
- **Resource-oriented design**

### Current State Analysis
- ✅ **20+ Controllers** identified across bounded contexts
- ⚠️ **Inconsistent URL patterns** (some use `/api/v1/`, others use `/api/`, mixed conventions)
- ⚠️ **Mixed resource naming** (kebab-case, camelCase, inconsistent pluralization)
- ⚠️ **Command/Query separation** partially implemented but URLs don't reflect bounded contexts
- ⚠️ **Nested resources** not consistently structured

---

## 🎯 Refactoring Goals

1. **Bounded Context Alignment**: URLs should reflect the two main bounded contexts
   - `/api/v1/study-design/*` - Study Design bounded context
   - `/api/v1/study-operations/*` - Study Operation bounded context

2. **RESTful Consistency**: Follow standard REST conventions
   - Resource-oriented URLs (nouns, not verbs)
   - Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Consistent pluralization

3. **Versioning**: Uniform API versioning
   - All endpoints: `/api/v1/`
   - Future versions: `/api/v2/` without breaking v1

4. **Discoverability**: Logical resource hierarchy
   - Parent → Child relationships clear in URLs
   - HATEOAS-friendly structure

5. **Backward Compatibility**: Migration strategy to avoid breaking existing clients

---

## 📊 Current vs. Proposed URL Structure

### 🏢 **BOUNDED CONTEXT 1: STUDY DESIGN**

#### Module 1.1: Study Management (studydesign.studymgmt)

**Current URLs**: `/api/studies/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/studies` | POST | `/api/v1/study-design/studies` | ⚠️ CHANGE | Align with bounded context |
| `/api/studies` | GET | `/api/v1/study-design/studies` | ⚠️ CHANGE | Add pagination params |
| `/api/studies/{uuid}` | GET | `/api/v1/study-design/studies/{uuid}` | ⚠️ CHANGE | Maintain UUID identifier |
| `/api/studies/{uuid}` | PUT | `/api/v1/study-design/studies/{uuid}` | ⚠️ CHANGE | Full update |
| `/api/studies/{studyId}/publish` | PATCH | `/api/v1/study-design/studies/{studyId}/publish` | ⚠️ CHANGE | Lifecycle action |
| `/api/studies/{studyId}/status` | PATCH | `/api/v1/study-design/studies/{studyId}/status` | ⚠️ CHANGE | Status transition |
| `/api/studies/{uuid}/suspend` | POST | `/api/v1/study-design/studies/{uuid}/lifecycle/suspend` | 🔄 IMPROVE | Clearer hierarchy |
| `/api/studies/{uuid}/resume` | POST | `/api/v1/study-design/studies/{uuid}/lifecycle/resume` | 🔄 IMPROVE | Group lifecycle ops |
| `/api/studies/{uuid}/complete` | POST | `/api/v1/study-design/studies/{uuid}/lifecycle/complete` | 🔄 IMPROVE | Consistent pattern |
| `/api/studies/{uuid}/terminate` | POST | `/api/v1/study-design/studies/{uuid}/lifecycle/terminate` | 🔄 IMPROVE | Same pattern |
| `/api/studies/{uuid}/withdraw` | POST | `/api/v1/study-design/studies/{uuid}/lifecycle/withdraw` | 🔄 IMPROVE | Same pattern |
| `/api/studies/{uuid}/details` | POST | `/api/v1/study-design/studies/{uuid}/details` | ⚠️ CHANGE | Should be PATCH |
| `/api/studies/{id}/overview` | GET | `/api/v1/study-design/studies/{id}/summary` | 🔄 IMPROVE | More RESTful name |
| `/api/studies/{id}/arms` | GET | `/api/v1/study-design/studies/{id}/arms` | ⚠️ CHANGE | Move to design module |
| `/api/studies/{id}/arms` | POST | `/api/v1/study-design/studies/{id}/design/arms` | 🔄 IMPROVE | Better hierarchy |
| `/api/studies/search` | GET | `/api/v1/study-design/studies?q={query}` | 🔄 IMPROVE | Use query params |
| `/api/studies/lookup/statuses` | GET | `/api/v1/study-design/metadata/study-statuses` | 🔄 IMPROVE | Separate metadata |
| `/api/studies/lookup/regulatory-statuses` | GET | `/api/v1/study-design/metadata/regulatory-statuses` | 🔄 IMPROVE | Consistent pattern |
| `/api/studies/lookup/phases` | GET | `/api/v1/study-design/metadata/study-phases` | 🔄 IMPROVE | Clear resource |
| `/api/studies/dashboard/metrics` | GET | `/api/v1/study-design/analytics/dashboard-metrics` | 🔄 IMPROVE | Separate analytics |
| `/api/studies/{id}/design-progress` | GET | `/api/v1/study-design/studies/{id}/design-progress` | ⚠️ CHANGE | Keep as-is |
| `/api/studies/{id}/design-progress/initialize` | POST | `/api/v1/study-design/studies/{id}/design-progress` | 🔄 IMPROVE | Use POST for create |
| `/api/studies/{id}/design-progress` | PUT | `/api/v1/study-design/studies/{id}/design-progress` | ⚠️ CHANGE | Full update |
| `/api/studies/{uuid}/status/transitions` | GET | `/api/v1/study-design/studies/{uuid}/lifecycle/transitions` | 🔄 IMPROVE | Better hierarchy |
| `/api/studies/{uuid}/modification-allowed` | GET | `/api/v1/study-design/studies/{uuid}/permissions/can-modify` | 🔄 IMPROVE | Clearer intent |

**Automated Status Computation Sub-Module**

Current URLs: `/api/v1/studies/status/automated/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/studies/status/automated/{studyId}/compute` | POST | `/api/v1/study-design/studies/{studyId}/status/compute` | 🔄 IMPROVE | Simpler hierarchy |
| `/api/v1/studies/status/automated/batch-compute` | POST | `/api/v1/study-design/studies/status/batch-compute` | 🔄 IMPROVE | Batch operation |
| `/api/v1/studies/status/automated/{studyId}/history` | GET | `/api/v1/study-design/studies/{studyId}/status/history` | 🔄 IMPROVE | Remove "automated" |
| `/api/v1/studies/status/automated/recent-changes` | GET | `/api/v1/study-design/analytics/status-changes` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/studies/status/automated/frequent-changes` | GET | `/api/v1/study-design/analytics/frequent-status-changes` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/studies/status/automated/errors` | GET | `/api/v1/study-design/analytics/status-errors` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/studies/status/automated/system-health` | GET | `/api/v1/study-design/health/status-computation` | 🔄 IMPROVE | Health check endpoint |
| `/api/v1/studies/status/automated/{studyId}/refresh` | POST | `/api/v1/study-design/studies/{studyId}/status/refresh` | 🔄 IMPROVE | Action on resource |
| `/api/v1/studies/status/automated/statistics` | GET | `/api/v1/study-design/analytics/status-statistics` | 🔄 IMPROVE | Analytics endpoint |

---

#### Module 1.2: Protocol Management (studydesign.protocolmgmt)

**Current URLs**: `/api/protocol-versions/*`, `/api/study-versions/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/protocol-versions` | POST | `/api/v1/study-design/protocol-versions` | ⚠️ CHANGE | Add v1 prefix |
| `/api/protocol-versions/{id}` | GET | `/api/v1/study-design/protocol-versions/{id}` | ⚠️ CHANGE | Standard CRUD |
| `/api/protocol-versions/{id}` | PUT | `/api/v1/study-design/protocol-versions/{id}` | ⚠️ CHANGE | Full update |
| `/api/protocol-versions/{id}` | DELETE | `/api/v1/study-design/protocol-versions/{id}` | ⚠️ CHANGE | Delete |
| `/api/protocol-versions/{id}/status` | PUT | `/api/v1/study-design/protocol-versions/{id}/status` | ⚠️ CHANGE | Status update |
| `/api/protocol-versions/{id}/approve` | PUT | `/api/v1/study-design/protocol-versions/{id}/lifecycle/approve` | 🔄 IMPROVE | Lifecycle action |
| `/api/protocol-versions/{id}/activate` | PUT | `/api/v1/study-design/protocol-versions/{id}/lifecycle/activate` | 🔄 IMPROVE | Lifecycle action |
| `/api/protocol-versions/async` | POST | `/api/v1/study-design/protocol-versions/async` | ⚠️ CHANGE | Async creation |
| `/api/protocol-versions/study/{studyUuid}` | GET | `/api/v1/study-design/studies/{studyUuid}/protocol-versions` | 🔄 IMPROVE | Nested resource |
| `/api/protocol-versions/study/{studyUuid}/active` | GET | `/api/v1/study-design/studies/{studyUuid}/protocol-versions/active` | 🔄 IMPROVE | Filter on parent |
| `/api/protocol-versions/study/{studyUuid}/status/{status}` | GET | `/api/v1/study-design/studies/{studyUuid}/protocol-versions?status={status}` | 🔄 IMPROVE | Query param |
| `/api/protocol-versions/status/{status}` | GET | `/api/v1/study-design/protocol-versions?status={status}` | 🔄 IMPROVE | Query param |
| `/api/protocol-versions/awaiting-approval` | GET | `/api/v1/study-design/protocol-versions?status=awaiting_approval` | 🔄 IMPROVE | Query param |
| `/api/protocol-versions/db/{id}` | GET | `/api/v1/study-design/protocol-versions/by-database-id/{id}` | 🔄 IMPROVE | Explicit naming |
| `/api/protocol-versions/study/{studyUuid}/version/{versionNumber}/exists` | GET | `/api/v1/study-design/studies/{studyUuid}/protocol-versions/{versionNumber}/exists` | 🔄 IMPROVE | Better hierarchy |
| `/api/protocol-versions/study/{studyUuid}/status/{status}/count` | GET | `/api/v1/study-design/studies/{studyUuid}/protocol-versions/count?status={status}` | 🔄 IMPROVE | Count with filter |
| `/api/protocol-versions/all` | GET | `/api/v1/study-design/protocol-versions?includeAll=true` | 🔄 IMPROVE | Query param |
| `/api/study-versions/{versionId}/status` | PUT | `/api/v1/study-design/protocol-versions/{versionId}/status` | ⚠️ CHANGE | Consolidate URL |

---

#### Module 1.3: Study Design (studydesign.design)

**Current URLs**: `/api/clinops/study-design/*`, `/api/arms/*`, `/api/form-bindings/*`

**Study Design Core**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/clinops/study-design` | POST | `/api/v1/study-design/designs` | 🔄 IMPROVE | Create design |
| `/api/clinops/study-design/{studyDesignId}` | GET | `/api/v1/study-design/designs/{studyDesignId}` | 🔄 IMPROVE | Get design |
| `/api/clinops/study-design/{studyDesignId}/arms` | POST | `/api/v1/study-design/designs/{studyDesignId}/arms` | 🔄 IMPROVE | Nested resource |
| `/api/clinops/study-design/{studyDesignId}/arms` | GET | `/api/v1/study-design/designs/{studyDesignId}/arms` | 🔄 IMPROVE | List arms |
| `/api/clinops/study-design/{studyDesignId}/arms/{armId}` | GET | `/api/v1/study-design/designs/{studyDesignId}/arms/{armId}` | 🔄 IMPROVE | Get arm |
| `/api/clinops/study-design/{studyDesignId}/arms/{armId}` | PUT | `/api/v1/study-design/designs/{studyDesignId}/arms/{armId}` | 🔄 IMPROVE | Update arm |
| `/api/clinops/study-design/{studyDesignId}/arms/{armId}` | DELETE | `/api/v1/study-design/designs/{studyDesignId}/arms/{armId}` | 🔄 IMPROVE | Delete arm |
| `/api/clinops/study-design/{studyDesignId}/visits` | POST | `/api/v1/study-design/designs/{studyDesignId}/visits` | 🔄 IMPROVE | Create visit |
| `/api/clinops/study-design/{studyDesignId}/visits` | GET | `/api/v1/study-design/designs/{studyDesignId}/visits` | 🔄 IMPROVE | List visits |
| `/api/clinops/study-design/{studyDesignId}/visits/general` | GET | `/api/v1/study-design/designs/{studyDesignId}/visits?scope=general` | 🔄 IMPROVE | Filter param |
| `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` | GET | `/api/v1/study-design/designs/{studyDesignId}/visits/{visitId}` | 🔄 IMPROVE | Get visit |
| `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` | PUT | `/api/v1/study-design/designs/{studyDesignId}/visits/{visitId}` | 🔄 IMPROVE | Update visit |
| `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` | DELETE | `/api/v1/study-design/designs/{studyDesignId}/visits/{visitId}` | 🔄 IMPROVE | Delete visit |
| `/api/clinops/study-design/{studyDesignId}/form-assignments` | POST | `/api/v1/study-design/designs/{studyDesignId}/form-assignments` | 🔄 IMPROVE | Create assignment |
| `/api/clinops/study-design/{studyDesignId}/form-assignments` | GET | `/api/v1/study-design/designs/{studyDesignId}/form-assignments` | 🔄 IMPROVE | List assignments |
| `/api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}` | GET | `/api/v1/study-design/designs/{studyDesignId}/form-assignments/{assignmentId}` | 🔄 IMPROVE | Get assignment |
| `/api/clinops/study-design/studies/{studyId}/visits` | POST | `/api/v1/study-design/studies/{studyId}/design/visits` | 🔄 IMPROVE | Study-based design |
| `/api/clinops/study-design/studies/{studyId}/visits` | GET | `/api/v1/study-design/studies/{studyId}/design/visits` | 🔄 IMPROVE | Get study visits |
| `/api/clinops/study-design/studies/{studyId}/arms` | POST | `/api/v1/study-design/studies/{studyId}/design/arms` | 🔄 IMPROVE | Study-based arms |
| `/api/clinops/study-design/studies/{studyId}/visits/{visitId}` | PUT | `/api/v1/study-design/studies/{studyId}/design/visits/{visitId}` | 🔄 IMPROVE | Update via study |
| `/api/clinops/study-design/studies/{studyId}/visits/{visitId}` | DELETE | `/api/v1/study-design/studies/{studyId}/design/visits/{visitId}` | 🔄 IMPROVE | Delete via study |

**Arms Management (Separate Controller - Should Be Consolidated)**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/arms/{armId}` | PUT | `/api/v1/study-design/arms/{armId}` | ⚠️ CHANGE | Standalone arm update |
| `/api/arms/{armId}` | DELETE | `/api/v1/study-design/arms/{armId}` | ⚠️ CHANGE | Standalone arm delete |

⚠️ **RECOMMENDATION**: Consolidate into `/api/v1/study-design/designs/{designId}/arms/{armId}`

**Form Bindings (Separate Controller - Should Be Consolidated)**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/form-bindings/{bindingId}` | PUT | `/api/v1/study-design/form-assignments/{bindingId}` | 🔄 IMPROVE | Consistent naming |
| `/api/form-bindings/{bindingId}` | DELETE | `/api/v1/study-design/form-assignments/{bindingId}` | 🔄 IMPROVE | Consistent naming |

⚠️ **RECOMMENDATION**: Merge into StudyDesignController

---

#### Module 1.4: Form Management (studydesign.design.form)

**Current URLs**: `/api/form-definitions/*`, `/api/form-templates/*`

**Form Definitions**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/form-definitions` | POST | `/api/v1/study-design/form-definitions` | ⚠️ CHANGE | Add v1 |
| `/api/form-definitions/{id}` | GET | `/api/v1/study-design/form-definitions/{id}` | ⚠️ CHANGE | Standard CRUD |
| `/api/form-definitions/{id}` | PUT | `/api/v1/study-design/form-definitions/{id}` | ⚠️ CHANGE | Full update |
| `/api/form-definitions/{id}` | DELETE | `/api/v1/study-design/form-definitions/{id}` | ⚠️ CHANGE | Delete |
| `/api/form-definitions/study/{studyId}` | GET | `/api/v1/study-design/studies/{studyId}/form-definitions` | 🔄 IMPROVE | Nested resource |
| `/api/form-definitions/study/{studyId}/status/{status}` | GET | `/api/v1/study-design/studies/{studyId}/form-definitions?status={status}` | 🔄 IMPROVE | Query param |
| `/api/form-definitions/template/{templateId}` | GET | `/api/v1/study-design/form-templates/{templateId}/definitions` | 🔄 IMPROVE | Show relationship |
| `/api/form-definitions/study/{studyId}/search/name` | GET | `/api/v1/study-design/studies/{studyId}/form-definitions?name={query}` | 🔄 IMPROVE | Query param |
| `/api/form-definitions/study/{studyId}/search/tags` | GET | `/api/v1/study-design/studies/{studyId}/form-definitions?tags={tags}` | 🔄 IMPROVE | Query param |
| `/api/form-definitions/study/{studyId}/type/{formType}` | GET | `/api/v1/study-design/studies/{studyId}/form-definitions?type={formType}` | 🔄 IMPROVE | Query param |
| `/api/form-definitions/{id}/lock` | PATCH | `/api/v1/study-design/form-definitions/{id}/lifecycle/lock` | 🔄 IMPROVE | Lifecycle action |
| `/api/form-definitions/{id}/unlock` | PATCH | `/api/v1/study-design/form-definitions/{id}/lifecycle/unlock` | 🔄 IMPROVE | Lifecycle action |
| `/api/form-definitions/{id}/approve` | PATCH | `/api/v1/study-design/form-definitions/{id}/lifecycle/approve` | 🔄 IMPROVE | Lifecycle action |

**Form Templates**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/form-templates` | POST | `/api/v1/study-design/form-templates` | ⚠️ CHANGE | Add v1 |
| `/api/form-templates` | GET | `/api/v1/study-design/form-templates` | ⚠️ CHANGE | List all |
| `/api/form-templates/published` | GET | `/api/v1/study-design/form-templates?status=published` | 🔄 IMPROVE | Query param |
| `/api/form-templates/category/{category}` | GET | `/api/v1/study-design/form-templates?category={category}` | 🔄 IMPROVE | Query param |
| `/api/form-templates/{id}` | GET | `/api/v1/study-design/form-templates/{id}` | ⚠️ CHANGE | Standard CRUD |
| `/api/form-templates/{id}` | PUT | `/api/v1/study-design/form-templates/{id}` | ⚠️ CHANGE | Full update |
| `/api/form-templates/{id}` | DELETE | `/api/v1/study-design/form-templates/{id}` | ⚠️ CHANGE | Delete |
| `/api/form-templates/template/{templateId}` | POST | `/api/v1/study-design/form-templates/{templateId}/clone` | 🔄 IMPROVE | Clone action |
| `/api/form-templates/search/name` | GET | `/api/v1/study-design/form-templates?name={query}` | 🔄 IMPROVE | Query param |
| `/api/form-templates/search/tags` | GET | `/api/v1/study-design/form-templates?tags={tags}` | 🔄 IMPROVE | Query param |
| `/api/form-templates/{id}/publish` | PATCH | `/api/v1/study-design/form-templates/{id}/lifecycle/publish` | 🔄 IMPROVE | Lifecycle action |
| `/api/form-templates/{id}/archive` | PATCH | `/api/v1/study-design/form-templates/{id}/lifecycle/archive` | 🔄 IMPROVE | Lifecycle action |
| `/api/form-templates/stats/category/{category}/count` | GET | `/api/v1/study-design/analytics/form-templates/count?category={category}` | 🔄 IMPROVE | Analytics |

---

#### Module 1.5: Database Build (studydesign.build)

**Current URLs**: `/api/v1/study-database-builds/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/study-database-builds` | POST | `/api/v1/study-design/database-builds` | 🔄 IMPROVE | Simplify name |
| `/api/v1/study-database-builds/{id}` | GET | `/api/v1/study-design/database-builds/{id}` | 🔄 IMPROVE | Standard CRUD |
| `/api/v1/study-database-builds/request/{buildRequestId}` | GET | `/api/v1/study-design/database-builds/by-request/{buildRequestId}` | 🔄 IMPROVE | Clearer naming |
| `/api/v1/study-database-builds/uuid/{aggregateUuid}` | GET | `/api/v1/study-design/database-builds/by-uuid/{aggregateUuid}` | 🔄 IMPROVE | Clearer naming |
| `/api/v1/study-database-builds/study/{studyId}` | GET | `/api/v1/study-design/studies/{studyId}/database-builds` | 🔄 IMPROVE | Nested resource |
| `/api/v1/study-database-builds/study/{studyId}/latest` | GET | `/api/v1/study-design/studies/{studyId}/database-builds/latest` | 🔄 IMPROVE | Nested |
| `/api/v1/study-database-builds/status/{status}` | GET | `/api/v1/study-design/database-builds?status={status}` | 🔄 IMPROVE | Query param |
| `/api/v1/study-database-builds/study/{studyId}/status/{status}` | GET | `/api/v1/study-design/studies/{studyId}/database-builds?status={status}` | 🔄 IMPROVE | Nested + filter |
| `/api/v1/study-database-builds/in-progress` | GET | `/api/v1/study-design/database-builds?status=in_progress` | 🔄 IMPROVE | Query param |
| `/api/v1/study-database-builds/failed` | GET | `/api/v1/study-design/database-builds?status=failed` | 🔄 IMPROVE | Query param |
| `/api/v1/study-database-builds/{buildRequestId}/validate` | POST | `/api/v1/study-design/database-builds/{buildRequestId}/actions/validate` | 🔄 IMPROVE | Action hierarchy |
| `/api/v1/study-database-builds/{buildRequestId}/cancel` | POST | `/api/v1/study-design/database-builds/{buildRequestId}/actions/cancel` | 🔄 IMPROVE | Action hierarchy |
| `/api/v1/study-database-builds/{buildRequestId}/complete` | POST | `/api/v1/study-design/database-builds/{buildRequestId}/actions/complete` | 🔄 IMPROVE | Action hierarchy |

---

#### Module 1.6: Document Management (studydesign.documentmgmt)

**Current URLs**: `/api/v1/documents/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/documents/upload` | POST | `/api/v1/study-design/documents` | 🔄 IMPROVE | Standard POST for create |
| `/api/v1/documents/{uuid}` | GET | `/api/v1/study-design/documents/{uuid}` | ⚠️ CHANGE | Already correct |
| `/api/v1/documents/{uuid}` | DELETE | `/api/v1/study-design/documents/{uuid}` | ⚠️ CHANGE | Standard DELETE |
| `/api/v1/documents/{uuid}/metadata` | PUT | `/api/v1/study-design/documents/{uuid}/metadata` | ⚠️ CHANGE | Partial update |
| `/api/v1/documents/id/{id}` | GET | `/api/v1/study-design/documents/by-id/{id}` | 🔄 IMPROVE | Clearer naming |
| `/api/v1/documents/study/{studyId}` | GET | `/api/v1/study-design/studies/{studyId}/documents` | 🔄 IMPROVE | Nested resource |
| `/api/v1/documents/study/{studyId}/status/{status}` | GET | `/api/v1/study-design/studies/{studyId}/documents?status={status}` | 🔄 IMPROVE | Query param |
| `/api/v1/documents/study/{studyId}/type/{documentType}` | GET | `/api/v1/study-design/studies/{studyId}/documents?type={documentType}` | 🔄 IMPROVE | Query param |
| `/api/v1/documents/study/{studyId}/current` | GET | `/api/v1/study-design/studies/{studyId}/documents/current` | 🔄 IMPROVE | Nested resource |
| `/api/v1/documents/{uuid}/download` | POST | `/api/v1/study-design/documents/{uuid}/download` | ⚠️ CHANGE | Should be GET |
| `/api/v1/documents/{uuid}/approve` | POST | `/api/v1/study-design/documents/{uuid}/lifecycle/approve` | 🔄 IMPROVE | Lifecycle action |
| `/api/v1/documents/{uuid}/supersede` | POST | `/api/v1/study-design/documents/{uuid}/lifecycle/supersede` | 🔄 IMPROVE | Lifecycle action |
| `/api/v1/documents/{uuid}/archive` | POST | `/api/v1/study-design/documents/{uuid}/lifecycle/archive` | 🔄 IMPROVE | Lifecycle action |

---

#### Module 1.7: Metadata Management (studydesign.metadatamgmt)

**Current URLs**: `/api/admin/codelists/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/admin/codelists` | POST | `/api/v1/study-design/metadata/codelists` | 🔄 IMPROVE | Remove "admin" |
| `/api/admin/codelists` | GET | `/api/v1/study-design/metadata/codelists` | 🔄 IMPROVE | List all |
| `/api/admin/codelists/{id}` | GET | `/api/v1/study-design/metadata/codelists/{id}` | 🔄 IMPROVE | Standard CRUD |
| `/api/admin/codelists/{id}` | PUT | `/api/v1/study-design/metadata/codelists/{id}` | 🔄 IMPROVE | Full update |
| `/api/admin/codelists/{id}` | DELETE | `/api/v1/study-design/metadata/codelists/{id}` | 🔄 IMPROVE | Soft delete |
| `/api/admin/codelists/{id}/hard` | DELETE | `/api/v1/study-design/metadata/codelists/{id}?hard=true` | 🔄 IMPROVE | Query param |
| `/api/admin/codelists/simple/{category}` | GET | `/api/v1/study-design/metadata/codelists?category={category}&format=simple` | 🔄 IMPROVE | Query params |
| `/api/admin/codelists/{category}` | GET | `/api/v1/study-design/metadata/codelists?category={category}` | 🔄 IMPROVE | Query param |
| `/api/admin/codelists/{category}/{code}` | GET | `/api/v1/study-design/metadata/codelists/{category}/codes/{code}` | 🔄 IMPROVE | Nested resource |
| `/api/admin/codelists/validate/{category}/{code}` | GET | `/api/v1/study-design/metadata/codelists/{category}/codes/{code}/validate` | 🔄 IMPROVE | Action endpoint |
| `/api/admin/codelists/categories` | GET | `/api/v1/study-design/metadata/codelist-categories` | 🔄 IMPROVE | Separate resource |
| `/api/admin/codelists/search` | GET | `/api/v1/study-design/metadata/codelists/search?q={query}` | 🔄 IMPROVE | Query param |
| `/api/admin/codelists/{parentId}/children` | GET | `/api/v1/study-design/metadata/codelists/{parentId}/children` | 🔄 IMPROVE | Nested resource |
| `/api/admin/codelists/expiring` | GET | `/api/v1/study-design/metadata/codelists?status=expiring` | 🔄 IMPROVE | Query param |

---

### 🏥 **BOUNDED CONTEXT 2: STUDY OPERATIONS**

#### Module 2.1: Patient Enrollment (studyoperation.patientenrollment)

**Current URLs**: `/api/v1/patients/*`

**Patient Enrollment Core**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/patients` | POST | `/api/v1/study-operations/patients` | ⚠️ CHANGE | Bounded context prefix |
| `/api/v1/patients` | GET | `/api/v1/study-operations/patients` | ⚠️ CHANGE | List all patients |
| `/api/v1/patients/{patientId}` | GET | `/api/v1/study-operations/patients/{patientId}` | ⚠️ CHANGE | Get patient |
| `/api/v1/patients/{patientId}` | PUT | `/api/v1/study-operations/patients/{patientId}` | ⚠️ CHANGE | Update patient |
| `/api/v1/patients/uuid/{aggregateUuid}` | GET | `/api/v1/study-operations/patients/by-uuid/{aggregateUuid}` | 🔄 IMPROVE | Clearer naming |
| `/api/v1/patients/{patientId}/enroll` | POST | `/api/v1/study-operations/patients/{patientId}/enrollment` | 🔄 IMPROVE | RESTful action |
| `/api/v1/patients/study/{studyId}` | GET | `/api/v1/study-operations/studies/{studyId}/patients` | 🔄 IMPROVE | Nested resource |
| `/api/v1/patients/search` | GET | `/api/v1/study-operations/patients?q={query}` | 🔄 IMPROVE | Query param |
| `/api/v1/patients/count` | GET | `/api/v1/study-operations/patients/count` | ⚠️ CHANGE | Aggregate endpoint |
| `/api/v1/patients/health` | GET | `/api/v1/study-operations/health/patients` | 🔄 IMPROVE | Health check |
| `/api/v1/patients/test-enroll` | POST | `/api/v1/study-operations/patients/test-enrollment` | 🔄 IMPROVE | Test endpoint |
| `/api/v1/patients/site-studies/study/{studyId}` | GET | `/api/v1/study-operations/studies/{studyId}/site-studies` | 🔄 IMPROVE | Better hierarchy |

**Patient Status Sub-Module**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/patients/{patientId}/status` | POST | `/api/v1/study-operations/patients/{patientId}/status-transitions` | 🔄 IMPROVE | Clearer intent |
| `/api/v1/patients/{patientId}/status/history` | GET | `/api/v1/study-operations/patients/{patientId}/status-history` | 🔄 IMPROVE | Cleaner URL |
| `/api/v1/patients/{patientId}/status/current` | GET | `/api/v1/study-operations/patients/{patientId}/status` | 🔄 IMPROVE | Simpler (default current) |
| `/api/v1/patients/{patientId}/status/summary` | GET | `/api/v1/study-operations/patients/{patientId}/status/summary` | ⚠️ CHANGE | Keep as-is |
| `/api/v1/patients/{patientId}/status/count` | GET | `/api/v1/study-operations/patients/{patientId}/status-changes/count` | 🔄 IMPROVE | Clearer naming |
| `/api/v1/patients/{patientId}/status/valid-transitions` | GET | `/api/v1/study-operations/patients/{patientId}/status/valid-transitions` | ⚠️ CHANGE | Keep as-is |
| `/api/v1/patients/status/transitions/summary` | GET | `/api/v1/study-operations/analytics/status-transitions/summary` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/patients/status/{status}/patients` | GET | `/api/v1/study-operations/patients?status={status}` | 🔄 IMPROVE | Query param |
| `/api/v1/patients/status/{status}/stuck` | GET | `/api/v1/study-operations/patients?status={status}&stuck=true` | 🔄 IMPROVE | Query params |
| `/api/v1/patients/status/changes` | GET | `/api/v1/study-operations/analytics/patient-status-changes` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/patients/status/changes/by-user` | GET | `/api/v1/study-operations/analytics/patient-status-changes/by-user` | 🔄 IMPROVE | Analytics endpoint |
| `/api/v1/patients/status/health` | GET | `/api/v1/study-operations/health/patient-status` | 🔄 IMPROVE | Health check |

---

#### Module 2.2: Visit Management (studyoperation.visit)

**Current URLs**: `/api/v1/visits/*`, `/api/clinops/unscheduled-visit-config/*`

**Visits Core**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/visits/unscheduled` | POST | `/api/v1/study-operations/visits/unscheduled` | ⚠️ CHANGE | Bounded context |
| `/api/v1/visits/{visitId}` | GET | `/api/v1/study-operations/visits/{visitId}` | ⚠️ CHANGE | Standard CRUD |
| `/api/v1/visits/patient/{patientId}` | GET | `/api/v1/study-operations/patients/{patientId}/visits` | 🔄 IMPROVE | Nested resource |
| `/api/v1/visits/study/{studyId}` | GET | `/api/v1/study-operations/studies/{studyId}/visits` | 🔄 IMPROVE | Nested resource |
| `/api/v1/visits/type/{visitType}` | GET | `/api/v1/study-operations/visits?type={visitType}` | 🔄 IMPROVE | Query param |
| `/api/v1/visits/study/{studyId}/unscheduled-types` | GET | `/api/v1/study-operations/studies/{studyId}/visit-types/unscheduled` | 🔄 IMPROVE | Better hierarchy |
| `/api/v1/visits/{visitInstanceId}/forms` | GET | `/api/v1/study-operations/visits/{visitInstanceId}/forms` | ⚠️ CHANGE | Keep as-is |
| `/api/v1/visits/{visitInstanceId}/forms/required` | GET | `/api/v1/study-operations/visits/{visitInstanceId}/forms?required=true` | 🔄 IMPROVE | Query param |
| `/api/v1/visits/{visitInstanceId}/completion` | GET | `/api/v1/study-operations/visits/{visitInstanceId}/completion-status` | 🔄 IMPROVE | Clearer naming |

**Unscheduled Visit Configuration Sub-Module**

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/clinops/unscheduled-visit-config` | POST | `/api/v1/study-operations/visit-configurations/unscheduled` | 🔄 IMPROVE | Better hierarchy |
| `/api/clinops/unscheduled-visit-config` | GET | `/api/v1/study-operations/visit-configurations/unscheduled` | 🔄 IMPROVE | List configs |
| `/api/clinops/unscheduled-visit-config/{id}` | GET | `/api/v1/study-operations/visit-configurations/unscheduled/{id}` | 🔄 IMPROVE | Standard CRUD |
| `/api/clinops/unscheduled-visit-config/{id}` | PUT | `/api/v1/study-operations/visit-configurations/unscheduled/{id}` | 🔄 IMPROVE | Update config |
| `/api/clinops/unscheduled-visit-config/{id}` | DELETE | `/api/v1/study-operations/visit-configurations/unscheduled/{id}` | 🔄 IMPROVE | Delete config |
| `/api/clinops/unscheduled-visit-config/enabled` | GET | `/api/v1/study-operations/visit-configurations/unscheduled?enabled=true` | 🔄 IMPROVE | Query param |
| `/api/clinops/unscheduled-visit-config/by-code/{code}` | GET | `/api/v1/study-operations/visit-configurations/unscheduled/by-code/{code}` | 🔄 IMPROVE | Clearer naming |
| `/api/clinops/unscheduled-visit-config/{id}/toggle` | PATCH | `/api/v1/study-operations/visit-configurations/unscheduled/{id}/toggle-status` | 🔄 IMPROVE | Clearer action |

---

#### Module 2.3: Form Data Capture (studyoperation.datacapture.formdata)

**Current URLs**: `/api/v1/form-data/*`

| Current URL | HTTP | Proposed URL | Status | Notes |
|------------|------|--------------|--------|-------|
| `/api/v1/form-data` | POST | `/api/v1/study-operations/form-data` | ⚠️ CHANGE | Bounded context |
| `/api/v1/form-data/{id}` | GET | `/api/v1/study-operations/form-data/{id}` | ⚠️ CHANGE | Standard CRUD |
| `/api/v1/form-data/subject/{subjectId}` | GET | `/api/v1/study-operations/patients/{subjectId}/form-data` | 🔄 IMPROVE | Nested resource |
| `/api/v1/form-data/study/{studyId}` | GET | `/api/v1/study-operations/studies/{studyId}/form-data` | 🔄 IMPROVE | Nested resource |
| `/api/v1/form-data/study/{studyId}/form/{formId}` | GET | `/api/v1/study-operations/studies/{studyId}/forms/{formId}/data` | 🔄 IMPROVE | Better hierarchy |
| `/api/v1/form-data/visit/{visitId}/form/{formId}` | GET | `/api/v1/study-operations/visits/{visitId}/forms/{formId}/data` | 🔄 IMPROVE | Better hierarchy |
| `/api/v1/form-data/health` | GET | `/api/v1/study-operations/health/form-data` | 🔄 IMPROVE | Health check |

---

## 📐 **URL Design Principles**

### 1. **Resource-Oriented Design**
✅ **DO**:
- `/api/v1/study-design/studies` (plural noun)
- `/api/v1/study-operations/patients` (plural noun)
- `/api/v1/study-design/form-templates/{id}/clone` (action as sub-resource)

❌ **DON'T**:
- `/api/v1/createStudy` (verb in URL)
- `/api/v1/getPatient/{id}` (verb in URL)
- `/api/v1/study` (singular when representing collection)

### 2. **Nested Resources (Parent-Child Relationships)**
✅ **DO**:
- `/api/v1/study-design/studies/{studyId}/protocol-versions` (versions belong to study)
- `/api/v1/study-operations/patients/{patientId}/visits` (visits belong to patient)
- `/api/v1/study-design/designs/{designId}/arms` (arms belong to design)

❌ **DON'T**:
- `/api/v1/protocol-versions/study/{studyId}` (awkward hierarchy)
- `/api/v1/visits/patient/{patientId}` (backwards relationship)

### 3. **Query Parameters for Filtering**
✅ **DO**:
- `/api/v1/study-design/studies?status=active&phase=III` (filters)
- `/api/v1/study-operations/patients?enrolledAfter=2025-01-01` (temporal filters)
- `/api/v1/study-design/form-templates?category=screening&published=true` (multiple filters)

❌ **DON'T**:
- `/api/v1/studies/status/active/phase/III` (URL explosion)
- `/api/v1/studies/active-phase-three` (non-scalable)

### 4. **Lifecycle Actions as Sub-Resources**
✅ **DO**:
- `/api/v1/study-design/studies/{id}/lifecycle/suspend` (POST)
- `/api/v1/study-design/protocol-versions/{id}/lifecycle/approve` (POST)
- `/api/v1/study-design/form-definitions/{id}/lifecycle/lock` (POST)

❌ **DON'T**:
- `/api/v1/studies/{id}/suspend` (mixed with CRUD operations)
- `/api/v1/suspendStudy/{id}` (verb in URL)

### 5. **Versioning**
✅ **DO**:
- `/api/v1/study-design/studies` (version in URL)
- `/api/v2/study-design/studies` (future version)

❌ **DON'T**:
- `/api/study-design/studies?version=1` (query param versioning)
- `/api/study-design/v1/studies` (version after domain)

### 6. **Consistency in Naming**
✅ **DO**:
- Use **kebab-case**: `form-definitions`, `database-builds`, `patient-enrollment`
- Use **plural** for collections: `studies`, `patients`, `visits`
- Use **singular** for single resource: `/studies/{id}`, `/patients/{patientId}`

❌ **DON'T**:
- Mix cases: `/formDefinitions`, `/database_builds`, `/PatientEnrollment`
- Mix singular/plural inconsistently

### 7. **Analytics and Aggregates**
✅ **DO**:
- `/api/v1/study-design/analytics/dashboard-metrics` (analytics namespace)
- `/api/v1/study-operations/analytics/status-transitions/summary` (aggregated data)
- `/api/v1/study-design/studies/count` (simple aggregate)

❌ **DON'T**:
- `/api/v1/studies/dashboard/metrics` (mixed with CRUD)
- `/api/v1/getStudyMetrics` (verb in URL)

### 8. **Health Checks**
✅ **DO**:
- `/api/v1/study-operations/health/patients` (health namespace)
- `/api/v1/study-design/health/status-computation` (module-specific health)

❌ **DON'T**:
- `/api/v1/patients/health` (mixed with business logic)

---

## 🔄 **Migration Strategy**

### Phase 1: Alias Period (3-6 months)
- Keep old URLs working (backward compatible)
- Add new URLs alongside old ones
- Both URLs point to same controller methods
- Log warnings when old URLs are used
- Return `Deprecation` headers with old URLs

```java
@RequestMapping(value = {
    "/api/studies/{id}",           // OLD (deprecated)
    "/api/v1/study-design/studies/{id}"  // NEW
})
public ResponseEntity<StudyDTO> getStudy(@PathVariable String id) {
    if (request.getRequestURI().startsWith("/api/studies")) {
        response.setHeader("Deprecation", "true");
        response.setHeader("Sunset", "2026-04-19T00:00:00Z");
        response.setHeader("Link", "</api/v1/study-design/studies/{id}>; rel=\"alternate\"");
    }
    // ... implementation
}
```

### Phase 2: Deprecation Notice (6-12 months)
- Mark old endpoints as `@Deprecated`
- Update all internal services to use new URLs
- Notify external API consumers
- Update documentation to show new URLs only
- Provide migration scripts for common clients

### Phase 3: Sunset Period (12-18 months)
- Return HTTP 410 Gone for old URLs
- Direct clients to new URLs in error messages
- Monitor usage to ensure no active clients on old URLs

### Phase 4: Removal (18+ months)
- Remove old URL mappings
- Clean up deprecated code

---

## 🎯 **Controller Consolidation Recommendations**

### 1. **Study Management**
**Current State**: 3 controllers
- `StudyCommandController`
- `StudyQueryController`
- `AutomatedStatusComputationController`

**Recommendation**: Keep separated (CQRS pattern)
- ✅ Command/Query separation is good
- 🔄 Move `AutomatedStatusComputationController` logic into `StudyCommandController` or create `StudyStatusController`

### 2. **Study Design**
**Current State**: 3 controllers
- `StudyDesignCommandController`
- `StudyDesignQueryController`
- `StudyArmsCommandController`
- `FormBindingCommandController`

**Recommendation**: Consolidate
- ✅ Keep Command/Query separation
- 🔄 Merge `StudyArmsCommandController` into `StudyDesignCommandController`
- 🔄 Merge `FormBindingCommandController` into `StudyDesignCommandController`
- **Result**: 2 controllers (Command, Query)

### 3. **Protocol Version**
**Current State**: 3 controllers
- `ProtocolVersionCommandController`
- `ProtocolVersionQueryController`
- `ProtocolVersionBridgeController`

**Recommendation**: Keep separated (CQRS pattern)
- ✅ Command/Query separation is good
- ⚠️ Evaluate if `BridgeController` is still needed (seems to be for backward compatibility)

### 4. **Form Management**
**Current State**: 2 controllers
- `FormDefinitionController` (mixed CRUD)
- `FormTemplateController` (mixed CRUD)

**Recommendation**: Split by CQRS
- 🔄 `FormDefinitionCommandController`
- 🔄 `FormDefinitionQueryController`
- 🔄 `FormTemplateCommandController`
- 🔄 `FormTemplateQueryController`
- **Result**: 4 controllers (better alignment with CQRS)

### 5. **Patient Management**
**Current State**: 2 controllers
- `PatientEnrollmentController` (mixed)
- `PatientStatusController` (mostly read)

**Recommendation**: Split by CQRS
- 🔄 `PatientCommandController` (enrollment, updates)
- 🔄 `PatientQueryController` (reads)
- 🔄 `PatientStatusController` (keep separate - complex subdomain)
- **Result**: 3 controllers

### 6. **Visit Management**
**Current State**: 2 controllers
- `VisitController` (mixed)
- `UnscheduledVisitConfigController` (mixed)

**Recommendation**: Split by CQRS
- 🔄 `VisitCommandController`
- 🔄 `VisitQueryController`
- 🔄 `VisitConfigurationController` (for config management)
- **Result**: 3 controllers

---

## 📊 **Implementation Metrics**

### Estimated Effort
| Module | Controllers | Endpoints | Est. Hours | Priority |
|--------|-------------|-----------|------------|----------|
| Study Management | 3 | ~40 | 16 | HIGH |
| Protocol Management | 3 | ~20 | 8 | HIGH |
| Study Design | 4 | ~30 | 12 | HIGH |
| Form Management | 2 | ~35 | 14 | MEDIUM |
| Database Build | 1 | ~15 | 6 | MEDIUM |
| Document Management | 1 | ~15 | 6 | LOW |
| Metadata Management | 1 | ~15 | 6 | LOW |
| Patient Enrollment | 2 | ~25 | 10 | HIGH |
| Visit Management | 2 | ~20 | 8 | MEDIUM |
| Form Data | 1 | ~10 | 4 | MEDIUM |
| **TOTAL** | **20** | **~225** | **90** | - |

**Total Effort**: ~90 hours (~11 days for 1 developer)

### Risk Assessment
- **Breaking Changes**: HIGH (requires client coordination)
- **Testing Effort**: MEDIUM-HIGH (regression testing all endpoints)
- **Migration Complexity**: MEDIUM (aliasing strategy mitigates risk)
- **Documentation Update**: MEDIUM (OpenAPI/Swagger needs complete update)

---

## ✅ **Benefits of Refactoring**

1. **Consistency**: All APIs follow same patterns
2. **Discoverability**: Logical URL hierarchy easy to understand
3. **Maintainability**: Clear bounded context separation
4. **Scalability**: Query parameters allow flexible filtering without URL explosion
5. **API Versioning**: Clear v1 prefix allows future v2 without breaking changes
6. **RESTful Compliance**: Industry-standard patterns
7. **Documentation**: Easier to auto-generate OpenAPI specs
8. **Client Experience**: Predictable API patterns reduce integration time

---

## 📚 **Related Refactoring Work**

### Prerequisite Refactorings (Already Complete ✅)
1. ✅ **Bounded Context Package Restructuring** (378 files - DONE)
2. ✅ **Spring Configuration Update** (@EnableJpaRepositories, @EntityScan - DONE)
3. ✅ **Validation Complete** (All tests passing - DONE)

### Concurrent Refactorings (Can Do in Parallel)
1. **Controller Consolidation**: Merge small controllers per CQRS pattern
2. **DTO Standardization**: Consistent request/response DTOs
3. **Exception Handling**: Unified error response format
4. **OpenAPI Documentation**: Generate from code + annotations

### Follow-up Refactorings (After URL Changes)
1. **Frontend URL Updates**: Update all frontend API calls
2. **Integration Test Updates**: Update test URLs
3. **Postman Collection Updates**: Regenerate API collections
4. **External Client Migration**: Provide migration guide

---

## 🎬 **Recommended Implementation Order**

### Sprint 1: Foundation (Weeks 1-2)
1. Create URL constants/enums for all new endpoints
2. Update `@RequestMapping` to support both old and new URLs (aliasing)
3. Add deprecation headers to old URLs
4. Update integration tests to use new URLs

### Sprint 2: High Priority Modules (Weeks 3-4)
1. Study Management (studydesign.studymgmt)
2. Protocol Management (studydesign.protocolmgmt)
3. Patient Enrollment (studyoperation.patientenrollment)
4. Study Design (studydesign.design)

### Sprint 3: Medium Priority Modules (Weeks 5-6)
1. Form Management (studydesign.design.form)
2. Database Build (studydesign.build)
3. Visit Management (studyoperation.visit)
4. Form Data (studyoperation.datacapture.formdata)

### Sprint 4: Low Priority & Analytics (Weeks 7-8)
1. Document Management (studydesign.documentmgmt)
2. Metadata Management (studydesign.metadatamgmt)
3. Analytics endpoints across all modules
4. Health check endpoints

### Sprint 5: Finalization (Weeks 9-10)
1. Update OpenAPI/Swagger documentation
2. Generate new Postman collections
3. Update developer documentation
4. External client migration guide
5. Announce deprecation timeline

---

## 📝 **Next Steps**

### Immediate Actions
1. ✅ **Review this document** with team and stakeholders
2. ✅ **Prioritize modules** based on business impact
3. ✅ **Create JIRA tickets** for each module refactoring
4. ✅ **Assign to sprint** backlog

### Before Starting Refactoring
1. ⏳ **Create URL mapping spreadsheet** (detailed old→new mapping)
2. ⏳ **Set up monitoring** for old URL usage (metrics/logging)
3. ⏳ **Communicate to API consumers** about upcoming changes
4. ⏳ **Prepare rollback plan** in case of issues

### During Refactoring
1. ⏳ **Maintain backward compatibility** (both URLs work)
2. ⏳ **Update tests incrementally** (one module at a time)
3. ⏳ **Monitor error rates** for old vs new URLs
4. ⏳ **Document each module** as refactored

### After Refactoring
1. ⏳ **Monitor adoption** of new URLs
2. ⏳ **Support clients** during migration
3. ⏳ **Schedule sunset** of old URLs (6-12 months)
4. ⏳ **Remove old URLs** after sunset period

---

## 📌 **Appendix: Quick Reference**

### New URL Pattern Templates

**Study Design Bounded Context:**
```
/api/v1/study-design/
  ├── studies/
  │   ├── {id}
  │   ├── {id}/lifecycle/{action}
  │   ├── {id}/protocol-versions
  │   ├── {id}/database-builds
  │   ├── {id}/documents
  │   └── {id}/design/
  ├── protocol-versions/
  ├── form-definitions/
  ├── form-templates/
  ├── database-builds/
  ├── documents/
  ├── metadata/
  └── analytics/
```

**Study Operations Bounded Context:**
```
/api/v1/study-operations/
  ├── patients/
  │   ├── {id}
  │   ├── {id}/status
  │   ├── {id}/visits
  │   └── {id}/form-data
  ├── visits/
  │   ├── {id}
  │   ├── {id}/forms
  │   └── {id}/completion-status
  ├── form-data/
  ├── visit-configurations/
  ├── analytics/
  └── health/
```

---

**Document Status**: 📋 PLANNING - Ready for Team Review  
**Next Review Date**: Before starting URL refactoring sprint  
**Document Owner**: Development Team  
**Last Updated**: October 19, 2025
