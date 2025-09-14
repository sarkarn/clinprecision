package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.UserQualificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for UserQualification entities.
 */
@Repository
public interface UserQualificationRepository extends JpaRepository<UserQualificationEntity, Long> {
    
    /**
     * Find all qualifications for a specific user.
     *
     * @param userId the ID of the user
     * @return list of qualifications for the specified user
     */
    List<UserQualificationEntity> findByUser_Id(Long userId);
    
    /**
     * Find all qualifications of a specific type for a user.
     *
     * @param userId the ID of the user
     * @param qualificationType the type of qualification
     * @return list of qualifications of the specified type for the user
     */
    List<UserQualificationEntity> findByUser_IdAndQualificationType(Long userId, String qualificationType);
    
    /**
     * Find all qualifications with a specific verification status.
     *
     * @param verificationStatus the verification status
     * @return list of qualifications with the specified verification status
     */
    List<UserQualificationEntity> findByVerificationStatus(UserQualificationEntity.VerificationStatus verificationStatus);
    
    /**
     * Find all qualifications that expire before a specific date.
     *
     * @param expiryDate the expiry date
     * @return list of qualifications that expire before the specified date
     */
    List<UserQualificationEntity> findByExpiryDateBefore(LocalDate expiryDate);
    
    /**
     * Find all qualifications verified by a specific user.
     *
     * @param verifiedBy the ID or username of the verifier
     * @return list of qualifications verified by the specified user
     */
    List<UserQualificationEntity> findByVerifiedBy(Long verifiedBy);
}
