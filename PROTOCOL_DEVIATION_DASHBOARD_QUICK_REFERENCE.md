# Protocol Deviation Dashboard - Quick Access Guide

## 🎯 Quick Links

### Access the Dashboard
**URL**: `http://localhost:3000/datacapture/deviations/dashboard`

**Production**: `https://[your-domain]/datacapture/deviations/dashboard`

---

## 🚦 Testing Checklist (Priority Order)

### ✅ Step 1: Auto-Flag Visit Window Violation
1. Navigate to patient details: `/datacapture/subjects/{subjectId}`
2. Find a visit with a defined window (e.g., Day 7, window Day 5-9)
3. Start the visit
4. Complete all required forms
5. **IMPORTANT**: Set visit date OUTSIDE window (e.g., Day 12)
6. Submit all forms
7. **Expected**: Deviation auto-created and displayed in "Protocol Deviations" section

### ✅ Step 2: View Dashboard
1. Navigate to `/datacapture/deviations/dashboard`
2. Verify metrics display correctly:
   - Total deviations count
   - Critical/Major/Minor breakdown
   - Requires reporting count
3. Verify auto-created deviation appears in table

### ✅ Step 3: Test Filters
1. Filter by Severity = CRITICAL (if you have critical deviations)
2. Filter by Type = VISIT_WINDOW
3. Filter by Status = OPEN
4. Verify table updates correctly

### ✅ Step 4: Test Export
1. Click "Export CSV" button
2. Verify CSV downloads
3. Open CSV and check data

### ✅ Step 5: Test Drill-Down
1. Click "View" button on a deviation
2. Verify navigation to patient's SubjectDetails page
3. Verify deviation details match

---

## 🔍 Severity Test Cases

Test these scenarios to verify auto-calculation:

| Visit Window | Actual Date | Expected Severity | Days Overdue |
|--------------|-------------|-------------------|--------------|
| Day 5-9      | Day 11      | MINOR             | +2           |
| Day 5-9      | Day 12      | MAJOR             | +3           |
| Day 5-9      | Day 17      | CRITICAL          | +8           |
| Day 5-9      | Day 3       | MINOR             | -2           |
| Day 5-9      | Day 2       | MAJOR             | -3           |

---

## 📊 Dashboard Features

### Metrics Cards
- **Total Deviations**: Count of all deviations in study
- **Critical**: Red border, critical severity count
- **Major**: Yellow border, major severity count
- **Minor**: Blue border, minor severity count
- **Requires Reporting**: Count needing sponsor/IRB notification
- **Deviation Types**: Chips showing type distribution

### Filters
- **Severity**: ALL, CRITICAL, MAJOR, MINOR
- **Type**: ALL, VISIT_WINDOW, PROTOCOL_PROCEDURE, etc.
- **Status**: ALL, OPEN, UNDER_REVIEW, RESOLVED, CLOSED
- **Date Range**: Start date and end date
- **Reporting**: ALL, Requires Reporting only

### Actions
- **Refresh**: Reload data from server
- **Export CSV**: Download filtered deviations
- **View**: Navigate to patient details

---

## 🐛 Troubleshooting

### Dashboard is blank
- Check that study has deviations (test auto-flag first)
- Check browser console for errors
- Verify backend service is running

### Auto-flag not working
- Verify visit has window dates (visitWindowStart, visitWindowEnd)
- Verify visit completed with date OUTSIDE window
- Check backend logs for errors in VisitProjector

### Filters not working
- Backend must support query parameters
- Check browser network tab for API calls
- Verify query params are being sent correctly

### Export CSV fails
- Check browser console for errors
- Verify deviations array has data
- Try filtering to smaller dataset

---

## 📝 Testing Notes Template

Use this template to document your testing:

```
## Test Date: [DATE]

### Test 1: Auto-Flag Visit Window Violation
- Patient ID: ________
- Visit: ________
- Visit Window: Day ___ to Day ___
- Actual Visit Date: Day ___
- Expected Severity: ________
- **Result**: ✅ PASS / ❌ FAIL
- **Notes**: ___________________________

### Test 2: Dashboard Metrics
- Total Deviations: ___ (Expected: ___)
- Critical: ___ (Expected: ___)
- Major: ___ (Expected: ___)
- Minor: ___ (Expected: ___)
- **Result**: ✅ PASS / ❌ FAIL
- **Notes**: ___________________________

### Test 3: Filters
- Severity filter: ✅ PASS / ❌ FAIL
- Type filter: ✅ PASS / ❌ FAIL
- Status filter: ✅ PASS / ❌ FAIL
- Date range filter: ✅ PASS / ❌ FAIL
- **Notes**: ___________________________

### Test 4: Export CSV
- File downloaded: ✅ YES / ❌ NO
- Data correct: ✅ YES / ❌ NO
- **Notes**: ___________________________

### Test 5: Drill-Down
- Navigation works: ✅ PASS / ❌ FAIL
- Deviation details match: ✅ PASS / ❌ FAIL
- **Notes**: ___________________________

### Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

### Overall Result
✅ READY FOR PRODUCTION / ❌ NEEDS FIXES
```

---

## 🎉 Implementation Complete

**Status**: READY FOR TESTING

**Files Modified**:
- Backend: `VisitProjector.java` (+92 lines)
- Frontend: `DeviationDashboard.jsx` (586 lines, new)
- Frontend: `ProtocolDeviationService.js` (+30 lines)
- Frontend: `DataCaptureModule.jsx` (+2 lines)

**No Compilation Errors**: All files verified ✅

---

## 📚 Documentation References

- [PROTOCOL_DEVIATION_AUTO_FLAG_COMPLETE.md](./PROTOCOL_DEVIATION_AUTO_FLAG_COMPLETE.md) - Complete implementation details
- [PROTOCOL_DEVIATION_BACKEND_COMPLETE.md](./PROTOCOL_DEVIATION_BACKEND_COMPLETE.md) - Backend API reference
- [PROTOCOL_DEVIATION_FRONTEND_IMPLEMENTATION.md](./PROTOCOL_DEVIATION_FRONTEND_IMPLEMENTATION.md) - Frontend components guide

---

*Quick Reference Version: 1.0*  
*Last Updated: October 2025*
