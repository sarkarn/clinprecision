# Debug Script: Empty Dropdown Values

## Quick Debugging Instructions

### Step 1: Open Browser Console
- Open your application in Chrome/Firefox
- Press `F12` to open Developer Tools
- Go to **Console** tab

### Step 2: Paste This Debug Code

```javascript
// Debug script for empty dropdown issue
(function debugDropdownOptions() {
    console.log('===== DROPDOWN DEBUG SCRIPT =====');
    
    // Check if FormEntry component is mounted
    const formElement = document.querySelector('[data-testid="form-entry"]') || 
                       document.querySelector('form');
    
    if (!formElement) {
        console.error('❌ Form element not found. Are you on the Form Entry page?');
        return;
    }
    
    console.log('✅ Form element found');
    
    // Check all select elements
    const selects = document.querySelectorAll('select');
    console.log(`\n📊 Found ${selects.length} select elements:\n`);
    
    selects.forEach((select, index) => {
        const optionCount = select.options.length - 1; // Exclude placeholder
        const hasValues = optionCount > 0;
        const label = select.previousElementSibling?.textContent || 'Unknown';
        
        console.log(`${index + 1}. ${label}`);
        console.log(`   Options: ${optionCount}`);
        console.log(`   Status: ${hasValues ? '✅ Has values' : '❌ Empty'}`);
        console.log(`   Disabled: ${select.disabled}`);
        
        if (optionCount > 0) {
            const firstOption = select.options[1];
            console.log(`   First option: ${firstOption?.text}`);
        }
        console.log('');
    });
    
    // Check fieldOptions state (React DevTools required)
    console.log('\n🔍 Checking fieldOptions state...');
    console.log('To see fieldOptions state:');
    console.log('1. Install React DevTools extension');
    console.log('2. Click Components tab');
    console.log('3. Search for FormEntry component');
    console.log('4. Look at "fieldOptions" state');
    
    // Check network requests
    console.log('\n🌐 Check Network Tab:');
    console.log('Look for requests to:');
    console.log('  /api/admin/codelists/simple/{category}');
    console.log('  Status should be 200 OK');
    
    console.log('\n===== END DEBUG =====');
})();
```

### Step 3: Analyze Output

#### If you see:
```
❌ Form element not found
```
→ You're not on the form entry page yet. Navigate to a form first.

#### If you see:
```
1. Patient Country
   Options: 0
   Status: ❌ Empty
```
→ Field has no options. Continue to Step 4.

#### If you see:
```
1. Patient Country
   Options: 195
   Status: ✅ Has values
   First option: United States
```
→ Options loaded successfully! Issue is elsewhere.

---

## Step 4: Check Network Requests

### In Chrome DevTools:
1. Click **Network** tab
2. Filter by "Fetch/XHR"
3. Reload the form page
4. Look for requests like:
   ```
   /api/admin/codelists/simple/COUNTRY
   /api/admin/codelists/simple/GENDER
   ```

### Check Status:

#### ✅ Good Response (200 OK):
```json
[
  {"code": "USA", "name": "United States"},
  {"code": "CAN", "name": "Canada"}
]
```
→ Backend working, data exists. Issue is in frontend.

#### ❌ Bad Response (404):
```
Not Found
```
→ Category doesn't exist in database OR wrong category name.

#### ❌ Empty Array (200 OK):
```json
[]
```
→ Category exists but has no codes. Need to run `clinical_code_lists_data.sql`.

#### ❌ No Request Made:
→ Field doesn't have `codeListCategory` set OR wrong field type.

---

## Step 5: Check Field Metadata

### Method 1: React DevTools
1. Install **React Developer Tools** extension
2. Open DevTools → **Components** tab
3. Search for `FormEntry` component
4. Look at props → `formDefinition` → `fields` → click on a field
5. Check: `field.metadata.codeListCategory`

**Should see:**
```javascript
{
  id: "patient_country",
  type: "select",
  metadata: {
    codeListCategory: "COUNTRY"  ✅
  }
}
```

**Bad examples:**
```javascript
metadata: {
  codeListCategory: undefined  ❌
}
// OR
metadata: {
  codeListCategory: "COUNTRIES"  ❌ (wrong name)
}
```

### Method 2: Browser Console
```javascript
// Get form definition from global state (if available)
const formDef = window.__FORM_DEFINITION__;
console.log(JSON.stringify(formDef.fields, null, 2));
```

---

## Step 6: Check Database

### Connect to MySQL:
```bash
mysql -u root -p clinprecision
```

### Check Available Categories:
```sql
SELECT DISTINCT category, COUNT(*) as code_count
FROM code_lists
GROUP BY category
ORDER BY category;
```

