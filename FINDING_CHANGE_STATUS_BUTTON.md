# 🔍 Finding the "Change Status" Button - Quick Guide

**Date:** October 12, 2025  
**Issue:** Cannot find the "Change Status" button  
**Solution:** Step-by-step navigation guide

---

## 📍 How to Access the Change Status Feature

### **Method 1: Via Subject Details Page (MAIN METHOD)**

#### Step-by-Step:

1. **Navigate to Subject Management**
   - URL: `http://localhost:3000/subject-management`
   - Or click "Subject Management" in the sidebar

2. **Select a Study**
   - At the top of the page, you'll see a dropdown: "Select Study to View Subjects"
   - Choose a study (must be PUBLISHED, APPROVED, or ACTIVE status)

3. **Find Your Subject in the List**
   - You'll see a table with columns: Screening #, Patient #, Status, Study Arm, Site, Actions
   - Find the subject you want to update

4. **Click the "View" Link**
   - In the "Actions" column, click the blue **"View"** link
   - This navigates to: `/datacapture-management/subjects/{id}`

5. **Look at the Top Right of the Page**
   - You should see THREE elements in a row:
     1. **Status Badge** (showing current status like "Registered")
     2. **"Change Status" button** (gray button)
     3. **"View History" button** (blue button)

6. **Click "Change Status"**
   - A modal will pop up
   - Select new status from dropdown
   - Enter reason (required, min 10 characters)
   - Add optional notes
   - Click "Change Status" to save

---

### **Method 2: Via Subject List Page (Alternative)**

If the "Change Status" button is not showing up on the Subject Details page, you can use the **"Withdraw" button** from the list:

1. **Go to Subject Management** (`/subject-management`)
2. **Select a Study** from dropdown
3. **Find Subject in List**
4. **In Actions Column:**
   - **View** (takes you to details)
   - **Edit** (not fully implemented yet)
   - **Withdraw** ← **USE THIS FOR STATUS CHANGES**

5. **Click "Withdraw"**
   - This opens the same StatusChangeModal
   - It pre-selects "WITHDRAWN" but you can change to any valid status
   - Enter reason and notes
   - Save

---

## 🐛 Troubleshooting: Button Not Showing?

### **Issue 1: Wrong URL Path**
The Subject Details component is at `/datacapture-management/subjects/{id}`, NOT `/subject-management/subjects/{id}`

**Check your browser URL:**
- ✅ Correct: `http://localhost:3000/datacapture-management/subjects/123`
- ❌ Wrong: `http://localhost:3000/subject-management/subjects/123`

### **Issue 2: Frontend Not Reloaded**
After implementing Tasks 1, 2, 3, you need to restart the frontend:

```powershell
# In frontend directory
cd frontend/clinprecision
npm start
```

Or if already running, do a hard refresh:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### **Issue 3: Components Not Imported**
Check browser console (F12) for errors like:
```
Cannot find module '../subjectmanagement/components/PatientStatusBadge'
```

If you see this, the components might not be in the right location.

### **Issue 4: Subject Has No Status**
If `subject.status` is null or undefined, the button might not render properly.

**Check in browser console:**
```javascript
// Open browser DevTools (F12)
// Go to Console tab
// Type:
console.log(subject);
// Look for the 'status' field
```

---

## 🎥 Visual Guide: Where to Find the Button

