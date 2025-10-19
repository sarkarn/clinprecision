# StudyQueryController vs StudyDesignQueryController - Separation Analysis

**Date:** October 19, 2025  
**Purpose:** Analyze which endpoints belong in which controller based on DDD domain boundaries

---

## Executive Summary

**Problem:** `StudyQueryController` currently mixes two distinct domain concerns:
1. **Study Management** - Study lifecycle, metadata, and operational queries
2. **Study Design** - Design-time configuration (arms, visits, forms)

**Solution:** Separate endpoints based on domain bounded contexts:
- `StudyQueryController` → Study lifecycle and metadata (Study Management domain)
- `StudyDesignQueryController` → Design configuration (Study Design domain)

---

## Domain Boundary Analysis

### Domain 1: **Study Management** (`studydesign.studymgmt`)
**Aggregate Root:** Study  
**Responsibility:** Study lifecycle, status, metadata, high-level information  
**When to use:** Querying study existence, status, overview, dashboard metrics

### Domain 2: **Study Design** (`studydesign.design`)
**Aggregate Root:** StudyDesign  
**Responsibility:** Study design configuration (arms, visits, forms, protocol)  
**When to use:** Querying or modifying study design structure

---

## Current State Analysis

### StudyQueryController Current Endpoints (23 endpoints)

| Endpoint | Domain | Should Stay? | Should Move? | Reason |
|----------|--------|--------------|--------------|--------|
| `GET /api/studies` | Study Mgmt | ✅ **STAY** | ❌ | List all studies - core study management |
| `GET /api/studies/{id}` | Study Mgmt | ✅ **STAY** | ❌ | Get study metadata - not design details |
| `GET /api/studies/{id}/uuid` | Study Mgmt | ✅ **STAY** | ❌ | UUID lookup - study identity |
| `GET /api/studies/{id}/overview` | Study Mgmt | ✅ **STAY** | ❌ | Study overview - lifecycle info |
| `GET /api/studies/{id}/arms` | **Study Design** | ❌ | ✅ **MOVE** | Arms are design-time configuration |
| `GET /api/studies/search` | Study Mgmt | ✅ **STAY** | ❌ | Search studies - metadata search |
| `GET /api/studies/lookup/statuses` | Study Mgmt | ✅ **STAY** | ❌ | Reference data - study statuses |
| `GET /api/studies/lookup/regulatory-statuses` | Study Mgmt | ✅ **STAY** | ❌ | Reference data - regulatory info |
| `GET /api/studies/lookup/phases` | Study Mgmt | ✅ **STAY** | ❌ | Reference data - study phases |
| `GET /api/studies/dashboard/metrics` | Study Mgmt | ✅ **STAY** | ❌ | Dashboard - operational metrics |
| `GET /api/studies/{id}/design-progress` | **Study Design** | ❌ | ✅ **MOVE** | Design progress tracking |
| `GET /api/studies/{uuid}/status/transitions` | Study Mgmt | ✅ **STAY** | ❌ | Status transitions - lifecycle |
| `GET /api/studies/{uuid}/modification-allowed` | Study Mgmt | ✅ **STAY** | ❌ | Modification permissions - lifecycle |
| `GET /api/studies/{uuid}/exists` | Study Mgmt | ✅ **STAY** | ❌ | Existence check - study identity |
| `GET /api/studies/{id}/form-bindings` | **Study Design** | ❌ | ✅ **MOVE** | Form assignments - design config |
| `GET /api/studies/{id}/versions/history` | **Protocol Mgmt** | ❌ | ⚠️ **CONSIDER** | Protocol versions - might need separate controller |
| `GET /api/studies/{id}/versions` | **Protocol Mgmt** | ❌ | ⚠️ **CONSIDER** | Protocol versions - might need separate controller |

### StudyDesignQueryController Current Endpoints (10 endpoints)

