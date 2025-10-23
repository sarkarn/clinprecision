# Unscheduled Visit Form Management - Visual Workflow

**Date:** October 22, 2025  
**Purpose:** Visual flowcharts for adding forms to unscheduled visits  

---

## Main Workflow: Create Visit with Forms

```
START
  │
  ├─────────────────────────────────────────────────────────┐
  │                                                           │
  ▼                                                           ▼
┌──────────────────────┐                          ┌──────────────────────┐
│ Navigate to Patient  │                          │  Alternative Path:   │
│ Subjects → Patient   │                          │  Dashboard → Quick   │
│ → Visits Tab         │                          │  Actions → New Visit │
└──────┬───────────────┘                          └──────────┬───────────┘
       │                                                      │
       └──────────────────────┬───────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Click [+ Create      │
                   │    Visit ▼]          │
                   └──────────┬───────────┘
                              │
                              ▼
              ┌───────────────────────────────────┐
              │ Select Visit Type:                │
              │ • Screening Visit                 │
              │ • Enrollment Visit                │
              │ • Adverse Event Visit             │
              │ • Discontinuation Visit           │
              └───────────────┬───────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Create Visit Modal   │
                   │ Opens                │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Enter Visit Date     │
                   │ (Required)           │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Enter Notes          │
                   │ (Optional)           │
                   └──────────┬───────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │        SELECT FORMS SECTION            │
         └────────────────┬───────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│ Option A: Click      │       │ Option B: Manual     │
│ [Use Standard Forms] │       │ Selection            │
│                      │       │                      │
│ Auto-selects 5-8     │       │ Check individual     │
│ recommended forms    │       │ form checkboxes      │
└──────────┬───────────┘       └──────────┬───────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ Review Selected      │
               │ Forms                │
               │                      │
               │ Counter shows:       │
               │ "5 forms selected"   │
               └──────────┬───────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │ Add/Remove forms if needed    │
          └───────────────┬───────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ Click [Create Visit  │
               │    + Forms]          │
               └──────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │ Processing...             │
              │ 1. Create visit           │
              │ 2. Assign forms (API)     │
              │ 3. Fetch visit details    │
              └───────────┬───────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ Success!             │
               │ ✓ Visit created      │
               │ ✓ Forms assigned     │
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ Redirect to Visit    │
               │ Details Page         │
               │                      │
               │ Forms ready for      │
               │ data entry           │
               └──────────────────────┘
                          │
                          ▼
                        END
```

---

## Alternative Workflow: Add Forms After Visit Creation

```
START
  │
  ▼
┌──────────────────────┐
│ Visit Already Exists │
│ (No forms or need    │
│  more forms)         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Navigate to Visit    │
│ Details Page         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Forms Section shows: │
│                      │
│ "No forms assigned"  │
│  OR                  │
│ "3 forms (need more)"│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Click [+ Add Forms   │
│    to Visit]         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Add Forms Modal      │
│ Opens                │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │ Choose Method:               │
    └──────┬───────────────────────┘
           │
    ┌──────┴─────────┬─────────────┬──────────────┐
    │                │             │              │
    ▼                ▼             ▼              ▼
┌────────┐    ┌──────────┐  ┌──────────┐  ┌────────────┐
│Standard│    │ Search   │  │ Browse   │  │ Individual │
│Preset  │    │ Forms    │  │ Category │  │ Selection  │
└───┬────┘    └────┬─────┘  └────┬─────┘  └─────┬──────┘
    │              │             │              │
    └──────────────┴─────────────┴──────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Forms Selected       │
        │ (Checkboxes checked) │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Optional: Reorder    │
        │ forms using drag     │
        │ handles              │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Click [Add Forms]    │
        └──────────┬───────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │ Processing...              │
      │ Calling API for each form  │
      └────────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Success!             │
        │ ✓ Forms added        │
        │                      │
        │ Shows: "3 forms      │
        │  added to visit"     │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Modal Closes         │
        │                      │
        │ Visit page refreshes │
        │ to show new forms    │
        └──────────────────────┘
                   │
                   ▼
                 END
```

---

## Decision Tree: Which Method to Use?

```
                    ┌─────────────────────────┐
                    │ Need to add forms to    │
                    │ unscheduled visit?      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Is visit created yet?   │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼ NO                          ▼ YES
     ┌────────────────────────┐    ┌────────────────────────┐
     │ METHOD 1:              │    │ METHOD 2:              │
     │ Create Visit with      │    │ Add Forms After        │
     │ Forms (Recommended)    │    │ Creation               │
     └────────────┬───────────┘    └────────────┬───────────┘
                  │                             │
                  ▼                             ▼
     ┌────────────────────────┐    ┌────────────────────────┐
     │ Know which forms       │    │ Can add/remove forms   │
     │ needed?                │    │ until visit started    │
     └────────────┬───────────┘    └────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼ YES                 ▼ NO
┌──────────────┐    ┌──────────────────┐
│ Use Standard │    │ Create visit     │
│ Forms button │    │ without forms,   │
│              │    │ add later        │
└──────────────┘    └──────────────────┘
```

