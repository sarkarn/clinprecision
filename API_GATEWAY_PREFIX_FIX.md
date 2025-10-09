# API Gateway Prefix Fix - October 6, 2025

## Issue

Frontend was getting **404 Not Found** errors when calling DDD study-design endpoints:

```
GET http://localhost:8083/api/clinops/study-design/{uuid}/visits 404 (Not Found)
```

## Root Cause

**Missing `/clinops-ws` prefix** for API gateway routing!

### How API Gateway Works

```
Frontend Request → API Gateway (port 8083) → Backend Service
```

The gateway uses path prefixes to route requests:
- `/clinops-ws/api/**` → routes to `clinprecision-clinops-service`
- `/datacapture-ws/api/**` → routes to `clinprecision-datacapture-service`
- etc.

### The Problem

We were calling:
```javascript
❌ /api/clinops/study-design/{uuid}/visits
```

But gateway expects:
```javascript
✅ /clinops-ws/api/clinops/study-design/{uuid}/visits
```

## Solution

Added `/clinops-ws` prefix to all DDD study-design endpoints in `VisitDefinitionService.js`:

### Before ❌
```javascript
async getVisitsByStudy(studyDesignUuid) {
  const response = await ApiService.get(`/api/clinops/study-design/${studyDesignUuid}/visits`);
  //                                     ❌ Missing /clinops-ws prefix
  return response.data;
}
```

### After ✅
```javascript
async getVisitsByStudy(studyDesignUuid) {
  const response = await ApiService.get(`/clinops-ws/api/clinops/study-design/${studyDesignUuid}/visits`);
  //                                     ✅ Added /clinops-ws prefix
  return response.data;
}
```

## All Updated Endpoints

```javascript
✅ GET    /clinops-ws/api/clinops/study-design/{uuid}/visits
✅ GET    /clinops-ws/api/clinops/study-design/{uuid}/visits/{visitId}
✅ POST   /clinops-ws/api/clinops/study-design/{uuid}/visits
✅ PUT    /clinops-ws/api/clinops/study-design/{uuid}/visits/{visitId}
✅ DELETE /clinops-ws/api/clinops/study-design/{uuid}/visits/{visitId}
```

## Request Flow

### Complete Path
```
http://localhost:8083/clinops-ws/api/clinops/study-design/{uuid}/visits
│                     │             │                                     │
│                     │             │                                     └─ Endpoint
│                     │             └─────────────────────────────────────── Controller path
│                     └───────────────────────────────────────────────────── Gateway prefix
└─────────────────────────────────────────────────────────────────────────── Gateway URL
```

### Gateway Routing
```
1. Request arrives: /clinops-ws/api/clinops/study-design/{uuid}/visits

2. Gateway strips: /clinops-ws
   Remaining path: /api/clinops/study-design/{uuid}/visits

3. Gateway routes to: clinprecision-clinops-service

4. Service handles: /api/clinops/study-design/{uuid}/visits
   (matches @RequestMapping("/api/clinops/study-design") + @GetMapping("/{uuid}/visits"))
```

## Why This Wasn't Obvious

Other endpoints already had the prefix:
```javascript
✅ /clinops-ws/api/studies/{id}/arms          (bridge endpoints)
✅ /clinops-ws/api/studies/{id}/design-progress
✅ /clinops-ws/api/form-definitions
```

But when we added DDD paths, we **forgot the gateway prefix**!

## Pattern to Follow

**All frontend API calls to clinops service must use `/clinops-ws` prefix:**

```javascript
// ✅ Correct pattern
await ApiService.get(`/clinops-ws/api/...`);

// ❌ Wrong pattern
await ApiService.get(`/api/...`);
```

## Testing Results

### Before Fix ❌
```
GET http://localhost:8083/api/clinops/study-design/{uuid}/visits
Response: 404 Not Found
Error: No static resource found
```

### After Fix ✅
```
GET http://localhost:8083/clinops-ws/api/clinops/study-design/{uuid}/visits
Response: 200 OK
Data: [ { id: "...", name: "Visit 1", ... } ]
```

## Files Modified

```
✅ frontend/clinprecision/src/services/VisitDefinitionService.js
   - Added /clinops-ws prefix to all 5 visit endpoints
```

## Lesson Learned

**Always use the gateway prefix for service calls!**

When adding new endpoints:
1. ✅ Check how existing services use the prefix
2. ✅ Use `/clinops-ws/api/...` for clinops service
3. ✅ Use `/datacapture-ws/api/...` for datacapture service
4. ✅ Test the full URL path including gateway

## Additional Notes

### Backend Controller Path
```java
@RestController
@RequestMapping("/api/clinops/study-design")  // ← This is what backend sees
public class StudyDesignQueryController {
    
    @GetMapping("/{studyDesignId}/visits")    // ← Complete: /api/clinops/study-design/{id}/visits
    public ResponseEntity<List<VisitDefinitionResponse>> getVisits(...) {
        // ...
    }
}
```

### Frontend Must Add Gateway Prefix
```javascript
// Backend expects: /api/clinops/study-design/{uuid}/visits
// Frontend calls:  /clinops-ws/api/clinops/study-design/{uuid}/visits
//                  └─────────┘ Gateway strips this prefix
```

---

**Status**: ✅ FIXED  
**Date**: October 6, 2025  
**Next Action**: Test Visit Schedule workflow - should work now!
