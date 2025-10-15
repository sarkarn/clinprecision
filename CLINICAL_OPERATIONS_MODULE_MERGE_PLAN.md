# Clinical Operations Module Merge Plan
## Consolidating Subject Management + Data Capture

**Date:** October 14, 2025  
**Decision:** MERGE two modules into one unified "Clinical Operations" module  
**Effort:** 2 days (minimal since Data Capture barely implemented)  
**Priority:** HIGH - Foundational architectural decision

---

## 🎯 Executive Decision

### MERGE: Subject Management (55%) + Data Capture (15%) → Clinical Operations (40%)

**Why This Is Simple:**
1. ✅ Data Capture module has minimal implementation (just basic forms UI)
2. ✅ Subject Management has most of the working code
3. ✅ No breaking changes - just moving files and updating imports
4. ✅ Frontend routing already uses `/datacapture-management/` which becomes `/clinical-operations/`

---

## 📦 What Exists Today

### Subject Management Module (55% Complete)
**Backend:** `backend/clinprecision-clinops-service`
- ✅ Patient registration (event sourcing)
- ✅ Patient enrollment (event sourcing)
- ✅ Status transitions with validation
- ✅ Status history audit trail
- ✅ Visit projector (study_visit_instances)

**Frontend:** `frontend/clinprecision/src/components/modules/subjectmanagement`
- ✅ SubjectManagementDashboard
- ✅ SubjectList (with status filters)
- ✅ StatusChangeModal
- ✅ StatusTransitionDiagram
- ✅ PatientEnrollmentModal

### Data Capture Module (15% Complete) 
**Backend:** SAME as Subject Management (`clinops-service` - already merged!)

**Frontend:** `frontend/clinprecision/src/components/modules/datacapture`
- ✅ DataCaptureDashboard
- ✅ SubjectList (duplicate!)
- ✅ SubjectEnrollment (duplicate!)
- ✅ SubjectDetails
- ✅ FormEntry.jsx (basic)
- ✅ FormView.jsx (basic)
- ✅ VisitDetails.jsx (basic)

**Observation:** Frontend has DUPLICATED components! Both modules have SubjectList and SubjectEnrollment.

---

## 🔄 Merge Strategy: Keep Best of Both

### Step 1: Choose Primary Module
**Decision: Use `datacapture` as base** because:
- ✅ Better name alignment (`/clinical-operations/` makes more sense than `/subject-management/`)
- ✅ Already has visit and form components
- ✅ URL structure already established

### Step 2: Move Files (Frontend)
```
SOURCE: frontend/clinprecision/src/components/modules/subjectmanagement/
DEST:   frontend/clinprecision/src/components/modules/datacapture/

Files to MOVE:
├── components/
│   ├── StatusChangeModal.jsx          → datacapture/subject-lifecycle/
│   ├── StatusTransitionDiagram.jsx    → datacapture/subject-lifecycle/
│   ├── PatientEnrollmentModal.jsx     → datacapture/subject-lifecycle/
│   └── UnscheduledVisitModal.jsx      → datacapture/visit-management/
├── SubjectManagementDashboard.jsx     → MERGE into DataCaptureDashboard
└── SubjectList.jsx                    → KEEP datacapture version (more complete)

Files to DELETE:
└── subjectmanagement/SubjectList.jsx (duplicate)
└── subjectmanagement/SubjectEnrollment.jsx (duplicate - use datacapture version)
```

### Step 3: Rename Module
```
OLD: frontend/clinprecision/src/components/modules/datacapture
NEW: frontend/clinprecision/src/components/modules/clinical-operations

OLD URL: /datacapture-management/*
NEW URL: /clinical-operations/* (or keep /datacapture-management/ for now)
```

