# Select Field Options Configuration Guide

## Overview

This guide explains how to configure select, multi-select, radio, and checkbox list fields with dynamic or static options in ClinPrecision.

## Problem Statement

Form fields like dropdowns and radio buttons need to display options from various sources:
- **Static lists** hardcoded in form definition
- **Code lists** (centralized, reusable like countries, units)
- **Dynamic data** (study-specific sites, investigators)
- **External standards** (MedDRA, ICD-10, CDISC)

The original form design only supported static options embedded in the form definition, which led to:
- ❌ Duplication of common lists across forms
- ❌ Difficulty updating lists (had to update every form)
- ❌ No support for study-specific dynamic lists
- ❌ No integration with external standards

## Solution: OptionSource Configuration

### Enhanced UIConfig Structure

```java
public class UIConfig {
    // Static options (backward compatible)
    private List<FieldOption> options;
    
    // Dynamic options source (NEW)
    private OptionSource optionSource;
}
```

---

## Option Source Types

### 1. STATIC (Default - Backward Compatible)

**Use Case**: Small, form-specific lists that rarely change

**Configuration**:
```json
{
  "id": "gender",
  "type": "radio",
  "label": "Gender",
  "metadata": {
    "uiConfig": {
      "options": [
        {"value": "M", "label": "Male"},
        {"value": "F", "label": "Female"},
        {"value": "O", "label": "Other"}
      ]
    }
  }
}
```

**Frontend Behavior**: Uses options array directly

**Pros**:
- ✅ Simple
- ✅ No API calls
- ✅ Backward compatible

**Cons**:
- ❌ Duplicated across forms
- ❌ Hard to update globally

---

### 2. CODE_LIST (Recommended for Reusable Lists)

**Use Case**: Centralized, reusable lists managed by admin

**Configuration**:
```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "CODE_LIST",
        "category": "COUNTRY",
        "cacheable": true,
        "cacheDuration": 3600
      }
    }
  }
}
```

**Code List Categories** (Examples):
- `COUNTRY` - List of countries
- `UNIT_MEASUREMENT` - Units (mg, mL, kg, etc.)
- `AE_SEVERITY` - Adverse event severity (Mild, Moderate, Severe)
- `RELATIONSHIP` - Relationship to study drug
- `RACE` - Race/ethnicity categories
- `YES_NO` - Yes/No (standardized across studies)
- `STATUS` - Status values (Active, Inactive, etc.)

**API Endpoint**: 
```
GET /api/admin/codelists/simple/{category}
```

**Response**:
```json
[
  {"value": "USA", "label": "United States"},
  {"value": "CAN", "label": "Canada"},
  {"value": "MEX", "label": "Mexico"}
]
```

**Pros**:
- ✅ Centralized management
- ✅ Single update affects all forms
- ✅ Cacheable (fast performance)
- ✅ Admin UI to manage lists

**Cons**:
- ❌ Requires code list service

---

### 3. STUDY_DATA (Dynamic Study-Specific Lists)

**Use Case**: Lists that vary by study (sites, investigators, arms)

**Configuration Example - Study Sites**:
```json
{
  "id": "siteId",
  "type": "select",
  "label": "Study Site",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "STUDY_DATA",
        "endpoint": "/api/studies/{studyId}/sites",
        "valueField": "id",
        "labelField": "name",
        "cacheable": false
      }
    }
  }
}
```

**Configuration Example - Principal Investigators**:
```json
{
  "id": "investigatorId",
  "type": "select",
  "label": "Principal Investigator",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "STUDY_DATA",
        "endpoint": "/api/studies/{studyId}/investigators",
        "filter": "role=PI",
        "valueField": "userId",
        "labelField": "fullName",
        "cacheable": true,
        "cacheDuration": 1800
      }
    }
  }
}
```

**Configuration Example - Study Arms**:
```json
{
  "id": "studyArm",
  "type": "select",
  "label": "Study Arm",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "STUDY_DATA",
        "endpoint": "/api/studies/{studyId}/arms",
        "valueField": "armId",
        "labelField": "armName",
        "cacheable": true
      }
    }
  }
}
```

**Placeholders**:
- `{studyId}` - Current study ID (auto-replaced)
- `{siteId}` - Current site ID (auto-replaced)
- `{subjectId}` - Current subject ID (auto-replaced)

**Pros**:
- ✅ Study-specific data
- ✅ Always current
- ✅ Flexible filtering

**Cons**:
- ❌ Requires API call
- ⚠️ Performance depends on caching

