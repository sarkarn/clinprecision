# Database Build Migration - Quick Start Testing Guide

**Date:** October 2, 2025  
**Status:** Ready for Testing  

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend Services (In Order!)

```powershell
# 1. Start Config Service (Port 8012)
cd backend\clinprecision-config-service
mvn spring-boot:run

# Wait for: "Started ConfigServiceApplication"
```

```powershell
# 2. Start Eureka Discovery Service (Port 8081)
cd backend\clinprecision-discovery-service
mvn spring-boot:run

# Wait for: "Started DiscoveryServiceApplication"
# Open: http://localhost:8081 (verify it loads)
```

```powershell
# 3. Start API Gateway (Port 8083)
cd backend\clinprecision-apigateway-service
mvn spring-boot:run

# Wait for: "Started ApiGatewayApplication"
```

```powershell
# 4. Start Study Design Service (Dynamic Port)
cd backend\clinprecision-studydesign-service
mvn spring-boot:run

# Wait for: "Started StudyDesignServiceApplication"
# Look for: "Registering application STUDY-DESIGN-WS with eureka"
```

### Step 2: Verify Service Registration

**Open Eureka Dashboard:**
```
http://localhost:8081
```

**Look for:**
```
STUDY-DESIGN-WS     UP (1) - HOST:STUDY-DESIGN-WS:xxxxx
```

✅ **If you see this, the service is registered!**

### Step 3: Test Backend API

**Using Browser or Postman:**

```bash
# 1. Health Check
GET http://localhost:8083/api/v1/study-database-builds/health
Expected: 200 OK with service status

# 2. Get Recent Builds (last 7 days)
GET http://localhost:8083/api/v1/study-database-builds/recent?days=7
Expected: 200 OK with array (may be empty)

# 3. Get In-Progress Builds
GET http://localhost:8083/api/v1/study-database-builds/in-progress
Expected: 200 OK with array
```

### Step 4: Test Frontend

```powershell
# Start React App
cd frontend\clinprecision
npm start

# Opens: http://localhost:3000
```

**Navigate to:**
```
Study Design → Database Build
```

**Verify:**
- ✅ No CORS errors in browser console
- ✅ No 404 errors
- ✅ Build list loads (may be empty)
- ✅ Filters work
- ✅ Can click "New Build" button

---

## 🧪 Detailed Testing

### Test 1: Service Startup ✅

**What to check:**
- Config Service logs show no errors
- Eureka Dashboard shows all services
- Study Design Service registers successfully
- API Gateway can route requests

**Success Criteria:**
```
✅ All services started
✅ No ERROR logs
✅ Eureka shows STUDY-DESIGN-WS as UP
✅ API Gateway responds to /api/v1/study-database-builds/health
```

### Test 2: API Endpoints ✅

**What to test:**

| Endpoint | Method | Expected Result |
|----------|--------|----------------|
| `/api/v1/study-database-builds/health` | GET | 200 OK, service status |
| `/api/v1/study-database-builds/recent?days=7` | GET | 200 OK, builds array |
| `/api/v1/study-database-builds/in-progress` | GET | 200 OK, builds array |
| `/api/v1/study-database-builds/failed` | GET | 200 OK, builds array |
| `/api/v1/study-database-builds/cancelled` | GET | 200 OK, builds array |

**Test with curl:**
```bash
curl -X GET http://localhost:8083/api/v1/study-database-builds/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "service": "Study Database Build Service",
  "timestamp": "2025-10-02T14:30:00Z"
}
```

### Test 3: Frontend Integration ✅

**What to test:**
1. **Load Page:**
   - Navigate to Database Build page
   - No console errors
   - Page renders correctly

2. **Fetch Data:**
   - Build list loads
   - No CORS errors
   - Empty state shows if no builds

3. **Filters:**
   - Status filter dropdown works
   - Date range picker works
   - Search input works
   - Sort dropdown works

4. **Actions:**
   - Can open "New Build" modal (if implemented)
   - Can view build details
   - Can refresh build list

**Browser Console Check:**
```javascript
// Should NOT see:
❌ Access to XMLHttpRequest blocked by CORS
❌ Failed to fetch
❌ 404 Not Found

// Should see:
✅ GET http://localhost:8083/api/v1/study-database-builds/recent?days=7 200 OK
```

### Test 4: CQRS/Event Sourcing ✅

**What to test:**
1. **Create a Build:**
   ```bash
   POST http://localhost:8083/api/v1/study-database-builds
   Content-Type: application/json
   
   {
     "studyId": 1,
     "studyName": "Test Study",
     "studyProtocolId": 1,
     "requestedBy": "Admin User",
     "buildConfiguration": {
       "forms": ["Form1", "Form2"],
       "validations": ["Required", "Range"]
     }
   }
   ```

