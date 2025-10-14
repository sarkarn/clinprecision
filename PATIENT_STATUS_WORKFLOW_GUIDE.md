# Patient Status Workflow Guide 🔄

**Date:** October 12, 2025  
**Issue:** All enrolled subjects show "REGISTERED" status instead of progressing through the workflow  
**Solution:** Manual status progression workflow is available NOW

---

## 📋 Current Situation

### What's Happening
When you use the **Subject Enrollment Form** (`/subject-management/enroll`), the system:

1. ✅ **Step 1:** Registers the patient → Status = `REGISTERED`
2. ✅ **Step 2:** Enrolls patient in study → Status remains `REGISTERED` ❌

**Problem:** The enrollment process does NOT automatically change the status from `REGISTERED` → `SCREENING` → `ENROLLED` → `ACTIVE`

---

## 🎯 The Patient Lifecycle Workflow

According to your implementation (`PatientStatus.java`), the intended lifecycle is:

```
REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
                              ↓
                         WITHDRAWN (from any state)
                              ↓
                       SCREEN_FAILED (during screening)
```

### Status Definitions

| Status | Meaning | When to Use |
|--------|---------|-------------|
| **REGISTERED** | Patient registered in system | Initial enrollment form submission |
| **SCREENING** | Being screened for eligibility | After ICF signed, running inclusion/exclusion checks |
| **ENROLLED** | Passed screening, formally enrolled | After screening complete, patient qualified |
| **ACTIVE** | Actively participating in treatment | First dose/treatment started |
| **COMPLETED** | Finished study protocol | Study complete, all visits done |
| **WITHDRAWN** | Removed from study | Patient withdrew consent or investigator decision |
| **SCREEN_FAILED** | Did not meet eligibility | Failed inclusion/exclusion during screening |

---

## ✅ SOLUTION: How to Progress Status (Available NOW)

The workflow you need **is already implemented**! You just need to use the **Status Change feature** that was completed in Tasks 1, 2, 3.

### 🎬 Step-by-Step: Progressing a Subject Through Lifecycle

#### Option 1: From Subject List Page
1. Navigate to **Subject Management** (`/subject-management`)
2. Select a study from the dropdown
3. Find the subject in the list
4. Click the **"Withdraw"** button to change status (works for all status changes)
5. In the modal:
   - Select new status (e.g., `SCREENING`)
   - Enter required reason (min 10 characters)
   - Add optional notes
   - Click **"Change Status"**

#### Option 2: From Subject Details Page (RECOMMENDED)
1. Navigate to **Subject Management** → Click **"View"** on a subject
2. Click the **"Change Status"** button (top right)
3. In the Status Change Modal:
   - **Current Status:** Shows current status (e.g., REGISTERED)
   - **New Status Dropdown:** Shows only VALID transitions
   - **Reason:** Required field (e.g., "ICF signed, starting screening")
   - **Notes:** Optional detailed notes
4. Click **"Change Status"**
5. ✅ Status updated + audit trail created

---

## 🔧 Valid Status Transitions

The backend enforces these rules (`PatientStatusService.java`):

### From REGISTERED
- ✅ → SCREENING (Start screening process)
- ✅ → WITHDRAWN (Early withdrawal)

### From SCREENING
- ✅ → ENROLLED (Passed screening)
- ✅ → SCREEN_FAILED (Did not qualify)
- ✅ → WITHDRAWN (Withdrew during screening)

### From ENROLLED
- ✅ → ACTIVE (Started treatment)
- ✅ → WITHDRAWN (Withdrew before treatment)

### From ACTIVE
- ✅ → COMPLETED (Finished protocol)
- ✅ → WITHDRAWN (Withdrew during treatment)

### Terminal States
- ❌ COMPLETED → Cannot transition further
- ❌ WITHDRAWN → Cannot transition further
- ❌ SCREEN_FAILED → Cannot transition further

---

## 🎯 Typical Workflow Example

### Scenario: New Patient Enrollment

**Day 1: Enrollment**
```
Action: Site coordinator fills enrollment form
Status: REGISTERED
Reason: "Patient enrolled in study ABC-123"
```

