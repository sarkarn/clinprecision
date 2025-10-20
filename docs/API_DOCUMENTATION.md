# ClinPrecision REST API Documentation

**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Migration Status:** Complete (Modules 1.1-1.6)  
**Base URL:** `http://localhost:8080` (Development)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Versioning](#api-versioning)
4. [Study Management APIs](#study-management-apis)
5. [Protocol Management APIs](#protocol-management-apis)
6. [Study Design APIs](#study-design-apis)
7. [Form Management APIs](#form-management-apis)
8. [Document Management APIs](#document-management-apis)
9. [Metadata Management APIs](#metadata-management-apis)
10. [Study Operations APIs](#study-operations-apis)
11. [Response Formats](#response-formats)
12. [Error Handling](#error-handling)
13. [Deprecation Policy](#deprecation-policy)

---

## Overview

The ClinPrecision REST API provides comprehensive endpoints for managing clinical trial studies, protocols, study designs, forms, documents, and operational data. All APIs follow RESTful conventions and return JSON responses.

### Key Features

- **Versioned APIs:** All endpoints use `/api/v1/` for future-proof versioning
- **Dual URL Support:** Legacy URLs maintained for backward compatibility (6-month deprecation period)
- **Consistent Patterns:** Standardized URL structure across all modules
- **Security:** JWT-based authentication for protected endpoints
- **CORS Enabled:** Cross-origin requests supported

### API Structure

```
/api/v1/
├── study-management/          # Study lifecycle management
│   ├── studies/               # Study CRUD operations
│   ├── status/                # Automated status computation
│   └── query/                 # Study queries
│
├── protocol-management/       # Protocol versioning
│   ├── versions/              # Protocol version CRUD
│   └── bridge/                # Protocol-study bridging
│
├── study-design/              # Study design configuration
│   ├── designs/               # Design CRUD operations
│   ├── arms/                  # Study arms management
│   ├── form-bindings/         # Form-visit bindings
│   ├── form-definitions/      # Form structure definitions
│   ├── form-templates/        # Reusable form templates
│   ├── documents/             # Study documents
│   └── metadata/
│       └── codelists/         # Standardized code lists
│
└── study-operations/          # Operational runtime features
    └── visit-config/
        └── unscheduled/       # Unscheduled visit configuration
```

---

## Authentication

### JWT Bearer Token

Most endpoints require authentication via JWT Bearer token.

**Request Header:**
```http
Authorization: Bearer <your-jwt-token>
```

**Login Endpoint:**
```http
POST /users-ws/users/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "123",
  "email": "user@example.com"
}
```

### Public Endpoints

The following endpoints do not require authentication:
- `POST /users-ws/users/login` - User login
- `GET /api/v1/study-design/metadata/codelists/simple/{category}` - Public code lists (if configured)

---

## API Versioning

### Current Version: v1

All production endpoints use the `/api/v1/` prefix:

```
✅ NEW: /api/v1/study-management/studies
❌ OLD: /api/studies (deprecated, will sunset April 2026)
```

### Deprecation Headers

Legacy endpoints return deprecation information:

```http
Deprecation: true
Sunset: Wed, 01 Apr 2026 00:00:00 GMT
Link: </api/v1/study-management/studies>; rel="successor-version"
X-API-Warn: This endpoint is deprecated. Use /api/v1/study-management/studies
```

---

## Study Management APIs

**Base Path:** `/api/v1/study-management/studies`  
**Legacy Path:** `/api/studies` (deprecated)

### Study CRUD Operations

#### 1. Create Study

```http
POST /api/v1/study-management/studies
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyCode": "STUDY-001",
  "studyName": "Phase III Clinical Trial",
  "therapeuticArea": "Oncology",
  "indication": "Breast Cancer",
  "phase": "PHASE_III",
  "sponsor": "Acme Pharma",
  "principalInvestigator": "Dr. Jane Smith"
}
```

**Response:** `201 Created`
```json
{
  "studyId": "123e4567-e89b-12d3-a456-426614174000",
  "studyCode": "STUDY-001",
  "studyName": "Phase III Clinical Trial",
  "status": "DRAFT",
  "createdAt": "2025-10-19T10:30:00Z",
  "createdBy": "user@example.com"
}
```

#### 2. Get Study by ID

```http
GET /api/v1/study-management/studies/{studyId}
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "studyId": "123e4567-e89b-12d3-a456-426614174000",
  "studyCode": "STUDY-001",
  "studyName": "Phase III Clinical Trial",
  "therapeuticArea": "Oncology",
  "indication": "Breast Cancer",
  "phase": "PHASE_III",
  "status": "ACTIVE",
  "sponsor": "Acme Pharma",
  "principalInvestigator": "Dr. Jane Smith",
  "startDate": "2025-11-01",
  "estimatedCompletionDate": "2027-11-01",
  "protocolVersionId": "proto-v1-uuid",
  "createdAt": "2025-10-19T10:30:00Z",
  "updatedAt": "2025-10-19T15:45:00Z"
}
```

#### 3. Update Study

```http
PUT /api/v1/study-management/studies/{studyId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyName": "Phase III Clinical Trial - Updated",
  "status": "ACTIVE"
}
```

**Response:** `200 OK`

#### 4. List All Studies

```http
GET /api/v1/study-management/studies
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `status` (optional): Filter by status (DRAFT, ACTIVE, SUSPENDED, COMPLETED)
- `phase` (optional): Filter by phase (PHASE_I, PHASE_II, PHASE_III, PHASE_IV)

**Response:** `200 OK`
```json
{
  "content": [
    {
      "studyId": "123e4567-e89b-12d3-a456-426614174000",
      "studyCode": "STUDY-001",
      "studyName": "Phase III Clinical Trial",
      "status": "ACTIVE"
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "page": 0,
  "size": 20
}
```

#### 5. Update Study Details

```http
PUT /api/v1/study-management/studies/{studyId}/details
Authorization: Bearer <token>
Content-Type: application/json

{
  "therapeuticArea": "Oncology",
  "indication": "Triple-Negative Breast Cancer",
  "estimatedEnrollment": 500
}
```

**Response:** `200 OK`

### Study Lifecycle Operations

#### 6. Publish Study

```http
POST /api/v1/study-management/studies/{studyId}/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Study design finalized",
  "effectiveDate": "2025-11-01"
}
```

**Response:** `200 OK`

#### 7. Suspend Study

```http
POST /api/v1/study-management/studies/{studyId}/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Safety review in progress",
  "suspensionDate": "2025-10-20"
}
```

**Response:** `200 OK`

#### 8. Resume Study

```http
POST /api/v1/study-management/studies/{studyId}/resume
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Safety review completed",
  "resumptionDate": "2025-10-25"
}
```

**Response:** `200 OK`

#### 9. Complete Study

```http
POST /api/v1/study-management/studies/{studyId}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completionDate": "2027-11-01",
  "finalReport": "All endpoints met"
}
```

**Response:** `200 OK`

#### 10. Terminate Study

```http
POST /api/v1/study-management/studies/{studyId}/terminate
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Early termination due to efficacy",
  "terminationDate": "2026-06-15"
}
```

**Response:** `200 OK`

#### 11. Withdraw Study

```http
POST /api/v1/study-management/studies/{studyId}/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Sponsor decision",
  "withdrawalDate": "2025-12-01"
}
```

**Response:** `200 OK`

### Study Status Management

**Base Path:** `/api/v1/study-management/status`

#### 12. Compute Study Status

```http
POST /api/v1/study-management/status/{studyId}/compute
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "studyId": "123e4567-e89b-12d3-a456-426614174000",
  "computedStatus": "ACTIVE",
  "previousStatus": "DRAFT",
  "statusChangeReason": "All required fields completed",
  "computedAt": "2025-10-19T16:00:00Z"
}
```

#### 13. Batch Compute Status

```http
POST /api/v1/study-management/status/batch-compute
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyIds": [
    "study-uuid-1",
    "study-uuid-2",
    "study-uuid-3"
  ]
}
```

**Response:** `200 OK`
```json
{
  "totalProcessed": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "studyId": "study-uuid-1",
      "status": "ACTIVE",
      "success": true
    }
  ]
}
```

#### 14. Get Status History

```http
GET /api/v1/study-management/status/{studyId}/history
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `fromDate` (optional): Start date (ISO 8601)
- `toDate` (optional): End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "studyId": "123e4567-e89b-12d3-a456-426614174000",
  "history": [
    {
      "status": "ACTIVE",
      "changedAt": "2025-10-19T16:00:00Z",
      "changedBy": "user@example.com",
      "reason": "Study published"
    },
    {
      "status": "DRAFT",
      "changedAt": "2025-10-19T10:30:00Z",
      "changedBy": "user@example.com",
      "reason": "Study created"
    }
  ]
}
```

#### 15. Get Recent Status Changes

```http
GET /api/v1/study-management/status/recent-changes
Authorization: Bearer <token>
```

**Query Parameters:**
- `hours` (optional): Lookback hours (default: 24)
- `limit` (optional): Max records (default: 100)

**Response:** `200 OK`

#### 16. Get Frequent Status Changes

```http
GET /api/v1/study-management/status/frequent-changes
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 17. Get Status Errors

```http
GET /api/v1/study-management/status/errors
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 18. Get System Health

```http
GET /api/v1/study-management/status/system-health
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "HEALTHY",
  "totalStudies": 42,
  "activeStudies": 18,
  "draftStudies": 10,
  "completedStudies": 8,
  "errors": 0,
  "lastComputationTime": "2025-10-19T16:00:00Z"
}
```

#### 19. Refresh Study Status

```http
POST /api/v1/study-management/status/{studyId}/refresh
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 20. Get Status Statistics

