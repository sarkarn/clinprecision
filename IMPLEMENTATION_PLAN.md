# Study-Design Service Implementation Plan

## Phase 1: Core Study CRUD Implementation

### 1. Entity Layer

#### 1.1 StudyEntity.java
```java
@Entity
@Table(name = "studies")
public class StudyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "sponsor", length = 255)
    private String sponsor;
    
    @Column(name = "protocol_number", length = 100)
    private String protocolNumber;
    
    @Column(name = "version", length = 20)
    private String version = "1.0";
    
    @Column(name = "is_latest_version")
    private Boolean isLatestVersion = true;
    
    @Column(name = "parent_version_id")
    private String parentVersionId;
    
    @Column(name = "version_notes", columnDefinition = "TEXT")
    private String versionNotes;
    
    @Column(name = "is_locked")
    private Boolean isLocked = false;
    
    @Column(name = "phase", length = 20)
    private String phase;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StudyStatus status = StudyStatus.DRAFT;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date") 
    private LocalDate endDate;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One-to-many relationships
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrganizationStudyEntity> organizationStudies = new ArrayList<>();
    
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudyArmEntity> studyArms = new ArrayList<>();
    
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VisitDefinitionEntity> visitDefinitions = new ArrayList<>();
    
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FormEntity> forms = new ArrayList<>();
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum StudyStatus {
    DRAFT, ACTIVE, COMPLETED, TERMINATED
}
```

#### 1.2 OrganizationStudyEntity.java
```java
@Entity
@Table(name = "organization_studies")
public class OrganizationStudyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private StudyEntity study;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private OrganizationRole role;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at") 
    private LocalDateTime updatedAt;
}

enum OrganizationRole {
    SPONSOR, CRO, SITE, VENDOR, LABORATORY
}
```

### 2. DTO Layer

#### 2.1 StudyCreateRequestDto.java
```java
public class StudyCreateRequestDto {
    @NotBlank(message = "Study name is required")
    @Size(min = 3, max = 255, message = "Study name must be between 3 and 255 characters")
    private String name;
    
    @Size(max = 100, message = "Protocol number cannot exceed 100 characters")
    private String protocolNumber;
    
    @NotBlank(message = "Phase is required")
    private String phase;
    
    @Size(max = 255, message = "Sponsor name cannot exceed 255 characters")
    private String sponsor;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Pattern(regexp = "draft|active|completed|terminated", message = "Invalid status")
    private String status = "draft";
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @Valid
    private List<OrganizationAssignmentDto> organizations = new ArrayList<>();
    
    private String metadata;
    
    // Getters and setters
}
```

#### 2.2 OrganizationAssignmentDto.java
```java
public class OrganizationAssignmentDto {
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    @NotBlank(message = "Organization role is required")
    @Pattern(regexp = "sponsor|cro|site|vendor|laboratory", message = "Invalid organization role")
    private String role;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    // Getters and setters
}
```

#### 2.3 StudyResponseDto.java
```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyResponseDto {
    private Long id;
    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String version;
    private Boolean isLatestVersion;
    private String parentVersionId;
    private String versionNotes;
    private Boolean isLocked;
    private String phase;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String metadata;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrganizationStudyDto> organizations;
    private List<StudyArmDto> arms;
    private DesignProgressDto designProgress;
    
    // Getters and setters
}
```

### 3. Repository Layer

#### 3.1 StudyRepository.java
```java
@Repository
public interface StudyRepository extends JpaRepository<StudyEntity, Long> {
    
    @Query("SELECT s FROM StudyEntity s WHERE s.status IN :statuses ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByStatusIn(@Param("statuses") List<StudyStatus> statuses);
    
    @Query("SELECT s FROM StudyEntity s WHERE s.createdBy = :userId AND s.status = :status ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByCreatedByAndStatus(@Param("userId") Long userId, @Param("status") StudyStatus status);
    
    @Query("SELECT s FROM StudyEntity s WHERE s.protocolNumber = :protocolNumber")
    Optional<StudyEntity> findByProtocolNumber(@Param("protocolNumber") String protocolNumber);
    
    @Query("SELECT COUNT(s) FROM StudyEntity s WHERE s.protocolNumber = :protocolNumber AND s.id != :excludeId")
    Long countByProtocolNumberExcludingId(@Param("protocolNumber") String protocolNumber, @Param("excludeId") Long excludeId);
    
    @Query("SELECT s FROM StudyEntity s LEFT JOIN FETCH s.organizationStudies os WHERE s.id = :id")
    Optional<StudyEntity> findByIdWithOrganizations(@Param("id") Long id);
    
    @Query("SELECT s FROM StudyEntity s LEFT JOIN FETCH s.studyArms LEFT JOIN FETCH s.visitDefinitions WHERE s.id = :id")
    Optional<StudyEntity> findByIdWithDesignElements(@Param("id") Long id);
}
```

