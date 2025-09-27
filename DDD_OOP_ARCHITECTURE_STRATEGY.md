# Domain-Driven Design & Object-Oriented Architecture Strategy
## ClinPrecision Microservices - Code Organization & Reusability

## 🏗️ **ARCHITECTURAL PHILOSOPHY**

### **1. Domain-Driven Design Principles**

#### **A. Layered Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  Controllers, DTOs, Mappers, Validators, API Documentation     │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│     Command Handlers, Query Handlers, Application Services     │
│           Commands, Queries, Events, Use Cases                 │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                                │
│    Domain Models, Value Objects, Domain Services, Rules       │
│         Domain Events, Specifications, Aggregates             │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                           │
│   JPA Entities, Repositories, External Services, Cache        │
│        Message Brokers, File Systems, Database Access         │
└─────────────────────────────────────────────────────────────────┘
```

#### **B. Bounded Contexts** (Your Current Microservices)
- **User Context**: Authentication, authorization, user lifecycle
- **Admin Context**: System administration, configuration management
- **StudyDesign Context**: Protocol design, form definitions, study structure
- **DataCapture Context**: Data entry, subject management, monitoring
- **CodeList Context**: Centralized lookup values, dropdown management

#### **C. Ubiquitous Language**
- **User**: Person accessing the system
- **Study**: Clinical trial or research project  
- **Site**: Physical location conducting research
- **Protocol**: Study design document and procedures
- **Subject**: Individual participant in a study
- **Form**: Data collection instrument
- **Amendment**: Change to study protocol
- **Code List**: Standardized dropdown/lookup values

---

## 🎯 **CODE ORGANIZATION STRATEGY**

### **1. Common Library Structure** (Enhanced)

```
clinprecision-common-lib/
├── domain/                              # PURE BUSINESS LOGIC
│   ├── model/                          # Domain Models & Value Objects
│   │   ├── user/
│   │   │   ├── UserId.java            # Type-safe ID
│   │   │   ├── EmailAddress.java      # Email validation logic
│   │   │   ├── UserProfile.java       # Rich domain model
│   │   │   ├── UserRole.java          # Role with permissions
│   │   │   ├── PersonalInfo.java      # Name, demographics
│   │   │   ├── ContactInfo.java       # Address, phone
│   │   │   └── SecurityInfo.java      # Password, verification
│   │   ├── study/
│   │   │   ├── StudyId.java
│   │   │   ├── ProtocolNumber.java
│   │   │   ├── StudyMetadata.java
│   │   │   ├── Amendment.java
│   │   │   └── StudyTimeline.java
│   │   ├── site/
│   │   │   ├── SiteId.java
│   │   │   ├── SiteCode.java
│   │   │   ├── ContactInformation.java
│   │   │   └── SiteCapabilities.java
│   │   └── common/
│   │       ├── AuditInfo.java         # Audit trail value object
│   │       ├── Status.java            # Base status types
│   │       ├── Metadata.java          # JSON metadata wrapper
│   │       ├── Money.java             # Currency handling
│   │       ├── DateRange.java         # Date period logic
│   │       └── Specification.java     # Business rules
│   ├── service/                        # Domain Services (Interfaces)
│   │   ├── UserDomainService.java     # Complex user business logic
│   │   ├── StudyDomainService.java    # Study validation rules
│   │   ├── ValidationService.java     # Cross-domain validation
│   │   └── PermissionService.java     # Authorization logic
│   ├── repository/                     # Repository Contracts
│   │   ├── UserDomainRepository.java  # Domain-focused interface
│   │   ├── StudyDomainRepository.java
│   │   └── CodeListDomainRepository.java
│   └── event/                          # Domain Events
│       ├── UserCreatedEvent.java
│       ├── StudyAmendedEvent.java
│       ├── RoleAssignedEvent.java
│       └── DomainEvent.java
├── application/                        # USE CASES & ORCHESTRATION
│   ├── command/                       # Commands (CQRS Write Side)
│   │   ├── user/
│   │   │   ├── CreateUserCommand.java
│   │   │   ├── UpdateUserCommand.java
│   │   │   ├── AssignRoleCommand.java
│   │   │   └── ActivateUserCommand.java
│   │   ├── study/
│   │   │   ├── CreateStudyCommand.java
│   │   │   ├── AmendProtocolCommand.java
│   │   │   └── ActivateStudyCommand.java
│   │   └── BaseCommand.java
│   ├── query/                         # Queries (CQRS Read Side)
│   │   ├── user/
│   │   │   ├── GetUserQuery.java
│   │   │   ├── SearchUsersQuery.java
│   │   │   └── GetUserPermissionsQuery.java
│   │   ├── study/
│   │   │   ├── GetStudyQuery.java
│   │   │   └── SearchStudiesQuery.java
│   │   └── BaseQuery.java
│   ├── handler/                       # Command/Query Handlers
│   │   ├── user/
│   │   │   ├── CreateUserHandler.java
│   │   │   ├── UpdateUserHandler.java
│   │   │   └── UserQueryHandler.java
│   │   ├── study/
│   │   │   ├── CreateStudyHandler.java
│   │   │   └── StudyQueryHandler.java
│   │   └── BaseHandler.java
│   ├── service/                       # Application Services
│   │   ├── UserApplicationService.java
│   │   ├── StudyApplicationService.java
│   │   └── NotificationService.java
│   └── dto/                           # Application-level DTOs
│       ├── command/
│       ├── query/
│       └── result/
├── infrastructure/                     # TECHNICAL CONCERNS
│   ├── persistence/
│   │   ├── entity/                    # JPA Entities (moved from root)
│   │   │   ├── UserEntity.java
│   │   │   ├── StudyEntity.java
│   │   │   └── BaseEntity.java
│   │   ├── repository/                # JPA Repository Implementations
│   │   │   ├── JpaUserRepository.java
│   │   │   └── JpaStudyRepository.java
│   │   └── mapper/                    # Entity ↔ Domain Mappers
│   │       ├── UserEntityMapper.java
│   │       └── StudyEntityMapper.java
│   ├── messaging/                     # Event Publishing
│   │   ├── EventPublisher.java
│   │   ├── MessageBroker.java
│   │   └── EventSerializer.java
│   ├── security/                      # Security Infrastructure
│   │   ├── AuthenticationService.java
│   │   ├── AuthorizationService.java
│   │   └── JwtTokenService.java
│   ├── cache/                         # Caching Infrastructure
│   │   ├── CacheService.java
│   │   ├── CacheConfiguration.java
│   │   └── CacheKeyGenerator.java
│   ├── external/                      # External Service Clients
│   │   ├── EmailService.java
│   │   ├── NotificationService.java
│   │   └── AuditService.java
│   └── config/                        # Infrastructure Configuration
│       ├── DatabaseConfig.java
│       ├── MessagingConfig.java
│       └── SecurityConfig.java
├── presentation/                       # API LAYER
│   ├── dto/                           # API DTOs (existing)
│   │   ├── request/
│   │   ├── response/
│   │   └── UserDto.java
│   ├── mapper/                        # DTO ↔ Command/Query Mappers
│   │   ├── UserDtoMapper.java
│   │   └── StudyDtoMapper.java
│   ├── validator/                     # Input Validation
│   │   ├── UserValidator.java
│   │   ├── StudyValidator.java
│   │   └── BaseValidator.java
│   └── response/                      # Standardized Responses
│       ├── ApiResponse.java
│       ├── ErrorResponse.java
│       ├── PagedResponse.java
│       └── ValidationErrorResponse.java
└── shared/                            # CROSS-CUTTING
    ├── exception/                     # Application Exceptions
    │   ├── DomainException.java
    │   ├── ValidationException.java
    │   ├── BusinessRuleException.java
    │   └── ResourceNotFoundException.java
    ├── util/                          # Utility Classes
    │   ├── DateTimeUtil.java
    │   ├── StringUtil.java
    │   └── JsonUtil.java
    ├── annotation/                    # Custom Annotations
    │   ├── @AuditableAction.java
    │   ├── @ValidateBusinessRules.java
    │   ├── @CacheEvict.java
    │   └── @DomainEvent.java
    └── constant/                      # Application Constants
        ├── ErrorCodes.java
        ├── BusinessConstants.java
        ├── CacheKeys.java
        └── EventTypes.java
