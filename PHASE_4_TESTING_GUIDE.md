# Phase 4 Testing Guide

## Date
October 5, 2025

## Overview

This guide provides a systematic approach to testing after the massive DDD refactoring and Phase 4 cleanup (66 files deleted, 57 files migrated across all phases).

## Testing Strategy

### 1️⃣ Unit Testing (Current Phase)
### 2️⃣ Integration Testing
### 3️⃣ Service Communication Testing
### 4️⃣ Frontend Integration Testing

---

## 1️⃣ Unit Testing Phase

### Priority Order

#### High Priority - Core Services
1. **clinops-service** (304 files)
   - Protocol version aggregate tests
   - Study aggregate tests
   - Study design aggregate tests
   - Document aggregate tests
   - Command handlers
   - Event handlers
   - Repositories

2. **user-service** (37 files)
   - Feign client tests (StudyResponseDto)
   - User authentication
   - User authorization
   - User CRUD operations

3. **organization-service** (7 files)
   - Organization CRUD
   - Organization contacts
   - Organization mappings

4. **site-service** (33 files)
   - Site aggregate tests
   - Site-study associations (SiteStudyEntity)
   - Site activation workflows

#### Medium Priority - Shared Library
5. **common-lib** (34 files)
   - DTO serialization/deserialization
   - Mapper tests
   - Shared entity tests

---

## Running Unit Tests

### Test All Services
```powershell
# From project root
cd c:\nnsproject\clinprecision\backend

# Test all services
mvn clean test
```

### Test Individual Services

#### clinops-service
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
mvn clean test

# Specific test class
mvn test -Dtest=ProtocolVersionAggregateTest
mvn test -Dtest=StudyAggregateTest
mvn test -Dtest=StudyDesignAggregateTest
```

#### user-service
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-user-service
mvn clean test

# Test Feign client
mvn test -Dtest=StudyServiceClientTest
mvn test -Dtest=UserStudyRoleServiceImplTest
```

#### organization-service
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-organization-service
mvn clean test
```

#### site-service
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-site-service
mvn clean test

# Test site-study associations
mvn test -Dtest=StudySiteAssociationServiceTest
mvn test -Dtest=SiteAggregateTest
```

#### common-lib
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib
mvn clean test
```

---

## Key Test Areas After Refactoring

### 1. DDD Aggregate Tests
**What to verify:**
- ✅ Aggregates handle commands correctly
- ✅ Events are emitted properly
- ✅ Business logic is preserved
- ✅ Invariants are maintained

**Files Changed:**
- `ProtocolVersionAggregate.java` (176 manual edits)
- `StudyAggregate.java`
- `StudyDesignAggregate.java`
- `StudyDocumentAggregate.java`
- `PatientAggregate.java`

### 2. Feign Client Tests
**What to verify:**
- ✅ `StudyResponseDto` serialization works
- ✅ Simplified DTO fields (strings instead of nested DTOs)
- ✅ User-service can call clinops-service

**Critical File:**
- `StudyServiceClient.java` (user-service → clinops-service)

### 3. Mapper Tests
**What to verify:**
- ✅ DTO ↔ Entity mappings work
- ✅ No missing fields after cleanup
- ✅ MapStruct generated implementations compile

**Deleted Mappers:**
- FormDefinitionMapper (3 deleted from common-lib)
- StudyDocumentMapper
- VisitTypeConverter

### 4. Repository Tests
**What to verify:**
- ✅ JPA queries work
- ✅ No missing entity relationships
- ✅ Projections load correctly

### 5. Service Integration Tests
**What to verify:**
- ✅ Service methods work end-to-end
- ✅ Transactions commit/rollback properly
- ✅ Event sourcing works (Axon Framework)

---

## Expected Test Results

### Potential Issues to Watch For

#### 1. Missing DTOs
**Symptom:** `ClassNotFoundException` or `NoClassDefFoundError`
**Cause:** DTO was deleted but test still references it
**Solution:** Update test to use new DTO location or remove test

#### 2. Serialization Errors
**Symptom:** JSON deserialization fails in Feign client tests
**Cause:** `StudyResponseDto` simplified (removed nested DTOs)
**Solution:** Update test data to use strings instead of nested objects

#### 3. Mapper Failures
**Symptom:** MapStruct compilation errors in test phase
**Cause:** Mapper references deleted entity/DTO
**Solution:** Update mapper or use manual mapping

#### 4. Repository Query Failures
**Symptom:** JPA query fails to load entities
**Cause:** Entity relationship was in deleted entity
**Solution:** Update query or remove relationship

#### 5. Event Sourcing Issues
**Symptom:** Axon Framework events not handled
**Cause:** Event handler in deleted file
**Solution:** Restore event handler in correct service

---

## Test Execution Checklist

### Before Testing
- [x] All 5 services compile successfully
- [x] Phase 4 cleanup complete (66 files deleted)
- [x] Documentation updated
- [ ] Database schema up to date
- [ ] Test database clean/reset

### During Testing
- [ ] Run unit tests for all services
- [ ] Document test failures
- [ ] Categorize failures (DTO, mapper, repository, etc.)
- [ ] Fix critical failures first
- [ ] Re-run tests after each fix

### After Unit Testing
- [ ] All unit tests pass (or known failures documented)
- [ ] Test coverage report generated
- [ ] Known issues list created
- [ ] Ready for integration testing

---

## 2️⃣ Integration Testing Phase (Next)

### Service-to-Service Communication

#### Test Feign Clients
```bash
# Start all services
# Test user-service → clinops-service
curl -X GET http://localhost:8082/api/users/studies/123 \
  -H "Authorization: Bearer <token>"

