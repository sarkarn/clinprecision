package com.clinprecision.common.dto.studydesign;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for study phase lookup table
 * Used for API responses and frontend dropdowns
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyPhaseDto {
    
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Integer typicalDurationMonths;
    private Integer typicalPatientCountMin;
    private Integer typicalPatientCountMax;
    private String phaseCategory;
    private Boolean requiresIde;
    private Boolean requiresInd;
    
    // Default constructor
    public StudyPhaseDto() {}
    
    // Constructor with commonly used fields
    public StudyPhaseDto(Long id, String code, String name, String description) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getTypicalDurationMonths() {
        return typicalDurationMonths;
    }
    
    public void setTypicalDurationMonths(Integer typicalDurationMonths) {
        this.typicalDurationMonths = typicalDurationMonths;
    }
    
    public Integer getTypicalPatientCountMin() {
        return typicalPatientCountMin;
    }
    
    public void setTypicalPatientCountMin(Integer typicalPatientCountMin) {
        this.typicalPatientCountMin = typicalPatientCountMin;
    }
    
    public Integer getTypicalPatientCountMax() {
        return typicalPatientCountMax;
    }
    
    public void setTypicalPatientCountMax(Integer typicalPatientCountMax) {
        this.typicalPatientCountMax = typicalPatientCountMax;
    }
    
    public String getPhaseCategory() {
        return phaseCategory;
    }
    
    public void setPhaseCategory(String phaseCategory) {
        this.phaseCategory = phaseCategory;
    }
    
    public Boolean getRequiresIde() {
        return requiresIde;
    }
    
    public void setRequiresIde(Boolean requiresIde) {
        this.requiresIde = requiresIde;
    }
    
    public Boolean getRequiresInd() {
        return requiresInd;
    }
    
    public void setRequiresInd(Boolean requiresInd) {
        this.requiresInd = requiresInd;
    }
    
    @Override
    public String toString() {
        return "StudyPhaseDto{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", phaseCategory='" + phaseCategory + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}