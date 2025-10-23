package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.repository;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Protocol Deviation Comment Entity
 * Provides query methods for deviation discussion threads
 */
@Repository
public interface ProtocolDeviationCommentRepository extends JpaRepository<ProtocolDeviationCommentEntity, Long> {

    /**
     * Find all comments for a specific deviation, ordered by timestamp
     */
    List<ProtocolDeviationCommentEntity> findByDeviationIdOrderByCommentedAtAsc(Long deviationId);

    /**
     * Find all external comments for a deviation (visible to sponsor/auditors)
     */
    @Query("SELECT c FROM ProtocolDeviationCommentEntity c WHERE c.deviationId = :deviationId AND c.isInternal = false ORDER BY c.commentedAt ASC")
    List<ProtocolDeviationCommentEntity> findExternalCommentsByDeviation(@Param("deviationId") Long deviationId);

    /**
     * Find all internal comments for a deviation (site use only)
     */
    @Query("SELECT c FROM ProtocolDeviationCommentEntity c WHERE c.deviationId = :deviationId AND c.isInternal = true ORDER BY c.commentedAt ASC")
    List<ProtocolDeviationCommentEntity> findInternalCommentsByDeviation(@Param("deviationId") Long deviationId);

    /**
     * Count comments for a deviation
     */
    Long countByDeviationId(Long deviationId);

    /**
     * Find comments by a specific user
     */
    List<ProtocolDeviationCommentEntity> findByCommentedByOrderByCommentedAtDesc(Long commentedBy);
}
