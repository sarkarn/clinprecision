# TypeScript Migration Guide

## Overview
This project is in **gradual TypeScript migration mode**. Both `.js/.jsx` and `.ts/.tsx` files coexist and work together seamlessly.

## Configuration

### tsconfig.json Key Settings
```json
{
  "allowJs": true,      // ✅ JavaScript files work alongside TypeScript
  "checkJs": false,     // ❌ Don't type-check JS files yet
  "strict": false,      // 🔧 Start lenient, tighten gradually
  "noImplicitAny": false // 🔧 Allow 'any' during migration
}
```

## Migration Strategy

### Phase 1: Coexistence (Current)
- ✅ TypeScript installed and configured
- ✅ Base types defined in `src/types/index.ts`
- ✅ All existing `.jsx` files continue working
- ✅ New files can be written in `.tsx`
- ✅ Imports work in both directions:
  ```tsx
  // In TypeScript file
  import StudyService from '../services/StudyService'; // .js file - works!
  
  // In JavaScript file
  import { Study } from '../types'; // .ts file - works!
  ```

### Phase 2: New Code in TypeScript
**All new components, services, and hooks should be written in TypeScript:**
- ✅ New shared components → `.tsx`
- ✅ New services → `.ts` with typed responses
- ✅ New hooks → `.ts` with proper generics
- ✅ New utilities → `.ts`

### Phase 3: Gradual Conversion (Bottom-Up)
**Convert existing files in this order:**

1. **Types & Constants** (Week 1)
   - `src/types/**/*.js` → `.ts`
   - `src/constants/**/*.js` → `.ts`

2. **Services** (Week 2)
   - `src/services/StudyService.js` → `.ts`
   - `src/services/SiteService.js` → `.ts`
   - `src/services/ProtocolVersionService.js` → `.ts`
   - Add typed React Query hooks

3. **Utilities & Helpers** (Week 3)
   - `src/utils/**/*.js` → `.ts`

4. **Hooks** (Week 4)
   - `src/hooks/useStudy.js` → `.ts`
   - `src/hooks/useDebounce.js` → `.ts`
   - `src/hooks/useCodeList.js` → `.ts`

5. **Contexts** (Week 5)
   - `src/contexts/StudyContext.jsx` → `.tsx`
   - `src/contexts/**/*.jsx` → `.tsx`

6. **Shared Components** (Week 6-7)
   - `src/components/shared/**/*.jsx` → `.tsx`

7. **Feature Modules** (Week 8-12)
   - Start with smallest modules
   - Convert complex components during refactoring
   - `StudyDesignDashboard.jsx` → split + convert to TypeScript

### Phase 4: Strict Mode (Post-Migration)
Once 80%+ converted, enable strict checks:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

## File Import Examples

### JavaScript importing TypeScript types
```jsx
// OldComponent.jsx
import { Study, Site } from '../types';

export default function OldComponent() {
  /** @type {Study} */
  const study = { id: 1, name: 'Test' };
  
  return <div>{study.name}</div>;
}
```

### TypeScript importing JavaScript modules
```tsx
// NewComponent.tsx
import { getStudies } from '../services/StudyService'; // .js file
import { Study } from '../types';

export default function NewComponent() {
  const [studies, setStudies] = useState<Study[]>([]);
  
  useEffect(() => {
    getStudies().then(setStudies);
  }, []);
  
  return <div>{studies.length} studies</div>;
}
```

### Mixed component hierarchy
```tsx
// Both work together:
<TypeScriptParent>
  <JavaScriptChild />
  <TypeScriptGrandchild />
</TypeScriptParent>
```

## Conversion Checklist

When converting a file from `.jsx` → `.tsx`:

### 1. Rename file
```bash
git mv Component.jsx Component.tsx
```

### 2. Add prop types
```tsx
// Before (JavaScript)
export default function MyComponent({ study, onSave }) {
  // ...
}

// After (TypeScript)
interface MyComponentProps {
  study: Study;
  onSave: (study: Study) => void;
}

export default function MyComponent({ study, onSave }: MyComponentProps) {
  // ...
}
```

### 3. Type state
```tsx
// Before
const [studies, setStudies] = useState([]);

// After
const [studies, setStudies] = useState<Study[]>([]);
```

### 4. Type event handlers
```tsx
// Before
const handleClick = (e) => { };

// After
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
```

### 5. Type API responses
```tsx
// Before
const response = await StudyService.getStudies();

// After
const response: Study[] = await StudyService.getStudies();
```

## Common Patterns

