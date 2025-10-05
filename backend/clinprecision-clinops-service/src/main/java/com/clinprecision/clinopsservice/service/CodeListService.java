package com.clinprecision.clinopsservice.service;

import com.clinprecision.clinopsservice.repository.CodeListRepository;
import com.clinprecision.clinopsservice.dto.CodeListDto;
import com.clinprecision.clinopsservice.dto.CreateCodeListRequest;
import com.clinprecision.clinopsservice.dto.UpdateCodeListRequest;
import com.clinprecision.clinopsservice.entity.CodeListEntity;
import com.clinprecision.common.exception.ResourceNotFoundException;
import com.clinprecision.clinopsservice.mapper.CodeListMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing code lists
 */
@Service
@Transactional
public class CodeListService {
    
    private static final Logger log = LoggerFactory.getLogger(CodeListService.class);
    
    @Autowired
    private CodeListRepository codeListRepository;
    
    @Autowired
    private CodeListMapper codeListMapper;
    
    /**
     * Get all code lists by category (cached for performance)
     */
    @Cacheable(value = "codeLists", key = "#category")
    @Transactional(readOnly = true)
    public List<CodeListDto> getCodeListsByCategory(String category) {
        log.debug("Fetching code lists for category: {}", category);
        List<CodeListEntity> entities = codeListRepository
                .findByCategoryAndIsActiveTrueOrderBySortOrderAscDisplayNameAsc(category);
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Get simple code lists by category (for dropdowns - minimal data)
     */
    @Cacheable(value = "simpleCodeLists", key = "#category")
    @Transactional(readOnly = true)
    public List<CodeListDto> getSimpleCodeListsByCategory(String category) {
        log.debug("Fetching simple code lists for category: {}", category);
        List<CodeListEntity> entities = codeListRepository
                .findValidCodeListsByCategory(category, LocalDate.now());
        return codeListMapper.toSimpleDtoList(entities);
    }
    
    /**
     * Get specific code list by category and code
     */
    @Transactional(readOnly = true)
    public Optional<CodeListDto> getCodeListByCategoryAndCode(String category, String code) {
        log.debug("Fetching code list: category={}, code={}", category, code);
        Optional<CodeListEntity> entity = codeListRepository.findByCategoryAndCode(category, code);
        return entity.map(codeListMapper::toDto);
    }
    
    /**
     * Get code list by ID
     */
    @Transactional(readOnly = true)
    public CodeListDto getCodeListById(Long id) {
        log.debug("Fetching code list by ID: {}", id);
        CodeListEntity entity = codeListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code list not found with ID: " + id));
        return codeListMapper.toDto(entity);
    }
    
    /**
     * Get all distinct categories
     */
    @Cacheable(value = "codeListCategories")
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.debug("Fetching all code list categories");
        return codeListRepository.findDistinctCategories();
    }
    
