# Frontend Refactoring Implementation Plan
## TypeScript Migration + Architecture Modernization

**Date:** October 24, 2025  
**Branch Strategy:** Feature branches from `REFACTORING_PATIENT_MGMT_UI`  
**Status:** 🟢 TypeScript configured, React Query installed, Ready to proceed

---

## ✅ Phase 0: Foundation Setup (COMPLETED)

### Completed Tasks
- ✅ TypeScript 5.9.3 installed with type definitions
- ✅ `tsconfig.json` configured with `allowJs: true` for gradual migration
- ✅ Base types created in `src/types/index.ts`
- ✅ React Query 5.x installed with devtools
- ✅ Build verified: 363.01 kB (no regressions)
- ✅ Migration guide documented

### Key Configuration
```json
// tsconfig.json - Hybrid JS/TS mode
{
  "allowJs": true,      // ✅ .js and .jsx files work
  "checkJs": false,     // No type-checking of JS yet
  "strict": false,      // Lenient during migration
  "noImplicitAny": false
}
```

---

## 📋 Phase 1: Baseline Hardening (Week 1)

### Goal
Fix existing issues, establish patterns, set up caching infrastructure

### Tasks

#### 1.1 ESLint Cleanup
**Branch:** `fix/study-design-lint`

**Problems to fix (from build output):**
- 150+ unused variable warnings
- 50+ missing useEffect dependencies
- Anonymous default exports in services
- Self-assignments in StudyRegister.jsx
- Regex escape character issues

**Approach:**
```bash
# Create branch
git checkout -b fix/study-design-lint

# Fix systematically by module
npm run build 2>&1 | grep "src\\components\\modules\\trialdesign" > lint-issues.txt

# Fix categories:
# 1. Remove unused imports/variables
# 2. Add missing dependencies to useEffect (or suppress with comments)
# 3. Fix service exports
# 4. Fix regex escapes
```

**Estimated:** 2-3 days

#### 1.2 React Query Provider Setup
**File:** `src/index.tsx` (rename from index.jsx)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

**Estimated:** 1 day

#### 1.3 Convert Core Services to TypeScript
**Files to convert:**

1. **StudyService.js → StudyService.ts**
```typescript
// src/services/StudyService.ts
import ApiService from './ApiService';
import { Study, ApiResponse, PaginatedResponse } from '../types';

export async function getStudies(): Promise<Study[]> {
  const response = await ApiService.get<ApiResponse<Study[]>>('/studies');
  return response.data || [];
}

export async function getStudyById(id: number): Promise<Study> {
  const response = await ApiService.get<ApiResponse<Study>>(`/studies/${id}`);
  return response.data!;
}

export async function createStudy(study: Partial<Study>): Promise<Study> {
  const response = await ApiService.post<ApiResponse<Study>>('/studies', study);
  return response.data!;
}

export async function updateStudy(id: number, study: Partial<Study>): Promise<Study> {
  const response = await ApiService.put<ApiResponse<Study>>(`/studies/${id}`, study);
  return response.data!;
}
```

2. **Create React Query Hooks**
```typescript
// src/hooks/useStudies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Study } from '../types';
import * as StudyService from '../services/StudyService';

export function useStudies() {
  return useQuery<Study[], Error>({
    queryKey: ['studies'],
    queryFn: StudyService.getStudies,
  });
}

export function useStudy(id: number | undefined) {
  return useQuery<Study, Error>({
    queryKey: ['studies', id],
    queryFn: () => StudyService.getStudyById(id!),
    enabled: !!id,
  });
}

export function useCreateStudy() {
  const queryClient = useQueryClient();
  
  return useMutation<Study, Error, Partial<Study>>({
    mutationFn: StudyService.createStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
}

export function useUpdateStudy() {
  const queryClient = useQueryClient();
  
  return useMutation<Study, Error, { id: number; data: Partial<Study> }>({
    mutationFn: ({ id, data }) => StudyService.updateStudy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies'] });
      queryClient.invalidateQueries({ queryKey: ['studies', variables.id] });
    },
  });
}
```