### Service with typed responses
```typescript
// StudyService.ts
import { Study, ApiResponse } from '../types';

export async function getStudies(): Promise<Study[]> {
  const response = await ApiService.get<ApiResponse<Study[]>>('/studies');
  return response.data || [];
}

export async function getStudyById(id: number): Promise<Study> {
  const response = await ApiService.get<ApiResponse<Study>>(`/studies/${id}`);
  return response.data!;
}
```

### React Query hook with types
```typescript
// useStudies.ts
import { useQuery } from '@tanstack/react-query';
import { Study } from '../types';
import { getStudies } from '../services/StudyService';

export function useStudies() {
  return useQuery<Study[], Error>({
    queryKey: ['studies'],
    queryFn: getStudies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Component with children
```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

---

## Shared Component Library Patterns

**Location**: `src/components/shared/`  
**Status**: ✅ Established (October 2025)  
**UI Framework**: **Tailwind CSS 3.4.3** (NOT Material-UI)  
**Icons**: lucide-react 0.543.0, @heroicons/react 2.2.0

### Architecture Principles

All shared components follow these patterns:

1. **TypeScript First**: Full type safety with exported interfaces
2. **Tailwind CSS**: Use utility classes, no external UI libraries
3. **Companion Hooks**: Complex state management extracted to custom hooks
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
5. **Barrel Exports**: Clean imports via `index.ts`
6. **Usage Examples**: Separate `.example.tsx` file with real-world scenarios

### Directory Structure

```
src/components/shared/
├── ConfirmationDialog.tsx          # Component implementation
├── ConfirmationDialog.example.tsx  # Usage examples
├── StatusBadge.tsx                 # (Planned)
├── ActionPanel.tsx                 # (Planned)
└── index.ts                        # Barrel export
```

### Reference Example: ConfirmationDialog

**File**: `src/components/shared/ConfirmationDialog.tsx`  
**Purpose**: Reusable confirmation dialog for critical actions  
**Replaces**: `window.confirm()` and inline confirmation dialogs

#### 1. TypeScript Interface Pattern

```typescript
/**
 * Severity level for visual styling
 */
export type ConfirmationSeverity = 'info' | 'warning' | 'error' | 'success';

/**
 * Props for ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Whether an async action is in progress */
  loading: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Visual severity variant (default: 'info') */
  severity?: ConfirmationSeverity;
  /** Confirm button text (default: 'Confirm') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Disable confirm button */
  confirmDisabled?: boolean;
  /** Show close (X) button in header (default: false) */
  showCloseButton?: boolean;
  /** Maximum width variant (default: 'sm') */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Prevent closing on backdrop click (default: false) */
  disableBackdropClick?: boolean;
  /** Prevent closing on Escape key (default: false) */
  disableEscapeKeyDown?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional content (e.g., checklists, warnings) */
  children?: React.ReactNode;
  /** Confirm action handler (supports sync/async) */
  onConfirm: () => void | Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}
```

**Key Pattern**: 
- Use TypeScript `type` for string unions (variants)
- Use `interface` for component props
- Optional props with `?` and default values documented in JSDoc
- Support both sync and async handlers with union return types

#### 2. Tailwind CSS Modal Pattern

```tsx
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  severity = 'info',
  // ...
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Center Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog Card */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              {severityIcon}
              <h3 className="text-lg font-semibold text-blue-700">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 pb-4">
            <p className="text-sm text-gray-600">{message}</p>
            {children}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Confirm
            </button>
            <button className="bg-white text-gray-900 px-4 py-2 rounded-md ring-1 ring-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Key Tailwind Patterns**:
- `fixed inset-0 z-50` - Full-screen overlay
- `bg-black bg-opacity-50` - Semi-transparent backdrop
- `flex items-center justify-center` - Centered modal
- `rounded-lg shadow-xl` - Card styling
- `flex-row-reverse` - Right-align primary action
- Responsive spacing: `px-6 py-4`, `gap-3`, `gap-4`
- Color variants: `bg-blue-600 hover:bg-blue-700`

#### 3. Severity Variants Pattern

```typescript
const getSeverityConfig = () => {
  switch (severity) {
    case 'success':
      return {
        icon: <CheckCircle className="w-12 h-12 text-green-500" />,
        titleColor: 'text-green-700',
        buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
        titleColor: 'text-yellow-700',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      };
    case 'error':
      return {
        icon: <XCircle className="w-12 h-12 text-red-500" />,
        titleColor: 'text-red-700',
        buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      };
    case 'info':
    default:
      return {
        icon: <Info className="w-12 h-12 text-blue-500" />,
        titleColor: 'text-blue-700',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      };
  }
};
```

**Key Pattern**:
- Configuration object approach (icon + colors)
- Consistent Tailwind color scale (500 for icon, 700 for text, 600/700 for button)
- lucide-react icons with Tailwind sizing (`w-12 h-12`)

#### 4. Custom Hook Pattern

```typescript
export const useConfirmationDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openDialog = () => {
    setOpen(true);
    setError(''); // Clear previous errors
  };

  const closeDialog = () => {
    setOpen(false);
    setLoading(false);
    setError('');
  };

  const executeAction = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    loading,
    error,
    openDialog,
    closeDialog,
    executeAction,
    setError,
  };
};
```

**Key Pattern**:
- Encapsulate common state management (open, loading, error)
- Provide helper functions (openDialog, closeDialog, executeAction)
- Error handling built-in
- Return object with predictable API

#### 5. Barrel Export Pattern

```typescript
// src/components/shared/index.ts
export { ConfirmationDialog, useConfirmationDialog } from './ConfirmationDialog';
export type { ConfirmationDialogProps, ConfirmationSeverity } from './ConfirmationDialog';
```

**Usage**:
```typescript
// Instead of:
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';

