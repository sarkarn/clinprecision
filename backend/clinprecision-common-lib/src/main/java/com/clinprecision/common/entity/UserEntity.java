package com.clinprecision.common.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * User entity based on BRIDG/HL7 FHIR/CDISC standards.
 * Represents a user of the EDC system with various roles and permissions.
 */
@Entity
@Table(name="users")
public class UserEntity implements Serializable {


    private static final long serialVersionUID = -2731425678149216053L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable=false, length=50)
    private String firstName;

    @Column(nullable=false, length=50)
    private String lastName;

    @Column(nullable=false, length=120, unique=true)
    private String email;

    @Column(nullable=false, unique=true)
    private String userId;

    @Column(nullable=false, unique=true)
    private String encryptedPassword;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "title")
    private String title;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private OrganizationEntity organization;

    @Column(name = "profession")
    private String profession;

    @Column(name = "phone")
    private String phone;

    @Column(name = "mobile_phone")
    private String mobilePhone;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status = UserStatus.pending;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "password_reset_required")
    private boolean passwordResetRequired = true;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
    @JoinTable(name="users_roles", joinColumns=@JoinColumn(name="users_id", referencedColumnName="id"),
            inverseJoinColumns=@JoinColumn(name="roles_id", referencedColumnName="id"))
    private Collection<RoleEntity> roles = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    @JoinTable(name = "users_user_types",
            joinColumns = @JoinColumn(name = "users_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "user_types_id", referencedColumnName = "id"))
    private Set<UserTypeEntity> userTypes = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserQualificationEntity> qualifications = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<UserStudyRoleEntity> studyRoles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<UserSiteAssignmentEntity> siteAssignments = new HashSet<>();

    @OneToMany(mappedBy = "principalInvestigator")
    private Set<SiteEntity> supervisedSites = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserSessionEntity> sessions = new HashSet<>();

    public enum UserStatus {
        active, inactive, pending, locked
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
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
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getEncryptedPassword() {
        return encryptedPassword;
    }
    public void setEncryptedPassword(String encryptedPassword) {
        this.encryptedPassword = encryptedPassword;
    }

    public Collection<RoleEntity> getRoles() {
        return roles;
    }
    public void setRoles(Collection<RoleEntity> roles) {
        this.roles.clear();
        if (roles != null) {
            this.roles.addAll(roles);
        }
    }

    public String getMiddleName() {
        return middleName;
    }
    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public OrganizationEntity getOrganization() {
        return organization;
    }
    public void setOrganization(OrganizationEntity organization) {
        this.organization = organization;
    }
    public String getProfession() {
        return profession;
    }
    public void setProfession(String profession) {
        this.profession = profession;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public String getMobilePhone() {
        return mobilePhone;
    }
    public void setMobilePhone(String mobilePhone) {
        this.mobilePhone = mobilePhone;
    }
    public String getAddressLine1() {
        return addressLine1;
    }
    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }
    public String getAddressLine2() {
        return addressLine2;
    }
    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getState() {
        return state;
    }
    public void setState(String state) {
        this.state = state;
    }
    public String getPostalCode() {
        return postalCode;
    }
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    public String getCountry() {
        return country;
    }
    public void setCountry(String country) {
        this.country = country;
    }
    public UserStatus getStatus() {
        return status;
    }
    public void setStatus(UserStatus status) {
        this.status = status;
    }
    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }
    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    public boolean isPasswordResetRequired() {
        return passwordResetRequired;
    }
    public void setPasswordResetRequired(boolean passwordResetRequired) {
        this.passwordResetRequired = passwordResetRequired;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
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
    public Set<UserTypeEntity> getUserTypes() {
        return userTypes;
    }
    public void setUserTypes(Set<UserTypeEntity> userTypes) {
        this.userTypes = userTypes;
    }
    public Set<UserQualificationEntity> getQualifications() {
        return qualifications;
    }
    public void setQualifications(Set<UserQualificationEntity> qualifications) {
        this.qualifications = qualifications;
    }
    public Set<UserStudyRoleEntity> getStudyRoles() {
        return studyRoles;
    }
    public void setStudyRoles(Set<UserStudyRoleEntity> studyRoles) {
        this.studyRoles = studyRoles;
    }
    public Set<UserSiteAssignmentEntity> getSiteAssignments() {
        return siteAssignments;
    }
    public void setSiteAssignments(Set<UserSiteAssignmentEntity> siteAssignments) {
        this.siteAssignments = siteAssignments;
    }
    public Set<SiteEntity> getSupervisedSites() {
        return supervisedSites;
    }
    public void setSupervisedSites(Set<SiteEntity> supervisedSites) {
        this.supervisedSites = supervisedSites;
    }
    public Set<UserSessionEntity> getSessions() {
        return sessions;
    }
    public void setSessions(Set<UserSessionEntity> sessions) {
        this.sessions = sessions;
    }

}