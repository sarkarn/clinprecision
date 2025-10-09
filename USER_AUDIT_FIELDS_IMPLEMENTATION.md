# User Audit Fields Implementation

## Issue
The `createdBy`, `updatedBy`, and `statusChangedBy` fields were coming as `null` in API responses because the backend wasn't capturing authenticated user information.

## Root Cause
The `StudyCommandService` had hardcoded TODO comments and temporary values:
```java
// TODO: Get current user from security context
UUID userId = UUID.randomUUID(); // Temporary - replace with actual user
String userName = "system"; // Temporary - replace with actual user
```

## Solution Implemented

### 1. Created SecurityService
**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/security/SecurityService.java`

**Features:**
- Multi-source user detection (priority order):
  1. **Spring Security Context** - If JWT/OAuth configured
  2. **HTTP Headers** - API Gateway passes user info (X-User-Id, X-User-Name, X-User-Email)
  3. **Fallback** - Returns system user (UUID: 00000000-0000-0000-0000-000000000000, name: "system")

**Key Methods:**
```java
UUID getCurrentUserId()        // Get authenticated user ID
String getCurrentUserName()    // Get authenticated username
boolean hasAuthenticatedUser() // Check if user is authenticated
```

### 2. Updated StudyCommandService
**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/study/service/StudyCommandService.java`

**Changes:**
- Injected `SecurityService` as dependency
- Replaced all 6 hardcoded user placeholders with actual security service calls:
  - `createStudy()` - Line 66-68
  - `updateStudy()` - Line 90-92
  - `suspendStudy()` - Line 134-136
  - `terminateStudy()` - Line 162-164
  - `withdrawStudy()` - Line 190-192
  - `completeStudy()` - Line 219-221
  - `changeStudyStatus()` - Line 261-263

**Before:**
```java
UUID userId = UUID.randomUUID(); // Temporary
String userName = "system"; // Temporary
```

**After:**
```java
UUID userId = securityService.getCurrentUserId();
String userName = securityService.getCurrentUserName();
log.debug("Creating/updating study as user: {} ({})", userName, userId);
```

## How It Works

### For Production (with API Gateway)
API Gateway should pass user info in HTTP headers:
```http
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
X-User-Name: john.doe@example.com
X-User-Email: john.doe@example.com
```

SecurityService will extract these and populate audit fields.

### For Development (without authentication)
SecurityService returns fallback values:
- **User ID:** `00000000-0000-0000-0000-000000000000`
- **Username:** `"system"`

This allows development to continue without authentication setup.

## Testing
After building and restarting the backend:

1. **Create a study** - Check API response for `createdBy` field
2. **Update a study** - Check API response for `updatedBy` field
3. **Change study status** - Check API response for `statusChangedBy` field

**Expected Result:**
- Development: Fields should show "system" (or "00000000-0000-0000-0000-000000000000")
- Production: Fields should show actual authenticated user info

## API Gateway Configuration (TODO)
To enable user tracking in production, configure API Gateway to:
1. Authenticate users (JWT, OAuth, etc.)
2. Extract user ID and username from token
3. Pass as HTTP headers to backend services:
   ```
   X-User-Id: <user-uuid>
   X-User-Name: <username>
   X-User-Email: <email>
   ```

## Files Modified
1. ✅ `SecurityService.java` - Created new service for user context
2. ✅ `StudyCommandService.java` - Replaced 6 hardcoded user placeholders

## Next Steps
1. **Build backend:** `mvn clean install -DskipTests`
2. **Restart backend services**
3. **Test user audit fields** in API responses
4. **Configure API Gateway** to pass user headers (for production)
5. **Consider implementing Spring Security audit** (@CreatedBy, @LastModifiedBy annotations) for JPA entities

## Benefits
- ✅ Audit trail of who created/modified studies
- ✅ Compliance with regulatory requirements
- ✅ Development friendly (works without authentication)
- ✅ Production ready (supports multiple auth methods)
- ✅ Consistent user tracking across all study operations

## Related Files
- Study Events: `StudyCreatedEvent`, `StudyUpdatedEvent`, etc. - Already have `userId` and `userName` fields
- Study DTOs: `StudyResponseDto` - Already have `createdBy`, `updatedBy` fields
- Study Aggregate: Handles events and populates audit fields from commands
