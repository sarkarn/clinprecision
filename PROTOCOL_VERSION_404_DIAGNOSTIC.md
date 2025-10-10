# Protocol Version 404 Error - Diagnostic Guide

## Current Error
```
GET http://localhost:8083/api/protocol-versions/study/11 → 404 (Not Found)
```

## Expected Behavior
After the bridge pattern fix, the endpoint should:
1. Accept legacy study ID `11`
2. Look up study to get `studyAggregateUuid`
3. Query protocol versions by UUID
4. Return list of versions (or empty array `[]`)

## Diagnostic Steps

### Step 1: Verify Backend is Running with New Code

**Check backend console for this log message when you load the page:**
```
REST: Querying versions for study: 11
```

**If you see it:**
- ✅ Backend is running new code
- Continue to Step 2

**If you DON'T see it:**
- ❌ Backend is still running OLD code
- **Action**: Stop and restart the clinops-service
- Old code only accepts UUID format, so it returns 404 for numeric ID

### Step 2: Check if Study Has UUID

**If you see this log:**
```
REST: Using legacy ID 11 for protocol version query (Bridge Pattern)
REST: Resolved legacy study ID 11 to UUID: {some-uuid}
```
- ✅ Study has been migrated
- Continue to Step 3

**If you see this log:**
```
REST: Study 11 has no aggregate UUID - cannot query protocol versions
```
- ❌ Study not migrated to DDD
- **Action**: Run SQL to check:
```sql
SELECT id, name, study_aggregate_uuid FROM study WHERE id = 11;
```
- If `study_aggregate_uuid` is NULL, the study needs to be migrated

### Step 3: Check Query Results

**If you see this log:**
```
REST: Found 0 protocol versions for study: {uuid}
```
- ✅ Query worked, but no protocol versions exist yet
- **Action**: Create a protocol version first
- Frontend should show empty state, not error

**If you see this log:**
```
REST: Found 3 protocol versions for study: {uuid}
```
- ✅ Everything working correctly!
- Frontend should display the versions

### Step 4: Network Tab Check

Open browser DevTools → Network tab → Refresh page

**Look for the request:**
```
GET http://localhost:8083/api/protocol-versions/study/11
```

**Check the response:**
- **Status 404**: Backend not returning data (see Steps 1-3)
- **Status 400**: Bad request format (shouldn't happen with bridge pattern)
- **Status 200**: Success! Check response body for data

## Common Issues

### Issue 1: Backend Not Restarted
**Symptoms:**
- No log messages in backend console
- Still getting 404 error

**Solution:**
1. Stop the clinops-service (Ctrl+C in terminal or kill process)
2. Rebuild if needed: `mvn clean compile`
3. Restart: `mvn spring-boot:run`
4. Wait for "Started ClinopsServiceApplication" message
5. Refresh frontend

### Issue 2: Study Not Migrated
**Symptoms:**
- Log shows "Study 11 has no aggregate UUID"
- 404 error returned

**Solution:**
Study needs to be migrated to DDD. Check database:
```sql
SELECT id, name, study_aggregate_uuid FROM study WHERE id = 11;
```

If `study_aggregate_uuid` is NULL, you need to:
1. Create the study aggregate
2. Or use a different study that's been migrated

### Issue 3: No Protocol Versions Exist
**Symptoms:**
- Log shows "Found 0 protocol versions"
- Frontend shows error instead of empty state

**Solution:**
This is actually not an error - the study just doesn't have protocol versions yet. The frontend should handle empty array gracefully.

Check `useProtocolVersioning.js` - it should handle empty arrays:
```javascript
if (!Array.isArray(versions)) {
    setProtocolVersions([]);
} else {
    setProtocolVersions(versions);
}
```

### Issue 4: Wrong Service Class Loaded
**Symptoms:**
- Backend seems to be running but endpoints don't match

**Solution:**
Check if the correct controller is being scanned:
```
@ComponentScan(basePackages = "com.clinprecision.clinopsservice")
```

## File Changes Made

### Backend Files Modified:
1. **ProtocolVersionQueryController.java**
   - Added `StudyQueryService` dependency
   - Changed `@GetMapping("/study/{studyId}")` parameter from `UUID` to `String`
   - Added bridge pattern logic to resolve legacy ID to UUID

2. **StudyQueryController.java**
   - Removed duplicate `/versions/history` endpoint
   - Removed `protocolVersionQueryService` dependency
   - Cleaned up to follow bounded context principles

### Frontend Files (Already Correct):
1. **ProtocolVersionService.js**
   - Calls `/api/protocol-versions/study/${studyId}`
   - This is correct!

2. **useProtocolVersioning.js**
   - Uses `ProtocolVersionService.getProtocolVersions(studyId)`
   - This is correct!

## Testing Checklist

- [ ] Backend service restarted after code changes
- [ ] Backend logs show "REST: Querying versions for study: 11"
- [ ] Backend logs show UUID resolution: "Resolved legacy study ID 11 to UUID: ..."
- [ ] Backend logs show query result: "Found X protocol versions"
- [ ] Frontend Network tab shows 200 OK response (not 404)
- [ ] Frontend displays protocol versions (or empty state if none exist)

## Quick Test Commands

### Test Backend Endpoint Directly
```bash
# Test with legacy ID
curl -X GET http://localhost:8083/api/protocol-versions/study/11

# Test with UUID (if you know the study UUID)
curl -X GET http://localhost:8083/api/protocol-versions/study/123e4567-e89b-12d3-a456-426614174000
```

### Check Backend Logs
```bash
# Tail backend logs (if running as service)
tail -f backend/clinprecision-clinops-service/logs/application.log

# Or watch console output if running with mvn spring-boot:run
```

### Check Database
```sql
-- Check if study has UUID
SELECT id, name, study_aggregate_uuid FROM study WHERE id = 11;

-- Check if protocol versions exist
SELECT * FROM protocol_version WHERE study_aggregate_uuid = (
    SELECT study_aggregate_uuid FROM study WHERE id = 11
);
```

## Next Steps

1. **First**: Check backend console logs when page loads
2. **Then**: Based on logs, follow the appropriate diagnostic step above
3. **Finally**: Report what you see in the logs so we can diagnose further

## Most Likely Issue

Based on the persistent 404 error after "backend restarted", the most likely causes are:

1. **Backend didn't actually restart** - Old `.class` files still loaded in JVM
2. **Study 11 doesn't have UUID** - Not migrated to DDD yet
3. **Cache issue** - Browser cache or Spring Boot devtools cache

**Quick Fix to Try:**
```bash
# Stop backend completely
# Clean build
cd backend/clinprecision-clinops-service
mvn clean compile
# Restart
mvn spring-boot:run
```

Then check backend console for the log messages mentioned above.
