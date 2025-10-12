# CRF Builder Export Tab - Testing Guide

**Date**: October 12, 2025  
**Feature**: Phase 6F Enhancement - Export Tab  
**Component**: CRFBuilderIntegration.jsx  
**Status**: ✅ Ready for Testing

---

## 🎯 Feature Overview

The CRF Builder has been enhanced with a 7th "Export" tab that allows users to export field metadata in multiple formats (JSON, CSV, Excel) for regulatory submissions and documentation.

**Location**: CRF Builder → Field Metadata Panel → Export Tab

---

## 🧪 Test Scenarios

### Test 1: Access Export Tab

**Steps**:
1. Navigate to CRF Builder (Form Designer)
2. Add or select a field
3. Click "⚙️ Metadata" button on the field
4. Metadata panel opens with 7 tabs
5. Click on "Export 📤" tab

**Expected Result**:
- ✅ Export tab is visible in the metadata panel
- ✅ Export tab displays export options
- ✅ Tab switches correctly from other tabs

**Status**: ⏳ Pending

---

### Test 2: Export Field Metadata as JSON

**Steps**:
1. Open metadata panel for a field (e.g., "Subject ID")
2. Navigate to "Export" tab
3. Click "📄 JSON" button

**Expected Result**:
- ✅ JSON file downloads automatically
- ✅ Filename: `{fieldName}_metadata.json` (e.g., `subject_id_metadata.json`)
- ✅ JSON file is properly formatted (2-space indentation)
- ✅ JSON contains all metadata sections:
  - fieldName
  - fieldLabel
  - fieldType
  - required
  - description
  - helpText
  - clinicalMetadata (sdvRequired, medicalReview, cdashMapping, sdtmMapping, medicalCoding, dataQuality, regulatoryMetadata)
  - validation

**Sample Output**:
```json
{
  "fieldName": "subject_id",
  "fieldLabel": "Subject ID",
  "fieldType": "text",
  "required": true,
  "description": "Unique subject identifier",
  "helpText": "Enter the subject ID as assigned during enrollment",
  "clinicalMetadata": {
    "sdvRequired": true,
    "medicalReview": false,
    "cdashMapping": {
      "domain": "DM",
      "variable": "USUBJID",
      "core": "Required"
    },
    "sdtmMapping": {
      "domain": "DM",
      "variable": "USUBJID",
      "dataType": "Char"
    },
    ...
  },
  "validation": {}
}
```

**Status**: ⏳ Pending

---

### Test 3: Export Field Metadata as CSV

**Steps**:
1. Open metadata panel for a field with CDASH/SDTM mappings configured
2. Navigate to "Export" tab
3. Click "📑 CSV" button

**Expected Result**:
- ✅ CSV file downloads automatically
- ✅ Filename: `{fieldName}_metadata.csv`
- ✅ CSV has 9 columns: Field Name, Field Label, Type, Required, SDV, Medical Review, CDASH Domain, SDTM Domain, Medical Coding
- ✅ Values are properly quoted
- ✅ Opens correctly in Excel/Google Sheets

**Sample Output**:
```csv
"Field Name","Field Label","Type","Required","SDV","Medical Review","CDASH Domain","SDTM Domain","Medical Coding"
"subject_id","Subject ID","text","Yes","Yes","No","DM","DM","No"
```

**Status**: ⏳ Pending

---

### Test 4: Export Field Metadata as Excel

**Steps**:
1. Open metadata panel for a field
2. Navigate to "Export" tab
3. Click "📊 Excel" button

**Expected Result**:
- ✅ CSV file downloads (Excel-compatible format)
- ✅ Filename: `{fieldName}_metadata.csv`
- ✅ File opens correctly in Microsoft Excel
- ✅ Data is properly formatted in columns

**Status**: ⏳ Pending

---

### Test 5: View Metadata Summary

**Steps**:
1. Configure a field with comprehensive metadata:
   - Set SDV Required = true
   - Set Medical Coding = MedDRA required
   - Set CDASH Domain = "AE"
   - Set SDTM Domain = "AE"
2. Open Export tab

**Expected Result**:
- ✅ Metadata Summary card displays correctly
- ✅ Shows: Field Name (in monospace font)
- ✅ Shows: Type
- ✅ Shows: SDV Required (Yes in green / No in gray)
- ✅ Shows: Medical Coding (Required in green / Not Required in gray)
- ✅ Shows: CDASH Domain (in monospace font)
- ✅ Shows: SDTM Domain (in monospace font)

