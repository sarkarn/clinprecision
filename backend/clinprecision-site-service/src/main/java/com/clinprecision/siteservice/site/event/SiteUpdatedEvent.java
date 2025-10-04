package com.clinprecision.siteservice.site.event;

import java.time.LocalDateTime;

/**
 * Domain event fired when a clinical trial site is updated
 * Immutable event for regulatory audit trail
 */
public class SiteUpdatedEvent {
    
    private final String siteId;
    private final String name;
    private final String siteNumber;
    private final Long organizationId;
    private final String addressLine1;
    private final String addressLine2;
    private final String city;
    private final String state;
    private final String postalCode;
    private final String country;
    private final String phone;
    private final String email;
    private final String userId;
    private final String reason;
    private final LocalDateTime timestamp;
    
    public SiteUpdatedEvent(String siteId, String name, String siteNumber, Long organizationId,
                           String addressLine1, String addressLine2, String city, String state,
                           String postalCode, String country, String phone, String email,
                           String userId, String reason) {
        this.siteId = siteId;
        this.name = name;
        this.siteNumber = siteNumber;
        this.organizationId = organizationId;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.phone = phone;
        this.email = email;
        this.userId = userId;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public String getSiteId() { return siteId; }
    public String getName() { return name; }
    public String getSiteNumber() { return siteNumber; }
    public Long getOrganizationId() { return organizationId; }
    public String getAddressLine1() { return addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getUserId() { return userId; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
