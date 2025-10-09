# Submit for Review Workflow Guide

**Date:** 2025-10-08
**Issue:** "Study must have at least one protocol version before review"
**Type:** ✅ Expected Business Rule Validation
**Status:** Working As Designed

## This is NOT a Bug

The error you're seeing is **correct behavior** enforcing standard clinical trial workflow:

```
❌ ERROR: Study must have at least one protocol version before review
```

### Why This Validation Exists

In clinical trials, you **cannot submit a study for review** without a protocol document. This is:
- ✅ **Required by regulations** (FDA, EMA, etc.)
- ✅ **Standard industry practice**
- ✅ **Enforced by the system** for data integrity

The validation is implemented in `CrossEntityStatusValidationService.validateProtocolReviewDependencies()`.

## Proper Workflow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Study Created (PLANNING status)                          │
│    ↓                                                         │
│ 2. Design Study (Arms, Visits, Forms) ← You are here       │
│    ↓                                                         │
│ 3. Create Protocol Version 1.0 (DRAFT) ← MUST DO THIS!     │
│    ↓                                                         │
│ 4. Submit for Review (PROTOCOL_REVIEW status) ✅ Now OK     │
│    ↓                                                         │
│ 5. Review & Approve Protocol                                │
│    ↓                                                         │
│ 6. Regulatory Submission                                    │
└─────────────────────────────────────────────────────────────┘
```

### What You Need to Do

**Before clicking "Submit for Review", you must:**

1. **Create a Protocol Version**
   - Navigate to Protocol Version Management
   - Create Version 1.0
   - Status: DRAFT or UNDER_REVIEW
   - Include protocol document details

2. **Then Submit for Review**
   - Now the validation will pass
   - Status changes: PLANNING → PROTOCOL_REVIEW

## How to Create Protocol Version

### Option 1: Using Frontend (Recommended)

If your frontend has protocol version management:

1. Go to Study Design → Protocol Versions
2. Click "Create New Version"
3. Fill in:
   - Version Number: 1.0
   - Effective Date: Today
   - Description: Initial protocol
   - Status: DRAFT
4. Save
5. Now click "Submit for Review" ✅

### Option 2: Using REST API Directly

If you need to create via API:

**Endpoint:** `POST /api/studies/{studyId}/protocol-versions`

**Request Body:**
```json
{
  "versionNumber": "1.0",
  "effectiveDate": "2025-10-08",
  "description": "Initial protocol version",
  "status": "DRAFT",
  "changes": "Initial version"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8080/api/studies/11/protocol-versions \
  -H "Content-Type: application/json" \
  -d '{
    "versionNumber": "1.0",
    "effectiveDate": "2025-10-08",
    "description": "Initial protocol version",
    "status": "DRAFT"
  }'
```

### Option 3: Direct Database Insert (For Testing ONLY)

If you need to quickly test status change without full workflow:

```sql
-- Insert a minimal protocol version
INSERT INTO protocol_version_entity (
    id,
    study_id,
    version_number,
    status,
    effective_date,
    description,
    created_date,
    created_by
) VALUES (
    UUID(),
    11,  -- Your study ID
    '1.0',
    'DRAFT',
    CURDATE(),
    'Initial protocol for testing',
    NOW(),
    'system'
);
```

**Note:** This bypasses business logic and should only be used for testing!

## Understanding the Validation

### What the System Checks

When you click "Submit for Review", the system validates:

1. **Protocol Version Exists** ✅ Required
   ```java
   if (versions.isEmpty()) {
       errors.add("Study must have at least one protocol version before review");
   }
   ```

2. **Version is Reviewable** ⚠️ Warning Only
   - At least one version in DRAFT or UNDER_REVIEW status
   - If none, warning issued but not blocking

3. **Pending Amendments** ℹ️ Informational
   - Checks for pending amendments
   - Warning if any exist

### Validation Logic Location

**File:** `CrossEntityStatusValidationService.java`
```java
private void validateProtocolReviewDependencies(
    StudyEntity study, 
    List<ProtocolVersionEntity> versions,
    List<StudyAmendmentEntity> amendments, 
    List<String> errors, 
    List<String> warnings, 
    Map<String, Object> details
) {
    // Must have at least one protocol version
    if (versions.isEmpty()) {
        errors.add("Study must have at least one protocol version before review");
    }
    
    // Check if there's a version ready for review
    boolean hasReviewableVersion = versions.stream()
        .anyMatch(v -> v.getStatus() == VersionStatus.DRAFT ||
                      v.getStatus() == VersionStatus.UNDER_REVIEW);
    
    if (!hasReviewableVersion) {
        warnings.add("No protocol versions in reviewable status");
    }
}
```

## Bypassing Validation (NOT Recommended)

If you **absolutely must test** status changes without creating protocol versions, you have two options:

### Option A: Temporary Flag (Recommended for Testing)

Add a configuration property to disable validation:

**In `application.yml`:**
```yaml
clinprecision:
  validation:
    cross-entity:
      enabled: false  # Disable for testing only!
