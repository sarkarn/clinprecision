# Organization & Site Service Split Implementation Guide

## Date: October 3, 2025
## Branch: SITE_MGMT_REFACTORING_BACKEND

## Overview
This guide outlines the step-by-step implementation for:
1. **Phase 2:** Create new `organization-ws` microservice
2. **Phase 3:** Refactor `admin-ws` → `site-ws` microservice

---

## Phase 2: Create organization-ws Service

### Step 2.1: Create Service Module Structure

#### 2.1.1 Create Directory Structure
```powershell
# Navigate to backend directory
cd c:\nnsproject\clinprecision\backend

# Create organization service directory
mkdir clinprecision-organization-service
cd clinprecision-organization-service

# Create Maven structure
mkdir src\main\java\com\clinprecision\organizationservice
mkdir src\main\java\com\clinprecision\organizationservice\config
mkdir src\main\java\com\clinprecision\organizationservice\repository
mkdir src\main\java\com\clinprecision\organizationservice\service
mkdir src\main\java\com\clinprecision\organizationservice\service\impl
mkdir src\main\java\com\clinprecision\organizationservice\ui
mkdir src\main\java\com\clinprecision\organizationservice\ui\controller
mkdir src\main\java\com\clinprecision\organizationservice\ui\model
mkdir src\main\resources
mkdir src\main\resources\config
mkdir src\test\java\com\clinprecision\organizationservice
```

#### 2.1.2 Create pom.xml
**File:** `backend/clinprecision-organization-service/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.4</version>
        <relativePath/>
    </parent>
    
    <groupId>com.clinprecision</groupId>
    <artifactId>clinprecision-organization-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>clinprecision-organization-service</name>
    <description>Organization Management Service for ClinPrecision</description>
    
    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2024.0.0</spring-cloud.version>
        <mapstruct.version>1.6.3</mapstruct.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Spring Cloud -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Common Library -->
        <dependency>
            <groupId>com.clinprecision</groupId>
            <artifactId>clinprecision-common-lib</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
        
        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>21</source>
                    <target>21</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>${lombok.version}</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok-mapstruct-binding</artifactId>
                            <version>0.2.0</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 2.1.3 Create Main Application Class
**File:** `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/OrganizationApplication.java`

```java
package com.clinprecision.organizationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {
    "com.clinprecision.organizationservice",
    "com.clinprecision.common.mapper",
    "com.clinprecision.common.util"
},
excludeFilters = {
    @ComponentScan.Filter(
        type = FilterType.REGEX, 
        pattern = "com.clinprecision.common.mapper.(Site|User|UserType|UserStudyRole).*"
    )
})
@EntityScan(basePackages = {
    "com.clinprecision.common.entity"
})
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.organizationservice.repository",
    "com.clinprecision.common.repository"
})
public class OrganizationApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrganizationApplication.class, args);
    }
}
```

#### 2.1.4 Create Application Configuration Files

**File:** `backend/clinprecision-organization-service/src/main/resources/bootstrap.properties`

```properties
spring.application.name=organization-ws
spring.cloud.config.uri=http://localhost:8012
spring.cloud.config.name=organization-ws
```

**File:** `backend/clinprecision-organization-service/src/main/resources/application.properties`

```properties
server.port=8087
spring.application.name=organization-ws

