# Feature 3: Comprehensive Form Validation - Testing Guide

**Feature**: Form Validation Rules from Database  
**Status**: ✅ **PRODUCTION READY** - Ready for User Acceptance Testing  
**Date**: October 15, 2025  
**Tester Instructions**: Complete all test cases below

---

## 📋 Quick Start

### How to Access the Feature
1. Start the backend service (if not already running)
2. Start the frontend application
3. Navigate to: **Clinical Operations → Subjects**
4. Select any subject
5. Click on any visit
6. Click "Start" on any form
7. **You are now in the form entry page with comprehensive validation**

### What You're Testing
- **Real-time validation** as you enter data
- **Inline error/warning messages** below fields
- **Visual feedback** (colored borders, icons)
- **Form save blocking** when errors exist
- **Data quality warnings** that don't block saves

---

## 🎯 Test Case 1: Required Field Validation

### Setup
1. Navigate to any form with required fields (marked with red asterisk *)
2. Leave a required field empty
3. Tab away from the field (onBlur)

### Expected Results
- ✅ Red border appears around the field
- ✅ Error icon (❌) displays below field
- ✅ Error message: "This field is required"
- ✅ Orange warning icon in field label area
- ✅ Field stays highlighted until data entered

### Test Variations
- [ ] Text field (required)
- [ ] Number field (required)
- [ ] Date field (required)
- [ ] Select dropdown (required)
- [ ] Radio button group (required)

### Pass Criteria
✅ All required fields show inline error when left empty  
✅ Error disappears immediately when valid data entered

---

## 🎯 Test Case 2: Email Validation

### Setup
1. Find an email field in the form
2. Enter invalid email: `notanemail`
3. Tab away from the field

### Expected Results
- ✅ Red border appears
- ✅ Error icon (❌) displays
- ✅ Error message: "Invalid email format"

### Test Variations
- [ ] No @ symbol: `testuser.com`
- [ ] No domain: `test@`
- [ ] Invalid characters: `test@@user.com`
- [ ] Valid email: `test@example.com` (should pass)

### Pass Criteria
✅ Invalid emails show error  
✅ Valid emails show no error

---

## 🎯 Test Case 3: Number Range Validation

### Setup
1. Find a number field with min/max values
2. Enter a value below minimum (e.g., -5 if min is 0)
3. Tab away

### Expected Results
- ✅ Red border appears
- ✅ Error message: "Value must be at least [min]"

### Test Variations
- [ ] Below minimum
- [ ] Above maximum
- [ ] Within range (should pass)
- [ ] Non-numeric value (should show type error)

### Pass Criteria
✅ Out-of-range values show error  
✅ In-range values show no error

---

## 🎯 Test Case 4: Data Quality Warnings

### Setup
1. Find a field with data quality ranges (e.g., Blood Pressure)
2. Enter a value outside normal range but within acceptable range
   - Example: Enter `95` for systolic BP (normal: 90-120, acceptable: 70-140)
3. Tab away

### Expected Results
- ✅ **Yellow border** appears (not red!)
- ✅ Warning icon (⚠️) displays
- ✅ Warning message: "Value is outside normal range (90-120)"
- ✅ Field shows as completed (green checkmark)
- ✅ Form can still be saved

### Test Variations
- [ ] Value in normal range (no warning)
- [ ] Value outside normal but in expected range (orange warning)
- [ ] Value outside expected but in possible range (orange warning)
- [ ] Value in critical range (red warning, but still saveable)

### Pass Criteria
✅ Warning displays with yellow border  
✅ Warning does NOT prevent saving  
✅ Warning is clearly distinguished from error

---

## 🎯 Test Case 5: String Length Validation

### Setup
1. Find a text field with length restrictions
2. Enter text shorter than minimum (e.g., "Hi" if min is 5)
3. Tab away

### Expected Results
- ✅ Red border appears
- ✅ Error message: "Must be at least 5 characters"

### Test Variations
- [ ] Too short
- [ ] Too long
- [ ] Exactly minimum length (should pass)
- [ ] Exactly maximum length (should pass)

### Pass Criteria
✅ Invalid lengths show error  
✅ Valid lengths show no error

---

## 🎯 Test Case 6: Pattern Validation (Regex)

### Setup
1. Find a field with pattern requirements (e.g., Subject ID: ABC-1234)
2. Enter invalid pattern: `123-ABC`
3. Tab away

### Expected Results
- ✅ Red border appears
- ✅ Error message: "Value does not match required pattern"

### Test Variations
- [ ] Wrong format
- [ ] Correct format (should pass)
- [ ] Case sensitivity (if applicable)

### Pass Criteria
✅ Invalid patterns show error  
✅ Valid patterns show no error