3. **SiteService.js → SiteService.ts** + hooks
4. **ProtocolVersionService.js → ProtocolVersionService.ts** + hooks

**Estimated:** 3-4 days

---

## 🏗️ Phase 2: Architecture Refactoring (Week 2-4)

### Goal
Split god components, establish reusable patterns, improve testability

### 2.1 Split StudyDesignDashboard.jsx (~1.1k LOC)

**Current Structure:**
```
StudyDesignDashboard.jsx (1100 lines)
  ├── Study data fetching
  ├── Phase navigation logic
  ├── Progress tracking
  ├── Design phase routing
  ├── UI rendering
  └── Action handlers
```

**Target Structure:**
```
StudyDesignLayout.tsx
  ├── StudyDesignContext (state provider)
  ├── StudyDesignHeader.tsx
  ├── StudyDesignSidebar.tsx
  └── PhaseRouter.tsx
        ├── BasicInformationPhase.tsx
        ├── VisitSchedulePhase.tsx
        ├── FormsPhase.tsx
        ├── ReviewPhase.tsx
        └── PublishPhase.tsx
```

**Implementation:**

```typescript
// src/contexts/StudyDesignContext.tsx
import React, { createContext, useContext } from 'react';
import { Study, StudyDesignProgress } from '../types';
import { useStudy } from '../hooks/useStudies';

interface StudyDesignContextValue {
  study: Study | undefined;
  progress: StudyDesignProgress | undefined;
  isLoading: boolean;
  currentPhase: string;
  setCurrentPhase: (phase: string) => void;
  refetch: () => void;
}

const StudyDesignContext = createContext<StudyDesignContextValue | undefined>(undefined);

export function useStudyDesign() {
  const context = useContext(StudyDesignContext);
  if (!context) {
    throw new Error('useStudyDesign must be used within StudyDesignProvider');
  }
  return context;
}

export function StudyDesignProvider({ 
  studyId, 
  children 
}: { 
  studyId: number; 
  children: React.ReactNode;
}) {
  const { data: study, isLoading, refetch } = useStudy(studyId);
  const [currentPhase, setCurrentPhase] = React.useState('basic-info');
  
  const value: StudyDesignContextValue = {
    study,
    progress: undefined, // TODO: fetch progress
    isLoading,
    currentPhase,
    setCurrentPhase,
    refetch,
  };
  
  return (
    <StudyDesignContext.Provider value={value}>
      {children}
    </StudyDesignContext.Provider>
  );
}
```

```typescript
// src/components/modules/trialdesign/StudyDesignLayout.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { StudyDesignProvider } from '../../../contexts/StudyDesignContext';
import StudyDesignHeader from './components/StudyDesignHeader';
import StudyDesignSidebar from './components/StudyDesignSidebar';
import PhaseRouter from './PhaseRouter';

export default function StudyDesignLayout() {
  const { studyId } = useParams<{ studyId: string }>();
  
  if (!studyId) {
    return <div>Study ID required</div>;
  }
  
  return (
    <StudyDesignProvider studyId={parseInt(studyId)}>
      <div className="flex flex-col h-screen">
        <StudyDesignHeader />
        <div className="flex flex-1 overflow-hidden">
          <StudyDesignSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <PhaseRouter />
          </main>
        </div>
      </div>
    </StudyDesignProvider>
  );
}
```

**Estimated:** 5-6 days

### 2.2 Rebuild StudyCreationWizard with TypeScript

**Current Issues:**
- Manual validation with switch statements
- Imperative payload transformation
- window.confirm for exit
- No audit capture

