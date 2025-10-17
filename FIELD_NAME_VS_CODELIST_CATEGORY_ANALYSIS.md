# Field Name vs Code List Category - Architecture Analysis

**Date:** October 17, 2025  
**Issue:** Dropdown has no values - potential field name/category mismatch  
**Status:** 🔍 INVESTIGATION

---

## 🎯 Your Critical Question

> "During form design we are asking the fieldname for the field type 'select, multi-select, checkbox-group'. Question is shouldn't the fieldname be same as codelist category? This is just clarification. Do you think this issue of rendering dropdown could be related to that?"

**Short Answer:** **NO, field name and code list category are intentionally SEPARATE** - but your question reveals a potential **user confusion** that could lead to misconfiguration.

---

## 🏗️ Current Architecture

### Field Name vs Code List Category

| Concept | Purpose | Example | Stored Where |
|---------|---------|---------|--------------|
| **Field Name (Field ID)** | Unique identifier for the field in the form | `patient_country`, `country_of_birth`, `site_country` | `field.id` |
| **Code List Category** | Central repository of values to populate dropdown | `COUNTRY` | `field.metadata.codeListCategory` |

### Why They're Different

**Multiple fields can use the SAME code list:**

```json
// Form Definition with 3 different fields using SAME code list

{
  "fields": [
    {
      "id": "patient_country",           // ← Field Name (unique)
      "type": "select",
      "label": "Patient Country of Residence",
      "metadata": {
        "codeListCategory": "COUNTRY"    // ← Code List (reusable)
      }
    },
    {
      "id": "birth_country",             // ← Field Name (unique)
      "type": "select",
      "label": "Country of Birth",
      "metadata": {
        "codeListCategory": "COUNTRY"    // ← Same code list!
      }
    },
    {
      "id": "site_country",              // ← Field Name (unique)
      "type": "select",
      "label": "Site Country",
      "metadata": {
        "codeListCategory": "COUNTRY"    // ← Same code list!
      }
    }
  ]
}
```

**Result:** All 3 fields show the same list of countries, but store data separately.

---

## 🔧 How Option Loading Works

### Step 1: Form Designer Configuration

**User configures field in Form Designer:**

```
┌─────────────────────────────────────────┐
│ Field Configuration                      │
├─────────────────────────────────────────┤
│ Field Type: [Dropdown ▼]                │
│                                          │
│ Field ID: patient_country    ← USER INPUT
│ Label: Patient Country                   │
│                                          │
│ Options Source:                          │
│ ○ Manual Entry                           │
│ ◉ Code List (Database)                   │
│                                          │
│ Code List Category:                      │
│ [COUNTRY           ▼]         ← USER SELECT
│                                          │
│ ✅ Selected: COUNTRY                     │
└─────────────────────────────────────────┘
```

**Saved to database:**

```json
{
  "id": "patient_country",
  "type": "select",
  "label": "Patient Country",
  "metadata": {
    "codeListCategory": "COUNTRY"
  }
}
```

### Step 2: Form Entry Runtime

**When user opens form for data entry:**

```javascript
// FormEntry.jsx - useEffect hook (lines 44-68)

useEffect(() => {
  if (!formDefinition?.fields) return;
  
  for (const field of formDefinition.fields) {
    if (['select', 'radio', 'multiselect', 'checkbox-group'].includes(field.type)) {
      await loadFieldOptions(field, context);  // ← Calls OptionLoaderService
    }
  }
}, [formDefinition]);
```

**OptionLoaderService.js (lines 33-41):**

```javascript
export const loadFieldOptions = async (field, context = {}) => {
  let optionSource = field.metadata?.uiConfig?.optionSource;
  
  // Check for simplified code list category format (from form designer)
  if (!optionSource && field.metadata?.codeListCategory) {
    optionSource = {
      type: 'CODE_LIST',
      category: field.metadata.codeListCategory,  // ← Uses category, NOT field name
      cacheable: true,
      cacheDuration: 3600
    };
  }
  
  // Load options based on source type
  switch (optionSource.type) {
    case 'CODE_LIST':
      options = await loadCodeListOptions(optionSource);  // ← Makes API call
      break;
  }
};
```

**loadCodeListOptions function (lines 119-149):**

```javascript
const loadCodeListOptions = async (optionSource) => {
  const { category } = optionSource;  // ← Gets category from optionSource
  
  console.log(`[OptionLoader] Loading code list: ${category}`);
  
  // API call using CATEGORY (not field name)
  const response = await ApiService.get(`/clinops-ws/api/admin/codelists/simple/${category}`);
  
  // Format response to standard option format
  return response.data.map(item => ({
    value: item.code || item.value,
    label: item.name || item.label,
    description: item.description || '',
    order: item.displayOrder || item.order
  }));
};
```

### Step 3: API Request

**Actual HTTP request:**

```
GET http://localhost:8083/clinops-ws/api/admin/codelists/simple/COUNTRY
                                                                    ↑
                                                    Uses CATEGORY, not field name
```

**Backend response:**

