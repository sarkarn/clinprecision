# Code List Options - Quick Start (30 seconds)

## What You See Now vs What You Need

### ❌ OLD WAY (Manual - Tedious for large lists)
```
Options (one per line)
┌───────────────────────┐
│ United States         │
│ Canada                │
│ United Kingdom        │
│ Germany               │
│ France                │
│ ... (type 200 more)   │
└───────────────────────┘
```

### ✅ NEW WAY (Database - Automatic)
```
◉ Code List (Database)

Code List Category
┌───────────────────────┐
│ COUNTRY               │  ← Just type this!
└───────────────────────┘

✨ 200+ countries load automatically from database
```

---

## 3-Step Setup

### Step 1: Make sure data exists in database

```sql
SELECT * FROM code_list WHERE category = 'COUNTRY';
```

If empty, insert sample data:
```sql
INSERT INTO code_list (category, code, name, display_order) VALUES
('COUNTRY', 'USA', 'United States', 1),
('COUNTRY', 'CAN', 'Canada', 2),
('COUNTRY', 'GBR', 'United Kingdom', 3);
```

### Step 2: In Form Designer

1. Edit your select/dropdown field
2. Click **"Code List (Database)"** radio button
3. Type: `COUNTRY`
4. Save

### Step 3: Test in Form Entry

Open form → See dropdown with all countries loaded automatically! 🎉

---

## Common Categories (Use these exactly)

| Category | Description | Example Values |
|----------|-------------|----------------|
| `COUNTRY` | Countries | United States, Canada, UK |
| `SEX` | Gender | Male, Female, Other |
| `RACE` | Race | Caucasian, Asian, Black |
| `ETHNIC` | Ethnicity | Hispanic, Non-Hispanic |
| `VISIT_TYPE` | Visit types | Screening, Follow-up |
| `SITE_STATUS` | Site status | Active, Inactive |

---

## UI Screenshot Preview

### Form Designer:
```
┌───────────────────────────────────────────────────────────┐
│ Options Source:                                           │
│                                                           │
│ ◉ Manual Entry         ○ Code List (Database)            │
│                                                           │
│ Options (one per line)                                    │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Option 1                                          │   │
│ │ Option 2                                          │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ Enter one option per line...                             │
└───────────────────────────────────────────────────────────┘
```

**Switch to:**

```
┌───────────────────────────────────────────────────────────┐
│ Options Source:                                           │
│                                                           │
│ ○ Manual Entry         ◉ Code List (Database)            │
│                                                           │
│ Code List Category                                        │
│ ┌───────────────────────────────────────────────────┐   │
│ │ COUNTRY                                           │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ ℹ️ Options will be loaded dynamically from database      │
│    Common: COUNTRY, SEX, RACE, ETHNIC, VISIT_TYPE        │
└───────────────────────────────────────────────────────────┘
```

---

## What Happens Behind the Scenes

```
Form Entry Opens
       ↓
Detects: field.metadata.codeListCategory = "COUNTRY"
       ↓
API Call: GET /api/admin/codelists/simple/COUNTRY
       ↓
Response: [{code: "USA", name: "United States"}, ...]
       ↓
Dropdown Populated: "United States", "Canada", ...
       ↓
Cached for 1 hour (no more API calls)
```

---

## Troubleshooting (10 seconds)

**Problem:** Options not showing

**Fix:**
```sql
-- Check data exists
SELECT * FROM code_list WHERE category = 'YOUR_CATEGORY';
```

**Problem:** Category name wrong

**Fix:** Category names are **CASE-SENSITIVE**. Use exactly: `COUNTRY` (not `Country` or `country`)

---

## Complete Example

### Database:
```sql
INSERT INTO code_list (category, code, name) VALUES
('ENROLLMENT_STATUS', 'SCREENING', 'Screening'),
('ENROLLMENT_STATUS', 'ENROLLED', 'Enrolled'),
('ENROLLMENT_STATUS', 'COMPLETED', 'Completed');
```

### Form Designer:
```
Field: "Enrollment Status"
Type: Dropdown
Options: ◉ Code List (Database)
Category: ENROLLMENT_STATUS
```

### Result in Form:
```
Enrollment Status: [Select... ▼]
                   ├─ Screening
                   ├─ Enrolled
                   └─ Completed
```

**Done!** 🚀

---

## Full Documentation

See: `CODELIST_DYNAMIC_OPTIONS_GUIDE.md` for complete details.
