# Database Build Feature Migration - Phase 1 Plan

**Migration Date:** October 2, 2025  
**Phase:** 1 - Move from Data Capture Service to Study Design Service  
**Estimated Time:** 2-3 days  
**Risk Level:** Medium  

---

## Executive Summary

Moving the Study Database Build feature from `clinprecision-datacapture-service` to `clinprecision-studydesign-service` to align with proper domain boundaries. Database Build is the last step of study design, not the first step of data capture.

---

## Migration Scope

### Source Location (Current)
```
backend/clinprecision-datacapture-service/src/main/java/com/clinprecision/datacaptureservice/studydatabase/
```

### Target Location (New)
```
backend/clinprecision-studydesign-service/src/main/java/com/clinprecision/studydesignservice/studydatabase/
```

### Frontend Location (No Change)
```
frontend/clinprecision/src/components/modules/trialdesign/database-build/
```
✅ **Already correctly placed in Study Design module**

---

## Files to Migrate (22 files)

### 1. Domain Layer (CQRS/Event Sourcing)

**Commands** (3 files):
- `domain/commands/BuildStudyDatabaseCommand.java`
- `domain/commands/CancelStudyDatabaseBuildCommand.java`
- `domain/commands/CompleteStudyDatabaseBuildCommand.java`

**Events** (4 files):
- `domain/events/StudyDatabaseBuildStartedEvent.java`
- `domain/events/StudyDatabaseBuildCancelledEvent.java`
- `domain/events/StudyDatabaseBuildFailedEvent.java`
- `domain/events/StudyDatabaseValidationCompletedEvent.java`

**Aggregate** (1 file):
- `aggregate/StudyDatabaseBuildAggregate.java`

### 2. Application Layer

**Services** (2 files):
- `service/StudyDatabaseBuildCommandService.java`
- `service/StudyDatabaseBuildQueryService.java`

**Controller** (1 file):
- `controller/StudyDatabaseBuildController.java`

### 3. Infrastructure Layer

**Repository** (1 file):
- `repository/StudyDatabaseBuildRepository.java`

**Projection** (1 file):
- `projection/StudyDatabaseBuildProjectionHandler.java`

### 4. Data Transfer Objects (5 files)

- `dto/StudyDatabaseBuildDto.java`
- `dto/BuildStudyDatabaseRequestDto.java`
- `dto/CancelStudyDatabaseBuildRequestDto.java`
- `dto/CompleteStudyDatabaseBuildRequestDto.java`
- `dto/ValidateStudyDatabaseRequestDto.java`

### 5. Domain Models (2 files)

- `entity/StudyDatabaseBuildEntity.java`
- `entity/StudyDatabaseBuildStatus.java`

---

## Migration Steps

### Step 1: Pre-Migration Preparation ✅

- [x] Create migration plan document
- [ ] Create git branch: `feature/db-build-migration-phase1`
- [ ] Backup current implementation
- [ ] Document current API endpoints
- [ ] Review all dependencies

### Step 2: Copy Package Structure

1. **Create target directory structure** in Study Design Service:
   ```
   studydesignservice/
   └── studydatabase/
       ├── aggregate/
       ├── controller/
       ├── domain/
       │   ├── commands/
       │   └── events/
       ├── dto/
       ├── entity/
       ├── projection/
       ├── repository/
       └── service/
   ```

2. **Copy all 22 files** to new location

### Step 3: Update Package Declarations

Update package names in all files:
```java
// FROM:
package com.clinprecision.datacaptureservice.studydatabase.*;

// TO:
package com.clinprecision.studydesignservice.studydatabase.*;
```

### Step 4: Update Import Statements

Replace all imports referencing datacaptureservice:
```java
// FROM:
import com.clinprecision.datacaptureservice.studydatabase.*;

// TO:
import com.clinprecision.studydesignservice.studydatabase.*;
```

### Step 5: Configure Study Design Service

Update `StudyDesignServiceApplication.java`:

```java
@EnableJpaRepositories(basePackages = {
    // Existing packages...
    "com.clinprecision.studydesignservice.studydatabase.repository"  // ADD
})
@EntityScan(basePackages = {
    // Existing packages...
    "com.clinprecision.studydesignservice.studydatabase.entity",  // ADD
    "org.axonframework.eventsourcing.eventstore.jpa",             // ADD
    "org.axonframework.modelling.saga.repository.jpa",            // ADD
    "org.axonframework.eventhandling.tokenstore.jpa"              // ADD
})
@ComponentScan(basePackages = {
    // Existing packages...
    "com.clinprecision.axon"  // ADD for Axon support
})
@Import(AxonConfig.class)  // ADD
```

### Step 6: Update API Gateway Routes

Update API Gateway configuration to route `/api/v1/study-database-builds/**` to Study Design Service instead of Data Capture Service.

**File:** `backend/clinprecision-apigateway-service/src/main/resources/application.yml`

```yaml
# FROM:
- id: datacapture-study-database-build
  uri: lb://datacapture-ws
  predicates:
    - Path=/api/v1/study-database-builds/**

# TO:
- id: studydesign-study-database-build
  uri: lb://study-design-ws
  predicates:
    - Path=/api/v1/study-database-builds/**
```

### Step 7: Update Frontend API Configuration (if needed)

Check if frontend is using direct service URLs. If so, no change needed since it should go through API Gateway.

**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

Should use: `http://localhost:8080/api/v1/study-database-builds` (API Gateway)
Not: `http://localhost:8081/api/v1/study-database-builds` (Direct to Data Capture Service)

### Step 8: Update Dependencies

Ensure Study Design Service has required dependencies in `pom.xml`:

