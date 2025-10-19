package com.clinprecision.clinopsservice.patientenrollment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_enrollment_audit")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEnrollmentAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum AuditEntityType { PATIENT, ENROLLMENT, ELIGIBILITY }
    public enum AuditActionType { REGISTER, ENROLL, CONFIRM_ELIGIBILITY, WITHDRAW, UPDATE }

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private AuditEntityType entityType; // PATIENT, ENROLLMENT, ELIGIBILITY

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "entity_aggregate_uuid", nullable = false)
    private String entityAggregateUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private AuditActionType actionType; // REGISTER, ENROLL, CONFIRM_ELIGIBILITY, WITHDRAW, UPDATE

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "reason")
    private String reason;
}



