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
                .route("admin-ws-create", r -> r
                        .path("/admin-ws/users")
                        .and()
                        .method("POST")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // users-ws-get-all (no auth required)
                .route("admin-ws-get-all", r -> r
                        .path("/admin-ws/users")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://admin-ws")
                )
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
                // User types - GET all and GET by ID (no auth required for read access)
                .route("admin-ws-usertypes-get", r -> r
                        .path("/admin-ws/usertypes/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://admin-ws")
                )
                // User types - POST, PUT, DELETE (requires auth)
                .route("admin-ws-usertypes-write", r -> r
                        .path("/admin-ws/usertypes/**")
                        .and()
                        .method("POST", "PUT", "DELETE")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // User-UserType assignments (requires auth)
                .route("admin-ws-user-types", r -> r
                        .path("/admin-ws/users/*/types/**")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // Organizations - GET all and GET by ID (no auth required for read access)
                .route("admin-ws-organizations-get", r -> r
                        .path("/admin-ws/organizations/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://admin-ws")
                )
                // Organizations - POST, PUT, DELETE (requires auth)
                .route("admin-ws-organizations-write", r -> r
                        .path("/admin-ws/organizations/**")
                        .and()
                        .method("POST", "PUT", "DELETE")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://admin-ws")
                )
                // Organization types endpoint
                .route("admin-ws-organization-types", r -> r
                        .path("/admin-ws/organization-types/**")
                        .and()
                        .method("GET","POST","PUT","DELETE")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/organization-types/(?<segment>.*)", "/organizations/organization-types/${segment}")
                                .rewritePath("/admin-ws/organization-types", "/organizations/organization-types")
                        )
                        .uri("lb://admin-ws")
                )
                .route("admin-ws-roles-get", r -> r
                    .path("/admin-ws/roles/**")
                    .and()
                    .header("Authorization", "Bearer (.*)")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                            .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                    )
                    .uri("lb://admin-ws")
                )
                // Form Templates - GET operations (no auth required for read access)
                .route("admin-ws-form-templates-get", r -> r
                        .path("/admin-ws/form-templates/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://admin-ws")
                )
                // Form Templates - POST, PUT, DELETE, PATCH operations (requires auth)
                .route("admin-ws-form-templates-write", r -> r
                        .path("/admin-ws/form-templates/**")
                        .and()
                        .method("POST", "PUT", "DELETE", "PATCH")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/admin-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
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
                
                // Study Design Service - Direct routes for studies, arms, and visits (no auth required)
                .route("study-design-direct", r -> r
                    .path("/studies/**", "/arms/**", "/api/studies/**", "/api/arms/**", "/api/visits/**")
                    .and()
                    .method("GET","POST","PUT","DELETE","PATCH")
                    .filters(f -> f
                            .removeRequestHeader("Cookie")
                    )
                    .uri("lb://study-design-ws")
                )
                .build();
    }
}
