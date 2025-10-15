# Protocol Visit Instantiation - Troubleshooting Guide

**Issue**: Changed patient status to ACTIVE but no visits created  
**Date**: October 14, 2025  
**Status**: 🔍 INVESTIGATING

---

## ✅ What's Been Implemented

1. ✅ `ProtocolVisitInstantiationService.java` created (227 lines)
2. ✅ `PatientEnrollmentProjector.java` modified (added STEP 4.5)
3. ✅ Code compiled successfully (BUILD SUCCESS, 356 files, 0 errors)
4. ✅ Repository methods verified (`findByPatientId` exists)

---

## 🔍 Diagnostic Checklist

### 1. Backend Service Status ⚠️ **CRITICAL**

**Problem**: Backend service needs restart to load new compiled code

**Check**:
```powershell
# Check if Java process is running
Get-Process -Name "java" -ErrorAction SilentlyContinue

# Check logs for service startup message
Get-Content backend\clinprecision-clinops-service\logs\application.log -Tail 50
```

**Solution**:
```powershell
# Stop current service
Get-Process -Name "java" | Stop-Process -Force

# Restart service
cd backend\clinprecision-clinops-service
mvn spring-boot:run
```

**Wait for**: Log message containing "Started ClinPrecisionClinOpsServiceApplication"

---

### 2. Database Pre-Conditions

#### A. Check if visit_definitions exist (Protocol Visits)

```sql
-- Check if study has protocol visits defined
SELECT 
    id, 
    study_id, 
    name, 
    timepoint, 
    visit_type, 
    sequence_number
FROM visit_definitions
WHERE study_id = (
    SELECT study_id 
    FROM patient_enrollments 
    WHERE patient_id = <PATIENT_ID>
    LIMIT 1
)
ORDER BY sequence_number;
```

**Expected**: At least 1 row (protocol visit template)  
**If 0 rows**: Study has no protocol visits defined → Cannot instantiate visits

#### B. Check patient enrollment record

```sql
-- Get patient's enrollment details
SELECT 
    id,
    patient_id,
    study_id,
    study_site_id,
    enrollment_date,
    enrollment_status
FROM patient_enrollments
WHERE patient_id = <PATIENT_ID>;
```

**Expected**: 1 row with `study_id`, `study_site_id`, `enrollment_date` populated  
**If 0 rows**: Patient not enrolled → Cannot instantiate visits

#### C. Check patient status

```sql
-- Get patient's current status
SELECT 
    id,
    patient_number,
    first_name,
    last_name,
    status
FROM patients
WHERE id = <PATIENT_ID>;
```

**Expected**: `status = 'ACTIVE'`  
**If not ACTIVE**: Status change didn't save or event not fired

---

### 3. Event Flow Verification

#### A. Check if PatientStatusChangedEvent was fired

**Look for in logs**:
```
PatientStatusChangedEvent emitted for patient: <UUID>
```

**If missing**: Event not fired → Check `PatientAggregate.java` command handler

#### B. Check if PatientEnrollmentProjector received event

**Look for in logs**:
```
Projecting PatientStatusChangedEvent: patient=<UUID>, ENROLLED → ACTIVE
```

**If missing**: Projector not receiving events → Check Axon configuration

#### C. Check if protocol visit instantiation was triggered

**Look for in logs**:
```
Patient transitioned to ACTIVE status, instantiating protocol visits: patientId=<ID>
Found <N> protocol visits to instantiate
Protocol visits instantiated successfully: patientId=<ID>, count=<N>
```

**If missing**: Either:
- Service bean not injected (check Spring logs for `ProtocolVisitInstantiationService` bean creation)
- Enrollment not found (check logs for "Cannot instantiate protocol visits - no enrollment found")
- No protocol visits in study (check logs for "No protocol visits found")

---

### 4. Idempotency Check

#### Check if visits already exist

```sql
-- Check if patient already has visits
SELECT 
    id,
    subject_id,
    visit_id,
    visit_date,
    visit_status,
    aggregate_uuid,
    created_at
FROM study_visit_instances
WHERE subject_id = <PATIENT_ID>
ORDER BY visit_date;
```

**If rows exist**: Idempotency check prevented duplicate creation  
**Expected log**: "Protocol visits already instantiated for patientId: X. Skipping."

---

### 5. Common Issues & Solutions

#### Issue 1: Backend Service Not Restarted ⚠️ **MOST COMMON**

**Symptom**: No logs mentioning `ProtocolVisitInstantiationService`

