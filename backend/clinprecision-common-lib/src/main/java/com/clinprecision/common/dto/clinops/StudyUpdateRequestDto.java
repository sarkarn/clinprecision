package com.clinprecision.common.dto.clinops;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for updating study information
 * Used for PUT requests to update existing studies
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyUpdateRequestDto {
    
    @Size(min = 3, max = 255, message = "Study name must be between 3 and 255 characters")
    private String name;
    
    @Size(max = 100, message = "Protocol number cannot exceed 100 characters")
    private String protocolNumber;
    
    // New lookup table ID fields
    private Long studyStatusId;
    private Long studyPhaseId;
    private Long regulatoryStatusId;
    
    @Size(max = 255, message = "Sponsor name cannot exceed 255 characters")
    private String sponsor;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Size(max = 500, message = "Indication cannot exceed 500 characters")
    private String indication;
    
    @Size(max = 50, message = "Study type cannot exceed 50 characters")
    private String studyType;
    
    @Size(max = 255, message = "Principal investigator name cannot exceed 255 characters")
    private String principalInvestigator;
    
    private Integer sites;
    private Integer plannedSubjects;
    private Integer enrolledSubjects;
    private Integer targetEnrollment;
    
    @Size(max = 2000, message = "Primary objective cannot exceed 2000 characters")
    private String primaryObjective;
    
    private Integer amendments;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @Valid
    private List<OrganizationAssignmentDto> organizations;
    
    private String metadata;
    
    // Default constructor
    public StudyUpdateRequestDto() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getProtocolNumber() {
        return protocolNumber;
    }
    
    public void setProtocolNumber(String protocolNumber) {
        this.protocolNumber = protocolNumber;
    }

    public String getSponsor() {
        return sponsor;
    }
    
    public void setSponsor(String sponsor) {
        this.sponsor = sponsor;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIndication() {
        return indication;
    }
    
    public void setIndication(String indication) {
        this.indication = indication;
    }
    
    public String getStudyType() {
        return studyType;
    }
    
    public void setStudyType(String studyType) {
        this.studyType = studyType;
    }
    
    public String getPrincipalInvestigator() {
        return principalInvestigator;
    }
    
    public void setPrincipalInvestigator(String principalInvestigator) {
        this.principalInvestigator = principalInvestigator;
    }
    
    public Integer getSites() {
        return sites;
    }
    
    public void setSites(Integer sites) {
        this.sites = sites;
    }
    
    public Integer getPlannedSubjects() {
        return plannedSubjects;
    }
    
    public void setPlannedSubjects(Integer plannedSubjects) {
        this.plannedSubjects = plannedSubjects;
    }
    
    public Integer getEnrolledSubjects() {
        return enrolledSubjects;
    }
    
    public void setEnrolledSubjects(Integer enrolledSubjects) {
        this.enrolledSubjects = enrolledSubjects;
    }
    
    public Integer getTargetEnrollment() {
        return targetEnrollment;
    }
    
    public void setTargetEnrollment(Integer targetEnrollment) {
        this.targetEnrollment = targetEnrollment;
    }
    
    public String getPrimaryObjective() {
        return primaryObjective;
    }
    
    public void setPrimaryObjective(String primaryObjective) {
        this.primaryObjective = primaryObjective;
    }
    
    public Integer getAmendments() {
        return amendments;
    }
    
    public void setAmendments(Integer amendments) {
        this.amendments = amendments;
    }

    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public List<OrganizationAssignmentDto> getOrganizations() {
        return organizations;
    }
    
    public void setOrganizations(List<OrganizationAssignmentDto> organizations) {
        this.organizations = organizations;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    // Getters and setters for lookup table ID fields
    public Long getStudyStatusId() {
        return studyStatusId;
    }
    
    public void setStudyStatusId(Long studyStatusId) {
        this.studyStatusId = studyStatusId;
    }
    
    public Long getStudyPhaseId() {
        return studyPhaseId;
    }
    
    public void setStudyPhaseId(Long studyPhaseId) {
        this.studyPhaseId = studyPhaseId;
    }
    
    public Long getRegulatoryStatusId() {
        return regulatoryStatusId;
    }
    
    public void setRegulatoryStatusId(Long regulatoryStatusId) {
        this.regulatoryStatusId = regulatoryStatusId;
    }
}
