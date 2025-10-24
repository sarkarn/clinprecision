# TypeScript Services Quick Reference

**Last Updated:** January 2025  
**Status:** Phase 1 Complete ✅

---

## Quick Import Guide

### Modern React Query Hooks (Recommended)

```typescript
// Study Management
import { useStudies, useStudy, useCreateStudy } from './services/StudyService';

// Site Management  
import { useSites, useSite, useCreateSite } from './services/SiteService';

// Study Design
import { useStudyDesign, useStudyArms, useCreateStudyArm } from './services/StudyDesignService';

// Forms (CRFs)
import { useFormsByStudy, useForm, useCreateForm } from './services/FormService';

// Visits (Study Design)
import { useVisitsByStudy, useVisit, useCreateVisit } from './services/VisitDefinitionService';

// Visits (Patient - Unscheduled)
import { usePatientVisits, useCreateUnscheduledVisit } from './services/VisitService';

// Organizations
import { useOrganizations, useOrganization, useCreateOrganization } from './services/OrganizationService';

// Users
import { useUsers, useUser, useCreateUser } from './services/UserService';

// Subjects/Patients
import { useSubjectsByStudy, useSubject, useEnrollSubject } from './services/SubjectService';

// Study Versioning
import { useStudyVersions, useCreateVersion } from './services/StudyVersioningService';
```

### Legacy Imports (Backward Compatible)

```typescript
// Still works, but deprecated
import StudyService from './services/StudyService';
import SiteService from './services/SiteService';
// etc...
```

---

## Common Patterns

### 1. Fetch List

```typescript
import { useStudies } from './services/StudyService';

function StudyList() {
  const { data: studies, isLoading, error } = useStudies();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {studies?.map(study => (
        <li key={study.id}>{study.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Fetch Single Item

```typescript
import { useStudy } from './services/StudyService';

function StudyDetails({ studyId }) {
  const { data: study, isLoading, error } = useStudy(studyId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{study?.name}</div>;
}
```

### 3. Create Item

```typescript
import { useCreateStudy } from './services/StudyService';

function CreateStudyForm() {
  const createMutation = useCreateStudy();
  
  const handleSubmit = async (formData) => {
    try {
      const newStudy = await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description
      });
      console.log('Created:', newStudy);
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createMutation.isLoading}
      >
        {createMutation.isLoading ? 'Creating...' : 'Create Study'}
      </button>
    </form>
  );
}
```

### 4. Update Item

```typescript
import { useUpdateStudy } from './services/StudyService';

function EditStudyForm({ studyId }) {
  const updateMutation = useUpdateStudy();
  
  const handleUpdate = async (formData) => {
    await updateMutation.mutateAsync({
      id: studyId,
      data: { name: formData.name }
    });
  };
  
  // ... render form
}
```

### 5. Delete Item

```typescript
import { useDeleteStudy } from './services/StudyService';