| Endpoint | Domain | Status | Notes |
|----------|--------|--------|-------|
| `GET /api/clinops/study-design/{id}` | Study Design | ✅ **CORRECT** | Complete design structure |
| `GET /api/clinops/study-design/{id}/arms` | Study Design | ✅ **CORRECT** | List all arms |
| `GET /api/clinops/study-design/{id}/arms/{armId}` | Study Design | ✅ **CORRECT** | Specific arm details |
| `GET /api/clinops/study-design/{id}/visits` | Study Design | ✅ **CORRECT** | List all visits |
| `GET /api/clinops/study-design/{id}/visits/general` | Study Design | ✅ **CORRECT** | General visits |
| `GET /api/clinops/study-design/{id}/visits/{visitId}` | Study Design | ✅ **CORRECT** | Specific visit |
| `GET /api/clinops/study-design/{id}/form-assignments` | Study Design | ✅ **CORRECT** | All form assignments |
| `GET /api/clinops/study-design/{id}/form-assignments/{assignmentId}` | Study Design | ✅ **CORRECT** | Specific assignment |

---

## Recommended Separation

### 1️⃣ **StudyQueryController** - Study Management Queries (12 endpoints)

**Base Path:** `/api/studies`  
**Domain:** Study Management (studydesign.studymgmt)  
**Responsibility:** Study lifecycle, metadata, operational queries

#### ✅ **Endpoints to KEEP:**

```java
// STUDY LISTING & SEARCH
GET /api/studies                              // List all studies with filters
GET /api/studies/search                       // Advanced search

// STUDY METADATA
GET /api/studies/{id}                         // Get study by ID/UUID (metadata only)
GET /api/studies/{id}/overview                // Study overview (no design details)
GET /api/studies/{id}/uuid                    // UUID lookup

// STUDY LIFECYCLE
GET /api/studies/{uuid}/status/transitions    // Valid status transitions
GET /api/studies/{uuid}/modification-allowed  // Can modify?
GET /api/studies/{uuid}/exists                // Exists check

// REFERENCE DATA
GET /api/studies/lookup/statuses              // Study statuses dropdown
GET /api/studies/lookup/regulatory-statuses   // Regulatory statuses dropdown
GET /api/studies/lookup/phases                // Study phases dropdown

// OPERATIONAL METRICS
GET /api/studies/dashboard/metrics            // Dashboard metrics
```

#### 📋 **Responsibilities:**
- Study identity and metadata
- Study lifecycle status management
- Search and filtering studies
- Reference data (statuses, phases)
- Dashboard and operational metrics
- Permission checks

---

### 2️⃣ **StudyDesignQueryController** - Study Design Queries (13+ endpoints)

**Base Path:** `/api/clinops/study-design`  
**Domain:** Study Design (studydesign.design)  
**Responsibility:** Study design configuration queries

#### ✅ **Endpoints ALREADY CORRECT (Keep as-is):**

```java
// COMPLETE DESIGN
GET /api/clinops/study-design/{studyDesignId}

// STUDY ARMS
GET /api/clinops/study-design/{studyDesignId}/arms
GET /api/clinops/study-design/{studyDesignId}/arms/{armId}

// VISITS
GET /api/clinops/study-design/{studyDesignId}/visits
GET /api/clinops/study-design/{studyDesignId}/visits/general
GET /api/clinops/study-design/{studyDesignId}/visits/{visitId}

// FORM ASSIGNMENTS
GET /api/clinops/study-design/{studyDesignId}/form-assignments
GET /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}
```

#### ➕ **Endpoints to ADD (move from StudyQueryController):**

```java
// DESIGN PROGRESS (move from StudyQueryController)
GET /api/clinops/study-design/{studyDesignId}/design-progress
// Rationale: Design progress is design-specific, not study metadata

// BRIDGE ENDPOINTS (move from StudyQueryController)
GET /api/clinops/study-design/by-study/{studyId}/arms
// Rationale: Bridge endpoint that resolves studyId → studyDesignId → arms
// Supports legacy StudyId while maintaining DDD boundaries

GET /api/clinops/study-design/by-study/{studyId}/form-bindings
// Rationale: Bridge endpoint for form assignments
// Auto-initializes StudyDesign if needed (current behavior preserved)
```

