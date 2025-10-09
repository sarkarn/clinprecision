# Controller Separation - Protocol Version Endpoints

## Overview
This document clarifies the separation of responsibilities between Study and Protocol Version controllers to prevent duplicate endpoints and ensure clean architectural boundaries.

## Controller Responsibilities

### ✅ Protocol Version Controllers (Primary)

#### 1. **ProtocolVersionBridgeController** 
**Path Base:** `/api/study-versions`  
**Purpose:** Bridge layer for legacy Long ID → UUID conversion  
**Endpoints:**
- `PUT /api/study-versions/{versionId}/status` - Update protocol version status (BRIDGE)
  - Accepts: Long versionId (legacy database ID)
  - Resolves to: UUID aggregateUuid
  - Delegates to: ProtocolVersionCommandService

**When to use:** Frontend calls with legacy Long IDs for individual protocol version operations

---

#### 2. **ProtocolVersionCommandController**
**Path Base:** `/api/protocol-versions`  
**Purpose:** Pure DDD command operations with UUIDs  
**Endpoints:**
- `POST /api/protocol-versions` - Create version (DDD)
- `PUT /api/protocol-versions/{id}/status` - Change status (DDD)
- `PUT /api/protocol-versions/{id}/approve` - Approve version
- `PUT /api/protocol-versions/{id}/activate` - Activate version
- `PUT /api/protocol-versions/{id}` - Update version details
- `DELETE /api/protocol-versions/{id}` - Withdraw version
- `POST /api/protocol-versions/async` - Create version async

**When to use:** Direct DDD operations with UUID aggregate identifiers

---

#### 3. **ProtocolVersionQueryController**
**Path Base:** `/api/protocol-versions`  
**Purpose:** Pure DDD query operations with UUIDs  
**Endpoints:**
- `GET /api/protocol-versions/{id}` - Get version by UUID
- `GET /api/protocol-versions/study/{studyUuid}` - Get all versions for study
- `GET /api/protocol-versions/study/{studyUuid}/active` - Get active version
- `GET /api/protocol-versions/status/{status}` - Get versions by status
- `GET /api/protocol-versions/awaiting-approval` - Get versions awaiting approval

**When to use:** Query operations with UUID identifiers

---

### ✅ Study Controllers (Secondary - Study-Scoped Only)

#### 4. **StudyCommandController**
**Path Base:** `/api/studies`  
**Purpose:** Study aggregate operations  
**Protocol Version Endpoints:**
- `POST /api/studies/{studyId}/versions` - Create protocol version for a study (BRIDGE)
  - **Scope:** Study-scoped operation (creating version FOR a specific study)
  - **Bridge:** Accepts studyId (Long or UUID), resolves study aggregate, creates version
  - **Delegates to:** ProtocolVersionCommandService

**When to use:** Creating new protocol versions in the context of a specific study

**Dependencies:**
- `ProtocolVersionCommandService` - For creating versions

---

#### 5. **StudyQueryController**
**Path Base:** `/api/studies`  
**Purpose:** Study aggregate query operations  
**Protocol Version Endpoints:**
- `GET /api/studies/{studyId}/versions/history` - Get version history for study (BRIDGE)
- `GET /api/studies/{studyId}/versions` - Get versions for study (BRIDGE)
  - **Scope:** Study-scoped query (list versions FOR a specific study)
  - **Bridge:** Accepts studyId (Long or UUID), resolves study aggregate, lists versions
  - **Delegates to:** ProtocolVersionQueryService

**When to use:** Querying protocol versions in the context of a specific study

**Dependencies:**
- `ProtocolVersionQueryService` - For querying versions by study

---

## Endpoint Routing Rules

### ✅ Individual Protocol Version Operations
**Pattern:** `/api/study-versions/{versionId}/*` or `/api/protocol-versions/{id}/*`  
**Controller:** `ProtocolVersionBridgeController` (Long IDs) or `ProtocolVersionCommandController/QueryController` (UUIDs)  
**Examples:**
- `PUT /api/study-versions/1/status` → ProtocolVersionBridgeController (Bridge)
- `PUT /api/protocol-versions/{uuid}/status` → ProtocolVersionCommandController (DDD)
- `GET /api/protocol-versions/{uuid}` → ProtocolVersionQueryController (DDD)

### ✅ Study-Scoped Protocol Version Operations
**Pattern:** `/api/studies/{studyId}/versions/*`  
**Controller:** `StudyCommandController` (create) or `StudyQueryController` (list)  
**Examples:**
- `POST /api/studies/11/versions` → StudyCommandController (create version FOR study 11)
- `GET /api/studies/11/versions` → StudyQueryController (list versions FOR study 11)