---

### 4. API (Custom External APIs)

**Use Case**: Integration with external systems or custom services

**Configuration Example - Lab Test Names**:
```json
{
  "id": "labTest",
  "type": "select",
  "label": "Lab Test",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "API",
        "endpoint": "/api/lab/tests",
        "queryParams": "category=HEMATOLOGY",
        "valueField": "testCode",
        "labelField": "testName",
        "cacheable": true,
        "cacheDuration": 7200
      }
    }
  }
}
```

**Configuration Example - Medications**:
```json
{
  "id": "medication",
  "type": "select",
  "label": "Concomitant Medication",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "API",
        "endpoint": "/api/medications/search",
        "queryParams": "status=active",
        "valueField": "drugCode",
        "labelField": "drugName",
        "cacheable": false
      }
    }
  }
}
```

**Pros**:
- ✅ Flexible
- ✅ Can integrate any API
- ✅ Custom logic

**Cons**:
- ❌ Requires API development
- ⚠️ Performance varies

---

### 5. EXTERNAL_STANDARD (Medical Coding Standards)

**Use Case**: Integration with medical terminology standards

**Configuration Example - MedDRA (Adverse Events)**:
```json
{
  "id": "aeMeddraTerm",
  "type": "select",
  "label": "MedDRA Preferred Term",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "EXTERNAL_STANDARD",
        "category": "MEDDRA_PT",
        "filter": "version=26.0",
        "valueField": "code",
        "labelField": "term",
        "cacheable": true,
        "cacheDuration": 86400
      }
    }
  }
}
```

**Configuration Example - ICD-10 (Diagnoses)**:
```json
{
  "id": "diagnosis",
  "type": "select",
  "label": "ICD-10 Diagnosis",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "EXTERNAL_STANDARD",
        "category": "ICD10",
        "filter": "chapter=I",
        "valueField": "code",
        "labelField": "description",
        "cacheable": true
      }
    }
  }
}
```

**Supported Standards**:
- `MEDDRA_PT` - MedDRA Preferred Terms
- `MEDDRA_LLT` - MedDRA Lowest Level Terms
- `ICD10` - ICD-10 codes
- `ICD11` - ICD-11 codes
- `CDISC_CT` - CDISC Controlled Terminology
- `LOINC` - Lab test codes
- `SNOMED` - SNOMED CT codes

**Pros**:
- ✅ Regulatory compliance
- ✅ Standardized coding
- ✅ International standards

**Cons**:
- ❌ Requires license for some standards
- ❌ Complex integration

---

## Complete Field Configuration Examples

### Example 1: Country Dropdown (Code List)
```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "metadata": {
    "required": true,
    "validation": {
      "required": true
    },
    "uiConfig": {
      "placeholder": "Select a country",
      "optionSource": {
        "type": "CODE_LIST",
        "category": "COUNTRY",
        "cacheable": true,
        "cacheDuration": 3600
      }
    }
  }
}
```

**Rendered as**:
```html
<select>
  <option value="">Select a country</option>
  <option value="USA">United States</option>
  <option value="CAN">Canada</option>
  <option value="MEX">Mexico</option>
  <!-- ... more countries from code list ... -->
</select>
```

---

### Example 2: Study Site (Study Data)
```json
{
  "id": "enrollmentSite",
  "type": "select",
  "label": "Enrollment Site",
  "metadata": {
    "required": true,
    "validation": {
      "required": true
    },
    "uiConfig": {
      "placeholder": "Select enrollment site",
      "helpText": "Site where subject was enrolled",
      "optionSource": {
        "type": "STUDY_DATA",
        "endpoint": "/api/studies/{studyId}/sites",
        "filter": "status=ACTIVE",
        "valueField": "id",
        "labelField": "name",
        "cacheable": true,
        "cacheDuration": 1800
      }
    }
  }
}
```

---

### Example 3: Adverse Event Severity (Static)
```json
{
  "id": "aeSeverity",
  "type": "radio",
  "label": "AE Severity",
  "metadata": {
    "required": true,
    "validation": {
      "required": true
    },
    "uiConfig": {
      "options": [
        {"value": "MILD", "label": "Mild", "description": "Mild discomfort"},
        {"value": "MODERATE", "label": "Moderate", "description": "Moderate discomfort"},
        {"value": "SEVERE", "label": "Severe", "description": "Severe discomfort"}
      ]
    }
  }
}
```

---

