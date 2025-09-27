# CodeList Object-Oriented Architecture Design

## Executive Summary

The CodeList system serves as the **central nervous system** for all dropdown values, enums, and reference data across ClinPrecision's microservices architecture. Using object-oriented principles, we can eliminate code duplication and create a reusable, maintainable system.

## Current Problem Analysis

### Code Duplication Issues
1. **Frontend**: Hardcoded arrays in 20+ JavaScript files
2. **Backend**: Java enums duplicated across 8 microservices  
3. **Mismatch**: Frontend sends "INITIAL" but backend enum doesn't accept it
4. **Maintenance**: Adding new values requires changes in multiple places

### Impact Assessment
- **266 Java files** with potential enum dependencies
- **68+ entities** using hardcoded status values
- **40+ controllers** validating against scattered enums
- **Multiple frontend services** with duplicate dropdown logic

## Object-Oriented Architecture Solution

### Core Design Principles

#### 1. Single Responsibility Principle (SRP)
Each class has one reason to change:
- `CodeListEntity`: Represents code list data
- `CodeListService`: Business logic for code operations
- `CodeListRepository`: Data access operations
- `CodeListController`: HTTP request handling

#### 2. Open/Closed Principle (OCP)
System is open for extension, closed for modification:
- New code types added without changing existing code
- Extensible metadata system for new business rules
- Plugin-style validators for different code categories

#### 3. Dependency Inversion Principle (DIP)
High-level modules don't depend on low-level modules:
- Services depend on interfaces, not concrete implementations
- Microservices use CodeList client library, not direct DB access

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  StudyDesign    │   DataCapture   │   User Service   │   ...    │
│    Service      │     Service     │                  │          │
│                 │                 │                  │          │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐   │          │
│  │CodeList   │  │  │CodeList   │  │  │CodeList   │   │          │
│  │Client     │  │  │Client     │  │  │Client     │   │          │
│  └───────────┘  │  └───────────┘  │  └───────────┘   │          │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN MICROSERVICE                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                CodeList Core Engine                     │    │
│  │                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │CodeList     │  │CodeList     │  │CodeList     │     │    │
│  │  │Entity       │  │Service      │  │Controller   │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  │                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │CodeList     │  │CodeList     │  │Validation   │     │    │
│  │  │Repository   │  │Cache        │  │Engine       │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │code_lists   │  │code_lists   │  │code_list    │              │
│  │             │  │_audit       │  │_usage       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Design

### 1. Core Domain Objects

#### CodeListEntity (Rich Domain Model)
```java
@Entity
@Table(name = "code_lists")
public class CodeListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String category;
    
    @Column(nullable = false, length = 100)  
    private String code;
    
    @Column(nullable = false, length = 200)
    private String displayName;
    
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private Boolean systemCode;
    
    @Column(columnDefinition = "JSON")
    private String metadata;
    
    // Audit fields
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Business Methods (Rich Domain Model)
    public boolean canBeModified() {
        return !systemCode;
    }
    
    public boolean isValidForContext(String context) {
        return extractMetadata().getValidContexts().contains(context);
    }
    
    public String getDisplayColor() {
        return extractMetadata().getColor();
    }
    
    public boolean requiresPermission(String permission) {
        return extractMetadata().getRequiredPermissions().contains(permission);
    }
    
    private CodeListMetadata extractMetadata() {
        // Parse JSON metadata into typed object
        return JsonUtils.fromJson(metadata, CodeListMetadata.class);
    }
    
    // Factory Methods
    public static CodeListEntity createSystemCode(String category, String code, 
                                                  String displayName, int sortOrder) {
        CodeListEntity entity = new CodeListEntity();
        entity.category = category;
        entity.code = code;
        entity.displayName = displayName;
        entity.sortOrder = sortOrder;
        entity.isActive = true;
        entity.systemCode = true;
        return entity;
    }
    
    public static CodeListEntity createUserCode(String category, String code, 
                                               String displayName, Long userId) {
        CodeListEntity entity = new CodeListEntity();
        entity.category = category;
        entity.code = code;
        entity.displayName = displayName;
        entity.isActive = true;
        entity.systemCode = false;
        entity.createdBy = userId;
        entity.createdAt = LocalDateTime.now();
        return entity;
    }
}
```