# Eureka Client Configuration
eureka.client.serviceUrl.defaultZone=http://localhost:8010/eureka
eureka.instance.instance-id=${spring.application.name}:${instanceId:${random.value}}
```

### Step 2.2: Move Organization-Related Code from admin-ws

#### 2.2.1 Controllers to Move
From `admin-ws` → Copy to `organization-ws`:

1. **OrganizationController.java**
   - From: `backend/clinprecision-admin-service/src/main/java/com/clinprecision/adminservice/ui/controller/`
   - To: `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/ui/controller/`
   - Update package: `package com.clinprecision.organizationservice.ui.controller;`
   - Update service imports

2. **OrganizationContactController.java** (if exists)
   - Same migration pattern

#### 2.2.2 Services to Move
From `admin-ws` → Copy to `organization-ws`:

1. **OrganizationService.java** (interface)
   - From: `backend/clinprecision-admin-service/src/main/java/com/clinprecision/adminservice/service/`
   - To: `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/service/`
   - Update package: `package com.clinprecision.organizationservice.service;`

2. **OrganizationServiceImpl.java**
   - From: `backend/clinprecision-admin-service/src/main/java/com/clinprecision/adminservice/service/impl/`
   - To: `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/service/impl/`
   - Update package and imports

#### 2.2.3 Repositories to Move
From `admin-ws` → Copy to `organization-ws`:

1. **OrganizationRepository.java**
   - From: `backend/clinprecision-admin-service/src/main/java/com/clinprecision/adminservice/repository/`
   - To: `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/repository/`
   - Update package: `package com.clinprecision.organizationservice.repository;`

2. **OrganizationContactRepository.java** (if exists)
   - Same migration pattern

#### 2.2.4 DTOs to Move
From `admin-ws` → Copy to `organization-ws`:

1. **CreateOrganizationDto.java**
2. **UpdateOrganizationDto.java**
3. **OrganizationContactDto.java** (if exists)

- From: `backend/clinprecision-admin-service/src/main/java/com/clinprecision/adminservice/ui/model/`
- To: `backend/clinprecision-organization-service/src/main/java/com/clinprecision/organizationservice/ui/model/`
- Update package: `package com.clinprecision.organizationservice.ui.model;`

### Step 2.3: Create Config Server Configuration

**File:** `backend/clinprecision-config-service/src/main/resources/config/application-organization-ws.properties`

```properties
# Organization Service Configuration
spring.application.name=organization-ws
server.port=8087

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/clinprecision_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=clinprecisionuser
spring.datasource.password=clinprecisionpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Eureka Configuration
eureka.client.serviceUrl.defaultZone=http://localhost:8010/eureka
eureka.instance.instance-id=${spring.application.name}:${instanceId:${random.value}}
eureka.instance.prefer-ip-address=true

# Logging
logging.level.com.clinprecision.organizationservice=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Application Properties
myapplication.environment=dev
```

### Step 2.4: Create Dockerfile

**File:** `backend/clinprecision-organization-service/Dockerfile`

```dockerfile
FROM openjdk:21-jdk-slim
VOLUME /tmp
COPY target/clinprecision-organization-service-0.0.1-SNAPSHOT.jar organization-ws.jar
ENTRYPOINT ["java","-jar","/organization-ws.jar"]
EXPOSE 8087
```

---

## Phase 3: Refactor admin-ws → site-ws

### Step 3.1: Rename Service Module

#### 3.1.1 Rename Directory
```powershell
cd c:\nnsproject\clinprecision\backend
# Rename folder
Rename-Item -Path "clinprecision-admin-service" -NewName "clinprecision-site-service"
```

#### 3.1.2 Update pom.xml
**File:** `backend/clinprecision-site-service/pom.xml`

Change:
```xml
<artifactId>clinprecision-admin-service</artifactId>
<name>clinprecision-admin-service</name>
<description>Admin Service for ClinPrecision</description>
```

To:
```xml
<artifactId>clinprecision-site-service</artifactId>
<name>clinprecision-site-service</name>
<description>Site Management Service for ClinPrecision</description>
```

### Step 3.2: Refactor Package Names

#### 3.2.1 Rename Main Package
From: `com.clinprecision.adminservice`
To: `com.clinprecision.siteservice`

**Files to update:**
1. Rename directory: `src/main/java/com/clinprecision/adminservice` → `src/main/java/com/clinprecision/siteservice`
2. Update all package declarations in `.java` files
3. Update all imports referencing the old package

#### 3.2.2 Rename Main Application Class
**File:** Rename `AdminApplication.java` → `SiteApplication.java`

Update content:
```java
package com.clinprecision.siteservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {
    "com.clinprecision.siteservice",
    "com.clinprecision.common.mapper",
    "com.clinprecision.common.util",
    "com.clinprecision.axon"
},
excludeFilters = {
    @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com.clinprecision.common.mapper.(User|Organization|UserType|UserStudyRole).*"
    )
})
@EntityScan(basePackages = {
    "com.clinprecision.siteservice.data.entity", 
    "com.clinprecision.common.entity",
    "org.axonframework.eventsourcing.eventstore.jpa",
    "org.axonframework.modelling.saga.repository.jpa",
    "org.axonframework.eventhandling.tokenstore.jpa"
})
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.siteservice.repository",
    "com.clinprecision.common.repository"
})
public class SiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(SiteApplication.class, args);
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### Step 3.3: Update Configuration Files

