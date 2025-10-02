# ClinPrecision Backend - Microservices Architecture

## Overview
ClinPrecision Backend is a Spring Boot microservices-based clinical trial management system implementing a distributed architecture for scalability, maintainability, and service isolation. The system follows cloud-native patterns with service discovery, configuration management, and API gateway routing.

## Technology Stack

### Core Framework
- **Spring Boot**: Latest version with auto-configuration
- **Spring Cloud**: Microservices ecosystem with service discovery
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Data access layer with Hibernate ORM
- **Spring Cloud Gateway**: API Gateway and routing

### Infrastructure Components
- **Netflix Eureka**: Service discovery and registration
- **OpenFeign**: Declarative REST client for service-to-service communication
- **Spring Cloud Config**: Centralized configuration management
- **MySQL**: Primary relational database

### Build & Development Tools
- **Maven**: Build and dependency management
- **Java 17**: LTS Java version
- **Docker**: Containerization support
- **Lombok**: Code generation and boilerplate reduction

### Additional Libraries
- **Jackson**: JSON serialization/deserialization
- **Bean Validation (JSR-303)**: Input validation
- **Spring Boot Actuator**: Application monitoring and health checks
- **BCrypt**: Password encoding

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
- Git-based configuration repository

**Main Class**: 
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigserverApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigserverApplication.class, args);
    }
}
```

**Port**: 8888 (default)
**Dependencies**: Spring Cloud Config Server

### 2. Discovery Service (`clinprecision-discovery-service`)
**Purpose**: Service registry and discovery using Netflix Eureka

**Key Features**:
- Service registration and health checking
- Load balancing and service resolution
- Failover and redundancy
- Service instance monitoring

**Main Class**:
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryApplication.class, args);
    }
}
```

**Port**: 8761 (default)
**Dependencies**: Spring Cloud Netflix Eureka Server

### 3. API Gateway Service (`clinprecision-apigateway-service`)
**Purpose**: Single entry point for all client requests with routing and cross-cutting concerns

**Responsibilities**:
- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting and throttling
- CORS handling
- Request/response logging

**Key Components**:
- `GatewayRoutesConfig.java`: Route configuration
- `CorsConfig.java`: Cross-origin resource sharing setup
- `SecurityConfig.java`: Gateway security configuration

**Main Class**:
```java
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

**Port**: 8080 (default)
**Routes**:
- `/api/users/**` → User Service
- `/api/admin/**` → Admin Service
- `/api/studies/**` → Study Design Service
- `/api/datacapture/**` → Data Capture Service

### 4. User Service (`clinprecision-user-service`)
**Purpose**: User authentication, authorization, and user lifecycle management

**Key Components**:

**Entities**:
- `UserEntity`: Core user information with profile details
- `RoleEntity`: User roles and permissions
- `AuthorityEntity`: Granular permissions and access rights

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
- Profile-based configuration

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

**Main Class**:
```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {"com.clinprecision.userservice", "com.clinprecision.common"})
@EntityScan(basePackages = {"com.clinprecision.userservice", "com.clinprecision.common.entity"})
@EnableJpaRepositories(basePackages = {"com.clinprecision.userservice.repository", "com.clinprecision.common.repository"})
public class UsersApplication {
    // Configuration beans and profiles
}
```

**Port**: 8081

### 5. Admin Service (`clinprecision-admin-service`)
**Purpose**: Administrative operations and system management

**Key Features**:
- Form template management
- System configuration
- User management interfaces
- Organization administration

**Key Components**:
- `FormTemplateController`: REST endpoints for form template operations
- `FormTemplateService`: Business logic for template management
- Security integration with User Service

**Main Class**:
```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {"com.clinprecision.adminservice", "com.clinprecision.common"})
@EntityScan(basePackages = {"com.clinprecision.adminservice.data.entity", "com.clinprecision.common.entity"})
@EnableJpaRepositories(basePackages = {"com.clinprecision.adminservice.repository", "com.clinprecision.common.repository"})
public class AdminApplication {
    // BCrypt password encoder bean
}
```

**Port**: 8082

### 6. Study Design Service (`clinprecision-studydesign-service`)
**Purpose**: Study design, form management, and protocol definition

**Key Features**:
- Study creation and management
- Form definition and versioning
- Visit schedule management
- Study arm and intervention configuration

**Key Entities**:
- `StudyEntity`: Study information and metadata
- `FormDefinitionEntity`: CRF definitions with JSON structure
- `VisitDefinitionEntity`: Visit schedules and timelines
- `StudyArmEntity`: Treatment arms and randomization
- `InterventionEntity`: Study interventions and treatments

**Controllers**:
- `StudyController`: Study CRUD operations
- `FormDefinitionController`: Form management endpoints
- `VisitDefinitionController`: Visit schedule operations
- `StudyArmController`: Study arm management

**Main Class**:
```java
@SpringBootApplication
public class StudyDesignServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyDesignServiceApplication.class, args);
    }
}
```

**Port**: 8083

### 7. Data Capture Service (`clinprecision-datacapture-service`)
**Purpose**: Data entry, subject management, and data collection

**Key Features**:
- Subject enrollment and management
- Form data entry and validation
- Data quality checks
- Audit trail maintenance

**Key Entities**:
- `SubjectEntity`: Patient/subject information
- `FormDataEntity`: Collected form data
- `SubjectVisitEntity`: Visit instances and scheduling
- `DataQueryEntity`: Quality queries and resolutions

**Main Class**:
```java
@SpringBootApplication
public class StudyDataCaptureServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyDataCaptureServiceApplication.class, args);
    }
}
```

**Port**: 8084

### 8. Common Library (`clinprecision-common-lib`)
**Purpose**: Shared entities, utilities, and common functionality

**Shared Components**:
- Common entity definitions
- Utility classes and helpers
- Shared DTOs and models
- Common repository interfaces

**Key Entities**:
- `UserEntity`: Shared across User and Admin services
- `RoleEntity`: Role definitions
- `AuthorityEntity`: Permission definitions
- Base entity classes with audit fields

## Database Architecture

### Database Configuration
- **Database**: MySQL 8.0+
- **Connection Pool**: HikariCP (Spring Boot default)
- **ORM**: Hibernate with JPA annotations
- **Migration**: Manual SQL scripts in `clinprecision-db/ddl/`

### Common Configuration
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/clinprecisiondb
    username: ${DB_USERNAME:clinprecadmin}
    password: ${DB_PASSWORD:passw0rd}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
```

## Configuration Management

### Application Properties Structure
Each service follows this configuration pattern:
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

### Environment Profiles
- **Development**: Local development with H2/MySQL
- **Testing**: Integration testing environment
- **Production**: Production deployment configuration

### Service Discovery Configuration
All services register with Eureka:
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka
  instance:
    prefer-ip-address: true
    hostname: localhost
```

## API Design Patterns

### RESTful Endpoints
All services follow RESTful conventions:
```
GET    /api/studies           # List studies
GET    /api/studies/{id}      # Get specific study
POST   /api/studies           # Create study
PUT    /api/studies/{id}      # Update study
DELETE /api/studies/{id}      # Delete study
```

### Response Patterns
Consistent response structure:
```json
{
  "status": "success|error",
  "data": { /* response data */ },
  "message": "Success message or error description",
  "timestamp": "2024-09-16T10:30:00Z"
}
```

### Error Handling
Global exception handling:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        // Standard error response
    }
}
```

