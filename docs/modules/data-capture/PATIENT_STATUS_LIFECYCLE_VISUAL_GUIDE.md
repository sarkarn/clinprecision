# Patient Status Lifecycle - Visual Reference Guide

**Date**: October 12, 2025  
**Purpose**: Quick visual reference for status transitions  
**Audience**: Developers, CRCs, QA

---

## 🔄 Status Lifecycle Diagram

```
                    ┌─────────────────────────────────────┐
                    │     Patient Status Lifecycle        │
                    └─────────────────────────────────────┘

                              Start Here
                                  │
                                  ↓
                         ┌────────────────┐
                         │   REGISTERED   │
                         │  (Initial)     │
                         └────────┬───────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ↓                         ↓
            ┌────────────────┐       ┌────────────────┐
            │   SCREENING    │       │   WITHDRAWN    │
            │  (Eligibility) │       │  (Any Time)    │
            └────────┬───────┘       └────────────────┘
                     │                         ↑
                     │                         │
                     ↓                         │
            ┌────────────────┐                │
            │    ENROLLED    │                │
            │  (In Study)    │                │
            └────────┬───────┘                │
                     │                         │
                     ├─────────────────────────┤
                     │                         
                     ↓                         
            ┌────────────────┐                
            │     ACTIVE     │                
            │ (Participating)│                
            └────────┬───────┘                
                     │                         
                     ├─────────────────────────┐
                     │                         │
                     ↓                         ↓
            ┌────────────────┐       ┌────────────────┐
            │   COMPLETED    │       │   WITHDRAWN    │
            │  (Finished)    │       │   (Any Time)   │
            └────────────────┘       └────────────────┘
```

---

## 📊 Status Details Table

| Status | Display Name | Color | Icon | Description | Terminal? |
|--------|-------------|-------|------|-------------|-----------|
| **REGISTERED** | Registered | Gray | 📋 | Patient registered in system | No |
| **SCREENING** | Screening | Blue | 🔍 | Being screened for eligibility | No |
| **ENROLLED** | Enrolled | Green | ✅ | Enrolled in one or more studies | No |
| **ACTIVE** | Active | Emerald | 🏃 | Actively participating in treatment | No |
| **COMPLETED** | Completed | Indigo | 🎉 | Study participation completed | Yes |
| **WITHDRAWN** | Withdrawn | Red | ❌ | Withdrawn from participation | Yes |

---

## ✅ Valid Transitions Matrix

|  FROM ↓ \ TO → | REGISTERED | SCREENING | ENROLLED | ACTIVE | COMPLETED | WITHDRAWN |
|----------------|:----------:|:---------:|:--------:|:------:|:---------:|:---------:|
| **REGISTERED** |     -      |     ✅    |    ❌    |   ❌   |     ❌    |     ✅    |
| **SCREENING**  |     ❌     |     -     |    ✅    |   ❌   |     ❌    |     ✅    |
| **ENROLLED**   |     ❌     |     ❌    |    -     |   ✅   |     ❌    |     ✅    |
| **ACTIVE**     |     ❌     |     ❌    |    ❌    |   -    |     ✅    |     ✅    |
| **COMPLETED**  |     ❌     |     ❌    |    ❌    |   ❌   |     -     |     ❌    |
| **WITHDRAWN**  |     ❌     |     ❌    |    ❌    |   ❌   |     ❌    |     -     |

**Legend**: ✅ Valid transition | ❌ Invalid transition | - Same status

**Special Rule**: Can transition to WITHDRAWN from **any** non-terminal status

---

## 🎯 Status Transition Rules

### Rule 1: Sequential Progression (Happy Path)
```
REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
```
**Use Case**: Normal study completion

### Rule 2: Early Withdrawal
```
REGISTERED → WITHDRAWN
SCREENING → WITHDRAWN
ENROLLED → WITHDRAWN
ACTIVE → WITHDRAWN
```
**Use Case**: Patient withdraws at any stage

