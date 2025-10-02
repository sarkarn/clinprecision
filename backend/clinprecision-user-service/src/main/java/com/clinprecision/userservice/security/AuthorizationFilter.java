package com.clinprecision.userservice.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


public class AuthorizationFilter extends BasicAuthenticationFilter {
	
	private Environment environment;

	public AuthorizationFilter(AuthenticationManager authenticationManager,
			Environment environment) {
		super(authenticationManager);
		this.environment = environment;
	}
	
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain) throws IOException, ServletException {

        System.out.println("=== AUTHORIZATION FILTER - DO FILTER INTERNAL ====");
        System.out.println("Request URI: " + req.getRequestURI());
        System.out.println("Request Method: " + req.getMethod());
        
        String authorizationHeader = req.getHeader(environment.getProperty("authorization.token.header.name"));
        System.out.println("Authorization header: " + (authorizationHeader != null ? "Present" : "Not present"));
        
        if (authorizationHeader == null
                || !authorizationHeader.startsWith(environment.getProperty("authorization.token.header.prefix"))) {
            System.out.println("No valid authorization header, proceeding without authentication");
            chain.doFilter(req, res);
            return;
        }

        System.out.println("Valid authorization header found, attempting to get authentication");
        UsernamePasswordAuthenticationToken authentication = getAuthentication(req);
        
        if (authentication != null) {
            System.out.println("Authentication created successfully for user: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
        } else {
            System.out.println("Failed to create authentication from token");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(req, res);
        System.out.println("=== AUTHORIZATION FILTER - COMPLETE ====");
    }
    
    private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest req) {
        System.out.println("=== AUTHORIZATION FILTER - GET AUTHENTICATION ====");
        
        String authorizationHeader = req.getHeader(environment.getProperty("authorization.token.header.name"));
        System.out.println("Authorization header name property: " + environment.getProperty("authorization.token.header.name"));
        System.out.println("Authorization header value: " + authorizationHeader);

        if (authorizationHeader == null) {
            System.out.println("Authorization header is null, returning null authentication");
            return null;
        }

        String headerPrefix = environment.getProperty("authorization.token.header.prefix");
        System.out.println("Expected header prefix: " + headerPrefix);
        
        String token = authorizationHeader.replace(headerPrefix, "").trim();
        System.out.println("Extracted token length: " + token.length());
        System.out.println("Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
        
        String tokenSecret = environment.getProperty("token.secret");
        System.out.println("Token secret configured: " + (tokenSecret != null ? "YES (length: " + tokenSecret.length() + ")" : "NO"));
        
        if(tokenSecret == null) {
            System.err.println("Token secret is null! Cannot validate token.");
            return null;
        }
        
        try {
            System.out.println("Creating JwtClaimsParser...");
            JwtClaimsParser jwtClaimsParser = new JwtClaimsParser(token, tokenSecret);
            
            String userId = jwtClaimsParser.getJwtSubject();
            System.out.println("JWT subject (userId): " + userId);
            
            if (userId == null) {
                System.err.println("JWT subject is null, cannot create authentication");
                return null;
            }

            Collection<SimpleGrantedAuthority> authorities = jwtClaimsParser.getUserAuthorities();
            System.out.println("JWT authorities: " + authorities);
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);
            System.out.println("Created authentication token for user: " + userId + " with authorities: " + authorities);
            System.out.println("=== AUTHORIZATION FILTER - GET AUTHENTICATION SUCCESS ====");
            
            return authToken;
            
        } catch (Exception e) {
            System.err.println("=== AUTHORIZATION FILTER - GET AUTHENTICATION FAILED ====");
            System.err.println("Error creating authentication from JWT: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    

}
