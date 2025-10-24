# Week 2 Action Plan - Data Capture Services Migration
**Phase 2.1: Converting 7 Services to TypeScript**

**Week:** October 28 - November 1, 2025  
**Goal:** Convert all data capture and study management services to TypeScript  
**Target:** 7 services, ~50 React Query hooks, Build passing

---

## 📋 Daily Breakdown

### **Monday: Patient Services (Day 1-2)**

#### **Morning: PatientEnrollmentService.ts**

**1. Create Type Definitions** (`src/types/domain/Patient.types.ts`)
```typescript
export interface Patient {
  id: number;
  patientNumber: string;
  screeningNumber?: string;
  studyId: number;
  siteId: number;
  status: PatientStatus;
  enrollmentDate: string;
  demographics: PatientDemographics;
  aggregateUuid?: string;
}

export interface PatientDemographics {
  dateOfBirth?: string;
  gender?: string;
  ethnicity?: string;
  race?: string;
}

export enum PatientStatus {
  REGISTERED = 'REGISTERED',
  SCREENING = 'SCREENING',
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  SCREEN_FAILED = 'SCREEN_FAILED'
}

export interface EnrollmentData {
  studyId: number;
  siteId: number;
  screeningNumber?: string;
  demographics: PatientDemographics;
}
```