```

---

## 🔄 **REUSABILITY PATTERNS**

### **1. Repository Pattern with Domain Focus**

```java
// Domain Repository Interface (in common/domain/repository)
public interface UserDomainRepository {
    UserProfile save(UserProfile userProfile);
    Optional<UserProfile> findById(UserId userId);
    Optional<UserProfile> findByEmail(EmailAddress email);
    List<UserProfile> findByOrganization(Long organizationId);
    boolean existsByEmail(EmailAddress email);
    void delete(UserId userId);
    
    // Business-focused queries
    List<UserProfile> findUsersRequiringPasswordReset();
    List<UserProfile> findInactiveUsers(int days);
    List<UserProfile> findByRoleAndStudy(String roleCode, Long studyId);
}

// Infrastructure Implementation (in microservice)
@Repository
public class JpaUserDomainRepository implements UserDomainRepository {
    
    @Autowired
    private UserJpaRepository jpaRepository;
    
    @Autowired
    private UserEntityMapper entityMapper;
    
    @Override
    public UserProfile save(UserProfile userProfile) {
        UserEntity entity = entityMapper.toEntity(userProfile);
        UserEntity saved = jpaRepository.save(entity);
        return entityMapper.toDomain(saved);
    }
    
    // Implementation delegates to JPA but returns domain objects
}
```

### **2. Command Handler Pattern (Application Layer)**

```java
// Base Handler (in common/application/handler)
@Component
public abstract class BaseCommandHandler<C extends BaseCommand, R> {
    
