package com.clinprecision.api.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.clinprecision.api.gateway.AuthorizationHeaderFilter;

@Configuration
public class GatewayRoutesConfig {

    private final AuthorizationHeaderFilter authFilter;

    public GatewayRoutesConfig(AuthorizationHeaderFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // users-ws-login
                .route("users-ws-login", r -> r
                        .path("/users-ws/users/login")
                        .and()
                        .method("POST")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                // Expose headers but don't set CORS headers
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                        )
                        .uri("lb://users-ws")
                )
                // Site Management Routes - specific routes for better path matching
                .route("site-ws-sites-get", r -> r
                        .path("/site-ws/sites/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                        )
                        .uri("lb://site-ws")
                )
                .route("site-ws-sites-write", r -> r
                        .path("/site-ws/sites/**")
                        .and()
                        .method("POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://site-ws")
                )
                // Users Service - API routes for roles, user-study-roles, and user types (with /api/ prefix)
                .route("users-ws-api", r -> r
                        .path("/users-ws/api/**")
                        .and()
                        .method("GET", "POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // Users Service - Direct routes for users, roles, and usertypes (no /api/ prefix)
                .route("users-ws-direct", r -> r
                        .path("/users-ws/users/**", "/users-ws/roles/**", "/users-ws/usertypes/**")
                        .and()
                        .method("GET", "POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // Organization Service - API routes for organizations and contacts
                .route("organization-ws-api", r -> r
                        .path("/organization-ws/api/**")
                        .and()
                        .method("GET", "POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/organization-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://organization-ws")
                )
                .route("users-ws-h2-console", r -> r
                        .path("/users-ws/h2-console")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://users-ws")
                )
                // Admin Service API routes (for controllers with /api/ prefix)
                .route("site-ws-api", r -> r
                        .path("/site-ws/api/**")
                        .and()
                        .method("GET", "POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://site-ws")
                )
                // Public GET routes (no auth required)
                .route("site-ws-get", r -> r
                        .path("/site-ws/**")
                        .and()
                        .method("GET")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://site-ws")
                )
                // Protected write routes (auth required)
                .route("site-ws-write", r -> r
                        .path("/site-ws/**")
                        .and()
                        .method("POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/site-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter) // enforce authentication
                        )
                        .uri("lb://site-ws")
                )
                // Clinical Operations Service - API routes (merged from study-design-ws and datacapture-ws)
                .route("clinops-ws-api", r -> r
                    .path("/clinops-ws/api/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                    .and()
                    .header("Authorization", "Bearer (.*)")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/clinops-ws/api/(?<segment>.*)", "/api/${segment}")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                            .filter(authFilter)
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Study Design Module - New DDD-aligned routes (highest priority)
                .route("clinops-study-design-v1", r -> r
                    .path("/api/v1/study-design/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Clinical Operations Service - Study Database Build API
                .route("clinops-database-build-api", r -> r
                    .path("/api/v1/study-database-builds/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Clinical Operations Service - Patient Enrollment API
                .route("clinops-patients-api", r -> r
                    .path("/api/v1/patients/**", "/api/v1/patient-query/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Clinical Operations Service - Direct routes for studies, arms, visits, protocol-versions, study-versions (backward compatibility)
                .route("clinops-direct", r -> r
                    .path("/studies/**", "/arms/**", "/api/studies/**", "/api/arms/**", "/api/visits/**", "/api/protocol-versions/**", "/api/study-versions/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                    .and()
                    .header("Authorization", "Bearer (.*)")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.3: Study Design Management - Legacy routes (deprecated)
                // These routes redirect old URLs to clinops-ws where dual @RequestMapping handlers will add deprecation headers
                .route("clinops-study-design-legacy", r -> r
                    .path("/api/clinops/study-design/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                .route("clinops-form-bindings-legacy", r -> r
                    .path("/api/form-bindings/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.3 Phase 2: Form Definitions & Templates - Legacy routes (deprecated)
                .route("clinops-form-definitions-legacy", r -> r
                    .path("/api/form-definitions/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                .route("clinops-form-templates-legacy", r -> r
                    .path("/api/form-templates/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.4: Document Management - Legacy route (deprecated)
                .route("clinops-documents-legacy", r -> r
                    .path("/api/v1/documents/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.5: Metadata Management - Legacy route (deprecated)
                .route("clinops-admin-codelists-legacy", r -> r
                    .path("/api/admin/codelists/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.6: Study Operations - New versioned route
                .route("clinops-study-operations-v1", r -> r
                    .path("/api/v1/study-operations/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Module 1.6: Visit Config - Legacy route (deprecated)
                .route("clinops-unscheduled-visit-config-legacy", r -> r
                    .path("/api/clinops/unscheduled-visit-config/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId, Deprecation, Sunset, Link, X-API-Warn")
                    )
                    .uri("lb://clinops-ws")
                )
                
                // Legacy routes for backward compatibility (redirect to clinops-ws)
                .route("study-design-ws-legacy", r -> r
                    .path("/study-design-ws/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/study-design-ws/(?<segment>.*)", "/${segment}")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://clinops-ws")
                )
                
                .route("datacapture-ws-legacy", r -> r
                    .path("/datacapture-ws/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/datacapture-ws/(?<segment>.*)", "/${segment}")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://clinops-ws")
                )
                .build();
    }
}