**2. Create Service** (`src/services/data-capture/PatientEnrollmentService.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import { Patient, EnrollmentData, PatientStatus } from '../../types/domain/Patient.types';

const API_BASE = '/clinops-ws/api/v1/patients';

// API Functions
export async function fetchPatientsByStudy(studyId: number): Promise<Patient[]> {
  const response = await ApiService.get(`${API_BASE}/study/${studyId}`);
  return response.data || [];
}

export async function fetchPatientById(id: number): Promise<Patient> {
  const response = await ApiService.get(`${API_BASE}/${id}`);
  return response.data;
}

export async function enrollPatient(data: EnrollmentData): Promise<Patient> {
  const response = await ApiService.post(API_BASE, data);
  return response.data;
}

export async function updatePatientStatus(
  id: number, 
  status: PatientStatus
): Promise<Patient> {
  const response = await ApiService.put(`${API_BASE}/${id}/status`, { status });
  return response.data;
}

// React Query Hooks
export function usePatientsByStudy(studyId: number | undefined) {
  return useQuery<Patient[], Error>({
    queryKey: ['patients', 'study', studyId],
    queryFn: () => fetchPatientsByStudy(studyId!),
    enabled: !!studyId,
  });
}

export function usePatient(id: number | undefined) {
  return useQuery<Patient, Error>({
    queryKey: ['patients', id],
    queryFn: () => fetchPatientById(id!),
    enabled: !!id,
  });
}

export function useEnrollPatient() {
  const queryClient = useQueryClient();
  
  return useMutation<Patient, Error, EnrollmentData>({
    mutationFn: enrollPatient,
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'study', patient.studyId] });
      queryClient.invalidateQueries({ queryKey: ['subjects', 'study', patient.studyId] });
    },
  });
}

export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<Patient, Error, { id: number; status: PatientStatus }>({
    mutationFn: ({ id, status }) => updatePatientStatus(id, status),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients', patient.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'study', patient.studyId] });
    },
  });
}

// Legacy exports for backward compatibility
export default {
  fetchPatientsByStudy,
  fetchPatientById,
  enrollPatient,
  updatePatientStatus,
};
```

**3. Test & Verify**
```bash
npm run build
# Should compile with 0 errors
```

**4. Check Integration**
- Search for components using old service
- Verify backward compatibility works
- Test with actual API if available

---

#### **Afternoon: PatientStatusService.ts**

**1. Create Type Definitions** (`src/types/domain/PatientStatus.types.ts`)
```typescript
export interface StatusHistory {
  id: number;
  patientId: number;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface StatusTransition {
  from: string;
  to: string;
  allowed: boolean;
  requiresReason: boolean;
}

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ['SCREENING', 'WITHDRAWN'],
  SCREENING: ['ENROLLED', 'SCREEN_FAILED', 'WITHDRAWN'],
  ENROLLED: ['ACTIVE', 'WITHDRAWN'],
  ACTIVE: ['COMPLETED', 'WITHDRAWN'],
  COMPLETED: [],
  WITHDRAWN: [],
  SCREEN_FAILED: [],
};
```

**2. Create Service** (`src/services/data-capture/PatientStatusService.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import { StatusHistory, STATUS_TRANSITIONS } from '../../types/domain/PatientStatus.types';

const API_BASE = '/clinops-ws/api/v1/patients';

export async function fetchStatusHistory(patientId: number): Promise<StatusHistory[]> {
  const response = await ApiService.get(`${API_BASE}/${patientId}/status-history`);
  return response.data || [];
}

export function isStatusTransitionAllowed(
  currentStatus: string, 
  newStatus: string
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

export function useStatusHistory(patientId: number | undefined) {
  return useQuery<StatusHistory[], Error>({
    queryKey: ['patients', patientId, 'status-history'],
    queryFn: () => fetchStatusHistory(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export default {
  fetchStatusHistory,
  isStatusTransitionAllowed,
  STATUS_TRANSITIONS,
};
```

**3. Test & Build**
```bash
npm run build
```

---

### **Tuesday: Form Data Services (Day 2)**

#### **Morning: DataEntryService.ts**

**1. Create Types** (`src/types/domain/DataEntry.types.ts`)
```typescript
export interface FormData {
  id: number;
  formId: number;
  visitId: number;
  subjectId: number;
  data: Record<string, any>;
  status: FormDataStatus;
  enteredBy: string;
  enteredAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export enum FormDataStatus {
  DRAFT = 'DRAFT',
  COMPLETE = 'COMPLETE',
  VERIFIED = 'VERIFIED',
  LOCKED = 'LOCKED',
}

export interface DataEntryRequest {
  formId: number;
  visitId: number;
  subjectId: number;
  data: Record<string, any>;
}
```

**2. Create Service** (`src/services/data-capture/DataEntryService.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import { FormData, DataEntryRequest, FormDataStatus } from '../../types/domain/DataEntry.types';

const API_BASE = '/datacapture-ws/api/v1/form-data';

export async function fetchFormData(id: number): Promise<FormData> {
  const response = await ApiService.get(`${API_BASE}/${id}`);
  return response.data;
}

export async function saveFormData(data: DataEntryRequest): Promise<FormData> {
  const response = await ApiService.post(API_BASE, data);
  return response.data;
}

export async function updateFormData(
  id: number, 
  data: Partial<DataEntryRequest>
): Promise<FormData> {
  const response = await ApiService.put(`${API_BASE}/${id}`, data);
  return response.data;
}

export function useFormData(id: number | undefined) {
  return useQuery<FormData, Error>({
    queryKey: ['form-data', id],
    queryFn: () => fetchFormData(id!),
    enabled: !!id,
  });
}

export function useSaveFormData() {
  const queryClient = useQueryClient();
  
  return useMutation<FormData, Error, DataEntryRequest>({
    mutationFn: saveFormData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-data'] });
    },
  });
}

export default {
  fetchFormData,
  saveFormData,
  updateFormData,
};
```

---

#### **Afternoon: FormDataService.ts**

Similar pattern - create types, API functions, hooks, test.

---

### **Wednesday: Visit Forms (Day 3)**

#### **VisitFormService.ts**

Create service for visit-form associations and form selections.

---

### **Thursday: Study Documents (Day 4)**

#### **Morning: StudyDocumentService.ts**

**1. Create Types** (`src/types/domain/Document.types.ts`)
```typescript
export interface StudyDocument {
  id: number;
  studyId: number;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: DocumentStatus;
}

export enum DocumentType {
  PROTOCOL = 'PROTOCOL',
  ICF = 'ICF',
  INVESTIGATOR_BROCHURE = 'INVESTIGATOR_BROCHURE',
  CASE_REPORT_FORM = 'CASE_REPORT_FORM',
  REGULATORY = 'REGULATORY',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}
```

**2. Create Service** (`src/services/study-management/StudyDocumentService.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import { StudyDocument } from '../../types/domain/Document.types';

const API_BASE = '/study-ws/api/v1/studies';

export async function fetchStudyDocuments(studyId: number): Promise<StudyDocument[]> {
  const response = await ApiService.get(`${API_BASE}/${studyId}/documents`);
  return response.data || [];
}

export async function uploadDocument(
  studyId: number, 
  file: File, 
  metadata: any
): Promise<StudyDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await ApiService.post(
    `${API_BASE}/${studyId}/documents`, 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export function useStudyDocuments(studyId: number | undefined) {
  return useQuery<StudyDocument[], Error>({
    queryKey: ['studies', studyId, 'documents'],
    queryFn: () => fetchStudyDocuments(studyId!),
    enabled: !!studyId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation<StudyDocument, Error, { studyId: number; file: File; metadata: any }>({
    mutationFn: ({ studyId, file, metadata }) => uploadDocument(studyId, file, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['studies', variables.studyId, 'documents'] 
      });
    },
  });
}

export default {
  fetchStudyDocuments,
  uploadDocument,
};
```

---

#### **Afternoon: StudyFormService.ts**

Create service for study-form associations and form binding.

---

### **Friday: Wrap-up & Documentation (Day 5)**

#### **Morning:**
1. **Final Build Check**
   ```bash
   npm run build
   # Verify 0 TypeScript errors
   ```

2. **Run All Tests**
   ```bash
   npm test
   # Ensure no regressions
   ```

3. **Update Documentation**
   - Update PHASE_2_SERVICES_MIGRATION_SUMMARY.md
   - Document all new hooks in quick reference

#### **Afternoon:**
1. **Create PR**
   ```bash
   git add .
   git commit -m "feat: Phase 2.1 - Convert data capture services to TypeScript

   - PatientEnrollmentService.ts (10 hooks)
   - PatientStatusService.ts (6 hooks)
   - DataEntryService.ts (8 hooks)
   - FormDataService.ts (9 hooks)
   - VisitFormService.ts (7 hooks)
   - StudyDocumentService.ts (8 hooks)
   - StudyFormService.ts (9 hooks)

   Total: 7 services, 57 hooks
   Build: ✅ Passing (0 errors)
   "
   
   git push origin feat/phase-2-services
   ```

2. **Code Review**
   - Request review from team
   - Address feedback
   - Merge to main

3. **Celebrate** 🎉
   - Week 2 complete!
   - 17/42 services done (40%)
   - ~150 React Query hooks total

---

## ✅ Checklist

### Pre-Week Setup
- [ ] Create `feat/phase-2-services` branch
- [ ] Create `src/services/data-capture/` directory
- [ ] Create `src/services/study-management/` directory
- [ ] Create `src/types/domain/` directory

### Daily Checklist (Each Service)
- [ ] Create type definitions in `src/types/domain/`
- [ ] Create service file in appropriate directory
- [ ] Implement API functions (fetch, create, update, delete)
- [ ] Implement React Query hooks (use*, mutations)
- [ ] Add cache invalidation logic
- [ ] Add legacy exports for backward compatibility
- [ ] Run `npm run build` (verify 0 errors)
- [ ] Test with existing components
- [ ] Commit changes
- [ ] Update progress tracker

### End of Week
- [ ] All 7 services converted ✅
- [ ] Build passing (0 TypeScript errors) ✅
- [ ] No new ESLint warnings ✅
- [ ] Documentation updated ✅
- [ ] PR created and reviewed ✅
- [ ] Merged to main ✅

---

## 🎯 Success Criteria

### Must Have
- ✅ All 7 services converted to TypeScript
- ✅ ~50 React Query hooks created
- ✅ Build passing with 0 TypeScript errors
- ✅ Backward compatibility maintained
- ✅ No regressions in existing features

### Nice to Have
- ✅ <10 new ESLint warnings (if any)
- ✅ API integration tested
- ✅ Hook examples documented
- ✅ Type definitions comprehensive

---

## 📊 Progress Tracking

### Services Status

| Service | Status | Hooks | Lines | Day |
|---------|--------|-------|-------|-----|
| PatientEnrollmentService.ts | ⏳ | 10 | ~400 | Mon |
| PatientStatusService.ts | ⏳ | 6 | ~200 | Mon |
| DataEntryService.ts | ⏳ | 8 | ~350 | Tue |
| FormDataService.ts | ⏳ | 9 | ~400 | Tue |
| VisitFormService.ts | ⏳ | 7 | ~300 | Wed |
| StudyDocumentService.ts | ⏳ | 8 | ~350 | Thu |
| StudyFormService.ts | ⏳ | 9 | ~400 | Thu |

**Total:** 0/7 services, 0/57 hooks

---

## 🚨 Common Issues & Solutions

### Issue 1: Import Errors
```typescript
// ❌ Problem
import ApiService from './ApiService';
// Error: Cannot find module

// ✅ Solution
import ApiService from '../infrastructure/ApiService';
// Use correct relative path
```

### Issue 2: Type Errors with ApiService
```typescript
// ❌ Problem
const response = await ApiService.get<Patient[]>(url);
// Error: ApiService doesn't accept generic types

// ✅ Solution
const response = await ApiService.get(url);
return response.data as Patient[];
// Cast the response data instead
```

### Issue 3: Query Key Structure
```typescript
// ❌ Bad: Inconsistent keys
queryKey: ['patients', studyId]
queryKey: ['patient', id]

// ✅ Good: Consistent structure
queryKey: ['patients', 'study', studyId]
queryKey: ['patients', id]
```

### Issue 4: Missing Types
```typescript
// ❌ Problem
const data: any = ...

// ✅ Solution
// Create proper type definition
interface PatientData {
  id: number;
  name: string;
}
const data: PatientData = ...
```

---

## 📚 Resources

### Quick Reference
- [Phase 1 Summary](../PHASE_1_TYPESCRIPT_MIGRATION_SUMMARY.md)
- [Service Quick Reference](../TYPESCRIPT_SERVICES_QUICK_REFERENCE.md)
- [Comprehensive Plan](../TYPESCRIPT_MIGRATION_COMPREHENSIVE_PLAN.md)

### React Query
- [useQuery](https://tanstack.com/query/latest/docs/react/reference/useQuery)
- [useMutation](https://tanstack.com/query/latest/docs/react/reference/useMutation)
- [Query Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## 💡 Tips

1. **Start Small**: Begin with the simplest service (PatientStatusService)
2. **Test Frequently**: Run build after each service
3. **Copy Pattern**: Use completed services as templates
4. **Ask Questions**: Don't hesitate to ask team for help
5. **Document**: Add JSDoc comments for complex functions
6. **Take Breaks**: Don't burn out, pace yourself

---

**Good luck with Week 2! 🚀**

**Remember:** Quality over speed. It's better to do 5 services well than rush through 7 poorly.

---

**Last Updated:** October 24, 2025  
**Next Review:** Friday, November 1, 2025  
**Status:** 🎯 Ready to Start
