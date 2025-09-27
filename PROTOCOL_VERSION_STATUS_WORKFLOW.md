# Protocol Version Status Workflow - Industry Standard Distinction

## Overview
This document clarifies the distinction between Study-level and Protocol Version-level review statuses to align with industry standards.

## Status Workflow Distinction

### 1. Study-Level Status (Overall Protocol Design)
**Location**: Study Design Phase → "Review and Validation"
**Status**: `PROTOCOL_REVIEW`
**Purpose**: Initial review of the overall study protocol design before first approval

**Workflow**:
```
DRAFT → PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE
```

**Use Cases**:
- Initial protocol design review
- Overall study concept validation
- Compliance and feasibility review
- Pre-submission protocol review

### 2. Protocol Version-Level Status (Amendments)
**Location**: Protocol Version Management → "Submit For Review"
**Status**: `AMENDMENT_REVIEW`
**Purpose**: Review of specific protocol amendments and versions

**Workflow**:
```
DRAFT → AMENDMENT_REVIEW → SUBMITTED → APPROVED → ACTIVE
```

**Use Cases**:
- Protocol amendment review
- Version-specific change validation
- Amendment impact assessment
- Post-approval modification review

## Industry Standard Alignment

### FDA/ICH Guidelines:
- **Protocol Review**: Initial protocol evaluation and approval process
- **Amendment Review**: Evaluation of substantial and non-substantial amendments

### Clinical Research Standards:
- **Study Protocol Review**: Comprehensive review of study design, objectives, methodology
- **Protocol Amendment Review**: Focused review of changes to approved protocol

## Implementation

### Backend Enums:
```java
// Study Status (StudyStatusEntity)
PROTOCOL_REVIEW - "Protocol under review for approval"

// Version Status (StudyVersionEntity.VersionStatus) 
AMENDMENT_REVIEW - "Protocol amendment under review"
```

### Status Transitions:
```
Study Level:
DRAFT → PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE

Version Level:
DRAFT → AMENDMENT_REVIEW → SUBMITTED → APPROVED → ACTIVE → SUPERSEDED
```

## Benefits of This Distinction

1. **Regulatory Compliance**: Aligns with FDA/EMA amendment classification
2. **Audit Trail**: Clear separation of initial vs. amendment review processes
3. **Workflow Clarity**: Distinct approval paths for different review types
4. **Stakeholder Understanding**: Clear communication of review type and scope

## Frontend Integration

- Study Design Phase uses `PROTOCOL_REVIEW` for overall protocol validation
- Protocol Version Management uses `AMENDMENT_REVIEW` for version-specific reviews
- Clear UI indicators for each review type
- Appropriate workflow buttons and status displays