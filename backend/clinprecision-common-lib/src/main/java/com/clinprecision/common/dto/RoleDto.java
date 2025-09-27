package com.clinprecision.common.dto;

public class RoleDto {
    private long id;
    private String name;
    private boolean isSystemRole;

    public RoleDto() {}
    
    public RoleDto(long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public RoleDto(long id, String name, boolean isSystemRole) {
        this.id = id;
        this.name = name;
        this.isSystemRole = isSystemRole;
    }
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isSystemRole() { return isSystemRole; }
    public void setSystemRole(boolean systemRole) { this.isSystemRole = systemRole; }
}
