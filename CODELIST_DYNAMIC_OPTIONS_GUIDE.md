# Code List Dynamic Options - User Guide

## 🎯 Overview

You can now configure select/multi-select/radio/checkbox fields to **load options dynamically from the database** instead of manually typing them one by one.

---

## 📋 When to Use Each Method

### Manual Entry (Static Options)
✅ **Use when:**
- Small lists (2-5 options): Yes/No, Male/Female
- Form-specific options that won't be reused
- Options that rarely change

❌ **Don't use when:**
- Large lists (countries, sites, etc.)
- Options shared across multiple forms
- Options that need centralized management

### Code List (Database)
✅ **Use when:**
- Large lists (countries, races, ethnicities)
- Options shared across multiple forms
- Options managed centrally in database
- Options that may be updated frequently

❌ **Don't use when:**
- Form-specific one-off lists
- Very simple Yes/No type options

---

## 🚀 How to Configure Dynamic Options

### Step 1: Open Form Designer

Navigate to: **Trial Design > Form Templates > Form Builder**

### Step 2: Add or Edit a Select Field

1. Click on a section to add/edit a field
2. Select field type: **Dropdown**, **Multi-Select**, **Radio**, or **Checkbox**

### Step 3: Configure Options Source

You'll see two radio button options:

#### Option A: Manual Entry
```
◉ Manual Entry    ○ Code List (Database)

Options (one per line)
┌────────────────────────────────┐
│ Yes                            │
│ No                             │
│ Not Applicable                 │
└────────────────────────────────┘
```

#### Option B: Code List (Database) ⭐ NEW!
```
○ Manual Entry    ◉ Code List (Database)

Code List Category *
┌────────────────────────────────┐
│ Select a code list category ▼  │ ← Click dropdown
├────────────────────────────────┤
│ COUNTRY                        │
│ SEX                            │
│ RACE                           │
│ ETHNIC                         │
│ VISIT_TYPE                     │
│ SITE_STATUS                    │
│ ... (and more)                 │
└────────────────────────────────┘

ℹ️ Dynamic Options: Options will be loaded from the database automatically.
API: GET /api/admin/codelists/simple/{category}
✅ Selected: COUNTRY
```

### Step 4: Select Code List Category from Dropdown

**All available categories are loaded automatically!** Simply select from the dropdown:

**Common Categories:**
- `COUNTRY` - List of countries
- `SEX` - Male, Female, Other
- `RACE` - Racial categories
- `ETHNIC` - Ethnic groups
- `VISIT_TYPE` - Study visit types
- `SITE_STATUS` - Active, Inactive, Pending
- `PROTOCOL_STATUS` - Protocol statuses
- `ENROLLMENT_STATUS` - Enrollment statuses

### Step 5: Save the Form

Click **Save** at the top. The form definition will now include:

```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "metadata": {
    "codeListCategory": "COUNTRY"
  }
}
```

---

## 🎬 What Happens at Runtime

### Form Entry (Data Capture)

When a user opens the form to enter data:

1. **Form loads** → Detects field has `codeListCategory`
2. **API call made** → `GET /api/admin/codelists/simple/COUNTRY`
3. **Options loaded** → Dropdown populates with countries
4. **Cached** → Options cached for 1 hour (no repeated API calls)
5. **User sees** → Fully populated dropdown ready for selection

**Example:**
```
Country: [Select an option ▼]
         ├─ United States
         ├─ Canada
         ├─ United Kingdom
         ├─ Germany
         ├─ France
         └─ (... 200+ more countries)
```

---

## 🔧 Database Setup

### code_list Table Structure

```sql
CREATE TABLE code_list (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,    -- e.g., "COUNTRY", "SEX"
    code VARCHAR(50) NOT NULL,        -- e.g., "USA", "M"
    name VARCHAR(255) NOT NULL,       -- e.g., "United States", "Male"
    description TEXT,                 -- Optional long description
    display_order INT,                -- Sort order in dropdown
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP,
    updated_date TIMESTAMP,
    UNIQUE KEY unique_category_code (category, code)
);
```

### Sample Data