## Security Architecture

### Authentication Flow
1. User credentials sent to User Service
2. JWT token generated and returned
3. Subsequent requests include JWT in Authorization header
4. API Gateway validates token
5. Request forwarded to appropriate service

### Authorization Patterns
- **Role-based Access Control (RBAC)**: Users assigned to roles
- **Permission-based Authorization**: Fine-grained permissions
- **Resource-level Security**: Access control per study/organization

### Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt())
            .build();
    }
}
```

## Development Setup

### Prerequisites
- **Java 17** or higher
- **Maven 3.8+**
- **MySQL 8.0+**
- **Git**
- **Docker** (optional, for containerized deployment)

### Local Development Setup

#### 1. Database Setup
```sql
-- Create database and user
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';

-- Run schema script
SOURCE backend/clinprecision-db/ddl/consolidated_schema.sql;
```

#### 2. Service Startup Order
```bash
# 1. Start Configuration Service
cd backend/clinprecision-config-service
./mvnw spring-boot:run

# 2. Start Discovery Service
cd ../clinprecision-discovery-service
./mvnw spring-boot:run

# 3. Start remaining services (can be parallel)
cd ../clinprecision-user-service
./mvnw spring-boot:run

cd ../clinprecision-admin-service
./mvnw spring-boot:run

cd ../clinprecision-studydesign-service
./mvnw spring-boot:run

cd ../clinprecision-datacapture-service
./mvnw spring-boot:run

# 4. Start API Gateway last
cd ../clinprecision-apigateway-service
./mvnw spring-boot:run
```

### Build Commands
```bash
# Build all services
cd backend
mvn clean install

# Build specific service
cd clinprecision-user-service
mvn clean package

# Run tests
mvn test

# Skip tests during build
mvn clean package -DskipTests
```

### Docker Support
Each service includes Docker support:

```dockerfile
FROM openjdk:17-jre-slim
COPY target/user-service.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Testing Strategy

### Unit Testing
```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserServiceTests {
    
    @Test
    public void contextLoads() {
        // Test context loading
    }
    
    @Test
    public void testUserCreation() {
        // Test business logic
    }
}
```

### Integration Testing
- **TestContainers**: Database integration tests
- **MockWebServer**: External service mocking
- **Spring Boot Test**: Full application context testing

