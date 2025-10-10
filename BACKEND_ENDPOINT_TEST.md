# Quick Backend Endpoint Test

## Test if endpoint is registered and working

### Option 1: Use curl (PowerShell)
```powershell
# Test the endpoint directly
curl http://localhost:8083/api/protocol-versions/study/11
```

### Option 2: Use Invoke-WebRequest (PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:8083/api/protocol-versions/study/11" -Method GET
```

### Option 3: Use browser
Open in browser:
```
http://localhost:8083/api/protocol-versions/study/11
```

## Expected Responses

### If backend has new code and study has UUID:
```json
[]
```
or
```json
[
  {
    "id": 1,
    "aggregateUuid": "...",
    "versionNumber": "1.0",
    ...
  }
]
```

### If backend has old code (not restarted):
```
404 Not Found
```

### If study doesn't have UUID:
```
404 Not Found
```
(Backend returns 404 when study has no UUID)

## Check Spring Boot Actuator (if enabled)

```powershell
# List all registered endpoints
curl http://localhost:8083/actuator/mappings
```

Look for: `/api/protocol-versions/study/{studyId}`

