package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.mapper;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto.DeviationCommentResponse;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto.ProtocolDeviationResponse;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationCommentEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Protocol Deviation entities and DTOs
 */
@Component
public class ProtocolDeviationMapper {

    /**
     * Convert ProtocolDeviationEntity to ProtocolDeviationResponse
     */
    public ProtocolDeviationResponse toResponse(ProtocolDeviationEntity entity) {
        if (entity == null) {
            return null;
        }

        return ProtocolDeviationResponse.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .studyId(entity.getStudyId())
                .studySiteId(entity.getStudySiteId())
                .visitInstanceId(entity.getVisitInstanceId())
                .deviationType(entity.getDeviationType())
                .severity(entity.getSeverity())
                .deviationStatus(entity.getDeviationStatus())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .protocolSection(entity.getProtocolSection())
                .expectedProcedure(entity.getExpectedProcedure())
                .actualProcedure(entity.getActualProcedure())
                .deviationDate(entity.getDeviationDate())
                .detectionDate(entity.getDetectionDate())
                .rootCause(entity.getRootCause())
                .immediateAction(entity.getImmediateAction())
                .correctiveAction(entity.getCorrectiveAction())
                .preventiveAction(entity.getPreventiveAction())
                .requiresReporting(entity.getRequiresReporting())
                .reportedToIrb(entity.getReportedToIrb())
                .irbReportDate(entity.getIrbReportDate())
                .reportedToSponsor(entity.getReportedToSponsor())
                .sponsorReportDate(entity.getSponsorReportDate())
                .detectedBy(entity.getDetectedBy())
                .reviewedBy(entity.getReviewedBy())
                .resolvedBy(entity.getResolvedBy())
                .resolvedDate(entity.getResolvedDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert ProtocolDeviationCommentEntity to DeviationCommentResponse
     */
    public DeviationCommentResponse toResponse(ProtocolDeviationCommentEntity entity) {
        if (entity == null) {
            return null;
        }

        return DeviationCommentResponse.builder()
                .id(entity.getId())
                .deviationId(entity.getDeviationId())
                .commentText(entity.getCommentText())
                .commentedBy(entity.getCommentedBy())
                .commentedAt(entity.getCommentedAt())
                .isInternal(entity.getIsInternal())
                .build();
    }
}
