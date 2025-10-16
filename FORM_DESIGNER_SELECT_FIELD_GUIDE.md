# Form Designer: Select & Multi-Select Field Guide

## 📋 Overview

When designing a form and you select **"Dropdown" (select)** or **"Multi-Select" (multiselect)** as the element type, you should expect a comprehensive interface for configuring how users will select from predefined options.

**Date**: October 15, 2025  
**Context**: Form Design Phase (not Form Entry/Data Capture)

---

## 🎯 What You Should Expect

### 1. **Field Properties Editor Opens**

When you select a select or multi-select field, the **FieldPropertiesEditor** panel will appear with 4 tabs:

```
┌────────────────────────────────────────────────────────────────┐
│ Edit Field: [Field Name]                        [Copy] [Del] [X]│
├────────────────────────────────────────────────────────────────┤
│ [Basic] [Validation] [Options] [Advanced]                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  (Tab Content Here)                                             │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  ⚠️ Unsaved changes          [Cancel] [Save Changes]            │
└────────────────────────────────────────────────────────────────┘
```

---

## 📑 Tab-by-Tab Breakdown

### **Tab 1: BASIC** (Initial Configuration)

This is where you define the core properties of your field.

#### What You'll See:

1. **Field Type Dropdown**
   - Options: Text Input, Text Area, Number, Email, Date, **Dropdown**, **Multi-Select**, Radio Buttons, etc.
   - Current selection will be highlighted

2. **Label*** (Required)
   - Text input for the field label shown to users
   - Example: "Country", "Site", "Status"
   - Auto-generates Field ID as you type

3. **Field ID*** (Required)
   - Unique identifier for this field
   - Must start with letter, only letters/numbers/underscores
   - Example: `country`, `site_id`, `enrollment_status`
   - Validation: Red border if invalid format

4. **Description** (Optional)
   - Multi-line text area
   - Help text or instructions for data entry personnel
   - Example: "Select the country where the site is located"

5. **Required Field** (Checkbox)
   - ☑ Check if this field must be filled before form submission
   - ☐ Leave unchecked for optional fields

6. **Read Only** (Checkbox)
   - ☑ Check to prevent users from editing (display only)
   - ☐ Normal editable field

7. **Hidden Field** (Checkbox)
   - ☑ Check to hide from users (still stores data)
   - ☐ Normal visible field

#### Example Configuration:
```
Field Type:  [Dropdown ▼]
Label:       Country *
Field ID:    country
Description: Select the country where the participant resides
☑ Required field
☐ Read only
☐ Hidden field
```

---

### **Tab 2: VALIDATION** (Rules & Constraints)

Configure validation rules specific to select/multi-select fields.

#### What You'll See:

**For Select (Dropdown)**:
- Validation rules available:
  - ☑ **Required**: Must select an option
  - ☑ **Valid Option**: Selected value must be in options list
  
- **Custom Validation Message**
  - Text input to override default error message
  - Example: "Please select a valid country from the list"

**For Multi-Select**:
- All of the above, PLUS:
  - **Maximum Selections**: Limit how many options can be selected
    - Number input (e.g., 3 = user can select up to 3 options)
    - Leave blank for unlimited selections

#### Example Configuration:
```
Field type: multiselect

□ Required: (inherited from Basic tab)

Maximum Selections: [3]  (optional)

Custom Validation Message:
[Please select between 1 and 3 study sites]
```

---

### **Tab 3: OPTIONS** ⭐ **MOST IMPORTANT FOR SELECT FIELDS**

This is where you define WHERE the options come from. This tab is critical for select/multi-select fields.

#### What You'll See:

