# Railway Frontend Deployment Script for ClinPrecision (PowerShell)
# This script automates the deployment of the React frontend to Railway

param(
    [string]$ServiceName = "clinprecision-frontend",
    [string]$ApiUrl = "",
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Starting ClinPrecision Frontend Deployment to Railway" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Check if logged in to Railway
try {
    railway whoami | Out-Null
    Write-Host "✅ Logged in to Railway" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Railway first:" -ForegroundColor Yellow
    railway login
}

# Navigate to frontend directory
try {
    Set-Location "frontend\clinprecision"
    Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Blue
} catch {
    Write-Host "❌ Frontend directory not found" -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in current directory" -ForegroundColor Red
    exit 1
}

# Check if Dockerfile exists
if (-not (Test-Path "Dockerfile")) {
    Write-Host "❌ Dockerfile not found. Please ensure Dockerfile is present." -ForegroundColor Red
    exit 1
}

# Test build locally first (unless skipped)
if (-not $SkipBuild) {
    Write-Host "🔨 Testing local build..." -ForegroundColor Yellow
    npm install
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Local build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Local build failed. Please fix build errors before deploying." -ForegroundColor Red
        exit 1
    }
}

# Check if service exists or create new one
Write-Host "🔍 Checking Railway service..." -ForegroundColor Yellow

try {
    $status = railway status 2>$null
    Write-Host "✅ Railway service found" -ForegroundColor Green
} catch {
    Write-Host "📝 Creating new Railway service..." -ForegroundColor Yellow
    if (-not $ServiceName) {
        $ServiceName = Read-Host "Enter service name (default: clinprecision-frontend)"
        if (-not $ServiceName) { $ServiceName = "clinprecision-frontend" }
    }
    railway service create --name $ServiceName
}

# Set up environment variables
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow

# Prompt for API Gateway URL if not provided
if (-not $ApiUrl) {
    $ApiUrl = Read-Host "Enter API Gateway URL (e.g., https://your-api-gateway.railway.app)"
    if (-not $ApiUrl) {
        Write-Host "❌ API Gateway URL is required" -ForegroundColor Red
        exit 1
    }
}

# Set essential environment variables
Write-Host "📝 Setting environment variables..." -ForegroundColor Blue
railway variables set REACT_APP_API_URL=$ApiUrl
railway variables set NODE_ENV=production
railway variables set GENERATE_SOURCEMAP=false
railway variables set BUILD_PATH=build
railway variables set CI=false
railway variables set REACT_APP_ENVIRONMENT=production
railway variables set REACT_APP_DEBUG_MODE=false

# Get version from package.json
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $appVersion = $packageJson.version
    railway variables set REACT_APP_APP_VERSION=$appVersion
    Write-Host "📦 App version set to: $appVersion" -ForegroundColor Blue
} catch {
    Write-Host "⚠️  Could not read version from package.json" -ForegroundColor Yellow
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green

# Deploy to Railway
Write-Host "🚢 Deploying to Railway..." -ForegroundColor Yellow
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Get deployment information
Write-Host ""
Write-Host "📊 Deployment Information:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
railway status

# Get domain information
Write-Host ""
Write-Host "🌐 Domain Information:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
railway domain list

# Show recent logs
Write-Host ""
Write-Host "📜 Recent Logs:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
railway logs --tail 20

Write-Host ""
Write-Host "🎉 Frontend deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test your application at the provided domain"
Write-Host "2. Configure custom domain if needed: railway domain add yourdomain.com"
Write-Host "3. Set up monitoring and alerts"
Write-Host "4. Update API Gateway CORS settings to allow your frontend domain"
Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "railway logs --follow          # Follow real-time logs"
Write-Host "railway domain generate        # Generate new Railway domain"
Write-Host "railway metrics               # View performance metrics"
Write-Host "railway service restart       # Restart the service"
Write-Host ""

# Return to original directory
Set-Location "..\..\"