2. **Check Event Store:**
   ```sql
   -- Check events were created
   SELECT * FROM domain_event_entry 
   WHERE aggregate_identifier LIKE 'StudyDatabaseBuild%'
   ORDER BY time_stamp DESC
   LIMIT 10;
   ```

3. **Check Projection:**
   ```sql
   -- Check entity was created
   SELECT * FROM study_database_build 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

**Success Criteria:**
```
✅ Command accepted (201 Created)
✅ Event stored in domain_event_entry
✅ Projection updated in study_database_build table
✅ Can retrieve build via API
```

---

## ❌ Common Issues & Fixes

### Issue 1: Service Won't Start

**Symptom:**
```
Error creating bean with name 'studyDatabaseBuildRepository'
```

**Fix:**
```java
// Check StudyDesignServiceApplication.java has:
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.studydesignservice.studydatabase.repository"
})
```

### Issue 2: 404 Not Found

**Symptom:**
```
GET http://localhost:8083/api/v1/study-database-builds/health -> 404
```

**Fix:**
1. Check Eureka: http://localhost:8081
2. Verify STUDY-DESIGN-WS is UP
3. Check API Gateway logs for routing
4. Verify controller has correct @RequestMapping

### Issue 3: CORS Error

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:**
```properties
# In application-api-gateway.properties, verify:
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedOrigins=http://localhost:3000
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods=GET,POST,PUT,DELETE,OPTIONS
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedHeaders=*
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowCredentials=true
```

### Issue 4: Axon Events Not Saved

**Symptom:**
```
Events created but not in domain_event_entry table
```

**Fix:**
1. Check Axon tables exist:
   ```sql
   SHOW TABLES LIKE 'domain_event_entry';
   ```

2. If not, create them (Axon should auto-create):
   ```sql
   -- Check StudyDesignServiceApplication.java has:
   @EntityScan(basePackages = {
       "org.axonframework.eventsourcing.eventstore.jpa"
   })
   ```

3. Verify AxonConfig is imported:
   ```java
   @Import(AxonConfig.class)
   ```

### Issue 5: Frontend Still Uses Old Service

**Symptom:**
```
GET http://localhost:8081/api/v1/study-database-builds -> Connection refused
```

**Fix:**
```javascript
// In studyDatabaseBuildService.js, should use API Gateway:
const API_BASE_URL = 'http://localhost:8083'; // NOT 8081!
```

---

## 📊 Test Results Template

**Date Tested:** _______________  
**Tested By:** _______________  

| Test | Status | Notes |
|------|--------|-------|
| Config Service Started | ⬜ Pass ⬜ Fail | |
| Eureka Service Started | ⬜ Pass ⬜ Fail | |
| API Gateway Started | ⬜ Pass ⬜ Fail | |
| Study Design Service Started | ⬜ Pass ⬜ Fail | |
| Service Registered in Eureka | ⬜ Pass ⬜ Fail | |
| Health Endpoint Responds | ⬜ Pass ⬜ Fail | |
| Get Recent Builds Works | ⬜ Pass ⬜ Fail | |
| Frontend Loads Without Errors | ⬜ Pass ⬜ Fail | |
| No CORS Errors | ⬜ Pass ⬜ Fail | |
| Build List Displays | ⬜ Pass ⬜ Fail | |
| Filters Work | ⬜ Pass ⬜ Fail | |
| Can Create Build | ⬜ Pass ⬜ Fail | |
| Events Stored | ⬜ Pass ⬜ Fail | |
| Projections Updated | ⬜ Pass ⬜ Fail | |

**Overall Result:** ⬜ Pass ⬜ Fail  

**Issues Found:**
```
1. 
2. 
3. 
```

**Sign-off:**
- Developer: _______________
- QA: _______________
- Technical Lead: _______________

---

## 🎯 Acceptance Criteria

Phase 1 is **ACCEPTED** when:

- ✅ All services start without errors
- ✅ Study Design Service registers with Eureka
- ✅ All API endpoints return 200 OK
- ✅ Frontend loads without CORS errors
- ✅ Can fetch build list
- ✅ Can create new build
- ✅ Events are stored in event store
- ✅ Projections are updated correctly
- ✅ No data loss from existing builds
- ✅ Performance is acceptable (< 2s for queries)

**When all checkboxes above are ✅, Phase 1 is COMPLETE!**

---

## 📞 Support

**Issues?** Contact:
- Technical Lead: _______________
- DevOps: _______________
- Database Admin: _______________

**Documentation:**
- [DB_BUILD_MIGRATION_PHASE_1_COMPLETE.md](./DB_BUILD_MIGRATION_PHASE_1_COMPLETE.md)
- [DB_BUILD_MIGRATION_PHASE_1_PLAN.md](./DB_BUILD_MIGRATION_PHASE_1_PLAN.md)
- [MICROSERVICES_ORGANIZATION_ANALYSIS.md](./MICROSERVICES_ORGANIZATION_ANALYSIS.md)

---

**Happy Testing! 🚀**