```sql
-- Countries
INSERT INTO code_list (category, code, name, display_order) VALUES
('COUNTRY', 'USA', 'United States', 1),
('COUNTRY', 'CAN', 'Canada', 2),
('COUNTRY', 'GBR', 'United Kingdom', 3),
('COUNTRY', 'DEU', 'Germany', 4),
('COUNTRY', 'FRA', 'France', 5);

-- Sex
INSERT INTO code_list (category, code, name, display_order) VALUES
('SEX', 'M', 'Male', 1),
('SEX', 'F', 'Female', 2),
('SEX', 'O', 'Other', 3),
('SEX', 'U', 'Unknown', 4);

-- Race
INSERT INTO code_list (category, code, name, display_order) VALUES
('RACE', 'CAUCASIAN', 'White/Caucasian', 1),
('RACE', 'BLACK', 'Black/African American', 2),
('RACE', 'ASIAN', 'Asian', 3),
('RACE', 'HISPANIC', 'Hispanic/Latino', 4),
('RACE', 'NATIVE', 'Native American', 5),
('RACE', 'PACIFIC', 'Pacific Islander', 6),
('RACE', 'OTHER', 'Other', 7);
```

---

## 📊 Backend API

### Endpoint Used

```
GET /api/admin/codelists/simple/{category}
```

### Example Request

```bash
GET http://localhost:9093/clinops-ws/api/admin/codelists/simple/COUNTRY
```

### Example Response

```json
[
  {
    "id": 1,
    "category": "COUNTRY",
    "code": "USA",
    "name": "United States",
    "description": "United States of America",
    "displayOrder": 1,
    "isActive": true
  },
  {
    "id": 2,
    "category": "COUNTRY",
    "code": "CAN",
    "name": "Canada",
    "description": "Canada",
    "displayOrder": 2,
    "isActive": true
  }
]
```

---

## 🎨 User Experience

### Form Designer View

```
┌─────────────────────────────────────────────────────────┐
│ Field Configuration                                      │
├─────────────────────────────────────────────────────────┤
│ Field Type: [Dropdown ▼]                                │
│ Label: Country                                           │
│ Field ID: country                                        │
│                                                          │
│ Options Source:                                          │
│ ○ Manual Entry    ◉ Code List (Database)                │
│                                                          │
│ Code List Category                                       │
│ ┌──────────────────────────────────────────────┐        │
│ │ COUNTRY                                      │        │
│ └──────────────────────────────────────────────┘        │
│                                                          │
│ ℹ️ Options will be loaded dynamically from database     │
│    Common categories: COUNTRY, SEX, RACE, ETHNIC        │
└─────────────────────────────────────────────────────────┘
```

### Form Entry View (Loading)

```
Country: [⏳ Loading options... ▼]
```

### Form Entry View (Loaded)

```
Country: [United States ▼]
         ├─ United States
         ├─ Canada
         ├─ United Kingdom
         ├─ Germany
         ├─ France
         └─ (... more options)
```

---

## ⚡ Performance

### Caching Strategy

- **First load**: API call made, ~100-500ms
- **Subsequent loads**: Cached, ~0ms
- **Cache duration**: 1 hour (configurable)
- **Cache key**: `options_fieldId_CODE_LIST_COUNTRY__`

### Benefits

✅ **No repeated API calls** - Options loaded once per hour
✅ **Fast form loading** - Cached options returned instantly
✅ **Reduced database load** - Fewer queries
✅ **Better UX** - No visible delays after first load

---

## 🔄 Updating Code Lists

### Option 1: Database Direct Update

```sql
-- Add new country
INSERT INTO code_list (category, code, name, display_order) 
VALUES ('COUNTRY', 'AUS', 'Australia', 6);

-- Update existing
UPDATE code_list 
SET name = 'United States of America' 
WHERE category = 'COUNTRY' AND code = 'USA';

-- Deactivate
UPDATE code_list 
SET is_active = FALSE 
WHERE category = 'COUNTRY' AND code = 'OLD_CODE';
```

### Option 2: Admin UI (Future Enhancement)

Navigate to: **Admin > Code List Management**

- Add/Edit/Delete code list entries
- Reorder options
- Import from CSV
- Export to Excel

### Cache Refresh

After updating code lists:

**Option A: Wait for auto-refresh** (1 hour)

**Option B: Manual cache clear**
```javascript
// In browser console
OptionLoaderService.clearFieldCache('country');
```

**Option C: API endpoint** (future)
```
POST /api/admin/codelists/cache/clear
```

