# Quick Test Plan - Study Status NULL Bug

## 🎯 Goal
Confirm that study status becomes NULL when creating protocol version

## 🔬 Test Steps

### 1. Check Database BEFORE
```sql
SELECT id, name, study_status_id 
FROM studies 
WHERE id = YOUR_STUDY_ID;
```
**Expected**: `study_status_id = 2` (or whatever PLANNING is)

### 2. Create Protocol Version
- Go to frontend
- Navigate to study
- Click "Create Protocol Version"
- Fill out form and submit

### 3. Check Logs IMMEDIATELY
Look for these log lines in clinops-service console:

```
INFO  - Creating version for study X
INFO  - BEFORE version save - Study X status: PLANNING (status_id: 2)
INFO  - Saving version v1.0 for study X
INFO  - Version saved with id: Y
INFO  - AFTER version save - Study X status: ??? (status_id: ???)
```

**If bug exists**: 
```
ERROR - ⚠️ CRITICAL: Study X status changed from PLANNING to NULL during version creation!
```

**If bug fixed**: No error, status stays PLANNING

### 4. Check Database AFTER
```sql
SELECT id, name, study_status_id 
FROM studies 
WHERE id = YOUR_STUDY_ID;
```
**Bug Result**: `study_status_id = NULL`  
**Expected Result**: `study_status_id = 2` (unchanged)

### 5. Check Protocol Version Was Created
```sql
SELECT id, study_id, version_number, status 
FROM study_versions 
WHERE study_id = YOUR_STUDY_ID 
ORDER BY created_date DESC 
LIMIT 1;
```
**Expected**: New version with `status = 'DRAFT'`

## 📊 What to Report Back

Please provide:

1. **BEFORE status_id**: `________`
2. **Log line "BEFORE version save"**: `________`
3. **Log line "AFTER version save"**: `________`
4. **CRITICAL error appeared?**: YES / NO
5. **AFTER status_id**: `________`
6. **Frontend displays status as**: `________`

## 🔧 Prerequisites

Make sure you've rebuilt the service:
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
mvn clean install
```

Then restart clinops-service (port 8085).

## 💡 Understanding Results

### If Status Stays PLANNING:
✅ Bug is fixed (or doesn't occur with current data)
✅ Remove band-aid fix from StudyMapper

### If Status Becomes NULL:
❌ Bug confirmed
🔍 Logs will show if it happens during save or after
🔧 Will guide next fix (likely lazy fetch or transaction issue)

### If CRITICAL Error Shows:
✅ Diagnostic working perfectly
✅ Shows exact moment status changes
✅ Proceed to root cause analysis based on timing
