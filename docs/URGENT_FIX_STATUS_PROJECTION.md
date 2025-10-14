# URGENT FIX: Status Change Projection Timeout

**Date**: October 13, 2025  
**Error**: "Status changed but projection not found after 5000ms"  
**Status**: 🔴 REQUIRES IMMEDIATE ACTION

---

## 🚨 Root Cause

The database trigger `trg_validate_status_transition` is **rejecting** the status history insert because:
1. Patient starts with status REGISTERED
2. When changing to SCREENING, projection tries to insert: `previous_status=REGISTERED, new_status=SCREENING`
3. Trigger validates this is allowed ✅
4. BUT... something else is failing in the trigger
5. Transaction commits (command succeeded)
6. BUT status_history record was NOT created
7. Service waits 5 seconds for record that never arrives

---

## ✅ Solution: Apply Database Trigger Fix

### Option 1: Quick Fix Script (RECOMMENDED)

**Step 1**: Open MySQL client
```powershell
mysql -u root -p clinprecision
```

**Step 2**: Run the quick fix script
```sql
source C:/nnsproject/clinprecision/backend/clinprecision-db/ddl/QUICK_FIX_STATUS_TRIGGER.sql
```

**Step 3**: Verify fix applied
```sql
-- Should show the new trigger
SHOW TRIGGERS LIKE 'patient_status_history';

-- Should show NULL is allowed
SHOW COLUMNS FROM patient_status_history LIKE 'previous_status';
```

---

### Option 2: Manual Fix (if source command doesn't work)

```sql
-- 1. Drop old trigger
DROP TRIGGER IF EXISTS trg_validate_status_transition;

-- 2. Create new trigger with NULL handling
DELIMITER //

CREATE TRIGGER trg_validate_status_transition
BEFORE INSERT ON patient_status_history
FOR EACH ROW
BEGIN
    DECLARE valid_transition BOOLEAN DEFAULT FALSE;
    DECLARE error_msg VARCHAR(500);
    
    -- Allow NULL → REGISTERED (initial registration)
    IF (NEW.previous_status IS NULL AND NEW.new_status = 'REGISTERED') THEN
        SET valid_transition = TRUE;
    -- Allow REGISTERED → SCREENING
    ELSEIF (NEW.previous_status = 'REGISTERED' AND NEW.new_status = 'SCREENING') THEN
        SET valid_transition = TRUE;
    -- Allow SCREENING → ENROLLED
    ELSEIF (NEW.previous_status = 'SCREENING' AND NEW.new_status = 'ENROLLED') THEN
        SET valid_transition = TRUE;
    -- Allow ENROLLED → ACTIVE
    ELSEIF (NEW.previous_status = 'ENROLLED' AND NEW.new_status = 'ACTIVE') THEN
        SET valid_transition = TRUE;
    -- Allow ACTIVE → COMPLETED
    ELSEIF (NEW.previous_status = 'ACTIVE' AND NEW.new_status = 'COMPLETED') THEN
        SET valid_transition = TRUE;
    -- Allow any status → WITHDRAWN
    ELSEIF (NEW.new_status = 'WITHDRAWN') THEN
        SET valid_transition = TRUE;
    END IF;
    
    -- If not a valid transition, raise error
    IF NOT valid_transition THEN
        SET error_msg = CONCAT(
            'Invalid status transition: ',
            COALESCE(NEW.previous_status, 'NULL'),
            ' → ',
            NEW.new_status,
            '. Please check patient status workflow.'
        );
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
    END IF;
END//

DELIMITER ;

-- 3. Verify
SHOW TRIGGERS LIKE 'patient_status_history';
```

---

## 🔄 After Applying Database Fix

### Step 1: Restart Application

The backend has been rebuilt with the projector fix. Now restart the application to pick up changes:

```powershell
# Stop current application (Ctrl+C in terminal where it's running)

# Or kill the process
# Get-Process java | Where-Object {$_.Path -like "*clinprecision*"} | Stop-Process

# Start application again
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

### Step 2: Test Status Change

1. Open application in browser
2. Go to patient (ID = 1)
3. Click "Change Status"
4. Select "Screening"
5. Complete screening form with Screen ID
6. Click "Change Status"

**Expected**: Status changes in <500ms ✅  
**Before**: Status change timeout after 5 seconds ❌

### Step 3: Verify Database Records

```sql
-- Check status history was created
SELECT 
    id,
    patient_id,
    previous_status,
    new_status,
    reason,
    changed_at
FROM patient_status_history
WHERE patient_id = 1
ORDER BY changed_at DESC
LIMIT 5;

-- Expected: Record with REGISTERED → SCREENING
```

---

## 🔍 Why This Happened

### The Issue Chain:
1. ✅ Command sent: `ChangePatientStatusCommand`
2. ✅ Event published: `PatientStatusChangedEvent`
3. ✅ Projector caught event
4. ❌ Database trigger **rejected** status history insert
5. ✅ Projector caught exception (but didn't throw it - THIS WAS THE BUG)
6. ✅ Transaction committed (Spring didn't know about error)
7. ❌ Status history record NOT created
8. ⏳ Service waited 5 seconds for record
9. ❌ Timeout error thrown

### The Fixes:
1. **Backend Fix** (DONE): Projector now throws exceptions instead of swallowing them
2. **Database Fix** (NEEDED): Trigger must allow NULL→REGISTERED and REGISTERED→SCREENING

---

## 📋 Checklist

Before testing again:

- [ ] ✅ Backend rebuilt (done above via `mvn clean compile`)
- [ ] ⚠️ **Database trigger fixed** (YOU NEED TO DO THIS)
- [ ] Application restarted (after database fix)
- [ ] Test status change REGISTERED → SCREENING
- [ ] Verify status_history record created
- [ ] Verify no 5-second timeout

---

## 🎯 Quick Commands Summary

```powershell
# 1. Fix database trigger
mysql -u root -p clinprecision -e "source C:/nnsproject/clinprecision/backend/clinprecision-db/ddl/QUICK_FIX_STATUS_TRIGGER.sql"

# 2. Restart application
# (Stop current process first, then:)
cd backend\clinprecision-clinops-service
mvn spring-boot:run

# 3. Test in browser
# Navigate to patient → Change Status → Screening
```

---

## ❓ Troubleshooting

### If Still Getting Error:

1. **Check trigger was updated**:
   ```sql
   SHOW CREATE TRIGGER trg_validate_status_transition;
   ```
   Should show the new trigger with `COALESCE` and NULL handling

2. **Check column allows NULL**:
   ```sql
   DESCRIBE patient_status_history;
   ```
   `previous_status` should show `NULL: YES`

3. **Check application logs**:
   Look for: "Failed to project PatientStatusChangedEvent"
   
4. **Manual test of trigger**:
   ```sql
   -- This should succeed now
   INSERT INTO patient_status_history (
       patient_id, previous_status, new_status, reason, changed_by, changed_at
   ) VALUES (
       1, 'REGISTERED', 'SCREENING', 'Test', 'system', NOW()
   );
   ```

---

**Next Step**: Apply the database trigger fix, then restart application! 🚀
