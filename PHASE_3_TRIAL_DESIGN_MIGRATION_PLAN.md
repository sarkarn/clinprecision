# Phase 3: Trial Design Module - TypeScript Migration Plan

**Module:** Trial Design  
**Total Components:** 132 JSX files  
**Strategy:** Bottom-up (shared components → features → pages)  
**Date Started:** October 24, 2025  
**Status:** 🎯 Ready to Start

---

## 📊 Component Inventory

### By Category

| Category | Count | Complexity | Priority |
|----------|-------|------------|----------|
| **Database Build Components** | 12 | Low-Medium | 🟢 High (isolated) |
| **Shared/UI Components** | 15 | Low | 🟢 High (reusable) |
| **Study Creation Wizard** | 6 | Medium | 🟡 Medium |
| **Study Design Features** | 10 | High | 🔴 Low (complex) |
| **Protocol Management** | 6 | Medium | 🟡 Medium |
| **Study Management** | 7 | Medium | 🟡 Medium |
| **Top-level Pages** | 10 | Medium | 🟡 Medium |
| **Form Components** | 4 | Medium | 🟡 Medium |

**Total:** 132 components

---

## 🎯 Migration Strategy

### Phase 3A: Foundation (Week 1-2) - 27 Components
**Focus:** Shared/reusable components with minimal dependencies

#### Batch 1A: Database Build Components (12 files) - Day 1-2
*Low complexity, isolated, well-typed hooks already available*

1. **Simple UI Components** (5 files)
   - `LoadingSpinner.jsx` → `LoadingSpinner.tsx`
   - `EmptyState.jsx` → `EmptyState.tsx`
   - `BuildProgressBar.jsx` → `BuildProgressBar.tsx`
   - `BuildStatusBadge.jsx` → `BuildStatusBadge.tsx`
   - `BuildMetricsCard.jsx` → `BuildMetricsCard.tsx`

2. **Data Display Components** (4 files)
   - `StudyDatabaseBuildCard.jsx` → `StudyDatabaseBuildCard.tsx`
   - `StudyDatabaseBuildList.jsx` → `StudyDatabaseBuildList.tsx`
   - `StudyDatabaseBuildFilters.jsx` → `StudyDatabaseBuildFilters.tsx`
   - `BuildDetailsModal.jsx` → `BuildDetailsModal.tsx`

3. **Action Components** (3 files)
   - `BuildActionsMenu.jsx` → `BuildActionsMenu.tsx`
   - `CancelBuildModal.jsx` → `CancelBuildModal.tsx`
   - `BuildStudyDatabaseModal.jsx` → `BuildStudyDatabaseModal.tsx`

**Benefits:** 
- ✅ Hooks already TypeScript (`useBuildStatus`, `useBuildActions`, `useStudyDatabaseBuilds`)
- ✅ Types available (`BuildActionType`, `ValidationOptions`, etc.)
- ✅ Isolated from complex dependencies
- ✅ Clear prop interfaces

#### Batch 1B: Shared UI Components (15 files) - Day 3-4
*Generic reusable components used across features*

1. **Basic UI** (8 files)
   - `ProgressIndicator.jsx` → `ProgressIndicator.tsx`
   - `ProgressiveLoader.jsx` → `ProgressiveLoader.tsx`
   - `FormProgressIndicator.jsx` → `FormProgressIndicator.tsx`
   - `FormField.jsx` → `FormField.tsx`
   - `EnhancedFormField.jsx` → `EnhancedFormField.tsx`
   - `UIComponents.jsx` → `UIComponents.tsx`
   - `StudyContextHeader.jsx` → `StudyContextHeader.tsx`
   - `NavigationSidebar.jsx` → `NavigationSidebar.tsx`

2. **Workflow Components** (4 files)
   - `WorkflowProgressTracker.jsx` → `WorkflowProgressTracker.tsx`
   - `SmartWorkflowAssistant.jsx` → `SmartWorkflowAssistant.tsx`
   - `PhaseTransitionHelper.jsx` → `PhaseTransitionHelper.tsx`
   - `ApprovalWorkflowInterface.jsx` → `ApprovalWorkflowInterface.tsx`

3. **Version/Metrics** (3 files)
   - `EnhancedDashboardMetrics.jsx` → `EnhancedDashboardMetrics.tsx`
   - `EnhancedVersionManager.jsx` → `EnhancedVersionManager.tsx`
   - `VersionComparisonTool.jsx` → `VersionComparisonTool.tsx`

---

### Phase 3B: Features (Week 3-4) - 22 Components
**Focus:** Feature-specific components with moderate complexity

#### Batch 2A: Protocol Management (6 files) - Day 5-6

