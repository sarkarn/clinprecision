# Protocol Version Management - User Guide

**Version:** 2.0  
**Date:** October 2, 2025  
**Audience:** Clinical Research Associates, Protocol Developers, Study Managers, Regulatory Affairs Specialists  
**Module:** Study Design & Protocol Management

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Protocol Version Status Management](#protocol-version-status-management)
4. [Creating Your First Protocol Version](#creating-your-first-protocol-version)
5. [Protocol Amendment Process](#protocol-amendment-process)
6. [Approval Workflows](#approval-workflows)
7. [User Workflows & Scenarios](#user-workflows--scenarios)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Introduction

### What is Protocol Version Management?

Protocol Version Management in ClinPrecision provides comprehensive tools for managing protocol documents throughout the clinical trial lifecycle. It supports:

- **Initial Protocol Creation** - Document and track your first protocol version
- **Amendment Management** - Handle protocol changes systematically
- **Version Control** - Maintain complete history of protocol revisions
- **Approval Workflows** - Structured approval processes for regulatory compliance
- **Status Tracking** - Real-time visibility into protocol lifecycle stages
- **Regulatory Compliance** - FDA/ICH-GCP compliant workflows

### Key Concepts

#### Protocol Version
A protocol version represents a specific iteration of your study protocol document. Each version has:
- **Version Number** (e.g., 1.0, 1.1, 2.0)
- **Status** (Draft → Under Review → Approved → Active → Superseded)
- **Amendment Type** (Initial, Minor, Major, Substantial)
- **Effective Date** - When the version becomes active
- **Change Description** - What changed and why

#### Study vs. Protocol Status
It's important to understand the distinction:

| Aspect | Study Status | Protocol Version Status |
|--------|--------------|------------------------|
| **Scope** | Overall study design and execution | Specific protocol document |
| **Changes When** | Study phases change (Planning → Active → Completed) | Protocol document changes (Draft → Approved → Active) |
| **Examples** | PLANNING, ACTIVE, COMPLETED | DRAFT, APPROVED, ACTIVE, SUPERSEDED |

### Target Users

- **Protocol Developers** - Create and edit protocol versions
- **Study Managers** - Oversee protocol approval and implementation
- **Regulatory Affairs** - Review and approve protocol changes
- **Principal Investigators** - Final approval authority
- **CRAs/Monitors** - View and track protocol versions at sites

---

## Getting Started

### Accessing Protocol Version Management

1. **Login** to ClinPrecision platform
2. **Navigate** to Study Design module
3. **Select** your study from the study list
4. **Click** on "Protocol Versions" tab in the Study Design Dashboard

### User Permissions

Different roles have varying access levels:

| Role | View Versions | Create Version | Edit Draft | Submit Review | Approve | Activate |
|------|--------------|----------------|------------|---------------|---------|----------|
| Protocol Developer | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Study Manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Regulatory Affairs | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Principal Investigator | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| CRA/Monitor | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### First-Time Setup

When you first access Protocol Version Management for a new study:

1. **No versions exist yet** - You'll see an empty state
2. **Create Initial Version** - Click "Create First Protocol Version"
3. **Fill in details** - Version 1.0 is suggested automatically
4. **Set effective date** - When you plan to start the study
5. **Save as draft** - You can edit before submitting for review

---

## Protocol Version Status Management

### Status Lifecycle

Protocol versions progress through these statuses:

```
DRAFT → PROTOCOL_REVIEW → APPROVED → ACTIVE → SUPERSEDED/WITHDRAWN
```

### Status Definitions

#### DRAFT
- **Definition:** Protocol version is being developed
- **Editing:** Full editing capabilities enabled
- **Actions Available:** 
  - Edit version details
  - Submit for review
  - Delete version (if not needed)
- **Who Can Access:** Protocol Developers, Study Managers
- **Color Indicator:** Gray 🟤

#### PROTOCOL_REVIEW
- **Definition:** Protocol version submitted for formal review
- **Editing:** No editing allowed during review
- **Actions Available:**
  - View version details
  - Approve (if authorized)
  - Reject back to DRAFT (with comments)
- **Who Can Access:** All study team members (view), Regulatory Affairs (approve)
- **Color Indicator:** Yellow 🟡

#### APPROVED
- **Definition:** Protocol version has been approved but not yet activated
- **Editing:** No editing allowed
- **Actions Available:**
  - Activate version (make it the current active protocol)
  - Create amendment (if changes needed)
- **Who Can Access:** All study team members
- **Color Indicator:** Green 🟢

#### ACTIVE
- **Definition:** Currently active protocol version in use for the study
- **Editing:** No editing allowed (create amendment instead)
- **Actions Available:**
  - Create amendment version
  - View details
  - Generate documentation
- **Who Can Access:** All study team members
- **Color Indicator:** Blue 🔵
- **Note:** Only ONE version can be ACTIVE at a time

#### SUPERSEDED
- **Definition:** Protocol version replaced by a newer active version
- **Editing:** No editing allowed (historical record)
- **Actions Available:**
  - View details (read-only)
  - Compare with current version
  - Generate historical reports
- **Who Can Access:** All study team members
- **Color Indicator:** Orange 🟠

#### WITHDRAWN
- **Definition:** Protocol version withdrawn before activation
- **Editing:** No editing allowed
- **Actions Available:**
  - View details (read-only)
- **Who Can Access:** All study team members
- **Color Indicator:** Red 🔴

### Status Transition Rules

**Valid Transitions:**
- `DRAFT` → `PROTOCOL_REVIEW` (Submit for review)
- `PROTOCOL_REVIEW` → `APPROVED` (Approve)
- `PROTOCOL_REVIEW` → `DRAFT` (Reject back for revisions)
- `APPROVED` → `ACTIVE` (Activate version)
- `ACTIVE` → `SUPERSEDED` (When new version activated)
- `Any Status` → `WITHDRAWN` (Cancel/withdraw version)

**Invalid Transitions:**
- `APPROVED` → `DRAFT` ❌
- `ACTIVE` → `DRAFT` ❌
- `SUPERSEDED` → Any other status ❌

---

## Creating Your First Protocol Version

### Step-by-Step Process

#### Step 1: Open Protocol Version Management
1. Navigate to Study Design Dashboard
2. Click on "Protocol Versions" tab
3. You'll see the Protocol Version Panel

#### Step 2: Initiate Version Creation
1. Click **"Create First Protocol Version"** button
2. The Protocol Version Form modal opens
3. System suggests version number "1.0" automatically

#### Step 3: Fill in Required Information

**Version Number** (Required)
- Suggested: "1.0" for initial version
- Format: Major.Minor (e.g., 1.0, 2.1, 3.0)
- Must be unique across all versions

**Description** (Required)
- Brief summary of this version
- Example: "Initial protocol version for Phase III oncology study"
- Recommended: 50-200 characters

**Amendment Type** (Required)
- Select: **INITIAL** (for first version)
- Other options disabled for initial version

**Effective Date** (Optional but Recommended)
- When this version should become active
- Usually aligned with study start date
- Can be updated later before activation

#### Step 4: Advanced Options (Optional)

**Impact Assessment**
- Brief assessment of protocol impact
- Example: "First version, establishes baseline protocol"

**Regulatory Approval Required**
- Check if FDA/EMA approval needed
- Usually YES for initial protocols

**Notify Stakeholders**
- Automatically notify study team when saved
- Recommended: Keep checked

#### Step 5: Save Version
1. Click **"Create Version"** button
2. Version created with status: DRAFT
3. Success notification appears
4. Version now visible in protocol timeline

### What Happens Next?

After creating your first version:
1. **Version is in DRAFT** - You can still edit it
2. **Review your content** - Ensure all details are correct
3. **Submit for review** when ready - Triggers approval workflow
4. **Wait for approval** - Regulatory team reviews
5. **Activate** once approved - Makes it the active protocol

---

## Protocol Amendment Process

### When to Create an Amendment

Create an amendment when you need to:
- Modify study procedures
- Change inclusion/exclusion criteria
- Update safety monitoring requirements
- Revise visit schedules
- Clarify protocol language
- Update contact information

### Amendment Types

#### MINOR Amendment
**Use When:**
- Administrative changes (contact info, clerical errors)
- Clarifications that don't change study conduct
- Non-substantial modifications

**Examples:**
- Updated site coordinator contact
- Corrected spelling errors
- Clarified existing procedures

**Approval:** Fast-track, internal approval sufficient

#### MAJOR Amendment
**Use When:**
- Significant changes to study design
- Primary/secondary endpoint modifications
- Study population changes
- Substantial safety updates

**Examples:**
- Added new treatment arm
- Modified primary endpoint
- Changed enrollment criteria

**Approval:** Full regulatory approval required

#### SUBSTANTIAL Amendment
**Use When:**
- Changes affecting safety or scientific validity
- Major protocol modifications
- Critical procedure changes

**Examples:**
- Safety-driven protocol changes
- Dose modifications due to adverse events
- Significant design alterations

**Approval:** Expedited regulatory review required

### Amendment Creation Process

#### Step 1: Identify Need for Amendment
1. Document why amendment is needed
2. Determine amendment type
3. Assess regulatory impact
4. Plan implementation timeline

#### Step 2: Create Amendment Version
1. From Protocol Version Panel, click **"Create Amendment"**
2. System suggests next version number:
   - Minor: 1.0 → 1.1
   - Major: 1.1 → 2.0
3. Fill in amendment details:
   - **Version Number** (suggested, can edit)
   - **Amendment Type** (MINOR/MAJOR/SUBSTANTIAL)
   - **Description** (what's changing)
   - **Change Summary** (detailed changes)
   - **Rationale** (why changes needed)

#### Step 3: Document Changes
Be specific about what's changing:
```
Good Example:
"Section 6.2 Safety Reporting: Updated SAE reporting timeline 
from 24 hours to 12 hours per FDA feedback. Requires immediate 
site notification and training."

Poor Example:
"Updated safety section"
```

#### Step 4: Impact Assessment
Consider and document:
- **Site Impact:** Training needed? Procedure changes?
- **Patient Impact:** Consent updates required?
- **Regulatory Impact:** Which authorities must approve?
- **Timeline Impact:** Study delays expected?
- **Cost Impact:** Additional resources needed?

#### Step 5: Submit and Track
1. Submit amendment for review
2. Monitor approval progress
3. Address reviewer feedback
4. Track regulatory submissions
5. Plan site implementation

---

## Approval Workflows

### Internal Review Process

#### Step 1: Submit for Review
1. Version in DRAFT status
2. Click **"Submit for Review"**
3. Confirmation dialog appears
4. Optional: Add submission comments
5. Status changes: DRAFT → PROTOCOL_REVIEW

#### Step 2: Review Assignment
System automatically notifies:
- Medical reviewers
- Regulatory affairs team
- Quality assurance
- Study management

#### Step 3: Review Period
**Reviewers can:**
- View protocol version details
- Add comments and feedback
- Request changes
- Approve or reject

**Timeline:**
- Minor amendments: 1-3 business days
- Major amendments: 5-10 business days
- Substantial amendments: 10-20 business days

#### Step 4: Approval Decision

**If Approved:**
- Status changes: PROTOCOL_REVIEW → APPROVED
- Submitter notified via email
- Next step: Activation or regulatory submission

**If Rejected:**
- Status changes: PROTOCOL_REVIEW → DRAFT
- Rejection reason provided
- Submitter makes corrections
- Resubmit when ready

### Regulatory Approval Process

For amendments requiring regulatory approval:

#### Step 1: Prepare Submission Package
1. Protocol version approved internally
2. Generate submission documentation
3. Include all supporting materials:
   - Amendment summary
   - Change justification
   - Impact assessment
   - Updated informed consent (if needed)

#### Step 2: Submit to Regulatory Authorities
- FDA (IND amendments)
- EMA (Clinical Trial Applications)
- Local Ethics Committees
- IRB/EC approvals

#### Step 3: Track Regulatory Status
In ClinPrecision:
1. Navigate to version details
2. View **Regulatory Submissions** section
3. Track submission status:
   - Submitted
   - Under Review
   - Approved
   - Changes Required

#### Step 4: Obtain Approvals
- Respond to regulatory queries
- Provide additional information
- Track approval dates
- Document reference numbers

### Activation Process

Once approved (internally and/or regulatory):

#### Step 1: Pre-Activation Checklist
- ✅ All required approvals obtained
- ✅ Site notification prepared
- ✅ Training materials ready
- ✅ Consent forms updated (if needed)
- ✅ System updates planned
- ✅ Effective date confirmed

#### Step 2: Activate Version
1. Click **"Activate Version"**
2. Confirm effective date
3. Review activation checklist
4. Confirm activation
5. Status changes: APPROVED → ACTIVE
6. Previous ACTIVE version → SUPERSEDED

#### Step 3: Post-Activation
- Sites automatically notified
- Training scheduled
- Documentation distributed
- Compliance monitoring begins

---

## User Workflows & Scenarios

### Scenario 1: Creating Initial Protocol Version

**User:** Sarah Johnson, Protocol Developer  
**Study:** Phase III Oncology Trial  
**Task:** Create first protocol version

**Steps:**
1. Sarah logs into ClinPrecision
2. Navigates to Study Design > Protocol Versions
3. Clicks "Create First Protocol Version"
4. Fills in form:
   - Version: 1.0 (suggested)
   - Description: "Initial protocol for Phase III oncology study"
   - Amendment Type: INITIAL
   - Effective Date: 2025-11-01
5. Clicks "Create Version"
6. Version created with status DRAFT
7. Sarah reviews all details
8. Clicks "Submit for Review"
9. Status changes to PROTOCOL_REVIEW
10. Sarah waits for regulatory approval

**Duration:** 15 minutes  
**Next Steps:** Wait for approval notification

---

### Scenario 2: Creating Minor Amendment

**User:** Dr. Michael Chen, Study Manager  
**Study:** Phase II Diabetes Trial  
**Task:** Update site coordinator contact information

**Steps:**
1. Michael navigates to Protocol Versions
2. Current active version: 1.0 (ACTIVE)
3. Clicks "Create Amendment"
4. System suggests version: 1.1
5. Fills in form:
   - Version: 1.1 (keeps suggestion)
   - Amendment Type: MINOR
   - Description: "Updated site coordinator contact information"
   - Change Summary: "Section 15.2: Updated primary contact from Dr. Smith to Dr. Anderson"
   - Rationale: "Staff change at lead site"
6. Advanced options:
   - Regulatory Approval: NO (administrative change)
   - Effective Date: Immediate
7. Clicks "Create Version"
8. Immediately submits for review
9. Internal approval received same day
10. Activates version
11. All sites notified automatically

**Duration:** 10 minutes  
**Impact:** Low, no patient impact

---

### Scenario 3: Creating Major Safety Amendment

**User:** Dr. Emily Rodriguez, Regulatory Affairs  
**Study:** Phase III Cardiovascular Study  
**Task:** Update safety reporting requirements

**Steps:**
1. Emily creates amendment version 2.0
2. Fills in detailed form:
   - Amendment Type: MAJOR
   - Description: "Enhanced safety monitoring per FDA feedback"
   - Change Summary: 
     ```
     - Section 6.2: SAE reporting reduced from 24h to 12h
     - Section 6.3: Added cardiovascular event monitoring
     - Section 6.4: Enhanced lab monitoring at Week 2, 4
     ```
   - Rationale: "FDA expressed concerns about cardiovascular safety signals in similar studies"
   - Impact Assessment:
     ```
     Sites: Training required (4 hours)
     Patients: Consent update needed
     Regulatory: FDA IND amendment required
     Timeline: 2-week delay for implementation
     Cost: $50K for additional lab monitoring
     ```
3. Submits for internal review
4. Internal approval: 5 days
5. Prepares FDA submission package
6. Submits to FDA
7. Tracks FDA review (30 days)
8. FDA approval received
9. Schedules site training
10. Activates version with 30-day notice
11. Monitors implementation compliance

**Duration:** 60+ days total  
**Impact:** High - requires site training, consent updates

---

### Scenario 4: Rejecting and Revising Amendment

**User:** Dr. Robert Thompson, Medical Monitor  
**Task:** Review and reject amendment for revisions

**Reviewer Perspective:**
1. Robert receives notification: Version 1.1 submitted
2. Opens version for review
3. Reviews changes in detail
4. Identifies issues:
   - Rationale insufficient
   - Impact assessment incomplete
   - Missing risk mitigation plan
5. Adds review comments:
   ```
   - Need more detail on why change is necessary
   - Include risk assessment for new procedures
   - Add plan for handling potential complications
   ```
6. Clicks "Reject - Request Revisions"
7. Status changes: PROTOCOL_REVIEW → DRAFT
8. Protocol developer notified

**Protocol Developer Perspective:**
1. Sarah receives rejection notification
2. Reviews Robert's comments
3. Updates amendment:
   - Adds detailed rationale
   - Completes risk assessment
   - Adds mitigation strategies
4. Resubmits for review
5. Robert reviews updated version
6. Approves version
7. Proceeds to activation

**Duration:** 3-5 days for revision cycle  
**Learning:** Always provide complete documentation initially

---

## Best Practices

### General Best Practices

#### 1. Version Numbering
✅ **Do:**
- Use semantic versioning (Major.Minor)
- Increment minor for small changes (1.0 → 1.1)
- Increment major for significant changes (1.5 → 2.0)
- Keep numbering sequential

❌ **Don't:**
- Skip version numbers (1.0 → 1.5)
- Use inconsistent formats (1.0.1 vs 1-A)
- Reuse version numbers

#### 2. Documentation
✅ **Do:**
- Write clear, detailed descriptions
- Document all changes thoroughly
- Include rationale for every change
- Provide impact assessments
- Keep change log updated

❌ **Don't:**
- Use vague descriptions ("misc changes")
- Skip impact assessments
- Forget to document rationale
- Omit regulatory implications

#### 3. Timing
✅ **Do:**
- Plan amendments well in advance
- Consider study timeline
- Allow adequate review time
- Schedule site implementation carefully
- Communicate timelines clearly

❌ **Don't:**
- Rush amendment creation
- Skip review periods
- Implement without proper notice
- Surprise sites with changes

#### 4. Communication
✅ **Do:**
- Notify stakeholders early
- Provide clear implementation instructions
- Document all decisions
- Keep audit trail complete
- Follow up on implementation

❌ **Don't:**
- Assume everyone knows about changes
- Skip stakeholder notifications
- Implement without confirmation
- Forget to document communications

### Amendment-Specific Best Practices

#### For Minor Amendments
- Fast-track when possible
- Focus on clear documentation
- Minimize site burden
- Implement quickly

#### For Major Amendments
- Plan carefully with all stakeholders
- Comprehensive impact assessment
- Detailed implementation plan
- Adequate site training time
- Monitor implementation closely

#### For Substantial Amendments
- Engage regulatory affairs early
- Document safety rationale thoroughly
- Expedited review if safety-related
- Clear communication to all parties
- Close monitoring post-implementation

### Regulatory Compliance Best Practices

#### Documentation
- Maintain complete audit trail
- Document all decisions
- Keep approval records
- Track regulatory submissions
- Archive historical versions

#### Approval Process
- Follow approval hierarchy
- Obtain all required signatures
- Document reviewer feedback
- Track approval timelines
- Maintain regulatory correspondence

#### Implementation
- Verify site acknowledgment
- Confirm training completion
- Monitor compliance
- Address issues promptly
- Document implementation

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Cannot Submit Version for Review

**Symptoms:**
- "Submit for Review" button disabled
- Error message appears

**Possible Causes & Solutions:**

**Cause 1:** Required fields missing
- **Solution:** Check all required fields are filled in
- **Check:** Version number, description, amendment type

**Cause 2:** Invalid version number
- **Solution:** Ensure version number is unique and properly formatted
- **Format:** Must be Major.Minor (e.g., 1.0, 2.1)

**Cause 3:** Insufficient permissions
- **Solution:** Verify you have Protocol Developer or Study Manager role
- **Action:** Contact system administrator if needed

---

#### Issue 2: Version Stuck in PROTOCOL_REVIEW

**Symptoms:**
- Version in review for extended period
- No approval activity

**Possible Causes & Solutions:**

**Cause 1:** Reviewers not notified
- **Solution:** Manually notify regulatory affairs team
- **Check:** Email notifications sent correctly

**Cause 2:** Reviewer feedback pending
- **Solution:** Check if reviewers left comments
- **Action:** View review comments and respond

**Cause 3:** Approval delegation unclear
- **Solution:** Clarify approval authority
- **Action:** Contact study manager for clarification

---

#### Issue 3: Cannot Activate Approved Version

**Symptoms:**
- "Activate" button disabled
- Error when trying to activate

**Possible Causes & Solutions:**

**Cause 1:** Another version already active
- **Solution:** Only one version can be ACTIVE
- **Action:** Review protocol timeline, ensure previous version will be superseded

**Cause 2:** Regulatory approvals pending
- **Solution:** Verify all required regulatory approvals obtained
- **Check:** Regulatory submissions status

**Cause 3:** Insufficient permissions
- **Solution:** Only Study Manager, Regulatory Affairs, or PI can activate
- **Action:** Request activation from authorized user

---

#### Issue 4: Lost Draft Changes

**Symptoms:**
- Changes made to draft version not saved
- Version reverted to previous state

**Possible Causes & Solutions:**

**Cause 1:** Browser session timeout
- **Solution:** Save frequently during editing
- **Prevention:** Don't leave draft open for extended periods

**Cause 2:** Network issues
- **Solution:** Check internet connection
- **Prevention:** Save after each major change

**Cause 3:** Concurrent editing
- **Solution:** ClinPrecision doesn't support concurrent editing
- **Prevention:** Coordinate with team members

---

#### Issue 5: Version Timeline Not Displaying

**Symptoms:**
- Timeline shows loading spinner
- No versions appear in timeline

**Possible Causes & Solutions:**

**Cause 1:** No versions created yet
- **Solution:** Create your first protocol version
- **Action:** Click "Create First Protocol Version"

**Cause 2:** API connection issue
- **Solution:** Refresh page
- **Check:** Browser console for errors

**Cause 3:** Permissions issue
- **Solution:** Verify you have access to study
- **Action:** Contact study administrator

---

### Getting Help

#### In-App Support
- Click **Help** icon in top navigation
- Search knowledge base
- View tutorial videos
- Access quick reference guides

#### Contact Support
- **Email:** support@clinprecision.com
- **Phone:** 1-800-CLINPRECISION
- **Live Chat:** Available in application (Mon-Fri, 8am-6pm EST)
- **Emergency Support:** 24/7 for critical issues

#### Submit Support Ticket
1. Click Support in main menu
2. Select "Submit Ticket"
3. Choose category: Protocol Version Management
4. Describe issue in detail
5. Attach screenshots if helpful
6. Submit ticket
7. Track ticket status in Support Portal

---

## FAQ

### General Questions

**Q: What's the difference between a Study Version and a Protocol Version?**

A: Study Versions track structural changes to study design (arms, visits, forms), while Protocol Versions track the protocol document itself. They work together but serve different purposes:
- **Study Version:** Configuration changes in the EDC
- **Protocol Version:** Document version and amendment tracking

---

**Q: How many protocol versions can I have?**

A: Unlimited versions. However, only ONE version can be ACTIVE at any time. All previous active versions automatically become SUPERSEDED when a new version is activated.

---

**Q: Can I delete a protocol version?**

A: 
- **DRAFT versions:** Yes, can be deleted if not needed
- **PROTOCOL_REVIEW:** No, must be withdrawn instead
- **APPROVED/ACTIVE/SUPERSEDED:** No, these are permanent records for regulatory compliance

---

**Q: What happens to data when I activate a new protocol version?**

A: Existing data is not affected. The protocol version primarily affects:
- Documentation and procedures
- What sites should follow going forward
- Regulatory submissions and compliance
- Audit trail for future reference

---

### Version Numbering Questions

**Q: What version number should I use for my first protocol?**

A: Use **1.0** for your initial protocol version. The system suggests this automatically.

---

**Q: When should I increment the major vs. minor version number?**

A:
- **Minor increment (1.0 → 1.1):** Administrative changes, clarifications, minor amendments
- **Major increment (1.5 → 2.0):** Significant changes to study design, major amendments, substantial modifications

---

**Q: Can I use three-part version numbers (1.0.1)?**

A: Currently, the system supports two-part version numbers (Major.Minor). If you need more granular tracking, use the description field to note sub-versions.

---

### Amendment Questions

**Q: When is regulatory approval required for an amendment?**

A:
- **MINOR amendments:** Usually internal approval only
- **MAJOR amendments:** FDA/EMA approval typically required
- **SUBSTANTIAL amendments:** Always require regulatory approval
- Check with your regulatory affairs team for specific requirements

---

**Q: How long does the amendment approval process take?**

A:
- **Internal review:** 1-10 business days (depends on amendment type)
- **FDA review:** 30 days (standard IND amendment)
- **EMA review:** 35-60 days
- **IRB/EC review:** 2-4 weeks
- Plan accordingly and build in buffer time

---

**Q: Can I have multiple amendments in review simultaneously?**

A: Yes, you can have multiple versions in PROTOCOL_REVIEW status. However, they must be activated sequentially - you cannot skip versions.

---

### Status Questions

**Q: Can I edit a version after submitting for review?**

A: No. Once submitted (status = PROTOCOL_REVIEW), the version is locked. If changes are needed:
1. Ask reviewer to reject back to DRAFT
2. Make your changes
3. Resubmit for review

---

**Q: What does SUPERSEDED status mean?**

A: SUPERSEDED means this version was previously active but has been replaced by a newer active version. It's kept as a historical record and cannot be edited or reactivated.

---

**Q: Can I revert to a previous protocol version?**

A: No direct revert. If you need to go back to a previous version:
1. Create a new amendment
2. Reference the previous version you want to restore
3. Go through the approval process
4. Activate the new version

---

### Permission Questions

**Q: Who can create protocol versions?**

A: Protocol Developers and Study Managers can create versions. Other roles can only view versions.

---

**Q: Who can approve protocol versions?**

A: Regulatory Affairs, Study Managers, and Principal Investigators can approve versions. Approval authority may vary by organization.

---

**Q: Can site staff view protocol versions?**

A: Yes, site staff (CRAs, Site Coordinators) can view all protocol versions but cannot create, edit, or approve them.

---

### Technical Questions

**Q: Is version history preserved forever?**

A: Yes. All protocol versions are permanently stored for regulatory compliance and audit purposes. Even withdrawn versions remain in the system as read-only records.

---

**Q: Can I compare two protocol versions?**

A: Yes. The Version Comparison feature allows you to view side-by-side differences between any two versions. (Feature documentation coming soon)

---

**Q: How are sites notified of new protocol versions?**

A: When a version is activated:
1. Automatic email notifications sent to all site staff
2. Notification appears in site portal
3. Sites must acknowledge receipt
4. Training completion tracked (if required)

---

**Q: Can I export protocol version documentation?**

A: Yes. You can export:
- Individual version details (PDF)
- Complete version history (PDF/Excel)
- Change summary reports
- Regulatory submission packages

---

## Document Information

**Version:** 2.0  
**Last Updated:** October 2, 2025  
**Document Owner:** ClinPrecision Product Team  
**Review Cycle:** Quarterly  
**Next Review:** January 2, 2026

**Related Documents:**
- [Protocol Version Implementation Guide](./PROTOCOL_VERSION_IMPLEMENTATION.md)
- [Protocol Version Status Workflow](./PROTOCOL_VERSION_STATUS_WORKFLOW.md)
- [Protocol Version Lifecycle Documentation](./PROTOCOL_VERSION_LIFECYCLE.md)
- [Study Design Module Plan](../../STUDY_DESIGN_MODULE_PLAN.md)

**Change History:**
- Version 1.0 (June 2025): Initial release
- Version 1.5 (August 2025): Added amendment workflows
- Version 2.0 (October 2025): Consolidated from multiple source documents, added comprehensive user workflows

---

*This document is proprietary and confidential. Unauthorized distribution is prohibited.*
