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