#### 3.3.1 Update bootstrap.properties
**File:** `backend/clinprecision-site-service/src/main/resources/bootstrap.properties`

Change:
```properties
spring.application.name=admin-ws
spring.cloud.config.name=admin-ws
```

To:
```properties
spring.application.name=site-ws
spring.cloud.config.uri=http://localhost:8012
spring.cloud.config.name=site-ws
```

#### 3.3.2 Rename Config Server Configuration
**From:** `backend/clinprecision-config-service/src/main/resources/config/application-admin-ws.properties`
**To:** `backend/clinprecision-config-service/src/main/resources/config/application-site-ws.properties`

Update content:
```properties
# Site Management Service Configuration
spring.application.name=site-ws
server.port=8084

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/clinprecision_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=clinprecisionuser
spring.datasource.password=clinprecisionpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Eureka Configuration
eureka.client.serviceUrl.defaultZone=http://localhost:8010/eureka
eureka.instance.instance-id=${spring.application.name}:${instanceId:${random.value}}
eureka.instance.prefer-ip-address=true

# Axon Framework Configuration
axon.eventhandling.processors.site-projection.mode=subscribing

# Logging
logging.level.com.clinprecision.siteservice=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.level.org.axonframework=DEBUG

# Application Properties
myapplication.environment=dev
```

### Step 3.4: Remove Organization-Related Code from site-ws

After copying to organization-ws, **delete** these files from site-ws:

1. ❌ `OrganizationController.java`
2. ❌ `OrganizationService.java`
3. ❌ `OrganizationServiceImpl.java`
4. ❌ `OrganizationRepository.java`
5. ❌ `CreateOrganizationDto.java`
6. ❌ `UpdateOrganizationDto.java`

### Step 3.5: Add Feign Client for Organization Service

**File:** `backend/clinprecision-site-service/src/main/java/com/clinprecision/siteservice/client/OrganizationClient.java`

```java
package com.clinprecision.siteservice.client;

import com.clinprecision.common.dto.OrganizationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "organization-ws")
public interface OrganizationClient {
    
    @GetMapping("/api/organizations/{id}")
    OrganizationDto getOrganizationById(@PathVariable Long id);
    
    @GetMapping("/api/organizations")
    List<OrganizationDto> getAllOrganizations();
}
```

### Step 3.6: Update Dockerfile

**File:** `backend/clinprecision-site-service/Dockerfile`

Change:
```dockerfile
COPY target/clinprecision-admin-service-0.0.1-SNAPSHOT.jar admin-ws.jar
ENTRYPOINT ["java","-jar","/admin-ws.jar"]
```

To:
```dockerfile
COPY target/clinprecision-site-service-0.0.1-SNAPSHOT.jar site-ws.jar
ENTRYPOINT ["java","-jar","/site-ws.jar"]
```

---

## Step 4: Update API Gateway Configuration

**File:** `backend/clinprecision-apigateway-service/src/main/java/com/clinprecision/api/gateway/config/GatewayRoutesConfig.java`

### 4.1 Add Organization Service Routes

Add after users-ws routes:
```java
// Organization Service - API routes
.route("organization-ws-api", r -> r
    .path("/organization-ws/api/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/organization-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
        .filter(authFilter)
    )
    .uri("lb://organization-ws")
)
// Organization Service - Direct routes
.route("organization-ws-direct", r -> r
    .path("/organization-ws/organizations/**", "/organization-ws/organization-contacts/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/organization-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
        .filter(authFilter)
    )
    .uri("lb://organization-ws")
)
```

