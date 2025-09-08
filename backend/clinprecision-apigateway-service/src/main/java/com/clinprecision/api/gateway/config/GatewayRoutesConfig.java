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
                // users-status-check
                .route("users-status-check", r -> r
                        .path("/users-ws/users/status/check")
                        .and()
                        .method("GET")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // users-ws (POST requires auth)
                .route("users-ws-create", r -> r
                        .path("/users-ws/users")
                        .and()
                        .method("POST")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // users-ws-get-all (no auth required)
                .route("users-ws-get-all", r -> r
                        .path("/users-ws/users")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://users-ws")
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
                .route("users-ws-get-update-delete", r -> r
                        .path("/users-ws/users/**")
                        .and()
                        .method("GET", "PUT", "DELETE", "OPTIONS")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                // Expose headers but don't set CORS headers
                                .addResponseHeader("Access-Control-Expose-Headers", "Authorization, token, userId")
                                .filter(authFilter)
                        ).uri("lb://users-ws")
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
                .route("users-ws-usertypes-get", r -> r
                        .path("/users-ws/usertypes/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://users-ws")
                )
                // User types - POST, PUT, DELETE (requires auth)
                .route("users-ws-usertypes-write", r -> r
                        .path("/users-ws/usertypes/**")
                        .and()
                        .method("POST", "PUT", "DELETE")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // User-UserType assignments (requires auth)
                .route("users-ws-user-types", r -> r
                        .path("/users-ws/users/*/types/**")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // Organizations - GET all and GET by ID (no auth required for read access)
                .route("users-ws-organizations-get", r -> r
                        .path("/users-ws/organizations/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://users-ws")
                )
                // Organizations - POST, PUT, DELETE (requires auth)
                .route("users-ws-organizations-write", r -> r
                        .path("/users-ws/organizations/**")
                        .and()
                        .method("POST", "PUT", "DELETE")
                        .and()
                        .header("Authorization", "Bearer (.*)")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                                .filter(authFilter)
                        )
                        .uri("lb://users-ws")
                )
                // Organization types endpoint
                .route("users-ws-organization-types", r -> r
                        .path("/users-ws/organization-types/**")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/organization-types/(?<segment>.*)", "/organizations/organization-types/${segment}")
                                .rewritePath("/users-ws/organization-types", "/organizations/organization-types")
                        )
                        .uri("lb://users-ws")
                )
                .build();
    }
}
