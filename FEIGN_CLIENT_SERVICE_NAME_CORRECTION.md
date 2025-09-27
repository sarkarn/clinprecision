# Feign Client Service Name Correction

## Issue Fixed
**Problem**: Study Design Service was unable to connect to Admin Service through Feign client due to service name mismatch.

**Error**: `Load balancer does not contain an instance for the service admin-service`

## Root Cause
The `CodeListClient` in Study Design Service was configured with incorrect service name:
- **Used**: `admin-service` 
- **Actual**: `admin-ws` (as registered in service discovery)

## Solution Applied
Updated `CodeListClient.java` in Study Design Service:

```java
// Before (INCORRECT)
@FeignClient(
    name = "admin-service",  // ❌ Wrong service name
    path = "/api/v1/admin/codelists",
    fallback = CodeListClientFallback.class
)

// After (CORRECTED) 
@FeignClient(
    name = "admin-ws",  // ✅ Correct service name
    path = "/api/v1/admin/codelists", 
    fallback = CodeListClientFallback.class
)
```

## Service Registry Names
For reference, all microservices are registered with consistent naming pattern:

| Service | Registry Name | Purpose |
|---------|--------------|---------|
| Admin Service | `admin-ws` | User management, code lists, system administration |
| User Service | `users-ws` | Authentication and user operations |
| Study Design Service | `study-design-ws` | Study configuration and design management |
| Data Capture Service | `data-capture-ws` | Clinical data collection |
| API Gateway | `api-gateway-ws` | External API routing and security |

## Verification
- ✅ Study Design Service compiles successfully
- ✅ Feign client now uses correct service name
- ✅ Service discovery will properly route requests to admin-ws
- ✅ Fallback mechanisms remain intact

## Impact
This fix resolves the 503 Service Unavailable errors when Study Design Service attempts to:
- Fetch regulatory statuses for dropdown populations
- Access code lists for study configuration
- Retrieve reference data from Admin Service

The correction ensures proper microservice communication through the Spring Cloud service registry.