### **Subject List Page:**
```
┌─────────────────────────────────────────────────────────────┐
│ Subject Management                                          │
│                                                             │
│ ┌──────────────────────────────────────────┐               │
│ │ Select Study to View Subjects  ▼         │               │
│ └──────────────────────────────────────────┘               │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Screening # │ Patient # │ Status    │ ... │ Actions  │  │
│ ├─────────────┼───────────┼───────────┼─────┼──────────┤  │
│ │ SCR-001     │ PT-001    │ Registered│ ... │ View     │  │ ← Click here
│ │             │           │           │     │ Edit     │  │
│ │             │           │           │     │ Withdraw │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **Subject Details Page (After Clicking View):**
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Subject Management                                    │
│                                                                 │
│ Subject Details: SCR-001                                        │
│                                                                 │
│ ┌──────────┐  ┌──────────────┐  ┌─────────────┐               │
│ │Registered│  │Change Status │  │View History │               │ ← THESE BUTTONS
│ └──────────┘  └──────────────┘  └─────────────┘               │
│  Status Badge      ^                  ^                        │
│                    │                  │                        │
│               CLICK HERE       Or click here for audit trail   │
│                                                                 │
│ ┌──────────────────────────────────────┐                       │
│ │ Subject Information                  │                       │
│ │ Name: John Doe                       │                       │
│ │ Email: john@example.com              │                       │
│ └──────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Quick Test

### **Verify Implementation:**

1. **Check if file exists:**
   ```powershell
   ls frontend/clinprecision/src/components/modules/datacapture/SubjectDetails.jsx
   ```

2. **Check if components exist:**
   ```powershell
   ls frontend/clinprecision/src/components/modules/subjectmanagement/components/PatientStatusBadge.jsx
   ls frontend/clinprecision/src/components/modules/subjectmanagement/components/StatusChangeModal.jsx
   ls frontend/clinprecision/src/components/modules/subjectmanagement/components/StatusHistoryTimeline.jsx
   ```

3. **Verify imports in SubjectDetails.jsx:**
   - Open the file
   - Lines 4-6 should have:
   ```jsx
   import PatientStatusBadge from '../subjectmanagement/components/PatientStatusBadge';
   import StatusChangeModal from '../subjectmanagement/components/StatusChangeModal';
   import StatusHistoryTimeline from '../subjectmanagement/components/StatusHistoryTimeline';
   ```

4. **Verify button code (around line 94-99):**
   ```jsx
   <button
       onClick={() => setShowStatusModal(true)}
       className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
   >
       Change Status
   </button>
   ```

---

## 🎯 Alternative: Use Withdraw Button

If you still can't find the "Change Status" button, use this workaround:

### **From Subject List:**
1. Find subject in list
2. Click **"Withdraw"** button (red text)
3. In the modal that opens:
   - **Change the status dropdown** from "WITHDRAWN" to whatever you want (SCREENING, ENROLLED, ACTIVE, etc.)
   - Enter reason
   - Save

**This works because the Withdraw button opens the same StatusChangeModal!**

---

## 📞 Still Can't Find It?

### **Take a Screenshot:**
1. Navigate to Subject List page
2. Select a study
3. Click "View" on any subject
4. Take screenshot of the entire page
5. Check if you see the three buttons at the top right

### **Check Browser Console:**
```javascript
// Press F12 to open DevTools
// Go to Console tab
// Look for any red error messages
// Common errors:
// - "Cannot find module ..."
// - "TypeError: ... is undefined"
// - "Failed to fetch ..."
```

### **Verify Frontend is Running:**
```powershell
# Should see something like:
# Compiled successfully!
# webpack compiled with 0 errors
# On Your Network:  http://192.168.1.100:3000
```

---

## 🚀 Quick Fix Commands

If the button is missing due to code not being updated:

```powershell
# 1. Stop frontend (Ctrl+C if running)

# 2. Clear cache and rebuild
cd frontend/clinprecision
rm -rf node_modules/.cache
npm start

# 3. Hard refresh browser
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

---

## ✅ Expected Behavior

When everything is working correctly:

1. **Navigate to:** Subject List → Select Study → Click "View" on a subject
2. **You should see:**
   - Page title: "Subject Details: SCR-001"
   - Top right corner: Status badge + 2 buttons
   - Button 1: "Change Status" (gray, hover effect)
   - Button 2: "View History" (blue outline)
3. **Click "Change Status":**
   - Modal appears with form
   - Dropdown shows valid status transitions
   - Reason field (required)
   - Notes field (optional)
   - "Change Status" and "Cancel" buttons

---

## 📋 Checklist

- [ ] Frontend server is running (`npm start` in frontend/clinprecision)
- [ ] Browser URL is `/datacapture-management/subjects/{id}` (not `/subject-management/...`)
- [ ] Hard refresh done (Ctrl + Shift + R)
- [ ] No console errors (F12 → Console tab)
- [ ] SubjectDetails.jsx has the button code (lines 94-99)
- [ ] All three components exist (PatientStatusBadge, StatusChangeModal, StatusHistoryTimeline)
- [ ] Subject has a valid status field

---

**If all else fails:** Use the **"Withdraw"** button from Subject List as a temporary workaround - it opens the same modal!