---

## Architecture Principles

### 1. **Aggregate Boundaries**
- **Protocol Version aggregate operations** → ProtocolVersion controllers
- **Study aggregate operations** → Study controllers
- **Bridge endpoints** → Accept legacy IDs, resolve to UUIDs, delegate to DDD services

### 2. **Scope Distinction**
- **Individual version operations** (status change, approve, activate) → ProtocolVersion controllers
- **Study-scoped operations** (list versions FOR a study, create version FOR a study) → Study controllers (delegate to ProtocolVersion services)

### 3. **ID Resolution**
- **Legacy Long IDs** → Bridge controllers resolve to UUIDs
- **UUID aggregate IDs** → Pure DDD controllers use directly

### 4. **Service Delegation**
- Study controllers **delegate** to ProtocolVersion services
- Study controllers do **NOT** implement protocol version business logic
- Study controllers act as **orchestrators** for study-scoped operations

---

## Changes Made (2025-10-08)

### ❌ Removed Duplicate Endpoints

1. **Removed from StudyCommandController:**
   - `PUT /api/studies/study-versions/{versionId}/status` (line 768)
   - **Reason:** Wrong path prefix `/api/studies`, didn't match frontend call
   - **Replaced by:** `ProtocolVersionBridgeController.updateStatus()` at `/api/study-versions/{versionId}/status`

2. **Removed unused dependency from StudyCommandController:**
   - `ProtocolVersionQueryService` 
   - **Reason:** No longer needed after removing status update endpoint
   - **Still keeps:** `ProtocolVersionCommandService` (used by POST `/studies/{studyId}/versions`)

### ✅ Added New Controller

**ProtocolVersionBridgeController**
- Created to handle individual protocol version operations with legacy Long IDs
- Path: `/api/study-versions` (matches frontend expectations)
- Comprehensive logging with "BRIDGE:" prefix
- Detailed error handling with validation and internal error separation

---

## Testing Checklist

### Protocol Version Status Update
- [ ] Frontend calls `PUT /api/study-versions/1/status` with `{ "status": "UNDER_REVIEW" }`
- [ ] Request routed to `ProtocolVersionBridgeController.updateStatus()`
- [ ] Backend logs show "BRIDGE:" prefix messages
- [ ] Legacy ID 1 resolved to aggregate UUID
- [ ] Status change command sent to aggregate
- [ ] Event projected to read model
- [ ] Frontend receives success response

### Study-Scoped Operations
- [ ] `POST /api/studies/11/versions` creates new version for study 11
- [ ] `GET /api/studies/11/versions` lists all versions for study 11
- [ ] Both endpoints delegate to ProtocolVersion services

### UUID-Based Operations
- [ ] `PUT /api/protocol-versions/{uuid}/status` works with UUID
- [ ] `GET /api/protocol-versions/{uuid}` retrieves version by UUID
- [ ] No Long ID → UUID conversion needed

---

## Migration Notes

### For Frontend Developers
- **Status updates:** Use `/api/study-versions/{versionId}/status` with Long IDs
- **List versions:** Use `/api/studies/{studyId}/versions` to get versions for a study
- **Create versions:** Use `/api/studies/{studyId}/versions` to create version for a study

### For Backend Developers
- **Protocol version logic:** Implement in ProtocolVersion aggregate and services
- **Study-scoped operations:** Use Study controllers as orchestrators, delegate to ProtocolVersion services
- **Bridge pattern:** Use Bridge controllers to convert legacy IDs to UUIDs
- **Never:** Implement protocol version business logic directly in Study controllers

---

## Summary

| Operation | Endpoint | Controller | ID Type |
|-----------|----------|------------|---------|
| Update version status | `PUT /api/study-versions/{id}/status` | ProtocolVersionBridgeController | Long |
| Create version for study | `POST /api/studies/{id}/versions` | StudyCommandController | Long/UUID |
| List versions for study | `GET /api/studies/{id}/versions` | StudyQueryController | Long/UUID |
| Get version by UUID | `GET /api/protocol-versions/{id}` | ProtocolVersionQueryController | UUID |
| Change status (DDD) | `PUT /api/protocol-versions/{id}/status` | ProtocolVersionCommandController | UUID |

**Key Principle:** Protocol version operations → Protocol version controllers. Study-scoped operations → Study controllers (which delegate to protocol version services).
