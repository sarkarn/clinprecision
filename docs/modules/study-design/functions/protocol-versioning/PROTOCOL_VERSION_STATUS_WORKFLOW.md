# Protocol Version Status Workflow

**Version:** 2.0  
**Date:** October 2, 2025  
**Audience:** Developers, QA Engineers, Compliance Officers, System Architects  
**Module:** Study Design & Protocol Management

---

## Table of Contents

1. [Overview](#overview)
2. [Status Workflow Distinction](#status-workflow-distinction)
3. [Industry Standard Alignment](#industry-standard-alignment)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Status Transition Rules](#status-transition-rules)
7. [Testing & Validation](#testing--validation)

---

## Overview

### Purpose

This document clarifies the **critical distinction** between Study-level and Protocol Version-level review statuses to align with industry standards, FDA/ICH guidelines, and regulatory best practices.

### Key Principles

1. **Study-Level Status (`PROTOCOL_REVIEW`)** - Used for initial review of the overall study protocol design before first approval
2. **Protocol Version-Level Status (`PROTOCOL_REVIEW`)** - Used for review of specific protocol amendments and versions
3. **Single Status Name** - Both levels use `PROTOCOL_REVIEW` for consistency with backend enums
4. **Frontend Display** - Can show different labels ("Under Review", "Protocol Review") while maintaining consistent status values

### Critical Implementation Note

⚠️ **IMPORTANT**: The backend enum uses `PROTOCOL_REVIEW` for protocol review status. Frontend implementations MUST use this exact status name, not variations like `UNDER_REVIEW` or `AMENDMENT_REVIEW`.

```javascript
// ✅ CORRECT
const status = 'PROTOCOL_REVIEW';

// ❌ WRONG - Backend will reject
const status = 'UNDER_REVIEW';
const status = 'AMENDMENT_REVIEW';
```

---

## Status Workflow Distinction

### 1. Study-Level Status (Overall Protocol Design)

**Context:** Study Design Phase → "Review and Validation"  
**Status:** `PROTOCOL_REVIEW`  
**Purpose:** Initial review of the overall study protocol design before first approval

#### Workflow Diagram

```
DRAFT → PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE → COMPLETED/TERMINATED
                        ↓
                   (Review Phase)
                   - IRB Review
                   - Regulatory Review
                   - Scientific Review
                   - Compliance Review
```

#### Use Cases

- **Initial Protocol Design Review** - First-time evaluation of study design
- **Overall Study Concept Validation** - Comprehensive review of study objectives and methodology
- **Compliance and Feasibility Review** - Ensuring regulatory compliance and operational feasibility
- **Pre-Submission Protocol Review** - Final validation before regulatory submission

#### State Characteristics

| Characteristic | Value |
|----------------|-------|
| **Allows Editing** | ❌ No - Protocol locked during review |
| **Data Capture** | ❌ No - Study not yet approved |
| **Design Changes** | ❌ No - Must reject back to PLANNING |
| **Review Duration** | 2-6 weeks typically |
| **Approval Authority** | Regulatory Affairs, IRB, PI |

---

### 2. Protocol Version-Level Status (Amendments)

**Context:** Protocol Version Management → "Submit For Review"  
**Status:** `PROTOCOL_REVIEW`  
**Purpose:** Review of specific protocol amendments and versions

#### Workflow Diagram

```
DRAFT → PROTOCOL_REVIEW → APPROVED → ACTIVE → SUPERSEDED
            ↓
     (Amendment Review)
     - Change Assessment
     - Impact Analysis
     - Regulatory Approval (if needed)
     - Site Notification Plan
```

#### Use Cases

- **Protocol Amendment Review** - Evaluation of proposed protocol changes
- **Version-Specific Change Validation** - Ensuring changes are properly documented and justified
- **Amendment Impact Assessment** - Analyzing impact on ongoing study and enrolled subjects
- **Post-Approval Modification Review** - Review of changes to already-approved protocols

#### Amendment Types & Review Requirements

| Amendment Type | Review Level | Typical Duration | Regulatory Approval |
|----------------|--------------|------------------|---------------------|
| **MINOR** | Internal only | 1-3 business days | Usually not required |
| **MAJOR** | Full regulatory | 5-10 business days | Required |
| **SUBSTANTIAL** | Expedited regulatory | 10-20 business days | Required |

---

## Industry Standard Alignment

### FDA Guidelines

The U.S. Food and Drug Administration (FDA) distinguishes between:

1. **Original Protocol Review** - Initial Investigational New Drug (IND) submission
   - Comprehensive review of study design
   - Evaluation of safety and scientific merit
   - Review of inclusion/exclusion criteria, endpoints, statistical plan

2. **Protocol Amendment Review** - Subsequent modifications to approved protocol
   - Assessment of amendment impact
   - Classification as substantial vs. non-substantial
   - Determination of IND amendment requirements

**Reference:** 21 CFR 312.30 - IND Protocol Amendments

### ICH Guidelines

International Council for Harmonisation (ICH) E6(R2) Good Clinical Practice guidelines define:

1. **Protocol Review** (Initial)
   - Independent Ethics Committee (IEC) / Institutional Review Board (IRB) review
   - Regulatory authority review and approval
   - Scientific validity assessment

2. **Protocol Amendment Review**
   - Classification of amendments (substantial vs. non-substantial)
   - Expedited review procedures for urgent safety measures
   - Documentation of amendment rationale and justification

**Reference:** ICH E6(R2) Good Clinical Practice - Section 3.1 (Institutional Review Board / Independent Ethics Committee)

### EMA Guidelines

European Medicines Agency (EMA) Clinical Trials Regulation defines:

- **Initial Assessment** - Comprehensive review of clinical trial application
- **Substantial Modifications** - Changes that may have significant impact on safety or scientific validity
- **Non-Substantial Modifications** - Administrative or clarifying changes

**Reference:** EU Clinical Trials Regulation (No 536/2014)

---

## Backend Implementation

### Study Status Enum

**File:** `src/main/java/com/clinprecision/studydesign/enums/StudyStatus.java`

```java
package com.clinprecision.studydesign.enums;

public enum StudyStatus {
    DRAFT("Draft", "Study in initial planning phase"),
    PLANNING("Planning", "Study design being finalized"),
    PROTOCOL_REVIEW("Protocol Review", "Protocol under review for approval"),
    APPROVED("Approved", "Study approved and ready to start"),
    ACTIVE("Active", "Study actively enrolling participants"),
    COMPLETED("Completed", "Study successfully completed"),
    TERMINATED("Terminated", "Study terminated before completion"),
    SUSPENDED("Suspended", "Study temporarily suspended");
    
    private final String label;
    private final String description;
    
    StudyStatus(String label, String description) {
        this.label = label;
        this.description = description;
    }
    
    public String getLabel() {
        return label;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### Protocol Version Status Enum

**File:** `src/main/java/com/clinprecision/studydesign/enums/ProtocolVersionStatus.java`

```java
package com.clinprecision.studydesign.enums;

public enum ProtocolVersionStatus {
    DRAFT("Draft", "Protocol version in development", true),
    PROTOCOL_REVIEW("Under Review", "Protocol under review", false),
    APPROVED("Approved", "Protocol version approved", false),
    ACTIVE("Active", "Currently active protocol version", false),
    SUPERSEDED("Superseded", "Replaced by newer version", false),
    WITHDRAWN("Withdrawn", "Protocol version withdrawn", false);
    
    private final String label;
    private final String description;
    private final boolean allowsEditing;
    
    ProtocolVersionStatus(String label, String description, boolean allowsEditing) {
        this.label = label;
        this.description = description;
        this.allowsEditing = allowsEditing;
    }
    
    public String getLabel() {
        return label;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean allowsEditing() {
        return allowsEditing;
    }
    
    public boolean isReviewable() {
        return this == DRAFT;
    }
    
    public boolean isApprovable() {
        return this == PROTOCOL_REVIEW;
    }
    
    public boolean isActivatable() {
        return this == APPROVED;
    }
}
```

### Entity Definitions

```java
@Entity
@Table(name = "studies")
public class Study {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "study_status", nullable = false)
    private StudyStatus studyStatus = StudyStatus.DRAFT;
    
    // ... other fields
}

@Entity
@Table(name = "protocol_versions")
public class ProtocolVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProtocolVersionStatus status = ProtocolVersionStatus.DRAFT;
    
    @Column(name = "version_number", nullable = false)
    private String versionNumber;
    
    // ... other fields
}
```

---

## Frontend Integration

### Constants Definition

**File:** `src/constants/protocolVersionConstants.js`

```javascript
/**
 * Protocol Version Status Constants
 * 
 * CRITICAL: Status values MUST match backend enum exactly
 * Display labels can be customized for user-facing UI
 */

// ✅ CORRECT: Use exact backend enum values
export const PROTOCOL_VERSION_STATUS = {
  DRAFT: 'DRAFT',
  PROTOCOL_REVIEW: 'PROTOCOL_REVIEW',  // ✅ Matches backend
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  WITHDRAWN: 'WITHDRAWN'
};

// Display labels for user-facing UI
export const STATUS_LABELS = {
  DRAFT: 'Draft',
  PROTOCOL_REVIEW: 'Under Review',  // User-friendly label
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  SUPERSEDED: 'Superseded',
  WITHDRAWN: 'Withdrawn'
};

// Status descriptions for tooltips and help text
export const STATUS_DESCRIPTIONS = {
  DRAFT: 'Protocol version in development',
  PROTOCOL_REVIEW: 'Protocol under review by regulatory team',
  APPROVED: 'Protocol version approved and ready for activation',
  ACTIVE: 'Currently active protocol version',
  SUPERSEDED: 'Replaced by newer version',
  WITHDRAWN: 'Protocol version withdrawn'
};

// UI styling for status badges
export const STATUS_COLORS = {
  DRAFT: 'default',           // Gray
  PROTOCOL_REVIEW: 'processing', // Blue/yellow
  APPROVED: 'success',        // Green
  ACTIVE: 'success',          // Blue
  SUPERSEDED: 'warning',      // Orange
  WITHDRAWN: 'error'          // Red
};

// Status capabilities
export const STATUS_CAPABILITIES = {
  DRAFT: {
    canEdit: true,
    canSubmit: true,
    canApprove: false,
    canActivate: false,
    canDelete: true
  },
  PROTOCOL_REVIEW: {
    canEdit: false,
    canSubmit: false,
    canApprove: true,
    canActivate: false,
    canDelete: false
  },
  APPROVED: {
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canActivate: true,
    canDelete: false
  },
  ACTIVE: {
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canActivate: false,
    canDelete: false
  },
  SUPERSEDED: {
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canActivate: false,
    canDelete: false
  },
  WITHDRAWN: {
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canActivate: false,
    canDelete: false
  }
};
```

### Status Badge Component

```jsx
import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  PROTOCOL_VERSION_STATUS, 
  STATUS_LABELS, 
  STATUS_DESCRIPTIONS, 
  STATUS_COLORS 
} from '../../constants/protocolVersionConstants';

const ProtocolVersionStatusBadge = ({ status, showTooltip = true }) => {
  // Ensure status matches backend enum
  const normalizedStatus = status?.toUpperCase() || PROTOCOL_VERSION_STATUS.DRAFT;
  
  // Get display properties
  const label = STATUS_LABELS[normalizedStatus] || status;
  const description = STATUS_DESCRIPTIONS[normalizedStatus];
  const color = STATUS_COLORS[normalizedStatus];
  
  const badge = (
    <Tag 
      color={color}
      data-status={normalizedStatus}  // For testing
      className="protocol-version-status-badge"
    >
      {label}
    </Tag>
  );
  
  return showTooltip ? (
    <Tooltip title={description}>
      {badge}
    </Tooltip>
  ) : badge;
};

export default ProtocolVersionStatusBadge;
```

### Status-Based Action Buttons

```jsx
import React from 'react';
import { Button, Space } from 'antd';
import { 
  PROTOCOL_VERSION_STATUS, 
  STATUS_CAPABILITIES 
} from '../../constants/protocolVersionConstants';

const ProtocolVersionActions = ({ version, onAction, permissions }) => {
  const capabilities = STATUS_CAPABILITIES[version.status];
  
  return (
    <Space>
      {capabilities.canEdit && permissions.canEdit && (
        <Button onClick={() => onAction('edit', version)}>
          Edit
        </Button>
      )}
      
      {capabilities.canSubmit && permissions.canSubmit && (
        <Button 
          type="primary"
          onClick={() => onAction('submit', version)}
        >
          Submit for Review
        </Button>
      )}
      
      {capabilities.canApprove && permissions.canApprove && (
        <>
          <Button 
            type="primary"
            onClick={() => onAction('approve', version)}
          >
            Approve
          </Button>
          <Button 
            danger
            onClick={() => onAction('reject', version)}
          >
            Reject
          </Button>
        </>
      )}
      
      {capabilities.canActivate && permissions.canActivate && (
        <Button 
          type="primary"
          onClick={() => onAction('activate', version)}
        >
          Activate
        </Button>
      )}
      
      {capabilities.canDelete && permissions.canDelete && (
        <Button 
          danger
          onClick={() => onAction('delete', version)}
        >
          Delete
        </Button>
      )}
    </Space>
  );
};

export default ProtocolVersionActions;
```

---

## Status Transition Rules

### Valid Transitions

```javascript
export const VALID_STATUS_TRANSITIONS = {
  'DRAFT': ['PROTOCOL_REVIEW'],
  'PROTOCOL_REVIEW': ['APPROVED', 'DRAFT'],  // Can approve or reject back
  'APPROVED': ['ACTIVE', 'WITHDRAWN'],
  'ACTIVE': ['SUPERSEDED'],
  'SUPERSEDED': [],  // Terminal state
  'WITHDRAWN': []    // Terminal state
};

// Validation function
export const isValidTransition = (currentStatus, newStatus) => {
  const validNext = VALID_STATUS_TRANSITIONS[currentStatus];
  return validNext ? validNext.includes(newStatus) : false;
};

// Transition reasons/triggers
export const TRANSITION_TRIGGERS = {
  'DRAFT → PROTOCOL_REVIEW': 'Submit for Review',
  'PROTOCOL_REVIEW → APPROVED': 'Approval Granted',
  'PROTOCOL_REVIEW → DRAFT': 'Rejected - Revisions Required',
  'APPROVED → ACTIVE': 'Version Activated',
  'APPROVED → WITHDRAWN': 'Withdrawn Before Activation',
  'ACTIVE → SUPERSEDED': 'New Version Activated'
};
```

### Transition Validation

```javascript
class ProtocolVersionService {
  async updateStatus(versionId, newStatus, comments = '') {
    // Get current version
    const version = await this.getVersion(versionId);
    const currentStatus = version.status;
    
    // Validate transition
    if (!isValidTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
        `Valid transitions from ${currentStatus}: ${VALID_STATUS_TRANSITIONS[currentStatus].join(', ')}`
      );
    }
    
    // Perform transition
    const response = await axios.put(
      `/api/studydesign/protocol-versions/${versionId}/status`,
      {
        status: newStatus,  // ✅ Must use exact enum value
        comments,
        transitionDate: new Date().toISOString()
      }
    );
    
    return response.data;
  }
}
```

---

## Testing & Validation

### Unit Tests

```javascript
// protocolVersionStatus.test.js
describe('Protocol Version Status', () => {
  test('should use correct backend enum values', () => {
    expect(PROTOCOL_VERSION_STATUS.PROTOCOL_REVIEW).toBe('PROTOCOL_REVIEW');
    expect(PROTOCOL_VERSION_STATUS.PROTOCOL_REVIEW).not.toBe('UNDER_REVIEW');
  });
  
  test('should validate status transitions correctly', () => {
    expect(isValidTransition('DRAFT', 'PROTOCOL_REVIEW')).toBe(true);
    expect(isValidTransition('DRAFT', 'ACTIVE')).toBe(false);
    expect(isValidTransition('PROTOCOL_REVIEW', 'APPROVED')).toBe(true);
    expect(isValidTransition('SUPERSEDED', 'ACTIVE')).toBe(false);
  });
  
  test('should provide user-friendly labels while maintaining correct status values', () => {
    const status = 'PROTOCOL_REVIEW';
    const label = STATUS_LABELS[status];
    
    expect(label).toBe('Under Review');  // User-friendly
    expect(status).toBe('PROTOCOL_REVIEW');  // Backend value
  });
});
```

### Integration Tests

```javascript
// Test status workflow end-to-end
describe('Protocol Version Status Workflow', () => {
  test('complete workflow: DRAFT → PROTOCOL_REVIEW → APPROVED → ACTIVE', async () => {
    // Create draft version
    const version = await createProtocolVersion({
      versionNumber: '1.0',
      status: 'DRAFT'
    });
    expect(version.status).toBe('DRAFT');
    
    // Submit for review
    const submitted = await submitForReview(version.id);
    expect(submitted.status).toBe('PROTOCOL_REVIEW');
    
    // Approve
    const approved = await approveVersion(version.id);
    expect(approved.status).toBe('APPROVED');
    
    // Activate
    const activated = await activateVersion(version.id);
    expect(activated.status).toBe('ACTIVE');
  });
});
```

---

## Document Information

**Version:** 2.0  
**Last Updated:** October 2, 2025  
**Document Owner:** ClinPrecision Development Team  
**Review Cycle:** Quarterly or after major backend changes

**Related Documents:**
- [Protocol Version User Guide](./PROTOCOL_VERSION_USER_GUIDE.md)
- [Protocol Version Implementation](./PROTOCOL_VERSION_IMPLEMENTATION.md)
- [Protocol Version Lifecycle](./PROTOCOL_VERSION_LIFECYCLE.md)

**Change History:**
- Version 1.0 (June 2025): Initial status workflow documentation
- Version 2.0 (October 2025): Consolidated from multiple sources, clarified status naming, added comprehensive frontend integration

---

*This document is proprietary and confidential. Unauthorized distribution is prohibited.*
