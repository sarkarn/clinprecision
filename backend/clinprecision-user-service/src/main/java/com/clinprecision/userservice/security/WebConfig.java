package com.clinprecision.userservice.security;

import org.springframework.context.annotation.Configuration;

// WebConfig class has been disabled to avoid CORS conflicts with API Gateway
// The API Gateway is now solely responsible for CORS configuration
//@Configuration
public class WebConfig {

    /*
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization", "token","userId")
                        .allowCredentials(true);
            }
        };
    }
    */
}