**Expected output:**
```
+---------------------------+------------+
| category                  | code_count |
+---------------------------+------------+
| ALCOHOL_USE               |          7 |
| DOSE_UNIT                 |         13 |
| ETHNICITY                 |          3 |
| FAMILY_HISTORY            |         10 |
| FASTING_STATUS            |          4 |
| FREQUENCY                 |         17 |
| GENDER                    |          5 |
| MEDICAL_HISTORY           |         15 |
| PATIENT_POSITION          |          9 |
| PRESCRIPTION_STATUS       |          6 |
| RACE                      |          8 |
| ROUTE_OF_ADMINISTRATION   |         16 |
| SMOKING_STATUS            |          5 |
| TEMPERATURE_ROUTE         |          6 |
+---------------------------+------------+
```

### If Empty:
```sql
-- Run the SQL script
SOURCE backend/clinprecision-db/data/clinical_code_lists_data.sql;

-- Verify
SELECT COUNT(*) FROM code_lists;
```

**Should see:** 124 rows

---

## Step 7: Common Fixes

### Fix 1: Category Not Set

**Problem:**
```json
{
  "id": "patient_country",
  "type": "select",
  "metadata": {}  ❌ Missing codeListCategory
}
```

**Solution:**
1. Go to Form Designer
2. Edit the field
3. Select "Code List (Database)" option source
4. Choose category from dropdown
5. Save form

---

### Fix 2: Wrong Category Name

**Problem:**
```json
{
  "metadata": {
    "codeListCategory": "COUNTRIES"  ❌ Should be "COUNTRY"
  }
}
```

**Solution:**
Check available categories in database (Step 6), then update field configuration.

---

### Fix 3: Code Lists Not Loaded

**Problem:**
Database query returns 0 rows.

**Solution:**
```bash
cd c:\nnsproject\clinprecision\backend\clinprecision-db
mysql -u root -p clinprecision < data/clinical_code_lists_data.sql
```

---

### Fix 4: Backend Not Running

**Problem:**
Network requests return `net::ERR_CONNECTION_REFUSED`

**Solution:**
```bash
# Start backend
cd backend\clinprecision-clinops-service
.\mvnw.cmd spring-boot:run

# Or if using Docker
docker-compose up
```

---

## Step 8: Add Temporary Console Logs

If issue persists, add logs to **OptionLoaderService.js**:

### Line 36 - After detecting category:
```javascript
if (!optionSource && field.metadata?.codeListCategory) {
    console.log('🔍 [DEBUG] Field:', field.id, 'Category:', field.metadata.codeListCategory);
    optionSource = {
        type: 'CODE_LIST',
        category: field.metadata.codeListCategory,
        cacheable: true,
        cacheDuration: 3600
    };
    console.log('🔍 [DEBUG] Created optionSource:', optionSource);
}
```

### Line 131 - Before API call:
```javascript
const loadCodeListOptions = async (optionSource) => {
    const { category } = optionSource;
    
    console.log('🔍 [DEBUG] Loading code list:', category);
    console.log('🔍 [DEBUG] API URL:', `/clinops-ws/api/admin/codelists/simple/${category}`);
    
    try {
        const response = await ApiService.get(`/clinops-ws/api/admin/codelists/simple/${category}`);
        console.log('🔍 [DEBUG] Response:', response.data);
        // ... rest of code
    }
}
```

### Reload form and check console:
```
🔍 [DEBUG] Field: patient_country Category: COUNTRY
🔍 [DEBUG] Created optionSource: {type: "CODE_LIST", category: "COUNTRY", ...}
🔍 [DEBUG] Loading code list: COUNTRY
🔍 [DEBUG] API URL: /clinops-ws/api/admin/codelists/simple/COUNTRY
🔍 [DEBUG] Response: [{code: "USA", name: "United States"}, ...]
[OptionLoader] Cached 195 options with key: options_patient_country_CODE_LIST_COUNTRY_...
```

If you see `undefined` or `null` anywhere, that's your issue!

---

## Quick Checklist

- [ ] Form Designer: Field has "Code List (Database)" selected
- [ ] Form Designer: Correct category selected from dropdown
- [ ] Database: Code lists table has data (SELECT COUNT(*) FROM code_lists)
- [ ] Database: Category name matches exactly (case-sensitive)
- [ ] Backend: Service running on port 8083
- [ ] Browser: Network tab shows 200 OK for API request
- [ ] Browser: Console shows "[OptionLoader] Cached X options..."
- [ ] Browser: Dropdown has more than just placeholder option

---

## Still Not Working?

### Share These Details:

1. **Browser Console Output:** (copy all [OptionLoader] messages)
2. **Network Tab:** (screenshot of API request/response)
3. **Field Metadata:** (JSON from React DevTools or database)
4. **Database Query Result:**
   ```sql
   SELECT * FROM code_lists WHERE category = 'YOUR_CATEGORY' LIMIT 5;
   ```

This will help identify the exact issue!
