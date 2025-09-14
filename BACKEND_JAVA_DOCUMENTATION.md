# ClinPrecision Backend Java Architecture Documentation

## Overview
ClinPrecision backend is a microservices-based clinical trial management system built with Spring Boot, implementing a distributed architecture for scalability, maintainability, and service isolation.

## Technology Stack

### Core Framework
- **Spring Boot**: Latest version with auto-configuration
- **Spring Cloud**: Microservices ecosystem with service discovery
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Data access layer
- **Hibernate**: ORM framework

### Infrastructure
- **Netflix Eureka**: Service discovery and registration
- **OpenFeign**: Service-to-service communication
- **MySQL**: Primary relational database
- **Maven**: Build and dependency management

### Additional Libraries
- **Jackson**: JSON serialization/deserialization
- **Lombok**: Code generation and boilerplate reduction
- **Bean Validation (JSR-303)**: Input validation
- **Spring Boot Actuator**: Application monitoring

## Microservices Architecture

### Service Overview

```
ClinPrecision Backend
├── clinprecision-config-service        # Configuration management
├── clinprecision-discovery-service     # Service registry (Eureka)
├── clinprecision-apigateway-service    # API Gateway and routing
├── clinprecision-user-service          # User authentication & authorization
├── clinprecision-admin-service         # Administrative operations
├── clinprecision-studydesign-service   # Study design and form management
├── clinprecision-datacapture-service   # Data entry and capture
└── clinprecision-common-lib            # Shared entities and utilities
```

### 1. Configuration Service (`clinprecision-config-service`)
**Purpose**: Centralized configuration management for all microservices

**Key Components**:
- Spring Cloud Config Server
- Environment-specific configurations
- Dynamic configuration updates

**Configuration**:
```java
@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
public class ConfigServiceApplication {
    // Configuration server implementation
}
```

### 2. Discovery Service (`clinprecision-discovery-service`)
**Purpose**: Service registry and discovery using Netflix Eureka

**Key Features**:
- Service registration and health checking
- Load balancing and service resolution
- Failover and redundancy

**Configuration**:
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication {
    // Eureka server configuration
}
```

### 3. API Gateway Service (`clinprecision-apigateway-service`)
**Purpose**: Single entry point for all client requests with routing and cross-cutting concerns

**Responsibilities**:
- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting and throttling
- CORS handling
- Request/response logging

### 4. User Service (`clinprecision-user-service`)
**Purpose**: User authentication, authorization, and user lifecycle management

**Key Components**:

**Entities**:
- `UserEntity` - Core user information
- `RoleEntity` - User roles and permissions
- `AuthorityEntity` - Granular permissions

**Repositories**:
```java
public interface UsersRepository extends CrudRepository<UserEntity, Long> {
    UserEntity findByEmail(String email);
    UserEntity findByUserId(String userId);
}

public interface AuthorityRepository extends CrudRepository<AuthorityEntity, Long> {
    AuthorityEntity findByName(String name);
}
```

**Security Configuration**:
- BCrypt password encoding
- JWT token-based authentication
- Role-based access control (RBAC)

**Initial Setup**:
```java
@Component
public class InitialUsersSetup {
    @EventListener
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Creates default roles and authorities
        // Sets up system administrator accounts
        // Defines permission matrix
    }
}
```

### 5. Admin Service (`clinprecision-admin-service`)
**Purpose**: Administrative operations for users, organizations, and system management

**Domain Models**:

**Organization Management**:
```java
@Entity
@Table(name = "organizations")
public class OrganizationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String externalId;
    private OrganizationStatus status;
    // Address and contact information
    // Audit fields
}
```

**Service Layer**:
```java
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Override
    public List<OrganizationEntity> getAllOrganizations() {
        return organizationRepository.findAll();
    }
    
    @Override
    @Transactional
    public OrganizationEntity createOrganization(OrganizationEntity organization) {
        // Business logic for organization creation
        return organizationRepository.save(organization);
    }
}
```

**REST Controllers**:
```java
@RestController
@RequestMapping("/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;
    
    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        List<OrganizationEntity> organizations = organizationService.getAllOrganizations();
        List<OrganizationDto> organizationDtos = organizations.stream()
            .map(organizationMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(organizationDtos);
    }
}
```

**Key Features**:
- User type management and classification
- Organization hierarchy and contact management
- Site management and principal investigator assignments
- User qualification and certification tracking
- Role-based delegation systems

### 6. Study Design Service (`clinprecision-studydesign-service`)
**Purpose**: Clinical study design, protocol management, and form definition

**Core Entities**:

**Study Management**:
```java
@Entity
@Table(name = "studies")
public class StudyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String protocolNumber;
    private String sponsor;
    private String phase;
    private StudyStatus status;
    
    @ManyToOne
    @JoinColumn(name = "study_status_id")
    private StudyStatusEntity studyStatus;
    
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL)
    private List<FormDefinitionEntity> forms;
    
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL)
    private List<VisitDefinitionEntity> visits;
}
```

**Form Management**:
```java
@Entity
@Table(name = "form_definitions")
public class FormDefinitionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "study_id")
    private StudyEntity study;
    
    private String name;
    private String version;
    private FormStatus status;
    
    @Column(columnDefinition = "JSON")
    private String fields; // JSON structure for form fields
    
    private Boolean isLocked;
    private Boolean isLatestVersion;
}
```

**Service Layer Architecture**:
```java
@Service
@Transactional
public class StudyServiceImpl implements StudyService {
    private final StudyRepository studyRepository;
    private final FormRepository formRepository;
    
