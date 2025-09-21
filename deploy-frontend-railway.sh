#!/bin/bash

# Railway Frontend Deployment Script for ClinPrecision
# This script automates the deployment of the React frontend to Railway

set -e  # Exit on any error

echo "🚀 Starting ClinPrecision Frontend Deployment to Railway"
echo "============================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

# Navigate to frontend directory
cd frontend/clinprecision || { echo "❌ Frontend directory not found"; exit 1; }

echo "📁 Current directory: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in current directory"
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found. Please ensure Dockerfile is present."
    exit 1
fi

# Test build locally first
echo "🔨 Testing local build..."
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed. Please fix build errors before deploying."
    exit 1
fi

# Check if service exists or create new one
echo "🔍 Checking Railway service..."

if railway status &> /dev/null; then
    echo "✅ Railway service found"
    SERVICE_NAME=$(railway status --json | jq -r '.service.name')
    echo "📋 Service name: $SERVICE_NAME"
else
    echo "📝 Creating new Railway service..."
    read -p "Enter service name (default: clinprecision-frontend): " SERVICE_NAME
    SERVICE_NAME=${SERVICE_NAME:-clinprecision-frontend}
    railway service create --name "$SERVICE_NAME"
fi

# Set up environment variables
echo "⚙️  Setting up environment variables..."

# Prompt for API Gateway URL
read -p "Enter API Gateway URL (e.g., https://your-api-gateway.railway.app): " API_URL
if [ -z "$API_URL" ]; then
    echo "❌ API Gateway URL is required"
    exit 1
fi

# Set essential environment variables
echo "📝 Setting environment variables..."
railway variables set REACT_APP_API_URL="$API_URL"
railway variables set NODE_ENV=production
railway variables set GENERATE_SOURCEMAP=false
railway variables set BUILD_PATH=build
railway variables set CI=false
railway variables set REACT_APP_ENVIRONMENT=production
railway variables set REACT_APP_DEBUG_MODE=false

# Optional: Set version
APP_VERSION=$(node -p "require('./package.json').version")
railway variables set REACT_APP_APP_VERSION="$APP_VERSION"

echo "✅ Environment variables configured"

# Deploy to Railway
echo "🚢 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed"
    exit 1
fi

# Get deployment information
echo "📊 Deployment Information:"
echo "========================="
railway status

# Get domain information
echo "🌐 Domain Information:"
echo "====================="
railway domain list

# Show logs
echo "📜 Recent Logs:"
echo "==============="
railway logs --tail 20

echo ""
echo "🎉 Frontend deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Test your application at the provided domain"
echo "2. Configure custom domain if needed: railway domain add yourdomain.com"
echo "3. Set up monitoring and alerts"
echo "4. Update API Gateway CORS settings to allow your frontend domain"
echo ""
echo "🔗 Useful Commands:"
echo "railway logs --follow          # Follow real-time logs"
echo "railway domain generate        # Generate new Railway domain"
echo "railway metrics               # View performance metrics"
echo "railway service restart       # Restart the service"
echo ""