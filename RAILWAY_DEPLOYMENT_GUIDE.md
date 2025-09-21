# Railway Deployment Guide for ClinPrecision Platform

## Overview
This guide provides step-by-step instructions for deploying the ClinPrecision clinical trial management platform on Railway. The platform consists of multiple Spring Boot microservices and a React frontend.

## Architecture Components
- **Frontend**: React.js application with Nginx
- **API Gateway**: Spring Cloud Gateway for routing
- **Discovery Service**: Eureka Server for service discovery
- **Configuration Service**: Spring Cloud Config Server
- **Business Services**: Admin, User, Study Design, Data Capture services
- **Database**: MySQL 8.0

## Prerequisites

### 1. Railway Account Setup
- Create an account at [railway.app](https://railway.app)
- Install Railway CLI: `npm install -g @railway/cli`
- Login to Railway: `railway login`

### 2. Project Structure Verification
Ensure your project has the following Docker-related files:
```
├── docker-compose.yml
├── backend/
│   ├── clinprecision-admin-service/dockerfile
│   ├── clinprecision-apigateway-service/Dockerfile
│   ├── clinprecision-config-service/Dockerfile
│   ├── clinprecision-datacapture-service/Dockerfile
│   ├── clinprecision-discovery-service/Dockerfile
│   ├── clinprecision-studydesign-service/Dockerfile
│   └── clinprecision-user-service/dockerfile
└── frontend/clinprecision/
    ├── Dockerfile
    └── nginx.conf
```

## Deployment Strategy

### Dynamic Port Configuration
The platform uses dynamic port assignment for optimal resource utilization:

- **Fixed Ports**: Discovery Service (8761), Config Service (8888), API Gateway (8080)
- **Dynamic Ports**: Admin, User, Study Design, Data Capture services use Railway's `${PORT}` environment variable
- **Benefits**: Better resource utilization, automatic port conflict resolution, Railway platform optimization

### Local Development vs Production
- **Local**: Uses specific ports (8081, 8082, 8083, 8084) via environment variables
- **Railway**: Uses dynamic ports via `${PORT}` environment variable
- **Configuration**: Managed through `.env` files and environment variables

### Phase 1: Database Setup

1. **Create MySQL Database Service**
   ```bash
   railway login
   railway new
   # Select "Empty Project"
   # Name: clinprecision-platform
   ```

2. **Add MySQL Database**
   - In Railway dashboard, click "New Service"
   - Select "Database" → "MySQL"
   - Note the connection details provided

3. **Configure Database Environment Variables**
   ```bash
   # Railway will automatically provide:
   MYSQL_URL=mysql://username:password@host:port/database
   MYSQL_HOST=your-mysql-host
   MYSQL_PORT=3306
   MYSQL_DATABASE=railway
   MYSQL_USERNAME=root
   MYSQL_PASSWORD=generated-password
   ```

4. **Initialize Database Schema**
   - Connect to your MySQL instance
   - Run the schema files from `backend/clinprecision-db/ddl/`
   - Run the data files from `backend/clinprecision-db/data/`

### Phase 2: Core Infrastructure Services

#### 1. Discovery Service (Eureka Server)
```bash
# Create new service from GitHub
railway service create --name discovery-service
railway service connect --service discovery-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
EUREKA_CLIENT_FETCH_REGISTRY=false
EUREKA_SERVER_ENABLE_SELF_PRESERVATION=false
PORT=8761
```

**Dockerfile Path**: `backend/clinprecision-discovery-service/Dockerfile`

#### 2. Configuration Service
```bash
railway service create --name config-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_SERVER_GIT_URI=https://github.com/your-repo/config-repo
PORT=8888
```

**Dockerfile Path**: `backend/clinprecision-config-service/Dockerfile`

### Phase 3: Business Services (Dynamic Port Configuration)

#### 1. Admin Service
```bash
railway service create --name admin-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USERNAME}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SERVER_PORT=${PORT}
EUREKA_INSTANCE_NON_SECURE_PORT=${PORT}
```

**Dockerfile Path**: `backend/clinprecision-admin-service/dockerfile`

#### 2. User Service
```bash
railway service create --name user-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USERNAME}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SERVER_PORT=${PORT}
EUREKA_INSTANCE_NON_SECURE_PORT=${PORT}
```

**Dockerfile Path**: `backend/clinprecision-user-service/dockerfile`

#### 3. Study Design Service
```bash
railway service create --name studydesign-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USERNAME}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SERVER_PORT=${PORT}
EUREKA_INSTANCE_NON_SECURE_PORT=${PORT}
```

**Dockerfile Path**: `backend/clinprecision-studydesign-service/Dockerfile`

#### 4. Data Capture Service
```bash
railway service create --name datacapture-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USERNAME}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SERVER_PORT=${PORT}
EUREKA_INSTANCE_NON_SECURE_PORT=${PORT}
```

**Dockerfile Path**: `backend/clinprecision-datacapture-service/Dockerfile`

### Phase 4: API Gateway

```bash
railway service create --name apigateway-service

# Environment Variables:
SPRING_PROFILES_ACTIVE=railway
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SPRING_CLOUD_GATEWAY_ROUTES_0_ID=admin-service
SPRING_CLOUD_GATEWAY_ROUTES_0_URI=lb://admin-service
SPRING_CLOUD_GATEWAY_ROUTES_0_PREDICATES_0=Path=/admin/**
SPRING_CLOUD_GATEWAY_ROUTES_1_ID=user-service
SPRING_CLOUD_GATEWAY_ROUTES_1_URI=lb://user-service
SPRING_CLOUD_GATEWAY_ROUTES_1_PREDICATES_0=Path=/users/**
SPRING_CLOUD_GATEWAY_ROUTES_2_ID=studydesign-service
SPRING_CLOUD_GATEWAY_ROUTES_2_URI=lb://studydesign-service
SPRING_CLOUD_GATEWAY_ROUTES_2_PREDICATES_0=Path=/studies/**
SPRING_CLOUD_GATEWAY_ROUTES_3_ID=datacapture-service
SPRING_CLOUD_GATEWAY_ROUTES_3_URI=lb://datacapture-service
SPRING_CLOUD_GATEWAY_ROUTES_3_PREDICATES_0=Path=/datacapture/**
PORT=8080
```

**Dockerfile Path**: `backend/clinprecision-apigateway-service/Dockerfile`

### Phase 5: Frontend Application

```bash
railway service create --name frontend

# Environment Variables:
REACT_APP_API_URL=${APIGATEWAY_SERVICE_URL}
REACT_APP_ENVIRONMENT=production
PORT=3000
```

**Dockerfile Path**: `frontend/clinprecision/Dockerfile`

## Environment Variables Reference

### Common Spring Boot Variables
```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8080  # or service-specific port
JAVA_OPTS=-Xmx512m -Xms256m
```

### Database Connection
```bash
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USERNAME}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
```

### Service Discovery
```bash
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=${DISCOVERY_SERVICE_URL}/eureka/
EUREKA_CLIENT_REGISTER_WITH_EUREKA=true
EUREKA_CLIENT_FETCH_REGISTRY=true
EUREKA_INSTANCE_PREFER_IP_ADDRESS=true
```

### Configuration Server
```bash
SPRING_CLOUD_CONFIG_URI=${CONFIG_SERVICE_URL}
SPRING_CLOUD_CONFIG_FAIL_FAST=false
SPRING_CLOUD_CONFIG_RETRY_INITIAL_INTERVAL=1000
```

## Deployment Commands

### 1. Deploy All Services at Once
```bash
# From project root
railway project create clinprecision-platform

# Deploy each service
railway up --service discovery-service --dockerfile backend/clinprecision-discovery-service/Dockerfile
railway up --service config-service --dockerfile backend/clinprecision-config-service/Dockerfile
railway up --service admin-service --dockerfile backend/clinprecision-admin-service/dockerfile
railway up --service user-service --dockerfile backend/clinprecision-user-service/dockerfile
railway up --service studydesign-service --dockerfile backend/clinprecision-studydesign-service/Dockerfile
railway up --service datacapture-service --dockerfile backend/clinprecision-datacapture-service/Dockerfile
railway up --service apigateway-service --dockerfile backend/clinprecision-apigateway-service/Dockerfile
railway up --service frontend --dockerfile frontend/clinprecision/Dockerfile
```

### 2. Individual Service Deployment
```bash
# Deploy specific service
railway service --name [service-name]
railway up
```

## Post-Deployment Configuration

### 1. Custom Domains
```bash
# Add custom domain
railway domain add yourdomain.com --service frontend
railway domain add api.yourdomain.com --service apigateway-service
```

### 2. Health Checks
Verify all services are running:
```bash
# Check service status
railway status

# View logs
railway logs --service [service-name]
```

### 3. Database Migration
```bash
# Connect to database and run migrations
railway connect mysql
# Run your SQL migration scripts
```

## Security Configuration

### 1. Environment Variables
- Never commit sensitive data to Git
- Use Railway's environment variable management
- Rotate passwords regularly

### 2. Network Security
```bash
# Configure CORS in API Gateway
SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS_[/**]_ALLOWED_ORIGINS=https://yourdomain.com
SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS_[/**]_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS_[/**]_ALLOWED_HEADERS=*
```

### 3. SSL/TLS
Railway automatically provides SSL certificates for all deployments.

## Monitoring and Logging

### 1. Application Logs
```bash
# View real-time logs
railway logs --service [service-name] --follow

# View historical logs
railway logs --service [service-name] --tail 100
```

### 2. Health Endpoints
Each service exposes health endpoints:
- Discovery Service: `${DISCOVERY_SERVICE_URL}/actuator/health`
- Config Service: `${CONFIG_SERVICE_URL}/actuator/health`
- Business Services: `${SERVICE_URL}/actuator/health`

### 3. Monitoring Dashboard
- Railway provides built-in monitoring
- Track CPU, memory, and network usage
- Set up alerts for service failures

## Scaling Configuration

### 1. Horizontal Scaling
```bash
# Scale specific service
railway service scale --replicas 3 --service admin-service
```

### 2. Resource Allocation
```bash
# Increase memory/CPU limits
railway service update --memory 1024 --cpu 1000 --service studydesign-service
```

## Troubleshooting

### Common Issues

1. **Service Discovery Problems**
   - Verify Eureka server is running
   - Check service registration logs
   - Validate environment variables

2. **Database Connection Issues**
   - Verify MySQL service is running
   - Check connection string format
   - Validate credentials

3. **Frontend API Calls Failing**
   - Check CORS configuration
   - Verify API Gateway routing
   - Validate environment variables

### Debug Commands
```bash
# Service status
railway status

# Service logs
railway logs --service [service-name]

# Environment variables
railway variables --service [service-name]

# Connect to database
railway connect mysql
```

## Cost Optimization

### 1. Resource Right-Sizing
- Monitor actual usage
- Adjust memory/CPU allocations
- Use appropriate instance sizes

### 2. Development vs Production
- Use smaller instances for development
- Scale up for production workloads
- Consider staging environments

## Backup and Recovery

### 1. Database Backups
```bash
# Manual backup
railway connect mysql
mysqldump clinprecision > backup_$(date +%Y%m%d).sql
```

### 2. Configuration Backups
- Export environment variables
- Version control configuration files
- Document deployment procedures

## Support and Maintenance

### 1. Regular Updates
- Monitor for security updates
- Update base Docker images
- Keep dependencies current

### 2. Performance Monitoring
- Track response times
- Monitor resource usage
- Optimize bottlenecks

### 3. Documentation
- Keep deployment docs updated
- Document configuration changes
- Maintain runbooks for common tasks

## Conclusion

This guide provides a comprehensive approach to deploying the ClinPrecision platform on Railway. Follow the phases sequentially, verify each service deployment, and monitor the system for optimal performance.

For additional support:
- Railway Documentation: https://docs.railway.app
- Railway Community: https://discord.gg/railway
- Project Repository: Update with your GitHub repository link