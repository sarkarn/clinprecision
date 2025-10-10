# Protocol Version Bridge Pattern Fix - 404 Error Resolution

## Issue Summary
**Problem**: Frontend calling `/api/protocol-versions/study/11` (legacy study ID) returned 404 Not Found
```
GET http://localhost:8083/api/protocol-versions/study/11 → 404 (Not Found)
Error fetching protocol versions: AxiosError
```

**Root Cause**: Backend endpoint expected UUID format but frontend was passing legacy numeric study ID.

## Solution Applied

### Backend Changes: `ProtocolVersionQueryController.java`

Added **Bridge Pattern** support to protocol version query endpoints to accept both UUID and legacy study IDs.

#### 1. Added StudyQueryService Dependency
```java
@RestController
@RequestMapping("/api/protocol-versions")
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionQueryController {

    private final ProtocolVersionQueryService queryService;
    private final com.clinprecision.clinopsservice.study.service.StudyQueryService studyQueryService; // ← ADDED
```

#### 2. Updated Get Versions Endpoint - Bridge Pattern
**Endpoint**: `GET /api/protocol-versions/study/{studyId}`

**Before**:
```java
@GetMapping("/study/{studyUuid}")
public ResponseEntity<List<VersionResponse>> getVersionsByStudyUuid(@PathVariable UUID studyUuid) {
    // Only accepted UUID format
    List<VersionResponse> versions = queryService.findByStudyUuidOrderedByDate(studyUuid)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
    return ResponseEntity.ok(versions);
}
```

**After**:
```java
@GetMapping("/study/{studyId}")
public ResponseEntity<List<VersionResponse>> getVersionsByStudyUuid(@PathVariable String studyId) {
    log.info("REST: Querying versions for study: {}", studyId);
    
    // Bridge Pattern: Resolve Study aggregate UUID
    UUID studyAggregateUuid;
    try {
        // Try as UUID first
        studyAggregateUuid = UUID.fromString(studyId);
        log.debug("REST: Using UUID format for protocol version query");
    } catch (IllegalArgumentException e) {
        // Not a UUID, try as legacy ID
        try {
            Long legacyId = Long.parseLong(studyId);
            log.info("REST: Using legacy ID {} for protocol version query (Bridge Pattern)", legacyId);
            
            // Get Study entity to retrieve its aggregate UUID
            com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto study = 
                studyQueryService.getStudyById(legacyId);
            studyAggregateUuid = study.getStudyAggregateUuid();
            
            if (studyAggregateUuid == null) {
                log.error("REST: Study {} has no aggregate UUID - cannot query protocol versions", legacyId);
                return ResponseEntity.notFound().build();
            }
            
            log.info("REST: Resolved legacy study ID {} to UUID: {}", legacyId, studyAggregateUuid);
        } catch (NumberFormatException nfe) {
            log.error("REST: Invalid identifier format (not UUID or numeric): {}", studyId);
            return ResponseEntity.badRequest().build();
        }
    }
    
    List<VersionResponse> versions = queryService.findByStudyUuidOrderedByDate(studyAggregateUuid)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
    
    log.info("REST: Found {} protocol versions for study: {}", versions.size(), studyAggregateUuid);
    return ResponseEntity.ok(versions);
}
```

#### 3. Updated Get Active Version Endpoint - Bridge Pattern
**Endpoint**: `GET /api/protocol-versions/study/{studyId}/active`

Applied same bridge pattern logic to resolve legacy study ID to UUID before querying for active protocol version.

## How It Works

### Request Flow (Legacy ID)
```
1. Frontend → GET /api/protocol-versions/study/11
2. Backend receives studyId = "11" (String)
3. Try parse as UUID → Fails (not UUID format)
4. Try parse as Long → Success (legacyId = 11)
5. Query: studyQueryService.getStudyById(11)
6. Extract: studyAggregateUuid from Study entity
7. If UUID exists:
   - Query protocol versions by studyAggregateUuid
   - Return results
8. If UUID is null:
   - Study not migrated to DDD yet
   - Return 404 Not Found
```

