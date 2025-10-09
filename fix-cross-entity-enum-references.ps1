# Fix enum references in CrossEntityStatusValidationService.java
# Replace ProtocolVersionEntity.VersionStatus with VersionStatus
# Replace ProtocolVersionEntity.AmendmentType with AmendmentType

$filePath = "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\service\CrossEntityStatusValidationService.java"

Write-Host "Fixing enum references in CrossEntityStatusValidationService..." -ForegroundColor Cyan

$content = Get-Content $filePath -Raw

# Count occurrences before
$versionStatusCount = ([regex]::Matches($content, "ProtocolVersionEntity\.VersionStatus")).Count
$amendmentTypeCount = ([regex]::Matches($content, "ProtocolVersionEntity\.AmendmentType")).Count

Write-Host "Found $versionStatusCount occurrences of 'ProtocolVersionEntity.VersionStatus'" -ForegroundColor Yellow
Write-Host "Found $amendmentTypeCount occurrences of 'ProtocolVersionEntity.AmendmentType'" -ForegroundColor Yellow

# Replace ProtocolVersionEntity.VersionStatus with VersionStatus
$content = $content -replace 'ProtocolVersionEntity\.VersionStatus', 'VersionStatus'

# Replace ProtocolVersionEntity.AmendmentType with AmendmentType
$content = $content -replace 'ProtocolVersionEntity\.AmendmentType', 'AmendmentType'

# Write back
$content | Set-Content $filePath -NoNewline

Write-Host "✅ Enum references fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes:" -ForegroundColor Cyan
Write-Host "  - Replaced 'ProtocolVersionEntity.VersionStatus' → 'VersionStatus'" -ForegroundColor White
Write-Host "  - Replaced 'ProtocolVersionEntity.AmendmentType' → 'AmendmentType'" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run 'mvn clean compile' to verify" -ForegroundColor Yellow
