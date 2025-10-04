package com.clinprecision.organizationservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@EnableMethodSecurity(prePostEnabled=true)
@Configuration
@EnableWebSecurity
public class WebSecurity {
    
    @Bean
    protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
        // Configure security
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)  // Let the API Gateway handle CORS
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll())  // Permit all requests - auth is handled by API Gateway
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }
}