**Solution**:
1. Stop backend service
2. Restart: `mvn spring-boot:run`
3. Wait for "Started ClinPrecisionClinOpsServiceApplication"
4. Retry status change

#### Issue 2: No Protocol Visits Defined

**Symptom**: Log shows "No protocol visits found for studyId: X"

**Solution**:
1. Navigate to Study Design → Visit Schedule
2. Add protocol visits (e.g., "Screening", "Baseline", "Week 4")
3. Set timepoint (day offset from baseline)
4. Save visit definitions
5. Retry status change

#### Issue 3: Patient Not Enrolled

**Symptom**: Log shows "Cannot instantiate protocol visits - no enrollment found"

**Solution**:
1. Check `patient_enrollments` table
2. Ensure patient has enrollment record with:
   - `study_id` (not NULL)
   - `study_site_id` (not NULL)
   - `enrollment_date` (not NULL)
3. If missing, enroll patient via Subject Management → Enroll Patient

#### Issue 4: Status Change Event Not Fired

**Symptom**: No log entry for "PatientStatusChangedEvent emitted"

**Solution**:
1. Check frontend network tab (DevTools → Network)
2. Verify POST request to `/api/v1/patients/{id}/status` succeeds (200 OK)
3. Check backend logs for command handler execution
4. If command fails, check validation logic in `PatientAggregate.java`

#### Issue 5: Projector Not Receiving Events

**Symptom**: Event emitted but projector not called

**Solution**:
1. Check Axon configuration: `@EnableAxonServer` annotation
2. Verify `PatientEnrollmentProjector` has `@Component` annotation
3. Check `@EventHandler` annotation on `on(PatientStatusChangedEvent event)` method
4. Restart backend service to re-register event handlers

#### Issue 6: Service Bean Not Injected

**Symptom**: NullPointerException when calling `protocolVisitInstantiationService`

**Solution**:
1. Check `ProtocolVisitInstantiationService` has `@Service` annotation
2. Verify `PatientEnrollmentProjector` uses `@RequiredArgsConstructor` (Lombok)
3. Check Spring logs for bean creation errors
4. Ensure service is in Spring component scan path

---

## 🧪 Testing Procedure

### Step-by-Step Test

1. **Start Backend Service**
   ```powershell
   cd backend\clinprecision-clinops-service
   mvn spring-boot:run
   ```
   **Wait for**: "Started ClinPrecisionClinOpsServiceApplication"

2. **Open Browser DevTools**
   - F12 → Console tab
   - Network tab (to see API calls)

3. **Navigate to Subject Management**
   - http://localhost:3000/subject-management
   - Click on a patient (e.g., Patient ID=2)

4. **Check Patient Pre-Conditions**
   - Patient status: ENROLLED (not already ACTIVE)
   - Patient has enrollment record (check SubjectDetails → Enrollment tab)
   - Study has protocol visits (check Study Design → Visit Schedule)

5. **Change Status to ACTIVE**
   - Click "Change Status" button
   - Select status: "ACTIVE"
   - Enter reason: "Patient ready for treatment"
   - Click "Confirm Status Change"

6. **Monitor Backend Logs**
   **Watch for**:
   ```
   INFO: PatientStatusChangedEvent emitted for patient: <UUID>
   INFO: Projecting PatientStatusChangedEvent: patient=<UUID>, ENROLLED → ACTIVE
   INFO: Patient transitioned to ACTIVE status, instantiating protocol visits: patientId=<ID>
   INFO: Found <N> protocol visits to instantiate
   INFO: Created visit instance: visitDefId=<ID>, name=<NAME>, date=<DATE>
   INFO: Protocol visits instantiated successfully: patientId=<ID>, count=<N>
   INFO: PatientStatusChangedEvent projection completed successfully: patient=<UUID>
   ```

7. **Verify Visits Created**
   ```sql
   SELECT * FROM study_visit_instances WHERE subject_id = <PATIENT_ID>;
   ```
   **Expected**: <N> rows with:
   - `visit_id` (FK to visit_definitions) populated
   - `visit_status = 'Scheduled'`
   - `aggregate_uuid = NULL` (protocol visits, not event-sourced)
   - `visit_date` calculated from enrollment_date + timepoint

8. **Refresh Frontend**
   - SubjectDetails should now show visits in Visits tab
   - Count should match number of protocol visits

---

## 📊 Expected Database State After Success

### Before Status Change (ENROLLED)

**patient_enrollments**:
```
id | patient_id | study_id | study_site_id | enrollment_date | enrollment_status
1  | 2          | 100      | 10            | 2025-10-14      | ENROLLED
```

