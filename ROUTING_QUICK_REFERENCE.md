# Routing Configuration - Quick Reference

**Date:** October 2, 2025  
**Status:** ✅ **COMPLETE**  

---

## What Changed

### ✅ Frontend (1 file)

**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

**Before:**
```javascript
const API_BASE_URL = 'http://localhost:8081';  // ❌ Direct to service
```

**After:**
```javascript
import { API_BASE_URL } from '../config';  // ✅ Via API Gateway (port 8083)
```

**Result:** Frontend now goes through API Gateway at `http://localhost:8083`

---

### ✅ API Gateway (1 file)

**File:** `backend/clinprecision-apigateway-service/.../GatewayRoutesConfig.java`

**Added New Route:**
```java
.route("study-database-build-api", r -> r
    .path("/api/v1/study-database-builds/**")  // Database Build API
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://study-design-ws")  // ✅ Route to Study Design Service
)
```

**Result:** API Gateway now routes Database Build requests to Study Design Service

---

## Request Flow

### Before Migration ❌
```
Frontend (port 3000)
    │
    └─→ Direct to port 8081 (Eureka or Data Capture Service)
        ❌ Bypassed API Gateway
        ❌ No CORS handling
        ❌ No authentication filter
        ❌ No load balancing
```

### After Changes ✅
```
Frontend (port 3000)
    │
    └─→ API Gateway (port 8083)
        │
        └─→ Route: /api/v1/study-database-builds/**
            │
            └─→ Study Design Service (lb://study-design-ws)
                ✅ Proper CORS
                ✅ Load balancing
                ✅ Centralized logging
                ✅ Correct service
```

---

## Testing URLs

### Frontend Calls (via API Gateway)
```
Base: http://localhost:8083
Endpoints:
  GET  /api/v1/study-database-builds/health
  GET  /api/v1/study-database-builds/recent?days=7
  GET  /api/v1/study-database-builds/in-progress
  POST /api/v1/study-database-builds
  POST /api/v1/study-database-builds/{id}/cancel
```

### Service Registry (Eureka)
```
http://localhost:8081
Look for: STUDY-DESIGN-WS (UP)
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 3000 | http://localhost:3000 |
| Eureka Discovery | 8081 | http://localhost:8081 |
| Study Design Service | Dynamic | Registered via Eureka |
| Data Capture Service | Dynamic | Registered via Eureka |
| API Gateway | 8083 | http://localhost:8083 |
| Config Service | 8012 | http://localhost:8012 |

**Frontend always uses:** Port 8083 (API Gateway) ✅

---

## How to Test

### 1. Start Services
```powershell
# Order matters!
1. Config Service (8012)
2. Eureka Discovery (8081)
3. API Gateway (8083)
4. Study Design Service (dynamic)
```

### 2. Check Eureka
```
Open: http://localhost:8081
Verify: STUDY-DESIGN-WS shows UP
```

### 3. Test API Gateway
```bash
curl http://localhost:8083/api/v1/study-database-builds/health
```

**Expected:** 200 OK with service status

### 4. Test Frontend
```bash
cd frontend/clinprecision
npm start
```

**Check browser console:**
- Network tab should show: `http://localhost:8083/api/v1/...`
- NOT: `http://localhost:8081/...`

---

## Troubleshooting

### Frontend Still Uses Port 8081?

**Check:**
```bash
cd frontend/clinprecision
grep -r "8081" src/
```

**Should only find:**
- Old comments (ignore)
- Other services (OK)
- NOT in studyDatabaseBuildService.js ✅

### API Gateway Returns 404?

**Check:**
1. Eureka shows STUDY-DESIGN-WS as UP
2. API Gateway logs show route matched
3. Route order in GatewayRoutesConfig.java

### CORS Errors?

**Check:**
```properties
# In application-api-gateway.properties
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedOrigins=http://localhost:3000
```

---

## Architecture Notes

### Why API Gateway?

✅ **Benefits:**
- Centralized routing
- CORS handling
- Authentication filter
- Load balancing
- Rate limiting
- Monitoring/logging

❌ **Without API Gateway:**
- Each service handles CORS
- No central auth point
- Complex client routing
- Harder to monitor

### Service Discovery

```
API Gateway uses Eureka service discovery:
  lb://study-design-ws  →  Finds STUDY-DESIGN-WS in Eureka
                        →  Routes to actual instance(s)
                        →  Load balances if multiple instances
```

---

## Summary

### Changes Made: ✅
1. ✅ Frontend uses API Gateway (config.js)
2. ✅ API Gateway routes Database Build to Study Design Service
3. ✅ Documented routing configuration

### Files Changed: 3
1. `studyDatabaseBuildService.js` (frontend)
2. `GatewayRoutesConfig.java` (API Gateway)
3. `ROUTING_ANALYSIS_AND_FIXES.md` (documentation)

### Commit: 50dc61f
```
Fix routing: Update frontend and API Gateway for Database Build migration
```

---

## Related Documents

- [ROUTING_ANALYSIS_AND_FIXES.md](./ROUTING_ANALYSIS_AND_FIXES.md) - Full analysis
- [DB_BUILD_MIGRATION_TESTING_GUIDE.md](./DB_BUILD_MIGRATION_TESTING_GUIDE.md) - Testing guide
- [README_PHASE_1_MIGRATION.md](./README_PHASE_1_MIGRATION.md) - Migration summary

---

**Status:** ✅ Routing Configuration Complete  
**Next:** Start services and test integration  
**Branch:** `feature/db-build-migration-phase1`