#### CodeListMetadata (Value Object)
```java
public class CodeListMetadata {
    private String color;
    private String icon;
    private List<String> validContexts;
    private List<String> requiredPermissions;
    private Map<String, Object> businessRules;
    
    // Immutable value object with builder pattern
    public static class Builder {
        private String color = "text-gray-700";
        private String icon;
        private List<String> validContexts = new ArrayList<>();
        private List<String> requiredPermissions = new ArrayList<>();
        private Map<String, Object> businessRules = new HashMap<>();
        
        public Builder withColor(String color) {
            this.color = color;
            return this;
        }
        
        public Builder withIcon(String icon) {
            this.icon = icon;
            return this;
        }
        
        public Builder validInContext(String... contexts) {
            this.validContexts.addAll(Arrays.asList(contexts));
            return this;
        }
        
        public Builder requiresPermission(String... permissions) {
            this.requiredPermissions.addAll(Arrays.asList(permissions));
            return this;
        }
        
        public Builder withBusinessRule(String rule, Object value) {
            this.businessRules.put(rule, value);
            return this;
        }
        
        public CodeListMetadata build() {
            return new CodeListMetadata(this);
        }
    }
    
    private CodeListMetadata(Builder builder) {
        this.color = builder.color;
        this.icon = builder.icon;
        this.validContexts = Collections.unmodifiableList(builder.validContexts);
        this.requiredPermissions = Collections.unmodifiableList(builder.requiredPermissions);
        this.businessRules = Collections.unmodifiableMap(builder.businessRules);
    }
    
    // Getters only (immutable)
    public String getColor() { return color; }
    public String getIcon() { return icon; }
    public List<String> getValidContexts() { return validContexts; }
    public List<String> getRequiredPermissions() { return requiredPermissions; }
    public Map<String, Object> getBusinessRules() { return businessRules; }
}
```

### 2. Service Layer Design

#### CodeListService (Business Logic)
```java
@Service
@Transactional
public class CodeListService {
    
    private final CodeListRepository codeListRepository;
    private final CodeListCacheManager cacheManager;
    private final CodeListValidationEngine validationEngine;
    private final CodeListAuditService auditService;
    
    public CodeListService(CodeListRepository codeListRepository,
                          CodeListCacheManager cacheManager,
                          CodeListValidationEngine validationEngine,
                          CodeListAuditService auditService) {
        this.codeListRepository = codeListRepository;
        this.cacheManager = cacheManager;
        this.validationEngine = validationEngine;
        this.auditService = auditService;
    }
    
    // Primary business operations
    @Cacheable(value = "codeLists", key = "#category")
    public List<CodeListResponseDto> getCodeListByCategory(String category) {
        List<CodeListEntity> entities = codeListRepository
            .findByCategoryAndIsActiveOrderBySortOrder(category, true);
        
        return entities.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }
    
    @Cacheable(value = "allCodeLists")
    public Map<String, List<CodeListResponseDto>> getAllCodeLists() {
        List<CodeListEntity> allEntities = codeListRepository
            .findByIsActiveTrueOrderByCategorySortOrder();
        
        return allEntities.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.groupingBy(CodeListResponseDto::getCategory));
    }
    
    @Cacheable(value = "codeListsForContext", key = "#category + '_' + #context")
    public List<CodeListResponseDto> getCodeListForContext(String category, String context) {
        List<CodeListEntity> entities = codeListRepository
            .findByCategoryAndIsActiveOrderBySortOrder(category, true);
        
        return entities.stream()
                .filter(entity -> entity.isValidForContext(context))
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }
    
    // Administrative operations
    public CodeListResponseDto createCodeList(CodeListCreateRequestDto request) {
        // Validation
        validationEngine.validateCreateRequest(request);
        
        // Business rules
        if (isDuplicateCode(request.getCategory(), request.getCode())) {
            throw new DuplicateCodeListException("Code already exists in category");
        }
        
        // Create entity
        CodeListEntity entity = mapToEntity(request);
        entity = codeListRepository.save(entity);
        
        // Audit trail
        auditService.logCreation(entity);
        
        // Cache invalidation
        cacheManager.evictCategory(request.getCategory());
        
        return mapToResponseDto(entity);
    }
    
    public CodeListResponseDto updateCodeList(Long id, CodeListUpdateRequestDto request) {
        CodeListEntity entity = codeListRepository.findById(id)
            .orElseThrow(() -> new CodeListNotFoundException("Code list not found"));
        
        // Business rules
        if (!entity.canBeModified()) {
            throw new SystemCodeModificationException("System codes cannot be modified");
        }
        
        validationEngine.validateUpdateRequest(entity, request);
        
        // Update entity
        CodeListEntity originalEntity = entity.clone(); // For audit
        updateEntityFromRequest(entity, request);
        entity = codeListRepository.save(entity);
        
        // Audit trail
        auditService.logUpdate(originalEntity, entity);
        
        // Cache invalidation
        cacheManager.evictCategory(entity.getCategory());
        
        return mapToResponseDto(entity);
    }
    
    public void deleteCodeList(Long id) {
        CodeListEntity entity = codeListRepository.findById(id)
            .orElseThrow(() -> new CodeListNotFoundException("Code list not found"));
        
        if (!entity.canBeModified()) {
            throw new SystemCodeModificationException("System codes cannot be deleted");
        }
        
        // Check usage before deletion
        if (codeListRepository.isCodeInUse(entity.getCategory(), entity.getCode())) {
            throw new CodeInUseException("Cannot delete code list that is currently in use");
        }
        
        entity.setIsActive(false); // Soft delete
        codeListRepository.save(entity);
        
        // Audit trail
        auditService.logDeletion(entity);
        
        // Cache invalidation
        cacheManager.evictCategory(entity.getCategory());
    }
    
    // Helper methods
    private boolean isDuplicateCode(String category, String code) {
        return codeListRepository.existsByCategoryAndCode(category, code);
    }
    
    private CodeListResponseDto mapToResponseDto(CodeListEntity entity) {
        return CodeListResponseDto.builder()
            .id(entity.getId())
            .category(entity.getCategory())
            .code(entity.getCode())
            .displayName(entity.getDisplayName())
            .description(entity.getDescription())
            .sortOrder(entity.getSortOrder())
            .color(entity.getDisplayColor())
            .icon(entity.extractMetadata().getIcon())
            .isSystemCode(entity.getSystemCode())
            .build();
    }
}
```

