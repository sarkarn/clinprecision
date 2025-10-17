# Study Build Diagnostic Script
# Run this in PowerShell to quickly diagnose why study build is stuck

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Study Build Diagnostic Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check 1: Is clinops-service running?
Write-Host "1. Checking if clinops-service is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -ErrorAction Stop
    Write-Host "   ✓ Clinops-service is UP" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Clinops-service is NOT reachable" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ACTION: Start the clinops-service" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check 2: Get recent builds
Write-Host "2. Checking recent study builds..." -ForegroundColor Yellow
try {
    $builds = Invoke-RestMethod -Uri "http://localhost:8081/api/studies/database/builds/recent?days=30" -ErrorAction Stop
    
    if ($builds -and $builds.Count -gt 0) {
        Write-Host "   Found $($builds.Count) recent build(s)" -ForegroundColor Green
        
        # Show the most recent build
        $latestBuild = $builds[0]
        Write-Host ""
        Write-Host "   Latest Build:" -ForegroundColor Cyan
        Write-Host "   - Build ID: $($latestBuild.buildId)" -ForegroundColor White
        Write-Host "   - Study ID: $($latestBuild.studyId)" -ForegroundColor White
        Write-Host "   - Status: $($latestBuild.buildStatus)" -ForegroundColor $(if ($latestBuild.buildStatus -eq "COMPLETED") { "Green" } elseif ($latestBuild.buildStatus -eq "FAILED") { "Red" } else { "Yellow" })
        Write-Host "   - Progress: $($latestBuild.buildProgress)%" -ForegroundColor White
        Write-Host "   - Phase: $($latestBuild.phaseNumber)" -ForegroundColor White
        Write-Host "   - Started: $($latestBuild.buildStartedAt)" -ForegroundColor White
        
        if ($latestBuild.buildStatus -eq "IN_PROGRESS") {
            Write-Host ""
            Write-Host "   ⚠ BUILD IS STUCK IN PROGRESS!" -ForegroundColor Red
            Write-Host "   Started at: $($latestBuild.buildStartedAt)" -ForegroundColor Yellow
            
            # Calculate how long it's been running
            $startTime = [DateTime]::Parse($latestBuild.buildStartedAt)
            $elapsed = (Get-Date) - $startTime
            Write-Host "   Running for: $([int]$elapsed.TotalMinutes) minutes" -ForegroundColor Yellow
            
            if ($elapsed.TotalMinutes -gt 5) {
                Write-Host ""
                Write-Host "   ACTION REQUIRED:" -ForegroundColor Red
                Write-Host "   Build has been running for >5 minutes. This is abnormal." -ForegroundColor Red
                Write-Host "   Normal build time: 5-10 seconds" -ForegroundColor Red
                Write-Host ""
                Write-Host "   Recommended actions:" -ForegroundColor Yellow
                Write-Host "   1. Check clinops-service logs for errors" -ForegroundColor Yellow
                Write-Host "   2. Check database with: check_build_status.sql" -ForegroundColor Yellow
                Write-Host "   3. Restart clinops-service" -ForegroundColor Yellow
                Write-Host "   4. See: STUDY_BUILD_STUCK_TROUBLESHOOTING.md" -ForegroundColor Yellow
            }
        } elseif ($latestBuild.buildStatus -eq "FAILED") {
            Write-Host ""
            Write-Host "   ✗ BUILD FAILED" -ForegroundColor Red
            if ($latestBuild.errorMessage) {
                Write-Host "   Error: $($latestBuild.errorMessage)" -ForegroundColor Red
            }
        } elseif ($latestBuild.buildStatus -eq "COMPLETED") {
            Write-Host ""
            Write-Host "   ✓ BUILD COMPLETED SUCCESSFULLY" -ForegroundColor Green
            Write-Host "   Completed at: $($latestBuild.buildCompletedAt)" -ForegroundColor Green
        }
    } else {
        Write-Host "   No builds found in last 30 days" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Failed to fetch builds" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Check 3: Look for worker service logs
Write-Host "3. Checking for worker service logs..." -ForegroundColor Yellow

$logPaths = @(
    "backend\clinprecision-clinops-service\logs\clinops-service.log",
    "backend\clinprecision-clinops-service\logs\spring.log",
    "backend\clinprecision-clinops-service\clinops-service.log"
)

$logFound = $false
foreach ($logPath in $logPaths) {
    if (Test-Path $logPath) {
        Write-Host "   Found log file: $logPath" -ForegroundColor Green
        $logFound = $true
        
        # Search for worker service messages
        Write-Host "   Searching for worker service activity..." -ForegroundColor Yellow
        
        $workerLogs = Select-String -Path $logPath -Pattern "Worker received StudyDatabaseBuildStartedEvent" -SimpleMatch | Select-Object -Last 5
        
        if ($workerLogs) {
            Write-Host "   ✓ Worker service IS processing events" -ForegroundColor Green
            Write-Host "   Recent worker activity:" -ForegroundColor Cyan
            $workerLogs | ForEach-Object { Write-Host "   $($_.Line)" -ForegroundColor White }
        } else {
            Write-Host "   ✗ NO worker service activity found in logs" -ForegroundColor Red
            Write-Host "   This means the event handler is NOT being triggered!" -ForegroundColor Red
            Write-Host ""
            Write-Host "   Possible causes:" -ForegroundColor Yellow
            Write-Host "   - Axon event bus not configured" -ForegroundColor Yellow
            Write-Host "   - @EventHandler annotation missing" -ForegroundColor Yellow
            Write-Host "   - Worker service bean not created" -ForegroundColor Yellow
            Write-Host "   - Event processor not subscribed" -ForegroundColor Yellow
        }
        
        # Check for errors
        Write-Host ""
        Write-Host "   Checking for recent errors..." -ForegroundColor Yellow
        $errors = Select-String -Path $logPath -Pattern "ERROR|FAILED|Exception" | Select-Object -Last 10
        
        if ($errors) {
            Write-Host "   Found recent errors:" -ForegroundColor Red
            $errors | ForEach-Object { Write-Host "   $($_.Line)" -ForegroundColor Red }
        } else {
            Write-Host "   No errors found in recent logs" -ForegroundColor Green
        }
        
        break
    }
}

if (-not $logFound) {
    Write-Host "   ✗ No log files found" -ForegroundColor Red
    Write-Host "   Checked paths:" -ForegroundColor Yellow
    $logPaths | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "   ACTION: Check where clinops-service is writing logs" -ForegroundColor Yellow
}
Write-Host ""

# Check 4: Database connection
Write-Host "4. Checking database connectivity..." -ForegroundColor Yellow
# Note: This requires MySQL client to be installed
# For now, just show instructions

Write-Host "   Run this SQL to check database:" -ForegroundColor Cyan
Write-Host "   mysql -h localhost -u root -p clinprecisiondb" -ForegroundColor White
Write-Host "   Then execute the queries from check_build_status.sql" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($builds -and $builds[0].buildStatus -eq "IN_PROGRESS") {
    Write-Host "⚠ ISSUE DETECTED: Build is stuck" -ForegroundColor Red
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Read: STUDY_BUILD_STUCK_TROUBLESHOOTING.md" -ForegroundColor Yellow
    Write-Host "2. Run: backend\check_build_status.sql in MySQL" -ForegroundColor Yellow
    Write-Host "3. Enable debug logging in application.yml" -ForegroundColor Yellow
    Write-Host "4. Restart clinops-service" -ForegroundColor Yellow
} else {
    Write-Host "✓ No obvious issues detected" -ForegroundColor Green
    Write-Host ""
    Write-Host "If build is still not working:" -ForegroundColor Yellow
    Write-Host "1. Check the troubleshooting guide: STUDY_BUILD_STUCK_TROUBLESHOOTING.md" -ForegroundColor Yellow
    Write-Host "2. Review clinops-service logs for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
