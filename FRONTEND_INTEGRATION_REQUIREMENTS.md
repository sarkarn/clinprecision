# 1.1 Frontend Feature Integration - Complete Requirements Summary

## Overview

Based on the detailed frontend analysis, here's the complete specification for reimplementing the study-design service backend to support the 1.1 frontend feature integration.

## 1. Primary JSON Request Structure (Study Registration)

The frontend sends this exact JSON structure to `POST /study-design-ws/api/studies`:

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
  "metadata": "{\"principalInvestigator\":\"Dr. Sarah Johnson\",\"studyCoordinator\":\"Jane Doe\",\"medicalMonitor\":\"Dr. Smith\",\"primaryObjective\":\"To compare efficacy of new drug vs standard of care\",\"secondaryObjectives\":[\"Safety assessment\",\"Quality of life improvement\"],\"estimatedDuration\":\"104 weeks\",\"studyType\":\"interventional\",\"regulatoryStatus\":\"FDA approved\",\"ethicsApproval\":true,\"fdaInd\":true}"
}
```

## 2. Required Database Tables (From Existing Schema)

### 2.1 Primary Tables
```sql
studies (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sponsor VARCHAR(255),
    protocol_number VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    parent_version_id VARCHAR(36),
    version_notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    phase VARCHAR(20),
    status ENUM('draft', 'active', 'completed', 'terminated'),
    start_date DATE,
    end_date DATE,
    metadata JSON,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

organization_studies (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role ENUM('sponsor', 'cro', 'site', 'vendor', 'laboratory'),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 2.2 Extension Tables for Study Design Workflow
```sql
study_arms (
    id BIGINT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    randomization_ratio INT
)

visit_definitions (
    id BIGINT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    arm_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timepoint INT NOT NULL,
    window_before INT DEFAULT 0,
    window_after INT DEFAULT 0,
    visit_type ENUM('screening', 'baseline', 'treatment', 'follow_up', 'unscheduled'),
    is_required BOOLEAN DEFAULT TRUE,
    sequence_number INT
)

form_definitions (
    id BIGINT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    status ENUM('draft', 'approved', 'retired'),
    fields JSON NOT NULL
)

visit_forms (
    id BIGINT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    sequence_number INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
)
```

## 3. Required Entities

### 3.1 Core Entities
1. **StudyEntity** - Maps to studies table
2. **OrganizationStudyEntity** - Maps to organization_studies table
3. **StudyArmEntity** - Maps to study_arms table  
4. **VisitDefinitionEntity** - Maps to visit_definitions table
5. **FormEntity** - Maps to form_definitions table
6. **VisitFormEntity** - Maps to visit_forms table

### 3.2 Entity Relationships
```
StudyEntity (1) -> (*) OrganizationStudyEntity
StudyEntity (1) -> (*) StudyArmEntity
StudyEntity (1) -> (*) VisitDefinitionEntity
StudyEntity (1) -> (*) FormEntity
VisitDefinitionEntity (1) -> (*) VisitFormEntity
FormEntity (1) -> (*) VisitFormEntity
```

## 4. Required DTOs

### 4.1 Request DTOs
```java
// For POST/PUT /api/studies
StudyCreateRequestDto {
    String name;                              // Required, 3-255 chars
    String protocolNumber;                    // Optional, max 100 chars
    String phase;                             // Required
    String sponsor;                           // Optional, max 255 chars
    String description;                       // Optional, max 1000 chars
    String status;                            // "draft"|"active"|"completed"|"terminated"
    LocalDate startDate;                      // Optional, YYYY-MM-DD format
    LocalDate endDate;                        // Optional, YYYY-MM-DD format
    List<OrganizationAssignmentDto> organizations; // Optional
    String metadata;                          // JSON string
}

OrganizationAssignmentDto {
    Long organizationId;                      // Required
    String role;                              // "sponsor"|"cro"|"site"|"vendor"|"laboratory"
    LocalDate startDate;                      // Optional
    LocalDate endDate;                        // Optional
}

// For study design workflow
StudyArmRequestDto {
    String name;                              // Required
    String description;                       // Optional
    Integer randomizationRatio;               // Optional
}

VisitScheduleRequestDto {
    String name;                              // Required
    String description;                       // Optional
    Integer timepoint;                        // Required, days from baseline
    Integer windowBefore;                     // Optional, default 0
    Integer windowAfter;                      // Optional, default 0
    String visitType;                         // "screening"|"baseline"|"treatment"|"follow_up"
    Boolean isRequired;                       // Optional, default true
    Integer sequenceNumber;                   // Optional
    Long armId;                               // Optional, null for all arms
}

FormBindingRequestDto {
    Long visitDefinitionId;                   // Required
    Long formDefinitionId;                    // Required
    Integer sequenceNumber;                   // Required
    Boolean isRequired;                       // Optional, default true
    Boolean isActive;                         // Optional, default true
}
```

### 4.2 Response DTOs
```java
StudyResponseDto {
    Long id;
    String name;
    String description;
    String sponsor;
    String protocolNumber;
    String version;
    Boolean isLatestVersion;
    String phase;
    String status;
    LocalDate startDate;
    LocalDate endDate;
    String metadata;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<OrganizationStudyDto> organizations;
    List<StudyArmDto> arms;                   // For detailed view
    List<VisitDefinitionDto> visits;          // For detailed view
    DesignProgressDto designProgress;         // For design dashboard
}

DesignProgressDto {
    Map<String, PhaseProgressDto> phases;     // "basic-info", "arms", "visits", "forms", etc.
}

PhaseProgressDto {
    Boolean completed;
    Integer percentage;
    LocalDateTime lastUpdated;
    Boolean valid;
}
```

## 5. Required Services

### 5.1 Core Services
```java
StudyService {
    // Basic CRUD operations
    StudyResponseDto createStudy(StudyCreateRequestDto request);
    StudyResponseDto getStudyById(Long id);
    List<StudyResponseDto> getAllStudies();
    StudyResponseDto updateStudy(Long id, StudyUpdateRequestDto request);
    
    // Organization management
    void updateOrganizationAssociations(Long studyId, List<OrganizationAssignmentDto> organizations);
}

StudyDesignService {
    // Study design workflow operations
    List<StudyArmDto> getStudyArms(Long studyId);
    List<StudyArmDto> saveStudyArms(Long studyId, List<StudyArmRequestDto> arms);
    
    List<VisitDefinitionDto> getVisitSchedule(Long studyId);
    List<VisitDefinitionDto> saveVisitSchedule(Long studyId, List<VisitScheduleRequestDto> visits);
    
    List<FormBindingDto> getFormBindings(Long studyId);
    List<FormBindingDto> saveFormBindings(Long studyId, List<FormBindingRequestDto> bindings);
    
    StudyValidationResultDto validateStudyForPublishing(Long studyId);
    StudyPublishResultDto publishStudy(Long studyId, StudyPublishRequestDto request);
    
    DesignProgressDto getDesignProgress(Long studyId);
    DesignProgressDto updateDesignProgress(Long studyId, DesignProgressDto progress);
}

StudyValidationService {
    void validateStudyCreation(StudyCreateRequestDto request);
    void validateStudyUpdate(StudyEntity existing, StudyUpdateRequestDto request);
    StudyValidationResultDto validateStudyDesignCompleteness(Long studyId);
}
```

## 6. Required Controllers

### 6.1 StudyController
```java
@RestController
@RequestMapping("/api/studies")
public class StudyController {
    
    // Basic CRUD
    @PostMapping
    ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request);
    
    @GetMapping("/{id}")
    ResponseEntity<StudyResponseDto> getStudyById(@PathVariable Long id);
    
    @GetMapping
    ResponseEntity<List<StudyResponseDto>> getAllStudies();
    
    @PutMapping("/{id}")
    ResponseEntity<StudyResponseDto> updateStudy(@PathVariable Long id, @Valid @RequestBody StudyUpdateRequestDto request);
}

@RestController  
@RequestMapping("/api/studies/{studyId}")
public class StudyDesignController {
    
    // Study design workflow endpoints
    @GetMapping("/arms")
    ResponseEntity<List<StudyArmDto>> getStudyArms(@PathVariable Long studyId);
    
    @PutMapping("/arms")
    ResponseEntity<List<StudyArmDto>> saveStudyArms(@PathVariable Long studyId, @RequestBody List<StudyArmRequestDto> arms);
    
    @GetMapping("/visits")
    ResponseEntity<List<VisitDefinitionDto>> getVisitSchedule(@PathVariable Long studyId);
    
    @PutMapping("/visits")
    ResponseEntity<List<VisitDefinitionDto>> saveVisitSchedule(@PathVariable Long studyId, @RequestBody List<VisitScheduleRequestDto> visits);
    
    @GetMapping("/form-bindings")
    ResponseEntity<List<FormBindingDto>> getFormBindings(@PathVariable Long studyId);
    
    @PutMapping("/form-bindings")
    ResponseEntity<List<FormBindingDto>> saveFormBindings(@PathVariable Long studyId, @RequestBody List<FormBindingRequestDto> bindings);
    
    @PostMapping("/validate")
    ResponseEntity<StudyValidationResultDto> validateStudyForPublishing(@PathVariable Long studyId);
    
    @PostMapping("/publish")
    ResponseEntity<StudyPublishResultDto> publishStudy(@PathVariable Long studyId, @RequestBody StudyPublishRequestDto request);
    
    @GetMapping("/design-progress")
    ResponseEntity<DesignProgressDto> getDesignProgress(@PathVariable Long studyId);
    
    @PutMapping("/design-progress")
    ResponseEntity<DesignProgressDto> updateDesignProgress(@PathVariable Long studyId, @RequestBody DesignProgressDto progress);
}
```

## 7. Required Repositories

### 7.1 JPA Repositories
```java
StudyRepository extends JpaRepository<StudyEntity, Long> {
    List<StudyEntity> findByStatusIn(List<StudyStatus> statuses);
    Optional<StudyEntity> findByProtocolNumber(String protocolNumber);
    Optional<StudyEntity> findByIdWithOrganizations(Long id);
}

OrganizationStudyRepository extends JpaRepository<OrganizationStudyEntity, Long> {
    List<OrganizationStudyEntity> findByStudyId(Long studyId);
    void deleteByStudyId(Long studyId);
}

StudyArmRepository extends JpaRepository<StudyArmEntity, Long> {
    List<StudyArmEntity> findByStudyIdOrderByName(Long studyId);
    void deleteByStudyId(Long studyId);
}

VisitDefinitionRepository extends JpaRepository<VisitDefinitionEntity, Long> {
    List<VisitDefinitionEntity> findByStudyIdOrderBySequenceNumber(Long studyId);
    List<VisitDefinitionEntity> findByStudyIdAndArmId(Long studyId, Long armId);
}

FormRepository extends JpaRepository<FormEntity, Long> {
    List<FormEntity> findByStudyId(Long studyId);
    List<FormEntity> findByStudyIdAndStatus(Long studyId, FormStatus status);
}

VisitFormRepository extends JpaRepository<VisitFormEntity, Long> {
    List<VisitFormEntity> findByVisitDefinitionId(Long visitDefinitionId);
    List<VisitFormEntity> findByFormDefinitionId(Long formDefinitionId);
}
```

## 8. Implementation Phases

### Phase 1: Core Study CRUD (Week 1)
- StudyEntity, OrganizationStudyEntity
- StudyCreateRequestDto, StudyResponseDto
- StudyService (basic operations)
- StudyController
- StudyRepository, OrganizationStudyRepository
- Basic validation and exception handling

### Phase 2: Study Design Workflow (Week 2)
- StudyArmEntity, VisitDefinitionEntity, FormEntity, VisitFormEntity
- Study design DTOs and services
- StudyDesignController
- Extended repositories
- Design progress tracking

### Phase 3: Advanced Features (Week 3)
- Study validation framework
- Study publishing workflow
- Study versioning
- Protocol revisions
- Comprehensive testing

## 9. Success Criteria

1. **Frontend Integration**: All existing frontend components work seamlessly
2. **Data Integrity**: All study data persisted correctly with proper relationships
3. **Validation**: Comprehensive validation prevents invalid data entry
4. **Performance**: Fast response times for typical study operations
5. **Scalability**: Architecture supports future enhancements

This specification ensures complete compatibility with the existing 1.1 frontend feature integration while providing a solid foundation for future study design capabilities.
