# Quick Rebuild Script for Windows PowerShell
# Run this to rebuild both common-lib and clinops-service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rebuilding ClinPrecision Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to common-lib
Write-Host "[1/2] Building clinprecision-common-lib..." -ForegroundColor Yellow
Set-Location "c:\nnsproject\clinprecision\backend\clinprecision-common-lib"
mvn clean install -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ common-lib built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ common-lib build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Navigate to clinops-service
Write-Host "[2/2] Building clinprecision-clinops-service..." -ForegroundColor Yellow
Set-Location "c:\nnsproject\clinprecision\backend\clinprecision-clinops-service"
mvn clean install -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ clinops-service built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ clinops-service build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart clinops-service (port 8085)" -ForegroundColor White
Write-Host "2. Create a new study with PLANNING status" -ForegroundColor White
Write-Host "3. Create protocol version v1.0" -ForegroundColor White
Write-Host "4. Check logs for:" -ForegroundColor White
Write-Host "   🔵 @PreUpdate messages" -ForegroundColor Cyan
Write-Host "   🚨 CRITICAL alerts with stack trace" -ForegroundColor Red
Write-Host ""
