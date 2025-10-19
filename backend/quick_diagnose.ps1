# Quick Study Build Diagnostic
$ErrorActionPreference = "Continue"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Study Build Quick Diagnostic" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Check if service is running
Write-Host "[1] Checking clinops-service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "    ✓ Service is UP" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Service is DOWN or not reachable" -ForegroundColor Red
    Write-Host "    Start the service first!" -ForegroundColor Yellow
    exit
}

# 2. Check recent builds
Write-Host "`n[2] Checking recent builds..." -ForegroundColor Yellow
try {
    $builds = Invoke-RestMethod -Uri "http://localhost:8081/api/studies/database/builds/recent?days=1" -ErrorAction Stop
    
    if ($builds -and $builds.Count -gt 0) {
        $latest = $builds[0]
        Write-Host "    Latest Build:" -ForegroundColor Cyan
        Write-Host "    - Build ID: $($latest.buildId)" -ForegroundColor White
        Write-Host "    - Study ID: $($latest.studyId)" -ForegroundColor White
        Write-Host "    - Status: $($latest.buildStatus)" -ForegroundColor White
        Write-Host "    - Progress: $($latest.buildProgress)%" -ForegroundColor White
        Write-Host "    - Started: $($latest.buildStartedAt)" -ForegroundColor White
        
        if ($latest.buildStatus -eq "IN_PROGRESS") {
            $start = [DateTime]::Parse($latest.buildStartedAt)
            $elapsed = (Get-Date) - $start
            Write-Host "`n    ⚠️  BUILD IS STUCK!" -ForegroundColor Red
            Write-Host "    Running for: $([math]::Round($elapsed.TotalMinutes, 1)) minutes" -ForegroundColor Yellow
            Write-Host "    Expected: 5-10 seconds" -ForegroundColor Yellow
        }
    } else {
        Write-Host "    No recent builds found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "    ✗ Failed to fetch builds: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Check for log files
Write-Host "`n[3] Looking for log files..." -ForegroundColor Yellow
$logPaths = @(
    "clinprecision-clinops-service\logs\clinops-service.log",
    "clinprecision-clinops-service\logs\spring.log",
    "..\logs\clinops-service.log"
)

$foundLog = $null
foreach ($path in $logPaths) {
    if (Test-Path $path) {
        $foundLog = $path
        Write-Host "    ✓ Found log: $path" -ForegroundColor Green
        break
    }
}

if ($foundLog) {
    Write-Host "`n[4] Checking for worker service logs..." -ForegroundColor Yellow
    $workerLogs = Select-String -Path $foundLog -Pattern "Worker received StudyDatabaseBuildStartedEvent" -ErrorAction SilentlyContinue | Select-Object -Last 3
    
    if ($workerLogs) {
        Write-Host "    ✓ Worker IS processing events:" -ForegroundColor Green
        $workerLogs | ForEach-Object { Write-Host "      $($_.Line)" -ForegroundColor Gray }
    } else {
        Write-Host "    ✗ NO worker service activity!" -ForegroundColor Red
        Write-Host "      Event handler is NOT being triggered" -ForegroundColor Red
    }
    
    Write-Host "`n[5] Recent errors..." -ForegroundColor Yellow
    $errors = Select-String -Path $foundLog -Pattern "ERROR|Exception" -ErrorAction SilentlyContinue | Select-Object -Last 5
    if ($errors) {
        $errors | ForEach-Object { Write-Host "      $($_.Line)" -ForegroundColor Red }
    } else {
        Write-Host "    No recent errors" -ForegroundColor Green
    }
} else {
    Write-Host "    ✗ No log files found in standard locations" -ForegroundColor Red
    Write-Host "    Checked:" -ForegroundColor Yellow
    $logPaths | ForEach-Object { Write-Host "      - $_" -ForegroundColor Gray }
}

# Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "1. Run SQL queries from: check_build_status.sql" -ForegroundColor Yellow
Write-Host "2. Read troubleshooting guide: STUDY_BUILD_STUCK_TROUBLESHOOTING.md" -ForegroundColor Yellow
Write-Host "3. Check if @EnableAsync is in ClinopsServiceApplication.java" -ForegroundColor Yellow
Write-Host "4. Restart clinops-service" -ForegroundColor Yellow
Write-Host ""