**New Pattern:**
```typescript
// src/components/shared/wizard/WizardShell.tsx
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface WizardStep<T> {
  id: string;
  title: string;
  component: React.ComponentType;
  schema: any; // Zod schema
}

interface WizardShellProps<T> {
  steps: WizardStep<T>[];
  onComplete: (data: T) => Promise<void>;
  onCancel: () => void;
}

export function WizardShell<T>({ steps, onComplete, onCancel }: WizardShellProps<T>) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const methods = useForm<T>({
    resolver: zodResolver(steps[currentStep].schema),
    mode: 'onChange',
  });
  
  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = methods.handleSubmit(async (data) => {
    await onComplete(data);
  });
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <FormProvider {...methods}>
      <div className="wizard-shell">
        <div className="wizard-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={index === currentStep ? 'active' : ''}
            >
              {step.title}
            </div>
          ))}
        </div>
        
        <div className="wizard-content">
          <CurrentStepComponent />
        </div>
        
        <div className="wizard-actions">
          <button onClick={onCancel}>Cancel</button>
          {currentStep > 0 && (
            <button onClick={handleBack}>Back</button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleSubmit}>Submit</button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
```

**Estimated:** 4-5 days

### 2.3 Create Shared Component Library

**Components to build (all in TypeScript):**

1. **ConfirmationDialog.tsx**
```typescript
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}
```

2. **ElectronicSignatureModal.tsx**
```typescript
interface ElectronicSignatureModalProps {
  open: boolean;
  action: string; // "Approve Protocol", "Publish Study", etc.
  onConfirm: (signature: SignatureData) => Promise<void>;
  onCancel: () => void;
}

interface SignatureData {
  username: string;
  password: string;
  reason: string;
  timestamp: string;
}
```

3. **StatusBadge.tsx**
4. **ActionPanel.tsx**
5. **DataTable.tsx** (with virtualization)

**Estimated:** 3-4 days

---

## 🎨 Phase 3: Experience Redesign (Week 5-8)

### Goal
Build Form Designer, improve dashboards, enhance UX

### 3.1 Form Designer Suite

**Components:**
- FormDesignerPalette.tsx (drag field types)
- FormDesignerCanvas.tsx (drop zone)
- FormFieldEditor.tsx (properties panel)
- FormRuleBuilder.tsx (validation/skip logic)
- CodelistSelector.tsx (bind codelists)
- FormPreview.tsx (test mode)
- VisitBindingMatrix.tsx (form-visit mapping)

**Libraries to consider:**
- `react-beautiful-dnd` for drag-drop
- `monaco-editor` for rule expressions
- SurveyJS (commercial option)

**Estimated:** 10-12 days

### 3.2 Dashboard Improvements

**Convert to TypeScript + React Query:**
- StudyListGrid.jsx → StudyListGrid.tsx
- ProtocolManagementDashboard.jsx → ProtocolManagementDashboard.tsx
- DataCaptureDashboard.jsx → DataCaptureDashboard.tsx

**Add:**
- Pagination with React Query
- Filters with URL state
- Skeleton loaders
- History panels

**Estimated:** 5-6 days

---

## 🔒 Phase 4: Compliance Layer (Week 9-11)

### Goal
Electronic signatures, audit trails, workflow enforcement

### 4.1 Workflow Engine

```typescript
// src/services/WorkflowEngine.ts
interface WorkflowRule {
  action: string;
  requiredStatus: string[];
  requiredRoles: string[];
  prerequisites: (() => Promise<boolean>)[];
  auditRequired: boolean;
  signatureRequired: boolean;
}

class WorkflowEngine {
  async canExecute(action: string, context: any): Promise<boolean> {
    const rule = this.rules[action];
    // Check status, roles, prerequisites
  }
  
  async execute(action: string, context: any, signature?: SignatureData): Promise<void> {
    // Validate
    // Capture audit
    // Execute action
    // Record history
  }
}
```

**Estimated:** 4-5 days

### 4.2 Audit Service

