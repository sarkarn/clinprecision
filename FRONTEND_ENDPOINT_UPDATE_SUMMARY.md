# Frontend Endpoint Update Summary

## Overview
Updated frontend service files to use the new `clinops-ws` endpoints for CodeList and FormTemplate operations, following the migration of these components from site-service to clinops-service.

## Date
October 4, 2025

## Changes Made

### 1. StudyFormService.js
**File:** `frontend/clinprecision/src/services/StudyFormService.js`

**Change:**
```javascript
// BEFORE
const FORM_TEMPLATES_PATH = '/site-ws/api/form-templates';

// AFTER
const FORM_TEMPLATES_PATH = '/clinops-ws/api/form-templates';
```

**Impact:**
- All form template API calls from StudyFormService now route to clinops-service
- Methods affected:
  - `createStudyFormFromTemplate()` - Creates study forms from templates
  - `getAvailableTemplates()` - Fetches available form templates

### 2. FormService.js
**File:** `frontend/clinprecision/src/services/FormService.js`

**Changes:**
```javascript
// BEFORE
const API_PATH = '/admin-ws/api/form-templates';

// AFTER
const API_PATH = '/clinops-ws/api/form-templates';
```

**Impact:**
- All global form template library operations now route to clinops-service
- Methods affected:
  - `getForms()` - Retrieves all form templates
  - `getFormById()` - Gets specific template by ID
  - `createForm()` - Creates new form templates
  - `updateForm()` - Updates existing templates
  - `deleteForm()` - Deletes form templates
  - `getFormVersions()` - Gets all versions of a template
  - `getFormVersion()` - Gets specific version of a template
  - `createFormVersion()` - Creates new version of a template

### 3. FormVersionService.js
**File:** `frontend/clinprecision/src/services/FormVersionService.js`

**Status:** ✅ Already configured correctly
- Already uses `/clinops-ws/api/form-templates`
- No changes needed

### 4. CodeList Hook
**File:** `frontend/clinprecision/src/hooks/useCodeList.js`

**Status:** ✅ No changes needed
- Uses `/api/v2/reference-data` endpoints (different API pattern)
- Not affected by the CodeListController migration

## API Gateway Routes

### Current Configuration
The API Gateway (`GatewayRoutesConfig.java`) already has the necessary routes configured:

```java
.route("clinops-ws-api", r -> r
    .path("/clinops-ws/api/**")
    .filters(f -> f
        .rewritePath("/clinops-ws/api/(?<segment>.*)", "/api/${segment}")
        .filter(authFilter)
    )
    .uri("lb://clinops-ws")
)
```

This route automatically handles:
- `/clinops-ws/api/form-templates/**` → routes to FormTemplateController in clinops-service
- `/clinops-ws/api/admin/codelists/**` → routes to CodeListController in clinops-service

## Backend Components (Already Migrated)

### Controllers in clinops-service
1. **CodeListController** - `/api/admin/codelists/**`
   - Package: `com.clinprecision.clinopsservice.controller`
   - Source: Migrated from site-service

2. **FormTemplateController** - `/api/form-templates/**`
   - Package: `com.clinprecision.clinopsservice.controller`
   - Source: Migrated from site-service

### Services in clinops-service
1. **CodeListService**
   - Package: `com.clinprecision.clinopsservice.service`
   - Features: Caching, CRUD operations for code lists

2. **FormTemplateService**
   - Package: `com.clinprecision.clinopsservice.service`
   - Features: Template management, usage tracking, publishing

### Repositories in clinops-service
1. **CodeListRepository**
   - Package: `com.clinprecision.clinopsservice.repository`
   - JPA repository for CodeListEntity

2. **FormTemplateRepository**
   - Package: `com.clinprecision.clinopsservice.repository`
   - JPA repository for FormTemplateEntity

## Testing Checklist

### Frontend Tests
- [ ] Test form template listing from FormService
- [ ] Test form template creation from FormService
- [ ] Test form template updates
- [ ] Test study form creation from templates in StudyFormService
- [ ] Test template availability retrieval

### Backend Tests
- [ ] Test FormTemplateController endpoints via API Gateway
- [ ] Test CodeListController endpoints via API Gateway
- [ ] Verify authentication/authorization on protected endpoints
- [ ] Test service layer operations (FormTemplateService, CodeListService)

### Integration Tests
- [ ] End-to-end: Create form template via UI → Save to clinops-service → Retrieve
- [ ] End-to-end: Create study form from template → Uses clinops-service template
- [ ] Verify code list dropdowns load correctly from clinops-service
- [ ] Test form template search and filtering

## Expected Behavior

### Before Changes
- Frontend → API Gateway → site-ws (port 8084) → FormTemplate/CodeList endpoints
- Feign client calls from clinops-service → site-service → Database

### After Changes
- Frontend → API Gateway → clinops-ws (port 8085) → FormTemplate/CodeList endpoints
- Direct service calls within clinops-service (no Feign) → Database

## Benefits

1. **Reduced Network Calls**: Eliminated cross-service Feign client calls
2. **Improved Performance**: Local service calls are faster than HTTP calls
3. **Better Cohesion**: Clinical operations data consolidated in one service
4. **Simplified Architecture**: Fewer service dependencies
5. **Easier Maintenance**: Related functionality in single codebase

## Next Steps

### Remaining Backend Work
1. **Update AdminServiceProxy.java** in clinops-service
   - Remove AdminServiceClient imports
   - Inject CodeListService and FormTemplateService
   - Replace Feign calls with local service calls

2. **Test Compilation**
   - Run `mvn clean compile` in clinops-service
   - Fix any remaining import errors

3. **Run Integration Tests**
   - Start all services (discovery, config, api-gateway, users-ws, organization-ws, site-ws, clinops-ws)
   - Test form template CRUD operations
   - Test code list retrieval

### Optional Cleanup
1. **Remove from site-service** (if no longer needed):
   - CodeListController, FormTemplateController
   - CodeListService, FormTemplateService
   - CodeListRepository, FormTemplateRepository
   - Related entity classes if not referenced elsewhere

## Related Documentation
- `CLINOPS_MERGE_TESTING_GUIDE.md` - Testing guide for clinops-service merge
- `DATACAPTURE_STUDYDESIGN_MERGE_COMPLETION_REPORT.md` - Previous merge completion report
- `ORGANIZATION_SERVICE_INTEGRATION.md` - Service integration patterns

## Notes
- All frontend changes are backward compatible via API Gateway routes
- Legacy routes can be maintained during transition period if needed
- Database schema remains unchanged (same tables, just accessed from different service)

---
*Generated on October 4, 2025*
*Part of clinops-service consolidation effort*