    public StudyDto createStudy(StudyCreateRequest request) {
        StudyEntity study = new StudyEntity();
        // Map request to entity
        // Set default values
        // Save and return DTO
        return studyMapper.toDto(studyRepository.save(study));
    }
}
```

**Key Features**:
- Study lifecycle management with status tracking
- Multi-organization study support
- Form definition with JSON-based field structures
- Visit schedule and form binding
- Study versioning and amendment tracking
- Template-based form creation

### 7. Data Capture Service (`clinprecision-datacapture-service`)
**Purpose**: Clinical data entry, subject management, and data quality operations

**Expected Components** (Based on schema analysis):
- Subject enrollment and lifecycle management
- Visit scheduling and execution
- Form data entry and validation
- Query management and resolution
- Data verification and source data verification (SDV)

### 8. Common Library (`clinprecision-common-lib`)
**Purpose**: Shared entities, DTOs, and utilities across all microservices

**Shared Entities**:
```java
// User-related entities
@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String email;
    private String userId;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private OrganizationEntity organization;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles")
    private Set<RoleEntity> roles;
}

// Organization entities
@Entity
@Table(name = "organizations")
public class OrganizationEntity {
    // Shared across admin and study design services
}

// Site entities
@Entity
@Table(name = "sites")  
public class SiteEntity {
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private OrganizationEntity organization;
    
    @ManyToOne
    @JoinColumn(name = "principal_investigator_id")
    private UserEntity principalInvestigator;
}
```

## Data Access Layer

### Repository Pattern
All data access follows Spring Data JPA repository pattern:

```java
@Repository
public interface StudyRepository extends JpaRepository<StudyEntity, Long> {
    List<StudyEntity> findByStatus(StudyStatus status);
    List<StudyEntity> findBySponsorContainingIgnoreCase(String sponsor);
    
    @Query("SELECT s FROM StudyEntity s WHERE s.createdBy = ?1")
    List<StudyEntity> findStudiesByCreator(Long userId);
}
```

### Transaction Management
- `@Transactional` at service layer for data consistency
- Read-only transactions for query operations
- Propagation and isolation level management

### Audit Trail
Comprehensive audit logging for:
- Entity changes with before/after values
- User actions and timestamps  
- Data integrity and compliance tracking

## Service Communication

### Inter-Service Communication
```java
@FeignClient(name = "admin-service")
public interface AdminServiceClient {
    @GetMapping("/users/{userId}")
    UserDto getUserById(@PathVariable Long userId);
    
    @GetMapping("/organizations/{orgId}")
    OrganizationDto getOrganizationById(@PathVariable Long orgId);
}
```

### Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            "RESOURCE_NOT_FOUND", 
            ex.getMessage(),
            System.currentTimeMillis()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

## Security Architecture

### Authentication Flow
1. Client authenticates with User Service
2. JWT token issued with user roles and permissions
3. API Gateway validates tokens on subsequent requests
4. Service-to-service communication uses service tokens

### Authorization Model
```java
// Role-based security
@PreAuthorize("hasRole('STUDY_MANAGER')")
public StudyDto createStudy(StudyCreateRequest request) {
    // Study creation logic
}

