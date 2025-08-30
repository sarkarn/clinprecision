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
        this.claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getJwtSubject() {
        return claims.getSubject();
    }

    public Collection<SimpleGrantedAuthority> getUserAuthorities() {
        Object authorities = claims.get("authorities");
        if (authorities instanceof List<?>) {
            return ((List<?>) authorities).stream()
                    .map(Object::toString)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
}