### Rule 3: Terminal Status
```
COMPLETED → (no further transitions)
WITHDRAWN → (no further transitions)
```
**Use Case**: Final states, no reversal

### Rule 4: No Backward Movement
```
ENROLLED → SCREENING  ❌ NOT ALLOWED
ACTIVE → ENROLLED     ❌ NOT ALLOWED
```
**Use Case**: Progress is one-way only

### Rule 5: No Status Skipping
```
REGISTERED → ENROLLED  ❌ MUST go through SCREENING
ENROLLED → COMPLETED   ❌ MUST go through ACTIVE
```
**Use Case**: All steps are required

---

## 📝 Status Descriptions

### REGISTERED 📋
**Description**: Patient has been registered in the system  
**Typical Duration**: 1-2 days  
**Next Steps**:
- Schedule screening visit
- Transition to SCREENING when screening begins

**Actions Available**:
- Edit patient information
- Schedule visits
- Enroll in study (after screening)
- Withdraw patient

**Business Rules**:
- Patient must be at least 18 years old
- Contact information required
- Can have multiple study enrollments

---

### SCREENING 🔍
**Description**: Patient is being screened for eligibility  
**Typical Duration**: 1-4 weeks  
**Next Steps**:
- Complete eligibility assessments
- Review inclusion/exclusion criteria
- Transition to ENROLLED if eligible
- Transition to WITHDRAWN if ineligible

**Actions Available**:
- Record screening results
- Document eligibility criteria
- Upload consent forms
- Withdraw if ineligible

**Business Rules**:
- Must complete all screening assessments
- Eligibility criteria must be evaluated
- Screen failures must be documented

---

### ENROLLED ✅
**Description**: Patient is enrolled in one or more studies  
**Typical Duration**: Until treatment begins  
**Next Steps**:
- Randomize to treatment arm (if applicable)
- Schedule first treatment visit
- Transition to ACTIVE when treatment begins

**Actions Available**:
- View enrollment details
- Schedule treatment visits
- Assign to treatment arm
- Withdraw if patient changes mind

**Business Rules**:
- Can be enrolled in multiple studies
- Screening number is assigned
- Site association is recorded
- Enrollment date is captured

---

### ACTIVE 🏃
**Description**: Patient is actively participating in treatment  
**Typical Duration**: Study duration (months to years)  
**Next Steps**:
- Continue study visits
- Collect data
- Monitor compliance
- Transition to COMPLETED when study ends
- Transition to WITHDRAWN if patient exits early

**Actions Available**:
- Record visit data
- Track adverse events
- Monitor protocol compliance
- Document protocol deviations

**Business Rules**:
- Must attend scheduled visits
- Data collection ongoing
- Safety monitoring active
- Protocol adherence tracked

---

### COMPLETED 🎉
**Description**: Patient has completed study participation  
**Typical Duration**: Permanent  
**Next Steps**: None (terminal status)

**Actions Available**:
- View final data
- Generate completion reports
- Archive records

**Business Rules**:
- All study visits completed
- End-of-study procedures done
- Final data collected
- Cannot transition to other statuses

---

### WITHDRAWN ❌
**Description**: Patient has withdrawn from participation  
**Typical Duration**: Permanent  
**Next Steps**: None (terminal status)

**Actions Available**:
- View withdrawal reason
- Generate withdrawal reports
- Archive records

**Business Rules**:
- Can occur at any stage
- Reason must be documented
- Withdrawal date recorded
- Cannot re-enroll
- Cannot transition to other statuses

---

## 🎨 UI Color Scheme

### Status Badges (Tailwind CSS)

```jsx
// REGISTERED
<span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
  📋 Registered
</span>

// SCREENING
<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
  🔍 Screening
</span>

// ENROLLED
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  ✅ Enrolled
</span>

// ACTIVE
<span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
  🏃 Active
</span>

// COMPLETED
<span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
  🎉 Completed
</span>

// WITHDRAWN
<span className="bg-red-100 text-red-800 px-2 py-1 rounded">
  ❌ Withdrawn
</span>
```