```json
[
  {
    "code": "USA",
    "name": "United States",
    "description": "United States of America",
    "displayOrder": 1
  },
  {
    "code": "CAN",
    "name": "Canada",
    "description": "Canada",
    "displayOrder": 2
  }
  // ... more countries
]
```

### Step 4: Options Stored by Field ID

**Frontend stores options keyed by FIELD ID (not category):**

```javascript
// FormEntry.jsx state
const [fieldOptions, setFieldOptions] = useState({});

// After loading
setFieldOptions({
  "patient_country": [        // ← Field ID as key
    { value: "USA", label: "United States" },
    { value: "CAN", label: "Canada" }
  ],
  "birth_country": [          // ← Different field ID
    { value: "USA", label: "United States" },  // Same data!
    { value: "CAN", label: "Canada" }
  ]
});
```

---

## 🐛 Potential Issues

### Issue 1: Category Not Set

**Problem:** Field has no `codeListCategory` in metadata

```json
{
  "id": "patient_country",
  "type": "select",
  "label": "Patient Country",
  "metadata": {
    // ❌ Missing codeListCategory!
  }
}
```

**Result:** 
- OptionLoaderService finds no category
- No API call made
- Dropdown shows "Select an option" with no values

**How to Check:**
```javascript
console.log(field.metadata?.codeListCategory);  // Should be "COUNTRY", not undefined
```

### Issue 2: Category Doesn't Exist in Database

**Problem:** Category name misspelled or not in database

```json
{
  "id": "patient_country",
  "type": "select",
  "metadata": {
    "codeListCategory": "COUNTRIES"  // ❌ Wrong! Should be "COUNTRY"
  }
}
```

**Result:**
- API call: `GET /api/admin/codelists/simple/COUNTRIES`
- Backend returns 404 or empty array
- Dropdown shows no values

**How to Check:**
```sql
-- Check available categories in database
SELECT DISTINCT category FROM code_lists ORDER BY category;
```

Expected categories from your SQL file:
```
ALCOHOL_USE
DOSE_UNIT
ETHNICITY
FAMILY_HISTORY
FASTING_STATUS
FREQUENCY
GENDER
MEDICAL_HISTORY
PATIENT_POSITION
PRESCRIPTION_STATUS
RACE
ROUTE_OF_ADMINISTRATION
SMOKING_STATUS
TEMPERATURE_ROUTE
```

### Issue 3: Code List Not Yet Loaded into Database

**Problem:** `clinical_code_lists_data.sql` not executed yet

**Result:**
- API call succeeds but returns empty array: `[]`
- Dropdown shows no values

**How to Check:**
```sql
-- Check if code lists exist
SELECT category, COUNT(*) as code_count 
FROM code_lists 
GROUP BY category;
```

### Issue 4: API Endpoint Not Working

**Problem:** Backend service not running or wrong endpoint

**Result:**
- API call fails with 404 or 500 error
- Console shows error message
- Dropdown shows no values

**How to Check:**
```javascript
// Check browser console for errors like:
// Error loading options for field patient_country: 404 Not Found
```

---

## 🔍 Debugging Steps

### 1. Check Browser Console

**Look for these log messages:**

```javascript
// SUCCESS - Should see these:
[OptionLoader] Loading code list: COUNTRY
[OptionLoader] Cached 195 options with key: options_patient_country_CODE_LIST_COUNTRY_...

// FAILURE - Bad signs:
Error loading options for field patient_country: Request failed with status code 404
[OptionLoader] Invalid code list response for COUNTRY
```

### 2. Check Field Metadata

**Add console.log to FormEntry.jsx (line ~68):**

```javascript
for (const field of formDefinition.fields) {
  if (['select', 'radio', 'multiselect', 'checkbox-group'].includes(field.type)) {
    console.log(`Field: ${field.id}, Category: ${field.metadata?.codeListCategory}`);
    await loadFieldOptions(field, context);
  }
}
```

**Expected output:**
```
Field: patient_country, Category: COUNTRY  ✅
Field: gender, Category: GENDER  ✅
Field: race, Category: RACE  ✅
```

**Bad output:**
```
Field: patient_country, Category: undefined  ❌
Field: gender, Category: COUNTRIES  ❌ (wrong name)
```

### 3. Check API Response

**Test API endpoint directly in browser or Postman:**

```
GET http://localhost:8083/clinops-ws/api/admin/codelists/simple/COUNTRY
```

**Expected response (200 OK):**
```json
[
  { "code": "USA", "name": "United States" },
  { "code": "CAN", "name": "Canada" }
]
```

**Bad responses:**
```
404 Not Found → Category doesn't exist in database
200 OK with [] → Category exists but has no codes
500 Error → Backend service issue
```

### 4. Check Database

**Connect to MySQL and run:**

```sql
-- Check if category exists
SELECT * FROM code_lists WHERE category = 'COUNTRY';

-- Check all categories
SELECT DISTINCT category FROM code_lists;

-- Check code_list_usage
SELECT * FROM code_list_usage WHERE code_list_category = 'COUNTRY';
```