```xml
<!-- Axon Framework for CQRS/Event Sourcing -->
<dependency>
    <groupId>org.axonframework</groupId>
    <artifactId>axon-spring-boot-starter</artifactId>
</dependency>

<!-- clinprecision-axon-lib (if exists) -->
<dependency>
    <groupId>com.clinprecision</groupId>
    <artifactId>clinprecision-axon-lib</artifactId>
</dependency>
```

### Step 9: Database Migration

**Option A: Keep existing tables** (Recommended for Phase 1)
- Tables remain in existing database
- Update service connection string
- Zero data migration needed

**Option B: Move tables** (For future cleanup)
- Export data from Data Capture DB
- Import to Study Design DB
- Update foreign keys

### Step 10: Testing

1. **Unit Tests**: Run all tests in new location
2. **Integration Tests**: Test API endpoints
3. **Frontend Integration**: Test UI with new backend
4. **Event Store**: Verify Axon events work correctly

### Step 11: Cleanup (After successful migration)

1. Comment out old code in Data Capture Service (don't delete yet)
2. Add deprecation notices
3. Update documentation
4. Plan for removal in Phase 2

---

## Configuration Changes Summary

### 1. Study Design Service Application

**Add to annotations:**
- `@EnableJpaRepositories` with studydatabase.repository
- `@EntityScan` with studydatabase.entity + Axon tables
- `@ComponentScan` with com.clinprecision.axon
- `@Import(AxonConfig.class)`

### 2. API Gateway

**Route change:**
```
/api/v1/study-database-builds/** → study-design-ws (was: datacapture-ws)
```

### 3. Service Registry

Ensure Study Design Service registers correctly with Eureka.

---

## Rollback Plan

If migration fails:

1. **Remove** new code from Study Design Service
2. **Restore** API Gateway route to Data Capture Service
3. **Verify** Data Capture Service still works
4. **Investigate** and fix issues
5. **Retry** migration

---

## Post-Migration Verification Checklist

### Backend Verification
- [ ] Study Design Service starts without errors
- [ ] All 22 files compile successfully
- [ ] Repository beans are created
- [ ] Axon Framework initializes correctly
- [ ] API endpoints respond at `/api/v1/study-database-builds`

### Integration Verification
- [ ] API Gateway routes requests correctly
- [ ] Frontend can fetch build list
- [ ] Frontend can create new build
- [ ] Frontend can view build details
- [ ] Frontend can cancel build
- [ ] Events are stored in event store

### Database Verification
- [ ] `study_database_build` table accessible
- [ ] `domain_event_entry` table accessible (Axon)
- [ ] No foreign key constraint errors
- [ ] Projections update correctly

### Frontend Verification
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] UI displays build list
- [ ] All actions work (view, refresh, cancel)
- [ ] Real-time updates work (WebSocket if implemented)

---

## Dependencies Analysis

### Required in Study Design Service

1. **Spring Boot & Web**
   - ✅ Already present

2. **Spring Data JPA**
   - ✅ Already present

3. **Axon Framework**
   - ❓ Check `pom.xml`
   - May need to add

4. **clinprecision-axon-lib**
   - ❓ Check `pom.xml`
   - Import AxonConfig

5. **Eureka Client**
   - ✅ Already present

6. **Feign Client**
   - ✅ Already present

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Package name conflicts | Low | Medium | Thorough find/replace |
| Missing dependencies | Medium | High | Check pom.xml before migration |
| API Gateway routing issues | Low | High | Test gateway config |
| Database connection issues | Low | Medium | Use same DB initially |
| Axon initialization issues | Medium | High | Test event store setup |
| Frontend breaking | Low | High | Frontend already aligned |

---

## Timeline

| Day | Tasks | Duration |
|-----|-------|----------|
| Day 1 AM | • Create branch<br>• Copy files<br>• Update packages | 3-4 hours |
| Day 1 PM | • Update imports<br>• Configure service<br>• Check dependencies | 3-4 hours |
| Day 2 AM | • Update API Gateway<br>• Test backend<br>• Fix issues | 3-4 hours |
| Day 2 PM | • Test frontend integration<br>• Verify all features<br>• Fix issues | 3-4 hours |
| Day 3 | • Final testing<br>• Documentation<br>• Cleanup | 4-6 hours |

**Total Estimated Time:** 16-24 hours (2-3 days)

---

## Success Criteria

✅ **Phase 1 Complete When:**

1. All 22 files successfully migrated
2. Study Design Service compiles and starts
3. API Gateway routes correctly
4. Frontend works without code changes
5. All CRUD operations functional
6. Event sourcing works correctly
7. Zero data loss
8. Zero downtime (using blue-green deployment)

---

## Next Steps After Phase 1

1. **Monitor** for 1-2 weeks in production
2. **Collect** metrics on service performance
3. **Plan** Phase 2: Full Clinical Operations Service merge
4. **Document** lessons learned
5. **Update** architecture diagrams

---

## Related Documents

- [MICROSERVICES_ORGANIZATION_ANALYSIS.md](./MICROSERVICES_ORGANIZATION_ANALYSIS.md)
- [MICROSERVICES_ARCHITECTURE_VISUAL_GUIDE.md](./MICROSERVICES_ARCHITECTURE_VISUAL_GUIDE.md)
- [MICROSERVICES_ARCHITECTURE_FORECAST.md](./MICROSERVICES_ARCHITECTURE_FORECAST.md)
- [STUDY_DATABASE_BUILD_DDD_CQRS_IMPLEMENTATION_PLAN.md](./STUDY_DATABASE_BUILD_DDD_CQRS_IMPLEMENTATION_PLAN.md)

---

**Migration Owner:** Development Team  
**Approval Required:** Technical Lead, Product Owner  
**Status:** 🔄 Ready to Execute
