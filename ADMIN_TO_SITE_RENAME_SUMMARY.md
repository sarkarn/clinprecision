# Admin-WS to Site-WS Rename - Summary

**Date:** October 3, 2025  
**Branch:** SITE_MGMT_REFACTORING_BACKEND

## ✅ Changes Completed

### 1. Backend Service Rename

#### Directory Structure
```
✅ clinprecision-admin-service/ → clinprecision-site-service/
```

#### Package Structure
```
✅ com.clinprecision.adminservice → com.clinprecision.siteservice
   - src/main/java/com/clinprecision/siteservice/
   - src/test/java/com/clinprecision/siteservice/
```

#### Main Application Class
```
✅ AdminApplication.java → SiteApplication.java
   - Package: com.clinprecision.siteservice
   - Updated @ComponentScan annotations
   - Updated @EntityScan annotations
   - Updated @EnableJpaRepositories annotations
```

#### Maven Configuration (pom.xml)
```xml
✅ Updated:
   <groupId>com.clinprecision.siteservice</groupId>
   <artifactId>siteservice</artifactId>
   <name>siteservice</name>
   <description>Site microservice</description>
```

#### Spring Configuration
```properties
✅ application.properties:
   spring.application.name=site-ws
   spring.cloud.config.name=site-ws

✅ Config Server:
   application-admin-ws.properties → application-site-ws.properties
```

#### Build Status
```
✅ mvn clean install -DskipTests
   [INFO] Building siteservice 0.0.1-SNAPSHOT
   [INFO] Compiling 45 source files
   [INFO] BUILD SUCCESS
```

---

### 2. API Gateway Updates

#### Route Configuration (GatewayRoutesConfig.java)
```
✅ Updated all route IDs:
   - admin-ws-sites-get → site-ws-sites-get
   - admin-ws-sites-write → site-ws-sites-write
   - admin-ws-api → site-ws-api
   - admin-ws-get → site-ws-get
   - admin-ws-write → site-ws-write

✅ Updated all path patterns:
   - /admin-ws/** → /site-ws/**

✅ Updated all service URIs:
   - lb://admin-ws → lb://site-ws

✅ Build Status:
   [INFO] Building ApiGateway 0.0.1-SNAPSHOT
   [INFO] BUILD SUCCESS
```

---

### 3. Frontend Service Updates

#### SiteService.js
```javascript
✅ Updated all endpoints (16 occurrences):
   - /admin-ws/sites → /site-ws/sites
   - /admin-ws/api/sites → /site-ws/api/sites

✅ Affected methods:
   - getAllSites()
   - getSiteById()
   - getSitesByOrganization()
   - createSite()
   - updateSite()
   - activateSite()
   - assignUserToSite()
   - associateSiteWithStudy()
   - activateSiteForStudy()
   - getStudiesBySite()
   - getStudySiteAssociation()
   - getSitesByStudy()
   - updateStudySiteAssociation()
   - deleteStudySiteAssociation()
```

#### OrganizationService.js
```javascript
✅ Updated all endpoints:
   - /admin-ws/organizations → /organization-ws/organizations

Note: This service now points to the new organization-ws microservice
```

#### StudyFormService.js
```javascript
✅ Updated form templates path:
   - /admin-ws/api/form-templates → /site-ws/api/form-templates
```

---

### 4. Java Source Files Updated

#### Automated Updates
```
✅ 45 Java source files updated:
   - Package declarations: com.clinprecision.adminservice → com.clinprecision.siteservice
   - Import statements: com.clinprecision.adminservice → com.clinprecision.siteservice

✅ Verification:
   - 0 remaining references to "com.clinprecision.adminservice" in src/
```

---

## 📋 Files Modified

### Backend
```
✅ backend/clinprecision-site-service/pom.xml
✅ backend/clinprecision-site-service/src/main/resources/application.properties
✅ backend/clinprecision-site-service/src/main/java/com/clinprecision/siteservice/SiteApplication.java
✅ backend/clinprecision-site-service/src/main/java/com/clinprecision/siteservice/**/*.java (45 files)
✅ backend/clinprecision-config-service/src/main/resources/config/application-site-ws.properties
✅ backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/GatewayRoutesConfig.java
```

### Frontend
```
✅ frontend/clinprecision/src/services/SiteService.js
✅ frontend/clinprecision/src/services/OrganizationService.js
✅ frontend/clinprecision/src/services/StudyFormService.js
```