### Step 4: Reorganize Structure
```
clinical-operations/
├── ClinicalOperationsModule.jsx (main router)
├── ClinicalOperationsDashboard.jsx (merged dashboard)
│
├── subject-lifecycle/
│   ├── PatientRegistration.jsx
│   ├── PatientList.jsx
│   ├── PatientDetails.jsx
│   ├── SubjectEnrollment.jsx
│   ├── SubjectList.jsx
│   ├── SubjectDetails.jsx
│   ├── StatusChangeModal.jsx
│   ├── StatusTransitionDiagram.jsx
│   └── PatientEnrollmentModal.jsx
│
├── visit-management/
│   ├── VisitSchedule.jsx (TODO)
│   ├── VisitDetails.jsx
│   ├── VisitList.jsx
│   └── UnscheduledVisitModal.jsx
│
├── data-entry/
│   ├── forms/
│   │   ├── FormList.jsx
│   │   ├── FormEntry.jsx
│   │   └── FormView.jsx
│   └── (future: SDV components)
│
└── compliance/ (future)
    ├── ProtocolDeviations.jsx
    ├── EligibilityAssessment.jsx
    └── InformedConsent.jsx
```

---

## 🗺️ Navigation Update (Industry Standard)

### Current Navigation (Before Merge)
```
Home
User Management
Organization Management
Site Management
Study Management
  ├── Study Design
  └── Study List
Subject Management          ← Remove
  ├── Dashboard
  ├── Subject List
  └── Enroll Subject
Data Capture Management     ← Rename
  ├── Dashboard
  ├── Subjects
  └── Forms
Data Quality Management
```

### New Navigation (After Merge) - Industry Standard
```
Home
── Administration ──
   ├── User Management
   ├── Organization Management
   └── Site Management

── Study Setup ──
   ├── Study Design
   └── Study List

── Clinical Operations ──      ← NEW MERGED MODULE
   ├── Dashboard
   ├── Subject Management
   │   ├── Subject List
   │   ├── Enroll Subject
   │   └── Patient Registration
   ├── Visit Management
   │   ├── Visit Schedule
   │   └── Visit Tracking
   ├── Data Entry
   │   ├── Form List
   │   └── Data Collection
   └── Compliance
       ├── Protocol Deviations
       └── Screening

── Quality & Compliance ──
   ├── Data Quality
   ├── Medical Coding
   └── Query Management

── Reporting ──
   └── Study Reports
```

---

## 📝 Implementation Checklist

### Day 1: File Organization (4 hours)
- [ ] Create new folder structure in `clinical-operations/`
- [ ] Move StatusChangeModal from subjectmanagement → clinical-operations/subject-lifecycle/
- [ ] Move StatusTransitionDiagram from subjectmanagement → clinical-operations/subject-lifecycle/
- [ ] Move PatientEnrollmentModal from subjectmanagement → clinical-operations/subject-lifecycle/
- [ ] Move UnscheduledVisitModal from subjectmanagement → clinical-operations/visit-management/
- [ ] Merge dashboards (combine best features from both)
- [ ] Delete duplicate SubjectList.jsx from subjectmanagement
- [ ] Delete duplicate SubjectEnrollment.jsx from subjectmanagement
- [ ] Update all import statements

### Day 1: Routing Updates (2 hours)
- [ ] Update App.jsx main routes
- [ ] Update Sidebar.jsx navigation
- [ ] Update internal route references
- [ ] Test all navigation links

### Day 2: Navigation UI (Industry Standard) (4 hours)
- [ ] Implement collapsible sections in Sidebar
- [ ] Add icons for each section
- [ ] Group related modules visually
- [ ] Update active route highlighting
- [ ] Test navigation UX

### Day 2: Documentation & Cleanup (2 hours)
- [ ] Update MODULE_PROGRESS_TRACKER.md
- [ ] Update README files
- [ ] Remove old subjectmanagement folder
- [ ] Git commit with clear message

---

## 🎨 New Navigation UI Component

### Enhanced Sidebar with Sections

