# Study Versioning & Amendments System - API Documentation

## Overview
This document describes the Study Versioning & Amendments System APIs that enable clinical trial protocol version management and amendment tracking in compliance with FDA regulations.

## Base URLs
- Local Development: `http://localhost:8080/api`
- Production: `https://your-domain.com/api`

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Study Versions

#### 1. Get All Versions for a Study
```http
GET /api/studies/{studyId}/versions
```

**Parameters:**
- `studyId` (path, required): The ID of the study

**Query Parameters:**
- `status` (optional): Filter by version status (DRAFT, UNDER_REVIEW, SUBMITTED, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN)
- `includeAmendments` (optional, boolean): Include amendments in response (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studyId": 123,
      "versionNumber": "v1.0",
      "status": "ACTIVE",
      "amendmentType": "MAJOR",
      "amendmentReason": "Protocol enhancement for patient safety",
      "description": "Updated inclusion criteria and safety monitoring",
      "changesSummary": "Modified inclusion criteria, added safety endpoints",
      "impactAssessment": "Low impact on current subjects",
      "previousVersionId": null,
      "createdBy": 1,
      "createdDate": "2024-01-15T10:30:00Z",
      "approvedBy": 2,
      "approvedDate": "2024-01-20T14:15:00Z",
      "effectiveDate": "2024-01-25",
      "requiresRegulatoryApproval": true,
      "notifyStakeholders": true,
      "additionalNotes": "Coordinated with regulatory team",
      "protocolChanges": {
        "sections": ["inclusion_criteria", "safety_monitoring"],
        "changes": [...]
      },
      "icfChanges": {...},
      "regulatorySubmissions": {...},
      "reviewComments": {...},
      "metadata": {...},
      "amendments": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 1
  }
}
```

#### 2. Create New Study Version
```http
POST /api/studies/{studyId}/versions
```

**Request Body:**
```json
{
  "amendmentType": "MAJOR",
  "amendmentReason": "Safety update required by regulatory authority",
  "description": "Update to address safety concerns identified in interim analysis",
  "changesSummary": "Modified dosing protocol and added safety monitoring",
  "impactAssessment": "Minimal impact - applies to new subjects only",
  "effectiveDate": "2024-02-01",
  "requiresRegulatoryApproval": true,
  "notifyStakeholders": true,
  "additionalNotes": "Expedited review requested",
  "protocolChanges": {
    "sections": ["dosing", "safety_monitoring"],
    "changes": [...]
  },
  "icfChanges": {...},
  "metadata": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "versionNumber": "v2.0",
    "status": "DRAFT",
    // ... full version object
  },
  "message": "Study version v2.0 created successfully"
}
```

#### 3. Update Study Version
```http
PUT /api/studies/{studyId}/versions/{versionId}
```

**Request Body:** Same as create, but all fields are optional

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated version object
  },
  "message": "Study version updated successfully"
}
```

#### 4. Delete Study Version
```http
DELETE /api/studies/{studyId}/versions/{versionId}
```

**Response:**
```json
{
  "success": true,
  "message": "Study version deleted successfully"
}
```

#### 5. Approve Study Version
```http
POST /api/studies/{studyId}/versions/{versionId}/approve
```

**Request Body:**
```json
{
  "approvalComments": "Version approved after regulatory review",
  "effectiveDate": "2024-02-15"
}
```

#### 6. Activate Study Version
```http
POST /api/studies/{studyId}/versions/{versionId}/activate
```

**Response:**
```json
{
  "success": true,
  "message": "Study version v2.0 activated successfully",
  "data": {
    "activatedVersion": "v2.0",
    "previousActiveVersion": "v1.0"
  }
}
```

### Study Amendments

#### 1. Get All Amendments for a Study Version
```http
GET /api/studies/{studyId}/amendments
```