---

## 🔍 Service Configuration

### Eureka Service Discovery
```
Service Name: site-ws (previously admin-ws)
Port: 8084 (unchanged)
Eureka URL: http://localhost:8010
```

### Config Server
```
Config File: application-site-ws.properties
Config Server URL: http://localhost:8012/config
```

### API Gateway Routes
```
Base Path: /site-ws/**
Gateway Port: 8082
Load Balancer: lb://site-ws
```

---

## ⏳ Next Steps

### 1. Remove Organization Code from site-ws
The following organization-related files should be deleted from site-ws:
```
❌ To Delete:
   - src/main/java/com/clinprecision/siteservice/ui/controller/OrganizationController.java
   - src/main/java/com/clinprecision/siteservice/service/OrganizationService.java
   - src/main/java/com/clinprecision/siteservice/service/impl/OrganizationServiceImpl.java
   - src/main/java/com/clinprecision/siteservice/repository/OrganizationRepository.java
   - src/main/java/com/clinprecision/siteservice/repository/OrganizationContactRepository.java
```

### 2. Add Feign Client in site-ws
Create a Feign client to communicate with organization-ws:
```java
@FeignClient(name = "organization-ws")
public interface OrganizationServiceClient {
    @GetMapping("/api/organizations/{id}")
    OrganizationDto getOrganizationById(@PathVariable Long id);
}
```

### 3. Update Component Scanning in site-ws
Update SiteApplication.java to exclude non-site mappers:
```java
@ComponentScan(
    basePackages = {"com.clinprecision.siteservice", "com.clinprecision.common", "com.clinprecision.axon"},
    excludeFilters = {@ComponentScan.Filter(type = FilterType.REGEX, 
        pattern = "com.clinprecision.common.mapper.(Organization|User|UserType|UserStudyRole).*")}
)
```

### 4. Test Services
```
1. Start config-service (8012)
2. Start discovery-service (8010)
3. Start organization-ws (8087)
4. Start site-ws (8084)
5. Start users-ws (8083)
6. Start api-gateway (8082)

Verify Eureka Dashboard:
http://localhost:8010

Test Endpoints:
- GET http://localhost:8082/site-ws/sites
- GET http://localhost:8082/organization-ws/api/organizations
```

---

## 📊 Impact Summary

### Breaking Changes
```
⚠️ Service name change: admin-ws → site-ws
⚠️ All API endpoints: /admin-ws/** → /site-ws/**
⚠️ Organization endpoints: /admin-ws/organizations → /organization-ws/api/organizations
```

### Backward Compatibility
```
❌ Old endpoints (/admin-ws/**) will no longer work
✅ All frontend services updated to use new endpoints
✅ API Gateway configured for new routes
✅ Eureka service discovery updated
```

### Database Changes
```
✅ No database schema changes required
✅ All entities remain in clinprecisiondb
✅ Organization entities still accessible from common-lib
```

---

## ✅ Success Metrics

1. ✅ **site-ws builds successfully** (45 files compiled, no errors)
2. ✅ **API Gateway builds successfully** (all routes updated)
3. ✅ **Frontend services updated** (all endpoints point to correct services)
4. ✅ **Configuration files updated** (Spring config, Maven POM)
5. ✅ **Package structure renamed** (all Java files updated)
6. ✅ **Service discovery ready** (Eureka configuration updated)

---

## 🎯 Service Boundaries After Rename

| Service | Port | Responsibilities |
|---------|------|------------------|
| **site-ws** | 8084 | Site CRUD, Site-Study associations, Site activation, User-Site assignments |
| **organization-ws** | 8087 | Organization CRUD, Organization hierarchy, Organization contacts |
| **users-ws** | 8083 | User management, Roles, User types, User-study-roles |
| **study-design-ws** | 8085 | Study design, Arms, Visits, Versions |

---

## 📝 Notes

- **Axon Framework**: Still enabled in site-ws for event sourcing of site management
- **No Axon in organization-ws**: Simple CRUD service, no event sourcing needed
- **Service communication**: site-ws will use Feign client to call organization-ws
- **Frontend routing**: All site management features use /site-ws/** paths
- **Organization management**: Dedicated organization-ws service handles all organization operations

---

**Status:** ✅ Phase 2 & 3 Complete - Ready for Testing