```http
GET /api/v1/study-management/status/statistics
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "totalStudies": 42,
  "byStatus": {
    "DRAFT": 10,
    "ACTIVE": 18,
    "SUSPENDED": 2,
    "COMPLETED": 8,
    "TERMINATED": 3,
    "WITHDRAWN": 1
  },
  "byPhase": {
    "PHASE_I": 5,
    "PHASE_II": 12,
    "PHASE_III": 20,
    "PHASE_IV": 5
  }
}
```

### Study Query Operations

**Base Path:** `/api/v1/study-management/query`

#### 21. Query Studies

```http
GET /api/v1/study-management/query?status=ACTIVE&phase=PHASE_III
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Study status filter
- `phase`: Study phase filter
- `therapeuticArea`: Therapeutic area filter
- `sponsor`: Sponsor organization filter
- `fromDate`: Creation date from
- `toDate`: Creation date to

**Response:** `200 OK`

---

## Protocol Management APIs

**Base Path:** `/api/v1/protocol-management/versions`  
**Legacy Path:** `/api/protocol-versions` (deprecated)

### Protocol Version CRUD

#### 22. Create Protocol Version

```http
POST /api/v1/protocol-management/versions
Authorization: Bearer <token>
Content-Type: application/json

{
  "protocolCode": "PROTO-001",
  "version": "1.0",
  "effectiveDate": "2025-11-01",
  "title": "Phase III Protocol for Breast Cancer Treatment",
  "objectives": "Primary: Overall survival; Secondary: Progression-free survival",
  "eligibilityCriteria": "Age 18-75, confirmed diagnosis..."
}
```

**Response:** `201 Created`

#### 23. Get Protocol Version by ID

```http
GET /api/v1/protocol-management/versions/{versionId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 24. Update Protocol Version

```http
PUT /api/v1/protocol-management/versions/{versionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "version": "1.1",
  "title": "Updated Protocol Title",
  "amendmentReason": "Clarification of inclusion criteria"
}
```

**Response:** `200 OK`

#### 25. Delete Protocol Version

```http
DELETE /api/v1/protocol-management/versions/{versionId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 26. List Protocol Versions

```http
GET /api/v1/protocol-management/versions
Authorization: Bearer <token>
```

**Query Parameters:**
- `protocolCode` (optional): Filter by protocol code
- `status` (optional): Filter by status (DRAFT, APPROVED, ARCHIVED)

**Response:** `200 OK`

#### 27. Get Protocol by Code and Version

```http
GET /api/v1/protocol-management/versions/by-code/{protocolCode}/{version}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 28. Get Latest Protocol Version

```http
GET /api/v1/protocol-management/versions/latest/{protocolCode}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 29. Approve Protocol Version

```http
POST /api/v1/protocol-management/versions/{versionId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approver": "Dr. John Doe",
  "approvalDate": "2025-10-20",
  "comments": "Approved for implementation"
}
```

**Response:** `200 OK`

#### 30. Archive Protocol Version

```http
POST /api/v1/protocol-management/versions/{versionId}/archive
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Protocol-Study Bridge

**Base Path:** `/api/v1/protocol-management/bridge`  
**Legacy Path:** `/api/protocol-versions/bridge` (deprecated)

#### 31. Link Protocol to Study

```http
POST /api/v1/protocol-management/bridge/{studyId}/link/{protocolVersionId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 32. Unlink Protocol from Study

```http
DELETE /api/v1/protocol-management/bridge/{studyId}/unlink
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 33. Get Study's Protocol

```http
GET /api/v1/protocol-management/bridge/{studyId}/protocol
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 34. Get Studies Using Protocol

```http
GET /api/v1/protocol-management/bridge/protocol/{protocolVersionId}/studies
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Study Design APIs

**Base Path:** `/api/v1/study-design`  
**Legacy Path:** `/api/clinops/study-design` (deprecated)

### Study Design CRUD

**Path:** `/api/v1/study-design/designs`

#### 35. Create Study Design

```http
POST /api/v1/study-design/designs
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyId": "study-uuid",
  "designType": "PARALLEL",
  "numberOfArms": 2,
  "randomizationRatio": "1:1",
  "blindingType": "DOUBLE_BLIND",
  "visitSchedule": {
    "screeningPeriod": 14,
    "treatmentPeriod": 180,
    "followUpPeriod": 90
  }
}
```

**Response:** `201 Created`

#### 36. Get Study Design by ID

```http
GET /api/v1/study-design/designs/{designId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 37. Update Study Design

```http
PUT /api/v1/study-design/designs/{designId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "numberOfArms": 3,
  "randomizationRatio": "1:1:1"
}
```

**Response:** `200 OK`

#### 38. Delete Study Design

```http
DELETE /api/v1/study-design/designs/{designId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 39. Get Design by Study ID

```http
GET /api/v1/study-design/designs/study/{studyId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 40. List All Designs

```http
GET /api/v1/study-design/designs
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 41. Publish Study Design

```http
POST /api/v1/study-design/designs/{designId}/publish
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 42. Clone Study Design

```http
POST /api/v1/study-design/designs/{designId}/clone
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetStudyId": "new-study-uuid",
  "includeArms": true,
  "includeForms": true
}
```

**Response:** `201 Created`

### Study Arms Management

**Path:** `/api/v1/study-design/arms`

#### 43. Create Study Arm

```http
POST /api/v1/study-design/arms
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyDesignId": "design-uuid",
  "armCode": "ARM-001",
  "armName": "Treatment Arm",
  "armType": "EXPERIMENTAL",
  "description": "Experimental drug + Standard of Care",
  "plannedEnrollment": 250
}
```

**Response:** `201 Created`

#### 44. Get Study Arm by ID

```http
GET /api/v1/study-design/arms/{armId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 45. Update Study Arm

```http
PUT /api/v1/study-design/arms/{armId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "armName": "Treatment Arm - Updated",
  "plannedEnrollment": 300
}
```

**Response:** `200 OK`

#### 46. Delete Study Arm

```http
DELETE /api/v1/study-design/arms/{armId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 47. Get Arms by Design ID

```http
GET /api/v1/study-design/arms/design/{designId}
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "arms": [
    {
      "armId": "arm-uuid-1",
      "armCode": "ARM-001",
      "armName": "Treatment Arm",
      "armType": "EXPERIMENTAL",
      "plannedEnrollment": 250
    },
    {
      "armId": "arm-uuid-2",
      "armCode": "ARM-002",
      "armName": "Control Arm",
      "armType": "CONTROL",
      "plannedEnrollment": 250
    }
  ]
}
```

#### 48. Update Arm Order

```http
PUT /api/v1/study-design/arms/{armId}/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "newOrder": 2
}
```

**Response:** `200 OK`

### Form Bindings

**Path:** `/api/v1/study-design/form-bindings`  
**Legacy Path:** `/api/form-bindings` (deprecated)

#### 49. Create Form Binding

```http
POST /api/v1/study-design/form-bindings
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyDesignId": "design-uuid",
  "visitId": "visit-uuid",
  "formDefinitionId": "form-def-uuid",
  "isRequired": true,
  "displayOrder": 1,
  "completionWindow": 7
}
```

**Response:** `201 Created`

#### 50. Get Form Binding by ID

```http
GET /api/v1/study-design/form-bindings/{bindingId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 51. Update Form Binding

```http
PUT /api/v1/study-design/form-bindings/{bindingId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 52. Delete Form Binding

```http
DELETE /api/v1/study-design/form-bindings/{bindingId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 53. Get Bindings by Design ID

```http
GET /api/v1/study-design/form-bindings/design/{designId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 54. Get Bindings by Visit ID

```http
GET /api/v1/study-design/form-bindings/visit/{visitId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 55. Bulk Create Form Bindings

```http
POST /api/v1/study-design/form-bindings/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyDesignId": "design-uuid",
  "bindings": [
    {
      "visitId": "visit-1",
      "formDefinitionId": "form-1",
      "isRequired": true
    },
    {
      "visitId": "visit-2",
      "formDefinitionId": "form-2",
      "isRequired": false
    }
  ]
}
```

**Response:** `201 Created`

---

## Form Management APIs

### Form Definitions

**Base Path:** `/api/v1/study-design/form-definitions`  
**Legacy Path:** `/api/form-definitions` (deprecated)

#### 56. Create Form Definition

```http
POST /api/v1/study-design/form-definitions
Authorization: Bearer <token>
Content-Type: application/json

{
  "formCode": "DEMO-001",
  "formName": "Demographics",
  "formVersion": "1.0",
  "formType": "DATA_COLLECTION",
  "sections": [
    {
      "sectionCode": "SEC-01",
      "sectionName": "Basic Information",
      "fields": [
        {
          "fieldCode": "AGE",
          "fieldName": "Age",
          "fieldType": "NUMBER",
          "isRequired": true,
          "validation": {
            "min": 18,
            "max": 75
          }
        }
      ]
    }
  ]
}
```

**Response:** `201 Created`

#### 57. Get Form Definition by ID

```http
GET /api/v1/study-design/form-definitions/{formId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 58. Update Form Definition

```http
PUT /api/v1/study-design/form-definitions/{formId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 59. Delete Form Definition

```http
DELETE /api/v1/study-design/form-definitions/{formId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 60. List Form Definitions

```http
GET /api/v1/study-design/form-definitions
Authorization: Bearer <token>
```

**Query Parameters:**
- `formType` (optional): Filter by type (DATA_COLLECTION, ASSESSMENT, DIARY)
- `status` (optional): Filter by status (DRAFT, ACTIVE, ARCHIVED)

**Response:** `200 OK`

#### 61. Get Form by Code and Version

```http
GET /api/v1/study-design/form-definitions/code/{formCode}/version/{version}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 62. Publish Form Definition

```http
POST /api/v1/study-design/form-definitions/{formId}/publish
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 63. Clone Form Definition

```http
POST /api/v1/study-design/form-definitions/{formId}/clone
Authorization: Bearer <token>
Content-Type: application/json

{
  "newFormCode": "DEMO-002",
  "newVersion": "1.0"
}
```

**Response:** `201 Created`

#### 64. Validate Form Definition

```http
POST /api/v1/study-design/form-definitions/{formId}/validate
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Field 'GENDER' has no default value"
  ]
}
```

#### 65. Get Form Definition Schema

```http
GET /api/v1/study-design/form-definitions/{formId}/schema
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 66. Import Form Definition

```http
POST /api/v1/study-design/form-definitions/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "source": "ODM",
  "data": "<?xml version='1.0'?>..."
}
```

**Response:** `201 Created`

#### 67. Export Form Definition

```http
GET /api/v1/study-design/form-definitions/{formId}/export?format=JSON
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: Export format (JSON, XML, ODM, PDF)

**Response:** `200 OK`

### Form Templates

**Base Path:** `/api/v1/study-design/form-templates`  
**Legacy Path:** `/api/form-templates` (deprecated)

#### 68. Create Form Template

```http
POST /api/v1/study-design/form-templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateCode": "TMPL-DEMO",
  "templateName": "Demographics Template",
  "category": "BASELINE",
  "isPublic": true,
  "structure": {
    "sections": [...]
  }
}
```

**Response:** `201 Created`

#### 69. Get Form Template by ID

```http
GET /api/v1/study-design/form-templates/{templateId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 70. Update Form Template

```http
PUT /api/v1/study-design/form-templates/{templateId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 71. Delete Form Template

```http
DELETE /api/v1/study-design/form-templates/{templateId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 72. List Form Templates

```http
GET /api/v1/study-design/form-templates
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): Filter by category
- `isPublic` (optional): Filter by public/private

**Response:** `200 OK`

#### 73. Get Template by Code

```http
GET /api/v1/study-design/form-templates/code/{templateCode}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 74. List Public Templates

```http
GET /api/v1/study-design/form-templates/public
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 75. List Templates by Category

```http
GET /api/v1/study-design/form-templates/category/{category}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 76. Create Form from Template

```http
POST /api/v1/study-design/form-templates/{templateId}/create-form
Authorization: Bearer <token>
Content-Type: application/json

{
  "formCode": "DEMO-001",
  "formVersion": "1.0",
  "customizations": {
    "addField": "CUSTOM_FIELD_1"
  }
}
```

**Response:** `201 Created`

#### 77. Preview Template

```http
GET /api/v1/study-design/form-templates/{templateId}/preview
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 78. Publish Template

```http
POST /api/v1/study-design/form-templates/{templateId}/publish
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 79. Archive Template

```http
POST /api/v1/study-design/form-templates/{templateId}/archive
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 80. Get Template Usage Statistics

```http
GET /api/v1/study-design/form-templates/{templateId}/usage
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "templateId": "template-uuid",
  "totalUsage": 15,
  "usedInStudies": [
    {
      "studyId": "study-1",
      "studyCode": "STUDY-001",
      "usageCount": 3
    }
  ]
}
```

---

## Document Management APIs

**Base Path:** `/api/v1/study-design/documents`  
**Legacy Path:** `/api/v1/documents` (deprecated)

#### 81. Upload Document

```http
POST /api/v1/study-design/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="protocol.pdf"
Content-Type: application/pdf

[Binary file data]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="metadata"

{
  "studyId": "study-uuid",
  "documentType": "PROTOCOL",
  "version": "1.0",
  "description": "Study Protocol Version 1.0"
}
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Response:** `201 Created`
```json
{
  "documentId": "doc-uuid",
  "fileName": "protocol.pdf",
  "documentType": "PROTOCOL",
  "version": "1.0",
  "uploadedAt": "2025-10-19T10:00:00Z",
  "uploadedBy": "user@example.com",
  "fileSize": 2048576,
  "url": "/api/v1/study-design/documents/doc-uuid/download"
}
```

#### 82. Get Document by ID

```http
GET /api/v1/study-design/documents/{documentId}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 83. Update Document Metadata

```http
PUT /api/v1/study-design/documents/{documentId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "version": "1.1",
  "description": "Updated protocol with amendments"
}
```

**Response:** `200 OK`

#### 84. Delete Document

```http
DELETE /api/v1/study-design/documents/{documentId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 85. Download Document

```http
GET /api/v1/study-design/documents/{documentId}/download
Authorization: Bearer <token>
```

**Response:** `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="protocol.pdf"

[Binary file data]
```

#### 86. List Documents by Study

```http
GET /api/v1/study-design/documents/study/{studyId}
Authorization: Bearer <token>
```

**Query Parameters:**
- `documentType` (optional): Filter by type (PROTOCOL, ICF, MANUAL, REPORT)
- `fromDate` (optional): Uploaded after date
- `toDate` (optional): Uploaded before date

**Response:** `200 OK`

#### 87. List All Documents

```http
GET /api/v1/study-design/documents
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 88. Get Documents by Type

```http
GET /api/v1/study-design/documents/type/{documentType}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 89. Get Document Versions

```http
GET /api/v1/study-design/documents/{documentId}/versions
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 90. Search Documents

```http
GET /api/v1/study-design/documents/search?query=protocol&studyId=study-uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `query`: Search term
- `studyId` (optional): Filter by study
- `documentType` (optional): Filter by type

**Response:** `200 OK`

#### 91. Get Document Preview

```http
GET /api/v1/study-design/documents/{documentId}/preview
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 92. Share Document

```http
POST /api/v1/study-design/documents/{documentId}/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user-1", "user-2"],
  "expiryDate": "2025-12-31",
  "permissions": ["VIEW", "DOWNLOAD"]
}
```

**Response:** `200 OK`

#### 93. Get Document Access Log

```http
GET /api/v1/study-design/documents/{documentId}/access-log
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 94. Archive Document

```http
POST /api/v1/study-design/documents/{documentId}/archive
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Metadata Management APIs

**Base Path:** `/api/v1/study-design/metadata/codelists`  
**Legacy Path:** `/api/admin/codelists` (deprecated)

### Code Lists

#### 95. Get Simple Code List

```http
GET /api/v1/study-design/metadata/codelists/simple/{category}
Authorization: Bearer <token>
```

**Path Parameters:**
- `category`: Code list category (gender, race, ethnicity, country, etc.)

**Response:** `200 OK`
```json
{
  "category": "gender",
  "codes": [
    {
      "code": "M",
      "label": "Male"
    },
    {
      "code": "F",
      "label": "Female"
    },
    {
      "code": "O",
      "label": "Other"
    }
  ]
}
```

#### 96. Get Code List by Category and Code

```http
GET /api/v1/study-design/metadata/codelists/{category}/{code}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 97. Validate Code

```http
GET /api/v1/study-design/metadata/codelists/validate/{category}/{code}
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "category": "gender",
  "code": "M",
  "isValid": true,
  "label": "Male"
}
```

#### 98. Get Categories

```http
GET /api/v1/study-design/metadata/codelists/categories
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "categories": [
    "gender",
    "race",
    "ethnicity",
    "country",
    "language",
    "maritalStatus",
    "adverseEventSeverity",
    "adverseEventOutcome"
  ]
}
```

#### 99. Get Code Lists by Category

```http
GET /api/v1/study-design/metadata/codelists/{category}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 100. Get Code List by ID

```http
GET /api/v1/study-design/metadata/codelists/id/{id}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 101. Create Code List

```http
POST /api/v1/study-design/metadata/codelists
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "custom_category",
  "code": "VAL1",
  "label": "Value 1",
  "description": "Custom value description",
  "sortOrder": 1,
  "isActive": true,
  "effectiveDate": "2025-10-19",
  "expiryDate": null
}
```

**Response:** `201 Created`

#### 102. Update Code List

```http
PUT /api/v1/study-design/metadata/codelists/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Updated Value 1",
  "description": "Updated description"
}
```

**Response:** `200 OK`

#### 103. Delete Code List (Soft Delete)

```http
DELETE /api/v1/study-design/metadata/codelists/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 104. Hard Delete Code List

```http
DELETE /api/v1/study-design/metadata/codelists/{id}/hard
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### 105. Search Code Lists

```http
GET /api/v1/study-design/metadata/codelists/search?query=male&category=gender
Authorization: Bearer <token>
```

**Query Parameters:**
- `query`: Search term
- `category` (optional): Filter by category

**Response:** `200 OK`

#### 106. Get Child Code Lists

```http
GET /api/v1/study-design/metadata/codelists/{parentId}/children
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 107. Get Expiring Code Lists

```http
GET /api/v1/study-design/metadata/codelists/expiring?days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `days`: Number of days ahead to check (default: 30)

**Response:** `200 OK`

#### 108. Update Sort Order

```http
PUT /api/v1/study-design/metadata/codelists/{category}/sort-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "sortOrder": [
    {"code": "M", "order": 1},
    {"code": "F", "order": 2},
    {"code": "O", "order": 3}
  ]
}
```

**Response:** `200 OK`

#### 109. Clear Code List Cache

```http
POST /api/v1/study-design/metadata/codelists/cache/clear
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 110. Health Check

```http
GET /api/v1/study-design/metadata/codelists/health
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "UP",
  "totalCategories": 15,
  "totalCodes": 342,
  "cacheStatus": "ACTIVE"
}
```

---

## Study Operations APIs

**Base Path:** `/api/v1/study-operations/visit-config/unscheduled`  
**Legacy Path:** `/api/clinops/unscheduled-visit-config` (deprecated)

### Unscheduled Visit Configuration

#### 111. Get All Configurations

```http
GET /api/v1/study-operations/visit-config/unscheduled
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "configurations": [
    {
      "id": 1,
      "visitCode": "DISCONT",
      "visitName": "Discontinuation Visit",
      "description": "Visit when patient discontinues from study",
      "visitOrder": 1,
      "isEnabled": true,
      "createdBy": "admin@example.com",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "visitCode": "AE",
      "visitName": "Adverse Event Visit",
      "description": "Unscheduled visit due to adverse event",
      "visitOrder": 2,
      "isEnabled": true,
      "createdBy": "admin@example.com",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### 112. Get Enabled Configurations

```http
GET /api/v1/study-operations/visit-config/unscheduled/enabled
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 113. Get Configuration by ID

```http
GET /api/v1/study-operations/visit-config/unscheduled/{id}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 114. Get Configuration by Code

```http
GET /api/v1/study-operations/visit-config/unscheduled/by-code/{code}
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 115. Create Configuration

```http
POST /api/v1/study-operations/visit-config/unscheduled
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitCode": "SAFETY",
  "visitName": "Safety Visit",
  "description": "Unscheduled safety follow-up visit",
  "visitOrder": 3,
  "isEnabled": true
}
```

**Response:** `201 Created`

#### 116. Update Configuration

```http
PUT /api/v1/study-operations/visit-config/unscheduled/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitName": "Safety Follow-up Visit",
  "description": "Updated description",
  "isEnabled": true
}
```

**Response:** `200 OK`

#### 117. Toggle Configuration

```http
PATCH /api/v1/study-operations/visit-config/unscheduled/{id}/toggle
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### 118. Delete Configuration

```http
DELETE /api/v1/study-operations/visit-config/unscheduled/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Warning:** This will prevent future studies from using this visit type. Existing studies that already have this visit type will not be affected.

---

## Response Formats

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Example Resource"
  },
  "message": "Resource created successfully"
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "timestamp": "2025-10-19T10:30:00Z",
  "path": "/api/v1/study-management/studies"
}
```

### Pagination Response

```json
{
  "content": [...],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate, etc.) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource does not exist |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Example Error Responses

**Validation Error (400):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "studyCode",
        "message": "Study code is required"
      },
      {
        "field": "phase",
        "message": "Invalid phase value"
      }
    ]
  }
}
```

**Not Found (404):**
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Study not found",
    "resourceType": "Study",
    "resourceId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Unauthorized (401):**
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Deprecation Policy

### Timeline

1. **Announcement (Month 0):** Deprecation announced in release notes
2. **Warning Phase (Months 1-3):** Deprecation headers returned
3. **Sunset Notice (Months 4-5):** Strong warnings issued
4. **Removal (Month 6):** Legacy endpoints removed

### Deprecation Headers

Legacy endpoints return these headers:

```http
Deprecation: true
Sunset: Wed, 01 Apr 2026 00:00:00 GMT
Link: </api/v1/study-management/studies>; rel="successor-version"
X-API-Warn: This endpoint is deprecated. Use /api/v1/study-management/studies
```

### Migration Guide

**Step 1: Identify Usage**
- Search codebase for legacy URL patterns
- Check API Gateway logs for deprecated endpoint usage

**Step 2: Update URLs**
```javascript
// OLD (deprecated)
const url = '/api/studies';

// NEW (recommended)
const url = '/api/v1/study-management/studies';
```

**Step 3: Test**
- Verify all functionality works with new URLs
- Check response formats (should be identical)

**Step 4: Deploy**
- Update all clients to use new URLs
- Monitor for any issues

### Legacy URL Mapping

| Legacy URL | New URL | Sunset Date |
|------------|---------|-------------|
| `/api/studies/**` | `/api/v1/study-management/studies/**` | April 2026 |
| `/api/protocol-versions/**` | `/api/v1/protocol-management/versions/**` | April 2026 |
| `/api/clinops/study-design/**` | `/api/v1/study-design/**` | April 2026 |
| `/api/form-definitions/**` | `/api/v1/study-design/form-definitions/**` | April 2026 |
| `/api/form-templates/**` | `/api/v1/study-design/form-templates/**` | April 2026 |
| `/api/form-bindings/**` | `/api/v1/study-design/form-bindings/**` | April 2026 |
| `/api/v1/documents/**` | `/api/v1/study-design/documents/**` | April 2026 |
| `/api/admin/codelists/**` | `/api/v1/study-design/metadata/codelists/**` | April 2026 |
| `/api/clinops/unscheduled-visit-config/**` | `/api/v1/study-operations/visit-config/unscheduled/**` | April 2026 |

---

## Appendix

### Common Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number (0-indexed) | 0 |
| `size` | integer | Items per page | 20 |
| `sort` | string | Sort field and direction | `createdAt,desc` |
| `fields` | string | Comma-separated fields to return | All fields |

### Date Formats

All dates use **ISO 8601** format:
- Date: `2025-10-19`
- DateTime: `2025-10-19T10:30:00Z`
- DateTime with timezone: `2025-10-19T10:30:00-04:00`

### Rate Limiting

**Current Limits:**
- 1000 requests per hour per user
- 100 requests per minute per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1697745600
```

### Support

**Documentation:** https://docs.clinprecision.com  
**API Status:** https://status.clinprecision.com  
**Support Email:** api-support@clinprecision.com  
**GitHub:** https://github.com/clinprecision/api-docs

---

**End of API Documentation**  
**Version 1.0 | October 19, 2025**
