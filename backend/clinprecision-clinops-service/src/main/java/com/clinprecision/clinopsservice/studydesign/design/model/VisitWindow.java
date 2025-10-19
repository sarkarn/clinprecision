package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

import lombok.Value;

/**
 * Visit Window - Value Object
 * 
 * Represents the acceptable time window for a study visit.
 * Immutable value object ensuring visit window validity.
 */
@Value
public class VisitWindow {
    
    int windowBefore;  // Days before timepoint
    int windowAfter;   // Days after timepoint
    
    private VisitWindow(int windowBefore, int windowAfter) {
        if (windowBefore < 0) {
            throw new IllegalArgumentException("Window before cannot be negative");
        }
        if (windowAfter < 0) {
            throw new IllegalArgumentException("Window after cannot be negative");
        }
        
        this.windowBefore = windowBefore;
        this.windowAfter = windowAfter;
    }
    
    /**
     * Create visit window
     */
    public static VisitWindow of(int windowBefore, int windowAfter) {
        return new VisitWindow(windowBefore, windowAfter);
    }
    
    /**
     * Create symmetric window (same before and after)
     */
    public static VisitWindow symmetric(int days) {
        return new VisitWindow(days, days);
    }
    
    /**
     * Create no window (exact timepoint)
     */
    public static VisitWindow exact() {
        return new VisitWindow(0, 0);
    }
    
    /**
     * Get total window duration in days
     */
    public int getTotalWindowDays() {
        return windowBefore + windowAfter;
    }
    
    /**
     * Check if window is flexible (has any buffer)
     */
    public boolean isFlexible() {
        return windowBefore > 0 || windowAfter > 0;
    }
    
    /**
     * Check if this is a strict timepoint (no window)
     */
    public boolean isExact() {
        return windowBefore == 0 && windowAfter == 0;
    }
    
    @Override
    public String toString() {
        if (isExact()) {
            return "Exact timepoint (no window)";
        }
        return String.format("Window: -%d/+%d days", windowBefore, windowAfter);
    }
}
