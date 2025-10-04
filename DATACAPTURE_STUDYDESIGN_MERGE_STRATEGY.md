# DataCapture-Service to StudyDesign-Service Merge Strategy

## Executive Summary

**Objective**: Merge `clinprecision-datacapture-service` into `clinprecision-studydesign-service` and rename the combined service to `clinprecision-clinops-service` (Clinical Operations Service).

**Rationale**: 
- Clinical operations workflow (patient → enrollment → subject → visit → data capture) should be a cohesive domain
- Database build worker needs access to both patient enrollment and study design entities
- Reduces microservice complexity (8 services → 7 services)
- Sets architectural foundation for complete clinical operations module

**Timeline**: 2-3 hours for complete merge and testing

---

## Phase 1: Pre-Merge Analysis ✅

### Service Comparison

| Aspect | datacapture-service | studydesign-service |
|--------|-------------------|-------------------|
| **Spring Boot Version** | 3.5.5 | 3.5.4 |
| **Port** | 8086 | 8085 |
| **Service Name** | datacapture-ws | study-design-ws |
| **Package Root** | `com.clinprecision.datacaptureservice` | `com.clinprecision.studydesignservice` |
| **Key Modules** | `patientenrollment/` | `studydatabase/`, `controller/`, `service/`, `repository/` |
| **Entities** | PatientEntity, PatientEnrollmentEntity | Study design entities |
| **Aggregates** | PatientAggregate, PatientEnrollmentAggregate | StudyDatabaseBuildAggregate |

### Files Inventory

**datacapture-service Java files (58 total)**:
```
src/main/java/com/clinprecision/datacaptureservice/
├── StudyDataCaptureServiceApplication.java
├── config/
│   ├── DebugConfig.java
│   └── DataCaptureServiceConfig.java
├── security/
│   ├── SecurityContextProvider.java
│   └── WebSecurity.java
└── patientenrollment/
    ├── aggregate/
    │   ├── PatientAggregate.java
    │   └── PatientEnrollmentAggregate.java
    ├── controller/
    │   ├── PatientEnrollmentController.java
    │   └── PatientQueryController.java
    ├── domain/
    │   ├── commands/ (7 commands)
    │   └── events/ (13 events)
    ├── dto/ (4 DTOs)
    ├── entity/ (4 entities + 3 enums)
    ├── events/ (duplicate structure)
    ├── projection/
    │   └── PatientProjectionHandler.java
    ├── repository/ (4 repositories)
    └── service/
        ├── PatientEnrollmentCommandService.java
        ├── PatientEnrollmentQueryService.java
        └── PatientCommandService.java
```

---

## Phase 2: Merge Execution Plan

### Step 1: Rename studydesign-service to clinops-service ⏳

**1.1 Rename Directory**
```powershell
cd c:\nnsproject\clinprecision\backend
Rename-Item -Path "clinprecision-studydesign-service" -NewName "clinprecision-clinops-service"
```

**1.2 Update pom.xml**
- File: `backend/clinprecision-clinops-service/pom.xml`
- Changes:
  ```xml
  <groupId>com.clinprecision.clinopsservice</groupId>
  <artifactId>clinopsservice</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <name>ClinPrecision Clinical Operations Service</name>
  <description>Clinical Operations Service - Study Design, Database Build, Patient Enrollment</description>
  
  <!-- Upgrade Spring Boot to 3.5.5 for consistency -->
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.5</version>
  </parent>
  ```

**1.3 Update application.properties**
- File: `backend/clinprecision-clinops-service/src/main/resources/application.properties`
- Changes:
  ```properties
  spring.application.name=clinops-ws
  spring.cloud.config.name=clinops-ws
  ```

**1.4 Rename Main Application Class**
- File: Rename `StudyDesignServiceApplication.java` → `ClinicalOperationsServiceApplication.java`
- Update class name and package references

---

### Step 2: Move patientenrollment Module ⏳

**2.1 Create Target Package Structure**
```powershell
cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision
Rename-Item -Path "studydesignservice" -NewName "clinopsservice"
mkdir clinopsservice\patientenrollment
```

