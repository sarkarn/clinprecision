# Correct Navigation Path - Visual Guide

## The Issue
When you click "Subject Management" in the sidebar, you land on a **Dashboard page**, NOT the subject list page.

## Correct Navigation Path

### Step 1: Click "Subject Management" in Sidebar
```
Left Sidebar → "Subject Management" 
↓
Lands at: /subject-management (Dashboard)
```

### Step 2: You will see SubjectManagementDashboard
The dashboard shows:
- **Header**: "Subject Management" title with description
- **Quick Stats**: Cards showing Total Subjects, Enrolled, Screening, Completed
- **Main Card**: "Subject Management" card with two buttons:
  - 🔵 **"View All Subjects"** (Primary blue button) ← CLICK THIS!
  - ⚪ **"Enroll New Subject"** (Secondary button)
- **Quick Actions Section**: Three action cards including "View All Subjects"

### Step 3: Click "View All Subjects" Button
```
Dashboard → Click "View All Subjects" button
↓
Navigates to: /subject-management/subjects
↓
Shows: SubjectList component WITH study dropdown
```

### Step 4: Now You See the Subject List Page
This page has:
- ✅ **Study Protocol Dropdown** (at the top)
- ✅ Subject table with View/Edit/Withdraw buttons
- ✅ "Enroll New Subject" button

## Alternative Navigation Paths

### Option A: Use Quick Actions Card
On the Dashboard, under "Quick Actions" section:
- Click the "View All Subjects" card (blue card with clipboard icon)

### Option B: Direct URL
Type in browser: `/subject-management/subjects`

### Option C: Use Data Capture Module (Different approach)
```
Left Sidebar → "Data Capture"
↓
Directly shows SubjectList with study dropdown
```

## Why Two Paths?

There are **TWO modules** in the system:

1. **Subject Management Module** (`/subject-management`)
   - Default: Dashboard (overview page)
   - Nested route: `/subjects` → SubjectList

2. **Data Capture Module** (`/datacapture-management`)
   - Default: SubjectList with study dropdown

Both eventually lead to the same SubjectList component, just different entry points.

## Complete Workflow to Change Subject Status

1. Click "Subject Management" (sidebar)
2. Click "**View All Subjects**" button (on dashboard)
3. Select a study from dropdown
4. Click "View" button on a subject row
5. On SubjectDetails page, click "**Change Status**" button
6. Select new status and enter reason
7. Click Save

## Troubleshooting

### Issue: "I don't see the study dropdown"
**Solution**: You're on the Dashboard. Click the "View All Subjects" button.

### Issue: "I only see a dashboard with statistics"
**Solution**: That's correct! The dashboard is the landing page. Use the "View All Subjects" button to proceed.

### Issue: "The page looks different than expected"
**Check**: Are you on `/subject-management` (dashboard) or `/subject-management/subjects` (subject list)?

## Visual Flow

```
┌─────────────────────────────────────┐
│   Sidebar: Subject Management       │
│         (Click here first)          │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  SubjectManagementDashboard         │
│  ┌───────────────────────────────┐  │
│  │ Quick Stats (Total, Enrolled) │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🔵 View All Subjects          │◄─── CLICK THIS!
│  │ ⚪ Enroll New Subject         │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  SubjectList Page                   │
│  ┌───────────────────────────────┐  │
│  │ Select Study Protocol ▼       │◄─── Study Dropdown HERE!
│  │ [Select a Study Protocol]     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Subject Table                 │  │
│  │ View | Edit | Withdraw        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Summary

**The key insight**: The "Subject Management" sidebar link takes you to a **dashboard first**, not directly to the subject list. You need to **click "View All Subjects" button** on that dashboard to see the study dropdown and subject table.

This is intentional design - the dashboard provides an overview before diving into the details.
