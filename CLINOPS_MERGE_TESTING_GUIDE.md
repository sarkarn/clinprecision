# ClinOps Service Merge - Testing & Verification Guide

**Date**: October 4, 2025  
**Service**: clinops-ws (Clinical Operations Service)  
**Port**: 8085  
**Status**: 🚀 **SERVICES STARTING**

---

## Service Startup Status

### Started Services:

1. ✅ **Config Service** (port 8012) - STARTED
   - Provides configuration for all services
   - Config location: `config-service/src/main/resources/config/`
   - ClinOps config: `application-clinops-ws.properties`

2. ✅ **Eureka Discovery Service** (port 8011) - STARTED
   - Service registry and discovery
   - Dashboard: http://localhost:8011
   - ClinOps should register as `CLINOPS-WS`

3. 🚀 **ClinOps Service** (port 8085) - STARTING
   - Merged service (study-design + datacapture)
   - Spring Boot 3.5.5
   - 99 source files
   - Modules: study design, database build, patient enrollment

### Services to Start:

4. ⏳ **API Gateway** (port 8082) - NOT STARTED YET
5. ⏳ **Users Service** (port 8083) - NOT STARTED YET
6. ⏳ **Site Service** (port 8084) - NOT STARTED YET
7. ⏳ **Organization Service** (port 8087) - NOT STARTED YET

---

## Quick Verification Commands

### Check Service Registration in Eureka
```powershell
# Open Eureka dashboard in browser
Start-Process "http://localhost:8011"

# Or check via API
Invoke-RestMethod -Uri "http://localhost:8011/eureka/apps" -Method Get
```

**Expected**: Should see `CLINOPS-WS` registered

---

### Test ClinOps Service Health
```powershell
# Health check endpoint
Invoke-RestMethod -Uri "http://localhost:8085/actuator/health" -Method Get

# Expected response:
# {
#   "status": "UP"
# }
```

---

### Test Patient Enrollment Endpoints (Direct to Service)
```powershell
# Test 1: Register a new patient
$patientData = @{
    firstName = "John"
    lastName = "Doe"
    dateOfBirth = "1990-01-15"
    gender = "MALE"
    siteId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/register" -Method Post -Body $patientData -ContentType "application/json"

# Expected: Patient registration response with patientId
```

```powershell
# Test 2: Get all patients
Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients" -Method Get

# Expected: Array of patients (may be empty initially)
```

---

### Test Study Design Endpoints (Direct to Service)
```powershell
# Test 1: Get all studies
Invoke-RestMethod -Uri "http://localhost:8085/api/studies" -Method Get

# Expected: Array of studies
```

```powershell
# Test 2: Get study by ID
Invoke-RestMethod -Uri "http://localhost:8085/api/studies/1" -Method Get

# Expected: Study details
```

---

### Test Database Build Endpoints (Direct to Service)
```powershell
# Test: Initiate database build
$buildRequest = @{
    studyId = 1
    userId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/v1/study-database-builds/build" -Method Post -Body $buildRequest -ContentType "application/json"

# Expected: Database build started response
```

---

## Phase 3: Testing Checklist

### ✅ Test Case 1: Service Compilation
**Status**: ✅ **PASSED**
- Maven clean compile: SUCCESS
- 99 Java files compiled
- No compilation errors

---

### ⏳ Test Case 2: Eureka Registration
**Steps**:
1. Open Eureka dashboard: http://localhost:8011
2. Look for `CLINOPS-WS` in registered services
3. Verify instance count = 1
4. Check status = UP

**Expected Result**: `CLINOPS-WS` appears with status UP

**Verification Command**:
```powershell
Start-Process "http://localhost:8011"
```

**Status**: ⏳ PENDING - Waiting for service to fully start

---

### ⏳ Test Case 3: Patient Enrollment E2E
**Steps**:
1. Register a new patient
2. Confirm eligibility
3. Enroll patient
4. Query patient details

