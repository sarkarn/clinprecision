# Railway.app Deployment Scripts and Utilities

## Quick Start Commands

### Local Development
```bash
# Start all services locally
docker-compose up --build

# Start specific service
docker-compose up --build [service-name]

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new

# Deploy service
railway up --service [service-name]

# View deployment status
railway status

# View logs
railway logs --service [service-name]
```

## Service Deployment Order

1. **Database** (MySQL)
2. **Discovery Service** (Eureka)
3. **Config Service**
4. **Business Services** (Admin, User, StudyDesign, DataCapture)
5. **API Gateway**
6. **Frontend** (React)

## Port Mapping

### Fixed Ports (Infrastructure Services)
- Frontend: 3000
- API Gateway: 8080  
- Discovery Service: 8761
- Config Service: 8888
- MySQL: 3306

### Dynamic Ports (Business Services)
Services use environment variables for flexible port assignment:
- Admin Service: `${ADMIN_SERVICE_INTERNAL_PORT:-8080}` (local: 8081)
- User Service: `${USER_SERVICE_INTERNAL_PORT:-8080}` (local: 8082)
- StudyDesign Service: `${STUDYDESIGN_SERVICE_INTERNAL_PORT:-8080}` (local: 8083)
- DataCapture Service: `${DATACAPTURE_SERVICE_INTERNAL_PORT:-8080}` (local: 8084)

### Railway Dynamic Ports
For Railway deployment, services automatically use `${PORT}` environment variable

## Environment Files
Create `.env` files for each environment:

### .env.local (Local Development)
```
# External ports for host access
ADMIN_SERVICE_PORT=8081
USER_SERVICE_PORT=8082
STUDYDESIGN_SERVICE_PORT=8083
DATACAPTURE_SERVICE_PORT=8084

# Internal container ports
ADMIN_SERVICE_INTERNAL_PORT=8080
USER_SERVICE_INTERNAL_PORT=8080
STUDYDESIGN_SERVICE_INTERNAL_PORT=8080
DATACAPTURE_SERVICE_INTERNAL_PORT=8080

# Database
MYSQL_URL=jdbc:mysql://localhost:3306/clinprecision
MYSQL_USERNAME=clinprecision
MYSQL_PASSWORD=clinprecision123
EUREKA_URL=http://localhost:8761
CONFIG_URL=http://localhost:8888
```

### .env.railway (Railway Deployment)
```
# Dynamic ports (Railway assigns automatically)
ADMIN_SERVICE_INTERNAL_PORT=${PORT}
USER_SERVICE_INTERNAL_PORT=${PORT}
STUDYDESIGN_SERVICE_INTERNAL_PORT=${PORT}
DATACAPTURE_SERVICE_INTERNAL_PORT=${PORT}

# Database from Railway
MYSQL_URL=${DATABASE_URL}
EUREKA_URL=${DISCOVERY_SERVICE_URL}
CONFIG_URL=${CONFIG_SERVICE_URL}
```

## Troubleshooting

### Common Issues
1. **Service Discovery**: Ensure Eureka is running first
2. **Database Connection**: Verify MySQL credentials and URL
3. **Port Conflicts**: Check if ports are already in use
4. **Memory Issues**: Increase Docker memory allocation

### Useful Commands
```bash
# Check Docker resources
docker system df

# Clean up unused resources
docker system prune

# Check service health
curl http://localhost:8080/actuator/health

# View container logs
docker logs [container-name]
```