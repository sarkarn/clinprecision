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
                .route("admin-ws-sites-get", r -> r
                        .path("/admin-ws/sites/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                        )
                        .uri("lb://admin-ws")
                )
                .route("admin-ws-sites-write", r -> r
                        .path("/admin-ws/sites/**")
                        .and()
                        .method("POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // users-ws-get-update-delete
                .route("admin-ws-get-update-delete", r -> r
                        .path("/admin-ws/users/**")
                        .and()
                        .method("GET", "PUT", "DELETE", "OPTIONS")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                // Expose headers but don't set CORS headers
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        ).uri("lb://admin-ws")
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
                .route("admin-ws-api", r -> r
                        .path("/admin-ws/api/**")
                        .and()
                        .method("GET", "POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // Public GET routes (no auth required)
                .route("admin-ws-get", r -> r
                        .path("/admin-ws/**")
                        .and()
                        .method("GET")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://admin-ws")
                )
                // Protected write routes (auth required)
                .route("admin-ws-write", r -> r
                        .path("/admin-ws/**")
                        .and()
                        .method("POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter) // enforce authentication
                        )
                        .uri("lb://admin-ws")
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
                .build();
    }
}
