# Railway Frontend Deployment Guide - ClinPrecision React Application

## Overview
This guide provides step-by-step instructions for deploying the ClinPrecision React frontend application to Railway. The frontend is a modern React application built with Vite/Create React App, styled with Tailwind CSS, and served via Nginx in production.

## Prerequisites

### 1. Railway Account & CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Verify installation
railway --version
```

### 2. Project Structure Verification
Ensure your frontend project has these files:
```
frontend/clinprecision/
├── Dockerfile                 # Multi-stage build configuration
├── nginx.conf                # Production Nginx configuration  
├── .dockerignore             # Build optimization
├── package.json              # Dependencies and scripts
├── src/                      # React source code
├── public/                   # Static assets
└── build/                    # Production build (generated)
```

## Frontend Architecture

### Technology Stack
- **React**: 19.1.1 (Modern React with concurrent features)
- **Routing**: React Router DOM 7.7.1
- **Styling**: Tailwind CSS 3.4.3 with PostCSS
- **HTTP Client**: Axios 1.11.0 for API communication
- **Icons**: Lucide React + FontAwesome
- **Build Tool**: React Scripts 5.0.1
- **Server**: Nginx (production)

### Build Configuration
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Railway Deployment Steps

### Step 1: Create Railway Service

```bash
# Navigate to frontend directory
cd frontend/clinprecision

# Create new Railway service
railway service create --name clinprecision-frontend

# Or connect to existing project
railway project connect [project-id]
railway service connect --name clinprecision-frontend
```

### Step 2: Environment Configuration

Set up environment variables in Railway dashboard or via CLI:

```bash
# Production environment variables
railway variables set REACT_APP_API_URL=https://your-api-gateway.railway.app
railway variables set REACT_APP_ENVIRONMENT=production
railway variables set NODE_ENV=production
railway variables set GENERATE_SOURCEMAP=false

# Optional: API endpoints
railway variables set REACT_APP_ADMIN_API_URL=https://admin-service.railway.app
railway variables set REACT_APP_USER_API_URL=https://user-service.railway.app
railway variables set REACT_APP_STUDY_API_URL=https://studydesign-service.railway.app
railway variables set REACT_APP_DATA_API_URL=https://datacapture-service.railway.app

# Performance optimization
railway variables set BUILD_PATH=build
railway variables set CI=false
```

### Step 3: Configure Build Settings

Railway will automatically detect the Dockerfile and build accordingly. Verify these settings:

```bash
# Check current configuration
railway variables

# Set custom build command if needed (usually auto-detected)
railway variables set BUILD_CMD="npm run build"

# Set start command (handled by Dockerfile)
railway variables set START_CMD="nginx -g 'daemon off;'"
```

### Step 4: Deploy the Frontend

```bash
# Deploy from local directory
railway up

# Or deploy with specific Dockerfile
railway up --dockerfile Dockerfile

# Monitor deployment
railway logs --follow
```

### Step 5: Domain Configuration

```bash
# Generate Railway domain
railway domain generate

# Add custom domain (optional)
railway domain add yourdomain.com

# View current domains
railway domain list
```

## Docker Configuration Explained

### Dockerfile Analysis
```dockerfile
# Stage 1: Build React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration Features
- **React Router Support**: Fallback to `index.html` for SPA routing
- **API Proxy**: Routes `/api/*` requests to backend services
- **Gzip Compression**: Optimized asset delivery
- **Security Headers**: XSS protection, content type sniffing prevention
- **Static Asset Caching**: Long-term caching for JS/CSS/images

## Environment Variables Reference

### Required Variables
```bash
REACT_APP_API_URL=https://your-api-gateway.railway.app
NODE_ENV=production
```

### Optional Variables
```bash
# Performance
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
BUILD_PATH=build

# Development
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_MODE=false

# API Endpoints (if using direct service calls)
REACT_APP_ADMIN_API_URL=https://admin-service.railway.app
REACT_APP_USER_API_URL=https://user-service.railway.app
REACT_APP_STUDY_API_URL=https://studydesign-service.railway.app
REACT_APP_DATA_API_URL=https://datacapture-service.railway.app

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_REAL_TIME=true
```

## API Integration Configuration