**⚠️ CURRENT STATE (Before Enhancement)**:
```
┌──────────────────────────────────────────────────────────────┐
│ Options                                      [+ Add Option]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  No options defined. Click "Add Option" to create           │
│  the first option.                                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

When you click **[+ Add Option]**, you'll see:

```
┌──────────────────────────────────────────────────────────────┐
│ Value                    │ Label                    │ [🗑]   │
├──────────────────────────┼──────────────────────────┤        │
│ [option_1]               │ [Option 1]               │        │
└──────────────────────────┴──────────────────────────┴────────┘
┌──────────────────────────────────────────────────────────────┐
│ Value                    │ Label                    │ [🗑]   │
├──────────────────────────┼──────────────────────────┤        │
│ [option_2]               │ [Option 2]               │        │
└──────────────────────────┴──────────────────────────┴────────┘
```

- **Value**: Internal value stored in database (e.g., "US", "CA", "UK")
- **Label**: Display text shown to users (e.g., "United States", "Canada", "United Kingdom")
- **[🗑]**: Delete button to remove option

#### Example Option List:
```
Value    │ Label                │ Action
─────────┼──────────────────────┼────────
US       │ United States        │ [🗑]
CA       │ Canada               │ [🗑]
UK       │ United Kingdom       │ [🗑]
DE       │ Germany              │ [🗑]
FR       │ France               │ [🗑]
```

**⚠️ LIMITATION**: Currently, you must manually add each option one-by-one. This is tedious for large lists (e.g., all countries).

---

#### **🚀 ENHANCED STATE (After Recent Implementation)**

**NEW CAPABILITY**: You can now specify WHERE options should be loaded from dynamically!

While the UI doesn't yet show this visually, the **backend now supports** these advanced option sources:

##### **Option Source Types Available**:

1. **STATIC** (Current/Default)
   - Manually add options in the UI (as shown above)
   - Best for: Small, fixed lists (Yes/No, Gender, etc.)
   - Stored directly in form definition

2. **CODE_LIST** ⭐ (Recommended)
   - Load options from centralized code list service
   - Best for: Reusable lists (Countries, Statuses, Types)
   - Configuration example:
     ```json
     {
       "type": "CODE_LIST",
       "category": "country",
       "cacheable": true,
       "cacheDuration": 3600
     }
     ```
   - **Benefits**: 
     - Update once, all forms update automatically
     - Centralized management
     - Backend caching for performance

3. **STUDY_DATA** (Context-Aware)
   - Load options dynamically based on study/site/subject
   - Best for: Study sites, investigators, subjects, visits
   - Configuration example:
     ```json
     {
       "type": "STUDY_DATA",
       "endpoint": "/clinops-ws/api/studies/{studyId}/sites",
       "valueField": "id",
       "labelField": "name",
       "filter": "status=active"
     }
     ```
   - **Benefits**:
     - Different options per study
     - Only shows relevant data (e.g., active sites)
     - Placeholder replacement: `{studyId}`, `{siteId}`, `{subjectId}`

4. **API** (Custom Endpoint)
   - Load from any custom API endpoint
   - Best for: Integration with external systems
   - Configuration example:
     ```json
     {
       "type": "API",
       "endpoint": "https://api.example.com/data",
       "queryParams": "format=json&limit=100",
       "valueField": "id",
       "labelField": "name"
     }
     ```

5. **EXTERNAL_STANDARD** (Medical Standards)
   - Load from external medical coding systems
   - Best for: MedDRA, ICD-10, SNOMED CT, LOINC
   - Configuration example:
     ```json
     {
       "type": "EXTERNAL_STANDARD",
       "category": "meddra",
       "filter": "level=PT",
       "valueField": "code",
       "labelField": "term"
     }
     ```

**⚠️ NOTE**: UI for selecting these advanced option sources is **not yet implemented** in the Form Designer. You'll need to:
- Either manually add static options in the UI, OR
- Manually edit the form definition JSON to add `optionSource` configuration

**See**: `SELECT_FIELD_OPTIONS_GUIDE.md` for complete configuration examples.

---

### **Tab 4: ADVANCED** (Additional Settings)

Fine-tune display and behavior settings.

#### What You'll See:

1. **Placeholder Text**
   - Text shown when no option is selected
   - Example: "Select a country...", "Choose one or more options"
   - Appears as first option in dropdown

2. **CSS Classes**
   - Custom CSS classes for styling
   - Example: `custom-dropdown highlighted-field`

3. **Field Width**
   - Dropdown with options:
     - Full Width (100% of container)
     - Half Width (50%)
     - One Third (33%)
     - One Quarter (25%)

4. **Display Order**
   - Number input to control field sequence
   - Lower numbers appear first
   - Example: Order 1, Order 2, Order 3...

5. **Show When (Conditional Logic)**
   - JavaScript expression for conditional display
   - Example: `enrollment_status === 'enrolled'`
   - Field only visible when condition is true

#### Example Configuration:
```
Placeholder Text: [Select a country...]

CSS Classes: [country-selector required-field]

Field Width: [Full Width ▼]

Display Order: [5]

Show When (Conditional Logic):
[participant_type === 'international']

