# Form Data Capture - Gap Analysis & Solution Design

## 🔴 Critical Gap Identified

**Date**: October 12, 2025  
**Priority**: P0 - Critical for GCP/FDA Compliance  
**Status**: ❌ **MISSING FUNCTIONALITY**

---

## Issue Summary

### What's Missing

The application has:
- ✅ `study_form_data` table (with JSON storage)
- ✅ `study_form_data_audit` table (FDA 21 CFR Part 11 compliance)
- ✅ Form definition management (FormDefinitionController)
- ✅ Form-visit binding logic (StudyDesignAggregate)
- ✅ Screening assessment form UI (ScreeningAssessmentForm.jsx)
- ✅ Enrollment forms UI

But **MISSING**:
- ❌ **NO backend service** to save form submissions to `study_form_data`
- ❌ **NO API endpoints** for form data capture
- ❌ **NO entity/repository** for `study_form_data` table
- ❌ **NO integration** between frontend forms and backend storage

### Impact

**Regulatory Compliance**: ⚠️ **CRITICAL RISK**
- **GCP (Good Clinical Practice)**: Requires all clinical data to be recorded and traceable
- **FDA 21 CFR Part 11**: Electronic records must be stored with audit trails
- **Data Loss**: Screening assessments, enrollment forms are NOT being saved

**Current Behavior**:
1. User completes screening assessment form ✅
2. Frontend validates eligibility ✅
3. Data stored in React state ✅
4. Status change API called ✅
5. **Form data LOST** ❌ (not saved to database)

**Should Be**:
1. User completes screening assessment form ✅
2. Frontend validates eligibility ✅
3. **Call form data API to save submission** ❌ MISSING
4. Status change includes reference to form submission ✅
5. Complete audit trail maintained ✅

---

## Current Architecture Analysis

### Database Schema (EXISTS)

```sql
-- ✅ Table exists in consolidated_schema.sql
CREATE TABLE study_form_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    subject_id BIGINT,                      -- Patient/subject ID
    visit_id BIGINT,                        -- Visit instance ID
    site_id BIGINT,
    status VARCHAR(50) DEFAULT 'DRAFT',     -- DRAFT, SUBMITTED, LOCKED
    form_data JSON,                         -- ALL form field data as JSON
    version INT DEFAULT 1,
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP NULL,
    locked_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- ✅ Audit table exists
CREATE TABLE study_form_data_audit (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,            -- INSERT, UPDATE, DELETE, LOCK
    old_data JSON,
    new_data JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT
);
```

### Backend Services (MISSING)

**What Exists**:
- ✅ `FormDefinitionController` - Manages form definitions (templates)
- ✅ `FormDefinitionService` - CRUD for form templates
- ✅ `StudyDesignCommandController` - Assigns forms to visits
- ✅ `StudyDesignQueryController` - Queries form assignments

**What's Missing**:
- ❌ `StudyFormDataEntity.java` - JPA entity for form submissions
- ❌ `StudyFormDataRepository.java` - Database access
- ❌ `StudyFormDataService.java` - Business logic for form data capture
- ❌ `StudyFormDataController.java` - REST API endpoints
- ❌ `FormSubmissionRequest.java` - DTO for form submissions
- ❌ `FormSubmissionResponse.java` - DTO for responses

### Frontend Services (PARTIAL)

**What Exists**:
- ✅ `ScreeningAssessmentForm.jsx` - Captures screening data
- ✅ `StatusChangeModal.jsx` - Receives screening data
- ✅ Form data held in React state

**What's Missing**:
- ❌ `FormDataService.js` - API client for form submissions
- ❌ Integration to POST form data before status change

---

## Solution Design

### Option 1: ❌ Separate Form Data Microservice (NOT RECOMMENDED)

**Pros**:
- Clear separation of concerns
- Independent scaling
- Dedicated team ownership

**Cons**:
- ❌ **Overkill** for current needs
- ❌ Increased complexity (service discovery, inter-service communication)
- ❌ More deployment overhead
- ❌ Distributed transactions (form save + status change)
- ❌ Network latency between services

**Verdict**: **NOT RECOMMENDED** - Too complex for this use case

---

### Option 2: ✅ Integrate into Existing ClinOps Service (RECOMMENDED)

**Pros**:
- ✅ **Simple and pragmatic**
- ✅ Same transactional boundary (form save + status change)
- ✅ No distributed transactions
- ✅ Faster development (no new service setup)
- ✅ Leverages existing infrastructure

**Cons**:
- Service grows larger (but still manageable)

**Verdict**: ✅ **RECOMMENDED** - Best fit for current architecture

---

