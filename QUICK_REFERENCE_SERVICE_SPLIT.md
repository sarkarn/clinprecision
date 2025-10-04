# Organization & Site Service Split - Quick Reference

## ✅ Phase 2 Completed: organization-ws Service Created

### Created Files:
```
backend/clinprecision-organization-service/
├── pom.xml
├── Dockerfile
├── src/main/
│   ├── java/com/clinprecision/organizationservice/
│   │   ├── OrganizationApplication.java
│   │   ├── repository/
│   │   │   ├── OrganizationRepository.java
│   │   │   └── OrganizationContactRepository.java
│   │   ├── service/
│   │   │   ├── OrganizationService.java
│   │   │   └── impl/OrganizationServiceImpl.java
│   │   └── ui/controller/
│   │       └── OrganizationController.java
│   └── resources/
│       ├── application.properties
│       └── bootstrap.properties
└── Config Server:
    └── config/application-organization-ws.properties
```

**Build Status:** ✅ SUCCESS

---

## 🔄 Phase 3: Next Steps

### A. Rename admin-ws → site-ws

```powershell
cd c:\nnsproject\clinprecision\backend
Rename-Item -Path "clinprecision-admin-service" -NewName "clinprecision-site-service"
```

### B. Delete Organization Files from site-ws

After renaming, delete these from site-ws:
- OrganizationController.java
- OrganizationService.java
- OrganizationServiceImpl.java
- OrganizationRepository.java
- OrganizationContactRepository.java

### C. Update site-ws Files

**1. Rename:** `AdminApplication.java` → `SiteApplication.java`

**2. Update package names:**
   - From: `com.clinprecision.adminservice`
   - To: `com.clinprecision.siteservice`

**3. Update `pom.xml`:**
   - artifactId: `clinprecision-site-service`
   - name: `clinprecision-site-service`

**4. Update `bootstrap.properties`:**
   ```properties
   spring.application.name=site-ws
   spring.cloud.config.name=site-ws
   ```

**5. Rename config file:**
   - From: `application-admin-ws.properties`
   - To: `application-site-ws.properties`
   - Update: `spring.application.name=site-ws`

### D. Update API Gateway

Add to `GatewayRoutesConfig.java`:

```java
// Organization Service Routes
.route("organization-ws-api", r -> r
    .path("/organization-ws/api/**")
    .and().method("GET", "POST", "PUT", "DELETE", "PATCH")
    .and().header("Authorization", "Bearer (.*)")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/organization-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
        .filter(authFilter)
    )
    .uri("lb://organization-ws")
)

// Change all admin-ws routes to site-ws
// Replace: .uri("lb://admin-ws")
// With: .uri("lb://site-ws")
```

### E. Create Frontend Service

**File:** `frontend/clinprecision/src/services/OrganizationService.js`

```javascript
import ApiService from './ApiService';

export const OrganizationService = {
  getAllOrganizations: async () => {
    const response = await ApiService.get('/organization-ws/api/organizations');
    return response.data;
  },

  getOrganizationById: async (id) => {
    const response = await ApiService.get(`/organization-ws/api/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (organizationData) => {
    const response = await ApiService.post('/organization-ws/api/organizations', organizationData);
    return response.data;
  },

  updateOrganization: async (id, organizationData) => {
    const response = await ApiService.put(`/organization-ws/api/organizations/${id}`, organizationData);
    return response.data;
  },

  deleteOrganization: async (id) => {
    const response = await ApiService.delete(`/organization-ws/api/organizations/${id}`);
    return response.data;
  },

  getOrganizationContacts: async (organizationId) => {
    const response = await ApiService.get(`/organization-ws/api/organizations/${organizationId}/contacts`);
    return response.data;
  }
};

export default OrganizationService;
```

### F. Update SiteService.js

Change all `/admin-ws/` to `/site-ws/`:
```javascript
// Before: '/admin-ws/api/sites'
// After:  '/site-ws/api/sites'
```

---

## 🚀 Testing Commands

```powershell
# 1. Build organization-ws (Already done ✅)
cd c:\nnsproject\clinprecision\backend\clinprecision-organization-service
mvn clean install -DskipTests

# 2. Build site-ws (after renaming)
cd c:\nnsproject\clinprecision\backend\clinprecision-site-service
mvn clean install -DskipTests

# 3. Build API Gateway
cd c:\nnsproject\clinprecision\backend\clinprecision-apigateway-service
mvn clean install -DskipTests

# 4. Start services (in order):
# - Config Service (8012)
# - Discovery Service (8010)
# - organization-ws (8087)
# - site-ws (8084)
# - users-ws (8083)
# - API Gateway (8082)
```

---

## ✅ Service Ports

| Service | Port |
|---------|------|
| config-service | 8012 |
| discovery-service | 8010 |
| api-gateway | 8082 |
| users-ws | 8083 |
| site-ws | 8084 |
| organization-ws | 8087 |
| study-design-ws | 8085 |

---

## 📋 Testing Checklist

### organization-ws
- [ ] Service starts on port 8087
- [ ] Registers with Eureka
- [ ] GET `/organization-ws/api/organizations` works
- [ ] POST `/organization-ws/api/organizations` works
- [ ] PUT `/organization-ws/api/organizations/{id}` works
- [ ] DELETE `/organization-ws/api/organizations/{id}` works
- [ ] Organization contacts CRUD works

### site-ws
- [ ] Service starts on port 8084 (same as before)
- [ ] Registers with Eureka as `site-ws`
- [ ] GET `/site-ws/api/sites` works
- [ ] Site-study associations work
- [ ] Axon projections still work

### Frontend
- [ ] OrganizationService calls work
- [ ] SiteService (updated paths) works
- [ ] All dropdowns load correctly
- [ ] Create/Edit forms work

---

## 🔥 Current Status

✅ **organization-ws created and built**  
✅ **admin-ws renamed to site-ws** (all packages, files, configs updated)  
✅ **API Gateway routes updated** (admin-ws → site-ws, rebuilt successfully)  
✅ **Frontend services updated** (SiteService.js, OrganizationService.js)  
✅ **site-ws rebuilt successfully**

## 🎉 Phase 2 & 3 Complete!

**Next Steps:**
1. ⏳ Delete organization-related files from site-ws
2. ⏳ Test organization-ws startup
3. ⏳ Test site-ws startup
4. ⏳ Test end-to-end functionality
