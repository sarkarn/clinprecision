# Study Design Phase Backend Endpoint Analysis

## Date: October 6, 2025
## Context: CLINOPS_DDD_IMPL Branch - Study Design Migration to DDD/CQRS

---

## Executive Summary

The Study Design workflow has a dual architecture:
1. **DDD/CQRS Architecture**: `/api/clinops/study-design/{studyDesignId}/*` (UUID-based)
2. **Bridge/Legacy Architecture**: `/api/studies/{studyId}/*` (polymorphic UUID or numeric ID)

The frontend primarily uses the legacy endpoints for backward compatibility. This analysis identifies missing endpoints and implements bridge endpoints to prevent frontend errors during the DDD migration.

---

## Frontend Study Design Workflow

The Study Design workflow consists of these phases:

### Phase 1: Basic Information
- **Status**: ✅ Complete
- **Endpoints Used**: 
  - GET `/api/studies/{id}` (exists)
  - PUT `/api/studies/{id}` (exists)

### Phase 2: Study Arms Designer
- **Status**: ⚠️ **FIXED IN THIS UPDATE**
- **Frontend Calls**:
  - GET `/clinops-ws/api/studies/{id}/arms` ✅ (implemented previously)
  - POST `/studies/{id}/arms` ✅ **NEW - implemented**
  - PUT `/arms/{armId}` ✅ **NEW - implemented**
  - DELETE `/arms/{armId}` ✅ **NEW - implemented**

### Phase 3: Visit Schedule Designer  
- **Status**: ❌ **MISSING**
- **Frontend Calls**:
  - GET `/studies/{id}/visits` ❌ Not implemented
  - POST `/studies/{id}/visits` ❌ Not implemented
  - PUT `/visits/{visitId}` ❌ Not implemented
  - DELETE `/visits/{visitId}` ❌ Not implemented
  - PUT `/studies/{id}/visits` (batch save) ❌ Not implemented

### Phase 4: Form Binding Designer
- **Status**: ❌ **MISSING**
- **Frontend Calls**:
  - GET `/studies/{id}/form-bindings` ❌ Not implemented
  - POST `/studies/{id}/form-bindings` ❌ Not implemented
  - PUT `/form-bindings/{bindingId}` ❌ Not implemented
  - DELETE `/form-bindings/{bindingId}` ❌ Not implemented
  - PUT `/studies/{id}/form-bindings` (batch save) ❌ Not implemented

### Phase 5: Design Progress Tracking
- **Status**: ⚠️ **STUB IMPLEMENTED**
- **Frontend Calls**:
  - GET `/api/studies/{id}/design-progress` ✅ (stub - returns empty)
  - PUT `/api/studies/{id}/design-progress` ❌ Not implemented
  - POST `/api/studies/{id}/design-progress/initialize` ✅ (stub - returns 201)

### Phase 6: Study Publishing
- **Status**: ⚠️ **PARTIAL**
- **Frontend Calls**:
  - POST `/studies/{id}/validate` ❌ Not implemented
  - PATCH `/api/studies/{id}/publish` ⚠️ (returns 501 - not implemented)
  - PATCH `/api/studies/{id}/status` ✅ (partially working)

---

## DDD/CQRS Architecture Endpoints

These endpoints exist in `StudyDesignCommandController` and `StudyDesignQueryController` but use UUID-based paths:

### Query Endpoints (StudyDesignQueryController)
- GET `/api/clinops/study-design/{studyDesignId}` ✅
- GET `/api/clinops/study-design/{studyDesignId}/arms` ✅
- GET `/api/clinops/study-design/{studyDesignId}/arms/{armId}` ✅
- GET `/api/clinops/study-design/{studyDesignId}/visits` ✅
- GET `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` ✅
- GET `/api/clinops/study-design/{studyDesignId}/form-assignments` ✅
- GET `/api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}` ✅

### Command Endpoints (StudyDesignCommandController)
- POST `/api/clinops/study-design` ✅ (initialize)
- POST `/api/clinops/study-design/{studyDesignId}/arms` ✅
- PUT `/api/clinops/study-design/{studyDesignId}/arms/{armId}` ✅
- DELETE `/api/clinops/study-design/{studyDesignId}/arms/{armId}` ✅
- POST `/api/clinops/study-design/{studyDesignId}/visits` ✅
- PUT `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` ✅
- DELETE `/api/clinops/study-design/{studyDesignId}/visits/{visitId}` ✅
- POST `/api/clinops/study-design/{studyDesignId}/form-assignments` ✅
- PUT `/api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}` ✅
- DELETE `/api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}` ✅

**Issue**: Frontend uses `/studies/{id}/*` paths (numeric ID), not `/study-design/{uuid}/*` paths.

---

## Changes Implemented (This Session)

### 1. Fixed StudyArmEntity Schema Mismatch ✅
**File**: `StudyArmEntity.java`

**Problem**: Entity had soft delete fields (`deleted_at`, `deleted_by`, `deletion_reason`) that don't exist in database.

**Solution**: Commented out non-existent fields with TODO markers.