// Use:
import { ConfirmationDialog, useConfirmationDialog } from '@/components/shared';
```

#### 6. Consumer Usage Pattern

```tsx
import { ConfirmationDialog, useConfirmationDialog } from '@/components/shared';

function StudyDetailPage() {
  const deleteDialog = useConfirmationDialog();

  const handleDelete = async () => {
    await StudyService.deleteStudy(studyId);
    deleteDialog.closeDialog();
    navigate('/studies');
  };

  return (
    <>
      <button onClick={deleteDialog.openDialog}>Delete Study</button>

      <ConfirmationDialog
        open={deleteDialog.open}
        loading={deleteDialog.loading}
        error={deleteDialog.error}
        title="Delete Study"
        message="Are you sure? This action cannot be undone."
        severity="error"
        confirmText="Delete"
        onConfirm={() => deleteDialog.executeAction(handleDelete)}
        onCancel={deleteDialog.closeDialog}
      />
    </>
  );
}
```

**Key Pattern**:
- Use companion hook for state management
- Separate button/trigger from dialog component
- Hook handles all state (open, loading, error)
- executeAction wraps async operations

### Tailwind CSS Guidelines

#### Color Palette Usage

```tsx
// Semantic colors for component states
'bg-blue-600'    // Info/Primary actions
'bg-green-600'   // Success/Approval actions
'bg-yellow-600'  // Warning/Caution actions
'bg-red-600'     // Error/Destructive actions
'bg-gray-600'    // Neutral/Secondary actions

// Text colors
'text-gray-900'  // Primary text
'text-gray-600'  // Secondary text
'text-gray-400'  // Disabled/placeholder text

// Border colors
'ring-gray-300'  // Default borders
'border-gray-200' // Dividers
```

#### Spacing Scale

```tsx
// Padding/Margin
'p-4'   // 1rem (16px) - Default component padding
'px-6'  // 1.5rem (24px) - Horizontal modal padding
'py-4'  // 1rem (16px) - Vertical modal padding
'gap-3' // 0.75rem (12px) - Button gap
'gap-4' // 1rem (16px) - Icon-to-text gap

// Width/Height
'w-12 h-12' // 3rem (48px) - Icon size
'w-full'    // 100% - Full width containers
'max-w-md'  // 28rem (448px) - Default modal width
```

#### Responsive Design

```tsx
// Mobile-first approach
className="px-4 py-3 sm:px-6 sm:py-4"  // Smaller padding on mobile

// Max-width variants for dialogs
'max-w-xs'  // 20rem (320px)
'max-w-sm'  // 24rem (384px)
'max-w-md'  // 28rem (448px)
'max-w-lg'  // 32rem (512px)
'max-w-xl'  // 36rem (576px)
```

#### Interactive States

```tsx
// Buttons
'hover:bg-blue-700'           // Hover state
'focus:ring-2 focus:ring-blue-500'  // Focus ring
'disabled:opacity-50 disabled:cursor-not-allowed'  // Disabled state

// Transitions
'transition-opacity'  // Fade effects
'transition-all'      // Multiple properties
```

### Accessibility Patterns

#### ARIA Labels

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h3 id="dialog-title">Delete Study</h3>
  <p id="dialog-description">Are you sure you want to delete?</p>
</div>
```

