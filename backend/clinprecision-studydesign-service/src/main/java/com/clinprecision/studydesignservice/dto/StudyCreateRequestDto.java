package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for creating a new study
 * Matches the JSON structure sent by the frontend
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyCreateRequestDto {
    
    @NotBlank(message = "Study name is required")
    @Size(min = 3, max = 255, message = "Study name must be between 3 and 255 characters")
    private String name;
    
    @Size(max = 100, message = "Protocol number cannot exceed 100 characters")
    private String protocolNumber;
    
    @NotBlank(message = "Phase is required")
    private String phase;
    
    @Size(max = 255, message = "Sponsor name cannot exceed 255 characters")
    private String sponsor;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Pattern(regexp = "draft|active|completed|terminated|approved",
            message = "Status must be one of: draft, active, completed, terminated, approved")
    private String status = "draft";
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @Valid
    private List<OrganizationAssignmentDto> organizations = new ArrayList<>();
    
    private String metadata;
    
    // Default constructor
    public StudyCreateRequestDto() {}
    
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