    /**
     * Create new code list entry
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists", "codeListCategories"}, allEntries = true)
    public CodeListDto createCodeList(CreateCodeListRequest request) {
        log.info("Creating new code list: category={}, code={}", request.getCategory(), request.getCode());
        
        // Check for duplicate
        if (codeListRepository.existsByCategoryAndCode(request.getCategory(), request.getCode())) {
            throw new DataIntegrityViolationException(
                String.format("Code list already exists: category=%s, code=%s", 
                    request.getCategory(), request.getCode()));
        }
        
        CodeListEntity entity = codeListMapper.toEntity(request);
        CodeListEntity savedEntity = codeListRepository.save(entity);
        
        log.info("Created code list with ID: {}", savedEntity.getId());
        return codeListMapper.toDto(savedEntity);
    }
    
    /**
     * Update existing code list
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists"}, allEntries = true)
    public CodeListDto updateCodeList(Long id, UpdateCodeListRequest request) {
        log.info("Updating code list with ID: {}", id);
        
        CodeListEntity entity = codeListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code list not found with ID: " + id));
        
        // Check if it's a system code that cannot be modified
        if (entity.isSystemManaged() && !isSystemUser(request.getUpdatedBy())) {
            throw new IllegalStateException("System-managed code lists cannot be modified by users");
        }
        
        // Optimistic locking check
        if (request.getVersionNumber() != null && 
            !request.getVersionNumber().equals(entity.getVersionNumber())) {
            throw new DataIntegrityViolationException("Code list was modified by another user");
        }
        
        codeListMapper.updateEntityFromRequest(entity, request);
        CodeListEntity savedEntity = codeListRepository.save(entity);
        
        log.info("Updated code list with ID: {}", savedEntity.getId());
        return codeListMapper.toDto(savedEntity);
    }
    
    /**
     * Delete code list (soft delete by setting inactive)
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists", "codeListCategories"}, allEntries = true)
    public void deleteCodeList(Long id, Long deletedBy) {
        log.info("Deleting code list with ID: {}", id);
        
        CodeListEntity entity = codeListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code list not found with ID: " + id));
        
        // Check if it's a system code that cannot be deleted
        if (entity.isSystemManaged() && !isSystemUser(deletedBy)) {
            throw new IllegalStateException("System-managed code lists cannot be deleted by users");
        }
        
        // Soft delete by setting inactive
        entity.setIsActive(false);
        entity.setUpdatedBy(deletedBy);
        codeListRepository.save(entity);
        
        log.info("Soft deleted code list with ID: {}", id);
    }
    
    /**
     * Hard delete code list (use with caution)
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists", "codeListCategories"}, allEntries = true)
    public void hardDeleteCodeList(Long id, Long deletedBy) {
        log.warn("Hard deleting code list with ID: {}", id);
        
        CodeListEntity entity = codeListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code list not found with ID: " + id));
        
        // Only allow hard delete for non-system codes
        if (entity.isSystemManaged()) {
            throw new IllegalStateException("System-managed code lists cannot be hard deleted");
        }
        
        codeListRepository.delete(entity);
        log.warn("Hard deleted code list with ID: {}", id);
    }
    
    /**
     * Search code lists
     */
    @Transactional(readOnly = true)
    public List<CodeListDto> searchCodeLists(String searchText) {
        log.debug("Searching code lists with text: {}", searchText);
        List<CodeListEntity> entities = codeListRepository.searchCodeLists(searchText);
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Get child code lists
     */
    @Transactional(readOnly = true)
    public List<CodeListDto> getChildCodeLists(Long parentId) {
        log.debug("Fetching child code lists for parent ID: {}", parentId);
        List<CodeListEntity> entities = codeListRepository
                .findByParentCodeIdOrderBySortOrderAscDisplayNameAsc(parentId);
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Get expiring code lists (for maintenance alerts)
     */
    @Transactional(readOnly = true)
    public List<CodeListDto> getExpiringCodeLists(int days) {
        log.debug("Fetching code lists expiring in {} days", days);
        LocalDate now = LocalDate.now();
        LocalDate futureDate = now.plusDays(days);
        List<CodeListEntity> entities = codeListRepository.findExpiringCodeLists(now, futureDate);
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Get system-managed code lists
     */
    @Transactional(readOnly = true)
    public List<CodeListDto> getSystemCodeLists() {
        log.debug("Fetching system-managed code lists");
        List<CodeListEntity> entities = codeListRepository.findBySystemCodeTrueOrderByCategoryAscSortOrderAsc();
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Get user-configurable code lists
     */
    @Transactional(readOnly = true)
    public List<CodeListDto> getUserConfigurableCodeLists() {
        log.debug("Fetching user-configurable code lists");
        List<CodeListEntity> entities = codeListRepository.findBySystemCodeFalseOrderByCategoryAscSortOrderAsc();
        return codeListMapper.toDtoList(entities);
    }
    
    /**
     * Bulk update sort order
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists"}, allEntries = true)
    public void updateSortOrder(String category, List<Long> orderedIds, Long updatedBy) {
        log.info("Updating sort order for category: {}", category);
        
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            Optional<CodeListEntity> entityOpt = codeListRepository.findById(id);
            if (entityOpt.isPresent()) {
                CodeListEntity entity = entityOpt.get();
                entity.setSortOrder(i);
                entity.setUpdatedBy(updatedBy);
                codeListRepository.save(entity);
            }
        }
        
        log.info("Updated sort order for {} items in category: {}", orderedIds.size(), category);
    }
    
    /**
     * Validate if a code exists and is currently valid
     */
    @Transactional(readOnly = true)
    public boolean isValidCode(String category, String code) {
        Optional<CodeListEntity> entity = codeListRepository.findByCategoryAndCode(category, code);
        return entity.map(CodeListEntity::isCurrentlyValid).orElse(false);
    }
    
    /**
     * Cache clearing utility methods
     */
    @CacheEvict(value = {"codeLists", "simpleCodeLists", "codeListCategories"}, allEntries = true)
    public void clearAllCodeListCaches() {
        log.info("Cleared all code list caches");
    }
    
    /**
     * Check if user is system user (admin/system role)
     * This is a placeholder - implement based on your user management system
     */
    private boolean isSystemUser(Long userId) {
        // TODO: Implement actual system user check
        // This could check user roles from user service
        return userId != null && userId == 1L; // Assuming user ID 1 is system user
    }
}