**Test Script**:
```powershell
# Step 1: Register patient
$patient = @{
    firstName = "Jane"
    lastName = "Smith"
    dateOfBirth = "1985-06-20"
    gender = "FEMALE"
    siteId = 1
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/register" -Method Post -Body $patient -ContentType "application/json"
$patientId = $registerResponse.patientId

Write-Host "Patient registered with ID: $patientId"

# Step 2: Confirm eligibility
$eligibility = @{
    patientId = $patientId
    eligible = $true
    notes = "Meets all inclusion criteria"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/$patientId/confirm-eligibility" -Method Post -Body $eligibility -ContentType "application/json"

# Step 3: Enroll patient
$enrollment = @{
    patientId = $patientId
    studyId = 1
    studyArmId = 1
    siteId = 1
} | ConvertTo-Json

$enrollResponse = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/$patientId/enroll" -Method Post -Body $enrollment -ContentType "application/json"

Write-Host "Patient enrolled: $enrollResponse"

# Step 4: Query patient
$patientDetails = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patient-query/$patientId" -Method Get
Write-Host "Patient details: $($patientDetails | ConvertTo-Json -Depth 5)"
```

**Expected Result**: All operations succeed with proper status codes and responses

**Status**: ⏳ PENDING

---

### ⏳ Test Case 4: Study Design E2E
**Steps**:
1. Get all studies
2. Get study by ID
3. Get study arms
4. Get visit definitions

**Test Script**:
```powershell
# Step 1: Get all studies
$studies = Invoke-RestMethod -Uri "http://localhost:8085/api/studies" -Method Get
Write-Host "Studies: $($studies | ConvertTo-Json -Depth 3)"

# Step 2: Get specific study
$studyId = $studies[0].id
$study = Invoke-RestMethod -Uri "http://localhost:8085/api/studies/$studyId" -Method Get
Write-Host "Study Details: $($study | ConvertTo-Json -Depth 5)"

# Step 3: Get study arms
$arms = Invoke-RestMethod -Uri "http://localhost:8085/api/studies/$studyId/arms" -Method Get
Write-Host "Study Arms: $($arms | ConvertTo-Json -Depth 3)"

# Step 4: Get visit definitions
$visits = Invoke-RestMethod -Uri "http://localhost:8085/api/visits/study/$studyId" -Method Get
Write-Host "Visits: $($visits | ConvertTo-Json -Depth 3)"
```

**Expected Result**: All study design data retrieved successfully

**Status**: ⏳ PENDING

---

### ⏳ Test Case 5: Cross-Module Integration
**Steps**:
1. Create/verify study exists
2. Enroll patient to specific study arm
3. Verify enrollment references correct study entities

**Test Script**:
```powershell
# This test verifies that patient enrollment correctly references study design entities

# Step 1: Get study with arms
$studyId = 1
$study = Invoke-RestMethod -Uri "http://localhost:8085/api/studies/$studyId" -Method Get
$arms = Invoke-RestMethod -Uri "http://localhost:8085/api/studies/$studyId/arms" -Method Get

Write-Host "Study: $($study.name)"
Write-Host "Arms: $($arms | ConvertTo-Json)"

# Step 2: Register and enroll patient to specific arm
$patient = @{
    firstName = "Integration"
    lastName = "TestPatient"
    dateOfBirth = "1988-03-15"
    gender = "MALE"
    siteId = 1
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/register" -Method Post -Body $patient -ContentType "application/json"
$patientId = $registerResponse.patientId

# Enroll to first arm
$enrollment = @{
    patientId = $patientId
    studyId = $studyId
    studyArmId = $arms[0].id
    siteId = 1
} | ConvertTo-Json

$enrollResponse = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/$patientId/enroll" -Method Post -Body $enrollment -ContentType "application/json"

# Step 3: Verify enrollment
$patientDetails = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patient-query/$patientId" -Method Get

Write-Host "Enrollment verification:"
Write-Host "  Patient ID: $($patientDetails.patientId)"
Write-Host "  Study ID: $($patientDetails.studyId)"
Write-Host "  Study Arm ID: $($patientDetails.studyArmId)"
Write-Host "  Expected Study ID: $studyId"
Write-Host "  Expected Arm ID: $($arms[0].id)"

# Verify references match
if ($patientDetails.studyId -eq $studyId -and $patientDetails.studyArmId -eq $arms[0].id) {
    Write-Host "✅ Cross-module integration PASSED"
} else {
    Write-Host "❌ Cross-module integration FAILED"
}
```

