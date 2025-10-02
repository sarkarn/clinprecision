# Study Design Module - Mock Data Replacement Implementation Plan

## ⚠️ **CORRECTED ANALYSIS - You Are Right!**

**Priority 1 and 2 components are ALREADY FULLY INTEGRATED!**

- **VisitScheduleDesigner.jsx** ✅ All CRUD operations use real APIs  
- **FormBindingDesigner.jsx** ✅ All CRUD operations use real APIs
- Only console.log "bulk save" operations remain (minor convenience features)

**Actual Remaining Work:**
- **StudyPublishWorkflow.jsx** - Full mock data (needs new backend APIs)  
- **ProtocolRevisionWorkflow.jsx** - Full mock data (backend APIs exist!)

**Revised Estimate: 2-3 weeks instead of 6 weeks**

---

## Executive Summary

This document provides a comprehensive analysis of all mock data usage within the Study Design module and outlines the implementation plan to replace mock data with real backend API integrations. The study-design module currently uses mock data in several key components that need to be integrated with the existing backend services.

## Current Architecture Overview

### Frontend Components
- **StudyDesignDashboard.jsx** - Main orchestrator (✅ Already integrated)
- **StudyArmsDesigner.jsx** - Study arms management (✅ Already integrated) 
- **VisitScheduleDesigner.jsx** - Visit schedule management (⚠️ Partially integrated)
- **FormBindingDesigner.jsx** - Form binding management (⚠️ Partially integrated)
- **StudyPublishWorkflow.jsx** - Publishing workflow (❌ Mock data)
- **ProtocolRevisionWorkflow.jsx** - Protocol versioning (❌ Mock data)

### Backend Services Available
- **clinprecision-studydesign-service** - Main service
  - StudyVersionController ✅
  - StudyAmendmentController ✅  
  - VisitDefinitionController ✅
  - StudyArmController ✅
  - FormDefinitionController ✅
  - StudyStatusController ✅
  - StudyDocumentController ✅

## Mock Data Analysis

### 1. StudyPublishWorkflow.jsx
**Status:** ❌ FULL MOCK DATA USAGE

#### Current Mock Data:
```javascript
const mockData = {
    study: {
        id: studyId,
        name: 'Phase III Oncology Trial - Advanced NSCLC',
        state: 'DESIGN',
        version: '1.0',
        lastModified: '2024-01-15T10:30:00Z',
        // ... more fields
    },
    validationResults: [
        {
            category: 'Study Information',
            status: 'PASSED',
            checks: [
                { name: 'Study title defined', status: 'PASSED', required: true },
                // ... more validation checks
            ]
        }
        // ... more categories
    ],
    reviewers: [
        {
            id: 'R001',
            name: 'Dr. Emily Rodriguez',
            role: 'Principal Investigator',
            // ... more reviewer data
        }
        // ... more reviewers
    ]
}
```

#### Required API Integration:
- **GET /api/studies/{studyId}** - Get study details
- **GET /api/studies/{studyId}/validation** - Get validation results
- **GET /api/studies/{studyId}/reviewers** - Get assigned reviewers
- **PUT /api/studies/{studyId}/publish** - Publish study
- **GET /api/studies/{studyId}/status** - Get publication status

### 2. ProtocolRevisionWorkflow.jsx  
**Status:** ❌ FULL MOCK DATA USAGE

#### Current Mock Data:
```javascript
const mockData = {
    study: {
        id: studyId,
        name: 'Phase III Oncology Trial - Advanced NSCLC',
        currentVersion: '2.1',
        state: 'PUBLISHED',
        // ... more study data
    },
    versions: [
        {
            id: 'V1.0',
            version: '1.0',
            status: 'ARCHIVED',
            type: 'ORIGINAL',
            // ... version history
        }
        // ... more versions
    ],
    pendingRevisions: [
        {
            id: 'REV001',
            title: 'Primary Endpoint Modification',
            // ... revision data
        }
        // ... more revisions
    ]
}
```

#### Required API Integration:
- **GET /api/studies/{studyId}/versions** - Get version history ✅ AVAILABLE
- **GET /api/studies/{studyId}/amendments** - Get pending amendments ✅ AVAILABLE
- **POST /api/studies/{studyId}/versions** - Create new version ✅ AVAILABLE
- **PUT /api/studies/{studyId}/versions/{versionId}** - Update version ✅ AVAILABLE
- **POST /api/studies/{studyId}/amendments** - Create amendment ✅ AVAILABLE

### 3. VisitScheduleDesigner.jsx
**Status:** ✅ FULLY INTEGRATED  

#### Current Implementation:
- **Individual CRUD Operations**: All working with real APIs
  - `VisitDefinitionService.createVisit()` ✅ 
  - `VisitDefinitionService.updateVisit()` ✅ 
  - `VisitDefinitionService.deleteVisit()` ✅