---

## ✅ Correct Configuration Examples

### Example 1: Patient Demographics

```json
{
  "fields": [
    {
      "id": "gender",                    // ← Field name (can be anything)
      "type": "select",
      "label": "Gender",
      "metadata": {
        "codeListCategory": "GENDER"     // ← Must match DB category
      }
    },
    {
      "id": "race",
      "type": "multiselect",
      "label": "Race (select all that apply)",
      "metadata": {
        "codeListCategory": "RACE"
      }
    },
    {
      "id": "ethnicity",
      "type": "select",
      "label": "Ethnicity",
      "metadata": {
        "codeListCategory": "ETHNICITY"
      }
    }
  ]
}
```

### Example 2: Medical History

```json
{
  "fields": [
    {
      "id": "medical_history_conditions",
      "type": "checkbox-group",
      "label": "Medical History",
      "metadata": {
        "codeListCategory": "MEDICAL_HISTORY"  // ← From clinical_code_lists_data.sql
      }
    },
    {
      "id": "family_history_conditions",
      "type": "checkbox-group",
      "label": "Family History",
      "metadata": {
        "codeListCategory": "FAMILY_HISTORY"
      }
    },
    {
      "id": "smoking_status",
      "type": "radio",
      "label": "Smoking Status",
      "metadata": {
        "codeListCategory": "SMOKING_STATUS"
      }
    }
  ]
}
```

---

## 🚨 Common Misconceptions

### ❌ WRONG: Field name must match category

```json
{
  "id": "COUNTRY",                  // ❌ Don't do this
  "type": "select",
  "metadata": {
    "codeListCategory": "COUNTRY"
  }
}
```

**Why wrong:** Field names should be descriptive and context-specific (e.g., `patient_country`, `birth_country`)

### ✅ CORRECT: Field name is descriptive, category is standardized

```json
{
  "id": "patient_country_of_residence",  // ✅ Descriptive field name
  "type": "select",
  "metadata": {
    "codeListCategory": "COUNTRY"        // ✅ Standard category
  }
}
```

---

## 🎯 Answer to Your Question

> "Do you think this issue of rendering dropdown could be related to that?"

**Possible scenarios:**

1. **If field name ≠ category AND category is correct:**
   - ✅ **This is FINE** - System works correctly
   - Example: field `patient_country` using category `COUNTRY` ✅

2. **If user confused field name with category:**
   - ❌ **PROBLEM** - Wrong category value set
   - Example: field `patient_country` with category `patient_country` ❌
   - Result: API call to `/api/admin/codelists/simple/patient_country` → 404 error

3. **If category not set at all:**
   - ❌ **PROBLEM** - No category value
   - Example: field `patient_country` with `codeListCategory: undefined` ❌
   - Result: No API call made, no options loaded

---

## 🔧 How to Fix

### Fix 1: Check Field Configuration

**In Form Designer:**
1. Click on field
2. Look for "Options Source" section
3. Verify "Code List (Database)" is selected
4. Verify correct category is selected from dropdown

### Fix 2: Verify Category Exists

**Run this query:**
```sql
SELECT DISTINCT category 
FROM code_lists 
WHERE category IN (
  'COUNTRY', 'GENDER', 'RACE', 'ETHNICITY', 
  'MEDICAL_HISTORY', 'SMOKING_STATUS'
)
ORDER BY category;
```

**If empty:** Run `clinical_code_lists_data.sql`

### Fix 3: Check Form Definition JSON

**If form already saved, check stored JSON:**

```sql
SELECT form_definition 
FROM study_forms 
WHERE form_id = <your_form_id>;
```

**Look for:**
```json
{
  "fields": [
    {
      "id": "some_field",
      "metadata": {
        "codeListCategory": "???"  ← Check this value
      }
    }
  ]
}
```

---

## 📋 Verification Checklist

When dropdown has no values, check:

- [ ] Field type is `select`, `multiselect`, `radio`, or `checkbox-group`
- [ ] Field has `metadata.codeListCategory` property (not undefined)
- [ ] Category name matches database category (exact case)
- [ ] Category exists in `code_lists` table
- [ ] Code list has values (SELECT COUNT(*) FROM code_lists WHERE category = 'X')
- [ ] Backend service is running on port 8083
- [ ] API endpoint `/api/admin/codelists/simple/{category}` is accessible
- [ ] Browser console shows successful option loading logs
- [ ] No error messages in console

---

## 🎓 Key Takeaway

**Field Name** and **Code List Category** are **intentionally separate** to allow:
- Multiple fields to share the same options (reusability)
- Descriptive field naming (patient_country, birth_country)
- Centralized option management (one place to update all forms)

**However**, the actual issue of empty dropdowns is most likely:
1. ❌ `codeListCategory` not set in field metadata
2. ❌ Wrong category name (typo or doesn't exist)
3. ❌ Code lists not loaded into database yet

**Next Step:** Check browser console for option loading logs to identify exact cause.
