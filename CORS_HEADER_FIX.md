# CORS Header Fix - X-Error-Message

**Date:** October 8, 2025
**Issue:** Custom error header `X-Error-Message` not accessible in frontend
**Type:** CORS Configuration
**Status:** ✅ FIXED

## Problem

### Symptoms

Frontend error handling code was unable to read the `X-Error-Message` header from backend error responses:

```javascript
// This was returning undefined
if (error.response?.headers?.['x-error-message']) {
    errorMessage = error.response.headers['x-error-message'];
}
```

**Console Errors:**
```
:8083/api/studies/11/status:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
StudyDesignService.js:189 Error changing study status: AxiosError
StudyDesignDashboard.jsx:796 Error submitting study for review: Error: Request failed with status code 400
```

### Root Cause

**CORS (Cross-Origin Resource Sharing) Security:**

By default, browsers only expose a limited set of response headers to JavaScript for security reasons. Custom headers like `X-Error-Message` are blocked unless explicitly listed in the CORS `exposedHeaders` configuration.

**Default Exposed Headers:**
- `Cache-Control`
- `Content-Language`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

**Our Custom Headers (Before Fix):**
- ✅ `Authorization` - Exposed
- ✅ `token` - Exposed
- ✅ `userId` - Exposed
- ❌ `X-Error-Message` - **NOT exposed** (causing the issue)

## Solution

### API Gateway CORS Configuration

**File:** `backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/CorsConfig.java`

**Added Exposed Header:**

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Set a single origin - no wildcards when using allowCredentials
        config.addAllowedOrigin("http://localhost:3000");
        
        // Allow all methods and headers
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Expose authentication headers to the frontend
        config.addExposedHeader("Authorization");
        config.addExposedHeader("token");
        config.addExposedHeader("userId");
        
        // ✅ NEW: Expose custom error message header for user-friendly error handling
        config.addExposedHeader("X-Error-Message");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
```

**Change Made:**
```java
// Added this line to expose the custom error header
config.addExposedHeader("X-Error-Message");
```

## Testing

### Before Fix

**Frontend Console:**
```javascript
console.log('Response headers:', error.response?.headers);
// Output: { 'content-type': 'application/json', ... }
// X-Error-Message is missing!

console.log('X-Error-Message:', error.response?.headers?.['x-error-message']);
// Output: undefined
```

**User sees:**
```
Error: Request failed with status code 400
```

### After Fix

**Frontend Console:**
```javascript
console.log('Response headers:', error.response?.headers);
// Output: { 
//   'content-type': 'application/json',
//   'x-error-message': 'Please create a protocol version before submitting the study for review.',
//   ...
// }

console.log('X-Error-Message:', error.response?.headers?.['x-error-message']);
// Output: "Please create a protocol version before submitting the study for review."
```

**User sees:**
```
Please create a protocol version before submitting the study for review.
```

## Complete Error Flow

### 1. Backend Creates Error Response

**File:** `StudyCommandController.java`

```java
catch (StudyStatusTransitionException ex) {
    String userFriendlyMessage = makeUserFriendly(ex.getMessage(), newStatus);
    
    return ResponseEntity
        .badRequest()
        .header("X-Error-Message", userFriendlyMessage) // ✅ Header set
        .build();
}
```

### 2. API Gateway Forwards Response

**File:** `CorsConfig.java`

```java
config.addExposedHeader("X-Error-Message"); // ✅ Header exposed to browser
```

**Without this configuration:**
- ❌ Browser receives the header
- ❌ But blocks JavaScript from reading it
- ❌ `error.response.headers['x-error-message']` returns `undefined`

**With this configuration:**
- ✅ Browser receives the header
- ✅ Browser allows JavaScript to read it
- ✅ `error.response.headers['x-error-message']` returns the user-friendly message

### 3. Frontend Reads Header

**File:** `StudyDesignService.js`

```javascript
// Priority 1: Check for user-friendly error in custom header
if (error.response?.headers?.['x-error-message']) {
    console.log('Found user-friendly message in header:', 
                error.response.headers['x-error-message']); // ✅ Now works!
    errorMessage = error.response.headers['x-error-message'];
}
```

### 4. User Sees Friendly Message

**File:** `StudyDesignDashboard.jsx`

```javascript
catch (e) {
    const displayMessage = e.message; // ✅ Contains user-friendly message
    setError(displayMessage); // ✅ Displays to user
}
```

## CORS Security Explained

### What is CORS?

**Cross-Origin Resource Sharing (CORS)** is a security feature that prevents malicious websites from accessing resources from other domains without permission.

**Example:**
- Your app runs on `http://localhost:3000` (frontend)
- API runs on `http://localhost:8083` (backend)
- These are **different origins** (different ports)
- Browser enforces CORS to prevent unauthorized access