💡 JavaScript expression that determines when this field 
   should be visible
```

---

## ✅ Validation & Error Messages

### When You Try to Save Without Options:

```
┌──────────────────────────────────────────────────────────────┐
│ ❌ At least one option is required                           │
└──────────────────────────────────────────────────────────────┘
```

The **Save Changes** button will be **disabled** until you:
- Add at least one option, OR
- Configure an `optionSource` (advanced, not yet in UI)

### When You Try to Cancel With Unsaved Changes:

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ You have unsaved changes. Are you sure you want to        │
│    cancel?                                           [OK] [X] │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Indicator for Option Count

The **Options** tab shows a badge with the current option count:

```
[Basic] [Validation] [Options (5)] [Advanced]
                            ↑
                    Shows 5 options configured
```

- Badge is blue with white text
- Updates in real-time as you add/remove options
- Only visible for select/multiselect/radio/checkbox-group fields

---

## 📊 Complete Example: Country Dropdown

### Step-by-Step Configuration:

**1. Select Field Type**
```
Field Type: [Dropdown ▼]
```

**2. Configure Basic Properties**
```
Label: Country *
Field ID: country
Description: Select the country of residence
☑ Required field
```

**3. Set Validation**
```
Custom Validation Message: Please select a valid country
```

**4. Add Options** (Current Method)
```
Click [+ Add Option] 5 times:

Value  │ Label           │ Action
───────┼─────────────────┼──────
US     │ United States   │ [🗑]
CA     │ Canada          │ [🗑]
UK     │ United Kingdom  │ [🗑]
DE     │ Germany         │ [🗑]
FR     │ France          │ [🗑]
```

**5. Configure Advanced Settings**
```
Placeholder Text: Select a country...
Field Width: Full Width
Display Order: 1
```

**6. Save**
```
Click [Save Changes] button
```

---

## 🆚 Select vs Multi-Select: Key Differences

| Feature | Select (Dropdown) | Multi-Select |
|---------|-------------------|--------------|
| **Selection** | Single option only | Multiple options |
| **UI Display** | Dropdown list | Multi-select box or checkboxes |
| **Value Stored** | Single string | Array of strings |
| **Validation** | Required, Valid Option | Required, Valid Options, Max Selections |
| **Use Case** | Country, Status, Gender | Study Sites, Symptoms, Medications |
| **Max Selections** | Always 1 | Configurable (or unlimited) |

### Example Use Cases:

**Select (Dropdown)**:
- Country of residence (one country)
- Marital status (one status)
- Blood type (one type)
- Gender (one selection)
- Study phase (one phase)

**Multi-Select**:
- Study sites participating (multiple sites)
- Medical conditions (multiple conditions)
- Medications (multiple drugs)
- Symptoms reported (multiple symptoms)
- Inclusion criteria met (multiple criteria)

---

## 🚀 Best Practices

### For Small, Fixed Lists (< 10 options):
✅ **Use STATIC options** (manual entry in UI)
- Quick to set up
- Easy to modify
- No dependencies

### For Reusable Lists (Countries, Statuses, Types):
✅ **Use CODE_LIST** (recommended for production)
- Centralized management
- Update once, all forms update
- Backend caching
- Consistent across application

### For Dynamic, Context-Aware Lists:
✅ **Use STUDY_DATA** (study sites, investigators, subjects)
- Different options per study
- Only shows relevant data
- Respects security/permissions

### For Medical Coding:
✅ **Use EXTERNAL_STANDARD** (MedDRA, ICD-10)
- Standardized terminology
- Regular updates maintained centrally
- Compliance with regulatory requirements

---

## ⚠️ Known Issues & Current Status

### Issue 1: Tabs May Not Be Visible
**Problem**: The 4-tab interface (Basic, Validation, Options, Advanced) is **implemented in the code** but may not be displaying correctly  
**Root Cause**: FormDesigner.jsx is passing props (`onUpdateField`, `validationRules`) that don't match what FieldPropertiesEditor expects (`onSave`, `onCancel`)  
**What You Might See Instead**: A simpler inline editor without tabs  
**Status**: Component mismatch needs to be fixed

### Issue 2: No UI for Advanced Option Sources
**Problem**: Can't select CODE_LIST, STUDY_DATA, etc. in the Form Designer UI  
**Workaround**: Manually edit form definition JSON to add `optionSource` configuration  
**Future**: UI will be enhanced to support option source selection

### Limitation 2: Tedious Option Entry for Large Lists
**Problem**: Must click [+ Add Option] 200 times for all countries  
**Workaround**: 
- Use CODE_LIST source (edit JSON)
- Or use bulk import (if available)
- Or request IT to add options via backend
**Future**: Bulk option import feature

### Limitation 3: No Option Ordering Controls
**Problem**: Options appear in the order added, no drag-to-reorder  
**Workaround**: Delete and re-add options in desired order (tedious)  
**Future**: Drag-and-drop reordering

### Limitation 4: No Option Descriptions/Help Text
**Problem**: Can't add tooltips or descriptions to individual options  
**Workaround**: Add descriptions in field-level help text (applies to all options)  
**Future**: `description` field for each option (already supported in backend)

---

## 🔮 What Happens at Runtime (Form Entry)

When a user fills out the form with your select field:

### For STATIC Options:
```
1. Form loads
2. Options render immediately from form definition
3. User selects option
4. Value saved to database
```

### For CODE_LIST Options:
```
1. Form loads
2. "Loading options..." appears
3. OptionLoaderService calls /api/admin/codelists/simple/{category}
4. Options populate dropdown (100-300ms)
5. Options cached in browser memory (1 hour)
6. User selects option
7. Value saved to database