### Example 4: Multi-Select Symptoms (Code List)
```json
{
  "id": "symptoms",
  "type": "multiselect",
  "label": "Symptoms",
  "metadata": {
    "uiConfig": {
      "placeholder": "Select all that apply",
      "optionSource": {
        "type": "CODE_LIST",
        "category": "AE_SYMPTOMS",
        "cacheable": true
      }
    }
  }
}
```

---

## Frontend Implementation

### Data Loading Strategy

```javascript
// FormEntry.jsx - Simplified concept
const loadFieldOptions = async (field) => {
  const optionSource = field.metadata?.uiConfig?.optionSource;
  
  if (!optionSource) {
    // Use static options
    return field.metadata?.uiConfig?.options || [];
  }
  
  switch (optionSource.type) {
    case 'CODE_LIST':
      return await loadCodeListOptions(optionSource.category);
      
    case 'STUDY_DATA':
      return await loadStudyDataOptions(
        optionSource.endpoint,
        optionSource.filter
      );
      
    case 'API':
      return await loadApiOptions(
        optionSource.endpoint,
        optionSource.queryParams
      );
      
    case 'EXTERNAL_STANDARD':
      return await loadExternalStandardOptions(
        optionSource.category,
        optionSource.filter
      );
      
    default:
      return [];
  }
};
```

### Caching Strategy

```javascript
const optionCache = new Map();

const getCachedOptions = (cacheKey, loader, cacheDuration) => {
  const cached = optionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cacheDuration * 1000) {
    return cached.data;
  }
  
  const data = await loader();
  optionCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};
```

---

## Migration Strategy

### Phase 1: Backward Compatibility ✅
- Keep existing `options` array working
- If `optionSource` not specified, use `options`
- No breaking changes

### Phase 2: Add Code List Support
1. Create code list service
2. Migrate common lists to code lists
3. Update form definitions to use `CODE_LIST` type

### Phase 3: Add Study Data Support
1. Create study data endpoints
2. Update forms for sites, investigators, arms
3. Replace hardcoded lists

### Phase 4: External Standards
1. Integrate MedDRA/ICD-10
2. Update AE and medical history forms
3. Enable regulatory compliance features

---

## Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Code Reuse** | ❌ Duplicated across forms | ✅ Centralized code lists |
| **Updates** | ❌ Update every form | ✅ Update once, affects all |
| **Dynamic Lists** | ❌ Not supported | ✅ Study-specific data |
| **Standards** | ❌ Manual entry | ✅ MedDRA/ICD-10 integration |
| **Performance** | ✅ Fast (static) | ✅ Fast (with caching) |
| **Maintenance** | ❌ High effort | ✅ Low effort |

---

## Next Steps

1. ✅ **Backend Schema Updated** - UIConfig.java enhanced
2. ⏳ **Frontend Service** - Create OptionLoaderService.js
3. ⏳ **Code List API** - Already exists (`CodeListController`)
4. ⏳ **FormEntry Integration** - Update select field rendering
5. ⏳ **Caching Layer** - Implement option caching
6. ⏳ **Testing** - Test all option source types

---

## Related Files

- **Backend**: `UIConfig.java` - Schema definition
- **Backend**: `CodeListController.java` - Code list API
- **Frontend**: `FormEntry.jsx` - Form rendering (to be updated)
- **Frontend**: `OptionLoaderService.js` - To be created

---

## Questions?

**Q: What if I want both static and dynamic options?**
A: Use `CODE_LIST` and add the static values to the code list via admin UI.

**Q: Can I filter options based on other field values?**
A: Yes! Use conditional logic in the `filter` parameter or implement dependent dropdowns.

**Q: How do I handle large option lists (> 1000 items)?**
A: Use autocomplete/typeahead instead of dropdown. See autocomplete field type.

**Q: Can options be loaded asynchronously?**
A: Yes! All dynamic sources load asynchronously with loading indicators.

**Q: What about internationalization (i18n)?**
A: Code lists support multilingual labels. Use locale-aware endpoints.

---

## Summary

✅ **Schema Enhanced**: UIConfig now supports dynamic option sources

✅ **5 Source Types**: STATIC, CODE_LIST, STUDY_DATA, API, EXTERNAL_STANDARD

✅ **Backward Compatible**: Existing forms continue to work

✅ **Flexible**: Supports any data source via API

✅ **Performance**: Built-in caching support

✅ **Regulatory Ready**: MedDRA/ICD-10 integration path

The next step is implementing the frontend `OptionLoaderService.js` to actually load and cache these options.
