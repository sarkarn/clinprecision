package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Protocol Deviation Comment Entity
 * Maps to protocol_deviation_comments table
 * 
 * Tracks the threaded discussion and investigation notes
 * related to a protocol deviation. Enables collaboration
 * between site staff, monitors, and sponsors.
 */
@Entity
@Table(name = "protocol_deviation_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDeviationCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deviation_id", nullable = false)
    private Long deviationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deviation_id", insertable = false, updatable = false)
    private ProtocolDeviationEntity protocolDeviation;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "commented_by", nullable = false)
    private Long commentedBy;

    @Column(name = "commented_at", nullable = false, updatable = false)
    private LocalDateTime commentedAt;

    @Column(name = "is_internal")
    private Boolean isInternal = false;

    @PrePersist
    protected void onCreate() {
        this.commentedAt = LocalDateTime.now();
        
        if (this.isInternal == null) {
            this.isInternal = false;
        }
    }

    // Helper methods
    
    /**
     * Check if comment is visible to external parties (sponsor, auditors)
     */
    public boolean isExternallyVisible() {
        return !Boolean.TRUE.equals(isInternal);
    }

    /**
     * Check if comment is for internal site use only
     */
    public boolean isInternalOnly() {
        return Boolean.TRUE.equals(isInternal);
    }
}
