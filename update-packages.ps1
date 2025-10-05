# Script to update package declarations in moved files
Write-Host "=== Updating Package Declarations ===" -ForegroundColor Cyan

# Update DTOs
Write-Host "`nUpdating DTOs..." -ForegroundColor Yellow
$dtoFiles = Get-ChildItem -Path "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\dto" -Filter "*.java" -Recurse
foreach ($file in $dtoFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'package com\.clinprecision\.common\.dto\.clinops;', 'package com.clinprecision.clinopsservice.dto;'
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
}

# Update Entities
Write-Host "`nUpdating Entities..." -ForegroundColor Yellow
$entityFiles = Get-ChildItem -Path "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\entity" -Filter "*.java" -Recurse
foreach ($file in $entityFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'package com\.clinprecision\.common\.entity\.clinops;', 'package com.clinprecision.clinopsservice.entity;'
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
}

# Update Mappers
Write-Host "`nUpdating Mappers..." -ForegroundColor Yellow
$mapperFiles = Get-ChildItem -Path "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\mapper" -Filter "*Mapper.java" -Recurse | Where-Object { $_.Name -like "*FormDefinitionMapper*" -or $_.Name -like "*StudyDocumentMapper*" -or $_.Name -like "*VisitTypeConverter*" }
foreach ($file in $mapperFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'package com\.clinprecision\.common\.mapper\.clinops;', 'package com.clinprecision.clinopsservice.mapper;'
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
}

Write-Host "`n=== Package Declarations Updated ===" -ForegroundColor Cyan
Write-Host "Total files updated: $($dtoFiles.Count + $entityFiles.Count + $mapperFiles.Count)" -ForegroundColor Green
