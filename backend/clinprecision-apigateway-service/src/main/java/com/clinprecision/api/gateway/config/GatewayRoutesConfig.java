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
                // Study Database Build API - Route to Study Design Service (migrated from Data Capture)
                .route("study-database-build-api", r -> r
                    .path("/api/v1/study-database-builds/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                    )
                    .uri("lb://study-design-ws")
                )
                
                // Study Design Service - API routes
                .route("study-design-ws-api", r -> r
                    .path("/study-design-ws/api/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                    .and()
                    .header("Authorization", "Bearer (.*)")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/study-design-ws/api/(?<segment>.*)", "/api/${segment}")
                            .filter(authFilter)
                    )
                    .uri("lb://study-design-ws")
                )
                
                // Study Design Service - Direct routes for studies, arms, visits, and study-versions (no auth required)
                .route("study-design-direct", r -> r
                    .path("/studies/**", "/arms/**", "/api/studies/**", "/api/arms/**", "/api/visits/**", "/api/study-versions/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                    )
                    .uri("lb://study-design-ws")
                )
                
                // Data Capture Service - API routes
                .route("datacapture-ws-api", r -> r
                    .path("/datacapture-ws/api/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/datacapture-ws/(?<segment>.*)", "/${segment}")
                    )
                    .uri("lb://datacapture-ws")
                )
                
                // Data Capture Service - Direct routes (if needed)
                .route("datacapture-ws-direct", r -> r
                    .path("/datacapture/**")
                    .and()
                    .method("GET", "POST", "PUT", "DELETE", "PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                    )
                    .uri("lb://datacapture-ws")
                )
                .build();
    }
}
