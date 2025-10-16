# Form Designer: What You Should Actually See

## 🔍 Current Situation Analysis

You mentioned you **don't see** the 4-tab interface (Basic, Validation, Options, Advanced) when working with select/multiselect fields in the Form Designer.

### What the Code Says vs. What You Experience

**According to the Code** (`FieldPropertiesEditor.jsx`):
- ✅ **4 tabs ARE defined**: Basic, Validation, Options, Advanced
- ✅ **Options tab IS implemented**: Full UI for adding/editing options with Value/Label fields
- ✅ **Validation tab IS implemented**: Shows validation rules based on field type
- ✅ **Advanced tab IS implemented**: Placeholder, CSS classes, width, conditional logic

**What You're Likely Seeing**:
- ❌ A simpler inline properties panel
- ❌ No tabbed interface
- ❌ Limited field editing options

### Root Cause: Props Mismatch

Looking at `FormDesigner.jsx` (line 704):
```jsx
<FieldPropertiesEditor
    field={findFieldById(selectedField)}
    context={context}
    onUpdateField={updateField}      // ❌ Wrong prop name
    validationRules={validationRules}
    readOnly={readOnly}
/>
```

But `FieldPropertiesEditor.jsx` expects (line 9):
```jsx
const FieldPropertiesEditor = ({
    field,
    context = 'general',
    onSave,        // ✅ Expected
    onCancel,      // ✅ Expected
    onDelete,
    onDuplicate,
    // ...
})
```

**The Problem**: FormDesigner is passing `onUpdateField` but the component expects `onSave`. This causes the component to not function correctly.

---

## 🎯 What You SHOULD See (When Fixed)

### When You Select a Select/Multiselect Field:

The right panel should display:

```
┌────────────────────────────────────────────────────────────────┐
│ Edit Field: [Field Name]                        [Copy] [Del] [X]│
├────────────────────────────────────────────────────────────────┤
│ [Basic] [Validation] [Options (3)] [Advanced]                   │ ← Tabs
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  (Tab Content - See Below)                                      │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  ⚠️ Unsaved changes          [Cancel] [Save Changes]            │
└────────────────────────────────────────────────────────────────┘
```

### Tab 1: BASIC
```
Field Type: [Dropdown ▼]

Label *: [Country                                        ]
Field ID *: [country                                     ]
Description: [Select the participant's country           ]
             [                                            ]
             [                                            ]

☑ Required field
☐ Read only
☐ Hidden field
```

### Tab 2: VALIDATION
```
Configure validation rules for this field type: select

Custom Validation Message:
[Please select a valid country                          ]
```

For **multiselect**, you would also see:
```
Maximum Selections:
[3                                                      ]
```

### Tab 3: OPTIONS ⭐
```
Options                                        [+ Add Option]

┌──────────────────────────────────────────────────────────────┐
│ Value                    │ Label                    │ [🗑]   │
├──────────────────────────┼──────────────────────────┤        │
│ [US                   ]  │ [United States        ]  │        │
└──────────────────────────┴──────────────────────────┴────────┘
┌──────────────────────────────────────────────────────────────┐
│ Value                    │ Label                    │ [🗑]   │
├──────────────────────────┼──────────────────────────┤        │
│ [CA                   ]  │ [Canada               ]  │        │
└──────────────────────────┴──────────────────────────┴────────┘
┌──────────────────────────────────────────────────────────────┐
│ Value                    │ Label                    │ [🗑]   │
├──────────────────────────┼──────────────────────────┤        │
│ [UK                   ]  │ [United Kingdom       ]  │        │
└──────────────────────────┴──────────────────────────┴────────┘
```

### Tab 4: ADVANCED
```
Placeholder Text:
[Select a country...                                    ]

CSS Classes:
[country-selector required-field                        ]

Field Width: [Full Width ▼]

Display Order: [1                                       ]

Show When (Conditional Logic):
[enrollment_status === 'international'                  ]
[                                                        ]

💡 JavaScript expression that determines when this field
   should be visible
```