**Expected Result**: Patient enrollment correctly references study and study arm

**Status**: ⏳ PENDING

---

### ⏳ Test Case 6: API Gateway Routing
**Prerequisites**: API Gateway must be running on port 8082

**Steps**:
1. Start API Gateway
2. Test routing to clinops-ws via gateway
3. Test legacy route compatibility

**Test Script**:
```powershell
# Step 1: Start API Gateway (if not running)
# cd c:\nnsproject\clinprecision\backend\clinprecision-apigateway-service
# .\mvnw.cmd spring-boot:run

# Step 2: Test new clinops-ws routes
Write-Host "Testing new clinops-ws routes..."

# Test patient endpoint through gateway
$response = Invoke-RestMethod -Uri "http://localhost:8082/clinops-ws/api/v1/patients" -Method Get
Write-Host "✅ Patients endpoint (via gateway): $($response.Count) patients"

# Test study endpoint through gateway
$response = Invoke-RestMethod -Uri "http://localhost:8082/clinops-ws/api/studies" -Method Get
Write-Host "✅ Studies endpoint (via gateway): $($response.Count) studies"

# Step 3: Test legacy route compatibility
Write-Host "`nTesting legacy routes..."

# Test legacy study-design-ws route (should redirect to clinops-ws)
$response = Invoke-RestMethod -Uri "http://localhost:8082/study-design-ws/api/studies" -Method Get
Write-Host "✅ Legacy study-design-ws route: $($response.Count) studies"

# Test legacy datacapture-ws route (should redirect to clinops-ws)
$response = Invoke-RestMethod -Uri "http://localhost:8082/datacapture-ws/api/v1/patients" -Method Get
Write-Host "✅ Legacy datacapture-ws route: $($response.Count) patients"

Write-Host "`n✅ API Gateway routing test PASSED"
```

**Expected Result**: All routes (new and legacy) work correctly

**Status**: ⏳ PENDING - Requires API Gateway to be running

---

### ⏳ Test Case 7: Frontend Integration
**Prerequisites**: Frontend dev server must be running

**Steps**:
1. Start frontend dev server
2. Navigate to Study Design page
3. Navigate to Patient Enrollment page
4. Check browser console for errors
5. Test API calls from UI

**Manual Test**:
```powershell
# Start frontend
cd c:\nnsproject\clinprecision\frontend\clinprecision
npm start

# Then manually test:
# 1. Open http://localhost:3000
# 2. Navigate to Study Design page
# 3. Navigate to Patient Enrollment page
# 4. Open browser DevTools → Network tab
# 5. Verify API calls go to /clinops-ws/* endpoints
# 6. Verify no 404 errors
```

**Expected Result**: 
- No 404 errors in network tab
- All API calls use `/clinops-ws/` prefix
- Pages load and function correctly

**Status**: ⏳ PENDING

---

## Troubleshooting Guide

### Issue: ClinOps service fails to start

**Check logs**:
```powershell
Get-Content "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\target\spring-boot.log" -Tail 50
```

**Common causes**:
1. Port 8085 already in use
2. Database connection failure
3. Config service not running
4. Eureka not accessible

**Solutions**:
```powershell
# Check if port 8085 is in use
netstat -ano | findstr :8085

# Verify database is running
# Check MySQL service status

# Verify config service is up
Invoke-RestMethod -Uri "http://localhost:8012/config/actuator/health"

