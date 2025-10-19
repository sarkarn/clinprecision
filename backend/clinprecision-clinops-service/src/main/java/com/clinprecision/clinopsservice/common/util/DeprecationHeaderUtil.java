package com.clinprecision.clinopsservice.common.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for adding deprecation headers to HTTP responses
 * 
 * <p>Used during API URL migration to inform clients about deprecated endpoints.
 * Supports backward compatibility by allowing both old and new URLs to work
 * simultaneously while guiding clients to migrate.</p>
 * 
 * <p><b>Migration Strategy:</b></p>
 * <ul>
 *   <li>Phase 1 (6 months): Both old and new URLs work - deprecation headers sent</li>
 *   <li>Phase 2 (6 months): Sunset warnings - clients should migrate</li>
 *   <li>Phase 3: Old URLs return HTTP 410 Gone</li>
 *   <li>Phase 4: Old URL mappings removed from code</li>
 * </ul>
 * 
 * <p><b>Usage Example:</b></p>
 * <pre>{@code
 * @PostMapping(value = {
 *     "/api/studies",                    // OLD (deprecated)
 *     "/api/v1/study-design/studies"     // NEW
 * })
 * public ResponseEntity<StudyDTO> createStudy(
 *         @RequestBody CreateStudyRequest request,
 *         HttpServletRequest httpRequest,
 *         HttpServletResponse httpResponse) {
 *     
 *     // Add deprecation headers if old URL used
 *     DeprecationHeaderUtil.addDeprecationHeaders(
 *         httpRequest, 
 *         httpResponse,
 *         "/api/studies",
 *         "/api/v1/study-design/studies"
 *     );
 *     
 *     // ... implementation
 * }
 * }</pre>
 * 
 * @see <a href="https://tools.ietf.org/html/rfc8594">RFC 8594 - Sunset Header</a>
 * @see <a href="https://tools.ietf.org/id/draft-dalal-deprecation-header-03.html">Deprecation Header Draft</a>
 * 
 * @author ClinPrecision Development Team
 * @since 1.0.0 (October 2025 - API Refactoring)
 */
@Slf4j
public class DeprecationHeaderUtil {
    
    /**
     * Sunset date for deprecated endpoints (6 months from October 19, 2025)
     * After this date, old endpoints will return HTTP 410 Gone
     */
    private static final String SUNSET_DATE = "2026-04-19T00:00:00Z";
    
    /**
     * HTTP header name for deprecation indicator
     * Standard header as per draft spec
     */
    private static final String DEPRECATION_HEADER = "Deprecation";
    
    /**
     * HTTP header name for sunset date
     * RFC 8594 standard header
     */
    private static final String SUNSET_HEADER = "Sunset";
    
    /**
     * HTTP header name for alternate URL link
     * RFC 8288 Link header
     */
    private static final String LINK_HEADER = "Link";
    
    /**
     * Custom header for deprecation warning message
     */
    private static final String API_WARN_HEADER = "X-API-Warn";
    
    /**
     * Private constructor to prevent instantiation
     */
    private DeprecationHeaderUtil() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
    
    /**
     * Add deprecation headers to HTTP response if old URL was used
     * 
     * <p>This method checks if the request URI starts with the old URL prefix.
     * If it does, it adds standard deprecation headers to inform the client
     * that they should migrate to the new URL.</p>
     * 
     * <p><b>Headers Added:</b></p>
     * <ul>
     *   <li>{@code Deprecation: true} - Indicates endpoint is deprecated</li>
     *   <li>{@code Sunset: 2026-04-19T00:00:00Z} - Date after which endpoint will be removed</li>
     *   <li>{@code Link: <new-url>; rel="alternate"} - Points to new URL</li>
     *   <li>{@code X-API-Warn: ...} - Human-readable warning message</li>
     * </ul>
     * 
     * @param request HTTP request (to check which URL was called)
     * @param response HTTP response (where headers will be added)
     * @param oldUrlPrefix Old URL prefix to check against (e.g., "/api/studies")
     * @param newUrl New URL to redirect clients to (e.g., "/api/v1/study-design/studies")
     */
    public static void addDeprecationHeaders(
            HttpServletRequest request,
            HttpServletResponse response,
            String oldUrlPrefix,
            String newUrl) {
        
        // Validate inputs
        if (request == null || response == null || oldUrlPrefix == null || newUrl == null) {
            log.warn("Cannot add deprecation headers - null parameter provided");
            return;
        }
        
        String requestUri = request.getRequestURI();
        
        // Check if old URL was used
        if (requestUri.startsWith(oldUrlPrefix)) {
            // Add deprecation indicator
            response.setHeader(DEPRECATION_HEADER, "true");
            
            // Add sunset date (when endpoint will be removed)
            response.setHeader(SUNSET_HEADER, SUNSET_DATE);
            
            // Add link to new URL (RFC 8288 format)
            response.setHeader(LINK_HEADER, String.format("<%s>; rel=\"alternate\"", newUrl));
            
            // Add human-readable warning
            response.setHeader(API_WARN_HEADER,
                String.format("This endpoint is deprecated and will be removed on %s. " +
                            "Please migrate to: %s", SUNSET_DATE, newUrl));
            
            // Log deprecation usage for monitoring
            log.warn("Deprecated API endpoint used: {} -> Migrate to: {}", 
                    requestUri, newUrl);
        }
    }
    