```typescript
// src/services/AuditService.ts
interface AuditEntry {
  entityType: string;
  entityId: number;
  action: string;
  userId: string;
  timestamp: string;
  changes: Record<string, any>;
  reason?: string;
  signature?: SignatureData;
}

class AuditService {
  async log(entry: AuditEntry): Promise<void>;
  async getHistory(entityType: string, entityId: number): Promise<AuditEntry[]>;
}
```

**Components:**
- AuditHistoryTimeline.tsx
- SignatureVerificationBadge.tsx

**Estimated:** 3-4 days

### 4.3 CDISC/CDASH Validation

```typescript
// src/services/CDISCValidator.ts
interface CDISCValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

class CDISCValidator {
  validateForm(form: Form): CDISCValidationResult;
  validateDataPoint(domain: string, variable: string, value: any): boolean;
}
```

**Estimated:** 4-5 days

---

## 🧪 Phase 5: Testing & Hardening (Week 12)

### Goal
Ensure quality, performance, accessibility

### 5.1 Unit Tests
- Test services with typed mocks
- Test hooks with React Query
- Test components with React Testing Library

### 5.2 Integration Tests
- Cypress/Playwright E2E
- Study creation flow
- Protocol approval workflow
- Form publishing with compliance gates

### 5.3 Performance
- Bundle analyzer
- Code splitting (lazy loading)
- Virtualization for large lists
- Lighthouse audit (target: 90+)

### 5.4 Accessibility
- Keyboard navigation
- Screen reader testing
- ARIA labels
- Color contrast

**Estimated:** 5-6 days

---

## 📊 Progress Tracking

| Phase | Status | Duration | Completion |
|-------|--------|----------|------------|
| Phase 0: Foundation | ✅ Complete | 1 day | 100% |
| Phase 1: Baseline | 🔄 In Progress | Week 1 | 0% |
| Phase 2: Architecture | ⏳ Pending | Week 2-4 | 0% |
| Phase 3: Experience | ⏳ Pending | Week 5-8 | 0% |
| Phase 4: Compliance | ⏳ Pending | Week 9-11 | 0% |
| Phase 5: Testing | ⏳ Pending | Week 12 | 0% |

**Total Estimated Duration:** 12 weeks

---

## 🚀 Next Steps

### Immediate Actions (This Week)

1. **Create lint fix branch**
   ```bash
   git checkout -b fix/study-design-lint
   ```

2. **Set up React Query Provider**
   - Rename `index.jsx` → `index.tsx`
   - Add QueryClientProvider
   - Add devtools

3. **Convert first service**
   - Start with `StudyService.js` → `StudyService.ts`
   - Create `useStudies` hooks
   - Test with existing components

4. **Build first shared component**
   - Create `ConfirmationDialog.tsx`
   - Use in one place to validate pattern

### Branch Strategy

```
main
└── REFACTORING_PATIENT_MGMT_UI (base)
    ├── fix/study-design-lint
    ├── feat/react-query-setup
    ├── feat/study-service-ts
    ├── feat/shared-components
    ├── feat/study-design-refactor
    └── feat/form-designer
```

### Success Criteria

- ✅ Build passes with no errors
- ✅ All ESLint warnings resolved
- ✅ 80%+ TypeScript coverage
- ✅ React Query caching working
- ✅ God components split (<400 LOC)
- ✅ Form Designer functional
- ✅ E-signature workflow implemented
- ✅ Audit trail captured
- ✅ CDISC validation gates in place
- ✅ Bundle size <400 kB gzipped
- ✅ Lighthouse score 90+

---

## 📚 Resources

- [TypeScript Migration Guide](./TYPESCRIPT_MIGRATION_GUIDE.md)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [21 CFR Part 11 Requirements](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application)
- [CDISC Standards](https://www.cdisc.org/standards)

---

**Last Updated:** October 24, 2025  
**Contact:** Development Team  
**Status:** 🟢 Ready to Start Phase 1
