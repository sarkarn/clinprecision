package com.clinprecision.clinopsservice.patientenrollment.repository;

import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientEnrollmentAuditRepository extends JpaRepository<PatientEnrollmentAuditEntity, Long> {
}
