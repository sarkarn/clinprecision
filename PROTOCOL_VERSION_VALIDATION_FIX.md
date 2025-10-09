# Protocol Version Validation Fix

**Date**: October 8, 2025  
**Issue**: "Study must have at least one protocol version before review" error even when protocol version exists  
**Root Cause**: Query mismatch between projection and validation service  
**Status**: ✅ FIXED

---

## Problem Analysis

### Symptom
User clicked "Submit for Review" in Review & Validation phase and got error:
```
Status transition validation failed: Cannot transition study to status PROTOCOL_REVIEW: 
Study must have at least one protocol version before review
```

Even though a protocol version existed with status `UNDER_REVIEW`.

### Root Cause

**Projection Issue** (NOT an eventual consistency issue):
```java
// ProtocolVersionProjection.java - Line 46
entity.setStudyAggregateUuid(event.getStudyAggregateUuid()); // ✅ Sets UUID
// entity.setStudyId(...); // ❌ Never set!
```

**Validation Query** (Legacy approach):
```java
// CrossEntityStatusValidationService.java - Line 53 (BEFORE FIX)
List<ProtocolVersionEntity> versions = 
    studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId()); // ❌ Queries by Long ID
```

**Result**: Query returned empty list because `studyId` field was NULL in database!

---

## Architecture Context

### DDD Migration Status
- **Protocol Version Module**: ✅ Fully migrated to DDD/Event Sourcing with UUID identifiers
- **Study Module**: ⚠️ Still using legacy Long ID (migration in progress)

### Entity Structure
```java
@Entity
public class ProtocolVersionEntity {
    @Id
    private Long id;  // JPA auto-generated
    
    // DDD Approach (NEW)
    private UUID aggregateUuid;         // ✅ Set by projection
    private UUID studyAggregateUuid;    // ✅ Set by projection
    
    // Legacy Approach (DEPRECATED)
    @Deprecated
    private Long studyId;  // ❌ NOT set by projection (NULL in DB)
}
```

### Repository Methods
```java
public interface ProtocolVersionReadRepository {
    // DDD approach (NEW)
    List<ProtocolVersionEntity> findByStudyAggregateUuid(UUID studyUuid); // ✅
    
    // Legacy approach (DEPRECATED)
    @Deprecated
    List<ProtocolVersionEntity> findByStudyIdOrderByVersionNumberDesc(Long studyId); // ❌
}
```

---

## Solution Implemented

### Changed File
`CrossEntityStatusValidationService.java`

### Before (Lines 40-58):
```java
public CrossEntityValidationResult validateCrossEntityDependencies(StudyEntity study, String targetStatus, String operation) {
    logger.debug("Performing cross-entity validation for study {} - target status: {} - operation: {}", 
                study.getId(), targetStatus, operation);

    List<String> errors = new ArrayList<>();
    List<String> warnings = new ArrayList<>();
    Map<String, Object> validationDetails = new HashMap<>();

    // Get related entities
    List<ProtocolVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
    List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStudyIdOrderByVersionAndAmendmentNumber(study.getId());

    validationDetails.put("protocolVersionCount", versions.size());
    validationDetails.put("amendmentCount", amendments.size());
```

### After (Lines 40-68):
```java
public CrossEntityValidationResult validateCrossEntityDependencies(StudyEntity study, String targetStatus, String operation) {
    logger.debug("Performing cross-entity validation for study {} - target status: {} - operation: {}", 
                study.getId(), targetStatus, operation);

    List<String> errors = new ArrayList<>();
    List<String> warnings = new ArrayList<>();
    Map<String, Object> validationDetails = new HashMap<>();

    // Get related entities - Use UUID-based queries for DDD aggregates
    List<ProtocolVersionEntity> versions;
    if (study.getStudyAggregateUuid() != null) {
        // DDD approach: Use aggregate UUID
        logger.debug("Using UUID-based query for protocol versions: {}", study.getStudyAggregateUuid());
        versions = studyVersionRepository.findByStudyAggregateUuid(study.getStudyAggregateUuid());
    } else {
        // Fallback to legacy ID for non-migrated studies
        logger.warn("Study {} has no aggregate UUID, using legacy ID query", study.getId());
        versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
    }
    
    List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStudyIdOrderByVersionAndAmendmentNumber(study.getId());

    validationDetails.put("protocolVersionCount", versions.size());
    validationDetails.put("amendmentCount", amendments.size());
    
    logger.debug("Found {} protocol versions for study {}", versions.size(), study.getId());
```

---

## Key Changes

### ✅ UUID-Based Query (Primary)
```java
if (study.getStudyAggregateUuid() != null) {
    versions = studyVersionRepository.findByStudyAggregateUuid(study.getStudyAggregateUuid());
}
```
- Queries by `studyAggregateUuid` (UUID) which **IS** set by projection
- Matches the DDD aggregate approach
- Will find protocol versions created through event sourcing

### ✅ Legacy Fallback (Backward Compatibility)
```java
else {
    logger.warn("Study {} has no aggregate UUID, using legacy ID query", study.getId());
    versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
}
```
- For studies not yet migrated to DDD
- Ensures backward compatibility during migration

### ✅ Debug Logging
```java
logger.debug("Found {} protocol versions for study {}", versions.size(), study.getId());
```
- Added visibility for troubleshooting
- Helps confirm query is working