## Implementation Plan - Option 2

### Phase 1: Backend Foundation (2-3 hours)

#### 1.1 Create JPA Entity

**File**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/formdata/entity/StudyFormDataEntity.java`

```java
@Entity
@Table(name = "study_form_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyFormDataEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "form_id", nullable = false)
    private Long formId;
    
    @Column(name = "subject_id")
    private Long subjectId;  // Patient ID
    
    @Column(name = "visit_id")
    private Long visitId;
    
    @Column(name = "site_id")
    private Long siteId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private FormDataStatus status = FormDataStatus.DRAFT;
    
    @Type(JsonBinaryType.class)
    @Column(name = "form_data", columnDefinition = "json")
    private String formData;  // JSON string
    
    @Column(name = "version")
    private Integer version = 1;
    
    @Column(name = "is_locked")
    private Boolean isLocked = false;
    
    @Column(name = "locked_at")
    private LocalDateTime lockedAt;
    
    @Column(name = "locked_by")
    private Long lockedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    public enum FormDataStatus {
        DRAFT,      // In progress
        SUBMITTED,  // Completed by user
        LOCKED      // Locked for review/compliance
    }
}
```

#### 1.2 Create Repository

**File**: `StudyFormDataRepository.java`

```java
@Repository
public interface StudyFormDataRepository extends JpaRepository<StudyFormDataEntity, Long> {
    