#### 3.2 OrganizationStudyRepository.java
```java
@Repository
public interface OrganizationStudyRepository extends JpaRepository<OrganizationStudyEntity, Long> {
    
    List<OrganizationStudyEntity> findByStudyId(Long studyId);
    
    Optional<OrganizationStudyEntity> findByStudyIdAndOrganizationIdAndRole(Long studyId, Long organizationId, OrganizationRole role);
    
    @Modifying
    @Query("DELETE FROM OrganizationStudyEntity os WHERE os.study.id = :studyId")
    void deleteByStudyId(@Param("studyId") Long studyId);
}
```

### 4. Service Layer

#### 4.1 StudyService.java
```java
@Service
@Transactional
public class StudyService {
    
    private final StudyRepository studyRepository;
    private final OrganizationStudyRepository organizationStudyRepository;
    private final StudyMapper studyMapper;
    private final StudyValidationService validationService;
    
    public StudyService(StudyRepository studyRepository, 
                       OrganizationStudyRepository organizationStudyRepository,
                       StudyMapper studyMapper,
                       StudyValidationService validationService) {
        this.studyRepository = studyRepository;
        this.organizationStudyRepository = organizationStudyRepository;
        this.studyMapper = studyMapper;
        this.validationService = validationService;
    }
    
    public StudyResponseDto createStudy(StudyCreateRequestDto request) {
        // 1. Validate request
        validationService.validateStudyCreation(request);
        
        // 2. Map to entity
        StudyEntity study = studyMapper.toEntity(request);
        
        // 3. Set default values
        study.setCreatedBy(getCurrentUserId()); // From security context
        
        // 4. Save study
        StudyEntity savedStudy = studyRepository.save(study);
        
        // 5. Handle organization associations
        if (request.getOrganizations() != null && !request.getOrganizations().isEmpty()) {
            saveOrganizationAssociations(savedStudy, request.getOrganizations());
        }
        
        // 6. Return response
        return studyMapper.toResponseDto(savedStudy);
    }
    
    @Transactional(readOnly = true)
    public StudyResponseDto getStudyById(Long id) {
        StudyEntity study = studyRepository.findByIdWithOrganizations(id)
            .orElseThrow(() -> new StudyNotFoundException("Study not found with ID: " + id));
        
        return studyMapper.toResponseDto(study);
    }
    
    @Transactional(readOnly = true)
    public List<StudyResponseDto> getAllStudies() {
        List<StudyEntity> studies = studyRepository.findAll();
        return studyMapper.toResponseDtoList(studies);
    }
    
    public StudyResponseDto updateStudy(Long id, StudyUpdateRequestDto request) {
        // 1. Find existing study
        StudyEntity existingStudy = studyRepository.findById(id)
            .orElseThrow(() -> new StudyNotFoundException("Study not found with ID: " + id));
        
        // 2. Validate update
        validationService.validateStudyUpdate(existingStudy, request);
        
        // 3. Update fields
        studyMapper.updateEntityFromDto(request, existingStudy);
        
        // 4. Save
        StudyEntity updatedStudy = studyRepository.save(existingStudy);
        
        // 5. Update organization associations if provided
        if (request.getOrganizations() != null) {
            updateOrganizationAssociations(updatedStudy, request.getOrganizations());
        }
        
        return studyMapper.toResponseDto(updatedStudy);
    }
    
    private void saveOrganizationAssociations(StudyEntity study, List<OrganizationAssignmentDto> organizations) {
        for (OrganizationAssignmentDto orgDto : organizations) {
            OrganizationStudyEntity orgStudy = new OrganizationStudyEntity();
            orgStudy.setStudy(study);
            orgStudy.setOrganizationId(orgDto.getOrganizationId());
            orgStudy.setRole(OrganizationRole.valueOf(orgDto.getRole().toUpperCase()));
            orgStudy.setStartDate(orgDto.getStartDate());
            orgStudy.setEndDate(orgDto.getEndDate());
            orgStudy.setCreatedAt(LocalDateTime.now());
            orgStudy.setUpdatedAt(LocalDateTime.now());
            
            organizationStudyRepository.save(orgStudy);
        }
    }
    
    private void updateOrganizationAssociations(StudyEntity study, List<OrganizationAssignmentDto> organizations) {
        // Remove existing associations
        organizationStudyRepository.deleteByStudyId(study.getId());
        
        // Add new associations
        saveOrganizationAssociations(study, organizations);
    }
    
    private Long getCurrentUserId() {
        // TODO: Get from Spring Security context
        return 1L; // Temporary hardcoded value
    }
}
```

