# Routing Analysis: Database Build Migration Impact

**Date:** October 2, 2025  
**Migration:** Database Build from Data Capture to Study Design Service  

---

## Current Routing Configuration

### Backend Services Registration Names
- **Study Design Service:** `study-design-ws` ✅
- **Data Capture Service:** `datacapture-ws` ✅

### API Gateway Routes (GatewayRoutesConfig.java)

**Study Design Service Routes:**
```java
// Route 1: /study-design-ws/api/** 
.route("study-design-ws-api", r -> r
    .path("/study-design-ws/api/**")
    ...
    .uri("lb://study-design-ws")  // Load balancer to study-design-ws
)

// Route 2: Direct routes (studies, arms, visits)
.route("study-design-direct", r -> r
    .path("/studies/**", "/arms/**", "/api/studies/**", ...)
    ...
    .uri("lb://study-design-ws")
)
```

**Data Capture Service Routes:**
```java
// Route 1: /datacapture-ws/api/**
.route("datacapture-ws-api", r -> r
    .path("/datacapture-ws/api/**")
    ...
    .uri("lb://datacapture-ws")  // Load balancer to datacapture-ws
)

// Route 2: Direct routes
.route("datacapture-ws-direct", r -> r
    .path("/datacapture/**")
    ...
    .uri("lb://datacapture-ws")
)
```

---

## Frontend Configuration

### Current Frontend Service URL
**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;
```

**Problem:** ❌ 
- Frontend is pointing to port **8081** (Eureka Discovery Service OR direct to Data Capture)
- This is **NOT going through API Gateway** (port 8083)

### Recommended Frontend Configuration
**File:** `frontend/clinprecision/src/config.js`

```javascript
const API_GATEWAY_HOST = process.env.REACT_APP_API_GATEWAY_HOST || "localhost";
const API_GATEWAY_PORT = process.env.REACT_APP_API_GATEWAY_PORT || "8083";