### Backend Service Integration
The frontend communicates with backend services through the API Gateway:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Service endpoints
export const endpoints = {
  admin: `${API_BASE_URL}/admin`,
  users: `${API_BASE_URL}/users`,
  studies: `${API_BASE_URL}/studies`,
  datacapture: `${API_BASE_URL}/datacapture`
};
```

### Nginx Proxy Configuration
The nginx.conf includes API proxying:
```nginx
location /api/ {
    proxy_pass http://apigateway:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Build Optimization

### Docker Build Optimization
```bash
# Check build context size
railway logs --service clinprecision-frontend

# Optimize with .dockerignore
cat .dockerignore
```

### Performance Optimizations
1. **Multi-stage Build**: Separates build and runtime environments
2. **Node Alpine**: Minimal base image for faster builds
3. **npm ci**: Faster, reproducible installs
4. **Production Dependencies**: Only includes necessary packages
5. **Nginx Gzip**: Compresses assets for faster delivery

## Monitoring & Debugging

### Deployment Monitoring
```bash
# View deployment logs
railway logs --service clinprecision-frontend

# Follow real-time logs
railway logs --service clinprecision-frontend --follow

# Check service status
railway status

# View resource usage
railway metrics
```

### Health Checks
The Dockerfile includes health checks:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1
```

### Common Debugging Commands
```bash
# Check environment variables
railway variables --service clinprecision-frontend

# Restart service
railway service restart --service clinprecision-frontend

# View build logs
railway logs --service clinprecision-frontend --tail 100

# Connect to running container (if needed)
railway shell --service clinprecision-frontend
```

## Performance Optimization

### Build Performance
```bash
# Disable source maps for production
railway variables set GENERATE_SOURCEMAP=false

# Optimize bundle analysis
npm install --save-dev webpack-bundle-analyzer
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```

### Runtime Performance
1. **Code Splitting**: React.lazy() for route-based splitting
2. **Asset Optimization**: Webpack optimization in react-scripts
3. **Caching Strategy**: Long-term caching for static assets
4. **CDN Ready**: Optimized for CDN deployment

## Security Configuration

### Environment Security
```bash
# Never expose sensitive data in REACT_APP_ variables
# These are public in the browser bundle!

# Safe environment variables:
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# NEVER do this:
# REACT_APP_SECRET_KEY=xxx (This will be visible to users!)
```

### Nginx Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## Custom Domain Setup

### DNS Configuration
1. **CNAME Record**: Point your domain to Railway
2. **SSL Certificate**: Automatically provided by Railway
3. **Domain Verification**: Follow Railway's verification process

```bash
# Add custom domain
railway domain add www.clinprecision.com

# Check domain status
railway domain list

# Remove domain if needed
railway domain remove www.clinprecision.com
```

## Scaling & Resource Management

### Horizontal Scaling
```bash
# Scale replicas (Railway Pro required)
railway service scale --replicas 3

# Resource allocation
railway service update --memory 512 --cpu 500
```

### Resource Monitoring
```bash
# Monitor resource usage
railway metrics --service clinprecision-frontend

# Check costs
railway billing
```

## Troubleshooting

### Common Issues & Solutions

#### 1. Build Failures
```bash
# Check Node.js version compatibility
railway variables set NODE_VERSION=20

# Clear build cache
railway service restart --service clinprecision-frontend

# Increase build timeout
railway variables set BUILD_TIMEOUT=600
```

#### 2. Runtime Errors
```bash
# Check nginx configuration
railway logs --service clinprecision-frontend | grep nginx

# Verify environment variables
railway variables --service clinprecision-frontend

# Test API connectivity
curl -f https://your-frontend.railway.app/api/health
```

#### 3. API Connection Issues
```bash
# Verify API Gateway URL
railway variables get REACT_APP_API_URL

# Check CORS configuration in backend
# Ensure API Gateway allows frontend domain

# Test direct API access
curl -H "Origin: https://your-frontend.railway.app" \
     https://your-api-gateway.railway.app/studies
```

#### 4. Routing Issues
```bash
# Verify nginx.conf has proper React Router support
cat nginx.conf | grep "try_files"

# Should include: try_files $uri $uri/ /index.html;
```

### Debug Mode
```bash
# Enable debug logging
railway variables set REACT_APP_DEBUG_MODE=true
railway variables set NODE_ENV=development

# View detailed logs
railway logs --service clinprecision-frontend --follow
```

## Production Checklist

### Pre-Deployment
- [ ] Build successful locally: `npm run build`
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Domain/SSL configured
- [ ] nginx.conf optimized

### Post-Deployment
- [ ] Application loads correctly
- [ ] All routes work (React Router)
- [ ] API calls successful
- [ ] Static assets load
- [ ] Performance acceptable
- [ ] Error boundaries working

### Security Review
- [ ] No sensitive data in environment variables
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Content Security Policy implemented

## Continuous Deployment

### Git Integration
```bash
# Connect to GitHub repository
railway service connect --repo github.com/sarkarn/clinprecision

# Auto-deploy on push
railway service update --branch main
```

### Deployment Triggers
- **Automatic**: Deploy on Git push to main branch
- **Manual**: Deploy via CLI `railway up`
- **API**: Deploy via Railway API

## Cost Optimization

### Resource Right-Sizing
```bash
# Monitor actual usage
railway metrics --service clinprecision-frontend

# Adjust resources based on usage
railway service update --memory 256 --cpu 250

# Use appropriate plan
railway billing # Check current plan
```

### Best Practices
1. **Static Asset CDN**: Consider external CDN for large assets
2. **Image Optimization**: Optimize images before build
3. **Bundle Analysis**: Regular bundle size monitoring
4. **Caching Strategy**: Implement proper browser caching

## Support & Maintenance

### Regular Maintenance
```bash
# Update dependencies
npm audit
npm update

# Rebuild and redeploy
npm run build
railway up

# Monitor performance
railway metrics --service clinprecision-frontend
```

### Getting Help
- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Support**: support@railway.app

## Advanced Configuration

### Custom Build Process
```dockerfile
# Custom Dockerfile modifications
FROM node:20-alpine AS build
WORKDIR /app

# Custom build steps
RUN npm install -g @angular/cli  # If needed
COPY package*.json ./
RUN npm ci --only=production

# Custom optimizations
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build -- --optimization

# Custom nginx configuration
COPY custom-nginx.conf /etc/nginx/nginx.conf
```

### Environment-Specific Builds
```bash
# Staging environment
railway variables set REACT_APP_API_URL=https://staging-api.railway.app
railway variables set REACT_APP_ENVIRONMENT=staging

# Production environment  
railway variables set REACT_APP_API_URL=https://api.clinprecision.com
railway variables set REACT_APP_ENVIRONMENT=production
```

This comprehensive guide covers all aspects of deploying your ClinPrecision React frontend to Railway, from basic deployment to advanced optimization and troubleshooting.