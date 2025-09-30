package com.clinprecision.userservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class JwtClaimsParser {
    private final Claims claims;

    public JwtClaimsParser(String token, String secret) {
        System.out.println("=== JWT CLAIMS PARSER - CONSTRUCTOR ====");
        System.out.println("Token length: " + (token != null ? token.length() : "NULL"));
        System.out.println("Secret length: " + (secret != null ? secret.length() : "NULL"));
        
        try {
            System.out.println("Attempting to parse JWT token...");
            this.claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            System.out.println("JWT token parsed successfully");
            System.out.println("Claims subject: " + claims.getSubject());
            System.out.println("Claims size: " + claims.size());
            System.out.println("All claims: " + claims);
        } catch (Exception e) {
            System.err.println("=== JWT PARSING FAILED ====");
            System.err.println("Error parsing JWT token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public String getJwtSubject() {
        System.out.println("Getting JWT subject: " + (claims != null ? claims.getSubject() : "NULL CLAIMS"));
        return claims.getSubject();
    }

    public Collection<SimpleGrantedAuthority> getUserAuthorities() {
        System.out.println("=== GET USER AUTHORITIES FROM JWT ====");
        Object authorities = claims.get("authorities");
        System.out.println("Authorities claim type: " + (authorities != null ? authorities.getClass().getName() : "NULL"));
        System.out.println("Authorities claim value: " + authorities);
        
        if (authorities instanceof List<?>) {
            Collection<SimpleGrantedAuthority> result = ((List<?>) authorities).stream()
                    .map(Object::toString)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
            System.out.println("Converted authorities: " + result);
            return result;
        }
        
        System.out.println("No authorities found in token, returning empty list");
        return List.of();
    }
}