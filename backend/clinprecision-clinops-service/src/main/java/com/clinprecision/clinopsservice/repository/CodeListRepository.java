package com.clinprecision.clinopsservice.repository;

import com.clinprecision.common.entity.CodeListEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for CodeList entity operations
 */
@Repository
public interface CodeListRepository extends JpaRepository<CodeListEntity, Long> {
    
    /**
     * Find all code lists by category
     */
    List<CodeListEntity> findByCategoryOrderBySortOrderAscDisplayNameAsc(String category);
    
    /**
     * Find all active code lists by category
     */
    List<CodeListEntity> findByCategoryAndIsActiveTrueOrderBySortOrderAscDisplayNameAsc(String category);
    
    /**
     * Find specific code by category and code value
     */
    Optional<CodeListEntity> findByCategoryAndCode(String category, String code);
    
    /**
     * Find active and currently valid code lists by category
     */
    @Query("SELECT cl FROM CodeListEntity cl WHERE " +
           "cl.category = :category AND " +
           "cl.isActive = true AND " +
           "(cl.validFrom IS NULL OR cl.validFrom <= :currentDate) AND " +
           "(cl.validTo IS NULL OR cl.validTo >= :currentDate) " +
           "ORDER BY cl.sortOrder ASC, cl.displayName ASC")
    List<CodeListEntity> findValidCodeListsByCategory(
            @Param("category") String category,
            @Param("currentDate") LocalDate currentDate
    );
    
    /**
     * Find all distinct categories
     */
    @Query("SELECT DISTINCT cl.category FROM CodeListEntity cl WHERE cl.isActive = true ORDER BY cl.category")
    List<String> findDistinctCategories();
    
    /**
     * Find child code lists
     */
    List<CodeListEntity> findByParentCodeIdOrderBySortOrderAscDisplayNameAsc(Long parentCodeId);
    
    /**
     * Find system-managed code lists
     */
    List<CodeListEntity> findBySystemCodeTrueOrderByCategoryAscSortOrderAsc();
    
    /**
     * Find user-configurable code lists
     */
    List<CodeListEntity> findBySystemCodeFalseOrderByCategoryAscSortOrderAsc();
    
    /**
     * Check if category and code combination exists
     */
    boolean existsByCategoryAndCode(String category, String code);
    
    /**
     * Check if category and code combination exists (excluding specific ID)
     */
    boolean existsByCategoryAndCodeAndIdNot(String category, String code, Long id);
    
    /**
     * Find code lists that are about to expire
     */
    @Query("SELECT cl FROM CodeListEntity cl WHERE " +
           "cl.isActive = true AND " +
           "cl.validTo IS NOT NULL AND " +
           "cl.validTo BETWEEN :startDate AND :endDate " +
           "ORDER BY cl.validTo ASC")
    List<CodeListEntity> findExpiringCodeLists(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Find code lists by metadata criteria (example: by color)
     */
    @Query(value = "SELECT * FROM code_lists WHERE " +
           "is_active = true AND " +
           "JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.color')) = :colorValue " +
           "ORDER BY sort_order ASC", nativeQuery = true)
    List<CodeListEntity> findByMetadataColor(@Param("colorValue") String colorValue);
    
    /**
     * Search code lists by text in display name or description
     */
    @Query("SELECT cl FROM CodeListEntity cl WHERE " +
           "cl.isActive = true AND " +
           "(LOWER(cl.displayName) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           " LOWER(cl.description) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           " LOWER(cl.category) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           " LOWER(cl.code) LIKE LOWER(CONCAT('%', :searchText, '%'))) " +
           "ORDER BY cl.category ASC, cl.sortOrder ASC")
    List<CodeListEntity> searchCodeLists(@Param("searchText") String searchText);
    
    /**
     * Get code list statistics by category
     */
    @Query("SELECT cl.category, COUNT(cl.id) as total, " +
           "SUM(CASE WHEN cl.isActive = true THEN 1 ELSE 0 END) as activeCount, " +
           "SUM(CASE WHEN cl.systemCode = true THEN 1 ELSE 0 END) as systemCount " +
           "FROM CodeListEntity cl " +
           "GROUP BY cl.category " +
           "ORDER BY cl.category")
    List<Object[]> getCodeListStatistics();
    
    /**
     * Find recently modified code lists
     */
    @Query("SELECT cl FROM CodeListEntity cl WHERE " +
           "cl.updatedAt >= :since " +
           "ORDER BY cl.updatedAt DESC")
    List<CodeListEntity> findRecentlyModified(@Param("since") LocalDate since);
}
