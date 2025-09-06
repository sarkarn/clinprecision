package com.clinprecision.api.gateway.config;


import com.clinprecision.api.gateway.AuthorizationHeaderFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
                // users-ws
                .route("users-ws", r -> r
                        .path("/users-ws/users")
                        .and()
                        .method("POST")
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
                ).route("users-ws-h2-console", r -> r
                        .path("/users-ws/h2-console")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .removeRequestHeader("Cookie")
                                .rewritePath("/users-ws/(?<segment>.*)", "/${segment}")
                        )
                        .uri("lb://users-ws")
                )
                .build();
    }
}