#### 📋 **Responsibilities:**
- Study design structure (arms, visits, forms)
- Design-time configuration
- Form assignments and bindings
- Design progress tracking
- Design validation

---

### 3️⃣ **Protocol Version Endpoints** - Consider Separate Controller

**Current Location:** `StudyQueryController`  
**Recommendation:** Move to `ProtocolVersionQueryController` (if exists) or keep in bridge

```java
// PROTOCOL VERSIONS (consider moving to ProtocolVersionQueryController)
GET /api/studies/{studyId}/versions/history
GET /api/studies/{studyId}/versions
```

**Options:**
1. **Option A:** Create dedicated `ProtocolVersionQueryController` under `studydesign.protocolmgmt`
   - Cleaner domain separation
   - Future protocol-specific queries easier to add
   
2. **Option B:** Keep in `StudyQueryController` as bridge endpoints
   - Simpler for now
   - Legacy compatibility
   - Less controller proliferation

**Recommendation:** Option B for now (keep as bridge), move to dedicated controller when protocol management grows.

---

## Migration Strategy

### Phase 1: Add Bridge Endpoints to StudyDesignQueryController ✅

**Goal:** Support legacy `studyId` → `studyDesignId` resolution without breaking existing clients

**Add to StudyDesignQueryController:**

```java
/**
 * Bridge Endpoint: Get study arms by legacy Study ID
 * Automatically resolves studyId to studyDesignId
 */
@GetMapping("/by-study/{studyId}/arms")
public ResponseEntity<List<StudyArmResponse>> getArmsByStudyId(@PathVariable String studyId) {
    log.info("BRIDGE: Get arms for study: {}", studyId);
    
    UUID studyDesignId = autoInitService.ensureStudyDesignExists(studyId).join();
    return getStudyArms(studyDesignId);
}

/**
 * Bridge Endpoint: Get form bindings by legacy Study ID
 * Automatically resolves studyId to studyDesignId
 */
@GetMapping("/by-study/{studyId}/form-bindings")
public ResponseEntity<List<FormAssignmentResponse>> getFormBindingsByStudyId(
        @PathVariable String studyId,
        @RequestParam(required = false) UUID visitId,
        @RequestParam(required = false) Boolean requiredOnly) {
    log.info("BRIDGE: Get form bindings for study: {}", studyId);
    
    UUID studyDesignId = autoInitService.ensureStudyDesignExists(studyId).join();
    return getFormAssignments(studyDesignId, visitId, requiredOnly);
}

/**
 * Bridge Endpoint: Get design progress by legacy Study ID
 */
@GetMapping("/by-study/{studyId}/design-progress")
public ResponseEntity<DesignProgressResponseDto> getDesignProgressByStudyId(@PathVariable String studyId) {
    log.info("BRIDGE: Get design progress for study: {}", studyId);
    
    UUID studyDesignId = autoInitService.ensureStudyDesignExists(studyId).join();
    
    // Get design progress from service
    DesignProgressResponseDto progress = designProgressService.getDesignProgress(studyDesignId);
    return ResponseEntity.ok(progress);
}
```

### Phase 2: Deprecate Endpoints in StudyQueryController ⚠️

**Mark as deprecated but keep for backward compatibility:**

