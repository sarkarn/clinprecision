# Dynamic Option Loading - Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OPTION LOADING ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: FORM DEFINITION (Backend)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FormDefinition.json                                                         │
│  {                                                                           │
│    "fields": [                                                               │
│      {                                                                       │
│        "id": "country",                                                      │
│        "type": "select",                                                     │
│        "metadata": {                                                         │
│          "uiConfig": {                                                       │
│            "optionSource": {           ← Configuration                       │
│              "type": "CODE_LIST",      ← Source type                         │
│              "category": "country"     ← Category name                       │
│            }                                                                 │
│          }                                                                   │
│        }                                                                     │
│      }                                                                       │
│    ]                                                                         │
│  }                                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ API Response
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: FORM LOAD (FormEntry.jsx)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  useEffect(() => {                                                           │
│    // 1. Fetch form definition from backend                                 │
│    const definition = await getFormDefinition(formId);                       │
│    setFormDefinition(definition);                                            │
│                                                                              │
│    // 2. For each select/radio/multiselect field                            │
│    for (const field of definition.fields) {                                 │
│      if (['select', 'radio', 'multiselect'].includes(field.type)) {         │
│        await loadFieldOptions(field, context);  ← Trigger loading           │
│      }                                                                       │
│    }                                                                         │
│  }, [formDefinition]);                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Call service
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: OPTION LOADER SERVICE                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  loadFieldOptions(field, context)                                            │
│         │                                                                    │
│         ├─→ 1. Extract optionSource config                                  │
│         │                                                                    │
│         ├─→ 2. Generate cache key                                           │
│         │    "options_country_CODE_LIST_country"                             │
│         │                                                                    │
│         ├─→ 3. Check cache                                                  │
│         │    ├── CACHE HIT? → Return cached options (5-20ms)                │
│         │    └── CACHE MISS? → Continue to loading                          │
│         │                                                                    │
│         └─→ 4. Load based on source type                                    │
│             ├── STATIC      → Format existing options                       │
│             ├── CODE_LIST   → Call backend API                              │
│             ├── STUDY_DATA  → Call with placeholders replaced               │
│             ├── API         → Custom endpoint                               │
│             └── EXTERNAL    → External standard API                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Based on type
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4a: CODE_LIST SOURCE                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  loadCodeListOptions(optionSource)                                           │
│    │                                                                         │
│    ├─→ Extract category: "country"                                          │
│    │                                                                         │
│    ├─→ Call API: GET /clinops-ws/api/admin/codelists/simple/country         │
│    │                                                                         │
│    ├─→ Backend Response:                                                    │
│    │   [                                                                     │
│    │     {"code": "US", "name": "United States", "displayOrder": 1},        │
│    │     {"code": "CA", "name": "Canada", "displayOrder": 2},               │
│    │     ...                                                                 │
│    │   ]                                                                     │
│    │                                                                         │
│    └─→ Format to standard:                                                  │
│        [                                                                     │
│          {"value": "US", "label": "United States", "order": 1},             │
│          {"value": "CA", "label": "Canada", "order": 2},                    │
│          ...                                                                 │
│        ]                                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4b: STUDY_DATA SOURCE                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  loadStudyDataOptions(optionSource, context)                                 │
│    │                                                                         │
│    ├─→ Template: "/clinops-ws/api/studies/{studyId}/sites"                  │
│    │                                                                         │
│    ├─→ Replace placeholders:                                                │
│    │   {studyId} = 123 (from context)                                       │
│    │   Result: "/clinops-ws/api/studies/123/sites"                          │
│    │                                                                         │
│    ├─→ Add filter: "?status=active"                                         │
│    │   Final: "/clinops-ws/api/studies/123/sites?status=active"             │
│    │                                                                         │
│    ├─→ Call API: GET /clinops-ws/api/studies/123/sites?status=active        │
│    │                                                                         │
│    ├─→ Backend Response:                                                    │
│    │   [                                                                     │
│    │     {"id": 1, "name": "Site A", "status": "active"},                   │
│    │     {"id": 2, "name": "Site B", "status": "active"}                    │
│    │   ]                                                                     │
│    │                                                                         │
│    └─→ Extract fields (valueField: "id", labelField: "name"):               │
│        [                                                                     │
│          {"value": 1, "label": "Site A", "id": 1, "name": "Site A", ...},   │
│          {"value": 2, "label": "Site B", "id": 2, "name": "Site B", ...}    │
│        ]                                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Cache + Return
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: CACHE STORAGE                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  In-Memory Cache (Map)                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Key: "options_country_CODE_LIST_country"                           │    │
│  │ Value: {                                                            │    │
│  │   data: [{value: "US", label: "United States"}, ...],              │    │
│  │   timestamp: 1705320000000                                          │    │
│  │ }                                                                   │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │ Key: "options_siteId_STUDY_DATA_.../sites_123__status=active"     │    │
│  │ Value: {                                                            │    │
│  │   data: [{value: 1, label: "Site A"}, ...],                        │    │
│  │   timestamp: 1705320060000                                          │    │
│  │ }                                                                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Cache Duration: 1 hour (configurable per field)                            │
│  Cache Key Format: options_{fieldId}_{sourceType}_{category}_{context}      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Update state
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: UI RENDERING (FormEntry.jsx)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  const options = fieldOptions[field.id] || [];                              │
│  const isLoadingOptions = loadingOptions[field.id];                         │
│                                                                              │
│  BEFORE OPTIONS LOAD:                     AFTER OPTIONS LOAD:               │
│  ┌────────────────────────────┐          ┌────────────────────────────┐    │
│  │ Country                    │          │ Country                    │    │
│  │ ┌────────────────────────┐ │          │ ┌────────────────────────┐ │    │
│  │ │ ⏳ Loading options...  │ │ Loading  │ │ Select an option ▼     │ │    │
│  │ └────────────────────────┘ │ ──────→  │ └────────────────────────┘ │    │
│  │ (select disabled)          │          │ ┌────────────────────────┐ │    │
│  └────────────────────────────┘          │ │ United States          │ │    │
│                                           │ │ Canada                 │ │    │
│  Loading State:                           │ │ United Kingdom         │ │    │
│  - "Loading options..." text              │ │ ...                    │ │    │
│  - Animated spinner                       │ └────────────────────────┘ │    │
│  - Select disabled                        └────────────────────────────┘    │
│  - No crash if backend slow                                                 │
│                                           Options Loaded:                    │
│                                           - All options visible              │
│                                           - Select enabled                   │
│                                           - Descriptions in tooltips         │
│                                           - Validation ready                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ CACHING FLOW DIAGRAM                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  First Load (Cache Miss)              Second Load (Cache Hit)
  ───────────────────────              ───────────────────────

  User Opens Form                      User Opens Form
        │                                    │
        ├─→ Check Cache                     ├─→ Check Cache
        │   └─→ Empty ❌                     │   └─→ Found ✅
        │                                    │
        ├─→ Call Backend API                 ├─→ Return from Cache
        │   └─→ 200-500ms ⏱                  │   └─→ 5-20ms ⚡
        │                                    │
        ├─→ Format Options                   └─→ Render Instantly
        │                                    
        ├─→ Store in Cache
        │   └─→ TTL: 1 hour ⏲
        │
        └─→ Render Options