function DeleteStudyButton({ studyId }) {
  const deleteMutation = useDeleteStudy();
  
  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteMutation.mutateAsync(studyId);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={deleteMutation.isLoading}>
      {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

## Service Finder

**Need to...** → **Use this service:**

- Manage studies → `StudyService`
- Manage sites → `SiteService`
- Configure study arms/cohorts → `StudyDesignService`
- Create/edit forms (CRFs) → `FormService`
- Define scheduled visits → `VisitDefinitionService`
- Track unscheduled visits → `VisitService`
- Manage organizations → `OrganizationService`
- Manage users → `UserService`
- Enroll subjects/patients → `SubjectService`
- Track study versions → `StudyVersioningService`

---

## Hook Naming Convention

All hooks follow React Query best practices:

- **Queries (fetch data):** `use<Entity>`, `use<Entities>`
  - Examples: `useStudy`, `useStudies`, `useSubject`
  
- **Mutations (change data):** `useCreate<Entity>`, `useUpdate<Entity>`, `useDelete<Entity>`
  - Examples: `useCreateStudy`, `useUpdateStudy`, `useDeleteStudy`

- **Special operations:** `use<Action><Entity>`
  - Examples: `useEnrollSubject`, `useAssignUserType`, `useSearchSubjects`

---

## Type Imports

```typescript
// Import types alongside hooks
import { 
  useStudies, 
  useCreateStudy,
  type Study,
  type StudyCreateData 
} from './services/StudyService';

// Use in your component
function MyComponent() {
  const { data: studies } = useStudies();
  const createMutation = useCreateStudy();
  
  // Type-safe data
  const studyData: StudyCreateData = {
    name: 'New Study',
    description: 'Description'
  };
  
  await createMutation.mutateAsync(studyData);
}
```

---

## React Query State

Every query hook returns:

```typescript
{
  data: T | undefined,           // The fetched data
  isLoading: boolean,            // Initial load
  isFetching: boolean,           // Any fetch (including background)
  error: Error | null,           // Error if fetch failed
  refetch: () => void,           // Manual refetch
  isSuccess: boolean,            // Successful fetch
  isError: boolean,              // Failed fetch
  status: 'loading' | 'error' | 'success'
}
```

Every mutation hook returns:

```typescript
{
  mutate: (data) => void,        // Fire and forget
  mutateAsync: (data) => Promise, // Returns promise
  isLoading: boolean,            // Mutation in progress
  error: Error | null,           // Error if mutation failed
  isSuccess: boolean,            // Mutation succeeded
  isError: boolean,              // Mutation failed
  reset: () => void              // Reset mutation state
}
```

---

## Cache Keys Structure

Understanding cache keys helps with debugging:

```typescript
// Single entity
['study', studyId]
['site', siteId]
['subject', subjectId]

// List of entities
['studies']
['sites']
['subjects']

// Nested/scoped entities
['study', studyId, 'subjects']
['study', studyId, 'visits']
['study', studyId, 'forms']
['organization', orgId, 'contacts']
['user', userId, 'types']

// Search/special queries
['subjects', 'search', searchTerm]
['subjects', 'count']
```

---

## Manual Cache Manipulation

### Invalidate Cache (Force Refetch)

```typescript
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    // Invalidate specific study
    queryClient.invalidateQueries({ queryKey: ['study', studyId] });
    
    // Invalidate all studies
    queryClient.invalidateQueries({ queryKey: ['studies'] });
    
    // Invalidate all queries for a study
    queryClient.invalidateQueries({ queryKey: ['study', studyId] });
  };
}
```

### Update Cache Directly

```typescript
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  const handleUpdate = (updatedStudy) => {
    // Update single study in cache
    queryClient.setQueryData(['study', studatedStudy.id], updatedStudy);
  };
}
```

---

## Common Workflows

### Enroll a Subject

```typescript
import { useEnrollSubject } from './services/SubjectService';

function EnrollmentForm({ studyId, siteId }) {
  const enrollMutation = useEnrollSubject();
  
  const handleEnroll = async (formData) => {
    const subject = await enrollMutation.mutateAsync({
      subjectId: formData.screeningNumber,
      studyId: studyId,
      siteId: siteId,
      enrollmentDate: formData.enrollmentDate,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender
    });
    
    console.log('Enrolled subject:', subject);
  };
}
```

### Link Form to Visit

```typescript
import { useCreateFormBinding } from './services/VisitDefinitionService';

function BindFormToVisit({ studyId, visitId, formId }) {
  const bindMutation = useCreateFormBinding();
  
  const handleBind = async () => {
    await bindMutation.mutateAsync({
      studyId,
      data: {
        visitDefinitionId: visitId,
        formDefinitionId: formId,
        sequence: 1,
        isRequired: true
      }
    });
  };
}
```

### Associate Site to Study

```typescript
import { useAssociateSiteToStudy } from './services/SiteService';

function SiteAssociationButton({ studyId, siteId }) {
  const associateMutation = useAssociateSiteToStudy();
  
  const handleAssociate = async () => {
    await associateMutation.mutateAsync({
      studyId,
      siteId,
      activationDate: new Date().toISOString().split('T')[0]
    });
  };
}
```

---

## Error Handling

### Handle Errors in Component

```typescript
import { useStudy } from './services/StudyService';

function StudyDetails({ studyId }) {
  const { data: study, error, isError } = useStudy(studyId);
  
  if (isError) {
    return (
      <div className="error">
        <h3>Error Loading Study</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  
  // ... render study
}
```

### Handle Mutation Errors

```typescript
import { useCreateStudy } from './services/StudyService';

function CreateStudyForm() {
  const createMutation = useCreateStudy();
  
  const handleSubmit = async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
      alert('Study created successfully!');
    } catch (error) {
      alert(`Failed to create study: ${error.message}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {createMutation.isError && (
        <div className="error">{createMutation.error.message}</div>
      )}
      {/* form fields */}
    </form>
  );
}
```

---

## Performance Tips

### 1. Use `enabled` to Prevent Unnecessary Queries

```typescript
// Only fetch study if ID exists
const { data: study } = useStudy(studyId, { enabled: !!studyId });