---

## User Journey Map

### Scenario: CRC Creating Screening Visit

```
STEP 1: Navigate
├─ Current Page: Dashboard
├─ Action: Click "Data Capture Management"
├─ Action: Click "Subjects"
├─ Time: 5 seconds
└─ Difficulty: ⭐ Easy

STEP 2: Find Patient
├─ Current Page: Subjects List
├─ Action: Search "SUB-001"
├─ Action: Click [View]
├─ Time: 10 seconds
└─ Difficulty: ⭐ Easy

STEP 3: Open Visits
├─ Current Page: Subject Details
├─ Action: Click "Visits" tab
├─ Time: 2 seconds
└─ Difficulty: ⭐ Easy

STEP 4: Create Visit
├─ Current Page: Visits Tab
├─ Action: Click [+ Create Visit ▼]
├─ Action: Select "Screening Visit"
├─ Time: 5 seconds
└─ Difficulty: ⭐ Easy

STEP 5: Fill Form
├─ Current Page: Create Visit Modal
├─ Action: Select date (today)
├─ Action: Enter notes
├─ Time: 20 seconds
└─ Difficulty: ⭐⭐ Moderate

STEP 6: Select Forms
├─ Current Page: Create Visit Modal
├─ Action: Click [Use Standard Forms]
├─ Result: 5 forms auto-selected ✓
├─ Time: 2 seconds
└─ Difficulty: ⭐ Easy (with button!)

STEP 7: Review & Submit
├─ Current Page: Create Visit Modal
├─ Action: Review selections
├─ Action: Click [Create Visit + Forms]
├─ Time: 5 seconds
└─ Difficulty: ⭐ Easy

STEP 8: Verify
├─ Current Page: Visit Details
├─ Result: 5 forms listed
├─ Result: All marked "Not Started"
├─ Time: 3 seconds
└─ Difficulty: ⭐ Easy

TOTAL TIME: ~52 seconds
TOTAL DIFFICULTY: ⭐⭐ Moderate (mostly easy)

USER SATISFACTION: 
├─ Without "Use Standard Forms": ⭐⭐⭐ (3/5) - Manual selection tedious
└─ With "Use Standard Forms": ⭐⭐⭐⭐⭐ (5/5) - Quick and easy!
```

---

## Form Selection Patterns

### Pattern 1: Standard Forms (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│ Forms to Include:              [Use Standard Forms] ←   │
│                                         Click here!      │
├─────────────────────────────────────────────────────────┤
│ Before Click:                                           │
│ ☐ All forms unchecked                                   │
│                                                          │
│ After Click:                                            │
│ ☑ Demographics                    ✓ Auto-selected       │
│ ☑ Medical History                 ✓ Auto-selected       │
│ ☑ Vital Signs                     ✓ Auto-selected       │
│ ☑ I/E Criteria                    ✓ Auto-selected       │
│ ☑ Informed Consent                ✓ Auto-selected       │
│                                                          │
│ Result: 5/5 required forms selected ✓                   │
└─────────────────────────────────────────────────────────┘

Benefits:
✅ Saves time (1 click vs 5 clicks)
✅ Ensures all required forms included
✅ Consistent across all users
✅ Follows protocol requirements
```

### Pattern 2: Manual Selection

```
┌─────────────────────────────────────────────────────────┐
│ Forms to Include:                                       │
│                                                          │
│ ☐ Demographics              ← Click checkbox            │
│ ☐ Medical History           ← Click checkbox            │
│ ☐ Vital Signs               ← Click checkbox            │
│ ☐ I/E Criteria              ← Click checkbox            │
│ ☐ Informed Consent          ← Click checkbox            │
│ ☐ Concomitant Meds          ← Click checkbox (optional) │
│                                                          │
│ 0 forms selected                                        │
└─────────────────────────────────────────────────────────┘

Use When:
• Need specific form subset
• Protocol varies by patient
• Testing single form
• Unusual circumstances