┌─────────────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING FLOW                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

  Backend API Call
        │
        ├─→ SUCCESS (200) ✅
        │   ├─→ Format options
        │   ├─→ Cache options
        │   └─→ Render options
        │
        ├─→ ERROR (500) ❌
        │   ├─→ Log error to console
        │   ├─→ Check for stale cache
        │   │   ├─→ Stale cache found?
        │   │   │   └─→ Use stale data (graceful degradation)
        │   │   └─→ No stale cache?
        │   │       └─→ Return empty array []
        │   └─→ Render empty select (no crash)
        │
        └─→ TIMEOUT ⏱
            └─→ Same as error handling


┌─────────────────────────────────────────────────────────────────────────────┐
│ PLACEHOLDER REPLACEMENT (STUDY_DATA)                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  URL Pattern: /studies/{studyId}/sites/{siteId}/subjects
                      ↓              ↓                  ↓
  Context:     studyId=123     siteId=456        (from URL)
                      ↓              ↓
  Result:      /studies/123/sites/456/subjects


  Available Placeholders:
  ┌──────────────────┬─────────────────────────────────────┐
  │ Placeholder      │ Source                              │
  ├──────────────────┼─────────────────────────────────────┤
  │ {studyId}        │ URL: /studies/:studyId/...          │
  │ {siteId}         │ URL: .../sites/:siteId/...          │
  │ {subjectId}      │ URL: .../subjects/:subjectId/...    │
  │ {visitId}        │ URL: .../visits/:visitId/...        │
  │ {formId}         │ URL: .../forms/:formId              │
  └──────────────────┴─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ DATA FORMAT TRANSFORMATION                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Backend Response (varies by source):
  ┌──────────────────────────────────────────────────────────────┐
  │ CODE_LIST:                                                    │
  │ {"code": "US", "name": "United States", "displayOrder": 1}   │
  │                                                               │
  │ STUDY_DATA:                                                   │
  │ {"id": 123, "name": "Site A", "status": "active"}            │
  │                                                               │
  │ STATIC:                                                       │
  │ {"value": "yes", "label": "Yes"}                             │
  └──────────────────────────────────────────────────────────────┘
                              ↓
                    [Transformation]
                              ↓
  Standard Format (consistent):
  ┌──────────────────────────────────────────────────────────────┐
  │ {                                                             │
  │   value: "US" | 123 | "yes",      ← Used as option value     │
  │   label: "United States" | "...",  ← Displayed to user       │
  │   description: "...",              ← Shown in tooltip         │
  │   order: 1,                        ← Sort order (optional)    │
  │   ...originalFields                ← All original data kept   │
  │ }                                                             │
  └──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ SUMMARY: BENEFITS                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

  BEFORE (Static Options Only)              AFTER (Dynamic Loading)
  ────────────────────────────              ──────────────────────

  ❌ Options hardcoded in form definition   ✅ Options loaded dynamically
  ❌ Same options for all studies           ✅ Context-aware options
  ❌ Difficult to update                    ✅ Centralized management
  ❌ No caching                             ✅ Smart caching (1 hour)
  ❌ Duplicate data across forms            ✅ Reusable code lists
  ❌ No loading feedback                    ✅ Loading indicators
  ❌ Crashes on slow network                ✅ Graceful error handling


  Performance Comparison:
  ────────────────────────────────────────────────────────
  Static Options:        Instant (0ms) but inflexible
  Dynamic (First Load):  200-500ms but context-aware
  Dynamic (Cached):      5-20ms ⚡ + context-aware ✅


  Maintenance Comparison:
  ────────────────────────────────────────────────────────
  Static:   Update in 50 form definitions manually
  Dynamic:  Update in 1 code list, all forms update automatically