### 3. Repository Layer (Data Access)

#### CodeListRepository
```java
@Repository
public interface CodeListRepository extends JpaRepository<CodeListEntity, Long> {
    
    // Basic queries
    List<CodeListEntity> findByCategoryAndIsActiveOrderBySortOrder(String category, Boolean isActive);
    List<CodeListEntity> findByIsActiveTrueOrderByCategorySortOrder();
    
    boolean existsByCategoryAndCode(String category, String code);
    
    // Complex queries with metadata
    @Query("SELECT c FROM CodeListEntity c WHERE c.category = :category AND c.isActive = true " +
           "AND JSON_CONTAINS(c.metadata, JSON_OBJECT('validContexts', JSON_ARRAY(:context))) = 1 " +
           "ORDER BY c.sortOrder")
    List<CodeListEntity> findByCategoryAndValidContext(String category, String context);
    
    // Usage tracking
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM CodeListUsageEntity u " +
           "WHERE u.category = :category AND u.code = :code AND u.isActive = true")
    boolean isCodeInUse(String category, String code);
    
    // Audit queries
    @Query("SELECT c FROM CodeListEntity c WHERE c.systemCode = false AND c.createdBy = :userId")
    List<CodeListEntity> findUserCreatedCodes(Long userId);
    
    @Query("SELECT DISTINCT c.category FROM CodeListEntity c WHERE c.isActive = true ORDER BY c.category")
    List<String> findAllActiveCategories();
}
```

### 4. Client Library for Other Microservices

#### CodeListClient (Feign Client)
```java
@FeignClient(name = "clinprecision-admin-service", path = "/api/code-lists")
public interface CodeListClient {
    
    @GetMapping("/{category}")
    ResponseEntity<List<CodeListResponseDto>> getCodeList(@PathVariable String category);
    
    @GetMapping
    ResponseEntity<Map<String, List<CodeListResponseDto>>> getAllCodeLists();
    
    @GetMapping("/{category}/context/{context}")
    ResponseEntity<List<CodeListResponseDto>> getCodeListForContext(
        @PathVariable String category, @PathVariable String context);
    
    @GetMapping("/validate/{category}/{code}")
    ResponseEntity<Boolean> validateCode(@PathVariable String category, @PathVariable String code);
}
```