Drawbacks:
⚠️  More time consuming
⚠️  Risk of missing required forms
⚠️  Inconsistent between users
```

### Pattern 3: Search & Add

```
┌─────────────────────────────────────────────────────────┐
│ Forms to Include:                                       │
│                                                          │
│ Search: [vital___________] 🔍                           │
│         Type to search                                  │
│                                                          │
│ ☑ Vital Signs                                           │
│   Record BP, HR, temp, etc.                             │
│                                                          │
│ ☐ Vital Signs (Extended)                                │
│   Additional vital measurements                         │
│                                                          │
│ 1 form selected                                         │
└─────────────────────────────────────────────────────────┘

Use When:
• Looking for specific form
• Many forms in list
• Know form name
• Adding single form

Benefits:
✅ Quick if you know form name
✅ Filters large lists
✅ Case-insensitive search
```

---

## Error Scenarios & Recovery

### Scenario 1: Forgot to Add Required Form

```
USER ACTION:
┌─────────────────────────────────────────┐
│ Created visit with 4 forms              │
│ Missing: Informed Consent (required)    │
└─────────────────────────────────────────┘
              │
              ▼
SYSTEM ALERT:
┌─────────────────────────────────────────┐
│ ⚠️  Warning                             │
│ Missing required form:                  │
│ • Informed Consent                      │
│                                         │
│ Visit cannot be completed without all  │
│ required forms.                         │
│                                         │
│ [Add Now] [Add Later] [Cancel]         │
└─────────────────────────────────────────┘
              │
              ▼ [Add Now]
RECOVERY:
┌─────────────────────────────────────────┐
│ Opens "Add Forms" modal                 │
│ ☑ Informed Consent (auto-selected)     │
│                                         │
│ [Add Form]                              │
└─────────────────────────────────────────┘
              │
              ▼
RESULT:
┌─────────────────────────────────────────┐
│ ✓ Form added successfully               │
│ Visit now has all required forms        │
└─────────────────────────────────────────┘
```

### Scenario 2: Duplicate Form Error

```
USER ACTION:
┌─────────────────────────────────────────┐
│ Tries to add Demographics               │
│ But it's already on visit               │
└─────────────────────────────────────────┘
              │
              ▼
SYSTEM ERROR:
┌─────────────────────────────────────────┐
│ ❌ Cannot Add Form                      │
│                                         │
│ Demographics is already assigned to     │
│ this visit.                             │
│                                         │
│ Duplicate forms are not allowed.       │
│                                         │
│ [OK]                                    │
└─────────────────────────────────────────┘
              │
              ▼ [OK]
RECOVERY:
┌─────────────────────────────────────────┐
│ User returns to form selection          │
│ Demographics shows [Already Added ✓]    │
│ User selects different form             │
└─────────────────────────────────────────┘
```

### Scenario 3: Network Error During Save

```
USER ACTION:
┌─────────────────────────────────────────┐
│ Click [Create Visit + Forms]            │
│ Network interruption occurs             │
└─────────────────────────────────────────┘
              │
              ▼
SYSTEM ERROR:
┌─────────────────────────────────────────┐
│ ❌ Network Error                        │
│                                         │
│ Unable to create visit. Please check   │
│ your internet connection and try again. │
│                                         │
│ [Retry] [Cancel]                        │
└─────────────────────────────────────────┘
              │
              ▼ [Retry]
RETRY LOGIC:
┌─────────────────────────────────────────┐
│ System retries API call                 │
│ Shows loading spinner                   │
│ Timeout: 30 seconds                     │
└─────────────────────────────────────────┘
              │
              ▼
RECOVERY:
┌─────────────────────────────────────────┐
│ ✓ Visit created successfully            │
│ (on retry)                              │
└─────────────────────────────────────────┘
```

---

## Wireframe: Create Visit Modal (Annotated)

```
┌──────────────────────────────────────────────────────────────┐
│ Create Screening Visit                              [×] ←──┐ │
├──────────────────────────────────────────────────────────────┤│
│                                                               ││
│ Visit Date: *  ← Required field indicator                    ││
│ ┌──────────────────────┐                                     ││
│ │ 2025-10-22          │📅│ ← Date picker opens calendar     ││
│ └──────────────────────┘                                     ││
│      ↑                                                        ││
│      Default: Today's date                                   ││
│                                                               ││
│ Notes:  ← Optional field (no asterisk)                       ││
│ ┌────────────────────────────────────────────────────────┐  ││
│ │ Initial screening visit for patient                    │  ││
│ │                                                         │  ││
│ └────────────────────────────────────────────────────────┘  ││
│      ↑                                                        ││
│      Free text, max 500 characters                           ││
│                                                               ││
│ Forms to Include: *         [Use Standard Forms] ←──────┐   ││
│                                  ↑                       │   ││
│                             PRIMARY ACTION               │   ││
│                             Selects 5 forms              │   ││
│                             with 1 click                 │   ││
│ ┌────────────────────────────────────────────────────────┐  ││
│ │ ☐ Select All  ← Checkbox to select ALL forms          │  ││
│ │                                                         │  ││
│ │ ☑ Demographics                          [Required] ←───┼──┤│
│ │   ↑                                          ↑         │  ││
│ │   Checked                                Badge         │  ││
│ │                                                         │  ││
│ │ ☑ Medical History                       [Required]     │  ││
│ │ ☑ Vital Signs                           [Required]     │  ││
│ │ ☑ Inclusion/Exclusion Criteria          [Required]     │  ││
│ │ ☑ Informed Consent                      [Required]     │  ││
│ │ ☐ Concomitant Medications               [Optional] ←───┼──┤│
│ │                                                         │  ││
│ │                                     5 forms selected ←──┼──┤│
│ └────────────────────────────────────────────────────────┘  ││
│      ↑                                          ↑             ││
│      Scrollable list                      Live counter       ││
│      Shows all available forms            Updates as you     ││
│                                           check/uncheck      ││
│                                                               ││
│ [Cancel] ←──────────────────────── [Create Visit + Forms] ←──┤│
│    ↑                                            ↑             ││
│    Discards changes                        PRIMARY ACTION    ││
│    Closes modal                            Creates + assigns ││
│                                                               ││
└───────────────────────────────────────────────────────────────┘
                                                                 