### Color Palette

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| REGISTERED | `#F3F4F6` | `#1F2937` | `#D1D5DB` |
| SCREENING | `#DBEAFE` | `#1E40AF` | `#93C5FD` |
| ENROLLED | `#D1FAE5` | `#065F46` | `#6EE7B7` |
| ACTIVE | `#D1FAE5` | `#047857` | `#6EE7B7` |
| COMPLETED | `#E0E7FF` | `#3730A3` | `#A5B4FC` |
| WITHDRAWN | `#FEE2E2` | `#991B1B` | `#FCA5A5` |

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path - Complete Lifecycle
```
Step 1: Register patient
  Status: REGISTERED
  
Step 2: Start screening
  Status: REGISTERED → SCREENING
  Reason: "Screening visit scheduled"
  
Step 3: Pass screening and enroll
  Status: SCREENING → ENROLLED
  Reason: "Passed all eligibility criteria"
  
Step 4: Begin treatment
  Status: ENROLLED → ACTIVE
  Reason: "First treatment visit completed"
  
Step 5: Complete study
  Status: ACTIVE → COMPLETED
  Reason: "All study visits completed"

Expected: All transitions succeed, history shows 5 status changes
```

### Scenario 2: Early Withdrawal During Screening
```
Step 1: Register patient
  Status: REGISTERED
  
Step 2: Start screening
  Status: REGISTERED → SCREENING
  
Step 3: Patient withdraws
  Status: SCREENING → WITHDRAWN
  Reason: "Patient no longer wishes to participate"

Expected: Withdrawal succeeds, status is terminal
```

### Scenario 3: Invalid Transition Attempt
```
Step 1: Register patient
  Status: REGISTERED
  
Step 2: Try to skip to ACTIVE
  Status: REGISTERED → ACTIVE
  Expected: ❌ Error - Invalid transition

Error Message:
"Invalid status transition from REGISTERED to ACTIVE. 
Valid transitions: REGISTERED→SCREENING, ANY→WITHDRAWN"
```

### Scenario 4: Multiple Status Changes Same Patient
```
Patient 001:
  10:00 AM - REGISTERED
  10:15 AM - SCREENING
  10:30 AM - ENROLLED
  
Expected: History shows 3 records in chronological order
```

---

## 📋 CRC Workflow Examples

### Example 1: New Patient Screening
```
1. CRC registers patient
   → Status: REGISTERED
   
2. CRC schedules screening visit
   → Status changes to SCREENING
   → Reason: "Screening visit scheduled for March 15"
   
3. Patient completes screening
   → CRC reviews eligibility
   → Patient meets criteria
   → Status changes to ENROLLED
   → Reason: "Patient eligible, all criteria met"
   
4. CRC schedules first treatment
   → First treatment visit occurs
   → Status changes to ACTIVE
   → Reason: "Treatment initiated, first dose administered"
```

### Example 2: Screen Failure
```
1. CRC registers patient
   → Status: REGISTERED
   
2. CRC starts screening
   → Status changes to SCREENING
   → Reason: "Screening visit scheduled"
   
3. Patient fails inclusion criteria
   → Status changes to WITHDRAWN
   → Reason: "Screen failure - did not meet inclusion criteria #3"
```

### Example 3: Early Termination
```
1. Patient is ACTIVE in study
   → Currently on treatment visit 5 of 12
   
2. Patient decides to withdraw
   → CRC processes withdrawal
   → Status changes to WITHDRAWN
   → Reason: "Patient voluntary withdrawal - personal reasons"
   
3. CRC documents:
   → Withdrawal date
   → Last visit completed
   → Follow-up requirements
```

---

## 🔍 Troubleshooting