### Test Profiles
```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

## Deployment Architecture

### Containerized Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  config-service:
    build: ./clinprecision-config-service
    ports:
      - "8888:8888"
    
  discovery-service:
    build: ./clinprecision-discovery-service
    ports:
      - "8761:8761"
    depends_on:
      - config-service
      
  user-service:
    build: ./clinprecision-user-service
    ports:
      - "8081:8081"
    depends_on:
      - discovery-service
      - mysql
      
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: clinprecisiondb
      MYSQL_USER: clinprecadmin
      MYSQL_PASSWORD: passw0rd
```

### Cloud Deployment
**AWS Deployment**:
- **ECS/Fargate**: Container orchestration
- **RDS MySQL**: Managed database
- **Application Load Balancer**: Traffic distribution
- **CloudWatch**: Monitoring and logging

**Azure Deployment**:
- **Container Apps**: Serverless containers
- **Azure Database for MySQL**: Managed database
- **Application Gateway**: Load balancing
- **Azure Monitor**: Observability

## Monitoring and Observability

### Health Checks
Spring Boot Actuator endpoints:
```
GET /actuator/health      # Service health status
GET /actuator/info        # Service information
GET /actuator/metrics     # Application metrics
GET /actuator/env         # Environment properties
```

### Logging Configuration
```yaml
logging:
  level:
    com.clinprecision: DEBUG
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### Metrics and Tracing
- **Micrometer**: Metrics collection
- **Prometheus**: Metrics storage (planned)
- **Grafana**: Metrics visualization (planned)
- **Zipkin**: Distributed tracing (planned)

## API Gateway Routing

### Route Configuration
```java
@Configuration
public class GatewayRoutesConfig {
    
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("lb://user-service"))
            .route("study-design-service", r -> r
                .path("/api/studies/**")
                .uri("lb://studydesign-service"))
            .build();
    }
}
```

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return new CorsWebFilter(source);
    }
}
```

## Error Handling and Resilience

### Circuit Breaker Pattern
```java
@Component
public class UserServiceClient {
    
    @CircuitBreaker(name = "user-service", fallbackMethod = "fallbackUser")
    public User getUserById(Long id) {
        // Call to user service
    }
    
    public User fallbackUser(Long id, Exception ex) {
        return new User("Unknown User");
    }
}
```

### Retry Mechanism
```java
@Retryable(value = {Exception.class}, maxAttempts = 3)
public ResponseEntity<String> callExternalService() {
    // External service call
}
```

## Performance Optimization

### Database Optimization
- **Connection Pooling**: HikariCP configuration
- **Query Optimization**: JPA queries with proper indexing
- **Lazy Loading**: Hibernate lazy loading strategies
- **Caching**: Redis integration (planned)

### Service Optimization
- **Async Processing**: @Async methods for non-blocking operations
- **Caching**: Spring Cache abstraction
- **Pagination**: Pageable support for large datasets
- **Compression**: Response compression

## Security Best Practices

### Authentication Security
- **JWT Token Validation**: Signature verification
- **Token Expiration**: Short-lived tokens with refresh
- **Secure Headers**: Security headers in responses
- **HTTPS**: TLS encryption in production

### Data Protection
- **Password Encryption**: BCrypt with salt
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Bean Validation annotations
- **Audit Logging**: Security event logging

## Troubleshooting

### Common Issues

#### Service Discovery Problems
```bash
# Check Eureka dashboard
http://localhost:8761

# Verify service registration
curl http://localhost:8761/eureka/apps

# Check application logs
tail -f logs/discovery-service.log
```

#### Database Connection Issues
```bash
# Test MySQL connection
mysql -h localhost -u clinprecadmin -p clinprecisiondb

# Check connection pool status
curl http://localhost:8081/actuator/metrics/hikaricp.connections.active
```

#### API Gateway Routing Issues
```bash
# Check gateway routes
curl http://localhost:8080/actuator/gateway/routes

# Test direct service access
curl http://localhost:8081/actuator/health
```

### Debug Tools
- **Spring Boot Admin**: Service monitoring (planned)
- **Eureka Dashboard**: Service discovery visualization
- **Actuator Endpoints**: Health and metrics monitoring
- **Application Logs**: Centralized logging analysis

## Contributing

### Development Guidelines
1. **Branch Strategy**: GitFlow with feature branches
2. **Code Reviews**: Pull request reviews required
3. **Testing**: Unit and integration tests mandatory
4. **Documentation**: Code comments and API documentation

### Code Standards
- **Checkstyle**: Code style enforcement
- **SonarQube**: Code quality analysis (planned)
- **Maven Conventions**: Standard Maven project structure
- **Spring Conventions**: Spring Boot best practices

## Future Enhancements

### Planned Improvements
- **Event-Driven Architecture**: Apache Kafka integration
- **CQRS Pattern**: Command Query Responsibility Segregation
- **Saga Pattern**: Distributed transaction management
- **GraphQL**: Alternative API interface

### Infrastructure Enhancements
- **Kubernetes**: Container orchestration
- **Istio Service Mesh**: Advanced traffic management
- **Prometheus/Grafana**: Comprehensive monitoring
- **ELK Stack**: Advanced logging and search