package com.clinprecision.api.gateway.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Set a single origin - no wildcards when using allowCredentials
        config.addAllowedOrigin("http://localhost:3000");
        
        // Allow all methods and headers
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Expose authentication headers to the frontend
        config.addExposedHeader("Authorization");
        config.addExposedHeader("token");
        config.addExposedHeader("userId");
        
        // Expose custom error message header for user-friendly error handling
        config.addExposedHeader("X-Error-Message");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}