```java
/**
 * @deprecated Use GET /api/clinops/study-design/by-study/{studyId}/arms instead
 * This endpoint will be removed in v2.0
 */
@Deprecated
@GetMapping("/{id}/arms")
public ResponseEntity<List<StudyArmResponseDto>> getStudyArms(@PathVariable String id) {
    log.warn("DEPRECATED: Use /api/clinops/study-design/by-study/{}/arms instead", id);
    // Keep implementation for now
}

/**
 * @deprecated Use GET /api/clinops/study-design/by-study/{studyId}/form-bindings instead
 * This endpoint will be removed in v2.0
 */
@Deprecated
@GetMapping("/{studyId}/form-bindings")
public ResponseEntity<List<FormAssignmentResponse>> getFormBindingsForStudy(...) {
    log.warn("DEPRECATED: Use /api/clinops/study-design/by-study/{}/form-bindings instead", studyId);
    // Keep implementation for now
}

/**
 * @deprecated Use GET /api/clinops/study-design/by-study/{studyId}/design-progress instead
 * This endpoint will be removed in v2.0
 */
@Deprecated
@GetMapping("/{id}/design-progress")
public ResponseEntity<DesignProgressResponseDto> getDesignProgress(@PathVariable String id) {
    log.warn("DEPRECATED: Use /api/clinops/study-design/by-study/{}/design-progress instead", id);
    // Keep implementation for now
}
```

### Phase 3: Update Frontend to Use New Endpoints 🔄

**Frontend Migration:**

```javascript
// OLD (deprecated)
GET /api/studies/123/arms
GET /api/studies/123/form-bindings
GET /api/studies/123/design-progress

// NEW (preferred)
GET /api/clinops/study-design/by-study/123/arms
GET /api/clinops/study-design/by-study/123/form-bindings
GET /api/clinops/study-design/by-study/123/design-progress

// OR if you have studyDesignId already:
GET /api/clinops/study-design/{studyDesignId}/arms
GET /api/clinops/study-design/{studyDesignId}/form-assignments
GET /api/clinops/study-design/{studyDesignId}/design-progress
```

### Phase 4: Remove Deprecated Endpoints 🗑️

**Version 2.0 - Breaking Change:**
- Remove deprecated endpoints from `StudyQueryController`
- Force all clients to use correct DDD paths

---

## Benefits of Separation

### 1. **Clear Domain Boundaries** 🎯
- Study Management focuses on study lifecycle
- Study Design focuses on design configuration
- No confusion about where to add new features

### 2. **Independent Evolution** 🚀
- Study Management can evolve independently
- Study Design can add complex design queries without cluttering study controller
- Easier to understand and maintain

### 3. **Better Testing** ✅
- Test study management queries separately
- Test study design queries separately
- Mock dependencies more easily

### 4. **Follows DDD Principles** 📚
- Bounded contexts properly separated
- Aggregates (Study vs StudyDesign) clearly distinguished
- CQRS query side properly organized

### 5. **API Discoverability** 🔍
- `/api/studies` → "I want to work with study metadata"
- `/api/clinops/study-design` → "I want to work with study design"
- Clear mental model for API consumers

---

## Updated Controller Responsibilities

### StudyQueryController (Study Management)

**Package:** `com.clinprecision.clinopsservice.studydesign.studymgmt.controller`  
**Base Path:** `/api/studies`

**Core Responsibilities:**
- ✅ Study CRUD metadata queries
- ✅ Study lifecycle status queries
- ✅ Study search and filtering
- ✅ Reference data (statuses, phases)
- ✅ Dashboard metrics
- ✅ Permission checks
- ✅ Study existence validation

**Dependencies:**
- `StudyQueryService` (studymgmt.service)
- `StudyDashboardService` (studymgmt.service)

**NOT Responsible For:**
- ❌ Study design structure (arms, visits, forms)
- ❌ Design progress tracking
- ❌ Form assignments
- ❌ Visit definitions

---

### StudyDesignQueryController (Study Design)

**Package:** `com.clinprecision.clinopsservice.studydesign.design.controller`  
**Base Path:** `/api/clinops/study-design`

**Core Responsibilities:**
- ✅ Study design structure queries (arms, visits, forms)
- ✅ Form assignments and bindings
- ✅ Visit definitions
- ✅ Design progress tracking
- ✅ Design validation queries
- ✅ Bridge endpoints for legacy study ID → studyDesignId resolution