### 4.2 Update Site Service Routes

Change all `admin-ws` routes to `site-ws`:

```java
// Site Management Routes - specific routes for better path matching
.route("site-ws-sites-get", r -> r
    .path("/site-ws/sites/**")
    .and()
    .method("GET")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
    )
    .uri("lb://site-ws")
)
.route("site-ws-sites-write", r -> r
    .path("/site-ws/sites/**")
    .and()
    .method("POST", "PUT", "DELETE", "PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
        .filter(authFilter)
    )
    .uri("lb://site-ws")
)
// Site Service API routes (for controllers with /api/ prefix)
.route("site-ws-api", r -> r
    .path("/site-ws/api/**")
    .and()
    .method("GET", "POST", "PUT", "DELETE", "PATCH")
    .and()
    .header("Authorization", "Bearer (.*)")
    .filters(f -> f
        .removeRequestHeader("Cookie")
        .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
        .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
        .filter(authFilter)
    )
    .uri("lb://site-ws")
)
```

---

## Step 5: Create Frontend Services

### 5.1 Create OrganizationService.js

**File:** `frontend/clinprecision/src/services/OrganizationService.js`

```javascript
// src/services/OrganizationService.js
import ApiService from './ApiService';

export const OrganizationService = {
  /**
   * Get all organizations
   * @returns {Promise} - Promise with organizations data
   */
  getAllOrganizations: async () => {
    try {
      const response = await ApiService.get('/organization-ws/api/organizations');
      return response.data;
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }
  },

  /**
   * Get a specific organization by ID
   * @param {string} id - Organization ID
   * @returns {Promise} - Promise with organization data
   */
  getOrganizationById: async (id) => {
    try {
      const response = await ApiService.get(`/organization-ws/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization data
   * @returns {Promise} - Promise with created organization data
   */
  createOrganization: async (organizationData) => {
    try {
      const response = await ApiService.post('/organization-ws/api/organizations', organizationData);
      return response.data;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  /**
   * Update an existing organization
   * @param {string} id - Organization ID
   * @param {Object} organizationData - Updated organization data
   * @returns {Promise} - Promise with updated organization data
   */
  updateOrganization: async (id, organizationData) => {
    try {
      const response = await ApiService.put(`/organization-ws/api/organizations/${id}`, organizationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an organization
   * @param {string} id - Organization ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteOrganization: async (id) => {
    try {
      const response = await ApiService.delete(`/organization-ws/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get organization hierarchy
   * @param {string} id - Organization ID
   * @returns {Promise} - Promise with organization hierarchy
   */
  getOrganizationHierarchy: async (id) => {
    try {
      const response = await ApiService.get(`/organization-ws/api/organizations/${id}/hierarchy`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization hierarchy for ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get organization contacts
   * @param {string} organizationId - Organization ID
   * @returns {Promise} - Promise with organization contacts
   */
  getOrganizationContacts: async (organizationId) => {
    try {
      const response = await ApiService.get(`/organization-ws/api/organizations/${organizationId}/contacts`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contacts for organization ${organizationId}:`, error);
      throw error;
    }
  }
};

export default OrganizationService;
```

### 5.2 Update SiteService.js

Update all `/admin-ws/` paths to `/site-ws/`:

```javascript
// Example changes in SiteService.js
getAllSites: async () => {
  const response = await ApiService.get('/site-ws/api/sites'); // Changed from /admin-ws/
  return response.data;
},
```

---

## Step 6: Update docker-compose.yml

**File:** `docker-compose.yml`

Add organization-ws service:
```yaml
  organization-ws:
    build: ./backend/clinprecision-organization-service
    ports:
      - "8087:8087"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_CLOUD_CONFIG_URI=http://config-service:8012
    depends_on:
      - config-service
      - discovery-service
      - mysql
    networks:
      - clinprecision-network
```

Rename admin-ws to site-ws:
```yaml
  site-ws:  # Changed from admin-ws
    build: ./backend/clinprecision-site-service  # Changed from admin-service
    ports:
      - "8084:8084"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_CLOUD_CONFIG_URI=http://config-service:8012
    depends_on:
      - config-service
      - discovery-service
      - mysql
    networks:
      - clinprecision-network
```

---

## Step 7: Build and Test

### 7.1 Build Services

```powershell
# Build common-lib first
cd c:\nnsproject\clinprecision\backend\clinprecision-common-lib
mvn clean install -DskipTests

# Build organization-ws
cd c:\nnsproject\clinprecision\backend\clinprecision-organization-service
mvn clean install -DskipTests

# Build site-ws (formerly admin-ws)
cd c:\nnsproject\clinprecision\backend\clinprecision-site-service
mvn clean install -DskipTests

# Build API Gateway
cd c:\nnsproject\clinprecision\backend\clinprecision-apigateway-service
mvn clean install -DskipTests
```

### 7.2 Start Services in Order

```powershell
# 1. Config Service (port 8012)
# 2. Discovery Service (port 8010)
# 3. Organization Service (port 8087)
# 4. Site Service (port 8084)
# 5. Users Service (port 8083)
# 6. API Gateway (port 8082)
```

### 7.3 Verify Service Registration

Visit: http://localhost:8010 (Eureka Dashboard)

Verify these services are registered:
- ✅ organization-ws
- ✅ site-ws
- ✅ users-ws
- ✅ api-gateway

---

## Testing Checklist

### Organization Service Tests
- [ ] GET `/organization-ws/api/organizations` - Get all organizations
- [ ] POST `/organization-ws/api/organizations` - Create organization
- [ ] GET `/organization-ws/api/organizations/{id}` - Get organization by ID
- [ ] PUT `/organization-ws/api/organizations/{id}` - Update organization
- [ ] DELETE `/organization-ws/api/organizations/{id}` - Delete organization
- [ ] GET `/organization-ws/api/organizations/{id}/hierarchy` - Get hierarchy

### Site Service Tests
- [ ] GET `/site-ws/api/sites` - Get all sites
- [ ] POST `/site-ws/api/sites` - Create site
- [ ] GET `/site-ws/api/sites/{id}` - Get site by ID
- [ ] PUT `/site-ws/api/sites/{id}` - Update site
- [ ] POST `/site-ws/api/sites/{id}/activate` - Activate site
- [ ] GET `/site-ws/api/sites/{siteId}/studies` - Get site-study associations

### Frontend Integration Tests
- [ ] Organization dropdown loads correctly
- [ ] Site creation with organization selection works
- [ ] Site-study association creation works
- [ ] All CRUD operations function through API Gateway

---

## Troubleshooting Guide

### Issue: Service Won't Start - MapStruct Issues
**Solution:** Ensure component scanning excludes unneeded mappers
```java
excludeFilters = {
    @ComponentScan.Filter(type = FilterType.REGEX, 
        pattern = "com.clinprecision.common.mapper.(User|Site|Organization).*")
}
```

### Issue: 404 Not Found via Gateway
**Solution:** Verify service is registered in Eureka and route paths match

### Issue: Circular Dependency Between Services
**Solution:** Use Feign clients, ensure only organization-ws manages organizations

### Issue: Database FK Constraint Violations
**Solution:** Update migration order, handle cascades properly

---

## Success Criteria

- ✅ organization-ws starts successfully on port 8087
- ✅ site-ws (renamed from admin-ws) starts on port 8084
- ✅ Both services register with Eureka
- ✅ API Gateway routes requests correctly
- ✅ Frontend services can access both services
- ✅ No MapStruct dependency errors
- ✅ All CRUD operations work end-to-end
- ✅ Cross-service communication via Feign client works

---

## Rollback Plan

If issues occur:
1. Keep admin-ws name temporarily
2. Revert API Gateway routes
3. Delay organization service split
4. Fix issues one service at a time

---

## Next Steps After Completion

1. Update all documentation with new service names
2. Create organization management UI components
3. Implement organization-based access control
4. Add caching for organization reference data
5. Implement event-driven synchronization between services
6. Performance testing and optimization