1. **Protocol Version Components** (5 files)
   - `ProtocolVersionActions.jsx` → `ProtocolVersionActions.tsx`
   - `ProtocolVersionForm.jsx` → `ProtocolVersionForm.tsx`
   - `ProtocolVersionPanel.jsx` → `ProtocolVersionPanel.tsx`
   - `ProtocolVersionTimeline.jsx` → `ProtocolVersionTimeline.tsx`
   - `ProtocolVersionManagementModal.jsx` → `ProtocolVersionManagementModal.tsx`

2. **Protocol Dashboard** (1 file)
   - `ProtocolManagementDashboard.jsx` → `ProtocolManagementDashboard.tsx`

**Benefits:**
- ✅ Hook already TypeScript (`useProtocolVersioning`)
- ✅ Types available (`UseProtocolVersioningReturn`, `ProtocolVersioning.types.ts`)

#### Batch 2B: Study Creation Wizard (6 files) - Day 7-8

1. **Wizard Steps** (4 files)
   - `BasicInformationStep.jsx` → `BasicInformationStep.tsx`
   - `OrganizationsRegulatoryStep.jsx` → `OrganizationsRegulatoryStep.tsx`
   - `TimelinePersonnelStep.jsx` → `TimelinePersonnelStep.tsx`
   - `ReviewConfirmationStep.jsx` → `ReviewConfirmationStep.tsx`

2. **Wizard Containers** (2 files)
   - `StudyCreationWizard.jsx` → `StudyCreationWizard.tsx`
   - `StudyEditWizard.jsx` → `StudyEditWizard.tsx`

**Benefits:**
- ✅ Hook already TypeScript (`useWizardNavigation`, `useStudyForm`)
- ✅ Types available (`UseWizardNavigationReturn`, `StudyFormData`)

#### Batch 2C: Study Management (7 files) - Day 9-10

1. **Study Lists** (4 files)
   - `StudyListGrid.jsx` → `StudyListGrid.tsx`
   - `ModernStudyListGrid.jsx` → `ModernStudyListGrid.tsx`
   - `EnhancedStudyListGrid.jsx` → `EnhancedStudyListGrid.tsx`
   - `DocumentUploadModal.jsx` → `DocumentUploadModal.tsx`

2. **Study Overview** (2 files)
   - `StudyOverviewDashboard.jsx` → `StudyOverviewDashboard.tsx`
   - `EnhancedStudyOverviewDashboard.jsx` → `EnhancedStudyOverviewDashboard.tsx`

3. **Version Management** (1 file)
   - `VersionManagementModal.jsx` → `VersionManagementModal.tsx`

**Benefits:**
- ✅ Hooks already TypeScript (`useStudyVersioning`, `useDataGrid`)
- ✅ Types available (`UseDataGridReturn`, `SortConfig`, `Filters`)

#### Batch 2D: Study Design Quick Component (1 file) - Day 11
- `ProtocolVersionQuickOverview.jsx` → `ProtocolVersionQuickOverview.tsx`

---

### Phase 3C: Complex Features (Week 5-6) - 10 Components
**Focus:** High-complexity design components

#### Batch 3A: Study Design Components (10 files) - Day 12-16

1. **Design Features** (4 files)
   - `StudyArmsDesigner.jsx` → `StudyArmsDesigner.tsx`
   - `VisitScheduleDesigner.jsx` → `VisitScheduleDesigner.tsx`
   - `FormBindingDesigner.jsx` → `FormBindingDesigner.tsx`
   - `ProtocolRevisionWorkflow.jsx` → `ProtocolRevisionWorkflow.tsx`

2. **Publish Workflow** (1 file)
   - `StudyPublishWorkflow.jsx` → `StudyPublishWorkflow.tsx`

3. **Design Dashboard** (1 file)
   - `StudyDesignDashboard.jsx` → `StudyDesignDashboard.tsx` (highly complex)

**Challenge:** High complexity, many dependencies, extensive state management

---

### Phase 3D: Forms & Designers (Week 7) - 5 Components

#### Batch 4A: Form Components (5 files) - Day 17-18
- `FormList.jsx` → `FormList.tsx`
- `StudyFormList.jsx` → `StudyFormList.tsx`
- `FormDesigner.jsx` → `FormDesigner.tsx`
- `FormValidationDemo.jsx` → `FormValidationDemo.tsx`
- `CRFBuilder.jsx` → `CRFBuilder.tsx`

---

### Phase 3E: Top-Level Pages (Week 8) - 11 Components

#### Batch 5A: Page Components (11 files) - Day 19-21
- `StudyRegister.jsx` → `StudyRegister.tsx`
- `EnhancedStudyRegister.jsx` → `EnhancedStudyRegister.tsx`
- `StudyEditPage.jsx` → `StudyEditPage.tsx`
- `StudyEditPageV2.jsx` → `StudyEditPageV2.tsx`
- `StudyViewPage.jsx` → `StudyViewPage.tsx`
- `StudyDesignModule.jsx` → `StudyDesignModule.tsx`
- `StudyDatabaseBuildPage.jsx` → `StudyDatabaseBuildPage.tsx`
- `FormTemplateManagement.jsx` → `FormTemplateManagement.tsx`

