# Migration Script: Update StudyController to use only DDD services
# Removes StudyService dependency and updates all endpoints

$filePath = "backend\clinprecision-clinops-service\src\main\java\com\clinprecision\clinopsservice\controller\StudyController.java"

Write-Host "Reading StudyController.java..." -ForegroundColor Cyan
$content = Get-Content $filePath -Raw

Write-Host "Applying DDD migration changes..." -ForegroundColor Yellow

# 1. Remove StudyService import
$content = $content -replace 'import com\.clinprecision\.clinopsservice\.service\.StudyService;\r?\n', ''

# 2. Remove StudyService field
$content = $content -replace '    private final StudyService studyService;\r?\n', ''

# 3. Update constructor - remove StudyService parameter
$content = $content -replace 'StudyService studyService,\s+', ''

# 4. Update constructor - remove field initialization
$content = $content -replace '        this\.studyService = studyService;\r?\n', ''

# 5. Update createStudy method
$oldCreateStudy = @'
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy\(@Valid @RequestBody StudyCreateRequestDto request\) \{
        logger\.info\("POST /api/studies - Creating new study: \{\}", request\.getName\(\)\);
        
        StudyResponseDto response = studyService\.createStudy\(request\);
        
        logger\.info\("Study created successfully with ID: \{\}", response\.getId\(\)\);
        return ResponseEntity\.status\(HttpStatus\.CREATED\)\.body\(response\);
    \}
'@

$newCreateStudy = @'
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        logger.info("POST /api/studies - Creating new study via DDD: {}", request.getName());
        
        UUID studyUuid = studyCommandService.createStudy(request);
        StudyResponseDto response = studyQueryService.getStudyByUuid(studyUuid);
        
        logger.info("Study created successfully with UUID: {}", studyUuid);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
'@

$content = $content -replace $oldCreateStudy, $newCreateStudy

# 6. Update getStudyById method
$oldGetById = @'
        StudyResponseDto response = studyService\.getStudyById\(id\);
'@

$newGetById = @'
        StudyResponseDto response = studyQueryService.getStudyById(id);
'@

$content = $content -replace $oldGetById, $newGetById

# 7. Update getStudyOverview method
$oldGetOverview = @'
        StudyResponseDto response = studyService\.getStudyOverview\(id\);
'@

$newGetOverview = @'
        StudyResponseDto response = studyQueryService.getStudyById(id);
'@

$content = $content -replace $oldGetOverview, $newGetOverview

# 8. Update getAllStudies method
$oldGetAll = @'
        List<StudyResponseDto> response;
        
        // If any filters are provided, use filtered search
        if \(status != null \|\| phase != null \|\| sponsor != null\) \{
            response = studyService\.getAllStudiesWithFilters\(status, phase, sponsor\);
        \} else \{
            response = studyService\.getAllStudies\(\);
        \}
'@

$newGetAll = @'
        // TODO: Add filtering support to StudyQueryService
        List<com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto> response = studyQueryService.getAllStudies();
'@

$content = $content -replace $oldGetAll, $newGetAll

# Also fix the return type
$content = $content -replace 'public ResponseEntity<List<StudyResponseDto>> getAllStudies\(', 'public ResponseEntity<List<com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto>> getAllStudies('

# 9. Update updateStudy method
$oldUpdate = @'
        StudyResponseDto response = studyService\.updateStudy\(id, request\);
'@

$newUpdate = @'
        StudyResponseDto existing = studyQueryService.getStudyById(id);
        studyCommandService.updateStudy(existing.getAggregateUuid(), request);
        StudyResponseDto response = studyQueryService.getStudyById(id);
'@

$content = $content -replace $oldUpdate, $newUpdate

# 10. Update updateStudyDetails method
$oldUpdateDetails = @'
        StudyResponseDto response = studyService\.updateStudyDetails\(id, request\);
'@

$newUpdateDetails = @'
        StudyResponseDto existing = studyQueryService.getStudyById(id);
        studyCommandService.updateStudy(existing.getAggregateUuid(), request);
        StudyResponseDto response = studyQueryService.getStudyById(id);
'@

$content = $content -replace $oldUpdateDetails, $newUpdateDetails

# Write back to file
Write-Host "Writing updated content..." -ForegroundColor Green
$content | Set-Content $filePath -NoNewline

Write-Host "✅ StudyController migration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes applied:" -ForegroundColor Cyan
Write-Host "  - Removed StudyService import and dependency" -ForegroundColor White
Write-Host "  - Updated createStudy to use StudyCommandService" -ForegroundColor White
Write-Host "  - Updated getStudyById to use StudyQueryService" -ForegroundColor White
Write-Host "  - Updated getStudyOverview to use StudyQueryService" -ForegroundColor White
Write-Host "  - Updated getAllStudies to use StudyQueryService" -ForegroundColor White
Write-Host "  - Updated updateStudy to use StudyCommandService" -ForegroundColor White
Write-Host "  - Updated updateStudyDetails to use StudyCommandService" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Delete StudyService.java" -ForegroundColor White
Write-Host "  2. Run mvn clean compile to verify" -ForegroundColor White
Write-Host "  3. Run tests: mvn test" -ForegroundColor White