**2.2 Copy patientenrollment Directory**
```powershell
# Copy entire patientenrollment module
Copy-Item -Path "c:\nnsproject\clinprecision\backend\clinprecision-datacapture-service\src\main\java\com\clinprecision\datacaptureservice\patientenrollment\*" `
          -Destination "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\patientenrollment\" `
          -Recurse
```

**2.3 Update Package Declarations**

All files in `patientenrollment/` need package updates:
- **FROM**: `package com.clinprecision.datacaptureservice.patientenrollment.*;`
- **TO**: `package com.clinprecision.clinopsservice.patientenrollment.*;`

Files requiring updates (37 files):
```
Aggregates (2 files):
- PatientAggregate.java
- PatientEnrollmentAggregate.java

Commands (7 files):
- RegisterPatientCommand.java
- ConfirmEligibilityCommand.java
- EnrollPatientCommand.java
- CompleteEnrollmentCommand.java
- UpdatePatientCommand.java
- WithdrawPatientCommand.java
- ReactivatePatientCommand.java

Events (13 files):
- PatientRegisteredEvent.java
- PatientUpdatedEvent.java
- PatientWithdrawnEvent.java
- PatientReactivatedEvent.java
- EligibilityConfirmedEvent.java
- PatientEnrolledEvent.java
- EnrollmentCompletedEvent.java
- EnrollmentWithdrawnEvent.java
- EnrollmentReactivatedEvent.java
- EnrollmentFailedEvent.java
- PatientEnrollmentCreatedEvent.java
- PatientEnrollmentStatusChangedEvent.java
- PatientEnrollmentAuditEvent.java

DTOs (4 files):
- RegisterPatientDto.java
- EnrollPatientDto.java
- ConfirmEligibilityDto.java
- PatientDto.java

Entities (4 files + 3 enums):
- PatientEntity.java
- PatientEnrollmentEntity.java
- PatientEnrollmentAuditEntity.java
- (SiteStudyEntity.java - if exists, otherwise reference from common-lib)
- PatientStatus.java (enum)
- PatientGender.java (enum)
- EnrollmentStatus.java (enum)

Controllers (2 files):
- PatientEnrollmentController.java
- PatientQueryController.java

Services (3 files):
- PatientCommandService.java
- PatientEnrollmentCommandService.java
- PatientEnrollmentQueryService.java

Repositories (4 files):
- PatientRepository.java
- PatientEnrollmentRepository.java
- PatientEnrollmentAuditRepository.java
- SiteStudyRepository.java

Projection (1 file):
- PatientProjectionHandler.java
```

---

### Step 3: Merge Configuration Files ⏳

**3.1 Merge Security Configuration**

Compare and merge:
- `datacapture-service/security/WebSecurity.java` 
- `clinops-service/security/WebSecurity.java`

Ensure patient enrollment endpoints are whitelisted:
```java
.requestMatchers("/api/v1/patients/**").permitAll()
.requestMatchers("/api/v1/patient-query/**").permitAll()
```

**3.2 Merge Axon Configuration**

Check both services for Axon-specific configs:
- `DataCaptureServiceConfig.java` vs. existing config classes
- Ensure both aggregates are in component scan
- Verify event store configuration

**3.3 Update Application Properties**

Add patient enrollment specific properties from datacapture-service to clinops-service if any exist beyond the basic config.

---

### Step 4: Update Dependent Services ⏳

**4.1 Config Service Updates**

Files to update in `clinprecision-config-service`:
- Create `clinops-ws.properties` (merge study-design-ws.properties + datacapture-ws.properties)
- Delete `study-design-ws.properties` (after backup)
- Delete `datacapture-ws.properties` (after backup)

Example `clinops-ws.properties`:
```properties
server.port=8085
eureka.client.service-url.defaultZone=http://localhost:8011/eureka
spring.application.name=clinops-ws

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/clinprecisiondb
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Axon Configuration
axon.eventhandling.processors.patient-projection.mode=subscribing
axon.eventhandling.processors.patient-enrollment-projection.mode=subscribing
axon.eventhandling.processors.study-database-build-projection.mode=subscribing

