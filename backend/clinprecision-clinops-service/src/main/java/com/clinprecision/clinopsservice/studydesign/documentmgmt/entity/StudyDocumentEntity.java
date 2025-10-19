package com.clinprecision.clinopsservice.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entity representing study documents
 * MVP version for basic document management
 */
@Entity
@Table(name = "study_documents")
public class StudyDocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregate_uuid", unique = true, nullable = false, length = 36)
    private String aggregateUuid;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "version", length = 50)
    private String version = "1.0";

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DocumentStatus status = DocumentStatus.CURRENT;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "superseded_by_document_id")
    private String supersededByDocumentId;

    @Column(name = "archived_by")
    private Long archivedBy;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", insertable = false, updatable = false)
    private StudyEntity study;

    // Constructors
    public StudyDocumentEntity() {}

    public StudyDocumentEntity(Long studyId, String name, String documentType, 
                              String fileName, String filePath, Long fileSize, 
                              String mimeType, Long uploadedBy) {
        this.studyId = studyId;
        this.name = name;
        this.documentType = documentType;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (uploadedAt == null) uploadedAt = now;
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudyId() {
        return studyId;
    }

    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }

    public String getAggregateUuid() {
        return aggregateUuid;
    }

    public void setAggregateUuid(String aggregateUuid) {
        this.aggregateUuid = aggregateUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public StudyEntity getStudy() {
        return study;
    }

    public void setStudy(StudyEntity study) {
        this.study = study;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getSupersededByDocumentId() {
        return supersededByDocumentId;
    }

    public void setSupersededByDocumentId(String supersededByDocumentId) {
        this.supersededByDocumentId = supersededByDocumentId;
    }

    public Long getArchivedBy() {
        return archivedBy;
    }

    public void setArchivedBy(Long archivedBy) {
        this.archivedBy = archivedBy;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    // Utility methods
    public String getFormattedFileSize() {
        if (fileSize == null) return "0 B";
        
        if (fileSize < 1024) {
            return fileSize + " B";
        } else if (fileSize < 1048576) {
            return String.format("%.1f KB", fileSize / 1024.0);
        } else if (fileSize < 1073741824) {
            return String.format("%.1f MB", fileSize / 1048576.0);
        } else {
            return String.format("%.1f GB", fileSize / 1073741824.0);
        }
    }

    public boolean isPdf() {
        return "application/pdf".equals(mimeType);
    }

    public boolean isImage() {
        return mimeType != null && mimeType.startsWith("image/");
    }

    public boolean isDocument() {
        return mimeType != null && (
            mimeType.contains("pdf") ||
            mimeType.contains("doc") ||
            mimeType.contains("text") ||
            mimeType.contains("spreadsheet")
        );
    }

    @Override
    public String toString() {
        return "StudyDocumentEntity{" +
                "id=" + id +
                ", studyId=" + studyId +
                ", name='" + name + '\'' +
                ", documentType='" + documentType + '\'' +
                ", fileName='" + fileName + '\'' +
                ", fileSize=" + fileSize +
                ", version='" + version + '\'' +
                ", status=" + status +
                ", uploadedAt=" + uploadedAt +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudyDocumentEntity)) return false;
        StudyDocumentEntity that = (StudyDocumentEntity) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    /**
     * Document status enumeration
     */
    public enum DocumentStatus {
        DRAFT("Draft"),
        CURRENT("Current"),
        SUPERSEDED("Superseded"),
        ARCHIVED("Archived");

        private final String displayName;

        DocumentStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}