### Request Flow (UUID)
```
1. Frontend → GET /api/protocol-versions/study/123e4567-e89b-12d3-a456-426614174000
2. Backend receives studyId = "123e4567-e89b-12d3-a456-426614174000"
3. Try parse as UUID → Success
4. Query protocol versions by UUID directly
5. Return results
```

## Potential Issue: Study Not Migrated to DDD

If you're still getting 404 errors after the fix, it means:

**Study ID 11 has not been migrated to DDD pattern yet** - The `study_aggregate_uuid` column in the `study` table is NULL.

### Check Database
```sql
SELECT id, name, study_aggregate_uuid 
FROM study 
WHERE id = 11;
```

### Expected Result
- **If study_aggregate_uuid is NULL**: Study hasn't been migrated, protocol versions can't be queried
- **If study_aggregate_uuid exists**: Bridge pattern should work, check if protocol versions exist for that UUID

### Migration Status
The bridge pattern is in place for:
- ✅ `StudyCommandController.java` - Study operations
- ✅ `ProtocolVersionQueryController.java` - Protocol version queries (JUST ADDED)
- ✅ `ProtocolVersionCommandController.java` - Protocol version commands (already exists via StudyCommandController bridge)

## Alternative: Frontend Could Pass UUID

If studies are migrated and have UUIDs, the frontend could be updated to pass the UUID instead of legacy ID:

**Current (Legacy ID)**:
```javascript
const studyId = 11; // From route params or props
ProtocolVersionService.getProtocolVersions(studyId);
// → GET /api/protocol-versions/study/11
```

**Alternative (UUID)**:
```javascript
const studyUuid = "123e4567-e89b-12d3-a456-426614174000"; // From study object
ProtocolVersionService.getProtocolVersions(studyUuid);
// → GET /api/protocol-versions/study/123e4567-e89b-12d3-a456-426614174000
```

However, the bridge pattern allows both to work during the migration period.

## Testing

### Test with Legacy ID
```bash
curl -X GET http://localhost:8083/api/protocol-versions/study/11
```

**Expected**:
- If study has UUID: Returns list of protocol versions (possibly empty array)
- If study has no UUID: Returns 404

### Test with UUID
```bash
curl -X GET http://localhost:8083/api/protocol-versions/study/123e4567-e89b-12d3-a456-426614174000
```

**Expected**: Returns list of protocol versions

### Check Backend Logs
Look for these log messages:
```
REST: Querying versions for study: 11
REST: Using legacy ID 11 for protocol version query (Bridge Pattern)
REST: Resolved legacy study ID 11 to UUID: {uuid}
REST: Found {count} protocol versions for study: {uuid}
```

Or if study not migrated:
```
REST: Study 11 has no aggregate UUID - cannot query protocol versions
```

## Next Steps

1. **Check backend logs** - Look for "Study 11 has no aggregate UUID" message
2. **Verify database** - Check if study 11 has a study_aggregate_uuid
3. **Create protocol version** - If study is migrated, create a protocol version first
4. **Test both endpoints** - Try both legacy ID and UUID format

## Files Modified

- `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/protocolversion/controller/ProtocolVersionQueryController.java`
  - Added StudyQueryService dependency
  - Updated `getVersionsByStudyUuid()` method signature to accept String (bridge pattern)
  - Updated `getActiveVersionByStudyUuid()` method signature to accept String (bridge pattern)
  - Added UUID resolution logic for both endpoints

## Related Documentation

- `PROTOCOL_ACTIVATION_API_FIX.md` - Previous fix for activation endpoint
- `StudyCommandController.java` - Reference implementation of bridge pattern for study operations

---
**Date**: October 9, 2025
**Fixed By**: AI Agent (GitHub Copilot)
**Session**: Protocol Version Bridge Pattern Implementation
