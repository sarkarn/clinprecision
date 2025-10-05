# Script to update imports within moved DTO/Entity files
Write-Host "=== Updating Cross-References in Moved Files ===" -ForegroundColor Cyan

$dtoPath = "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\dto"
$entityPath = "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\entity"
$mapperPath = "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\mapper"

$allMovedFiles = @()
$allMovedFiles += Get-ChildItem -Path $dtoPath -Filter "*.java" -Recurse
$allMovedFiles += Get-ChildItem -Path $entityPath -Filter "*.java" -Recurse
$allMovedFiles += Get-ChildItem -Path $mapperPath -Filter "*.java" -Recurse | Where-Object { $_.Name -in @("FormDefinitionMapper.java", "StudyDocumentMapper.java", "VisitTypeConverter.java") }

$importReplacements = @{
    # DTO cross-references
    'import com\.clinprecision\.common\.dto\.clinops\.([A-Za-z]+);' = 'import com.clinprecision.clinopsservice.dto.$1;'
    
    # Entity cross-references
    'import com\.clinprecision\.common\.entity\.clinops\.([A-Za-z]+);' = 'import com.clinprecision.clinopsservice.entity.$1;'
    
    # Mapper cross-references
    'import com\.clinprecision\.common\.mapper\.clinops\.([A-Za-z]+);' = 'import com.clinprecision.clinopsservice.mapper.$1;'
}

$filesUpdated = 0

foreach ($file in $allMovedFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($pattern in $importReplacements.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $importReplacements[$pattern]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content $file.FullName -Value $content -NoNewline
        $filesUpdated++
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== Cross-Reference Updates Complete ===" -ForegroundColor Cyan
Write-Host "Files updated: $filesUpdated" -ForegroundColor Green