---

## Business Logic Context

### Study Status Workflow
```
PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE
           ↑
           └── Requires: At least 1 protocol version
```

### Protocol Version Status Workflow
```
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE
```

### Validation Rule (Line 111)
```java
// Must have at least one protocol version
if (versions.isEmpty()) {
    errors.add("Study must have at least one protocol version before review");
}
```

**Question**: Is this the correct business rule?

**Answer**: ✅ YES - This is correct for regulatory compliance:
- Studies must have documented protocol versions before review
- Prevents submitting incomplete study designs
- Ensures audit trail exists from the start

---

## Alternative Solutions Considered

### Option 1: Set studyId in Projection ❌ REJECTED
```java
// Would need to add to event:
private Long studyId; // Breaks DDD - aggregates shouldn't know about legacy IDs

// And in projection:
entity.setStudyId(event.getStudyId());
```

**Why Rejected**:
- Violates DDD principles (aggregates shouldn't have legacy IDs)
- Pollutes event-sourced domain with infrastructure concerns
- Moves backward instead of forward in migration

### Option 2: Use UUID Query ✅ CHOSEN
```java
versions = studyVersionRepository.findByStudyAggregateUuid(study.getStudyAggregateUuid());
```

**Why Chosen**:
- Aligns with DDD migration direction
- Uses aggregate identifiers correctly
- Maintains backward compatibility with fallback
- Clean separation of concerns

---

## Testing Checklist

### Backend
- [ ] Restart backend service
- [ ] Check logs for: `"Using UUID-based query for protocol versions: {uuid}"`
- [ ] Verify validation finds protocol versions
- [ ] Confirm no "Study must have at least one protocol version" error

### Frontend
- [ ] Restart frontend development server (to load modal close fix)
- [ ] Navigate to Review & Validation phase
- [ ] Create protocol version if needed
- [ ] Click "Submit for Review" button
- [ ] Expected: ✅ Success message
- [ ] Expected: Study status changes to PROTOCOL_REVIEW
- [ ] Expected: Review phase marked complete

### Database Verification
```sql
-- Check protocol versions have studyAggregateUuid set
SELECT 
    id, 
    aggregate_uuid, 
    study_aggregate_uuid,  -- Should be populated
    study_id,              -- May be NULL (expected)
    version_number,
    status
FROM protocol_version
ORDER BY created_at DESC;

-- Verify study has aggregateUuid
SELECT 
    id,
    study_aggregate_uuid,  -- Should be populated for new studies
    study_status_code
FROM study
WHERE id = <your_study_id>;
```

---

## Related Fixes in This Session

### 1. ✅ Controller Path Fix
**File**: `ProtocolVersionBridgeController.java` (NEW)  
**Issue**: Frontend calling `/api/study-versions/{id}/status` but no endpoint existed  
**Fix**: Created bridge controller at correct path

### 2. ✅ Reason Field Validation
**File**: `ProtocolVersionBridgeController.java`, hook files  
**Issue**: "Status change reason is required" error  
**Fix**: Updated frontend to send audit trail reasons

### 3. ✅ Modal Auto-Close
**File**: `ProtocolVersionManagementModal.jsx`  
**Issue**: Modal stayed open after status change (user had to manually refresh)  
**Fix**: Added `onClose()` calls after successful status changes

### 4. ✅ Button Visibility Logic
**File**: `useProtocolVersioning.js`, `ProtocolVersionActions.jsx`  
**Issue**: User asked if "Submit for Review" should be hidden when UNDER_REVIEW  
**Fix**: Verified existing logic already correct (`canSubmit: false`)

### 5. ✅ Validation Query Fix (THIS FIX)
**File**: `CrossEntityStatusValidationService.java`  
**Issue**: Validation couldn't find protocol versions (query mismatch)  
**Fix**: Changed to UUID-based query matching projection

---

## Next Steps

### Immediate
1. **Test the complete flow**: Create version → Submit for review → Verify success
2. **Monitor logs**: Ensure UUID query is being used
3. **Verify database**: Confirm `study_aggregate_uuid` is populated

### Future Improvements
1. **Study Module Migration**: Complete DDD migration for Study aggregate
2. **Remove Legacy Methods**: After Study migration, remove deprecated `findByStudyId*` methods
3. **Consistent Queries**: Ensure all cross-entity validations use UUID-based queries
4. **Event Store Optimization**: Consider read model replay if data issues persist

---

## Documentation References

- `CONTROLLER_CLEANUP_SUMMARY_20251008.md` - Controller separation cleanup
- `STATUS_CHANGE_REASON_FIX.md` - Audit trail reason requirement fix
- `PROTOCOL_VERSION_UI_BEHAVIOR.md` - Button visibility and status config
- `PROTOCOL_VERSION_MODAL_CLOSE_FIX.md` - Auto-refresh after status change

---

## Conclusion

✅ **Root cause identified and fixed**

The validation service was using a legacy query method (`findByStudyId`) that couldn't find protocol versions created through the DDD/Event Sourcing approach. The fix updates the validation to use UUID-based queries that match the projection's data model.

This is NOT an eventual consistency issue - it's a query mismatch between legacy and DDD approaches during the migration period. The fix maintains backward compatibility while properly supporting the new DDD architecture.

**Status**: Ready for testing