**Status**: ⏳ Pending

---

### Test 6: Export Options Checkboxes

**Steps**:
1. Open Export tab
2. Locate "Export Options" section
3. Verify checkboxes

**Expected Result**:
- ✅ 4 checkboxes visible:
  - ☑ Include CDASH/SDTM mappings (checked by default)
  - ☑ Include medical coding configuration (checked by default)
  - ☑ Include validation rules (checked by default)
  - ☐ Include regulatory requirements (unchecked by default)
- ✅ Checkboxes are functional (can check/uncheck)

**Note**: Currently these checkboxes are UI-only. Future enhancement will filter export data based on selections.

**Status**: ⏳ Pending

---

### Test 7: Bulk Export - All Fields in Section

**Steps**:
1. Create a form section with multiple fields (e.g., "Demographics")
2. Configure metadata for several fields:
   - Field 1: subject_id (SDV required, CDASH/SDTM = DM)
   - Field 2: birth_date (FDA required, CDASH/SDTM = DM)
   - Field 3: gender (EMA required, CDASH/SDTM = DM)
3. Open any field's metadata panel
4. Go to Export tab
5. Click "📦 Export All Fields in This Section"

**Expected Result**:
- ✅ CSV file downloads automatically
- ✅ Filename: `{sectionTitle}_all_fields_metadata.csv` (e.g., `Demographics_all_fields_metadata.csv`)
- ✅ CSV has 13 columns:
  - Field Name
  - Field Label
  - Type
  - Required
  - SDV
  - Medical Review
  - CDASH Domain
  - CDASH Variable
  - SDTM Domain
  - SDTM Variable
  - Medical Coding
  - FDA
  - EMA
- ✅ All fields in the section are included
- ✅ Each field is on a separate row

**Sample Output**:
```csv
"Field Name","Field Label","Type","Required","SDV","Medical Review","CDASH Domain","CDASH Variable","SDTM Domain","SDTM Variable","Medical Coding","FDA","EMA"
"subject_id","Subject ID","text","Yes","Yes","No","DM","USUBJID","DM","USUBJID","No","No","No"
"birth_date","Date of Birth","date","Yes","No","No","DM","BRTHDTC","DM","BRTHDTC","No","Yes","No"
"gender","Gender","select","Yes","No","No","DM","SEX","DM","SEX","No","No","Yes"
```

**Status**: ⏳ Pending

---

### Test 8: Empty Field (No Metadata Configured)

**Steps**:
1. Create a new field
2. Do NOT configure any metadata (leave defaults)
3. Open metadata panel → Export tab
4. Export as JSON

**Expected Result**:
- ✅ JSON file downloads
- ✅ JSON contains empty/default values:
  ```json
  {
    "fieldName": "new_field",
    "fieldLabel": "New Field",
    "fieldType": "text",
    "required": false,
    "clinicalMetadata": {
      "sdvRequired": false,
      "medicalReview": false,
      "cdashMapping": {},
      "sdtmMapping": {},
      "medicalCoding": {},
      "dataQuality": {},
      "regulatoryMetadata": {}
    },
    "validation": {}
  }
  ```
- ✅ No errors in console

**Status**: ⏳ Pending

---

### Test 9: Field with Special Characters in Name

**Steps**:
1. Create a field with special characters in name: `ae_term_(verbatim)`
2. Configure some metadata
3. Export as JSON

**Expected Result**:
- ✅ Filename is sanitized for download: `ae_term_(verbatim)_metadata.json`
- ✅ File downloads correctly
- ✅ JSON contains original field name with special characters

**Status**: ⏳ Pending

---

### Test 10: Quick Export Buttons Hover State

**Steps**:
1. Open Export tab
2. Hover over each quick export button (JSON, Excel, CSV)

**Expected Result**:
- ✅ JSON button: Border changes to blue, background to light blue
- ✅ Excel button: Border changes to green, background to light green
- ✅ CSV button: Border changes to purple, background to light purple
- ✅ Smooth transition animation

**Status**: ⏳ Pending

---

### Test 11: Integration with Existing Metadata Tabs