---

## 🐛 What You're Probably Seeing Instead

Based on the props mismatch, you're likely seeing a **simpler inline editor** that might look like:

```
┌────────────────────────────────────────────────────────────────┐
│ Field Properties                                                │
├────────────────────────────────────────────────────────────────┤
│ Label: [                                                     ]  │
│ Type: [select ▼]                                                │
│ Required: ☐                                                     │
│                                                                 │
│ (No tabs, no options editor)                                    │
└────────────────────────────────────────────────────────────────┘
```

Or possibly nothing at all - just a message like "Select a field to edit its properties".

---

## 🔧 How to Fix

The FormDesigner needs to be updated to pass the correct props:

### Current Code (FormDesigner.jsx, line 704):
```jsx
<FieldPropertiesEditor
    field={findFieldById(selectedField)}
    context={context}
    onUpdateField={updateField}      // ❌ Wrong
    validationRules={validationRules}
    readOnly={readOnly}
/>
```

### Should Be:
```jsx
<FieldPropertiesEditor
    field={findFieldById(selectedField)}
    context={context}
    onSave={(updatedField) => {
        updateField(updatedField.id, updatedField);
    }}
    onCancel={() => setSelectedField(null)}
    onDelete={(fieldId) => deleteField(fieldId)}
    onDuplicate={(field) => duplicateField(field.id)}
    availableFieldTypes={[
        { value: 'text', label: 'Text Input' },
        { value: 'select', label: 'Dropdown' },
        { value: 'multiselect', label: 'Multi-Select' },
        // ... etc
    ]}
    customValidators={validationRules}
    readOnly={readOnly}
/>
```

---

## 📝 Summary

### The Good News ✅
- The FieldPropertiesEditor component **is fully implemented**
- It **has all 4 tabs** (Basic, Validation, Options, Advanced)
- It **has the Options editor** with Value/Label fields
- It **validates** that at least one option is required
- It **shows option counts** in a badge on the Options tab

### The Bad News ❌
- FormDesigner isn't wired up correctly to use it
- Props don't match what the component expects
- You're probably seeing a simpler/broken version

### What This Means for You 🤔
If you don't see the tabs:
1. **It's not your fault** - the code integration is incomplete
2. **The feature exists** - just not connected properly
3. **You can't currently use it** - needs developer fix

### Workaround Until Fixed 💡
Since you can't access the Options tab UI:
1. **Create the field** with any placeholder options
2. **Export the form definition** to JSON
3. **Manually edit the JSON** to add your options:
   ```json
   {
     "fieldId": "country",
     "type": "select",
     "label": "Country",
     "options": [
       {"value": "US", "label": "United States"},
       {"value": "CA", "label": "Canada"},
       {"value": "UK", "label": "United Kingdom"}
     ]
   }
   ```
4. **Import the form definition** back

Or for dynamic options:
```json
{
  "fieldId": "country",
  "type": "select",
  "label": "Country",
  "metadata": {
    "uiConfig": {
      "optionSource": {
        "type": "CODE_LIST",
        "category": "country",
        "cacheable": true
      }
    }
  }
}
```

---

## 🚀 Next Steps

### For Developers:
1. Fix props in FormDesigner.jsx (lines 704-709)
2. Test that tabs appear when field is selected
3. Verify Options tab allows adding/editing options
4. Test Save/Cancel/Delete functionality

### For You (User):
1. **Report this issue** - "Form Designer not showing tabs for field properties"
2. **Use JSON editing workaround** for now
3. **Wait for fix** - should be straightforward once developers are aware

---

**Date**: October 15, 2025  
**Status**: ❌ Bug - Props mismatch prevents tabs from showing  
**Severity**: Medium - Feature exists but isn't accessible  
**Workaround**: Yes - Manual JSON editing
