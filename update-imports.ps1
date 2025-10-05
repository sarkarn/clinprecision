# Script to update all imports in clinops-service
Write-Host "=== Updating Imports in Clinops Service ===" -ForegroundColor Cyan

$clinopsServicePath = "backend\clinprecision-clinops-service\src\main\java"
$allJavaFiles = Get-ChildItem -Path $clinopsServicePath -Filter "*.java" -Recurse

$importReplacements = @{
    # DTO imports
    'import com\.clinprecision\.common\.dto\.clinops\.CreateCodeListRequest;' = 'import com.clinprecision.clinopsservice.dto.CreateCodeListRequest;'
    'import com\.clinprecision\.common\.dto\.clinops\.CreateFormTemplateDto;' = 'import com.clinprecision.clinopsservice.dto.CreateFormTemplateDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.DesignProgressDto;' = 'import com.clinprecision.clinopsservice.dto.DesignProgressDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.DesignProgressResponseDto;' = 'import com.clinprecision.clinopsservice.dto.DesignProgressResponseDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.DesignProgressUpdateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.DesignProgressUpdateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.FormDefinitionCreateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.FormDefinitionCreateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.FormDefinitionDto;' = 'import com.clinprecision.clinopsservice.dto.FormDefinitionDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.FormTemplateCreateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.FormTemplateCreateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.FormTemplateDto;' = 'import com.clinprecision.clinopsservice.dto.FormTemplateDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.OrganizationAssignmentDto;' = 'import com.clinprecision.clinopsservice.dto.OrganizationAssignmentDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.OrganizationStudyDto;' = 'import com.clinprecision.clinopsservice.dto.OrganizationStudyDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.RegulatoryStatusDto;' = 'import com.clinprecision.clinopsservice.dto.RegulatoryStatusDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyAmendmentDto;' = 'import com.clinprecision.clinopsservice.dto.StudyAmendmentDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyArmCreateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyArmCreateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyArmResponseDto;' = 'import com.clinprecision.clinopsservice.dto.StudyArmResponseDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyArmUpdateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyArmUpdateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyCreateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyCreateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyDashboardMetricsDto;' = 'import com.clinprecision.clinopsservice.dto.StudyDashboardMetricsDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyDocumentDto;' = 'import com.clinprecision.clinopsservice.dto.StudyDocumentDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyInterventionResponseDto;' = 'import com.clinprecision.clinopsservice.dto.StudyInterventionResponseDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyInterventionUpdateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyInterventionUpdateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyPhaseDto;' = 'import com.clinprecision.clinopsservice.dto.StudyPhaseDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyResponseDto;' = 'import com.clinprecision.clinopsservice.dto.StudyResponseDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyStatusDto;' = 'import com.clinprecision.clinopsservice.dto.StudyStatusDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyUpdateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyUpdateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyVersionCreateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyVersionCreateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyVersionDto;' = 'import com.clinprecision.clinopsservice.dto.StudyVersionDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.StudyVersionUpdateRequestDto;' = 'import com.clinprecision.clinopsservice.dto.StudyVersionUpdateRequestDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.UpdateCodeListRequest;' = 'import com.clinprecision.clinopsservice.dto.UpdateCodeListRequest;'
    'import com\.clinprecision\.common\.dto\.clinops\.UpdateFormTemplateDto;' = 'import com.clinprecision.clinopsservice.dto.UpdateFormTemplateDto;'
    'import com\.clinprecision\.common\.dto\.clinops\.VisitDefinitionDto;' = 'import com.clinprecision.clinopsservice.dto.VisitDefinitionDto;'
    
    # Wildcard DTO import
    'import com\.clinprecision\.common\.dto\.clinops\.\*;' = 'import com.clinprecision.clinopsservice.dto.*;'
    
    # Entity imports
    'import com\.clinprecision\.common\.entity\.clinops\.DesignProgressEntity;' = 'import com.clinprecision.clinopsservice.entity.DesignProgressEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.FormDefinitionEntity;' = 'import com.clinprecision.clinopsservice.entity.FormDefinitionEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.FormTemplateEntity;' = 'import com.clinprecision.clinopsservice.entity.FormTemplateEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.InterventionType;' = 'import com.clinprecision.clinopsservice.entity.InterventionType;'
    'import com\.clinprecision\.common\.entity\.clinops\.OrganizationRole;' = 'import com.clinprecision.clinopsservice.entity.OrganizationRole;'
    'import com\.clinprecision\.common\.entity\.clinops\.OrganizationStudyEntity;' = 'import com.clinprecision.clinopsservice.entity.OrganizationStudyEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.RegulatoryStatusEntity;' = 'import com.clinprecision.clinopsservice.entity.RegulatoryStatusEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyAmendmentEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyAmendmentEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyArmEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyArmEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyArmType;' = 'import com.clinprecision.clinopsservice.entity.StudyArmType;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyDocumentAuditEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyDocumentAuditEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyDocumentEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyDocumentEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyInterventionEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyInterventionEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyPhaseEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyPhaseEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyStatus;' = 'import com.clinprecision.clinopsservice.entity.StudyStatus;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyStatusEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyStatusEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyVersionEntity;' = 'import com.clinprecision.clinopsservice.entity.StudyVersionEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.VisitDefinitionEntity;' = 'import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;'
    'import com\.clinprecision\.common\.entity\.clinops\.VisitFormEntity;' = 'import com.clinprecision.clinopsservice.entity.VisitFormEntity;'
    
    # Wildcard entity import
    'import com\.clinprecision\.common\.entity\.clinops\.\*;' = 'import com.clinprecision.clinopsservice.entity.*;'
    
    # Nested class imports (e.g., StudyDocumentEntity.DocumentStatus)
    'import com\.clinprecision\.common\.entity\.clinops\.StudyDocumentEntity\.DocumentStatus;' = 'import com.clinprecision.clinopsservice.entity.StudyDocumentEntity.DocumentStatus;'
    'import com\.clinprecision\.common\.entity\.clinops\.StudyEntity\.StudyPhase;' = 'import com.clinprecision.clinopsservice.entity.StudyEntity.StudyPhase;'
    
    # Mapper imports
    'import com\.clinprecision\.common\.mapper\.clinops\.FormDefinitionMapper;' = 'import com.clinprecision.clinopsservice.mapper.FormDefinitionMapper;'
    'import com\.clinprecision\.common\.mapper\.clinops\.StudyDocumentMapper;' = 'import com.clinprecision.clinopsservice.mapper.StudyDocumentMapper;'
    'import com\.clinprecision\.common\.mapper\.clinops\.VisitTypeConverter;' = 'import com.clinprecision.clinopsservice.mapper.VisitTypeConverter;'
}

$filesUpdated = 0
$totalReplacements = 0

foreach ($file in $allJavaFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileModified = $false
    
    foreach ($pattern in $importReplacements.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $importReplacements[$pattern]
            $fileModified = $true
            $totalReplacements++
        }
    }
    
    if ($fileModified) {
        Set-Content $file.FullName -Value $content -NoNewline
        $filesUpdated++
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== Import Updates Complete ===" -ForegroundColor Cyan
Write-Host "Files updated: $filesUpdated" -ForegroundColor Green
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Green