**Steps**:
1. Open metadata panel
2. Configure metadata in "Basic" tab
3. Switch to "Clinical Flags" tab and configure
4. Switch to "CDASH/SDTM" tab and configure
5. Switch to "Export" tab
6. Export as JSON
7. Verify exported JSON contains all configured metadata

**Expected Result**:
- ✅ All metadata from all tabs is included in export
- ✅ No data loss when switching between tabs
- ✅ Exported data matches configured values

**Status**: ⏳ Pending

---

### Test 12: Multiple Fields in Different Sections

**Steps**:
1. Create 2 sections: "Demographics" and "Adverse Events"
2. Add 3 fields in Demographics
3. Add 5 fields in Adverse Events
4. Configure metadata for all fields
5. Export "Demographics" section (bulk export)
6. Export "Adverse Events" section (bulk export)

**Expected Result**:
- ✅ Two separate CSV files generated
- ✅ Demographics CSV contains only 3 fields
- ✅ Adverse Events CSV contains only 5 fields
- ✅ No cross-contamination between sections

**Status**: ⏳ Pending

---

## 🐛 Edge Cases to Test

### Edge Case 1: Field Without Name/ID

**Steps**:
1. Create field with empty name
2. Try to export

**Expected Result**:
- ✅ Uses field.id as fallback
- ✅ No JavaScript errors

**Status**: ⏳ Pending

---

### Edge Case 2: Section With No Fields

**Steps**:
1. Create empty section
2. Click bulk export for that section

**Expected Result**:
- ✅ CSV generated with headers only
- ✅ Or: Show user-friendly message "No fields to export"

**Status**: ⏳ Pending

---

### Edge Case 3: Very Long Field Names

**Steps**:
1. Create field with 100+ character name
2. Export as JSON

**Expected Result**:
- ✅ Filename is truncated or sanitized
- ✅ File downloads successfully

**Status**: ⏳ Pending

---

### Edge Case 4: Special Characters in Metadata Values

**Steps**:
1. Configure field with metadata containing:
   - Quotes in description: `This is a "special" field`
   - Commas in help text: `Enter value, then click save`
   - Newlines in comments
2. Export as CSV

**Expected Result**:
- ✅ CSV properly escapes special characters
- ✅ File opens correctly in Excel
- ✅ No data corruption

**Status**: ⏳ Pending

---

## 📊 Browser Compatibility

Test export functionality in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

**Expected**: Export works in all browsers

---

## 🔍 Console Errors Check

During all tests, monitor browser console for:
- ❌ No JavaScript errors
- ❌ No React warnings
- ❌ No network errors

---

## 📋 Regression Testing

Ensure existing functionality still works:
- [ ] All 6 existing metadata tabs work correctly
- [ ] Field metadata saves correctly
- [ ] Form saves with metadata
- [ ] Form loads with saved metadata
- [ ] CRF Builder basic functionality (add/remove fields)

---

## ✅ Success Criteria

- [ ] All 12 test scenarios pass
- [ ] All 4 edge cases handled gracefully
- [ ] Works in all 4 major browsers
- [ ] No console errors
- [ ] No regression issues
- [ ] Export files open correctly in Excel/text editors

---

## 🚀 Testing Timeline

| Task | Duration | Assignee | Status |
|------|----------|----------|--------|
| Unit Tests | 2 hours | QA | ⏳ Pending |
| Integration Tests | 2 hours | QA | ⏳ Pending |
| Edge Case Tests | 1 hour | QA | ⏳ Pending |
| Browser Compatibility | 1 hour | QA | ⏳ Pending |
| Regression Testing | 1 hour | QA | ⏳ Pending |
| **Total** | **7 hours** | | |

**Target Completion**: October 15, 2025

---

## 📝 Bug Reporting Template

If issues found, report using this template:

```markdown
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Test Scenario**: Test #X - [Name]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Screenshots**: [Attach screenshots]

**Browser**: [Chrome/Firefox/Edge/Safari version]

**Console Errors**: [Copy any console errors]

**Additional Notes**: [Any other relevant information]
```

---

## 📞 Contact

**Developer**: AI Assistant  
**QA Lead**: _TBD_  
**Product Owner**: _TBD_

---

**Status**: 📋 **READY FOR QA**  
**Last Updated**: October 12, 2025
