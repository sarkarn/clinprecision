# Railway Frontend Quick Reference

## Essential Commands

### Initial Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and setup
railway login
cd frontend/clinprecision
railway service create --name clinprecision-frontend
```

### Environment Variables
```bash
# Required
railway variables set REACT_APP_API_URL=https://your-api-gateway.railway.app
railway variables set NODE_ENV=production
railway variables set GENERATE_SOURCEMAP=false

# Optional Performance
railway variables set BUILD_PATH=build
railway variables set CI=false
```

### Deployment
```bash
# Deploy
railway up

# Monitor
railway logs --follow

# Check status
railway status
```

### Domain Setup
```bash
# Generate Railway domain
railway domain generate

# Add custom domain
railway domain add yourdomain.com

# List domains
railway domain list
```

### Troubleshooting
```bash
# View logs
railway logs --service clinprecision-frontend

# Restart service
railway service restart

# Check variables
railway variables

# Resource usage
railway metrics
```

## File Checklist
- [ ] Dockerfile (multi-stage Node + Nginx)
- [ ] nginx.conf (React Router + API proxy)
- [ ] .dockerignore (build optimization)
- [ ] package.json (dependencies)
- [ ] Environment variables configured

## Common Issues
1. **Build fails**: Check Node version, clear cache
2. **Routes don't work**: Verify nginx React Router config
3. **API calls fail**: Check CORS, API URL, proxy config
4. **Assets don't load**: Verify build path, static file serving