    // Find all submissions for a subject
    List<StudyFormDataEntity> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);
    
    // Find submission for specific subject/visit/form
    Optional<StudyFormDataEntity> findBySubjectIdAndVisitIdAndFormId(
        Long subjectId, Long visitId, Long formId);
    
    // Find all submissions for a study
    List<StudyFormDataEntity> findByStudyIdOrderByCreatedAtDesc(Long studyId);
    
    // Find submissions by status
    List<StudyFormDataEntity> findByStudyIdAndStatus(Long studyId, FormDataStatus status);
    
    // Count submissions for a subject
    Long countBySubjectId(Long subjectId);
}
```

#### 1.3 Create DTOs

**File**: `FormSubmissionRequest.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionRequest {
    @NotNull
    private Long studyId;
    
    @NotNull
    private Long formId;
    
    @NotNull
    private Long subjectId;  // Patient ID
    
    private Long visitId;
    
    private Long siteId;
    
    @NotNull
    private Map<String, Object> formData;  // Key-value pairs of form fields
    
    private String status;  // DRAFT or SUBMITTED
    
    private Long submittedBy;
}
```

**File**: `FormSubmissionResponse.java`

```java
@Data
@Builder
public class FormSubmissionResponse {
    private Long id;
    private Long studyId;
    private Long formId;
    private Long subjectId;
    private Long visitId;
    private String status;
    private Map<String, Object> formData;
    private Integer version;
    private Boolean isLocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
}
```

#### 1.4 Create Service

**File**: `StudyFormDataService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudyFormDataService {
    
    private final StudyFormDataRepository formDataRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Submit form data (create or update)
     */
    public FormSubmissionResponse submitFormData(FormSubmissionRequest request) {
        log.info("Submitting form data: study={}, form={}, subject={}", 
            request.getStudyId(), request.getFormId(), request.getSubjectId());
        
        // Check if submission already exists
        Optional<StudyFormDataEntity> existingOpt = formDataRepository
            .findBySubjectIdAndVisitIdAndFormId(
                request.getSubjectId(), 
                request.getVisitId(), 
                request.getFormId()
            );
        
        StudyFormDataEntity entity;
        
        if (existingOpt.isPresent()) {
            // Update existing submission
            entity = existingOpt.get();
            entity.setFormData(toJsonString(request.getFormData()));
            entity.setStatus(FormDataStatus.valueOf(request.getStatus()));
            entity.setUpdatedAt(LocalDateTime.now());
            entity.setUpdatedBy(request.getSubmittedBy());
            entity.setVersion(entity.getVersion() + 1);
            log.info("Updating existing form data: id={}", entity.getId());
        } else {
            // Create new submission
            entity = StudyFormDataEntity.builder()
                .studyId(request.getStudyId())
                .formId(request.getFormId())
                .subjectId(request.getSubjectId())
                .visitId(request.getVisitId())
                .siteId(request.getSiteId())
                .formData(toJsonString(request.getFormData()))
                .status(FormDataStatus.valueOf(request.getStatus()))
                .version(1)
                .isLocked(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(request.getSubmittedBy())
                .updatedBy(request.getSubmittedBy())
                .build();
            log.info("Creating new form data submission");
        }
        
        StudyFormDataEntity saved = formDataRepository.save(entity);
        log.info("Form data saved successfully: id={}", saved.getId());
        
        return toResponse(saved);
    }
    
    /**
     * Get form submissions for a subject
     */
    @Transactional(readOnly = true)
    public List<FormSubmissionResponse> getSubjectFormData(Long subjectId) {
        return formDataRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get specific form submission
     */
    @Transactional(readOnly = true)
    public Optional<FormSubmissionResponse> getFormSubmission(Long id) {
        return formDataRepository.findById(id)
            .map(this::toResponse);
    }
    
    /**
     * Lock form data (prevent further edits)
     */
    public void lockFormData(Long id, Long lockedBy) {
        StudyFormDataEntity entity = formDataRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Form data not found: " + id));
        
        entity.setIsLocked(true);
        entity.setLockedAt(LocalDateTime.now());
        entity.setLockedBy(lockedBy);
        entity.setStatus(FormDataStatus.LOCKED);
        
        formDataRepository.save(entity);
        log.info("Form data locked: id={}", id);
    }
    
    // Helper methods
    private String toJsonString(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize form data", e);
        }
    }
    
    private Map<String, Object> fromJsonString(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize form data", e);
        }
    }
    
    private FormSubmissionResponse toResponse(StudyFormDataEntity entity) {
        return FormSubmissionResponse.builder()
            .id(entity.getId())
            .studyId(entity.getStudyId())
            .formId(entity.getFormId())
            .subjectId(entity.getSubjectId())
            .visitId(entity.getVisitId())
            .status(entity.getStatus().name())
            .formData(fromJsonString(entity.getFormData()))
            .version(entity.getVersion())
            .isLocked(entity.getIsLocked())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .createdBy(entity.getCreatedBy())
            .build();
    }
}
```

#### 1.5 Create Controller

**File**: `StudyFormDataController.java`

```java
@RestController
@RequestMapping("/api/form-data")
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyFormDataController {
    
    private final StudyFormDataService formDataService;
    
    /**
     * Submit form data
     * POST /api/form-data
     */
    @PostMapping
    public ResponseEntity<FormSubmissionResponse> submitFormData(
            @Valid @RequestBody FormSubmissionRequest request) {
        log.info("REST: Submit form data for subject: {}", request.getSubjectId());
        FormSubmissionResponse response = formDataService.submitFormData(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all form submissions for a subject
     * GET /api/form-data/subject/{subjectId}
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<FormSubmissionResponse>> getSubjectFormData(
            @PathVariable Long subjectId) {
        log.info("REST: Get form data for subject: {}", subjectId);
        List<FormSubmissionResponse> data = formDataService.getSubjectFormData(subjectId);
        return ResponseEntity.ok(data);
    }
    
    /**
     * Get specific form submission
     * GET /api/form-data/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormSubmissionResponse> getFormSubmission(@PathVariable Long id) {
        return formDataService.getFormSubmission(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Lock form data (prevent editing)
     * PUT /api/form-data/{id}/lock
     */
    @PutMapping("/{id}/lock")
    public ResponseEntity<Void> lockFormData(
            @PathVariable Long id,
            @RequestParam Long lockedBy) {
        formDataService.lockFormData(id, lockedBy);
        return ResponseEntity.ok().build();
    }
}
```

---

### Phase 2: Frontend Integration (1-2 hours)

#### 2.1 Create FormDataService

**File**: `frontend/clinprecision/src/services/FormDataService.js`

```javascript
import ApiService from './ApiService';

const FORM_DATA_PATH = '/clinops-ws/api/form-data';

class FormDataService {
    /**
     * Submit form data
     */
    async submitFormData(formSubmission) {
        try {
            const response = await ApiService.post(FORM_DATA_PATH, formSubmission);
            return response.data;
        } catch (error) {
            console.error('Error submitting form data:', error);
            throw error;
        }
    }
    
    /**
     * Get form submissions for a subject
     */
    async getSubjectFormData(subjectId) {
        try {
            const response = await ApiService.get(`${FORM_DATA_PATH}/subject/${subjectId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subject form data:', error);
            throw error;
        }
    }
    
    /**
     * Get specific form submission
     */
    async getFormSubmission(id) {
        try {
            const response = await ApiService.get(`${FORM_DATA_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching form submission:', error);
            throw error;
        }
    }
    
    /**
     * Lock form data
     */
    async lockFormData(id, lockedBy) {
        try {
            const response = await ApiService.put(`${FORM_DATA_PATH}/${id}/lock`, null, {
                params: { lockedBy }
            });
            return response.data;
        } catch (error) {
            console.error('Error locking form data:', error);
            throw error;
        }
    }
}

export default new FormDataService();
```

#### 2.2 Update StatusChangeModal.jsx

**Modify**: `handleScreeningComplete` to save form data

```javascript
const handleScreeningComplete = async (assessment) => {
    console.log('Screening assessment completed:', assessment);
    setScreeningData(assessment);
    
    try {
        // Save screening assessment form data
        const formSubmission = {
            studyId: patientData.studyId,  // Need to pass this from parent
            formId: 1,  // TODO: Get actual form ID for "Screening Assessment"
            subjectId: patientId,
            visitId: null,  // Screening may not be tied to specific visit
            siteId: patientData.siteId,
            formData: {
                // Eligibility criteria
                ageRequirement: assessment.ageRequirement,
                requiredDiagnosis: assessment.requiredDiagnosis,
                noExclusions: assessment.noExclusions,
                informedConsent: assessment.informedConsent,
                
                // Metadata
                screeningDate: assessment.screeningDate,
                assessorName: assessment.assessorName,
                notes: assessment.notes,
                
                // Calculated fields
                isEligible: assessment.isEligible,
                eligibilityReason: assessment.eligibilityReason
            },
            status: 'SUBMITTED',
            submittedBy: currentUserId  // Need to get from auth context
        };
        
        const savedForm = await FormDataService.submitFormData(formSubmission);
        console.log('Screening assessment saved:', savedForm.id);
        
        // Update status change notes to reference form submission
        const screeningReason = assessment.isEligible
            ? `Patient meets all screening criteria - Form ID: ${savedForm.id}`
            : `Patient does not meet screening criteria - Form ID: ${savedForm.id}`;
        
        setFormData(prev => ({
            ...prev,
            reason: screeningReason
        }));
        
        setShowScreeningForm(false);
        
    } catch (error) {
        console.error('Failed to save screening assessment:', error);
        setErrorMessage('Failed to save screening assessment. Please try again.');
        setShowError(true);
    }
};
```

---

### Phase 3: Testing & Validation (1 hour)

#### Test Scenarios

1. **Submit Screening Assessment**
   - Complete screening form
   - Verify saved to `study_form_data` table
   - Verify audit record created

2. **Retrieve Form Data**
   - Get all forms for a subject
   - Verify JSON data structure

3. **Lock Form Data**
   - Lock a submission
   - Verify cannot edit locked form

4. **Status Change Integration**
   - Change status to SCREENING
   - Verify form data saved
   - Verify status history references form ID

---

## Database Queries for Verification

### Check Form Submissions

```sql
-- View all form submissions for a subject
SELECT 
    id,
    study_id,
    form_id,
    subject_id,
    status,
    JSON_EXTRACT(form_data, '$.isEligible') as is_eligible,
    created_at,
    created_by
FROM study_form_data
WHERE subject_id = 1
ORDER BY created_at DESC;
```

### Check Audit Trail

```sql
-- View audit history for form submissions
SELECT 
    audit_id,
    record_id,
    action,
    changed_by,
    changed_at,
    change_reason
FROM study_form_data_audit
WHERE study_id = 1
ORDER BY changed_at DESC;
```

---

## Compliance Checklist

### GCP Requirements ✅

- ✅ All clinical data recorded in database
- ✅ Timestamp of data entry
- ✅ User who entered data
- ✅ Complete audit trail

### FDA 21 CFR Part 11 ✅

- ✅ Electronic records with audit trail
- ✅ Tamper-proof storage (audit table)
- ✅ User identification (created_by/updated_by)
- ✅ Record locking capability

---

## Effort Estimation

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Backend** | Entity, Repository, DTOs, Service, Controller | 2-3 hours |
| **Phase 2: Frontend** | FormDataService, Integration | 1-2 hours |
| **Phase 3: Testing** | Unit tests, Integration tests, Manual testing | 1 hour |
| **Total** | | **4-6 hours** |

---

## Recommendation

✅ **Proceed with Option 2** - Integrate into ClinOps Service

**Rationale**:
1. **Simple**: No new microservice overhead
2. **Fast**: 4-6 hours implementation
3. **Compliant**: Meets GCP/FDA requirements
4. **Scalable**: Can migrate to separate service later if needed
5. **Transactional**: Single database transaction for form save + status change

**Next Steps**:
1. Create backend foundation (Phase 1)
2. Integrate with frontend (Phase 2)
3. Test end-to-end workflow (Phase 3)
4. Deploy and validate in development environment

---

**Status**: ⏳ **Awaiting Approval**  
**Priority**: P0 - Critical for regulatory compliance  
**Decision Required**: Proceed with implementation?