#### Keyboard Navigation

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape' && !disableEscapeKeyDown) {
    onCancel();
  }
};

// Auto-focus primary action
<button autoFocus onClick={onConfirm}>Confirm</button>
```

#### Focus Management

```tsx
// Trap focus within modal
// Use lucide-react icons with aria-hidden for decorative icons
<CheckCircle aria-hidden="true" className="w-12 h-12" />

// Provide aria-label for icon-only buttons
<button aria-label="Close dialog" onClick={onClose}>
  <X className="w-6 h-6" />
</button>
```

### Icon Library Usage

**Primary**: lucide-react 0.543.0  
**Secondary**: @heroicons/react 2.2.0

```tsx
// lucide-react (preferred for UI elements)
import { CheckCircle, AlertTriangle, XCircle, Info, X, Loader2 } from 'lucide-react';

<CheckCircle className="w-6 h-6 text-green-500" />
<Loader2 className="w-4 h-4 animate-spin" />  // Loading spinner

// @heroicons/react (alternative)
import { CheckCircleIcon } from '@heroicons/react/24/outline';

<CheckCircleIcon className="w-6 h-6 text-green-500" />
```

### Testing Patterns

```typescript
// Component.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmationDialog } from './ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const mockConfirm = jest.fn();
  const mockCancel = jest.fn();

  it('renders with correct title and message', () => {
    render(
      <ConfirmationDialog
        open={true}
        loading={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    render(
      <ConfirmationDialog
        open={true}
        loading={false}
        title="Delete"
        message="Confirm?"
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );

    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  });

  it('displays loading state correctly', () => {
    render(
      <ConfirmationDialog
        open={true}
        loading={true}
        title="Delete"
        message="Confirm?"
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });
});
```

### Documentation Pattern

Each shared component should include:

1. **Component File** (`.tsx`)
   - Full implementation
   - JSDoc comments on interface
   - Exported types

2. **Example File** (`.example.tsx`)
   - 4-6 real-world usage scenarios
   - Different prop combinations
   - Common use cases from application

3. **Barrel Export** (`index.ts`)
   - Export component and hook
   - Export TypeScript types

4. **Tests** (`.test.tsx`)
   - Unit tests for component behavior
   - Accessibility tests
   - Async action tests

### Quick Reference: Component Checklist

When building a new shared component:

- [ ] Create in `src/components/shared/`
- [ ] TypeScript interface with JSDoc
- [ ] Use Tailwind CSS (no external UI libs)
- [ ] lucide-react or @heroicons for icons
- [ ] ARIA labels and keyboard support
- [ ] Custom hook for complex state (if needed)
- [ ] Error handling (if async operations)
- [ ] Loading states (if async operations)
- [ ] Responsive design (mobile-first)
- [ ] Usage examples file (`.example.tsx`)
- [ ] Add to barrel export (`index.ts`)
- [ ] Unit tests with React Testing Library
- [ ] Update this guide with new patterns

### Next Shared Components (Planned)

1. **StatusBadge** - Color-coded status indicators
2. **ActionPanel** - Reusable action button groups
3. **ElectronicSignatureModal** - E-signature workflow
4. **DataTable** - Sortable, filterable table component
5. **WizardShell** - Multi-step form wizard

---

## ESLint Configuration

Update `.eslintrc.json` to support TypeScript:
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

## Benefits During Migration

### For JavaScript files:
- ✅ No changes required
- ✅ Can gradually add JSDoc types for intellisense
- ✅ Can import and use TypeScript types

### For TypeScript files:
- ✅ Full type safety
- ✅ Better autocomplete
- ✅ Catch errors at compile time
- ✅ Self-documenting code
- ✅ Safer refactoring

## Testing

Both test types work:
```javascript
// OldTest.test.jsx - still works!
test('renders component', () => {
  render(<OldComponent />);
});
```

```typescript
// NewTest.test.tsx - fully typed!
test('renders component', () => {
  const mockStudy: Study = { id: 1, name: 'Test' };
  render(<NewComponent study={mockStudy} />);
});
```

## Next Steps

1. ✅ TypeScript configured (Done)
2. ✅ Base types created (Done)
3. 🔄 Install React Query + type definitions (Next)
4. 🔄 Convert services to TypeScript with React Query hooks
5. 🔄 Build new shared components in TypeScript
6. 🔄 Gradually convert existing files bottom-up

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Query with TypeScript](https://tanstack.com/query/latest/docs/react/typescript)
