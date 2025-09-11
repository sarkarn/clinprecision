# Study-Design Service - Complete Backend Redesign Specification

## 1. Overview

This document outlines the complete redesign of the study-design service backend from scratch, based on 1.1 frontend feature integration requirements.

## 2. API Endpoint Analysis (Frontend Integration Point)

### 2.1 Primary Study Registration Endpoint
```http
POST /study-design-ws/api/studies
Content-Type: application/json
```

### 2.2 Frontend JSON Request Structure
```json
{
  "name": "Phase III Oncology Trial - Advanced NSCLC",
  "protocolNumber": "PRO-ONK-001", 
  "phase": "Phase III",
  "sponsor": "Pharma Corp",
  "description": "Advanced NSCLC study description",
  "status": "draft",
  "startDate": "2025-01-15",
  "endDate": "2027-06-30",
  "organizations": [
    {
      "organizationId": 1,
      "role": "sponsor"
    }
  ],
  "metadata": "{\"principalInvestigator\":\"Dr. Sarah Johnson\",\"studyCoordinator\":\"Jane Doe\",\"medicalMonitor\":\"Dr. Smith\",\"primaryObjective\":\"To compare efficacy...\",\"secondaryObjectives\":[\"Safety assessment\"],\"estimatedDuration\":\"104 weeks\",\"studyType\":\"interventional\",\"regulatoryStatus\":\"FDA approved\",\"ethicsApproval\":true,\"fdaInd\":true}"
}
```

### 2.3 Additional Study Design Endpoints (Based on Frontend Analysis)
```http
GET /study-design-ws/api/studies                     # List all studies
GET /study-design-ws/api/studies/{id}                # Get study by ID
PUT /study-design-ws/api/studies/{id}                # Update study
GET /study-design-ws/api/studies/{id}/arms           # Get study arms
PUT /study-design-ws/api/studies/{id}/arms           # Save study arms
GET /study-design-ws/api/studies/{id}/visits         # Get visit schedule
PUT /study-design-ws/api/studies/{id}/visits         # Save visit schedule
GET /study-design-ws/api/studies/{id}/form-bindings  # Get form bindings
PUT /study-design-ws/api/studies/{id}/form-bindings  # Save form bindings
POST /study-design-ws/api/studies/{id}/validate      # Validate study for publishing
POST /study-design-ws/api/studies/{id}/publish       # Publish study
GET /study-design-ws/api/studies/{id}/design-progress # Get design progress
PUT /study-design-ws/api/studies/{id}/design-progress # Update design progress
GET /study-design-ws/api/studies/{id}/revisions      # Get study revisions
POST /study-design-ws/api/studies/{id}/revisions     # Create revision
```

## 3. Database Design (Based on Existing Schema)

### 3.1 Core Tables Used
```sql
-- Primary Study Entity
studies (
    id, name, description, sponsor, protocol_number, version, 
    is_latest_version, parent_version_id, version_notes, is_locked,
    phase, status, start_date, end_date, metadata, created_by, 
    created_at, updated_at
)

-- Study Versioning
study_versions (
    id, study_id, version, version_date, created_by, version_notes
)

-- Organization-Study Relationships
organization_studies (
    id, organization_id, study_id, role, start_date, end_date
)

-- Study Arms/Groups
study_arms (
    id, study_id, name, description, randomization_ratio
)

-- Visit Definitions
visit_definitions (
    id, study_id, arm_id, name, description, timepoint, 
    window_before, window_after, visit_type, is_required, sequence_number
)

-- Form Definitions
form_definitions (
    id, study_id, name, description, form_type, version, 
    is_latest_version, fields, status
)

-- Visit-Form Associations
visit_forms (
    id, visit_definition_id, form_definition_id, sequence_number, 
    is_required, is_active
)
```

## 4. Entity Design

### 4.1 Core Entities
1. **StudyEntity** - Maps to studies table
2. **StudyVersionEntity** - Maps to study_versions table  
3. **OrganizationStudyEntity** - Maps to organization_studies table
4. **StudyArmEntity** - Maps to study_arms table
5. **VisitDefinitionEntity** - Maps to visit_definitions table
6. **FormEntity** - Maps to form_definitions table
7. **VisitFormEntity** - Maps to visit_forms table

