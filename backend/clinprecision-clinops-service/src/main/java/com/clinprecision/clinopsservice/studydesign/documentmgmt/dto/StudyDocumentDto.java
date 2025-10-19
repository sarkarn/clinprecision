package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * DTO for study document data transfer
 * MVP version for basic document management
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyDocumentDto {

    private Long id;
    private Long studyId;
    private String name;
    private String type;
    private String fileName;
    private Long fileSize;
    private String size;
    private String mimeType;
    private String version;
    private String status;
    private String description;
    private Long uploadedBy;
    private String uploadedByName;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime uploadedAt;

    private String lastModified;
    private String downloadUrl;
    private Boolean canDownload;
    private Boolean canDelete;
    private String fileExtension;
    private Boolean isImage;
    private Boolean isPdf;

    // Constructors
    public StudyDocumentDto() {}

    public StudyDocumentDto(Long id, String name, String type, String size, String lastModified, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.size = size;
        this.lastModified = lastModified;
        this.status = status;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public Boolean getCanDownload() {
        return canDownload;
    }

    public void setCanDownload(Boolean canDownload) {
        this.canDownload = canDownload;
    }

    public Boolean getCanDelete() {
        return canDelete;
    }

    public void setCanDelete(Boolean canDelete) {
        this.canDelete = canDelete;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public Boolean getIsImage() {
        return isImage;
    }

    public void setIsImage(Boolean isImage) {
        this.isImage = isImage;
    }

    public Boolean getIsPdf() {
        return isPdf;
    }

    public void setIsPdf(Boolean isPdf) {
        this.isPdf = isPdf;
    }

    @Override
    public String toString() {
        return "StudyDocumentDto{" +
                "id=" + id +
                ", studyId=" + studyId +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", fileName='" + fileName + '\'' +
                ", size='" + size + '\'' +
                ", version='" + version + '\'' +
                ", status='" + status + '\'' +
                ", uploadedByName='" + uploadedByName + '\'' +
                ", lastModified='" + lastModified + '\'' +
                '}';
    }
}


