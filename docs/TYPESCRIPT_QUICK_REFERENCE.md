# TypeScript + React Query - Quick Reference Card

## ✅ Setup Complete (October 24, 2025)

```bash
✅ TypeScript 5.9.3 installed
✅ tsconfig.json configured (allowJs: true)
✅ Base types in src/types/index.ts
✅ React Query installed
✅ Build passing: 363.01 kB
```

---

## 🔄 How JS/TS Coexist

### JavaScript File (Still Works!)
```jsx
// src/components/OldComponent.jsx
import { getStudies } from '../services/StudyService'; // .js file

export default function OldComponent() {
  const [studies, setStudies] = useState([]);
  // ... works unchanged
}
```

### TypeScript File (New Pattern)
```tsx
// src/components/NewComponent.tsx
import { Study } from '../types';
import { useStudies } from '../hooks/useStudies';

export default function NewComponent() {
  const { data: studies, isLoading } = useStudies();
  return <div>{studies?.map(s => s.name)}</div>;
}
```

### Imports Work Both Ways
```tsx
// ✅ TypeScript importing JavaScript
import { getStudies } from '../services/StudyService'; // .js file

// ✅ JavaScript importing TypeScript types
import { Study } from '../types'; // .ts file
```

---

## 📦 Using Types in JavaScript (Optional)

```javascript
// Add JSDoc for intellisense in .jsx files
/** @type {import('../types').Study} */
const study = { id: 1, name: 'Test' };

/** @param {import('../types').Study} study */
function processStudy(study) {
  console.log(study.name); // ✅ Autocomplete works!
}
```

---

## 🎣 React Query Patterns

### Query Hook (Read Data)
```typescript
// src/hooks/useStudies.ts
import { useQuery } from '@tanstack/react-query';
import { Study } from '../types';
import * as StudyService from '../services/StudyService';

export function useStudies() {
  return useQuery<Study[], Error>({
    queryKey: ['studies'],
    queryFn: StudyService.getStudies,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Usage in component:
const { data, isLoading, error } = useStudies();
```

### Mutation Hook (Write Data)
```typescript
// src/hooks/useCreateStudy.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Study } from '../types';
import * as StudyService from '../services/StudyService';

export function useCreateStudy() {
  const queryClient = useQueryClient();
  
  return useMutation<Study, Error, Partial<Study>>({
    mutationFn: StudyService.createStudy,
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
}

// Usage in component:
const { mutate, isLoading } = useCreateStudy();
mutate({ name: 'New Study' });
```

---

## 🔨 Converting a Service to TypeScript

### Before (JavaScript)
```javascript
// StudyService.js
export async function getStudies() {
  const response = await ApiService.get('/studies');
  return response.data || [];
}
```

### After (TypeScript)
```typescript
// StudyService.ts
import { Study, ApiResponse } from '../types';

export async function getStudies(): Promise<Study[]> {
  const response = await ApiService.get<ApiResponse<Study[]>>('/studies');
  return response.data || [];
}

export async function getStudyById(id: number): Promise<Study> {
  const response = await ApiService.get<ApiResponse<Study>>(`/studies/${id}`);
  if (!response.data) {
    throw new Error('Study not found');
  }
  return response.data;
}
```

---

## 🧩 Component Conversion

### Before (JavaScript)
```jsx
// MyComponent.jsx
export default function MyComponent({ study, onSave }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(study);
    setLoading(false);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### After (TypeScript)
```tsx
// MyComponent.tsx
import { Study } from '../types';

interface MyComponentProps {
  study: Study;
  onSave: (study: Study) => Promise<void>;
}

export default function MyComponent({ study, onSave }: MyComponentProps) {
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(study);
    setLoading(false);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎯 Common Type Patterns

### State
```typescript
const [studies, setStudies] = useState<Study[]>([]);
const [selectedId, setSelectedId] = useState<number | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```

### Event Handlers
```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
```

### Props with Children
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Optional prop
}
```

### Array/Object Types
```typescript
const items: string[] = ['a', 'b', 'c'];
const data: Record<string, any> = { key: 'value' };
const config: { [key: string]: number } = { count: 5 };
```

---

## 📂 File Organization

```
src/
  ├── types/
  │   └── index.ts              ← All type definitions
  │
  ├── services/
  │   ├── StudyService.ts       ← Typed service
  │   ├── SiteService.js        ← Not converted yet (works fine!)
  │   └── ApiService.js         ← Shared by both
  │
  ├── hooks/
  │   ├── useStudies.ts         ← React Query hook
  │   └── useDebounce.js        ← Not converted yet
  │
  └── components/
      ├── NewComponent.tsx      ← TypeScript component
      └── OldComponent.jsx      ← JavaScript component
```

---

## 🚦 Decision Tree: Should I Convert This File?

```
Is it a new file?
├─ YES → Write in TypeScript (.tsx/.ts)
└─ NO → Is it a substantial change?
       ├─ YES → Convert to TypeScript during refactor
       └─ NO → Leave as JavaScript (just fix bug)

Am I touching a service?
├─ StudyService, SiteService, ProtocolService
│  └─ Convert to TypeScript (create hooks too)
└─ Utility service
   └─ Convert if time permits

Am I creating a shared component?
└─ Write in TypeScript with proper props interface
```

---

## ⚠️ Common Gotchas

### 1. React 19 + TypeScript
```typescript
// ✅ Use React.FC sparingly (deprecated pattern)
// ❌ Don't do this:
const Component: React.FC<Props> = ({ children }) => {};

// ✅ Do this instead:
function Component({ children }: Props) {}
```

### 2. Optional vs. Undefined
```typescript
interface Props {
  name?: string;      // Can be undefined
  onClick: () => void; // Required
}

// Access optional props safely:
const displayName = props.name || 'Default';
```

### 3. Type vs. Interface
```typescript
// Use 'interface' for object shapes (extendable)
interface Study {
  id: number;
  name: string;
}

// Use 'type' for unions, primitives, computed types
type Status = 'active' | 'inactive' | 'draft';
type Nullable<T> = T | null;
```

---

## 🛠️ Useful Commands

```bash
# Check TypeScript errors without building
npx tsc --noEmit

# Build (includes type checking)
npm run build

# Start dev server
npm start

# Run tests
npm test

# Format code (if using Prettier)
npm run format
```

---

## 📚 Quick Links

| Resource | Link |
|----------|------|
| **Migration Guide** | `docs/TYPESCRIPT_MIGRATION_GUIDE.md` |
| **Refactoring Plan** | `docs/FRONTEND_REFACTORING_PLAN.md` |
| **Summary** | `docs/FRONTEND_REFACTORING_SUMMARY.md` |
| **Type Definitions** | `src/types/index.ts` |
| **React Query Docs** | https://tanstack.com/query/latest |
| **TypeScript Handbook** | https://www.typescriptlang.org/docs |

---

## 🎯 This Week's Focus

### Priority 1: Fix ESLint Warnings
```bash
git checkout -b fix/study-design-lint
npm run build 2>&1 | grep "src\\components\\modules\\trialdesign"
# Fix 150+ warnings systematically
```

### Priority 2: React Query Provider
```typescript
// Rename index.jsx → index.tsx
// Add QueryClientProvider + devtools
```

### Priority 3: First Service Conversion
```typescript
// Convert StudyService.js → StudyService.ts
// Create useStudies hooks
// Test with existing components
```

---

**Status:** 🟢 Ready to Go!  
**Questions?** Check docs or ask the team  
**Last Updated:** October 24, 2025