#### CodeListClientService (Service in other microservices)
```java
@Service
public class CodeListClientService {
    
    private final CodeListClient codeListClient;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${codelist.cache.ttl:3600}") // 1 hour default
    private long cacheTimeToLive;
    
    public CodeListClientService(CodeListClient codeListClient, 
                                RedisTemplate<String, Object> redisTemplate) {
        this.codeListClient = codeListClient;
        this.redisTemplate = redisTemplate;
    }
    
    public List<CodeListResponseDto> getCodeList(String category) {
        String cacheKey = "codelist:" + category;
        
        // Try cache first
        List<CodeListResponseDto> cached = (List<CodeListResponseDto>) 
            redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            return cached;
        }
        
        // Fetch from admin service
        try {
            ResponseEntity<List<CodeListResponseDto>> response = 
                codeListClient.getCodeList(category);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                List<CodeListResponseDto> codeList = response.getBody();
                
                // Cache the result
                redisTemplate.opsForValue().set(cacheKey, codeList, 
                    Duration.ofSeconds(cacheTimeToLive));
                
                return codeList;
            }
        } catch (FeignException e) {
            // Log error and return empty list or throw exception based on business rules
            log.error("Failed to fetch code list for category: " + category, e);
        }
        
        return Collections.emptyList();
    }
    
    public boolean validateCode(String category, String code) {
        try {
            ResponseEntity<Boolean> response = codeListClient.validateCode(category, code);
            return response.getStatusCode() == HttpStatus.OK && 
                   Boolean.TRUE.equals(response.getBody());
        } catch (FeignException e) {
            log.warn("Code validation failed for {}:{}", category, code, e);
            return false; // Fail safe
        }
    }
    
    public Optional<CodeListResponseDto> findByCode(String category, String code) {
        return getCodeList(category).stream()
            .filter(item -> item.getCode().equals(code))
            .findFirst();
    }
}
```

### 5. Validation Engine

#### CodeListValidationEngine
```java
@Component
public class CodeListValidationEngine {
    
    private final List<CodeListValidator> validators;
    
    public CodeListValidationEngine(List<CodeListValidator> validators) {
        this.validators = validators;
    }
    
    public void validateCreateRequest(CodeListCreateRequestDto request) {
        ValidationContext context = new ValidationContext(ValidationOperation.CREATE, request);
        
        for (CodeListValidator validator : validators) {
            if (validator.supports(context)) {
                ValidationResult result = validator.validate(context);
                if (!result.isValid()) {
                    throw new CodeListValidationException(result.getErrors());
                }
            }
        }
    }
    
    public void validateUpdateRequest(CodeListEntity existing, CodeListUpdateRequestDto request) {
        ValidationContext context = new ValidationContext(ValidationOperation.UPDATE, existing, request);
        
        for (CodeListValidator validator : validators) {
            if (validator.supports(context)) {
                ValidationResult result = validator.validate(context);
                if (!result.isValid()) {
                    throw new CodeListValidationException(result.getErrors());
                }
            }
        }
    }
}
```

#### Specific Validators (Strategy Pattern)
```java
@Component
public class AmendmentTypeValidator implements CodeListValidator {
    
    @Override
    public boolean supports(ValidationContext context) {
        return "AMENDMENT_TYPE".equals(context.getCategory());
    }
    
    @Override
    public ValidationResult validate(ValidationContext context) {
        ValidationResult.Builder result = ValidationResult.builder();
        
        // Business rule: INITIAL amendment type can only be created once
        if ("INITIAL".equals(context.getCode()) && context.getOperation() == ValidationOperation.CREATE) {
            boolean initialExists = codeListRepository
                .existsByCategoryAndCode("AMENDMENT_TYPE", "INITIAL");
            
            if (initialExists) {
                result.addError("Only one INITIAL amendment type is allowed per study");
            }
        }
        
        // Business rule: System amendment types cannot be modified
        if (context.getOperation() == ValidationOperation.UPDATE) {
            CodeListEntity existing = context.getExistingEntity();
            if (existing.getSystemCode() && !context.getRequest().getDisplayName().equals(existing.getDisplayName())) {
                result.addError("System amendment types cannot have their display name changed");
            }
        }
        
        return result.build();
    }
}

@Component  
public class StudyStatusValidator implements CodeListValidator {
    
    @Override
    public boolean supports(ValidationContext context) {
        return "STUDY_STATUS".equals(context.getCategory());
    }
    
    @Override
    public ValidationResult validate(ValidationContext context) {
        ValidationResult.Builder result = ValidationResult.builder();
        
        // Business rule: Cannot delete ACTIVE status if studies are using it
        if (context.getOperation() == ValidationOperation.DELETE) {
            String code = context.getCode();
            if ("ACTIVE".equals(code)) {
                long activeStudiesCount = studyRepository.countByStatus("ACTIVE");
                if (activeStudiesCount > 0) {
                    result.addError("Cannot delete ACTIVE status - " + activeStudiesCount + " studies are currently active");
                }
            }
        }
        
        return result.build();
    }
}
```

