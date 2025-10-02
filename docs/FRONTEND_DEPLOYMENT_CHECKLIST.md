# Frontend Deployment Checklist for Railway

## Pre-Deployment Checklist

### ✅ Development Environment
- [ ] Node.js version 18+ installed
- [ ] npm/yarn working correctly
- [ ] All dependencies up to date: `npm audit fix`
- [ ] Local development server runs: `npm start`
- [ ] Local build completes successfully: `npm run build`
- [ ] No TypeScript/ESLint errors: `npm run lint` (if configured)

### ✅ Project Structure
- [ ] `Dockerfile` present in `frontend/clinprecision/`
- [ ] `nginx.conf` present in `frontend/clinprecision/`
- [ ] `.dockerignore` present in `frontend/clinprecision/`
- [ ] `package.json` has correct scripts and dependencies
- [ ] All source files in `src/` directory
- [ ] Public assets in `public/` directory

### ✅ Configuration Files
- [ ] `Dockerfile` uses multi-stage build (Node + Nginx)
- [ ] `nginx.conf` includes React Router support (`try_files $uri $uri/ /index.html`)
- [ ] `nginx.conf` includes API proxy configuration
- [ ] `.dockerignore` excludes unnecessary files (node_modules, .git, etc.)

### ✅ Environment Variables
- [ ] `REACT_APP_API_URL` configured for production API Gateway
- [ ] `NODE_ENV=production` set
- [ ] `GENERATE_SOURCEMAP=false` for security
- [ ] No sensitive data in `REACT_APP_*` variables (they're public!)
- [ ] All required environment variables documented

### ✅ API Integration
- [ ] API Gateway URL accessible from production
- [ ] CORS configured on backend to allow frontend domain
- [ ] All API endpoints working correctly
- [ ] Authentication/authorization working
- [ ] Error handling implemented for API failures

### ✅ Railway Setup
- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] Logged in to Railway: `railway login`
- [ ] Railway project created or selected
- [ ] Service name decided (e.g., `clinprecision-frontend`)

### ✅ Performance Optimization
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized and compressed
- [ ] Lazy loading implemented for routes
- [ ] Code splitting configured
- [ ] Unused dependencies removed

### ✅ Security Review
- [ ] No hardcoded secrets or API keys
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] XSS protection enabled
- [ ] Secure headers configured in nginx

### ✅ Testing
- [ ] Unit tests passing: `npm test`
- [ ] Integration tests completed
- [ ] Cross-browser testing done
- [ ] Mobile responsive design verified
- [ ] Accessibility requirements met

## Deployment Steps

### 1. Environment Setup
```bash
# Navigate to frontend directory
cd frontend/clinprecision

# Set Railway environment variables
railway variables set REACT_APP_API_URL=https://your-api-gateway.railway.app
railway variables set NODE_ENV=production
railway variables set GENERATE_SOURCEMAP=false
```

### 2. Pre-Deployment Test
```bash
# Test build locally
npm install
npm run build

# Test Docker build (optional)
docker build -t clinprecision-frontend .
docker run -p 3000:3000 clinprecision-frontend
```

### 3. Deploy
```bash
# Deploy to Railway
railway up

# Monitor deployment
railway logs --follow
```

### 4. Post-Deployment Verification
```bash
# Check service status
railway status

# View domain
railway domain list

# Test application
curl -f https://your-frontend.railway.app
```

## Post-Deployment Checklist

### ✅ Functional Testing
- [ ] Application loads at Railway domain
- [ ] All routes work correctly (React Router)
- [ ] API calls successful
- [ ] Authentication flow working
- [ ] All features functional
- [ ] Error pages display correctly

### ✅ Performance Testing
- [ ] Page load times acceptable
- [ ] Bundle size reasonable
- [ ] Static assets cached properly
- [ ] API response times good
- [ ] Mobile performance acceptable

### ✅ Security Verification
- [ ] HTTPS certificate active
- [ ] Security headers present
- [ ] No sensitive data exposed
- [ ] CORS working correctly
- [ ] Content Security Policy active

### ✅ Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Log aggregation working
- [ ] Alerting configured
- [ ] Uptime monitoring setup

### ✅ Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Team access configured
- [ ] Rollback procedure defined

## Common Issues & Solutions

### Build Failures
- ❌ **Issue**: `npm ci` fails
- ✅ **Solution**: Check Node.js version, clear cache, update package-lock.json

### Runtime Errors
- ❌ **Issue**: White screen, React app not loading
- ✅ **Solution**: Check console errors, verify build files, check nginx config

### API Connection Issues
- ❌ **Issue**: API calls returning CORS errors
- ✅ **Solution**: Update backend CORS settings to allow frontend domain

### Routing Problems
- ❌ **Issue**: Direct URL access returns 404
- ✅ **Solution**: Ensure nginx.conf has `try_files $uri $uri/ /index.html;`

## Emergency Procedures

### Rollback
```bash
# Rollback to previous deployment
railway rollback

# Or redeploy from specific commit
git checkout <previous-commit>
railway up
```

### Quick Fixes
```bash
# Update environment variable
railway variables set REACT_APP_API_URL=https://new-api-url.railway.app

# Restart service
railway service restart

# Force rebuild
railway up --force
```

### Support Contacts
- Railway Support: https://discord.gg/railway
- Development Team: [Your team contact]
- Emergency Contact: [Emergency contact]