# Verify Eureka is up
Start-Process "http://localhost:8011"
```

---

### Issue: Service registered as STUDY-DESIGN-WS instead of CLINOPS-WS

**Check application.properties**:
```powershell
Get-Content "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\resources\application.properties"
```

**Should contain**:
```properties
spring.application.name=clinops-ws
spring.cloud.config.name=clinops-ws
```

**If incorrect**:
1. Stop the service
2. Update application.properties
3. Restart the service

---

### Issue: Patient enrollment endpoints return 404

**Verify controller is loaded**:
```powershell
# Check actuator mappings
Invoke-RestMethod -Uri "http://localhost:8085/actuator/mappings" -Method Get | ConvertTo-Json -Depth 10 | Select-String "patients"
```

**Check component scan**:
- Verify `ClinicalOperationsServiceApplication.java` has:
  ```java
  @ComponentScan(basePackages = {
      "com.clinprecision.clinopsservice"
  })
  ```

---

### Issue: Frontend gets CORS errors

**Check API Gateway CORS config**:
```properties
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedOrigins=http://localhost:3000
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods=GET,POST,PUT,DELETE,OPTIONS
```

**Verify route filters include**:
```java
.addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
```

---

### Issue: Legacy routes not working

**Check GatewayRoutesConfig.java**:
- Verify legacy routes exist:
  - `study-design-ws-legacy`
  - `datacapture-ws-legacy`
- Both should route to `lb://clinops-ws`

---

## Performance Verification

### Response Time Benchmarks

**Patient Registration**:
```powershell
Measure-Command {
    $patient = @{firstName="Test"; lastName="User"; dateOfBirth="1990-01-01"; gender="MALE"; siteId=1} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8085/api/v1/patients/register" -Method Post -Body $patient -ContentType "application/json"
}
```
**Expected**: < 500ms

**Study List Retrieval**:
```powershell
Measure-Command {
    Invoke-RestMethod -Uri "http://localhost:8085/api/studies" -Method Get
}
```
**Expected**: < 200ms

---

## Database Verification

### Check Event Store Tables

```sql
-- Check domain events are being stored
SELECT COUNT(*) FROM domain_event_entry;

-- Check patient events
SELECT aggregate_identifier, sequence_number, type 
FROM domain_event_entry 
WHERE aggregate_identifier LIKE 'patient-%' 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check patient enrollment events
SELECT aggregate_identifier, sequence_number, type 
FROM domain_event_entry 
WHERE aggregate_identifier LIKE 'enrollment-%' 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Check Read Model Tables

```sql
-- Check patients table
SELECT COUNT(*) FROM patients;
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;

-- Check patient enrollments table
SELECT COUNT(*) FROM patient_enrollments;
SELECT * FROM patient_enrollments ORDER BY enrollment_date DESC LIMIT 5;

-- Check studies table
SELECT COUNT(*) FROM studies;
SELECT id, study_name, status FROM studies LIMIT 10;
```

---

## Success Criteria Summary

| Test | Status | Notes |
|------|--------|-------|
| Service Compilation | ✅ PASSED | 99 files compiled |
| Service Startup | ⏳ IN PROGRESS | Starting... |
| Eureka Registration | ⏳ PENDING | Waiting for startup |
| Patient Enrollment API | ⏳ PENDING | Requires service running |
| Study Design API | ⏳ PENDING | Requires service running |
| Cross-Module Integration | ⏳ PENDING | Requires service running |
| API Gateway Routing | ⏳ PENDING | Requires gateway running |
| Legacy Routes | ⏳ PENDING | Requires gateway running |
| Frontend Integration | ⏳ PENDING | Requires UI testing |
| Performance | ⏳ PENDING | Benchmarking needed |

---

## Next Actions

1. ⏳ **Wait for ClinOps service to fully start** (~30-60 seconds)
2. ⏳ **Verify Eureka registration** at http://localhost:8011
3. ⏳ **Run Test Cases 2-5** (direct service tests)
4. ⏳ **Start API Gateway**
5. ⏳ **Run Test Case 6** (gateway routing tests)
6. ⏳ **Start Frontend**
7. ⏳ **Run Test Case 7** (UI integration tests)
8. ⏳ **Performance benchmarks**
9. ⏳ **Documentation updates** if all tests pass
10. ⏳ **Cleanup phase** (remove old service, old config files)

---

**Estimated Time to Complete All Tests**: 30-45 minutes

**Document Updated**: October 4, 2025 - Service startup initiated