## Microservice Integration Strategy

### How Each Microservice Uses CodeLists

#### 1. Study Design Service
```java
@RestController
@RequestMapping("/api/studies")
public class StudyController {
    
    private final StudyService studyService;
    private final CodeListClientService codeListService;
    
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        // Validate study status using code list
        if (!codeListService.validateCode("STUDY_STATUS", request.getStatus())) {
            throw new InvalidStudyStatusException("Invalid study status: " + request.getStatus());
        }
        
        // Validate study phase
        if (!codeListService.validateCode("STUDY_PHASE", request.getPhase())) {
            throw new InvalidStudyPhaseException("Invalid study phase: " + request.getPhase());
        }
        
        StudyResponseDto response = studyService.createStudy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}/amendment-types")
    public ResponseEntity<List<CodeListResponseDto>> getAvailableAmendmentTypes(@PathVariable Long id) {
        // Get amendment types specific to study context
        List<CodeListResponseDto> amendmentTypes = 
            codeListService.getCodeListForContext("AMENDMENT_TYPE", "study-" + id);
        
        return ResponseEntity.ok(amendmentTypes);
    }
}
```

#### 2. User Service  
```java
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final CodeListClientService codeListService;
    
    public UserResponseDto updateUserStatus(Long userId, String newStatus) {
        // Validate status using code list
        if (!codeListService.validateCode("USER_STATUS", newStatus)) {
            throw new InvalidUserStatusException("Invalid user status: " + newStatus);
        }
        
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Get status metadata for business rules
        Optional<CodeListResponseDto> statusInfo = 
            codeListService.findByCode("USER_STATUS", newStatus);
        
        if (statusInfo.isPresent()) {
            // Apply status-specific business rules
            if ("LOCKED".equals(newStatus) && user.isAdmin()) {
                throw new AdminUserLockException("Admin users cannot be locked");
            }
        }
        
        user.setStatus(UserStatus.valueOf(newStatus));
        user = userRepository.save(user);
        
        return mapToResponseDto(user);
    }
}
```

#### 3. Data Capture Service
```java
@Service
public class FormValidationService {
    
    private final CodeListClientService codeListService;
    
    public ValidationResult validateFormData(FormSubmissionDto formData) {
        ValidationResult.Builder result = ValidationResult.builder();
        
        // Validate form status
        if (!codeListService.validateCode("FORM_STATUS", formData.getStatus())) {
            result.addError("Invalid form status: " + formData.getStatus());
        }
        
        // Validate workflow status
        if (!codeListService.validateCode("WORKFLOW_STATUS", formData.getWorkflowStatus())) {
            result.addError("Invalid workflow status: " + formData.getWorkflowStatus());
        }
        
        // Field-specific validations using code lists
        for (FormFieldDto field : formData.getFields()) {
            if (field.getType().equals("select")) {
                String codeListCategory = field.getCodeListCategory();
                if (codeListCategory != null) {
                    if (!codeListService.validateCode(codeListCategory, field.getValue())) {
                        result.addError("Invalid value for field " + field.getName() + ": " + field.getValue());
                    }
                }
            }
        }
        
        return result.build();
    }
}
```

## Frontend Integration Pattern

### Reusable React Components

