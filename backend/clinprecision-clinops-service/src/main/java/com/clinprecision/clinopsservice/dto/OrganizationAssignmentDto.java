package com.clinprecision.clinopsservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

/**
 * DTO for organization assignment to studies
 * Represents the organization-role relationship
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationAssignmentDto {
    
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    @NotBlank(message = "Organization role is required")
    @Pattern(regexp = "sponsor|cro|site|vendor|laboratory|regulatory|statistics|safety",
            message = "Role must be one of: sponsor, cro, site, vendor, laboratory, regulatory, statistics, safety")
    private String role;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private Boolean isPrimary = false;
    
    // Default constructor
    public OrganizationAssignmentDto() {}
    
    // Constructor with required fields
    public OrganizationAssignmentDto(Long organizationId, String role) {
        this.organizationId = organizationId;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
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
    
    public Boolean getIsPrimary() {
        return isPrimary;
    }
    
    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}