```java
// TODO: Add these columns to database schema when implementing full soft delete
// @Column(name = "deleted_at")
// private LocalDateTime deletedAt;
```

### 2. Created StudyArmRequestDto ✅
**File**: `study/dto/request/StudyArmRequestDto.java`

**Purpose**: Request DTO for creating/updating study arms via bridge endpoints.

**Fields**:
- `name` (required)
- `description`
- `type` (TREATMENT, PLACEBO, CONTROL, ACTIVE_COMPARATOR)
- `sequence` (required, positive)
- `plannedSubjects`

### 3. Added Bridge Endpoints to StudyCommandController ✅
**File**: `StudyCommandController.java`

**New Endpoints**:

#### POST `/api/studies/{id}/arms`
- Creates a study arm
- Supports polymorphic ID (UUID or numeric)
- Returns 201 Created with arm data
- Bridge implementation (writes directly to read model)

#### PUT `/api/arms/{armId}`
- Updates a study arm by ID
- Returns 200 OK with updated arm data
- Bridge implementation

#### DELETE `/api/arms/{armId}`
- Soft deletes a study arm
- Sets `is_deleted = true`
- Returns 204 No Content
- Bridge implementation

### 4. Added Service Methods to StudyCommandService ✅
**File**: `StudyCommandService.java`

**New Methods**:
- `getStudyEntityByUuid(UUID)` - Helper for controllers
- `createStudyArm(Long, StudyArmRequestDto)` - Creates arm in read model
- `updateStudyArm(Long, StudyArmRequestDto)` - Updates arm in read model
- `deleteStudyArm(Long)` - Soft deletes arm in read model

### 5. Exposed Helper Methods in StudyQueryService ✅
**File**: `StudyQueryService.java`

**Changes**:
- Made `toArmResponseDto()` public (was private)
- Added `getStudyArmRepository()` method for command service access

---

## Architecture Pattern: Bridge Implementation

The implemented endpoints follow a **Bridge Pattern** to support both:
1. **Current State**: Direct read model CRUD (temporary)
2. **Future State**: DDD commands to StudyDesignAggregate (TODO)

### Why Bridge Pattern?

1. **Backward Compatibility**: Frontend still uses `/studies/{id}/arms` paths
2. **Incremental Migration**: Allows frontend to work while DDD architecture evolves
3. **Zero Downtime**: No breaking changes to existing functionality
4. **Future-Ready**: Marked with TODOs for DDD command implementation

### Example Flow (Current):
```
Frontend → POST /studies/1/arms → StudyCommandController
  ↓
StudyCommandService.createStudyArm()
  ↓
StudyArmRepository.save() (Direct write to read model)
  ↓
Return StudyArmResponseDto
```

### Example Flow (Future DDD):
```
Frontend → POST /studies/1/arms → StudyCommandController
  ↓
CommandGateway.send(AddStudyArmCommand)
  ↓
StudyDesignAggregate.handle(AddStudyArmCommand)
  ↓
Emit StudyArmAddedEvent
  ↓
StudyDesignProjection updates read model
  ↓
Return success
```

---

## Still Missing / TODO

### 1. Visit Schedule Endpoints (High Priority)
Frontend expects these endpoints for the Visit Schedule Designer phase:

**Required Bridge Endpoints**:
- GET `/api/studies/{id}/visits`
- POST `/api/studies/{id}/visits`
- PUT `/api/visits/{visitId}`
- DELETE `/api/visits/{visitId}`
- PUT `/api/studies/{id}/visits` (batch save)

**Required DTOs**:
- `VisitRequestDto`
- `VisitResponseDto` (may already exist in studydesign package)

**Database Tables**:
- Check if `study_visits` or similar table exists
- Verify schema matches entity

### 2. Form Binding Endpoints (High Priority)
Frontend expects these for the Form Binding Designer phase:

**Required Bridge Endpoints**:
- GET `/api/studies/{id}/form-bindings`
- POST `/api/studies/{id}/form-bindings`
- PUT `/api/form-bindings/{bindingId}`
- DELETE `/api/form-bindings/{bindingId}`
- PUT `/api/studies/{id}/form-bindings` (batch save)

**Required DTOs**:
- `FormBindingRequestDto`
- `FormBindingResponseDto`

**Database Tables**:
- Check if `study_form_bindings` or similar exists

### 3. Study Validation Endpoint (Medium Priority)
**Endpoint**: POST `/api/studies/{id}/validate`

**Purpose**: Validate study completeness before publishing

**Returns**: Validation result with list of issues/warnings

### 4. Design Progress Update (Medium Priority)
**Endpoint**: PUT `/api/studies/{id}/design-progress`

**Purpose**: Update design progress tracking

**Currently**: Stub returns empty response

### 5. Study Publish Implementation (High Priority)
**Endpoint**: PATCH `/api/studies/{id}/publish`

**Current State**: Returns 501 Not Implemented

**Required**: Implement `activateStudy()` in StudyCommandService

---

## Database Schema Verification Needed

