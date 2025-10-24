# TypeScript Migration - Visual Roadmap
**Quick Reference Guide for ClinPrecision Frontend Migration**

**Version:** 1.0  
**Date:** October 24, 2025  
**Status:** 🎯 Phase 1 Complete | Starting Phase 2

---

## 🎯 Migration At a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    TYPESCRIPT MIGRATION                          │
│                         16 Weeks                                 │
└─────────────────────────────────────────────────────────────────┘

Week 1:  ✅ COMPLETE - Phase 1: Core Services (10 services, 93 hooks)
Week 2:  🎯 CURRENT - Phase 2.1: Data Capture Services (7 services)
Week 3:  ⏳ Phase 2.2: Security Services (7 services)
Week 4:  ⏳ Phase 2.3: Infrastructure Services (6 services)
Week 5-6:  ⏳ Phase 3.1: Trial Design Management (30 components)
Week 7-8:  ⏳ Phase 3.2: Trial Design Wizards (35 components)
Week 9-10: ⏳ Phase 3.3: Data Capture Module (30 components)
Week 11:   ⏳ Phase 3.4: Shared Components (25 components)
Week 12:   ⏳ Phase 3.5: Other Modules (100 components)
Week 13-14: ⏳ Phase 4: Testing & Quality
Week 15-16: ⏳ Phase 5: Production Readiness
```

---

## 📊 Progress Dashboard

### Overall Statistics

```
Services:     10/42  ✅ (24% complete)
Components:   3/350  ⏳ (1% complete)
Hooks:        5/25   ⏳ (20% complete)
Utils:        0/15   ⏳ (0% complete)
Types:        2/30   ⏳ (7% complete)
──────────────────────────────────────
Overall:      20/462 ⏳ (4% complete)
```

### By Module

| Module | Progress | Components | Priority |
|--------|----------|-----------|----------|
| **Services** | ████████░░ 24% | 10/42 | ✅ In Progress |
| **Trial Design** | ░░░░░░░░░░ 0% | 0/120 | 🔴 Next (Week 5) |
| **Data Capture** | ░░░░░░░░░░ 0% | 0/80 | 🔴 Week 9 |
| **Shared/UI** | █░░░░░░░░░ 6% | 3/50 | 🔴 Week 11 |
| **Site Ops** | ░░░░░░░░░░ 0% | 0/40 | 🟡 Week 12 |
| **Org Admin** | ░░░░░░░░░░ 0% | 0/30 | 🟢 Week 12 |
| **Other** | ░░░░░░░░░░ 0% | 0/50 | 🟡 Week 12 |

---

## 🗂️ Folder Structure Transformation

### Before (Current)
```
src/
├── services/        📁 42 files (10 .ts ✅, 32 .js ❌)
├── components/      📁 350 .jsx files ❌
├── hooks/          📁 5 .js files ❌
├── utils/          📁 Mixed .js/.ts ⚠️
├── types/          📁 2 .ts files ✅
├── contexts/       ❌ MISSING
├── constants/      📁 Mixed .js/.ts ⚠️
└── config.js       ❌ Needs migration
```

### After (Target)
```
src/
├── services/        📁 Organized by domain
│   ├── core/                    ✅ 10 services DONE
│   ├── data-capture/            ⏳ 5 services (Week 2)
│   ├── study-management/        ⏳ 4 services (Week 2-3)
│   ├── quality/                 ⏳ 2 services (Week 3)
│   ├── security/                ⏳ 4 services (Week 3)
│   ├── infrastructure/          ⏳ 4 services (Week 4)
│   └── versioning/              ⏳ 1 service (Week 4)
│
├── components/      📁 Modular architecture
│   ├── layouts/                 🆕 Layout shells (Week 5)
│   ├── shared/                  🆕 Reusable library (Week 11)
│   └── modules/                 📁 Clinical modules
│       ├── trialdesign/         ⏳ 120 components (Week 5-8)
│       ├── datacapture/         ⏳ 80 components (Week 9-10)
│       ├── site-operations/     ⏳ 40 components (Week 12)
│       ├── organization-admin/  ⏳ 30 components (Week 12)
│       └── [others]/            ⏳ 80 components (Week 12)
│
├── hooks/           📁 Custom hooks library
│   ├── api/                     🆕 React Query hooks (co-located)
│   ├── ui/                      🆕 UI hooks (Week 3)
│   ├── business/                🆕 Business logic (Week 3)
│   └── form/                    🆕 Form hooks (Week 4)
│
├── types/           📁 Centralized types
│   ├── domain/                  🆕 Entity types (Week 2-3)
│   ├── enums/                   🆕 Enumerations (Week 2-3)
│   └── api.types.ts             🆕 API types (Week 2)
│
├── contexts/        📁 React contexts
│   ├── AuthContext.tsx          🆕 (Week 3)
│   ├── StudyDesignContext.tsx   🆕 (Week 5)
│   └── [others]/                🆕 (Various weeks)
│
├── utils/           📁 Utility functions
│   ├── api/                     🆕 API utilities (Week 4)
│   ├── date/                    🆕 Date utilities (Week 4)
│   ├── validation/              🆕 Validators (Week 4)
│   └── [others]/                🆕 (Week 4)
│
├── constants/       📁 Application constants
│   ├── api.constants.ts         🆕 (Week 4)
│   ├── routes.constants.ts      🆕 (Week 4)
│   └── [others]/                🆕 (Week 4)
│
└── config/          📁 Configuration
    ├── env.config.ts            🆕 (Week 4)
    ├── queryClient.config.ts    🆕 (Week 2)
    └── app.config.ts            🆕 (Week 4)