On reload:
1. Form loads
2. Options load from cache instantly (5-20ms) ⚡
```

### For STUDY_DATA Options:
```
1. Form loads (URL: /studies/123/subjects/456/visits/789/forms/abc)
2. "Loading options..." appears
3. OptionLoaderService replaces placeholders:
   - {studyId} → 123
   - {subjectId} → 456
4. Calls /api/studies/123/sites?status=active
5. Options populate dropdown (200-500ms)
6. Options cached per study (30 min default)
7. User selects option
8. Value saved to database
```

**See**: `OPTION_LOADING_VISUAL_FLOW.md` for detailed flow diagrams.

---

## 📚 Related Documentation

- **SELECT_FIELD_OPTIONS_GUIDE.md** - Complete guide to option source types and configuration
- **DYNAMIC_OPTION_LOADING_IMPLEMENTATION.md** - Technical implementation details and testing guide
- **OPTION_LOADING_QUICK_REFERENCE.md** - Quick reference for developers
- **OPTION_LOADING_VISUAL_FLOW.md** - Visual flow diagrams

---

## 📝 Summary: What to Expect

When you select **"Dropdown"** or **"Multi-Select"** during form design:

### ✅ You Get:
1. **4-tab editor**: Basic, Validation, Options, Advanced
2. **Basic configuration**: Label, ID, description, required/readonly/hidden flags
3. **Validation rules**: Required, valid option, max selections (multi-select)
4. **Options tab** ⭐: Interface to add value/label pairs manually
5. **Advanced settings**: Placeholder, CSS, width, order, conditional logic
6. **Real-time validation**: Can't save without at least one option
7. **Unsaved changes warning**: Prevents accidental data loss

### ❌ You Don't Get (Yet):
1. UI for selecting CODE_LIST or STUDY_DATA sources (must edit JSON)
2. Bulk option import tool
3. Drag-to-reorder options
4. Option descriptions/tooltips in designer
5. Option preview/testing in designer

### 🔮 Coming Soon:
- Enhanced UI for option source selection
- Visual indicator of option source type
- Bulk option import/export
- Option reordering via drag-and-drop
- Option preview during design

---

## 🎯 Quick Checklist for Select/Multi-Select Fields

Before you click [Save Changes]:

- [ ] **Label** is clear and descriptive
- [ ] **Field ID** is unique and follows naming convention
- [ ] **Description** provides helpful guidance (if needed)
- [ ] **Required** checkbox set correctly
- [ ] **At least one option** is defined (or optionSource configured)
- [ ] **Option values** are meaningful codes (US, CA, UK - not 1, 2, 3)
- [ ] **Option labels** are user-friendly (United States - not US)
- [ ] **Validation rules** are appropriate
- [ ] **Placeholder text** is helpful (if set)
- [ ] **Field width** is appropriate for content
- [ ] **Display order** is correct relative to other fields

---

**Status**: ✅ Form Designer supports select/multi-select fields  
**Enhanced Features**: ✅ Backend supports dynamic option loading  
**UI Enhancements**: ⏳ Coming in future release  
**Date**: October 15, 2025