```jsx
// Sidebar.jsx - Industry Standard Grouped Navigation

const navigationSections = [
  {
    title: "Administration",
    icon: <Settings />,
    items: [
      { path: "/user-management", label: "User Management", icon: <Users /> },
      { path: "/organization-management", label: "Organizations", icon: <Building /> },
      { path: "/site-management", label: "Sites", icon: <MapPin /> }
    ]
  },
  {
    title: "Study Setup",
    icon: <FlaskConical />,
    items: [
      { path: "/study-design", label: "Study Design", icon: <FileText /> },
      { path: "/study-management", label: "Study List", icon: <List /> }
    ]
  },
  {
    title: "Clinical Operations",
    icon: <Activity />,
    highlighted: true, // Current focus
    items: [
      { path: "/clinical-operations", label: "Dashboard", icon: <LayoutDashboard /> },
      { 
        path: "/clinical-operations/subjects", 
        label: "Subject Management", 
        icon: <UserCheck />,
        subitems: [
          { path: "/clinical-operations/subjects", label: "Subject List" },
          { path: "/clinical-operations/enroll", label: "Enroll Subject" },
          { path: "/clinical-operations/patients", label: "Patient Registry" }
        ]
      },
      { 
        path: "/clinical-operations/visits", 
        label: "Visit Management", 
        icon: <Calendar />,
        subitems: [
          { path: "/clinical-operations/visits/schedule", label: "Visit Schedule" },
          { path: "/clinical-operations/visits/tracking", label: "Visit Tracking" }
        ]
      },
      { 
        path: "/clinical-operations/data-entry", 
        label: "Data Entry", 
        icon: <Edit3 />,
        subitems: [
          { path: "/clinical-operations/forms", label: "Forms" },
          { path: "/clinical-operations/data-collection", label: "Data Collection" }
        ]
      }
    ]
  },
  {
    title: "Quality & Compliance",
    icon: <Shield />,
    items: [
      { path: "/data-quality", label: "Data Quality", icon: <CheckSquare /> },
      { path: "/medical-coding", label: "Medical Coding", icon: <Code /> },
      { path: "/query-management", label: "Queries", icon: <MessageSquare /> }
    ]
  },
  {
    title: "Reporting",
    icon: <BarChart3 />,
    items: [
      { path: "/reports", label: "Study Reports", icon: <FileBarChart /> }
    ]
  }
];

// Render with collapsible sections
{navigationSections.map(section => (
  <SidebarSection key={section.title} section={section} />
))}
```

---

## ✅ Success Criteria

### Technical
- [ ] All routes working (no 404s)
- [ ] All imports resolved (no errors)
- [ ] Navigation active states correct
- [ ] No duplicate code between modules

### UX
- [ ] Users can find all features easily
- [ ] Navigation follows industry standard (grouped by function)
- [ ] Clear visual hierarchy
- [ ] Intuitive menu structure

### Documentation
- [ ] MODULE_PROGRESS_TRACKER.md updated
- [ ] File structure documented
- [ ] Migration notes for team

---

## 📊 Impact Assessment

### Code Changes
- **Files Moved:** ~15 files
- **Files Deleted:** ~5 duplicate files
- **New Files:** 1 (merged dashboard)
- **Import Updates:** ~30 files

### Breaking Changes
- **URLs:** Optional (can keep `/datacapture-management/` initially)
- **APIs:** None (backend already unified)
- **Database:** None

### Benefits
- ✅ Clearer module boundaries
- ✅ No more duplicated components
- ✅ Industry-standard navigation
- ✅ Better UX for clinical staff
- ✅ Foundation for future features (screening, ICF, randomization)

---

## 🚀 Next Steps After Merge

With unified module, can immediately start:
1. **Protocol Visit Instantiation** (Week 1-2)
2. **Visit-Form Association** (Week 2-3)
3. **Screening Workflow** (Week 3-4)
4. **Eligibility Engine** (Week 5-6)

All these features now have a clear home: **Clinical Operations Module**

---

## 📚 References

- `DATA_CAPTURE_VS_SUBJECT_MANAGEMENT_ANALYSIS.md` - Detailed gap analysis
- `MODULE_PROGRESS_TRACKER.md` - Overall progress tracking
- Industry benchmarks: Medidata Rave, Oracle InForm, REDCap

---

**Decision Owner:** Product/Engineering Lead  
**Implementation Owner:** Development Team  
**Target Completion:** October 16, 2025 (2 days)