**Day 2: Informed Consent**
```
Action: Coordinator clicks "Change Status" → SCREENING
Status: SCREENING
Reason: "ICF signed on 2025-10-12, starting screening procedures"
Notes: "Patient ID: SCR-001, ICF version 2.1"
```

**Day 5: Screening Complete**
```
Action: Coordinator clicks "Change Status" → ENROLLED
Status: ENROLLED
Reason: "Passed all inclusion/exclusion criteria"
Notes: "Lab results normal, ECG reviewed by PI"
```

**Day 7: First Dose**
```
Action: Coordinator clicks "Change Status" → ACTIVE
Status: ACTIVE
Reason: "First dose administered 2025-10-19"
Notes: "Treatment arm: Experimental drug 50mg"
```

**Week 12: Study Complete**
```
Action: Coordinator clicks "Change Status" → COMPLETED
Status: COMPLETED
Reason: "All protocol visits completed successfully"
Notes: "Final visit 2025-12-19, no AEs reported"
```

---

## 📊 Viewing Status History

To see the complete audit trail:

1. Go to **Subject Details** page
2. Click **"View History"** button
3. You'll see:
   - Timeline of all status changes
   - Previous status → New status transitions
   - Timestamps (when changed)
   - Who made the change
   - Reason and notes for each change
   - Filter by specific status

**Features:**
- ✅ Complete regulatory audit trail
- ✅ Expandable notes sections
- ✅ Status filtering dropdown
- ✅ GCP/FDA compliant documentation

---

## 🚨 Why Isn't It Automatic?

### Design Decision: Manual Status Progression

The system requires **manual status changes** for these important reasons:

1. **Regulatory Compliance (GCP/ICH)**
   - Each status change must be documented
   - Requires human verification and approval
   - Audit trail must capture who, when, why

2. **Clinical Safety**
   - Screening may take days/weeks
   - Inclusion/exclusion criteria must be verified
   - PI must approve enrollment
   - Cannot automatically mark as "ACTIVE" until treatment starts

3. **Site Workflow Flexibility**
   - Different sites may have different timelines
   - Some patients may screen fail
   - Some may withdraw consent
   - Sites need control over timing

4. **Data Quality**
   - Forces data entry of reason/notes
   - Prevents accidental status changes
   - Ensures proper documentation

---

## 💡 Future Enhancement Options

If you want **semi-automated** status progression in the future:

### Option A: Auto-Progress After Events
```javascript
// When ICF document uploaded → Auto change to SCREENING
// When first visit completed → Auto change to ACTIVE
// When final visit completed → Auto change to COMPLETED
```

### Option B: Workflow Suggestions
```javascript
// Show banner: "Patient has been in REGISTERED status for 3 days. 
// Ready to move to SCREENING?"
// [Yes, Start Screening] [No, Keep Current]
```

### Option C: Bulk Status Updates
```javascript
// Select multiple subjects → "Bulk Change Status"
// Useful for batch processing after screening day
```

### Option D: API Enhancement
Modify `enrollSubject()` to accept initial status:

```javascript
// In SubjectEnrollment.jsx
const formData = {
    // ... other fields
    initialStatus: 'SCREENING', // Instead of always REGISTERED
};

// Backend would need to support this in PatientEnrollmentService
```

---

## 🔧 Quick Fix: Change Default Initial Status

If you want new enrollments to start at **SCREENING** instead of **REGISTERED**:

### Option 1: Change Backend Default
**File:** `backend/.../PatientEnrollmentService.java`

Currently creates patients with `REGISTERED` status. You could:
- Add `initialStatus` parameter to enrollment API
- Default to `SCREENING` for enrolled patients
- Keep `REGISTERED` only for patients not yet in a study

### Option 2: Auto-Transition After Enrollment
**File:** `frontend/.../SubjectService.js`

After enrollment succeeds:
```javascript
// After enrollResp succeeds
const patientId = enrollResp.data.id;

// Immediately transition to SCREENING
await PatientStatusService.changePatientStatus(patientId, {
    newStatus: 'SCREENING',
    reason: 'Auto-transitioned after enrollment',
    changedBy: 'system',
    notes: 'Automatically moved to screening after study enrollment'
});
```

---

## 🎯 Recommended Immediate Actions