```

---

## 🏗️ Architecture Evolution

### Current Architecture (Hybrid)
```
┌───────────────────────────────────────┐
│        React Components (.jsx)        │
│           ↓ Direct Calls              │
│      Services (.js + .ts mixed)       │  ← Phase 1: 24% TypeScript
│           ↓ API Calls                 │
│         ApiService (.js)              │
│           ↓ HTTP                      │
│        Backend Microservices          │
└───────────────────────────────────────┘

Issues:
❌ Mixed .js and .ts files
❌ No type safety in components
❌ Direct service calls (tight coupling)
❌ No centralized state management
❌ Large monolithic components (1100+ LOC)
```

### Target Architecture (Clean Architecture + DDD)
```
┌───────────────────────────────────────────────────────┐
│           PRESENTATION LAYER                          │
│  React Components (.tsx) - Modules by Domain         │
│  ├── Trial Design Module                             │
│  ├── Data Capture Module                             │
│  └── [Other Modules]                                 │
└───────────────────────────────────────────────────────┘
                    ↓ Uses Hooks
┌───────────────────────────────────────────────────────┐
│          APPLICATION LAYER                            │
│  React Query Hooks + Context Providers               │
│  ├── useStudies, useSubjects, etc.                   │
│  ├── StudyDesignContext                              │
│  └── AuthContext                                     │
└───────────────────────────────────────────────────────┘
                    ↓ Calls Services
┌───────────────────────────────────────────────────────┐
│            DOMAIN LAYER                               │
│  TypeScript Services (.ts) + Types                   │
│  ├── StudyService.ts                                 │
│  ├── SubjectService.ts                               │
│  └── Business Logic & Transformations                │
└───────────────────────────────────────────────────────┘
                    ↓ Uses Infrastructure
┌───────────────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER                          │
│  ApiService.ts, Utilities, External Services         │
│  └── HTTP Client, WebSocket, Email, etc.             │
└───────────────────────────────────────────────────────┘

