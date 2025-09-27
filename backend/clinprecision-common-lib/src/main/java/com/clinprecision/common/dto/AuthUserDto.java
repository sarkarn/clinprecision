package com.clinprecision.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Authentication User DTO for Feign Client communication
 * Serializable alternative to Spring Security's UserDetails interface
 * 
 * This DTO is used for passing user authentication data between microservices
 * without the complexity of Spring Security's User class serialization
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthUserDto {
    
    private String username;
    private String password;
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private List<String> authorities; // Simple string list instead of GrantedAuthority collection
    
    // User profile information
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    
    public AuthUserDto() {
        this.enabled = true;
        this.accountNonExpired = true;
        this.accountNonLocked = true;
        this.credentialsNonExpired = true;
    }
    
    // Constructor for easy creation
    public AuthUserDto(String username, String password, List<String> authorities) {
        this();
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.email = username; // Email is typically the username
    }
    
    // Getters and setters
    public String getUsername() {
        return username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }
    
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    public List<String> getAuthorities() {
        return authorities;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public void setAccountNonExpired(boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }
    
    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }
    
    public void setCredentialsNonExpired(boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    public void setAuthorities(List<String> authorities) {
        this.authorities = authorities;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    @Override
    public String toString() {
        return String.format("AuthUserDto{username='%s', email='%s', enabled=%s, authorities=%s}", 
            username, email, enabled, authorities);
    }
}