- **Bulk Save Operation**: Line 272-273 still uses mock console logging
- This is just a convenience "Save All" feature, individual operations work fine

#### Minor Enhancement Needed:
Replace the bulk save console.log with actual API calls (optional feature enhancement)

### 4. FormBindingDesigner.jsx
**Status:** ✅ FULLY INTEGRATED

#### Current Implementation:
- **All CRUD Operations**: Fully implemented with real APIs
  - `VisitDefinitionService.createVisitFormBinding()` ✅
  - `VisitDefinitionService.updateVisitFormBinding()` ✅  
  - `VisitDefinitionService.deleteVisitFormBinding()` ✅
- **Bulk Save Operation**: Line 158-159 still uses mock console logging
- This is just a convenience "Save All" feature, individual operations work fine

#### Minor Enhancement Needed:  
Replace the bulk save console.log with actual API calls (optional feature enhancement)

## Implementation Plan

### Phase 1: Minor Enhancements (Optional - Low Priority)

#### 1.1 Bulk Save Operations (Optional)
**Estimated Time:** 1 day

**Tasks:**
1. Replace console.log bulk save in VisitScheduleDesigner (Line 272-273)
2. Replace console.log bulk save in FormBindingDesigner (Line 158-159)
3. These are convenience features - individual CRUD operations already work perfectly

**Note:** These are NOT critical as all individual CRUD operations are fully functional

#### 1.2 UI Polish
**Estimated Time:** 1 day  

**Tasks:**
1. Remove mock form field comments (FormBindingDesigner line 707)
2. Clean up any remaining mock data format handling
3. UI/UX improvements

### Phase 2: Study Publishing Integration (High Priority)

#### 2.1 StudyPublishWorkflow Integration
**Estimated Time:** 5-6 days

**Required Backend APIs (Need Development):**
1. **Study Validation API**
   - Endpoint: `GET /api/studies/{studyId}/validation`
   - Returns validation results by category
   
2. **Study Reviewers API**  
   - Endpoint: `GET /api/studies/{studyId}/reviewers`
   - Returns assigned reviewers and approval status
   
3. **Study Publishing API**
   - Endpoint: `PUT /api/studies/{studyId}/publish`
   - Publishes study and updates status

**Backend Development Required:**
```java
// StudyValidationController.java (NEW)
@RestController
@RequestMapping("/api/studies/{studyId}")
public class StudyValidationController {
    
    @GetMapping("/validation")
    public ResponseEntity<StudyValidationResultDto> validateStudy(@PathVariable Long studyId) {
        // Implement validation logic
    }
    
    @GetMapping("/reviewers")
    public ResponseEntity<List<StudyReviewerDto>> getStudyReviewers(@PathVariable Long studyId) {
        // Get assigned reviewers
    }
    
    @PutMapping("/publish")
    public ResponseEntity<StudyPublishResultDto> publishStudy(@PathVariable Long studyId, 
                                                            @RequestBody StudyPublishRequestDto request) {
        // Publish study logic
    }
}
```

### Phase 3: Protocol Revision Integration (Medium Priority)

#### 3.1 ProtocolRevisionWorkflow Integration
**Estimated Time:** 3-4 days

**Good News:** Backend APIs already exist!
- StudyVersionController ✅
- StudyAmendmentController ✅

**Tasks:**
1. Replace mock data with real API calls to existing controllers
2. Implement version comparison functionality  
3. Add amendment workflow integration
4. Implement proper state management for versions

**Implementation:**
```javascript
// Replace mock data loading
const loadRevisionData = async () => {
    try {
        const [study, versions, amendments] = await Promise.all([
            StudyService.getStudyById(studyId),
            StudyVersioningService.getStudyVersions(studyId),
            StudyVersioningService.getStudyAmendments(studyId)
        ]);
        
        setStudy(study);
        setVersions(versions);
        setPendingRevisions(amendments);
        setSelectedVersion(versions.find(v => v.status === 'ACTIVE'));
        
    } catch (error) {
        console.error('Error loading revision data:', error);
        setErrors(['Failed to load revision data']);
    }
};
```

## Backend API Development Requirements

### New APIs Needed

#### 1. Study Validation Service
```java
// StudyValidationService.java
@Service
public class StudyValidationService {
    
    public StudyValidationResultDto validateStudy(Long studyId) {
        // Validate study completeness
        // Check required fields
        // Validate business rules
        // Return categorized validation results
    }
    
    public List<ValidationCheckDto> validateStudyInformation(StudyDto study) {
        // Validate basic study information
    }
    
    public List<ValidationCheckDto> validateStudyArms(Long studyId) {
        // Validate study arms configuration
    }
    
    public List<ValidationCheckDto> validateVisitSchedule(Long studyId) {
        // Validate visit schedule completeness
    }
    
    public List<ValidationCheckDto> validateFormBindings(Long studyId) {
        // Validate form bindings
    }
}
```