**patients**:
```
id | patient_number | status   | first_name | last_name
2  | P-001          | ENROLLED | John       | Doe
```

**visit_definitions** (Protocol Templates):
```
id | study_id | name       | timepoint | window_before | window_after | sequence_number
1  | 100      | Screening  | -7        | 3             | 3            | 1
2  | 100      | Baseline   | 0         | 0             | 0            | 2
3  | 100      | Week 4     | 28        | 3             | 3            | 3
4  | 100      | Week 8     | 56        | 3             | 3            | 4
```

**study_visit_instances**:
```
(0 rows) ← No visits yet
```

---

### After Status Change (ACTIVE)

**patients**:
```
id | patient_number | status | first_name | last_name
2  | P-001          | ACTIVE | John       | Doe  ← Status changed
```

**study_visit_instances** (NEW):
```
id   | subject_id | visit_id | visit_date  | visit_status | window_status | aggregate_uuid | created_at
1001 | 2          | 1        | 2025-10-07  | Scheduled    | NULL          | NULL           | 2025-10-14 21:30:00
1002 | 2          | 2        | 2025-10-14  | Scheduled    | NULL          | NULL           | 2025-10-14 21:30:00
1003 | 2          | 3        | 2025-11-11  | Scheduled    | NULL          | NULL           | 2025-10-14 21:30:00
1004 | 2          | 4        | 2025-12-09  | Scheduled    | NULL          | NULL           | 2025-10-14 21:30:00
```

**Calculation**:
- Screening: enrollmentDate (2025-10-14) + timepoint (-7) = 2025-10-07
- Baseline: enrollmentDate (2025-10-14) + timepoint (0) = 2025-10-14
- Week 4: enrollmentDate (2025-10-14) + timepoint (28) = 2025-11-11
- Week 8: enrollmentDate (2025-10-14) + timepoint (56) = 2025-12-09

---

## 🔧 Quick Fixes

### Fix 1: Force Backend Restart

```powershell
# Kill all Java processes
Get-Process -Name "java" | Stop-Process -Force

# Clean compile
cd backend\clinprecision-clinops-service
mvn clean compile

# Start service
mvn spring-boot:run
```

### Fix 2: Verify Database Connection

```powershell
# Check if MySQL container running
docker ps | Select-String "mysql"

# If not running, start it
cd backend\clinprecision-db
docker-compose up -d mysql
```

### Fix 3: Add Debug Logging

Edit `backend/clinprecision-clinops-service/src/main/resources/application.yml`:

```yaml
logging:
  level:
    com.clinprecision.clinopsservice.visit.service.ProtocolVisitInstantiationService: DEBUG
    com.clinprecision.clinopsservice.patientenrollment.projection.PatientEnrollmentProjector: DEBUG
    org.axonframework.eventhandling: DEBUG
```

Restart service to see detailed logs.

### Fix 4: Manual Visit Creation (Temporary Workaround)

If protocol visit instantiation still not working, manually create visits via SQL:

```sql
-- Insert visit for patient
INSERT INTO study_visit_instances (
    subject_id,
    study_id,
    site_id,
    visit_id,
    visit_date,
    visit_status,
    window_status,
    completion_percentage,
    aggregate_uuid,
    created_by,
    created_at,
    updated_at
) VALUES (
    2,                    -- subject_id (Patient ID)
    100,                  -- study_id
    10,                   -- site_id
    1,                    -- visit_id (FK to visit_definitions)
    '2025-10-07',         -- visit_date (calculated)
    'Scheduled',          -- visit_status
    NULL,                 -- window_status (to be calculated)
    0.0,                  -- completion_percentage
    NULL,                 -- aggregate_uuid (NULL for protocol visits)
    1,                    -- created_by (system user)
    NOW(),                -- created_at
    NOW()                 -- updated_at
);

-- Repeat for each protocol visit
```

---

## 📞 Next Steps

1. ⏳ **Restart backend service** (most likely fix)
2. ⏳ **Check logs** for protocol visit instantiation messages
3. ⏳ **Verify database** has visit_definitions and patient_enrollments
4. ⏳ **Test status change** again
5. ⏳ **Check study_visit_instances** table for new rows

If still not working after restart, provide:
- Backend logs (last 100 lines)
- SQL query results (visit_definitions, patient_enrollments, patients, study_visit_instances)
- Patient ID being tested
- Study ID being tested

---

**Status**: Awaiting backend service restart and test results
