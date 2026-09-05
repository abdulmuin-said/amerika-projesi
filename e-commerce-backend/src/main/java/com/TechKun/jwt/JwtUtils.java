package com.TechKun.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.Objects;

@Component
public class JwtUtils {
    private static final String SECRET = "mysecretkeymysecretkeymysecretkey123"; // Must be 256-bit for HS256
    public static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

    @Data
    @AllArgsConstructor
    public static class JwtToken {
        private String token;
        private Long expiresAt;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public JwtToken generateToken(String username) {
        return this.generateToken(username, null);
    }
    public JwtToken generateToken(String username, Claims claims) {
        JwtBuilder jwtBuilder = Jwts.builder();
        if (Objects.nonNull(claims))
            jwtBuilder = jwtBuilder.claims(claims);

        long currentTime = System.currentTimeMillis();
        String token = jwtBuilder
                .subject(username)
                 .issuedAt(new Date(currentTime))
                .expiration(new Date(currentTime + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
        return new JwtToken(token, currentTime + EXPIRATION_TIME);
    }

    public Jws<Claims> parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith((SecretKey)  getSigningKey())
                    .build()
                    .parseSignedClaims(token);
        } catch (JwtException e) {
            return null;
        }
    }
}

