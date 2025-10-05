package com.clinprecision.clinopsservice.document.valueobject;

/**
 * Document Type - Value Object representing types of clinical study documents
 * 
 * Regulatory Context:
 * - Different document types have different approval requirements
 * - Some require e-signatures (PROTOCOL, ICF)
 * - Some require regulatory notification on changes
 */
public enum DocumentType {
    
    /**
     * Clinical Protocol - Primary study document
     * - Requires IRB/EC approval
     * - Requires e-signature
     * - Changes require regulatory notification
     */
    PROTOCOL("Protocol", true, true),
    
    /**
     * Informed Consent Form
     * - Requires IRB/EC approval
     * - Requires e-signature
     * - Subject-facing document
     */
    ICF("Informed Consent Form", true, true),
    
    /**
     * Investigator's Brochure
     * - Product information for investigators
     * - Requires review and acknowledgment
     */
    IB("Investigator's Brochure", true, false),
    
    /**
     * Case Report Form
     * - Data collection forms
     * - Version controlled
     */
    CRF("Case Report Form", false, false),
    
    /**
     * Study Manual / Manual of Procedures
     * - Operational procedures
     * - Training reference
     */
    MANUAL("Study Manual", false, false),
    
    /**
     * Statistical Analysis Plan
     * - Analysis methodology
     * - Locked before database lock
     */
    SAP("Statistical Analysis Plan", true, false),
    
    /**
     * Monitoring Plan
     * - Risk-based monitoring strategy
     */
    MONITORING_PLAN("Monitoring Plan", false, false),
    
    /**
     * Study Report (CSR/Annual Report)
     */
    REPORT("Study Report", true, false),
    
    /**
     * Regulatory Submission
     * - IND, IDE, NDA, etc.
     */
    REGULATORY("Regulatory Submission", true, true),
    
    /**
     * Lab Manual/Certification
     */
    LAB_MANUAL("Laboratory Manual", false, false),
    
    /**
     * Site Qualification/Agreements
     */
    SITE_DOCUMENT("Site Document", false, false),
    
    /**
     * Amendment/Modification
     */
    AMENDMENT("Amendment", true, true),
    
    /**
     * Other supporting documents
     */
    OTHER("Other Document", false, false);
    
    private final String displayName;
    private final boolean requiresApproval;
    private final boolean requiresSignature;
    
    DocumentType(String displayName, boolean requiresApproval, boolean requiresSignature) {
        this.displayName = displayName;
        this.requiresApproval = requiresApproval;
        this.requiresSignature = requiresSignature;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean requiresApproval() {
        return requiresApproval;
    }
    
    public boolean requiresSignature() {
        return requiresSignature;
    }
    
    /**
     * Check if this is a critical regulatory document
     */
    public boolean isCritical() {
        return requiresApproval || requiresSignature;
    }
}