**Query Parameters:**
- `versionId` (optional): Filter by specific version
- `status` (optional): Filter by amendment status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studyVersionId": 2,
      "amendmentNumber": 1,
      "title": "Safety Monitoring Enhancement",
      "description": "Enhanced safety monitoring procedures",
      "amendmentType": "SAFETY",
      "reason": "Regulatory requirement following interim analysis",
      "sectionAffected": "Safety Monitoring",
      "changeDetails": "Added weekly safety assessments for first 4 weeks",
      "justification": "Enhanced patient safety based on interim findings",
      "impactOnSubjects": true,
      "requiresConsentUpdate": true,
      "requiresRegulatoryNotification": true,
      "status": "APPROVED",
      "submittedBy": 1,
      "submittedDate": "2024-01-18T09:00:00Z",
      "reviewedBy": 2,
      "reviewedDate": "2024-01-20T11:30:00Z",
      "approvedBy": 2,
      "approvedDate": "2024-01-20T14:15:00Z",
      "reviewComments": "Approved with minor clarifications",
      "createdBy": 1,
      "createdDate": "2024-01-16T14:30:00Z",
      "metadata": {...}
    }
  ]
}
```

#### 2. Create New Amendment
```http
POST /api/studies/{studyId}/amendments
```

**Request Body:**
```json
{
  "studyVersionId": 2,
  "title": "Dosing Schedule Modification",
  "description": "Adjust dosing schedule based on pharmacokinetic data",
  "amendmentType": "MINOR",
  "reason": "Optimization based on PK analysis",
  "sectionAffected": "Dosing Schedule",
  "changeDetails": "Change from daily to twice-daily dosing",
  "justification": "Improved drug exposure and tolerability",
  "impactOnSubjects": false,
  "requiresConsentUpdate": false,
  "requiresRegulatoryNotification": true,
  "metadata": {...}
}
```

#### 3. Update Amendment
```http
PUT /api/studies/{studyId}/amendments/{amendmentId}
```

#### 4. Delete Amendment
```http
DELETE /api/studies/{studyId}/amendments/{amendmentId}
```

#### 5. Submit Amendment for Review
```http
POST /api/studies/{studyId}/amendments/{amendmentId}/submit
```

#### 6. Approve Amendment
```http
POST /api/studies/{studyId}/amendments/{amendmentId}/approve
```

**Request Body:**
```json
{
  "approvalComments": "Amendment approved with conditions",
  "conditions": ["Update informed consent form", "Notify all sites"]
}
```

## Data Models

### Version Status Enum
- `DRAFT`: Initial draft state
- `UNDER_REVIEW`: Under internal review
- `SUBMITTED`: Submitted to regulatory authorities
- `APPROVED`: Approved by regulatory authorities
- `ACTIVE`: Currently active version
- `SUPERSEDED`: Replaced by newer version
- `WITHDRAWN`: Withdrawn from consideration

### Amendment Type Enum
- `MAJOR`: Significant changes affecting primary endpoints or patient safety
- `MINOR`: Administrative or clarification changes
- `SAFETY`: Safety-related modifications
- `ADMINISTRATIVE`: Administrative corrections

### Amendment Status Enum
- `DRAFT`: Initial draft
- `SUBMITTED`: Submitted for review
- `UNDER_REVIEW`: Currently under review
- `APPROVED`: Approved for implementation
- `IMPLEMENTED`: Successfully implemented
- `REJECTED`: Rejected after review
- `WITHDRAWN`: Withdrawn by submitter

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Version number must be unique within study",
    "details": {
      "field": "versionNumber",
      "value": "v1.0",
      "constraint": "unique"
    }
  },
  "timestamp": "2024-01-16T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `BUSINESS_RULE_VIOLATION`: Business logic constraint violated
- `VERSION_CONFLICT`: Version state conflict
- `REGULATORY_CONSTRAINT`: Regulatory requirement not met

## Business Rules

### Version Creation
1. Only users with STUDY_MANAGER or PROTOCOL_DEVELOPER roles can create versions
2. Version numbers are automatically generated based on amendment type
3. MAJOR and SAFETY amendments increment major version number
4. MINOR and ADMINISTRATIVE amendments increment minor version number

### Version Activation
1. Only APPROVED versions can be activated
2. Activating a version automatically sets previous active version to SUPERSEDED
3. Only one version can be ACTIVE per study at a time

### Amendment Management
1. Amendments are automatically numbered within each version
2. SAFETY amendments require regulatory notification
3. Amendments affecting subjects require consent form updates
4. Amendment status follows defined workflow: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → IMPLEMENTED

### Regulatory Compliance
1. All regulatory submissions are tracked in JSON format
2. Approval dates and approvers are recorded for audit trail
3. Impact assessments are required for all amendments
4. Stakeholder notifications are configurable per version

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per organization

## Pagination
All list endpoints support pagination:
- `page`: Page number (default: 1)
- `size`: Page size (default: 20, max: 100)
- `sort`: Sort field and direction (e.g., `createdDate,desc`)

## Changelog

### Version 1.0.0 (2024-01-27)
- Initial API implementation
- Full CRUD operations for versions and amendments
- Regulatory compliance features
- Automated version numbering
- Status workflow management