---

## 🎯 Quick Start Example

### 1. Create Code List in Database

```sql
INSERT INTO code_list (category, code, name, display_order) VALUES
('ENROLLMENT_STATUS', 'SCREENING', 'Screening', 1),
('ENROLLMENT_STATUS', 'ENROLLED', 'Enrolled', 2),
('ENROLLMENT_STATUS', 'COMPLETED', 'Completed', 3),
('ENROLLMENT_STATUS', 'WITHDRAWN', 'Withdrawn', 4);
```

### 2. Configure Field in Form Designer

1. Add select field: "Enrollment Status"
2. Select: **◉ Code List (Database)**
3. Enter category: `ENROLLMENT_STATUS`
4. Save form

### 3. Use in Form Entry

Open form → Field shows:
```
Enrollment Status: [Select an option ▼]
                   ├─ Screening
                   ├─ Enrolled
                   ├─ Completed
                   └─ Withdrawn
```

**Done!** 🎉

---

## 🐛 Troubleshooting

### Problem: Options not loading

**Check:**
1. ✅ Category name matches exactly (case-sensitive)
2. ✅ Code list exists in database
3. ✅ `is_active = TRUE`
4. ✅ Backend service running (port 9093)
5. ✅ Check browser console for errors

**Solution:**
```sql
-- Verify data exists
SELECT * FROM code_list WHERE category = 'YOUR_CATEGORY';
```

### Problem: Seeing "Loading options..." forever

**Causes:**
- Backend not running
- CORS issue
- Network error
- Invalid API endpoint

**Check browser console:**
```
Network tab → Look for failed API calls
Console tab → Look for CORS errors
```

### Problem: Old options still showing

**Cause:** Cache not expired

**Solution:**
```javascript
// Clear cache in browser console
OptionLoaderService.clearFieldCache('fieldId');

// Or clear all
OptionLoaderService.clearOptionCache();
```

---

## 📈 Migration Path

### Existing Forms with Manual Options

**Before:**
```json
{
  "id": "country",
  "type": "select",
  "metadata": {
    "options": ["USA", "CAN", "GBR", "DEU", "FRA"]
  }
}
```

**After (Migration):**
```json
{
  "id": "country",
  "type": "select",
  "metadata": {
    "codeListCategory": "COUNTRY"
  }
}
```

**Steps:**
1. ✅ Create code list entries in database
2. ✅ Open form in designer
3. ✅ Edit field → Switch to "Code List (Database)"
4. ✅ Enter category name
5. ✅ Save form
6. ✅ Test in form entry

---

## 🎓 Best Practices

### DO ✅

- ✅ Use code lists for standardized industry lists (countries, races)
- ✅ Use code lists for options shared across multiple forms
- ✅ Include `display_order` for consistent sorting
- ✅ Keep category names SHORT and UPPERCASE
- ✅ Use meaningful codes (USA vs 001)

### DON'T ❌

- ❌ Use code lists for tiny lists (Yes/No)
- ❌ Mix manual and code list for same category
- ❌ Use spaces in category names (use underscore)
- ❌ Change codes after data entry started (breaks existing data)
- ❌ Delete code list entries (soft delete with `is_active = FALSE`)

---

## 🔗 Related Documentation

- **Form Designer Guide**: `FORM_DESIGNER_SELECT_FIELD_GUIDE.md`
- **Option Loading Architecture**: `SELECT_FIELD_OPTIONS_GUIDE.md`
- **OptionLoaderService API**: `OPTION_LOADING_QUICK_REFERENCE.md`
- **Code List Controller**: `backend/.../CodeListController.java`

---

## ✅ Summary

| Feature | Manual Entry | Code List (Database) |
|---------|-------------|---------------------|
| **Best For** | Small, form-specific lists | Large, shared lists |
| **Setup Time** | Instant | Requires DB setup |
| **Maintainability** | Update each form | Update once in DB |
| **Performance** | Instant (no API) | Cached (fast) |
| **Consistency** | Can vary per form | Guaranteed consistent |
| **Data Entry** | Static list | Dynamic from DB |

**Recommendation:** Use code lists for standardized, reusable option lists. Use manual entry for simple, one-off lists.

---

**Last Updated:** October 15, 2025  
**Version:** 1.0  
**Author:** ClinPrecision Development Team