### 4.2 Supporting Entities (Reference Data)
1. **UserEntity** - Maps to users table (for created_by references)
2. **OrganizationEntity** - Maps to organizations table

## 5. DTO Design

### 5.1 Request DTOs
1. **StudyCreateRequestDto** - For POST /studies
2. **StudyUpdateRequestDto** - For PUT /studies/{id}
3. **StudyArmDto** - For study arms operations
4. **VisitScheduleDto** - For visit schedule operations
5. **FormBindingDto** - For form binding operations
6. **StudyPublishRequestDto** - For publishing operations

### 5.2 Response DTOs
1. **StudyResponseDto** - Standard study response
2. **StudyListDto** - For study listing
3. **StudyDetailDto** - Detailed study with arms/visits
4. **StudyValidationResponseDto** - For validation results
5. **StudyPublishResponseDto** - For publish operations
6. **DesignProgressDto** - For design progress tracking

## 6. Service Layer Design

### 6.1 Core Services
1. **StudyService** - Main study operations
2. **StudyDesignService** - Study design workflow operations
3. **StudyVersioningService** - Version management
4. **StudyValidationService** - Validation logic
5. **StudyPublishingService** - Publishing workflow

### 6.2 Supporting Services
1. **OrganizationStudyService** - Organization relationships
2. **StudyArmService** - Study arms management
3. **VisitScheduleService** - Visit schedule management
4. **FormBindingService** - Form binding operations

## 7. Repository Design

### 7.1 JPA Repositories
1. **StudyRepository** - extends JpaRepository<StudyEntity, Long>
2. **StudyVersionRepository** - extends JpaRepository<StudyVersionEntity, Long>
3. **OrganizationStudyRepository** - extends JpaRepository<OrganizationStudyEntity, Long>
4. **StudyArmRepository** - extends JpaRepository<StudyArmEntity, Long>
5. **VisitDefinitionRepository** - extends JpaRepository<VisitDefinitionEntity, Long>
6. **FormRepository** - extends JpaRepository<FormEntity, Long>
7. **VisitFormRepository** - extends JpaRepository<VisitFormEntity, Long>

### 7.2 Custom Query Methods
- findByStatusIn()
- findByCreatedByAndStatus()
- findByStudyIdOrderBySequenceNumber()
- findActiveFormsByVisitDefinitionId()

## 8. Controller Design

### 8.1 Primary Controller
**StudyController** - Main REST controller handling all study operations

### 8.2 Supporting Controllers
**StudyDesignController** - Specialized design workflow operations

## 9. Configuration & Security

### 9.1 Spring Boot Configuration
- JPA/Hibernate configuration
- MySQL datasource configuration
- Jackson JSON configuration
- Exception handling configuration

### 9.2 Security Considerations
- Authentication integration
- Authorization for study operations
- Data validation and sanitization

## 10. Implementation Priority

### Phase 1: Core Study CRUD
1. StudyEntity and StudyCreateRequestDto
2. StudyService basic operations
3. StudyController POST/GET endpoints
4. Repository layer setup

### Phase 2: Study Design Workflow
1. StudyArmEntity and operations
2. VisitDefinitionEntity and operations  
3. FormEntity and binding operations
4. StudyDesignService implementation

### Phase 3: Advanced Features
1. Version management
2. Publishing workflow
3. Validation framework
4. Progress tracking

## 11. Testing Strategy

### 11.1 Unit Tests
- Service layer unit tests with mocked repositories
- DTO validation tests
- Entity relationship tests

### 11.2 Integration Tests
- Controller integration tests
- Database integration tests
- JSON serialization/deserialization tests

## 12. Error Handling & Validation

### 12.1 Validation Framework
- Bean Validation (JSR-303) annotations
- Custom business rule validation
- Cross-field validation

### 12.2 Exception Handling
- Global exception handler
- Specific business exceptions
- Proper HTTP status codes

This specification provides the complete foundation for reimplementing the study-design service backend from scratch, ensuring full compatibility with the existing 1.1 frontend integration requirements.