### Why Expose Headers?

By default, browsers hide most response headers from JavaScript to prevent:
- Information leakage about backend infrastructure
- Exposure of sensitive authentication tokens
- Cross-site scripting (XSS) attacks

**Only safe headers are exposed by default:**
- `Content-Type`
- `Cache-Control`
- `Expires`
- `Last-Modified`
- etc.

**Custom headers must be explicitly whitelisted:**
```java
config.addExposedHeader("X-Error-Message");
```

This tells the browser: "It's safe to let JavaScript read this header."

## Debugging CORS Issues

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click the failed request
4. Look at **Response Headers**

**If header is in Response Headers but not accessible in JavaScript:**
```
✅ Response Headers:
   X-Error-Message: Please create a protocol version...
   
❌ JavaScript:
   error.response.headers['x-error-message'] → undefined
```

**This indicates a CORS `exposedHeaders` issue!**

### Check CORS Preflight

For some requests, browsers send a **preflight OPTIONS request** to check permissions:

```http
OPTIONS /api/studies/11/status HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Headers: content-type
```

**Server must respond with:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Headers: *
Access-Control-Expose-Headers: Authorization, token, userId, X-Error-Message
```

**Our configuration handles this automatically:**
```java
config.addAllowedHeader("*");           // Allow all request headers
config.addExposedHeader("X-Error-Message"); // Expose this response header
```

## Best Practices

### 1. Expose Only Necessary Headers

❌ **Bad:**
```java
config.addExposedHeader("*"); // Exposes ALL headers (security risk)
```

✅ **Good:**
```java
config.addExposedHeader("Authorization");
config.addExposedHeader("X-Error-Message");
// Only expose what you need
```

### 2. Use Standard Header Names

✅ **Good:**
- `X-Error-Message` (clear purpose)
- `X-Request-ID` (standard practice)
- `X-Rate-Limit` (common pattern)

❌ **Avoid:**
- `myCustomHeader` (unclear)
- `error` (too generic)
- `msg` (abbreviations unclear)

### 3. Document Exposed Headers

Maintain a list of all custom headers:

```java
// Expose authentication headers to the frontend
config.addExposedHeader("Authorization");  // JWT token
config.addExposedHeader("token");          // Legacy token
config.addExposedHeader("userId");         // User identification

// Expose custom error message header for user-friendly error handling
config.addExposedHeader("X-Error-Message"); // User-friendly error messages
```

### 4. Test CORS Configuration

**Manual Test:**
```javascript
// In browser console
fetch('http://localhost:8083/api/studies/11/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus: 'PROTOCOL_REVIEW' })
})
.then(res => {
    console.log('Headers:', res.headers.get('x-error-message'));
});
```

## Related Files

### Modified Files
1. **CorsConfig.java** - Added `X-Error-Message` to exposed headers

### Related Files (Context)
- **StudyCommandController.java** - Sets `X-Error-Message` header
- **StudyDesignService.js** - Reads `X-Error-Message` header
- **StudyDesignDashboard.jsx** - Displays error message to user

## Deployment Notes

### Local Development

1. **Restart API Gateway:**
   ```bash
   cd backend/clinprecision-apigateway-service
   mvn spring-boot:run
   ```

2. **Clear Browser Cache:**
   - CORS settings can be cached by browser
   - Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`
   - Or clear cache in DevTools

3. **Test Error Message:**
   - Click "Submit for Review" without protocol version
   - Should see: "Please create a protocol version..."

### Production Deployment

1. **Update API Gateway:**
   - Build: `mvn clean package`
   - Deploy new JAR file
   - Restart service

2. **Verify CORS Headers:**
   ```bash
   curl -i -X OPTIONS http://api.clinprecision.com/api/studies/11/status \
     -H "Origin: http://app.clinprecision.com" \
     -H "Access-Control-Request-Method: PATCH"
   ```

3. **Check Response:**
   ```http
   Access-Control-Expose-Headers: Authorization, token, userId, X-Error-Message
   ```

## Summary

### Problem
- ❌ Custom header `X-Error-Message` not accessible in frontend
- ❌ Browser blocked JavaScript from reading the header
- ❌ CORS security feature preventing access

### Solution
- ✅ Added `config.addExposedHeader("X-Error-Message")` to CORS config
- ✅ API Gateway now allows browser to expose header to JavaScript
- ✅ Frontend can read user-friendly error messages

### Impact
- ✅ User-friendly error messages now work end-to-end
- ✅ Users see actionable guidance instead of technical errors
- ✅ Better user experience during validation errors

---

**Status:** ✅ FIXED
**Author:** AI Assistant
**Type:** CORS Configuration
**Priority:** High (Blocks User-Friendly Error Messages)