#### 2. Form Binding Service
```java
// FormBindingService.java  
@Service
public class FormBindingService {
    
    public List<FormBindingDto> getFormBindings(Long studyId) {
        // Get all form bindings for study
    }
    
    public FormBindingDto createFormBinding(Long studyId, FormBindingCreateDto request) {
        // Create new form binding
    }
    
    public FormBindingDto updateFormBinding(Long bindingId, FormBindingUpdateDto request) {
        // Update existing binding
    }
    
    public void deleteFormBinding(Long bindingId) {
        // Delete form binding
    }
}
```

#### 3. Study Reviewer Service
```java
// StudyReviewerService.java
@Service  
public class StudyReviewerService {
    
    public List<StudyReviewerDto> getStudyReviewers(Long studyId) {
        // Get assigned reviewers for study
    }
    
    public StudyReviewerDto assignReviewer(Long studyId, AssignReviewerDto request) {
        // Assign new reviewer
    }
    
    public ApprovalStatusDto getApprovalStatus(Long studyId) {
        // Get overall approval status
    }
}
```

## Database Schema Extensions

### New Tables Required

```sql
-- Form bindings table
CREATE TABLE form_bindings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    visit_id BIGINT,
    binding_rules JSON,
    is_required BOOLEAN DEFAULT FALSE,
    conditional_logic JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (form_id) REFERENCES form_definitions(id),
    FOREIGN KEY (visit_id) REFERENCES visit_definitions(id)
);

-- Study reviewers table
CREATE TABLE study_reviewers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reviewer_role ENUM('PRINCIPAL_INVESTIGATOR', 'CO_INVESTIGATOR', 'REGULATORY_REVIEWER', 'STATISTICIAN') NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION') DEFAULT 'PENDING',
    approval_date TIMESTAMP NULL,
    comments TEXT,
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Study validation results cache table
CREATE TABLE study_validation_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    validation_category VARCHAR(100) NOT NULL,
    validation_status ENUM('PASSED', 'WARNING', 'FAILED') NOT NULL,
    validation_checks JSON NOT NULL,
    last_validated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);
```

## Testing Strategy

### Unit Tests Required
1. **FormBindingService Tests**
   - CRUD operations
   - Validation logic
   - Error handling

2. **StudyValidationService Tests**  
   - Each validation category
   - Business rule validation
   - Edge cases

3. **StudyReviewerService Tests**
   - Reviewer assignment
   - Approval workflows
   - Permission checks

### Integration Tests Required
1. **API Integration Tests**
   - Full workflow testing
   - Error scenario testing
   - Performance testing

2. **Frontend Integration Tests**
   - Component API integration
   - State management testing
   - User workflow testing

## Rollout Plan

### Stage 1: Development (Weeks 1-2)
- Phase 1 implementations (VisitSchedule + FormBinding)
- Backend API development for missing services
- Database schema updates

### Stage 2: Backend Integration (Weeks 3-4)  
- StudyPublishWorkflow integration
- ProtocolRevisionWorkflow integration
- Comprehensive testing

### Stage 3: Testing & QA (Week 5)
- Integration testing
- User acceptance testing
- Performance testing
- Bug fixes

### Stage 4: Deployment (Week 6)
- Staging deployment
- Production deployment
- Monitoring and support

## Risk Assessment

### High Risk
1. **Database Migration** - Schema changes need careful planning
2. **API Dependencies** - New backend APIs need to be developed
3. **State Management** - Complex state synchronization between components

### Medium Risk  
1. **Performance Impact** - Multiple API calls might affect performance
2. **Data Consistency** - Ensuring data consistency across operations
3. **Error Handling** - Comprehensive error handling for all scenarios

### Low Risk
1. **UI Changes** - Minimal UI changes required
2. **Existing API Integration** - Some APIs already exist and working

## Success Criteria

### Technical Criteria
- [ ] All mock data replaced with real API calls
- [ ] All CRUD operations working correctly
- [ ] Proper error handling implemented
- [ ] Loading states implemented
- [ ] Performance metrics maintained

### Functional Criteria  
- [ ] Users can complete full study design workflow
- [ ] Study publishing workflow functional
- [ ] Protocol revision workflow functional
- [ ] Form binding management working
- [ ] Data persistence across sessions

### Quality Criteria
- [ ] 90%+ test coverage for new code
- [ ] Zero critical bugs in production
- [ ] Performance under acceptable thresholds
- [ ] User acceptance criteria met

## Conclusion

This implementation plan provides a structured approach to replace all mock data in the Study Design module with real backend integrations. The plan is divided into phases based on priority and complexity, with clear timelines and deliverables.

**Total Estimated Effort:** 6 weeks
**Key Dependencies:** Backend API development, Database schema updates
**Primary Benefits:** Full functionality, Data persistence, Production readiness

The plan ensures minimal disruption to existing functionality while providing a clear path to full backend integration.