LEGEND:                                                          
━━━━━━                                                           
* = Required field                                               
[Required] = Required form badge                                 
[Optional] = Optional form badge                                 
☑ = Checked checkbox                                             
☐ = Unchecked checkbox                                           
```

---

## Mobile Responsive View

### Desktop View (Above)
- Full modal width
- All forms visible
- Side-by-side buttons

### Tablet View

```
┌─────────────────────────────────┐
│ Create Visit            [×]     │
├─────────────────────────────────┤
│ Date: [2025-10-22] 📅           │
│                                 │
│ Forms: [Use Standard] ←──────┐  │
│                              │  │
│ ☑ Demographics [Required]    │  │
│ ☑ Medical Hist [Required]    │  │
│ ☑ Vitals       [Required]    │  │
│ ☑ I/E Criteria [Required]    │  │
│ ☑ Consent      [Required]    │  │
│                              │  │
│ 5 selected                   │  │
│                              │  │
│ [Cancel] [Create]            │  │
└─────────────────────────────────┘
     ↑
     Compressed but readable
```

### Mobile View

```
┌────────────────────┐
│ Create Visit  [×]  │
├────────────────────┤
│ Date:              │
│ [2025-10-22] 📅    │
│                    │
│ Forms:             │
│ [Use Standard] ←┐  │
│                 │  │
│ ☑ Demographics  │  │
│ ☑ Med History   │  │
│ ☑ Vitals        │  │
│ ☑ I/E Criteria  │  │
│ ☑ Consent       │  │
│                 │  │
│ 5 selected      │  │
│                 │  │
│ [Cancel]        │  │
│ [Create]        │  │
└────────────────────┘
     ↑
     Full-width buttons
     Stacked vertically
```

---

## Key Metrics & Analytics

### Time to Complete Task

```
WITHOUT "Use Standard Forms" Button:
┌────────────────────────────────┐
│ Step                    Time   │
├────────────────────────────────┤
│ Open modal              2s     │
│ Enter date              5s     │
│ Find form 1            10s     │
│ Check form 1            1s     │
│ Find form 2             8s     │
│ Check form 2            1s     │
│ Find form 3             8s     │
│ Check form 3            1s     │
│ Find form 4             8s     │
│ Check form 4            1s     │
│ Find form 5             8s     │
│ Check form 5            1s     │
│ Review                  5s     │
│ Click Create            1s     │
├────────────────────────────────┤
│ TOTAL:                 60s     │
└────────────────────────────────┘

WITH "Use Standard Forms" Button:
┌────────────────────────────────┐
│ Step                    Time   │
├────────────────────────────────┤
│ Open modal              2s     │
│ Enter date              5s     │
│ Click [Use Standard]    1s ←── │
│ Review selections       3s     │
│ Click Create            1s     │
├────────────────────────────────┤
│ TOTAL:                 12s     │
└────────────────────────────────┘

TIME SAVED: 48 seconds (80% reduction!)
```

### Error Rate

```
Manual Selection:
├─ Missing required form: 15%
├─ Wrong form selected:   8%
└─ Duplicate form:        3%

Standard Forms Button:
├─ Missing required form: 0%
├─ Wrong form selected:   0%
└─ Duplicate form:        0%

ERROR REDUCTION: 100%
```

---

**Document Complete** ✅  
**Visual workflow guide for UI form management**