### Issue: Cannot change status
**Symptoms**: API returns 400 error, "Invalid transition"  
**Cause**: Trying to skip statuses or go backward  
**Solution**: Follow sequential progression or use WITHDRAWN

### Issue: ACTIVE status not found
**Symptoms**: IllegalArgumentException, "No enum constant"  
**Cause**: ACTIVE status missing from enum (pre-fix)  
**Solution**: Apply enum consolidation fix

### Issue: Status badge not showing
**Symptoms**: Gray badge or no color  
**Cause**: Unknown status value or CSS class issue  
**Solution**: Check status value matches enum, verify Tailwind classes

### Issue: Status history not recording
**Symptoms**: No history records in database  
**Cause**: Projector not handling event or table missing  
**Solution**: Verify projector has `on(PatientStatusChangedEvent)` handler

---

## 📚 API Reference

### Change Patient Status
```http
POST /clinops-ws/api/v1/patients/{patientId}/status

Request Body:
{
  "newStatus": "SCREENING",
  "reason": "Screening visit scheduled for March 15, 2025",
  "changedBy": "coordinator@example.com",
  "notes": "Patient provided informed consent",
  "enrollmentId": "uuid-optional"
}

Response: 200 OK
{
  "success": true,
  "message": "Patient status changed successfully",
  "previousStatus": "REGISTERED",
  "newStatus": "SCREENING",
  "changedAt": "2025-03-10T10:30:00Z"
}
```

### Get Status History
```http
GET /clinops-ws/api/v1/patients/{patientId}/status/history

Response: 200 OK
[
  {
    "id": 3,
    "previousStatus": "ENROLLED",
    "newStatus": "ACTIVE",
    "reason": "First treatment visit completed",
    "changedBy": "dr.smith@example.com",
    "changedAt": "2025-03-20T14:00:00Z",
    "notes": "Patient tolerated first dose well"
  },
  {
    "id": 2,
    "previousStatus": "SCREENING",
    "newStatus": "ENROLLED",
    "reason": "Passed all eligibility criteria",
    "changedBy": "coordinator@example.com",
    "changedAt": "2025-03-15T11:00:00Z",
    "notes": null
  }
]
```

### Get Current Status
```http
GET /clinops-ws/api/v1/patients/{patientId}/status/current

Response: 200 OK
{
  "status": "ACTIVE",
  "displayName": "Active",
  "description": "Actively participating in treatment",
  "lastChanged": "2025-03-20T14:00:00Z",
  "changedBy": "dr.smith@example.com",
  "durationInDays": 5
}
```

### Get Valid Next Statuses
```http
GET /clinops-ws/api/v1/patients/{patientId}/status/valid-transitions

Response: 200 OK
{
  "currentStatus": "ENROLLED",
  "validNextStatuses": [
    {
      "status": "ACTIVE",
      "displayName": "Active",
      "description": "Start active treatment"
    },
    {
      "status": "WITHDRAWN",
      "displayName": "Withdrawn",
      "description": "Patient withdraws from study"
    }
  ]
}
```

---

## 🎯 Quick Reference

### Status Count: 6
- REGISTERED (starting point)
- SCREENING (eligibility check)
- ENROLLED (in study)
- ACTIVE (treatment phase)
- COMPLETED (finished)
- WITHDRAWN (exited early)

### Terminal Statuses: 2
- COMPLETED
- WITHDRAWN

### Valid First Transition: 2
- REGISTERED → SCREENING
- REGISTERED → WITHDRAWN

### Maximum Path Length: 5 transitions
REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED

### Minimum Path Length: 1 transition
REGISTERED → WITHDRAWN

---

**Document**: Visual Reference Guide  
**Version**: 1.0  
**Created**: October 12, 2025  
**Purpose**: Quick reference for developers and CRCs  
**Related**: WEEK_2_STATUS_MANAGEMENT_PLAN.md

---

**Print this page for your desk! 📄**