**Dependencies:**
- `StudyDesignQueryService` (design.service)
- `StudyDesignAutoInitializationService` (design.service)
- `DesignProgressService` (design.service)

**NOT Responsible For:**
- ❌ Study lifecycle status
- ❌ Study metadata
- ❌ Dashboard metrics
- ❌ Study search

---

## Summary Table

| Concern | Current Controller | Should Be In | Action |
|---------|-------------------|--------------|--------|
| List all studies | StudyQueryController ✅ | StudyQueryController | **Keep** |
| Get study metadata | StudyQueryController ✅ | StudyQueryController | **Keep** |
| Study status | StudyQueryController ✅ | StudyQueryController | **Keep** |
| Study search | StudyQueryController ✅ | StudyQueryController | **Keep** |
| Reference data | StudyQueryController ✅ | StudyQueryController | **Keep** |
| Dashboard metrics | StudyQueryController ✅ | StudyQueryController | **Keep** |
| **Study arms** | StudyQueryController ❌ | StudyDesignQueryController | **Move via bridge** |
| **Form bindings** | StudyQueryController ❌ | StudyDesignQueryController | **Move via bridge** |
| **Design progress** | StudyQueryController ❌ | StudyDesignQueryController | **Move via bridge** |
| Complete design | StudyDesignQueryController ✅ | StudyDesignQueryController | **Keep** |
| Arms details | StudyDesignQueryController ✅ | StudyDesignQueryController | **Keep** |
| Visits | StudyDesignQueryController ✅ | StudyDesignQueryController | **Keep** |
| Form assignments | StudyDesignQueryController ✅ | StudyDesignQueryController | **Keep** |
| Protocol versions | StudyQueryController ⚠️ | ProtocolVersionQueryController | **Consider moving** |

---

## Implementation Checklist

### Immediate Actions (Do Now)

- [ ] Add bridge endpoints to `StudyDesignQueryController`:
  - [ ] `GET /api/clinops/study-design/by-study/{studyId}/arms`
  - [ ] `GET /api/clinops/study-design/by-study/{studyId}/form-bindings`
  - [ ] `GET /api/clinops/study-design/by-study/{studyId}/design-progress`

- [ ] Mark deprecated in `StudyQueryController`:
  - [ ] `GET /api/studies/{id}/arms` → Add `@Deprecated` annotation
  - [ ] `GET /api/studies/{id}/form-bindings` → Add `@Deprecated` annotation
  - [ ] `GET /api/studies/{id}/design-progress` → Add `@Deprecated` annotation

- [ ] Add deprecation warnings in logs
- [ ] Update API documentation (Swagger)

### Short-term (Next Sprint)

- [ ] Update frontend to use new endpoints
- [ ] Add integration tests for bridge endpoints
- [ ] Monitor usage of deprecated endpoints
- [ ] Update developer documentation

### Long-term (Version 2.0)

- [ ] Remove deprecated endpoints from `StudyQueryController`
- [ ] Consider creating `ProtocolVersionQueryController`
- [ ] Clean up imports and dependencies
- [ ] Final API cleanup

---

## Conclusion

**Current State:**
- `StudyQueryController` mixes Study Management and Study Design concerns
- Creates confusion about domain boundaries

**Desired State:**
- `StudyQueryController` = Pure Study Management (lifecycle, metadata, metrics)
- `StudyDesignQueryController` = Pure Study Design (arms, visits, forms, design progress)
- Clear separation of concerns following DDD principles

**Migration Strategy:**
1. Add bridge endpoints to `StudyDesignQueryController` (backward compatible)
2. Deprecate old endpoints in `StudyQueryController`
3. Update frontend gradually
4. Remove deprecated endpoints in v2.0

**Impact:**
- ✅ Minimal disruption (backward compatible via bridge endpoints)
- ✅ Clear domain boundaries
- ✅ Better maintainability
- ✅ Follows DDD/CQRS principles
