package com.example.server.security.JWT;

import com.example.server.security.Config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final JwtConfig jwtConfig;

    public JwtService(SecretKey key, JwtConfig jwtConfig) {
        this.key       = key;
        this.jwtConfig = jwtConfig;
    }

    /**
     * Generates a JWT token from authentication
     * Using email as the subject for consistent identification
     */
    public String generateToken(Authentication authentication) {

        String email     = authentication.getName();
        Date currentDate = new Date();
        Date expireDate  = new Date(currentDate.getTime() + jwtConfig.getJwtExpiration());

        return Jwts.builder()
                .setSubject(email) // Using email as the subject for identification
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Generates a temporary JWT token for actions like password reset or email verification
     */
    public String generateTemporaryToken(Authentication authentication) {
        String email     = authentication.getName();
        Date currentDate = new Date();
        Date expireDate  = new Date(currentDate.getTime() + jwtConfig.getTemporaryJwtExpiration());

        return Jwts.builder()
                .setSubject(email) // Using email as the subject for identification
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extracts email from JWT token
     * (Since we store email as the subject in the token)
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * Extracts email from authorization header (Bearer token)
     */
    public String getEmailFromAuthHeader(String authorizationHeader) throws Exception {
        if (authorizationHeader == null) {
            throw new Exception("Authorization Header is null. Unable to decode JWT");
        }

        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7)
                : authorizationHeader;

        return getEmailFromToken(token);
    }

    /**
     * Validates a JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (ExpiredJwtException ex) {
            throw new AuthenticationCredentialsNotFoundException("JWT has expired", ex);
        } catch (SignatureException ex) {
            throw new AuthenticationCredentialsNotFoundException("Invalid JWT signature", ex);
        } catch (MalformedJwtException ex) {
            throw new AuthenticationCredentialsNotFoundException("Invalid JWT token", ex);
        } catch (UnsupportedJwtException ex) {
            throw new AuthenticationCredentialsNotFoundException("Unsupported JWT token", ex);
        } catch (IllegalArgumentException ex) {
            throw new AuthenticationCredentialsNotFoundException("JWT claims string is empty", ex);
        }
    }
}