---

## 🎯 Test Case 7: Conditional Validation

### Setup
1. Find a field pair with conditional rules (e.g., Pregnant → Due Date required)
2. Select trigger value (e.g., "Yes" for Pregnant)
3. Leave dependent field (Due Date) empty
4. Tab away

### Expected Results
- ✅ Due Date field shows required error
- ✅ Error message: "This field is required"

### Test Variations
- [ ] Trigger active, dependent empty (error)
- [ ] Trigger active, dependent filled (no error)
- [ ] Trigger inactive, dependent empty (no error)
- [ ] Trigger changes from active to inactive (error disappears)

### Pass Criteria
✅ Dependent field becomes required when trigger active  
✅ Dependent field not required when trigger inactive

---

## 🎯 Test Case 8: Cross-Field Validation

### Setup
1. Find related fields (e.g., Start Date and End Date)
2. Enter End Date before Start Date
3. Tab away from End Date field

### Expected Results
- ✅ Red border on End Date field
- ✅ Error message: "End date must be after start date"

### Test Variations
- [ ] End before start (error)
- [ ] End same as start (depends on rule)
- [ ] End after start (no error)

### Pass Criteria
✅ Invalid relationships show error  
✅ Valid relationships show no error

---

## 🎯 Test Case 9: Form-Level Validation (Save Blocking)

### Setup
1. Fill out a form with some errors
2. Click "Save as Incomplete" or "Mark as Complete"

### Expected Results
- ✅ Save is blocked
- ✅ Error summary displays at top (ValidationErrors component)
- ✅ All fields with errors remain highlighted
- ✅ User stays on form page

### Test Variations
- [ ] Multiple errors across different fields
- [ ] Only warnings (save should succeed)
- [ ] Mix of errors and warnings (save blocked)
- [ ] Fix all errors then save (should succeed)

### Pass Criteria
✅ Form cannot be saved with errors  
✅ Form CAN be saved with only warnings  
✅ All errors clearly visible

---

## 🎯 Test Case 10: Visual Feedback

### Setup
1. Interact with various fields
2. Observe visual changes

### Expected Results - Error State
- ✅ **Red border** around field
- ✅ **Red error icon** (❌) below field
- ✅ **Red text** for error message
- ✅ **Focus ring** is red when field selected

### Expected Results - Warning State
- ✅ **Yellow/orange border** around field
- ✅ **Orange warning icon** (⚠️) below field
- ✅ **Orange text** for warning message
- ✅ **Field still shows completed** (green checkmark in label)

### Expected Results - Valid State
- ✅ **Gray border** around field
- ✅ **No error/warning icons**
- ✅ **Green checkmark** in label (if completed)
- ✅ **Green "Completed" badge** appears

### Pass Criteria
✅ Visual states are clearly distinguishable  
✅ Color coding is consistent  
✅ Icons reinforce status

---

## 🎯 Test Case 11: Multiple Errors on One Field

### Setup
1. Find a field with multiple validation rules
2. Violate multiple rules (e.g., required + invalid format)
3. Tab away

### Expected Results
- ✅ All applicable errors display
- ✅ Errors stack vertically below field
- ✅ Each error has its own icon and message

### Pass Criteria
✅ All errors visible simultaneously  
✅ Errors don't overlap or hide each other

---

## 🎯 Test Case 12: Error Recovery

### Setup
1. Trigger an error on a field
2. Fix the error (enter valid data)
3. Tab away

### Expected Results
- ✅ Red border changes to gray immediately
- ✅ Error message disappears immediately
- ✅ Error icon disappears
- ✅ Green checkmark appears (if field now completed)

### Pass Criteria
✅ Errors clear instantly when fixed  
✅ No lingering visual artifacts

---

## 🎯 Test Case 13: Progress Tracking Integration

### Setup
1. Fill out form partially
2. Observe completion indicators

### Expected Results
- ✅ **Progress bar** updates as fields completed
- ✅ **Completion percentage** calculates correctly
- ✅ **Field count** updates (e.g., "3 of 8 fields completed")
- ✅ **Required fields count** shown separately
- ✅ Fields with errors do NOT count as completed

### Pass Criteria
✅ Progress tracking works with validation  
✅ Only truly valid fields count as complete

---

## 🎯 Test Case 14: Custom Validation Rules

### Setup
1. Find a field with custom business rules (e.g., "Age must be over 18")
2. Enter invalid value (e.g., 15)
3. Tab away

### Expected Results
- ✅ Red border appears
- ✅ Custom error message displays
- ✅ Message matches business rule

### Pass Criteria
✅ Custom rules execute correctly  
✅ Custom messages display properly

---

## 🎯 Test Case 15: Edge Cases

### Test Variations