# JWT Configuration
jwt.secret=${JWT_SECRET:your-secret-key}
jwt.expiration=86400000
```

**4.2 API Gateway Routing Updates**

File: `clinprecision-apigateway-service/src/main/resources/application.properties` (or application.yml)

Update routes:
```yaml
# OLD ROUTES (to be removed/updated):
spring.cloud.gateway.routes[x].id=studydesign-ws
spring.cloud.gateway.routes[x].uri=lb://STUDY-DESIGN-WS
spring.cloud.gateway.routes[x].predicates[0]=Path=/studydesign-ws/**

spring.cloud.gateway.routes[y].id=datacapture-ws
spring.cloud.gateway.routes[y].uri=lb://DATACAPTURE-WS
spring.cloud.gateway.routes[y].predicates[0]=Path=/datacapture-ws/**

# NEW ROUTE (consolidated):
spring.cloud.gateway.routes[x].id=clinops-ws
spring.cloud.gateway.routes[x].uri=lb://CLINOPS-WS
spring.cloud.gateway.routes[x].predicates[0]=Path=/clinops-ws/**
spring.cloud.gateway.routes[x].filters[0]=RewritePath=/clinops-ws/(?<segment>.*), /$\{segment}
```

**4.3 Eureka Discovery Updates**

The service will auto-register with new name `CLINOPS-WS` once `spring.application.name=clinops-ws` is set. No Eureka config changes needed.

---

### Step 5: Frontend Integration Updates ⏳

**5.1 Update Frontend Service Files**

Files requiring path updates:

**File 1**: `frontend/clinprecision/src/services/StudyDesignService.js`
- **FROM**: `const API_BASE = '/studydesign-ws';`
- **TO**: `const API_BASE = '/clinops-ws';`

**File 2**: `frontend/clinprecision/src/services/SubjectService.js` (or PatientEnrollmentService.js)
- **FROM**: `const API_BASE = '/datacapture-ws';`
- **TO**: `const API_BASE = '/clinops-ws';`

**File 3**: Check all other frontend service files for references to either service

Example grep search:
```powershell
cd c:\nnsproject\clinprecision\frontend\clinprecision
grep -r "datacapture-ws" src/
grep -r "studydesign-ws" src/
```

**5.2 Update API Endpoint Documentation**

Update any README or documentation files that reference the old endpoints:
- `docs/FRONTEND_README.md`
- `ROUTING_QUICK_REFERENCE.md`

---

## Phase 3: Testing Strategy

### Test Case 1: Patient Enrollment E2E ✅

**Steps**:
1. Start clinops-ws service
2. Register a new patient via `/api/v1/patients/register`
3. Confirm eligibility via `/api/v1/patients/{patientId}/confirm-eligibility`
4. Enroll patient via `/api/v1/patients/{patientId}/enroll`
5. Query patient via `/api/v1/patient-query/{patientId}`

**Expected Result**: All CRUD operations succeed, events stored, read model updated

---

### Test Case 2: Study Design E2E ✅

**Steps**:
1. Create study via existing study design API
2. Create form definitions
3. Create visit definitions
4. Build database via `/api/v1/study-database-build/build`

**Expected Result**: Study design flow works as before

---

### Test Case 3: Cross-Module Integration ✅

**Steps**:
1. Create study with arms and visits
2. Build database
3. Register patient
4. Enroll patient to specific study arm
5. Verify patient enrollment linked to study correctly

**Expected Result**: Patient enrollment references study entities correctly

---

### Test Case 4: Eureka Registration ✅

**Steps**:
1. Start Eureka server (port 8011)
2. Start clinops-ws
3. Check Eureka dashboard at `http://localhost:8011`

**Expected Result**: `CLINOPS-WS` appears in registered services, `STUDY-DESIGN-WS` and `DATACAPTURE-WS` do not appear

---

### Test Case 5: API Gateway Routing ✅

**Steps**:
1. Start API Gateway (port 8082)
2. Test request: `http://localhost:8082/clinops-ws/api/v1/patients`
3. Test request: `http://localhost:8082/clinops-ws/api/v1/studies`

**Expected Result**: Both requests route to clinops-ws successfully

---

### Test Case 6: Frontend Integration ✅

**Steps**:
1. Start frontend dev server
2. Navigate to Study Design page
3. Navigate to Patient Enrollment page
4. Verify both pages load and can make API calls

**Expected Result**: No 404 errors, both modules functional

---

## Phase 4: Cleanup

### Step 1: Remove Old datacapture-service Directory ⏳

**Only after all tests pass**:
```powershell
# Backup first
cd c:\nnsproject\clinprecision\backend
Compress-Archive -Path "clinprecision-datacapture-service" -DestinationPath "datacapture-service-backup-$(Get-Date -Format 'yyyyMMdd').zip"

# Then remove
Remove-Item -Path "clinprecision-datacapture-service" -Recurse -Force
```

---

### Step 2: Update Root Documentation ⏳

Files to update:
- `README.md` (if exists) - update service list
- `DEPLOYMENT_NOTES.md` - update deployment instructions
- `docker-compose.yml` - remove datacapture-ws, update study-design-ws to clinops-ws
- Any architecture diagrams

---

### Step 3: Git Commit Strategy ⏳

```powershell
git add .
git commit -m "Merge datacapture-service into studydesign-service, rename to clinops-service

BREAKING CHANGES:
- Renamed study-design-ws to clinops-ws
- Merged datacapture-ws into clinops-ws
- Updated API Gateway routes: /studydesign-ws -> /clinops-ws, /datacapture-ws -> /clinops-ws
- Updated Eureka service name: STUDY-DESIGN-WS + DATACAPTURE-WS -> CLINOPS-WS
- Patient enrollment module now at com.clinprecision.clinopsservice.patientenrollment
- Study design modules remain at com.clinprecision.clinopsservice.*

Migration Guide:
- Frontend: Update API_BASE from '/studydesign-ws' or '/datacapture-ws' to '/clinops-ws'
- Config: Use clinops-ws.properties instead of study-design-ws.properties and datacapture-ws.properties
- Service discovery: Look for CLINOPS-WS instead of STUDY-DESIGN-WS or DATACAPTURE-WS

Tested:
✅ Patient enrollment CRUD
✅ Study design CRUD
✅ Eureka registration
✅ API Gateway routing
✅ Frontend integration"
```

---

## Phase 5: Post-Merge Enhancements

### Enhancement 1: Implement Database Build Worker Service 🎯

**Context**: This is the PRIMARY reason for the merge. The database build worker needs access to both study design entities and patient enrollment entities.

**File to create**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/worker/StudyDatabaseBuildWorkerService.java`

**Implementation outline**:
```java
@Service
@AllArgsConstructor
public class StudyDatabaseBuildWorkerService {
    
    private final EntityManager entityManager;
    private final FormDefinitionRepository formDefinitionRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final StudyArmRepository studyArmRepository;
    
    @Async
    @EventHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        try {
            String studyId = event.getStudyId();
            
            // 1. Create subjects table (10% progress)
            createSubjectsTable(studyId);
            updateProgress(studyId, 10);
            
            // 2. Create subject_visits table (20% progress)
            createSubjectVisitsTable(studyId);
            updateProgress(studyId, 20);
            
            // 3. Fetch and create form tables (30-70% progress)
            List<FormDefinition> forms = formDefinitionRepository.findByStudyId(studyId);
            int progressPerForm = 40 / forms.size();
            for (FormDefinition form : forms) {
                createFormDataTable(studyId, form);
                updateProgress(studyId, 30 + (forms.indexOf(form) + 1) * progressPerForm);
            }
            
            // 4. Setup validation rules (80% progress)
            setupValidationRules(studyId);
            updateProgress(studyId, 80);
            
            // 5. Create indexes and foreign keys (90% progress)
            createIndexes(studyId);
            updateProgress(studyId, 90);
            
            // 6. Fire completion event (100%)
            eventGateway.publish(new StudyDatabaseBuildCompletedEvent(
                event.getBuildId(),
                studyId,
                forms.size(),
                /* tablesCreated */ forms.size() + 2,
                /* validationRulesSetup */ calculateRulesCount(forms),
                LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            eventGateway.publish(new StudyDatabaseBuildFailedEvent(
                event.getBuildId(),
                event.getStudyId(),
                e.getMessage(),
                LocalDateTime.now()
            ));
        }
    }
    
    private void createSubjectsTable(String studyId) {
        String sql = """
            CREATE TABLE IF NOT EXISTS subjects (
                subject_id VARCHAR(36) PRIMARY KEY,
                study_id VARCHAR(36) NOT NULL,
                patient_enrollment_id VARCHAR(36) NOT NULL,
                subject_number VARCHAR(20) UNIQUE NOT NULL,
                study_arm_id VARCHAR(36),
                enrollment_date DATE,
                status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_enrollment_id) REFERENCES patient_enrollments(enrollment_id),
                FOREIGN KEY (study_arm_id) REFERENCES study_arms(arm_id),
                INDEX idx_study_id (study_id),
                INDEX idx_enrollment_id (patient_enrollment_id)
            )
            """;
        entityManager.createNativeQuery(sql).executeUpdate();
    }
    
    // ... additional methods
}
```

**Priority**: HIGH - Implement immediately after merge

---

### Enhancement 2: Add Missing Clinical Data Tables 🎯

**Files to create**:
1. `backend/clinprecision-db/ddl/002_add_clinical_data_tables.sql`
2. JPA entities: `SubjectEntity.java`, `SubjectVisitEntity.java`, `FormInstanceEntity.java`
3. Repositories: `SubjectRepository.java`, `SubjectVisitRepository.java`, `FormInstanceRepository.java`

**Priority**: MEDIUM - After database build worker

---

## Rollback Plan

### If Merge Fails

**Step 1**: Restore datacapture-service from backup
```powershell
# Unzip backup
Expand-Archive -Path "datacapture-service-backup-*.zip" -DestinationPath "c:\nnsproject\clinprecision\backend\"
```

**Step 2**: Revert clinops-service to studydesign-service
```powershell
# Rename back
Rename-Item -Path "clinprecision-clinops-service" -NewName "clinprecision-studydesign-service"

