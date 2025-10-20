# Organization Dropdown Infinite Loop Fix - October 20, 2025

## Problem Description

**Symptom:** Study Edit page organization dropdown keeps flickering in an infinite loop.

**Root Cause:** Frontend `OrganizationService.js` was calling the organization-service **directly** via `/organization-ws/api/organizations` instead of going through the clinops-service proxy.

## Why This Caused Infinite Loop

1. Frontend tried to call `organization-ws` service directly
2. Direct service-to-service calls not configured/accessible from browser
3. API calls failed or timed out
4. React `useEffect` in `StudyEditWizard.jsx` detected failure
5. Retry triggered → infinite loop and flickering

## The Solution

### What We Built Today (Feign Client Architecture)

We created a **proxy pattern** where:
- Frontend → calls → `clinops-service` → calls → `organization-service` via Feign

**Backend Components Created:**
1. `OrganizationServiceClient.java` - Feign client interface
2. `OrganizationProxyController.java` - REST proxy controller

```
┌──────────┐     HTTP      ┌──────────────────┐    Feign     ┌──────────────────────┐
│ Frontend │────────────>  │ clinops-service  │─────────────> │ organization-service │
│          │  /clinops-ws  │ Proxy Controller │  (internal)  │                      │
└──────────┘               └──────────────────┘               └──────────────────────┘
```

### The Fix Applied

**Changed:** `frontend/clinprecision/src/services/OrganizationService.js`

```javascript
// BEFORE (WRONG - Direct call)
getAllOrganizations: async () => {
    const response = await ApiService.get('/organization-ws/api/organizations');
    return response.data;
}

// AFTER (CORRECT - Via proxy)
getAllOrganizations: async () => {
    const response = await ApiService.get('/clinops-ws/api/organizations');
    return response.data;
}
```

**Impact:**
- `getAllOrganizations()` - Fixed ✅
- `getOrganizationById()` - Fixed ✅

## How It Works Now

### Request Flow

1. **Frontend** calls: `OrganizationService.getAllOrganizations()`
2. **HTTP GET** to: `/clinops-ws/api/organizations`
3. **clinops-service** receives at `OrganizationProxyController.getAllOrganizations()`
4. **Feign client** `OrganizationServiceClient` calls organization-service internally
5. **Response** flows back through same chain

### Backend Components

**OrganizationProxyController.java**
```java
@RestController
@RequestMapping("/api/organizations")
public class OrganizationProxyController {
    private final OrganizationServiceClient organizationServiceClient;

    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        return organizationServiceClient.getAllOrganizations();
    }
}
```

**OrganizationServiceClient.java**
```java
@FeignClient(name = "organization-ws")
public interface OrganizationServiceClient {
    @GetMapping("/api/organizations")
    ResponseEntity<List<OrganizationDto>> getAllOrganizations();
}
```

## Verification Steps

### 1. Check Backend is Running
Ensure clinops-service has Feign client enabled:
```java
@SpringBootApplication
@EnableFeignClients  // ✅ Already present in ClinicalOperationsServiceApplication.java
```

### 2. Test Proxy Endpoint
```bash
# Direct test of proxy endpoint
curl http://localhost:8081/api/organizations

# Should return list of organizations from organization-service
```

### 3. Test Frontend
1. Navigate to Study Edit page
2. Organization dropdown should load without flickering
3. Check browser console - no infinite API call loops
4. Check Network tab - should see single call to `/clinops-ws/api/organizations`

## Files Modified

### Frontend
- ✅ `frontend/clinprecision/src/services/OrganizationService.js`
  - Updated `getAllOrganizations()` to use `/clinops-ws/api/organizations`
  - Updated `getOrganizationById()` to use `/clinops-ws/api/organizations/{id}`

### Backend (Created Earlier Today)
- ✅ `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/client/OrganizationServiceClient.java`
- ✅ `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/controller/OrganizationProxyController.java`

## Why This Pattern?

### Benefits of Proxy Pattern

1. **Simplified Frontend:**
   - Frontend only talks to one service (clinops-service)
   - No need to configure multiple service URLs in frontend

2. **Security:**
   - Internal services (organization-ws) not exposed to browser
   - Single authentication/authorization point

3. **Service Discovery:**
   - Feign uses Eureka for service discovery
   - No hardcoded URLs in frontend

4. **Error Handling:**
   - Centralized error handling in proxy
   - Consistent error responses

## Related Changes Today

This fix is part of the larger restoration effort:
1. ✅ Organization Feign Client created
2. ✅ Organization Proxy Controller created  
3. ✅ Study Create/Edit field mapping fixed
4. ✅ Protocol version fields restored
5. ✅ **Frontend service URL fixed** (this document)

## Testing Checklist

- [ ] Backend clinops-service running
- [ ] Backend organization-service running
- [ ] Frontend dev server running
- [ ] Navigate to `/study-design/studies`
- [ ] Click "Edit" on any study
- [ ] Organization dropdown loads successfully
- [ ] No flickering or infinite loop
- [ ] Can select organization from dropdown
- [ ] Can save study with organization change

## Troubleshooting

### If Dropdown Still Flickers

1. **Check browser console for errors:**
   ```
   Network tab → Filter: organizations
   Should see: GET /clinops-ws/api/organizations → 200 OK
   ```

2. **Check backend logs:**
   ```
   Look for: "Proxying request to get all organizations"
   ```

3. **Verify Feign client is working:**
   ```bash
   # Check if organization-service is registered with Eureka
   curl http://localhost:8761/eureka/apps
   ```

4. **Check useEffect dependencies:**
   - `StudyEditWizard.jsx` should NOT have `updateFields` in dependency array
   - Should be: `}, [studyId]);` not `}, [studyId, updateFields]);`

### Common Pitfalls

❌ **Don't** call organization-service directly from frontend  
✅ **Do** call through clinops-service proxy

❌ **Don't** add state setters to useEffect dependencies  
✅ **Do** use empty dependency array or only primitive dependencies

---

**Fixed By:** GitHub Copilot  
**Date:** October 20, 2025  
**Status:** ✅ Fix Applied - Ready for Testing