#### A. Load Existing Data
- [ ] Load form with existing saved data
- [ ] No errors display on initial load (unless data invalid)
- [ ] Validation only triggers on user interaction

#### B. Navigate Away and Back
- [ ] Fill form partially with errors
- [ ] Navigate to different page
- [ ] Return to form
- [ ] Errors persist correctly

#### C. Multiple Forms
- [ ] Open multiple forms in different tabs
- [ ] Validation works independently in each
- [ ] No cross-contamination of errors

#### D. Rapid Input
- [ ] Type quickly in multiple fields
- [ ] Tab rapidly through fields
- [ ] Validation keeps up, no lag
- [ ] No errors display prematurely

### Pass Criteria
✅ System handles edge cases gracefully  
✅ No errors or crashes  
✅ User experience remains smooth

---

## 📊 Test Summary Checklist

### Core Functionality (Must Pass)
- [ ] Required field validation works
- [ ] Type validation works (email, phone, date, etc.)
- [ ] Range validation works (numbers, dates)
- [ ] Form save blocked when errors exist
- [ ] Form save allowed when only warnings exist

### Visual Feedback (Must Pass)
- [ ] Red borders for errors
- [ ] Yellow borders for warnings
- [ ] Icons display correctly (❌ for errors, ⚠️ for warnings)
- [ ] Error messages are clear and helpful
- [ ] Visual states clearly distinguishable

### Advanced Features (Should Pass)
- [ ] Conditional validation works
- [ ] Cross-field validation works
- [ ] Data quality warnings work
- [ ] Custom rules execute
- [ ] Pattern matching works

### User Experience (Should Pass)
- [ ] Real-time feedback (onBlur)
- [ ] Errors clear when fixed
- [ ] Multiple errors display correctly
- [ ] Progress tracking integrates properly
- [ ] No performance issues

### Integration (Should Pass)
- [ ] Works with existing Features 1 & 2
- [ ] Progress indicators still work
- [ ] Field completion tracking still works
- [ ] Backend saves correctly
- [ ] Audit trail maintained

---

## 🐛 Bug Reporting Template

If you find an issue, please report using this format:

```markdown
### Bug Report

**Test Case**: [Test Case Number and Name]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots if applicable]

**Browser**: [Chrome/Firefox/Safari/Edge]
**Date**: [Date of testing]
**Tester**: [Your name]

**Severity**: [Critical/High/Medium/Low]
- Critical: Feature broken, cannot proceed
- High: Major functionality impaired
- Medium: Minor functionality issue
- Low: Cosmetic or nice-to-have

**Additional Notes**:
[Any other relevant information]
```

---

## ✅ Sign-Off

### Testing Completed By
- **Tester Name**: _______________
- **Date**: _______________
- **Total Test Cases**: 15
- **Passed**: ___ / 15
- **Failed**: ___ / 15
- **Blocked**: ___ / 15

### Overall Assessment
- [ ] **PASS** - All critical tests passed, ready for production
- [ ] **PASS WITH MINOR ISSUES** - Ready for production, non-critical bugs noted
- [ ] **FAIL** - Critical issues found, requires fixes before production

### Recommendation
- [ ] Approve for production deployment
- [ ] Approve with noted issues to be fixed in next release
- [ ] Require fixes before deployment

### Comments
```
[Your overall assessment and any additional feedback]
```

---

## 📚 Additional Resources

- **Implementation Details**: `FEATURE_3_FORMENTRY_INTEGRATION_COMPLETE.md`
- **Visual Reference**: `FORMENTRY_VISUAL_REFERENCE.md`
- **Schema Documentation**: `FORM_FIELD_METADATA_SCHEMA.md`
- **Executive Summary**: `FEATURE_3_EXECUTIVE_SUMMARY.md`
- **Quick Reference**: `SCHEMA_IMPLEMENTATION_QUICK_REFERENCE.md`

---

## 🆘 Need Help?

**Issue**: Validation not triggering  
**Solution**: Make sure you're tabbing away from the field (onBlur). Validation triggers when focus leaves the field.

**Issue**: Form still saves with errors  
**Solution**: Check that errors are actually errors (red), not warnings (yellow). Warnings don't block saves.

**Issue**: Can't find test fields  
**Solution**: Use the CRF Builder to create test forms with various validation rules, or use existing clinical forms.

**Issue**: Backend not responding  
**Solution**: Verify backend service is running. Check console for API errors.

---

**Status**: ✅ **READY FOR TESTING**  
**Feature**: Form Validation Rules from Database  
**Implementation**: 100% Complete  
**Documentation**: Complete  
**Testing**: Pending User Acceptance

**Let's ensure this feature meets all quality standards before production! 🚀**