// Method-level security
@PreAuthorize("hasAuthority('CREATE_FORM') and @studySecurityService.canAccessStudy(#studyId)")
public FormDto createForm(Long studyId, FormCreateRequest request) {
    // Form creation logic
}
```

### Permission Matrix
```java
// Authority definitions in InitialUsersSetup
AuthorityEntity createStudyAuthority = createAuthority("CREATE_STUDY");
AuthorityEntity readFormAuthority = createAuthority("READ_FORM");
AuthorityEntity enterDataAuthority = createAuthority("ENTER_DATA");
AuthorityEntity reviewDataAuthority = createAuthority("REVIEW_DATA");
AuthorityEntity signDataAuthority = createAuthority("SIGN_DATA");
```

## Configuration Management

### Application Properties
```yaml
# Common configuration
spring:
  application:
    name: studydesign-service
  cloud:
    config:
      uri: http://config-service:8888
  datasource:
    url: jdbc:mysql://localhost:3306/clinprecisiondb
    username: ${DB_USERNAME:clinprecadmin}
    password: ${DB_PASSWORD:passw0rd}

eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka
```

### Environment-Specific Configuration
- Development, testing, and production profiles
- Database connection configurations
- Service discovery endpoints
- Security configurations

## Data Transfer Objects (DTOs)

### Standardized Response Format
```java
public class StudyDto {
    private Long id;
    private String name;
    private String protocolNumber;
    private String sponsor;
    private String phase;
    private StudyStatus status;
    private List<OrganizationDto> organizations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

public class FormDto {
    private Long id;
    private String name;
    private String description;
    private String version;
    private FormStatus status;
    private List<FieldDto> fields;
    private Boolean isLocked;
}
```

### Mapping Strategy
```java
@Mapper(componentModel = "spring")
public interface StudyMapper {
    StudyDto toDto(StudyEntity entity);
    StudyEntity toEntity(StudyDto dto);
    
    @Mapping(target = "organizations", source = "organizationStudies")
    StudyDto toDtoWithOrganizations(StudyEntity entity);
}
```

## Validation and Error Handling

### Input Validation
```java
public class StudyCreateRequest {
    @NotBlank(message = "Study name is required")
    @Size(max = 255, message = "Study name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Protocol number is required")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Protocol number format invalid")
    private String protocolNumber;
    
    @Valid
    @NotEmpty(message = "At least one organization is required")
    private List<OrganizationAssignmentDto> organizations;
}
```

### Exception Hierarchy
```java
public class ClinPrecisionException extends RuntimeException {
    private final String errorCode;
    private final Object[] args;
}

public class ResourceNotFoundException extends ClinPrecisionException {
    public ResourceNotFoundException(String resource, Object id) {
        super("Resource not found: " + resource + " with id: " + id);
    }
}
```

## Monitoring and Observability

### Health Checks
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check database connectivity
        // Check external service availability
        // Return health status
    }
}
```

### Metrics and Logging
- Spring Boot Actuator endpoints
- Application-specific metrics
- Structured logging with correlation IDs
- Performance monitoring

## Database Integration

### Connection Management
- HikariCP connection pooling
- Connection leak detection
- Read/write split capabilities
- Connection retry logic

### Migration Strategy
- Flyway or Liquibase for schema migrations
- Version-controlled database changes
- Rollback capabilities
- Environment-specific migrations

## Performance Optimization

### Caching Strategy
```java
@Cacheable(value = "studies", key = "#id")
public StudyDto getStudyById(Long id) {
    return studyMapper.toDto(studyRepository.findById(id).orElse(null));
}

@CacheEvict(value = "studies", key = "#studyId")
public StudyDto updateStudy(Long studyId, StudyUpdateRequest request) {
    // Update logic
}
```

### Query Optimization
- JPA query optimization
- N+1 query prevention with `@EntityGraph`
- Custom queries for complex operations
- Database indexing strategy

## Development and Deployment

### Build Configuration
```xml
<!-- Maven configuration for microservice -->
<packaging>jar</packaging>
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

### Docker Support
```dockerfile
FROM openjdk:17-jre-slim
COPY target/studydesign-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Future Enhancements

### Planned Features
1. Event-driven architecture with Apache Kafka
2. CQRS pattern for read/write separation
3. GraphQL API endpoints
4. Distributed tracing with Zipkin/Jaeger
5. Circuit breaker pattern with Resilience4j
6. API versioning strategy
7. Multi-tenancy support
8. Advanced caching with Redis

### Technical Improvements
1. Kubernetes deployment with Helm charts
2. Advanced monitoring with Prometheus/Grafana
3. Automated testing with TestContainers
4. Security scanning and vulnerability management
5. Performance testing and optimization
6. Documentation with OpenAPI/Swagger

This backend architecture provides a robust, scalable foundation for clinical trial management with modern Spring Boot microservices patterns, comprehensive security, and enterprise-grade features.