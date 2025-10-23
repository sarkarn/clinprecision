# Unscheduled Visit Form Management - UI User Guide

**Date:** October 22, 2025  
**Purpose:** Step-by-step UI guide for adding forms to unscheduled visits  
**Audience:** CRC Coordinators, Data Managers, Clinical Staff

---

## Table of Contents

1. [Overview](#overview)
2. [Method 1: During Visit Creation (Recommended)](#method-1-during-visit-creation-recommended)
3. [Method 2: After Visit Creation](#method-2-after-visit-creation)
4. [Method 3: Using Form Library](#method-3-using-form-library)
5. [Common Scenarios](#common-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What Are Unscheduled Visits?

Unscheduled visits are visits that occur **outside the protocol schedule**:
- **Screening Visit** - Initial patient evaluation before enrollment
- **Enrollment Visit** - When patient officially enters the study
- **Adverse Event Visit** - Unplanned safety assessment
- **Discontinuation Visit** - When patient withdraws from study

Unlike protocol visits (Week 1, Week 2, etc.) which have **pre-assigned forms**, unscheduled visits require you to **manually select which forms** to include.

### UI Location

Navigate to: **Data Capture Management** → **Subjects** → **[Patient Name]** → **Visits**

---

## Method 1: During Visit Creation (Recommended)

### Step 1: Navigate to Patient's Visit List

**Path:** `Data Capture Management → Subjects → [Patient Name] → Visits`

```
┌─────────────────────────────────────────────────────────────┐
│ ClinPrecision                                    [User Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Data Capture Management                                     │
│  ├─ Dashboard                                                │
│  ├─ Subjects                         ← Click here            │
│  ├─ Sites                                                    │
│  └─ Forms                                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Select Patient

**Subjects List View:**

```
┌─────────────────────────────────────────────────────────────┐
│ Subjects                                    [+ New Subject]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Search: [____________]  Filter: [All Statuses ▼]            │
│                                                               │
│ Subject ID   Name              Status      Site      Actions │
│ ────────────────────────────────────────────────────────────│
│ SUB-001      John Doe          ENROLLED    Site A    [View] │  ← Click View
│ SUB-002      Jane Smith        SCREENING   Site B    [View] │
│ SUB-003      Bob Johnson       REGISTERED  Site A    [View] │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Go to Visits Tab

**Patient Details Page:**

```
┌─────────────────────────────────────────────────────────────┐
│ Subject: SUB-001 - John Doe                      [Edit] [⋮] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Overview] [Visits] [Forms] [Documents] [Timeline]           │
│            ^^^^^^^^                                           │
│            Click Visits tab                                  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Visit Schedule                   [+ Create Visit ▼]     │ │  ← Click dropdown
│ │                                                          │ │
│ │ Upcoming Visits (3)                                     │ │
│ │ • Week 2 Visit - Due Oct 29, 2025                       │ │
│ │ • Week 4 Visit - Due Nov 12, 2025                       │ │
│ │ • Week 8 Visit - Due Dec 10, 2025                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Select Visit Type

**Create Visit Dropdown:**

```
┌─────────────────────────────────────────────────────────────┐
│                                    [+ Create Visit ▼]        │
│                                         │                    │
│                                    ┌────┴──────────────────┐ │
│                                    │ Screening Visit       │ │  ← Click one
│                                    │ Enrollment Visit      │ │
│                                    │ Adverse Event Visit   │ │
│                                    │ Discontinuation Visit │ │
│                                    └───────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: Create Visit Modal - Select Forms

**Modal Dialog:**

```
┌──────────────────────────────────────────────────────────────┐
│ Create Screening Visit                              [×]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Visit Date: *                                                 │
│ ┌──────────────────────┐                                     │
│ │ 2025-10-22          │📅│                                   │
│ └──────────────────────┘                                     │
│                                                                │
│ Notes:                                                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Initial screening visit for patient                    │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ Forms to Include: *                [Use Standard Forms]       │  ← Click button
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ☐ Select All                                           │  │
│ │                                                         │  │
│ │ ☑ Demographics                          [Required]     │  │  ← Check boxes
│ │ ☑ Medical History                       [Required]     │  │
│ │ ☑ Vital Signs                           [Required]     │  │
│ │ ☑ Inclusion/Exclusion Criteria          [Required]     │  │
│ │ ☑ Informed Consent                      [Required]     │  │
│ │ ☐ Concomitant Medications               [Optional]     │  │
│ │ ☐ Prior Procedures                      [Optional]     │  │
│ │                                                         │  │
│ │                                     5 forms selected    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Cancel]                             [Create Visit + Forms]   │  ← Click to create
└──────────────────────────────────────────────────────────────┘
```

**Form Selection Features:**
- ✅ **Use Standard Forms** button - Auto-selects recommended forms for visit type
- ✅ **Select All** checkbox - Quickly select all available forms
- ✅ **Required badges** - Shows which forms are typically required
- ✅ **Live counter** - Shows how many forms selected

### Step 6: Confirmation & View Visit

**Success Notification:**

```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Success!                                                    │
│   Screening visit created with 5 forms                       │
│                                                [View Visit]   │  ← Click to view
└──────────────────────────────────────────────────────────────┘
```

**Visit Details Page:**

```
┌──────────────────────────────────────────────────────────────┐
│ Screening Visit - October 22, 2025                           │
│ Status: SCHEDULED                                    [Edit]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Forms (5)                                     ● 0% Complete   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │ 1. Demographics                          Not Started    │  │
│ │    Required • Pre-visit                  [Start Form]   │  │  ← Can now complete
│ │                                                         │  │
│ │ 2. Medical History                       Not Started    │  │
│ │    Required • Pre-visit                  [Start Form]   │  │
│ │                                                         │  │
│ │ 3. Vital Signs                           Not Started    │  │
│ │    Required • During visit               [Start Form]   │  │
│ │                                                         │  │
│ │ 4. Inclusion/Exclusion Criteria          Not Started    │  │
│ │    Required • Pre-visit                  [Start Form]   │  │
│ │                                                         │  │
│ │ 5. Informed Consent                      Not Started    │  │
│ │    Required • Pre-visit                  [Start Form]   │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [+ Add More Forms]                                            │  ← Can add more later
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Method 2: After Visit Creation

### Scenario: Visit Already Created Without Forms

Sometimes you might create a visit first and add forms later.

### Step 1: Navigate to Visit

**Path:** `Subjects → [Patient] → Visits → [Select Visit]`

**Visit Details (No Forms):**

```
┌──────────────────────────────────────────────────────────────┐
│ Adverse Event Visit - October 22, 2025                       │
│ Status: SCHEDULED                                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Forms (0)                                                     │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │         No forms assigned to this visit                │  │
│ │                                                         │  │
│ │         [+ Add Forms to Visit]                         │  │  ← Click here
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Step 2: Add Forms Modal

**Form Selection Dialog:**

```
┌──────────────────────────────────────────────────────────────┐
│ Add Forms to Visit                                   [×]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Visit: Adverse Event Visit                                   │
│ Date: October 22, 2025                                       │
│                                                                │
│ Available Forms:              [Use AE Standard Forms]         │  ← Click for preset
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Search forms: [___________]                    [Filter]│  │
│ │                                                         │  │
│ │ ☑ Adverse Event Report           [Required]            │  │  ← Select forms
│ │   Report details of adverse event                      │  │
│ │                                                         │  │
│ │ ☑ Vital Signs                     [Required]            │  │
│ │   Record vital signs at time of AE                     │  │
│ │                                                         │  │
│ │ ☑ Concomitant Medications         [Required]            │  │
│ │   Document current medications                         │  │
│ │                                                         │  │
│ │ ☐ Safety Laboratory Tests         [Optional]            │  │
│ │   Optional safety labs if needed                       │  │
│ │                                                         │  │
│ │ ☐ ECG                             [Optional]            │  │
│ │   Electrocardiogram if warranted                       │  │
│ │                                                         │  │
│ │                                      3 forms selected   │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ Form Order:                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 1. Adverse Event Report           [↑] [↓] [×]         │  │  ← Reorder if needed
│ │ 2. Vital Signs                    [↑] [↓] [×]         │  │
│ │ 3. Concomitant Medications        [↑] [↓] [×]         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Cancel]                                      [Add Forms]     │  ← Click to add
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ **Search** - Find forms by name
- ✅ **Filter** - Filter by category, required status
- ✅ **Standard presets** - Quick-select common form sets
- ✅ **Drag to reorder** - Change form display order
- ✅ **Form descriptions** - See what each form contains

### Step 3: Forms Added Successfully

**Updated Visit Details:**

```
┌──────────────────────────────────────────────────────────────┐
│ ✓ 3 forms added to Adverse Event Visit                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Adverse Event Visit - October 22, 2025                       │
│ Status: SCHEDULED                                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Forms (3)                                     ● 0% Complete   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │ 1. Adverse Event Report                  Not Started    │  │
│ │    Required • During visit               [Start Form]   │  │
│ │                                                         │  │
│ │ 2. Vital Signs                           Not Started    │  │
│ │    Required • During visit               [Start Form]   │  │
│ │                                                         │  │
│ │ 3. Concomitant Medications               Not Started    │  │
│ │    Required • During visit               [Start Form]   │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [+ Add More Forms]                                            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Method 3: Using Form Library

### When to Use

Use this method when you need to:
- Add a **specific form** not in standard sets
- Browse **all available forms** by category
- Add forms from **different modules**

### Step 1: Open Form Library

**From Visit Details:**

```
┌──────────────────────────────────────────────────────────────┐
│ Screening Visit - October 22, 2025                           │
│                                                                │
│ Forms (2)                                     ● 0% Complete   │
│ [Demographics] [Vital Signs]                                 │
│                                                                │
│ [+ Add More Forms]  [Browse Form Library →]                  │  ← Click here
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Step 2: Browse & Select

**Form Library View:**

```
┌──────────────────────────────────────────────────────────────┐
│ Form Library                                         [×]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Search: [___________]        Category: [All Forms ▼]         │
│                                                                │
│ ┌──────────────────┬──────────────────┬──────────────────┐  │
│ │ DEMOGRAPHICS (5) │ SAFETY (12)      │ EFFICACY (8)     │  │  ← Categories
│ └──────────────────┴──────────────────┴──────────────────┘  │
│                                                                │
│ Demographics Forms:                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ☑ Demographics                                         │  │
│ │   Basic patient information                  [Added ✓]│  │
│ │                                                         │  │
│ │ ☐ Contact Information                                  │  │  ← Click to add
│ │   Emergency contacts and addresses           [Add +]  │  │
│ │                                                         │  │
│ │ ☐ Insurance Information                                │  │
│ │   Insurance and billing details              [Add +]  │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ Safety Forms:                                                 │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ☑ Vital Signs                                          │  │
│ │   Blood pressure, heart rate, etc.           [Added ✓]│  │
│ │                                                         │  │
│ │ ☐ Laboratory Tests                                     │  │  ← Click to add
│ │   Blood work and lab results                 [Add +]  │  │
│ │                                                         │  │
│ │ ☐ ECG                                                  │  │
│ │   Electrocardiogram                          [Add +]  │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│                                     2 forms already added     │
│                                     0 new forms selected      │
│                                                                │
│ [Back to Visit]                          [Add Selected Forms] │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ **Category tabs** - Browse by form type
- ✅ **Search** - Find specific forms
- ✅ **Already added indicator** - Shows forms already on visit
- ✅ **Preview** - Click form name to preview fields
- ✅ **Bulk add** - Select multiple forms at once

---

## Common Scenarios

### Scenario 1: Creating a Screening Visit

**Forms Typically Needed:**
1. ✅ Demographics (Required)
2. ✅ Medical History (Required)
3. ✅ Vital Signs (Required)
4. ✅ Inclusion/Exclusion Criteria (Required)
5. ✅ Informed Consent (Required)
6. ☐ Concomitant Medications (Optional)
7. ☐ Physical Examination (Optional)

**Quick Steps:**
1. Go to patient's Visits tab
2. Click **+ Create Visit** → **Screening Visit**
3. Click **Use Standard Forms** button
4. Review auto-selected forms
5. Add optional forms if needed
6. Click **Create Visit + Forms**

**Result:** Visit created with 5 required forms, ready for data entry

---

### Scenario 2: Creating an Adverse Event Visit

**Forms Typically Needed:**
1. ✅ Adverse Event Report (Required)
2. ✅ Vital Signs (Required)
3. ✅ Concomitant Medications (Required)
4. ☐ Safety Labs (Optional - if serious AE)
5. ☐ ECG (Optional - if cardiac event)

**Quick Steps:**
1. Go to patient's Visits tab
2. Click **+ Create Visit** → **Adverse Event Visit**
3. Enter event date
4. Notes: "Patient reported headache and nausea"
5. Click **Use AE Standard Forms**
6. Add Safety Labs if serious event
7. Click **Create Visit + Forms**

**Result:** AE visit with appropriate forms for event documentation

---

### Scenario 3: Adding Forms to Existing Visit

**Situation:** Visit created but missing forms

**Quick Steps:**
1. Navigate to the visit
2. Click **+ Add Forms to Visit**
3. Search or browse for needed forms
4. Select forms
5. Adjust order if needed
6. Click **Add Forms**

**Result:** Forms added to existing visit, available for completion

---

### Scenario 4: Removing a Form from Visit

**When to Remove:**
- Form added by mistake
- Form not applicable for this visit
- Duplicate form added

**Steps:**

```
┌──────────────────────────────────────────────────────────────┐
│ Visit Forms                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 1. Demographics              Not Started    [⋮]        │  │  ← Click menu
│ │                                               │         │  │
│ │                                          ┌────┴──────┐ │  │
│ │                                          │ Edit       │ │  │
│ │                                          │ Remove     │ │  │  ← Click Remove
│ │                                          └───────────┘ │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Confirmation Dialog:**

```
┌──────────────────────────────────────────────────────────────┐
│ Remove Form?                                         [×]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ⚠️  Are you sure you want to remove this form?               │
│                                                                │
│     Form: Demographics                                        │
│     Status: Not Started                                       │
│                                                                │
│     This action cannot be undone.                             │
│                                                                │
│ [Cancel]                                    [Remove Form]     │
└──────────────────────────────────────────────────────────────┘
```

**Note:** Can only remove forms that have **NOT been started**

---

### Scenario 5: Reordering Forms

**Why Reorder:**
- Complete forms in logical sequence
- Group related forms together
- Follow site's workflow

**Drag & Drop:**

```
┌──────────────────────────────────────────────────────────────┐
│ Visit Forms                                  [Reorder Mode]   │  ← Click to enable
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ⋮⋮ 1. Informed Consent                                 │  │  ← Drag handle
│ │ ⋮⋮ 2. Demographics                                     │  │
│ │ ⋮⋮ 3. Medical History                                  │  │
│ │ ⋮⋮ 4. Vital Signs              ← Drag up/down         │  │
│ │ ⋮⋮ 5. I/E Criteria                                     │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Cancel]                                      [Save Order]    │
└──────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Problem: "Add Forms" Button Disabled

**Possible Causes:**
1. ❌ Visit status is COMPLETED
2. ❌ Visit is locked for audit
3. ❌ User lacks permissions

**Solution:**
- Check visit status (must be SCHEDULED or IN_PROGRESS)
- Contact study coordinator if visit is locked
- Verify you have "Manage Visits" permission

---

### Problem: Form Not Appearing in List

**Possible Causes:**
1. ❌ Form not published for this study
2. ❌ Form assigned to different build
3. ❌ Form filtered out by search/category

**Solution:**
- Clear search filters
- Check "All Forms" category
- Contact study designer to verify form availability
- Check if you're in correct study database build

---

### Problem: Cannot Remove Form

**Error:** "Cannot remove form - data already entered"

**Cause:** Form has been started or completed

**Solution:**
- Forms with data cannot be removed
- Contact Data Manager to discuss data correction
- Consider marking form as "Not Applicable" instead

---

### Problem: Forms Not Saving

**Symptoms:**
- Error message when adding forms
- Forms disappear after refresh

**Troubleshooting:**
1. Check internet connection
2. Try refreshing the page
3. Check browser console for errors
4. Try different browser
5. Contact IT support if problem persists

**Common Errors:**

```
┌──────────────────────────────────────────────────────────────┐
│ ❌ Error Adding Forms                                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Unable to add forms to visit. Please try again.              │
│                                                                │
│ Error: Visit not found (404)                                 │  ← Visit was deleted
│                                                                │
│ OR                                                            │
│                                                                │
│ Error: Form already assigned (409)                           │  ← Form is duplicate
│                                                                │
│ OR                                                            │
│                                                                │
│ Error: Permission denied (403)                               │  ← No permission
│                                                                │
│ [Close]                                          [Retry]      │
└──────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### ✅ DO

1. **Use Standard Form Sets** - Click "Use Standard Forms" for consistency
2. **Check Required Forms** - Ensure all required forms are included
3. **Logical Order** - Order forms in the sequence they'll be completed
4. **Add Notes** - Include context in visit notes
5. **Verify Before Creating** - Review form selection before clicking Create
6. **Save Progress** - Click Save after reordering forms

### ❌ DON'T

1. **Don't skip required forms** - Visit cannot be completed without them
2. **Don't add duplicate forms** - System will reject duplicates
3. **Don't remove started forms** - Can cause data loss
4. **Don't forget to save** - Changes to order must be saved
5. **Don't add too many optional forms** - Burdens data entry staff

---

## Quick Reference Card

### Creating Visit with Forms

```
1. Subjects → [Patient] → Visits
2. + Create Visit → [Visit Type]
3. Enter date and notes
4. [Use Standard Forms] ← Click this
5. Review/adjust selections
6. [Create Visit + Forms]
```

### Adding Forms to Existing Visit

```
1. Navigate to visit
2. [+ Add Forms to Visit]
3. Search/select forms
4. [Add Forms]
```

### Removing Form

```
1. Visit → Forms list
2. Click [⋮] menu on form
3. Remove → Confirm
(Only if not started)
```

### Reordering Forms

```
1. Visit → Forms list
2. [Reorder Mode]
3. Drag ⋮⋮ handles
4. [Save Order]
```

---

## Standard Form Sets Reference

### Screening Visit Forms
- ✅ Demographics
- ✅ Medical History
- ✅ Vital Signs
- ✅ Inclusion/Exclusion Criteria
- ✅ Informed Consent

### Enrollment Visit Forms
- ✅ Randomization
- ✅ Treatment Assignment
- ✅ Baseline Assessments
- ✅ Study Drug Dispensing

### Adverse Event Visit Forms
- ✅ Adverse Event Report
- ✅ Vital Signs
- ✅ Concomitant Medications
- ☐ Safety Laboratory Tests (optional)
- ☐ ECG (optional)

### Discontinuation Visit Forms
- ✅ Discontinuation Reason
- ✅ Final Assessments
- ✅ Study Drug Return
- ✅ End of Study Form

---

## Support & Resources

### Need Help?

**Technical Support:**
- Email: support@clinprecision.com
- Phone: 1-800-CLIN-EDC
- Live Chat: Available 8am-6pm EST

**Training Resources:**
- Video Tutorial: "Creating Unscheduled Visits"
- User Manual: Chapter 8 - Visit Management
- FAQ: Common Visit & Form Questions

**Study-Specific Questions:**
- Contact Study Coordinator
- Check Protocol documentation
- Review Study Reference Manual

---

## Summary

### Key Takeaways

1. 🎯 **Two Main Methods:**
   - Create visit WITH forms (recommended)
   - Add forms AFTER visit creation

2. 🚀 **Use Standard Forms Button:**
   - Saves time
   - Ensures consistency
   - Reduces errors

3. 📋 **Form Management:**
   - Add forms anytime (if not completed)
   - Reorder for workflow
   - Remove only if not started

4. ✅ **Best Practice:**
   - Select forms during visit creation
   - Use standard presets
   - Verify before saving

---

**Document Version:** 1.0  
**Last Updated:** October 22, 2025  
**Related:** UNSCHEDULED_VISIT_FORM_MANAGEMENT_GUIDE.md, visitFormHelpers.js