// Only fetch subjects if study is selected
const { data: subjects } = useSubjectsByStudy(studyId, { enabled: !!studyId });
```

### 2. Use `select` to Transform Data

```typescript
const { data: studyNames } = useStudies({
  select: (studies) => studies.map(s => s.name)
});
```

### 3. Prefetch Data

```typescript
import { useQueryClient } from '@tanstack/react-query';

function StudyList() {
  const queryClient = useQueryClient();
  const { data: studies } = useStudies();
  
  const handleMouseEnter = (studyId) => {
    // Prefetch study details on hover
    queryClient.prefetchQuery({
      queryKey: ['study', studyId],
      queryFn: () => fetchStudyById(studyId)
    });
  };
  
  return (
    <ul>
      {studies?.map(study => (
        <li key={study.id} onMouseEnter={() => handleMouseEnter(study.id)}>
          {study.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## Debugging

### Enable React Query DevTools

```typescript
// Already enabled in development (see App.tsx)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Check Cache State

```typescript
import { useQueryClient } from '@tanstack/react-query';

function DebugComponent() {
  const queryClient = useQueryClient();
  
  const handleDumpCache = () => {
    const cache = queryClient.getQueryCache();
    console.log('Cache:', cache.getAll());
  };
  
  return <button onClick={handleDumpCache}>Dump Cache</button>;
}
```

---

## Migration from Old Code

### Before (Old Pattern)

```typescript
import StudyService from './services/StudyService';

class StudyList extends React.Component {
  state = { studies: [], loading: true, error: null };
  
  async componentDidMount() {
    try {
      const studies = await StudyService.getAllStudies();
      this.setState({ studies, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }
  
  render() {
    const { studies, loading, error } = this.state;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return <ul>{studies.map(s => <li key={s.id}>{s.name}</li>)}</ul>;
  }
}
```

### After (New Pattern)

```typescript
import { useStudies } from './services/StudyService';

function StudyList() {
  const { data: studies, isLoading, error } = useStudies();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {studies?.map(study => (
        <li key={study.id}>{study.name}</li>
      ))}
    </ul>
  );
}
```

**Benefits:**
- ✅ Less boilerplate (no state management)
- ✅ Automatic caching
- ✅ Automatic refetching
- ✅ Better TypeScript support
- ✅ Easier to test

---

## Need Help?

1. **Check the service file:** All hooks have JSDoc examples
2. **Check React Query docs:** https://tanstack.com/query/latest
3. **Use TypeScript autocomplete:** IntelliSense shows all available hooks
4. **Check DevTools:** React Query DevTools show cache state
5. **Read the migration summary:** `PHASE_1_TYPESCRIPT_MIGRATION_SUMMARY.md`

---

**Quick Reference Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team