Benefits:
✅ 100% TypeScript (type safety)
✅ Loose coupling (hooks pattern)
✅ Centralized state (React Query)
✅ Modular components (<400 LOC)
✅ Clear domain boundaries
✅ Reusable components library
```

---

## 📅 Week-by-Week Breakdown

### ✅ Week 1: Foundation (COMPLETE)
**Phase 1: Core Services**

✅ **Completed:**
- StudyService.ts (7 hooks)
- SiteService.ts (15 hooks)
- StudyDesignService.ts (13 hooks)
- FormService.ts (11 hooks)
- VisitDefinitionService.ts (11 hooks)
- VisitService.ts (6 hooks)
- OrganizationService.ts (9 hooks)
- UserService.ts (8 hooks)
- SubjectService.ts (7 hooks)
- StudyVersioningService.ts (6 hooks)

**Metrics:**
- Services: 10 ✅
- Hooks: 93 ✅
- Lines: ~5,000 TypeScript
- Build: ✅ Passing (0 TS errors)

---

### 🎯 Week 2: Data Capture Services (CURRENT)
**Phase 2.1: Patient & Form Services**

**Target Services (7):**
1. PatientEnrollmentService.ts (8-10 hooks)
2. PatientStatusService.ts (5-6 hooks)
3. DataEntryService.ts (6-8 hooks)
4. FormDataService.ts (7-9 hooks)
5. VisitFormService.ts (6-7 hooks)
6. StudyDocumentService.ts (6-8 hooks)
7. StudyFormService.ts (7-9 hooks)

**Deliverables:**
- [ ] 7 services converted to TypeScript
- [ ] ~50 React Query hooks created
- [ ] Type definitions for Patient, FormData, Document
- [ ] Build passing
- [ ] Documentation updated

**Daily Breakdown:**
- **Mon-Tue:** PatientEnrollmentService.ts + PatientStatusService.ts
- **Wed:** DataEntryService.ts + FormDataService.ts
- **Thu:** VisitFormService.ts + StudyDocumentService.ts
- **Fri:** StudyFormService.ts + testing + docs

---

### ⏳ Week 3: Security Services
**Phase 2.2: Authentication & Quality**

**Target Services (7):**
1. LoginService.ts (3-4 hooks)
2. RoleService.ts (5-6 hooks)
3. UserTypeService.ts (4-5 hooks)
4. UserStudyRoleService.ts (5-6 hooks)
5. ProtocolDeviationService.ts (6-8 hooks)
6. ValidationEngine.ts (4-5 hooks)
7. FormVersionService.ts (6-7 hooks)

**Deliverables:**
- [ ] 7 services converted
- [ ] ~40 React Query hooks
- [ ] AuthContext created
- [ ] Security testing

---

### ⏳ Week 4: Infrastructure
**Phase 2.3: Core Infrastructure**

**Target Services (6):**
1. ApiService.ts (critical - HTTP client)
2. WebSocketService.ts (real-time updates)
3. EmailService.ts (EmailJS integration)
4. OptionLoaderService.ts (dynamic options)
5. StudyDatabaseBuildService.ts (8-10 hooks)
6. StudyOrganizationService.ts (5-6 hooks)

**Deliverables:**
- [ ] All 42 services now TypeScript ✅
- [ ] Remove all .js service files
- [ ] ~35 React Query hooks
- [ ] Infrastructure configs migrated

**🎉 Milestone:** Service layer 100% TypeScript!

---

### ⏳ Week 5-6: Trial Design Management
**Phase 3.1: Study CRUD Components**

**Target Components (30):**

**Study Management (15):**
- [ ] StudyListGrid.tsx
- [ ] EnhancedStudyListGrid.tsx
- [ ] ModernStudyListGrid.tsx
- [ ] StudyOverviewDashboard.tsx
- [ ] EnhancedStudyOverviewDashboard.tsx
- [ ] DocumentUploadModal.tsx
- [ ] VersionManagementModal.tsx
- [ ] [8 more components]

**Study Design Wizards (15):**
- [ ] **StudyDesignDashboard.tsx** (REFACTOR!)
  - Split 1100 LOC into 8+ components
  - Create StudyDesignContext
  - Modular phase components
- [ ] VisitScheduleDesigner.tsx
- [ ] StudyArmsDesigner.tsx
- [ ] FormBindingDesigner.tsx
- [ ] [11 more components]

**Deliverables:**
- [ ] 30 components converted
- [ ] StudyDesignContext implemented
- [ ] Modular architecture pattern established
- [ ] Component size <400 LOC

---

### ⏳ Week 7-8: Trial Design Creation
**Phase 3.2: Wizards & Database Build**

**Target Components (35):**

**Study Creation (10):**
- [ ] StudyCreationWizard.tsx (refactor with WizardShell)
- [ ] StudyEditWizard.tsx
- [ ] BasicInformationStep.tsx
- [ ] OrganizationsRegulatoryStep.tsx
- [ ] TimelinePersonnelStep.tsx
- [ ] ReviewConfirmationStep.tsx
- [ ] [4 more components]

**Database Build (15):**
- [ ] StudyDatabaseBuildPage.tsx
- [ ] BuildStatusBadge.tsx
- [ ] BuildProgressBar.tsx
- [ ] [12 more components]

**Protocol Management (5):**
- [ ] ProtocolManagementDashboard.tsx
- [ ] [4 more components]

**Shared Trial Design (5):**
- [ ] FormProgressIndicator.tsx
- [ ] [4 more components]

**Deliverables:**
- [ ] WizardShell reusable component
- [ ] Database build module complete
- [ ] Protocol versioning UI

---

### ⏳ Week 9-10: Data Capture Module
**Phase 3.3: Patient & Visit Management**

**Target Components (30):**

**Subject Management (10):**
- [ ] PatientList.tsx
- [ ] SubjectList.tsx
- [ ] PatientDetails.tsx
- [ ] SubjectDetails.tsx
- [ ] PatientRegistration.tsx
- [ ] SubjectEnrollment.tsx
- [ ] SubjectEdit.tsx
- [ ] [3 more]

**Visit Management (5):**
- [ ] VisitList.tsx
- [ ] VisitDetails.tsx
- [ ] FormSelectorModal.tsx
- [ ] [2 more]

**Form Data Capture (8):**
- [ ] FormView.tsx
- [ ] FormEntry.tsx
- [ ] FormList.tsx
- [ ] FormStatus.tsx
- [ ] [4 more]

**Protocol Deviations (5):**
- [ ] DeviationDashboard.tsx
- [ ] [4 more]

**Deliverables:**
- [ ] Data capture workflow complete
- [ ] Subject enrollment tested
- [ ] Form entry validated

---

### ⏳ Week 11: Shared Components
**Phase 3.4: Component Library**

**Target Components (25):**

**Basic UI (10):**
- [ ] Button.tsx
- [ ] Card.tsx
- [ ] Badge.tsx
- [ ] SearchBar.tsx
- [ ] FormField.tsx
- [ ] ListControls.tsx
- [ ] [4 more]

**Application Shared (5):**
- [ ] PatientStatusBadge.tsx
- [ ] TopNavigationHeader.tsx
- [ ] CodeListDropdown.tsx
- [ ] [2 more]

**Form Components (5):**
- [ ] FormInput.tsx
- [ ] FormSelect.tsx
- [ ] FormDatePicker.tsx
- [ ] [2 more]

**Table Components (3):**
- [ ] DataTable.tsx
- [ ] PaginatedTable.tsx
- [ ] VirtualizedTable.tsx

**Modal Components (2):**
- [ ] Modal.tsx
- [ ] [1 more]

**Deliverables:**
- [ ] Shared components library
- [ ] Storybook documentation
- [ ] Reusable patterns established

---

### ⏳ Week 12: Other Modules
**Phase 3.5: Remaining Modules**

**Target Components (100):**
- [ ] Site Operations (40 components)
- [ ] Organization Admin (30 components)
- [ ] Identity/Access (20 components)
- [ ] Subject Management (10 components)

**Deliverables:**
- [ ] All modules TypeScript
- [ ] 350/350 components ✅
- [ ] Module isolation verified

**🎉 Milestone:** All components TypeScript!

---

### ⏳ Week 13-14: Testing & Quality
**Phase 4: Comprehensive Testing**

**Week 13: Unit & Component Tests**
- [ ] React Testing Library setup
- [ ] Service unit tests (60% coverage)
- [ ] Hook tests (80% coverage)
- [ ] Component tests (30% coverage)

**Week 14: Integration & E2E**
- [ ] Cypress/Playwright setup
- [ ] Study creation flow E2E
- [ ] Subject enrollment E2E
- [ ] Form data entry E2E
- [ ] Performance testing (Lighthouse 90+)
- [ ] Accessibility audit (WCAG 2.1 AA)

**Deliverables:**
- [ ] Test coverage targets met
- [ ] E2E critical flows passing
- [ ] Performance optimized
- [ ] Accessibility compliant

---

### ⏳ Week 15-16: Production Readiness
**Phase 5: Launch Preparation**

**Week 15: Cleanup & Optimization**
- [ ] Remove all .js/.jsx files
- [ ] Remove legacy exports
- [ ] ESLint 0 warnings
- [ ] Bundle size <500KB
- [ ] Code splitting
- [ ] Security audit

**Week 16: Deployment**
- [ ] Documentation complete
- [ ] Migration guide for team
- [ ] CI/CD pipeline updated
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring setup

**🎉 Milestone:** Production launch!

---

## 📈 Success Metrics

### Technical KPIs

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript Coverage | 4% | 100% | 🟡 In Progress |
| TypeScript Errors | 0 | 0 | ✅ On Track |
| ESLint Warnings | 160 | <100 | ⏳ Pending |
| Test Coverage | 0% | 60% | ⏳ Pending |
| Bundle Size | 363 KB | <500 KB | ✅ Good |
| Lighthouse Score | ? | 90+ | ⏳ Week 14 |
| Time to Interactive | ? | <2s | ⏳ Week 14 |

### Quality KPIs

| Metric | Target | Status |
|--------|--------|--------|
| Max Component LOC | <400 | ⏳ Week 5 |
| God Components | 0 | ⏳ Week 6 |
| DDD Modules | 7 | ⏳ Week 12 |
| Shared Components | 50+ | ⏳ Week 11 |
| Type Safety | 100% | ⏳ Week 16 |

---

## 🚀 Quick Start - Week 2

### Monday Morning Checklist

1. **Create Phase 2 Branch**
   ```bash
   git checkout -b feat/phase-2-services
   ```

2. **Review Week 2 Goals**
   - [ ] 7 services to convert
   - [ ] ~50 hooks to create
   - [ ] Build must pass daily

3. **Start First Service**
   ```bash
   # Create type definitions
   touch src/types/domain/Patient.types.ts
   
   # Create service
   touch src/services/data-capture/PatientEnrollmentService.ts
   
   # Start coding...
   ```

4. **Daily Routine**
   - Morning: Pick next service
   - Code service + hooks
   - Test with existing components
   - Commit + push
   - Update progress

5. **Friday Wrap-up**
   - [ ] All 7 services done
   - [ ] Build passing
   - [ ] Documentation updated
   - [ ] PR for review

---

## 📚 Resources

### Documentation
- [Comprehensive Plan](./TYPESCRIPT_MIGRATION_COMPREHENSIVE_PLAN.md) - Full 100-page breakdown
- [Phase 1 Summary](./PHASE_1_TYPESCRIPT_MIGRATION_SUMMARY.md) - What we completed
- [Quick Reference](./TYPESCRIPT_SERVICES_QUICK_REFERENCE.md) - How to use services
- [Frontend Refactoring Plan](./docs/FRONTEND_REFACTORING_PLAN.md) - Original plan

### External Resources
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [DDD in Frontend](https://khalilstemmler.com/articles/domain-driven-design-intro/)

---

## 🎯 Key Principles

### 1. **Type Safety First**
```typescript
// ❌ Bad: Any types
function getStudy(id: any): any { }