#### 4.2 StudyValidationService.java
```java
@Service
public class StudyValidationService {
    
    private final StudyRepository studyRepository;
    
    public StudyValidationService(StudyRepository studyRepository) {
        this.studyRepository = studyRepository;
    }
    
    public void validateStudyCreation(StudyCreateRequestDto request) {
        // 1. Check protocol number uniqueness
        if (request.getProtocolNumber() != null && !request.getProtocolNumber().isEmpty()) {
            Optional<StudyEntity> existing = studyRepository.findByProtocolNumber(request.getProtocolNumber());
            if (existing.isPresent()) {
                throw new StudyValidationException("Protocol number already exists: " + request.getProtocolNumber());
            }
        }
        
        // 2. Validate date ranges
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new StudyValidationException("End date cannot be before start date");
            }
        }
        
        // 3. Validate organization assignments
        validateOrganizationAssignments(request.getOrganizations());
    }
    
    public void validateStudyUpdate(StudyEntity existingStudy, StudyUpdateRequestDto request) {
        // 1. Check protocol number uniqueness (excluding current study)
        if (request.getProtocolNumber() != null && !request.getProtocolNumber().isEmpty()) {
            Long count = studyRepository.countByProtocolNumberExcludingId(request.getProtocolNumber(), existingStudy.getId());
            if (count > 0) {
                throw new StudyValidationException("Protocol number already exists: " + request.getProtocolNumber());
            }
        }
        
        // 2. Validate date ranges
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existingStudy.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existingStudy.getEndDate();
        
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new StudyValidationException("End date cannot be before start date");
        }
        
        // 3. Check if study is locked
        if (existingStudy.getIsLocked()) {
            throw new StudyValidationException("Cannot update locked study");
        }
    }
    
    private void validateOrganizationAssignments(List<OrganizationAssignmentDto> organizations) {
        if (organizations == null || organizations.isEmpty()) {
            return;
        }
        
        // Check for duplicate organization-role combinations
        Set<String> orgRoleCombinations = new HashSet<>();
        for (OrganizationAssignmentDto org : organizations) {
            String combination = org.getOrganizationId() + "-" + org.getRole();
            if (orgRoleCombinations.contains(combination)) {
                throw new StudyValidationException("Duplicate organization-role combination: " + combination);
            }
            orgRoleCombinations.add(combination);
        }
    }
}
```

### 5. Controller Layer

#### 5.1 StudyController.java
```java
@RestController
@RequestMapping("/api/studies")
@CrossOrigin(origins = "*")
@Validated
public class StudyController {
    
    private final StudyService studyService;
    
    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }
    
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        StudyResponseDto response = studyService.createStudy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StudyResponseDto> getStudyById(@PathVariable Long id) {
        StudyResponseDto response = studyService.getStudyById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<StudyResponseDto>> getAllStudies() {
        List<StudyResponseDto> response = studyService.getAllStudies();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StudyResponseDto> updateStudy(@PathVariable Long id, 
                                                       @Valid @RequestBody StudyUpdateRequestDto request) {
        StudyResponseDto response = studyService.updateStudy(id, request);
        return ResponseEntity.ok(response);
    }
}
```

### 6. Exception Handling

#### 6.1 Custom Exceptions
```java
public class StudyNotFoundException extends RuntimeException {
    public StudyNotFoundException(String message) {
        super(message);
    }
}

public class StudyValidationException extends RuntimeException {
    public StudyValidationException(String message) {
        super(message);
    }
}
```

#### 6.2 Global Exception Handler
```java
@ControllerAdvice
public class StudyControllerExceptionHandler {
    
    @ExceptionHandler(StudyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudyNotFound(StudyNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(StudyValidationException.class)
    public ResponseEntity<ErrorResponse> handleStudyValidation(StudyValidationException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_VALIDATION_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        StringBuilder message = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            message.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ")
        );
        
        ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", message.toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

@Data
class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
    
    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
```

### 7. Mapper Layer

#### 7.1 StudyMapper.java (Using MapStruct)
```java
@Mapper(componentModel = "spring", uses = {OrganizationStudyMapper.class})
public interface StudyMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "organizationStudies", ignore = true)
    @Mapping(target = "studyArms", ignore = true)
    @Mapping(target = "visitDefinitions", ignore = true)
    @Mapping(target = "forms", ignore = true)
    StudyEntity toEntity(StudyCreateRequestDto dto);
    
    @Mapping(target = "organizations", source = "organizationStudies")
    StudyResponseDto toResponseDto(StudyEntity entity);
    
    List<StudyResponseDto> toResponseDtoList(List<StudyEntity> entities);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntityFromDto(StudyUpdateRequestDto dto, @MappingTarget StudyEntity entity);
}
```

This implementation plan provides the complete Phase 1 foundation for the study-design service backend, ensuring full compatibility with the 1.1 frontend integration requirements.