    protected final EventPublisher eventPublisher;
    protected final ValidationService validationService;
    
    public BaseCommandHandler(EventPublisher eventPublisher, 
                             ValidationService validationService) {
        this.eventPublisher = eventPublisher;
        this.validationService = validationService;
    }
    
    @Transactional
    public R handle(C command) {
        // Template method pattern
        command.validate();
        validateBusinessRules(command);
        
        R result = executeCommand(command);
        
        publishDomainEvents(command, result);
        
        return result;
    }
    
    protected abstract void validateBusinessRules(C command);
    protected abstract R executeCommand(C command);
    protected abstract void publishDomainEvents(C command, R result);
}

// Specific Handler (in microservice)
@Component
public class CreateUserHandler extends BaseCommandHandler<CreateUserCommand, UserDto> {
    
    private final UserDomainRepository userRepository;
    private final UserDomainService userDomainService;
    private final UserDtoMapper dtoMapper;
    
    @Override
    protected void validateBusinessRules(CreateUserCommand command) {
        EmailAddress email = EmailAddress.of(command.getEmail());
        if (userDomainService.isEmailRegistered(email)) {
            throw new BusinessRuleException("Email already registered");
        }
    }
    
    @Override
    protected UserDto executeCommand(CreateUserCommand command) {
        UserProfile userProfile = UserProfile.create(
            command.getFirstName(),
            command.getLastName(), 
            command.getEmail(),
            command.getCreatedBy()
        );
        
        userDomainService.validateUserCreation(userProfile);
        UserProfile saved = userRepository.save(userProfile);
        
        return dtoMapper.toDto(saved);
    }
    
    @Override
    protected void publishDomainEvents(CreateUserCommand command, UserDto result) {
        eventPublisher.publish(new UserCreatedEvent(
            UserId.of(result.getId()),
            EmailAddress.of(result.getEmail())
        ));
    }
}
```

### **3. Value Object Pattern for Business Logic**

```java
// EmailAddress Value Object (reusable across all microservices)
@Embeddable
public class EmailAddress {
    private String value;
    
    // Factory methods with validation
    public static EmailAddress of(String email) { /* validation logic */ }
    
    // Business methods
    public boolean belongsToDomain(String domain) { /* business logic */ }
    public boolean isCorporateEmail() { /* business logic */ }
    public String getDomain() { /* business logic */ }
    
    // Immutable, equals/hashCode based on value
}

// Usage in any microservice:
EmailAddress userEmail = EmailAddress.of("john.doe@example.com");
if (userEmail.isCorporateEmail()) {
    // Business logic
}
```

### **4. Event-Driven Communication**

```java
// Domain Event (in common/domain/event)
@DomainEvent
public class UserCreatedEvent extends BaseDomainEvent {
    private final UserId userId;
    private final EmailAddress email;
    private final Long organizationId;
    
    // Event contains rich domain information
}

// Event Handler (in any microservice that cares about this event)
@EventHandler
public class UserCreatedEventHandler {
    