#### CodeListDropdown Component
```javascript
import React, { useState, useEffect } from 'react';
import { useCodeList } from '../hooks/useCodeList';

const CodeListDropdown = ({ 
    category, 
    value, 
    onChange, 
    context = null,
    placeholder = "Select an option...",
    disabled = false,
    required = false,
    className = ""
}) => {
    const { codeList, loading, error } = useCodeList(category, context);
    
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const selectedItem = codeList.find(item => item.code === selectedValue);
        
        onChange({
            code: selectedValue,
            displayName: selectedItem?.displayName,
            metadata: selectedItem
        });
    };
    
    if (loading) return <div className="animate-pulse bg-gray-200 h-10 rounded"></div>;
    if (error) return <div className="text-red-500">Error loading options</div>;
    
    return (
        <select
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={`form-select ${className}`}
        >
            <option value="">{placeholder}</option>
            {codeList.map((item) => (
                <option key={item.code} value={item.code}>
                    {item.displayName}
                </option>
            ))}
        </select>
    );
};

export default CodeListDropdown;
```

#### useCodeList Hook
```javascript
import { useState, useEffect } from 'react';
import { CodeListService } from '../services/CodeListService';

export const useCodeList = (category, context = null) => {
    const [codeList, setCodeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!category) return;
        
        const fetchCodeList = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let data;
                if (context) {
                    data = await CodeListService.getCodeListForContext(category, context);
                } else {
                    data = await CodeListService.getCodeList(category);
                }
                
                setCodeList(data);
            } catch (err) {
                setError(err);
                console.error(`Error fetching code list for ${category}:`, err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCodeList();
    }, [category, context]);
    
    return { codeList, loading, error };
};

// Bulk loading for multiple code lists
export const useCodeLists = (categories) => {
    const [codeLists, setCodeLists] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!categories || categories.length === 0) return;
        
        const fetchCodeLists = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const promises = categories.map(async (category) => {
                    const data = await CodeListService.getCodeList(category);
                    return [category, data];
                });
                
                const results = await Promise.all(promises);
                const codeListsMap = Object.fromEntries(results);
                
                setCodeLists(codeListsMap);
            } catch (err) {
                setError(err);
                console.error('Error fetching code lists:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCodeLists();
    }, [JSON.stringify(categories)]);
    
    return { codeLists, loading, error };
};
```

## Benefits of This OOP Architecture

### 1. Code Reusability
- **Single CodeListClient**: Used by all 8 microservices
- **Reusable React components**: One dropdown component for all code lists
- **Common validation patterns**: Shared validation engine across services

### 2. Elimination of Duplication
- **No hardcoded enums**: All values come from database
- **No frontend arrays**: All dropdowns use centralized service
- **No duplicate validation**: Business rules centralized in admin service

### 3. Maintainability  
- **Single point of change**: Add new code types without touching multiple services
- **Clear separation of concerns**: Each class has single responsibility
- **Extensible design**: Easy to add new validators, cache strategies, etc.

### 4. Type Safety & Validation
- **Client-side validation**: Frontend validates against same code lists as backend
- **Strong typing**: DTOs and entities provide type safety
- **Business rule enforcement**: Validation engine ensures data integrity

### 5. Performance Optimization
- **Multi-level caching**: Redis cache in client services, Spring cache in admin service
- **Bulk loading**: Frontend can load all code lists at once
- **Context-specific loading**: Only load relevant codes for specific contexts

## Implementation Roadmap

### Phase 1: Foundation (2 weeks)
1. **Database Setup**: Execute code list schema and data scripts
2. **Admin Service**: Complete core CodeListEntity, Service, Controller, Repository
3. **Client Library**: Create CodeListClient Feign interface and basic client service

### Phase 2: Microservice Integration (3 weeks)  
4. **Study Design Service**: Replace hardcoded enums with code list client calls
5. **User Service**: Update user status validation to use code lists
6. **Data Capture Service**: Implement form validation using code lists

### Phase 3: Frontend Integration (2 weeks)
7. **React Components**: Create reusable CodeListDropdown component
8. **Service Integration**: Replace hardcoded arrays in all frontend services
9. **Context-Specific Loading**: Implement smart loading based on user context

### Phase 4: Advanced Features (1 week)
10. **Caching Strategy**: Implement Redis caching across all services
11. **Validation Engine**: Complete business rule validation system
12. **Admin Interface**: Build UI for managing code lists

## Conclusion

This object-oriented architecture eliminates code duplication across your 266 Java files by centralizing all dropdown values and reference data in a single, well-designed system. Each microservice becomes a consumer of the CodeList service rather than maintaining its own hardcoded values, resulting in a more maintainable, flexible, and scalable architecture.

The design follows SOLID principles, provides strong type safety, and enables easy extension for new business requirements while maintaining backward compatibility during the transition period.