```

### Option B: Comment Out Validation (Quick & Dirty)

**File:** `CrossEntityStatusValidationService.java`

```java
// Temporarily comment out for testing
/*
if (versions.isEmpty()) {
    errors.add("Study must have at least one protocol version before review");
}
*/
```

**⚠️ WARNING:** 
- Only do this in development environment
- Re-enable before production deployment
- This bypasses important business rules

## Status Transition Requirements

Different statuses have different requirements:

| Target Status | Protocol Version Required? | Other Requirements |
|---------------|---------------------------|-------------------|
| PLANNING | ❌ No | - |
| **PROTOCOL_REVIEW** | ✅ **YES - At least 1** | Version in DRAFT/UNDER_REVIEW |
| REGULATORY_SUBMISSION | ✅ YES - At least 1 | Version in UNDER_REVIEW or APPROVED |
| APPROVED | ✅ YES - 1 Approved | At least 1 APPROVED version |
| ACTIVE | ✅ YES - 1 Approved | All regulatory approvals |

## Complete Example Workflow

### Test Scenario: Submit Study 11 for Review

**Step 1: Check Current Status**
```bash
GET /api/studies/11
# Response: { ..., "status": "PLANNING" }
```

**Step 2: Create Protocol Version**
```bash
POST /api/studies/11/protocol-versions
{
  "versionNumber": "1.0",
  "effectiveDate": "2025-10-08",
  "description": "Initial protocol",
  "status": "DRAFT"
}
# Response: { ..., "id": "uuid-123", "versionNumber": "1.0" }
```

**Step 3: Verify Protocol Version Created**
```bash
GET /api/studies/11/protocol-versions
# Response: [{ ..., "versionNumber": "1.0", "status": "DRAFT" }]
```

**Step 4: Submit for Review**
```bash
PATCH /api/studies/11/status
{
  "newStatus": "PROTOCOL_REVIEW"
}
# Response: 200 OK ✅
```

**Step 5: Verify Status Changed**
```bash
GET /api/studies/11
# Response: { ..., "status": "PROTOCOL_REVIEW" }
```

## Troubleshooting

### Error: "Study must have at least one protocol version"

**Cause:** No protocol versions exist for the study

**Solution:** Create a protocol version first (see above)

### Error: No protocol versions in reviewable status

**Type:** Warning only (not blocking)

**Cause:** Protocol versions exist but none are in DRAFT or UNDER_REVIEW status

**Solution:** 
- Update existing version to DRAFT status, or
- Create new version with DRAFT status

### Error: Study has pending amendments

**Type:** Warning only (not blocking)

**Cause:** Amendments exist in DRAFT or UNDER_REVIEW status

**Solution:** This is informational - review can proceed

## Frontend Integration

If you're implementing the frontend workflow:

### Recommended UI Flow

```jsx
// StudyDesignDashboard.jsx - Review & Validation Phase

const handleSubmitForReview = async () => {
  try {
    // Step 1: Check if protocol version exists
    const versions = await ProtocolVersionService.getVersions(studyId);
    
    if (versions.length === 0) {
      // Show modal: "You must create a protocol version first"
      setShowProtocolVersionModal(true);
      return;
    }
    
    // Step 2: Proceed with status change
    await StudyDesignService.changeStudyStatus(studyId, 'PROTOCOL_REVIEW');
    
    // Success
    toast.success('Study submitted for review');
    navigate('/studies');
    
  } catch (error) {
    if (error.message.includes('protocol version')) {
      // Show helpful error with action button
      toast.error(
        'Please create a protocol version before submitting for review',
        { action: { label: 'Create Version', onClick: openProtocolModal } }
      );
    }
  }
};
```

### Validation Before Submit

```jsx
const canSubmitForReview = () => {
  return protocolVersions.length > 0;
};

<Button 
  onClick={handleSubmitForReview}
  disabled={!canSubmitForReview()}
  title={!canSubmitForReview() ? 'Create a protocol version first' : ''}
>
  Submit for Review
</Button>
```

## Related Business Rules

### Protocol Version Status Flow

```
DRAFT → UNDER_REVIEW → APPROVED → EFFECTIVE → SUPERSEDED
```

### Study Status Flow

```
DRAFT → PLANNING → PROTOCOL_REVIEW → REGULATORY_SUBMISSION → APPROVED → ACTIVE
```

### Dependencies

- Study PROTOCOL_REVIEW ← Requires Protocol Version (any status)
- Study APPROVED ← Requires Protocol Version (APPROVED status)
- Study ACTIVE ← Requires Protocol Version (EFFECTIVE status)

## Summary

### ✅ This is Working Correctly

The validation error you're seeing is:
- ✅ **Expected behavior**
- ✅ **Industry standard requirement**
- ✅ **Regulatory compliance**
- ✅ **Data integrity protection**

### 🎯 What You Should Do

1. **For Production:** Create protocol version before submitting for review
2. **For Testing:** Either:
   - Create a minimal protocol version, or
   - Temporarily disable validation (with caution)

### 📚 Related Documentation

- `PROTOCOL_VERSION_DDD_MIGRATION_COMPLETE.md` - Protocol version implementation
- `STUDY_VS_STUDYDESIGN_UUID_FIX.md` - Recent aggregate UUID fix
- `PROTOCOL_REVIEW_STATUS_FIX.md` - Status transition implementation
- `CrossEntityStatusValidationService.java` - Validation logic

---

**Status:** ✅ Working As Designed
**Action Required:** Create Protocol Version Before Review
**Priority:** Follow proper workflow for production use