---

## 🛠️ Type Definitions Strategy

### Shared Types to Create

Create `src/components/modules/trialdesign/types/shared.types.ts`:

```typescript
// Study types
export interface Study {
  id: number;
  name: string;
  protocolNumber: string;
  phase: string;
  status: string;
  startDate?: string;
  endDate?: string;
  // ... more fields
}

// Form types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  required: boolean;
  validation?: ValidationRule;
  options?: SelectOption[];
}

export interface SelectOption {
  value: string | number;
  label: string;
}

// Visit types
export interface Visit {
  id: number;
  name: string;
  studyDay: number;
  windowBefore: number;
  windowAfter: number;
  isRequired: boolean;
}

// Protocol types
export interface Protocol {
  id: number;
  version: string;
  status: string;
  effectiveDate?: string;
  approvalDate?: string;
}

// Common UI props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}
```

---

## 📝 Component Conversion Template

### Standard Conversion Process

For each component:

1. **Rename file:** `.jsx` → `.tsx`
2. **Add React imports:**
   ```typescript
   import React, { FC } from 'react';
   ```

3. **Define Props interface:**
   ```typescript
   interface ComponentNameProps {
     // Define all props with types
     title?: string;
     onSubmit: (data: FormData) => void;
     children?: React.ReactNode;
   }
   ```

4. **Convert component:**
   ```typescript
   export const ComponentName: FC<ComponentNameProps> = ({ 
     title, 
     onSubmit, 
     children 
   }) => {
     // Component logic
   };
   ```

5. **Add event handler types:**
   ```typescript
   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
     // Handler logic
   };
   
   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     // Handler logic
   };
   ```

6. **Type state:**
   ```typescript
   const [data, setData] = useState<FormData | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   ```

7. **Import from barrel exports:**
   ```typescript
   import { useBuildStatus } from './hooks';
   import { validationPatterns } from './utils';
   ```

---

## ✅ Verification Checklist (Per Batch)

After each batch:

- [ ] All files renamed to `.tsx`
- [ ] All props typed with interfaces
- [ ] All state variables typed
- [ ] All event handlers typed
- [ ] Imports updated (barrel exports where available)
- [ ] No TypeScript errors
- [ ] Build passes: `npm run build`
- [ ] No new ESLint warnings
- [ ] Component functionality verified (spot check)

---

## 📊 Progress Tracking

### Overall Status

```
Total: 132 components
Phase 3A (Foundation):     0/27  (  0%) ⏳ Not Started
Phase 3B (Features):       0/22  (  0%) ⏳ Not Started  
Phase 3C (Complex):        0/10  (  0%) ⏳ Not Started
Phase 3D (Forms):          0/5   (  0%) ⏳ Not Started
Phase 3E (Pages):          0/11  (  0%) ⏳ Not Started
---------------------------------------------------
Total Progress:            0/132 (  0%)
```

### Daily Targets

| Day | Batch | Target | Files |
|-----|-------|--------|-------|
| 1 | 1A.1 | Database Build - Simple UI | 5 |
| 2 | 1A.2-3 | Database Build - Data/Actions | 7 |
| 3 | 1B.1 | Shared UI - Basic | 8 |
| 4 | 1B.2-3 | Shared UI - Workflow/Version | 7 |
| 5 | 2A | Protocol Management | 6 |
| 6 | 2B | Study Creation Wizard - Steps | 4 |
| 7 | 2B | Study Creation Wizard - Containers | 2 |
| 8 | 2C | Study Management - Lists | 4 |
| 9 | 2C | Study Management - Overview | 2 |
| 10 | 2C-2D | Version Modal + Quick Overview | 2 |
| 11-15 | 3A | Study Design (complex) | 10 |
| 16-17 | 4A | Forms & Designers | 5 |
| 18-20 | 5A | Top-level Pages | 11 |

---

## 🎯 Success Criteria

### Per Component
- ✅ TypeScript compilation passes
- ✅ All props properly typed
- ✅ Event handlers typed
- ✅ State variables typed
- ✅ No `any` types (except legacy integrations)
- ✅ Imports use barrel exports where available

### Per Batch
- ✅ Build passes with 0 TS errors
- ✅ No new ESLint warnings
- ✅ Component renders correctly (manual test)
- ✅ Git commit with descriptive message

### Phase 3 Complete
- ✅ All 132 components converted
- ✅ Build passes
- ✅ TypeScript coverage >50%
- ✅ Documentation updated
- ✅ Migration summary created

---

## 🚀 Next Steps

1. **Start Batch 1A.1** - Database Build Simple UI (5 files)
2. Create shared type definitions as needed
3. Convert systematically following the template
4. Verify after each batch
5. Commit progress regularly

---

**Ready to begin!** Starting with the simplest, most isolated components in the database-build folder.