# Verify StudyResponseDto JSON structure
```

#### Test Service Discovery
```bash
# Verify Eureka registration
curl http://localhost:8761/eureka/apps

# Check registered services:
# - study-design-ws (clinops-service)
# - user-ws (user-service)
# - organization-ws (organization-service)
# - site-ws (site-service)
```

---

## 3️⃣ Service Communication Testing

### Critical Endpoints to Test

#### clinops-service
- `GET /api/studies/{id}` - Returns StudyResponseDto
- `POST /api/studies` - Create study
- `GET /api/protocol-versions` - List versions
- `POST /api/study-design` - Create design

#### user-service
- `GET /api/users/{id}/studies` - Uses StudyServiceClient
- `POST /api/users/{id}/study-roles` - Assigns study roles

#### organization-service
- `GET /api/organizations/{id}` - Get organization
- `POST /api/organizations` - Create organization

#### site-service
- `GET /api/sites/{id}` - Get site
- `POST /api/sites/{siteId}/studies/{studyId}` - Associate site to study

---

## 4️⃣ Frontend Integration Testing

### Potential Frontend Changes Needed

#### 1. Study Status Fields
**Before:** Nested objects
```javascript
{
  studyStatus: { code: "ACTIVE", displayName: "Active" },
  regulatoryStatus: { code: "APPROVED", displayName: "Approved" },
  studyPhase: { code: "PHASE_3", displayName: "Phase 3" }
}
```

**After:** Simple strings
```javascript
{
  studyStatus: "ACTIVE",
  regulatoryStatus: "APPROVED", 
  studyPhase: "PHASE_3"
}
```

**Frontend Fix:**
```javascript
// Update frontend to handle string values
const statusDisplay = getStatusDisplayName(study.studyStatus);
```

#### 2. Removed Organizations Array
**Before:**
```javascript
{
  organizations: [
    { id: 1, name: "Org1", role: "SPONSOR" }
  ]
}
```

**After:** Field removed from StudyResponseDto

**Frontend Fix:**
```javascript
// Make separate API call if needed
const orgs = await fetchStudyOrganizations(studyId);
```

### Frontend Test Checklist
- [ ] Study list page loads
- [ ] Study detail page displays correctly
- [ ] Create study form works
- [ ] Edit study form works
- [ ] Study status dropdown works
- [ ] User-study role assignment works
- [ ] Site-study association works

---

## Test Results Template

### Service: _____________
**Date:** October 5, 2025  
**Tester:** ______________

| Test Category | Total | Passed | Failed | Skipped | Notes |
|---------------|-------|--------|--------|---------|-------|
| Unit Tests | | | | | |
| Integration Tests | | | | | |
| Controller Tests | | | | | |
| Repository Tests | | | | | |
| Mapper Tests | | | | | |
| **TOTAL** | | | | | |

### Failed Tests
1. **Test Name:** ____________________
   - **Error:** ______________________
   - **Cause:** ______________________
   - **Fix:** ________________________
   - **Status:** [ ] Fixed / [ ] In Progress / [ ] Deferred

---

## Quick Test Commands

### Run All Tests (Skip if Any Fail)
```powershell
cd c:\nnsproject\clinprecision\backend
mvn clean test
```

### Run All Tests (Continue on Failure)
```powershell
mvn clean test -fn
```

### Run Tests with Coverage
```powershell
mvn clean test jacoco:report
# View: target/site/jacoco/index.html
```

### Run Only Fast Tests
```powershell
mvn test -Dgroups=fast
```

### Skip Slow Tests
```powershell
mvn test -DexcludedGroups=slow
```

---

## Troubleshooting Common Test Failures

### 1. ClassNotFoundException for DTO
```
Error: com.clinprecision.common.dto.clinops.StudyStatusDto not found
Fix: Update test to use String instead of StudyStatusDto
```

### 2. Feign Client Deserialization Error
```
Error: Cannot deserialize StudyResponseDto
Fix: Update test JSON to use string values for status fields
```

### 3. Mapper Test Failure
```
Error: FormDefinitionMapper not found
Fix: Use local mapper in clinops-service instead
```

### 4. Repository Test Failure
```
Error: OrganizationStudyEntity not found
Fix: Remove test or update to use correct entity
```

---

## Success Criteria

### Unit Testing Phase Complete When:
- ✅ All critical unit tests pass
- ✅ Known failures documented with fix plans
- ✅ Test coverage ≥ 70% for changed files
- ✅ No blocking issues found

### Ready for Integration Testing When:
- ✅ All services start successfully
- ✅ Service discovery works
- ✅ Database migrations applied
- ✅ Test data loaded

### Ready for Frontend Testing When:
- ✅ All backend APIs return correct data
- ✅ Feign clients work
- ✅ API contracts documented
- ✅ Frontend team briefed on changes

---

## Next Steps After Testing

### If Tests Pass ✅
1. Document test results
2. Generate coverage report
3. Proceed to integration testing
4. Update API documentation
5. Brief frontend team

### If Tests Fail ❌
1. **Critical failures** - Fix immediately
2. **Non-critical failures** - Create issues
3. **Known issues** - Document and defer
4. Re-run tests after fixes
5. Update this guide with learnings

---

## Contact for Issues

**Backend Lead:** Ready to help with test failures  
**This Session:** Available for troubleshooting  

---

**Generated:** October 5, 2025  
**Status:** Ready for Unit Testing  
**Next Phase:** Integration Testing

Good luck with testing! 🚀