# Git revert
git revert HEAD
```

**Step 3**: Restore old config files
- Restore `study-design-ws.properties`
- Restore `datacapture-ws.properties`
- Delete `clinops-ws.properties`

**Step 4**: Revert API Gateway routes

**Step 5**: Revert frontend service files

---

## Success Criteria

✅ **All tests pass** (Patient Enrollment, Study Design, Integration, Eureka, API Gateway, Frontend)
✅ **Zero downtime** for existing functionality
✅ **Service registers as CLINOPS-WS** in Eureka
✅ **API Gateway routes /clinops-ws** requests correctly
✅ **Frontend pages** load without errors
✅ **Database build worker** can access both patient enrollment and study design entities (post-merge enhancement)

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Pre-Merge Analysis | ✅ Complete | None |
| Phase 2: Merge Execution | 1 hour | Pre-merge analysis |
| Phase 3: Testing | 30 minutes | Merge execution |
| Phase 4: Cleanup | 15 minutes | All tests pass |
| Phase 5: Database Build Worker | 1 hour | Cleanup complete |
| **Total** | **~3 hours** | Sequential |

---

## References

- **Gap Analysis**: `END_TO_END_GAP_ANALYSIS.md`
- **Database Build Issue**: `DATABASE_BUILD_ISSUE_DIAGRAM.md`
- **Service Split Documentation**: `ORGANIZATION_SITE_SERVICE_SPLIT_IMPLEMENTATION.md`
- **Routing Reference**: `ROUTING_QUICK_REFERENCE.md`

---

## Next Steps

1. ✅ Review this merge strategy
2. Get user approval to proceed
3. Execute Phase 2 (Merge Execution)
4. Run Phase 3 (Testing)
5. Execute Phase 4 (Cleanup)
6. Implement Phase 5 (Database Build Worker)

---

*Document created: 2025-06-XX*
*Author: GitHub Copilot*
*Status: Ready for execution*
