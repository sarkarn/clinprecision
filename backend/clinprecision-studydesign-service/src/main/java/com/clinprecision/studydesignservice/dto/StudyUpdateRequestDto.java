package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
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
    
    private String phase;
    
    @Size(max = 255, message = "Sponsor name cannot exceed 255 characters")
    private String sponsor;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Pattern(regexp = "draft|active|completed|terminated", 
             message = "Status must be one of: draft, active, completed, terminated")
    private String status;
    
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
    
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
}
