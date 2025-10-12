# Patient Status API Quick Reference 🚀

**Base URL:** `http://localhost:8080/api/v1/patients`

---

## 📝 Quick Endpoint List

### Write Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/patients/{id}/status` | Change patient status |

### Read Operations - Patient Specific
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/patients/{id}/status/history` | Complete status history |
| GET | `/patients/{id}/status/current` | Current status details |
| GET | `/patients/{id}/status/summary` | Status + analytics summary |
| GET | `/patients/{id}/status/count` | Total status changes |
| GET | `/patients/{id}/status/valid-transitions` | Available next statuses |

### Read Operations - Analytics & Queries
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/patients/status/transitions/summary` | Transition analytics |
| GET | `/patients/status/{status}/patients` | Find patients in status |
| GET | `/patients/status/{status}/stuck?days=14` | Stuck patients (bottleneck) |
| GET | `/patients/status/changes?startDate=...&endDate=...` | Changes by date range |
| GET | `/patients/status/changes/by-user?user=...` | Changes by user (audit) |

### Utility
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/patients/status/health` | Health check |

---

## 🎯 Common Use Cases

### Use Case 1: Change Patient Status
```bash
# Coordinator schedules screening visit
curl -X POST http://localhost:8080/api/v1/patients/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "SCREENING",
    "reason": "Screening visit scheduled for Oct 15",
    "changedBy": "coordinator@example.com",
    "notes": "Patient confirmed availability"
  }'
```

### Use Case 2: Display Patient Status History
```bash
# Get complete audit trail
curl http://localhost:8080/api/v1/patients/1/status/history
```

### Use Case 3: Patient Detail Page
```bash
# Get comprehensive status summary (current + history + analytics)
curl http://localhost:8080/api/v1/patients/1/status/summary
```

### Use Case 4: Dashboard Analytics
```bash
# Get transition funnel chart data
curl http://localhost:8080/api/v1/patients/status/transitions/summary
```

### Use Case 5: Quality Assurance Alert
```bash
# Find patients stuck in SCREENING > 14 days
curl "http://localhost:8080/api/v1/patients/status/SCREENING/stuck?days=14"
```

### Use Case 6: Status Change Form Validation
```bash
# Get valid next statuses for dropdown population
curl http://localhost:8080/api/v1/patients/1/status/valid-transitions
```

### Use Case 7: Compliance Report
```bash
# Get all status changes in Q3 2025
curl "http://localhost:8080/api/v1/patients/status/changes?startDate=2025-07-01T00:00:00&endDate=2025-09-30T23:59:59"
```

### Use Case 8: User Activity Audit
```bash
# Get all status changes by specific coordinator
curl "http://localhost:8080/api/v1/patients/status/changes/by-user?user=coordinator@example.com"
```

---

## 🎨 Status Values

| Status | Description | Terminal? |
|--------|-------------|-----------|
| `REGISTERED` | Initial registration | No |
| `SCREENING` | Undergoing screening | No |
| `ENROLLED` | Enrolled in study | No |
| `ACTIVE` | Active treatment | No |
| `COMPLETED` | Study completed | Yes |
| `WITHDRAWN` | Withdrawn from study | Yes |

---

## ✅ Valid Transitions

```
REGISTERED ──→ SCREENING ──→ ENROLLED ──→ ACTIVE ──→ COMPLETED
    ↓             ↓            ↓           ↓
    └─────────────┴────────────┴───────────┴─────→ WITHDRAWN
```

| From Status | To Status |
|------------|-----------|
| REGISTERED | SCREENING, WITHDRAWN |
| SCREENING | ENROLLED, WITHDRAWN |
| ENROLLED | ACTIVE, WITHDRAWN |
| ACTIVE | COMPLETED, WITHDRAWN |
| COMPLETED | *(none - terminal)* |
| WITHDRAWN | *(none - terminal)* |

---

## ❌ Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_STATUS_TRANSITION` | 400 | Invalid transition (e.g., REGISTERED → ENROLLED) |
| `TERMINAL_STATUS_IMMUTABLE` | 400 | Cannot change terminal status |
| `REQUIRED_FIELD_MISSING` | 400 | Missing required field |
| `INVALID_STATUS_VALUE` | 400 | Invalid status enum value |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `PATIENT_NOT_FOUND` | 404 | Patient ID does not exist |
| `COMMAND_PROCESSING_ERROR` | 500 | Event processing failure |
| `STATUS_CHANGE_FAILED` | 500 | Service layer error |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |

---

## 📦 Sample Responses

### Change Status Response (201 CREATED)
```json
{
  "id": 456,
  "patientId": 789,
  "patientName": "John Doe",
  "patientNumber": "P-2025-001",
  "previousStatus": "REGISTERED",
  "newStatus": "SCREENING",
  "reason": "Screening visit scheduled for Oct 15",
  "changedBy": "coordinator@example.com",
  "changedAt": "2025-10-12T10:30:00",
  "notes": "Patient confirmed availability",
  "daysSincePreviousChange": 5,
  "statusChangeDescription": "Registered → Screening: Screening visit scheduled for Oct 15",
  "terminalStatus": false,
  "currentStatus": true
}
```