// ✅ Good: Strict types
function getStudy(id: number): Promise<Study> { }
```

### 2. **Small Components**
```typescript
// ❌ Bad: 1100 LOC monolith
StudyDesignDashboard.jsx

// ✅ Good: Modular <400 LOC each
StudyDesignLayout.tsx (150 LOC)
  ├── StudyDesignHeader.tsx (80 LOC)
  ├── StudyDesignSidebar.tsx (120 LOC)
  └── PhaseRouter.tsx (100 LOC)
```

### 3. **React Query for Server State**
```typescript
// ❌ Bad: Direct service calls
useEffect(() => {
  StudyService.getStudies().then(setStudies);
}, []);

// ✅ Good: React Query hooks
const { data: studies, isLoading } = useStudies();
```

### 4. **Context for Shared State**
```typescript
// ❌ Bad: Prop drilling 5 levels deep
<Component study={study} refetch={refetch} .../>

// ✅ Good: Context provider
<StudyDesignProvider studyId={id}>
  <Component /> {/* Uses useStudyDesign() */}
</StudyDesignProvider>
```

### 5. **Module Isolation**
```typescript
// ✅ Good: Each module self-contained
modules/trialdesign/
  ├── types/       // Module-specific types
  ├── hooks/       // Module-specific hooks
  ├── contexts/    // Module-specific contexts
  └── components/  // Module-specific UI
```

---

**Last Updated:** October 24, 2025  
**Next Review:** End of Week 2  
**Status:** 🎯 Week 1 Complete | Week 2 In Progress