export const API_BASE_URL = `http://${API_GATEWAY_HOST}:${API_GATEWAY_PORT}`;
```

**This is CORRECT!** ✅ Should use API Gateway at port 8083.

---

## Issues Found & Solutions

### Issue 1: Frontend Using Wrong Base URL ❌

**Current:**
```javascript
// studyDatabaseBuildService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
```

**Problem:**
- Port 8081 is either Eureka or direct service access
- NOT going through API Gateway
- Will bypass authentication, CORS, load balancing

**Solution:** ✅
```javascript
// Import from config.js instead
import { API_BASE_URL } from '../config';
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;
```

---

### Issue 2: API Gateway Routing Unclear ⚠️

**Current Gateway Routes:**
- `/study-design-ws/api/**` → study-design-ws
- `/datacapture-ws/api/**` → datacapture-ws

**Database Build API Path:**
- `/api/v1/study-database-builds`

**Question:** Which route will match?

**Answer:** 
- If frontend calls: `http://localhost:8083/api/v1/study-database-builds`
- This will **NOT match** either `/study-design-ws/api/**` or `/datacapture-ws/api/**`
- It will match the direct route: `/api/studies/**` ❌ (WRONG!)

**Solution:** Need to add explicit route for Database Build API ✅

---

## Required Changes

### Change 1: Update Frontend Service ✅

**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

**FROM:**
```javascript
import ApiService from './ApiService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;
```

**TO:**
```javascript
import ApiService from './ApiService';
import { API_BASE_URL } from '../config';

const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;
```

---

### Change 2: Add API Gateway Route ✅

**File:** `backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/GatewayRoutesConfig.java`

**Add BEFORE the existing study-design routes:**

```java
// Study Database Build API - Route to Study Design Service
.route("study-database-build-api", r -> r
    .path("/api/v1/study-database-builds/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://study-design-ws")
)
```

**Or use service prefix (recommended):**

```java
// Study Database Build API - Route to Study Design Service
.route("study-database-build-api", r -> r
    .path("/study-design-ws/api/v1/study-database-builds/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .rewritePath("/study-design-ws/(?<segment>.*)", "/${segment}")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://study-design-ws")
)
```

**And update frontend to:**
```javascript
const STUDY_DB_BUILD_API = `${API_BASE_URL}/study-design-ws/api/v1/study-database-builds`;
```

---

## Recommended Approach

### Option A: Service Prefix (Recommended) ✅

**Pros:**
- Clear which service handles the request
- Consistent with existing routes
- Easy to debug
- Explicit routing

**Cons:**
- Longer URLs
- Service name exposed in URL

**Implementation:**
1. Add route: `/study-design-ws/api/v1/study-database-builds/**` → `study-design-ws`
2. Update frontend: Use `${API_BASE_URL}/study-design-ws/api/v1/study-database-builds`
3. No rewrite needed if frontend includes `/study-design-ws/`

**OR with rewrite:**
1. Add route with rewrite to remove `/study-design-ws/`
2. Frontend calls: `/study-design-ws/api/v1/study-database-builds`
3. Backend receives: `/api/v1/study-database-builds`

---

### Option B: Direct Path (Alternative) ⚠️

**Pros:**
- Shorter URLs
- Service agnostic

**Cons:**
- Need explicit route for every API path
- Harder to maintain
- Less clear which service handles it

**Implementation:**
1. Add route: `/api/v1/study-database-builds/**` → `study-design-ws`
2. Update frontend: Use `${API_BASE_URL}/api/v1/study-database-builds`
3. Gateway routes directly to Study Design Service

---

## Summary of Required Changes

### ✅ Frontend Changes (1 file)

**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

**Change:**
```javascript
// Remove:
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

// Add:
import { API_BASE_URL } from '../config';

// Keep:
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;
```

**This will make it use:** `http://localhost:8083/api/v1/study-database-builds`

---

### ✅ API Gateway Changes (1 file)

**File:** `backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/GatewayRoutesConfig.java`

**Add route (OPTION A - Direct Path):**
```java
// Add BEFORE existing study-design routes
.route("study-database-build-api", r -> r
    .path("/api/v1/study-database-builds/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .filters(f -> f
            .removeRequestHeader("Cookie")
            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://study-design-ws")
)
```

**OR (OPTION B - Service Prefix):**
```java
// This is already covered by existing route:
.route("study-design-ws-api", r -> r
    .path("/study-design-ws/api/**")
    ...
    .uri("lb://study-design-ws")
)

// Just update frontend to use:
// `${API_BASE_URL}/study-design-ws/api/v1/study-database-builds`
```

---

## Recommendation

### Use OPTION A (Direct Path) ✅

**Why:**
- Frontend already uses `/api/v1/study-database-builds` pattern
- Minimal frontend change (just fix base URL)
- Backend change is small (add one route)
- Future-proof for service consolidation

**Changes Needed:**
1. ✅ **Frontend:** Change base URL to use API Gateway (from config.js)
2. ✅ **Gateway:** Add explicit route for `/api/v1/study-database-builds/**` → `study-design-ws`

**Total Changes:** 2 files

---

## Testing After Changes

### 1. Test API Gateway Route
```bash
# Start services
# Config → Eureka → API Gateway → Study Design Service

# Test via API Gateway
curl http://localhost:8083/api/v1/study-database-builds/health

# Should return 200 OK from Study Design Service
```

### 2. Test Frontend
```bash
# Start React app
npm start

# Open browser console
# Navigate to Database Build page
# Check Network tab:
# Should see: http://localhost:8083/api/v1/study-database-builds/recent?days=7
# NOT: http://localhost:8081/...
```

### 3. Verify Service Registration
```
# Open Eureka dashboard
http://localhost:8081

# Verify:
# - STUDY-DESIGN-WS is UP
# - Has 1+ instances
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Frontend still uses port 8081 | High | High | Update to use config.js |
| Route not matched in gateway | High | Medium | Add explicit route |
| CORS issues | Medium | Low | Already configured |
| Service not found | Medium | Low | Verify Eureka registration |

---

## Conclusion

### Required Changes: YES ✅

**Frontend:**
- ✅ Must update `studyDatabaseBuildService.js` to use API Gateway (config.js)
- Change 1 line: Import API_BASE_URL from config

**API Gateway:**
- ✅ Should add explicit route for `/api/v1/study-database-builds/**`
- Add 1 route definition to GatewayRoutesConfig.java

**Total:** 2 files need changes ✅

Without these changes:
- ❌ Frontend will bypass API Gateway
- ❌ Will try to connect directly to port 8081
- ❌ May hit wrong service or fail completely
- ❌ CORS configuration won't apply
- ❌ Authentication filter won't apply

With these changes:
- ✅ Proper API Gateway routing
- ✅ CORS handled correctly
- ✅ Authentication filter applied
- ✅ Load balancing available
- ✅ Centralized logging/monitoring

**Proceed with changes!** 🚀