### Status History Response (200 OK)
```json
[
  {
    "id": 456,
    "patientId": 789,
    "newStatus": "ACTIVE",
    "previousStatus": "ENROLLED",
    "reason": "First treatment completed",
    "changedBy": "dr.smith@example.com",
    "changedAt": "2025-10-12T10:30:00",
    "currentStatus": true
  },
  {
    "id": 455,
    "patientId": 789,
    "newStatus": "ENROLLED",
    "previousStatus": "SCREENING",
    "reason": "Passed eligibility criteria",
    "changedBy": "coordinator@example.com",
    "changedAt": "2025-10-05T14:20:00",
    "currentStatus": false
  }
]
```

### Transition Summary Response (200 OK)
```json
[
  {
    "previousStatus": "SCREENING",
    "newStatus": "ENROLLED",
    "transitionCount": 38,
    "uniquePatientCount": 38,
    "transitionLabel": "SCREENING → ENROLLED",
    "conversionRate": 73.08
  }
]
```

### Valid Transitions Response (200 OK)
```json
["SCREENING", "WITHDRAWN"]
```

### Error Response (400 BAD REQUEST)
```json
{
  "code": "INVALID_STATUS_TRANSITION",
  "message": "Invalid status transition: REGISTERED → ENROLLED. Valid transitions from REGISTERED: SCREENING, WITHDRAWN",
  "timestamp": "2025-10-12T10:30:00"
}
```

### Validation Error Response (400 BAD REQUEST)
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request: one or more required fields are missing or invalid",
  "timestamp": "2025-10-12T10:30:00",
  "fieldErrors": {
    "newStatus": "New status is required",
    "reason": "Reason for status change is required",
    "changedBy": "Changed by is required"
  }
}
```

---

## 🧪 Testing with cURL

### Test Suite
```bash
#!/bin/bash
BASE_URL="http://localhost:8080/api/v1/patients"

echo "Test 1: Change patient status to SCREENING"
curl -X POST "$BASE_URL/1/status" \
  -H "Content-Type: application/json" \
  -d '{"newStatus":"SCREENING","reason":"Screening visit scheduled","changedBy":"coordinator@example.com"}'

echo "\nTest 2: Get status history"
curl "$BASE_URL/1/status/history"

echo "\nTest 3: Get current status"
curl "$BASE_URL/1/status/current"

echo "\nTest 4: Get status summary"
curl "$BASE_URL/1/status/summary"

echo "\nTest 5: Get valid transitions"
curl "$BASE_URL/1/status/valid-transitions"

echo "\nTest 6: Get transition summary"
curl "$BASE_URL/status/transitions/summary"

echo "\nTest 7: Find patients in SCREENING"
curl "$BASE_URL/status/SCREENING/patients"

echo "\nTest 8: Find stuck patients"
curl "$BASE_URL/status/SCREENING/stuck?days=14"

echo "\nTest 9: Health check"
curl "$BASE_URL/status/health"
```

---

## 📱 Frontend Integration Examples

### React Hook Example
```javascript
// usePatientStatus.js
import { useState } from 'react';
import axios from 'axios';

const BASE_URL = '/api/v1/patients';

export const usePatientStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeStatus = async (patientId, statusData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/${patientId}/status`,
        statusData
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStatusHistory = async (patientId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/${patientId}/status/history`
      );
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const getValidTransitions = async (patientId) => {
    const response = await axios.get(
      `${BASE_URL}/${patientId}/status/valid-transitions`
    );
    return response.data;
  };

  return {
    changeStatus,
    getStatusHistory,
    getValidTransitions,
    loading,
    error
  };
};
```

### Usage in Component
```javascript
// PatientStatusForm.jsx
import { usePatientStatus } from './hooks/usePatientStatus';

const PatientStatusForm = ({ patientId }) => {
  const { changeStatus, getValidTransitions, loading } = usePatientStatus();
  const [validStatuses, setValidStatuses] = useState([]);

  useEffect(() => {
    getValidTransitions(patientId).then(setValidStatuses);
  }, [patientId]);

  const handleSubmit = async (values) => {
    await changeStatus(patientId, {
      newStatus: values.status,
      reason: values.reason,
      changedBy: currentUser.email,
      notes: values.notes
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="status">
        {validStatuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      <textarea name="reason" required />
      <textarea name="notes" />
      <button type="submit" disabled={loading}>
        Change Status
      </button>
    </form>
  );
};
```

---

## 🔍 Troubleshooting

### Issue: 400 - Invalid Transition
**Cause:** Attempting invalid status transition  
**Solution:** Check valid transitions with GET `/patients/{id}/status/valid-transitions`

### Issue: 400 - Validation Error
**Cause:** Missing required fields (newStatus, reason, changedBy)  
**Solution:** Ensure all required fields are populated in request body

### Issue: 404 - Patient Not Found
**Cause:** Patient ID does not exist  
**Solution:** Verify patient ID exists in database

### Issue: 500 - Command Processing Error
**Cause:** Event sourcing system timeout or failure  
**Solution:** Check Axon Server logs, retry after delay

---

**Created:** October 12, 2025  
**Last Updated:** October 12, 2025  
**Version:** 1.0