    public void handle(UserCreatedEvent event) {
        // Each microservice can react differently
        // Admin service: Setup default permissions
        // Study service: Check for existing study assignments  
        // Data capture: Initialize user workspace
    }
}
```

---

## 🚀 **MICROSERVICE-SPECIFIC ORGANIZATION**

### **Each Microservice Structure:**
```
clinprecision-user-service/
├── src/main/java/com/clinprecision/userservice/
│   ├── UserServiceApplication.java
│   ├── domain/                        # Service-specific domain
│   │   ├── service/                   # Domain service implementations
│   │   │   └── UserDomainServiceImpl.java
│   │   └── specification/             # Business rules specific to this service
│   │       └── UserActivationSpecification.java
│   ├── application/                   # Service-specific application layer  
│   │   ├── handler/                   # Command/query handlers
│   │   ├── service/                   # Application services
│   │   └── facade/                    # External API facades
│   ├── infrastructure/               # Service-specific infrastructure
│   │   ├── persistence/
│   │   │   ├── repository/           # JPA implementations
│   │   │   └── entity/               # Service-specific entities
│   │   ├── external/                 # External service clients
│   │   └── config/                   # Service configuration
│   └── presentation/                 # REST controllers
│       ├── controller/
│       ├── dto/                      # Service-specific DTOs
│       └── mapper/                   # DTO mappers
└── src/test/java/                    # Service-specific tests
```

---

## 📊 **CROSS-CUTTING CONCERNS**

### **1. Aspect-Oriented Programming (AOP)**

```java
// Auditing Aspect (in common/shared/aspect)
@Aspect
@Component  
public class AuditAspect {
    
    @Around("@annotation(AuditableAction)")
    public Object auditAction(ProceedingJoinPoint joinPoint, AuditableAction audit) {
        // Automatic audit logging for all annotated methods
        AuditInfo auditInfo = captureAuditInfo();
        try {
            Object result = joinPoint.proceed();
            logSuccess(audit.value(), auditInfo, result);
            return result;
        } catch (Exception e) {
            logFailure(audit.value(), auditInfo, e);
            throw e;
        }
    }
}

// Usage in any service:
@AuditableAction("USER_CREATION")
public UserDto createUser(CreateUserCommand command) {
    // Method automatically audited
}
```

### **2. Caching Strategy**

```java
// Cache Configuration (in common/infrastructure/cache)
@Configuration
@EnableCaching
public class CacheConfiguration {
    
    @Bean
    public CacheManager cacheManager() {
        // Configurable cache manager (Redis, Hazelcast, etc.)
    }
    
    @Bean
    public CacheKeyGenerator businessCacheKeyGenerator() {
        // Custom key generation based on business rules
        return (target, method, params) -> {
            // Generate keys using domain concepts
        };
    }
}

// Usage in services:
@Cacheable(value = "users", keyGenerator = "businessCacheKeyGenerator")
public UserProfile getUserById(UserId userId) {
    // Cached using business-meaningful keys
}
```

### **3. Security Integration**

```java
// Security Service (in common/infrastructure/security)
@Component
public class SecurityContextService {
    
    public UserContext getCurrentUser() {
        // Extract user from security context
        // Return rich domain object, not just ID
    }
    
    public boolean hasPermission(String permission) {
        // Business-rule based permission checking
    }
    
    public boolean canAccessStudy(Long studyId) {
        // Domain-specific authorization
    }
}

// Usage in handlers:
@Override
protected void validateBusinessRules(CreateStudyCommand command) {
    if (!securityContext.hasPermission("CREATE_STUDY")) {
        throw new SecurityException("Insufficient permissions");
    }
}
```

---

## 🎯 **BENEFITS OF THIS ARCHITECTURE**

### **1. High Reusability**
- **Domain models** contain business logic once, used everywhere
- **Value objects** provide type safety and validation across services
- **Application patterns** (commands, queries, handlers) are consistent
- **Infrastructure services** (cache, messaging, security) are shared

### **2. Maintainability**
- **Clear separation** of concerns across layers
- **Business rules** centralized in domain layer
- **Consistent patterns** across all microservices
- **Easy testing** with mocked dependencies

### **3. Flexibility**
- **Technology-agnostic** domain layer
- **Swappable infrastructure** (database, cache, messaging)
- **Independent deployment** of microservices
- **Easy extension** through composition

### **4. Business Alignment**
- **Ubiquitous language** reflected in code
- **Business rules** explicitly modeled
- **Domain events** capture business occurrences
- **Clear boundaries** between contexts

---

## 🏁 **IMPLEMENTATION ROADMAP**

### **Phase 1: Foundation** (Current Admin Service Enhancement)
1. ✅ Move existing entities to infrastructure/persistence
2. ✅ Create domain models and value objects  
3. ✅ Implement command/query patterns
4. ✅ Add domain services

### **Phase 2: Microservice Integration**
1. Implement repository pattern in each service
2. Add event publishing/subscribing
3. Create shared application services
4. Standardize error handling

### **Phase 3: Advanced Features**
1. Add CQRS with separate read/write models
2. Implement event sourcing for critical aggregates
3. Add distributed caching
4. Implement saga pattern for complex workflows

This architecture ensures **maximum code reuse**, **consistent patterns**, and **business rule centralization** while maintaining **microservice independence** and **scalability**. 🚀