### For Site Coordinators

1. **After Enrolling a Subject:**
   - Go to Subject Details page
   - Click "Change Status"
   - Select appropriate status (SCREENING or ENROLLED)
   - Enter reason (e.g., "New enrollment, starting screening")
   - Save

2. **Regular Status Review:**
   - Review subjects in REGISTERED status daily
   - Progress to SCREENING once ICF signed
   - Progress to ENROLLED once screening complete
   - Progress to ACTIVE when treatment starts

### For Developers

**If you want to change the initial status for enrollments:**

1. **Backend Change** (Recommended):
   ```java
   // In PatientEnrollmentService.java
   // After enrollment, immediately change status to SCREENING
   PatientStatusChangeRequest statusChange = new PatientStatusChangeRequest();
   statusChange.setNewStatus(PatientStatus.SCREENING);
   statusChange.setReason("Enrolled in study - starting screening");
   statusChange.setChangedBy(createdBy);
   patientStatusService.changePatientStatus(patientId, statusChange);
   ```

2. **Frontend Change** (Quick Fix):
   ```javascript
   // In SubjectService.js enrollSubject() function
   // After successful enrollment, auto-transition status
   ```

---

## 📝 Current Code Analysis

### Enrollment Form Initial Status
**File:** `frontend/.../SubjectEnrollment.jsx`
- Line 19: `status: 'Active'` in formData ❌ **NOT USED**
- This field is ignored by the backend
- Backend always sets initial status to `REGISTERED`

### Backend Enrollment Flow
**File:** `backend/.../PatientEnrollmentService.java`
- Step 1: `registerPatient()` → Creates with status `REGISTERED`
- Step 2: `enrollPatient()` → Enrolls in study, status stays `REGISTERED`
- No automatic status progression

### Why Backend Sets REGISTERED
Looking at the backend code:
```java
// PatientRegisteredEvent creates patient with REGISTERED status
// This is by design for proper lifecycle tracking
```

---

## ✅ Summary

### What You Have NOW ✅
- ✅ Manual status change workflow (fully functional)
- ✅ Status validation (only valid transitions allowed)
- ✅ Audit trail (complete history tracking)
- ✅ Status Change Modal (professional UI)
- ✅ View History Timeline (regulatory compliance)

### What You Need to Do 🎯
1. **Use the "Change Status" button** after enrollment
2. Train site coordinators on status progression
3. Document when to move between statuses

### What You Could Add (Optional) 🚀
1. Auto-transition to SCREENING after enrollment
2. Workflow reminders for stale statuses
3. Bulk status updates
4. Custom initial status in enrollment form

---

## 🎬 Demo Workflow

Try this right now:

1. **Enroll a test subject:**
   - Go to `/subject-management/enroll`
   - Fill form with test data
   - Submit → Status will be `REGISTERED`

2. **Progress to SCREENING:**
   - Click "View" on that subject
   - Click "Change Status" button
   - Select `SCREENING`
   - Reason: "Starting screening process"
   - Save

3. **View History:**
   - Click "View History" button
   - See the transition: REGISTERED → SCREENING
   - See timestamp, reason, who changed it

4. **Continue Progression:**
   - Change to `ENROLLED` (reason: "Passed screening")
   - Change to `ACTIVE` (reason: "First dose administered")
   - Change to `COMPLETED` (reason: "Study complete")

Each transition creates an audit record! 🎉

---

## 📞 Need Help?

**Common Questions:**

**Q: Why does the form say "status: 'Active'" but subjects show as REGISTERED?**  
A: The frontend form has that field, but backend ignores it and uses REGISTERED as initial status by design.

**Q: Can I change the initial status to SCREENING automatically?**  
A: Yes! See "Quick Fix: Change Default Initial Status" section above.

**Q: Is it GCP/FDA compliant to manually change statuses?**  
A: Yes! Manual progression with documented reasons is actually MORE compliant than automatic changes.

**Q: Can I bulk update multiple subjects at once?**  
A: Not yet - this is a "Future Enhancement" (see section above).

---

**Document Status:** Complete explanation of current workflow + solutions  
**Next Steps:** Choose between manual workflow (current) or implement auto-transition (optional)