### Study Arms Table ✅ **VERIFIED**
```sql
CREATE TABLE study_arms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(255) NULL,
    arm_uuid VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'TREATMENT',
    sequence_number INTEGER NOT NULL,
    planned_subjects INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    study_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    ...
);
```

### Study Visits Table ❓ **NEEDS VERIFICATION**
Expected structure:
```sql
CREATE TABLE study_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_uuid VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visit_type VARCHAR(50), -- SCREENING, BASELINE, TREATMENT, FOLLOW_UP
    visit_number INTEGER,
    day_offset INTEGER,
    window_before INTEGER,
    window_after INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    arm_id BIGINT, -- NULL for general visits
    study_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ...
);
```

### Form Bindings Table ❓ **NEEDS VERIFICATION**
Expected structure:
```sql
CREATE TABLE study_form_bindings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    sequence_order INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ...
);
```

---

## Testing Recommendations

### 1. Test Study Arms CRUD (Immediate)
```bash
# Get study arms
curl http://localhost:8083/clinops-ws/api/studies/1/arms

# Create study arm
curl -X POST http://localhost:8083/api/studies/1/arms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Treatment Arm",
    "description": "Primary treatment group",
    "type": "TREATMENT",
    "sequence": 1,
    "plannedSubjects": 100
  }'

# Update study arm
curl -X PUT http://localhost:8083/api/arms/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Treatment Arm Updated",
    "description": "Updated description",
    "type": "TREATMENT",
    "sequence": 1,
    "plannedSubjects": 150
  }'

# Delete study arm
curl -X DELETE http://localhost:8083/api/arms/1
```

### 2. Frontend Testing (Next Step)
1. Navigate to Study Design → Study Arms page
2. Click "Add Arm" button
3. Fill in arm details
4. Save and verify arm appears in list
5. Edit existing arm
6. Delete arm

### 3. Visit Schedule Testing (After Implementation)
Similar CRUD testing for visits once endpoints are implemented.

---

## Priority Implementation Order

### Priority 1: **Visit Schedule Endpoints** ⚠️ URGENT
- Users need this to complete Study Design phase
- Follow same pattern as Study Arms implementation
- Verify `study_visits` table schema first

### Priority 2: **Form Binding Endpoints** ⚠️ URGENT  
- Required for complete Study Design workflow
- Check if forms management is already complete

### Priority 3: **Study Publish Implementation** 🔴 HIGH
- Currently blocked (returns 501)
- Frontend cannot transition study to ACTIVE status

### Priority 4: **Design Progress Tracking** 🟡 MEDIUM
- Currently stubbed
- Would help users track completion percentage

### Priority 5: **Validation Endpoint** 🟡 MEDIUM
- Pre-publish validation
- Would improve UX by catching issues early

---

## Code Quality Notes

### Strengths ✅
1. **Polymorphic ID Support**: All bridge endpoints accept UUID or numeric ID
2. **Consistent Logging**: All operations logged at INFO level
3. **Error Handling**: Try-catch blocks with appropriate HTTP status codes
4. **Documentation**: Comprehensive Javadoc with architecture notes
5. **TODO Markers**: Clear markers for future DDD implementation

### Technical Debt 🔧
1. **Direct Read Model Access**: Bridge implementations bypass DDD commands
2. **Missing Security Context**: Using hardcoded "system" user
3. **No Transaction Consistency**: Commands don't emit events
4. **Missing Validation**: No business rule validation in bridge methods
5. **Soft Delete Incomplete**: Database missing `deleted_at` columns

### Refactoring Opportunities 🔄
1. Extract mapper logic to dedicated `StudyArmMapper` class
2. Create `StudyArmCommandService` for arm-specific operations
3. Implement proper event sourcing for arm operations
4. Add integration tests for bridge endpoints
5. Add API documentation (OpenAPI/Swagger)

---

## Summary

### ✅ What Works Now
- Study basic information CRUD
- Study arms **GET** endpoint (polymorphic ID)
- Study arms **POST** endpoint (create) ← **NEW**
- Study arms **PUT** endpoint (update) ← **NEW**
- Study arms **DELETE** endpoint (soft delete) ← **NEW**
- Design progress **GET** (stub)
- Design progress **initialize** (stub)

### ❌ What's Still Missing
- Visit schedule CRUD endpoints
- Form binding CRUD endpoints
- Study validation endpoint
- Study publish implementation (activateStudy)
- Design progress update endpoint

### 🎯 Next Steps
1. **Immediate**: Test the new study arms endpoints in frontend
2. **Next Session**: Implement visit schedule bridge endpoints
3. **Following Session**: Implement form binding bridge endpoints
4. **After That**: Replace bridge implementations with proper DDD commands

---

## References

- DDD Command Controllers: `StudyDesignCommandController.java`
- DDD Query Controllers: `StudyDesignQueryController.java`
- Bridge Command Controller: `StudyCommandController.java`
- Bridge Query Controller: `StudyQueryController.java`
- Frontend Service: `StudyDesignService.js`
- Database Schema: `consolidated_schema.sql`

---

**Document Version**: 1.0  
**Last Updated**: October 6, 2025  
**Author**: DDD Migration Team