    /**
     * Add deprecation headers with custom sunset date
     * 
     * <p>Allows specifying a custom sunset date for endpoints with different
     * deprecation timelines.</p>
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param oldUrlPrefix Old URL prefix to check against
     * @param newUrl New URL to redirect clients to
     * @param sunsetDate Custom sunset date (ISO 8601 format: "2026-04-19T00:00:00Z")
     */
    public static void addDeprecationHeaders(
            HttpServletRequest request,
            HttpServletResponse response,
            String oldUrlPrefix,
            String newUrl,
            String sunsetDate) {
        
        // Validate inputs
        if (request == null || response == null || oldUrlPrefix == null || 
            newUrl == null || sunsetDate == null) {
            log.warn("Cannot add deprecation headers - null parameter provided");
            return;
        }
        
        String requestUri = request.getRequestURI();
        
        // Check if old URL was used
        if (requestUri.startsWith(oldUrlPrefix)) {
            // Add deprecation indicator
            response.setHeader(DEPRECATION_HEADER, "true");
            
            // Add custom sunset date
            response.setHeader(SUNSET_HEADER, sunsetDate);
            
            // Add link to new URL
            response.setHeader(LINK_HEADER, String.format("<%s>; rel=\"alternate\"", newUrl));
            
            // Add human-readable warning with custom date
            response.setHeader(API_WARN_HEADER,
                String.format("This endpoint is deprecated and will be removed on %s. " +
                            "Please migrate to: %s", sunsetDate, newUrl));
            
            // Log deprecation usage
            log.warn("Deprecated API endpoint used: {} -> Migrate to: {} by {}", 
                    requestUri, newUrl, sunsetDate);
        }
    }
    
    /**
     * Add deprecation headers with additional context
     * 
     * <p>Provides more detailed information about the deprecation, including
     * reason and migration guide link.</p>
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param oldUrlPrefix Old URL prefix to check against
     * @param newUrl New URL to redirect clients to
     * @param reason Deprecation reason
     * @param migrationGuideUrl URL to migration guide documentation
     */
    public static void addDeprecationHeadersWithContext(
            HttpServletRequest request,
            HttpServletResponse response,
            String oldUrlPrefix,
            String newUrl,
            String reason,
            String migrationGuideUrl) {
        
        // Validate inputs
        if (request == null || response == null || oldUrlPrefix == null || newUrl == null) {
            log.warn("Cannot add deprecation headers - null parameter provided");
            return;
        }
        
        String requestUri = request.getRequestURI();
        
        // Check if old URL was used
        if (requestUri.startsWith(oldUrlPrefix)) {
            // Add standard deprecation headers
            response.setHeader(DEPRECATION_HEADER, "true");
            response.setHeader(SUNSET_HEADER, SUNSET_DATE);
            response.setHeader(LINK_HEADER, String.format("<%s>; rel=\"alternate\"", newUrl));
            
            // Build detailed warning message
            StringBuilder warningMsg = new StringBuilder();
            warningMsg.append(String.format("This endpoint is deprecated and will be removed on %s. ", 
                                          SUNSET_DATE));
            warningMsg.append(String.format("Please migrate to: %s. ", newUrl));
            
            if (reason != null && !reason.isEmpty()) {
                warningMsg.append(String.format("Reason: %s. ", reason));
            }
            
            if (migrationGuideUrl != null && !migrationGuideUrl.isEmpty()) {
                warningMsg.append(String.format("Migration guide: %s", migrationGuideUrl));
            }
            
            response.setHeader(API_WARN_HEADER, warningMsg.toString());
            
            // Log detailed deprecation usage
            log.warn("Deprecated API endpoint used: {} -> Migrate to: {} | Reason: {} | Guide: {}", 
                    requestUri, newUrl, reason, migrationGuideUrl);
        }
    }
    
    /**
     * Check if a request is using a deprecated URL
     * 
     * <p>Useful for conditional logic or metrics collection.</p>
     * 
     * @param request HTTP request
     * @param oldUrlPrefix Old URL prefix to check against
     * @return true if request is using deprecated URL, false otherwise
     */
    public static boolean isUsingDeprecatedUrl(HttpServletRequest request, String oldUrlPrefix) {
        if (request == null || oldUrlPrefix == null) {
            return false;
        }
        
        return request.getRequestURI().startsWith(oldUrlPrefix);
    }
    
    /**
     * Get formatted current timestamp for deprecation logging
     * 
     * @return Current timestamp in ISO 8601 format
     */
    public static String getCurrentTimestamp() {
        return ZonedDateTime.now().format(DateTimeFormatter.ISO_INSTANT);
    }
}
