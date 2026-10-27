package com.example.server.support;

import com.example.server.security.Config.JwtConfig;
import com.example.server.security.JWT.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Helpers to build a real {@link JwtService} and raw JWTs for tests. */
public final class JwtTestUtil {

    /** 80 bytes, long enough for HS512. */
    public static final String SECRET =
            "test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-12345678";
    public static final long EXPIRATION = 3_600_000L;
    public static final long TEMP_EXPIRATION = 600_000L;

    private JwtTestUtil() {
    }

    public static SecretKey key() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public static JwtConfig jwtConfig(long expiration, long temporaryExpiration) {
        JwtConfig config = new JwtConfig();
        ReflectionTestUtils.setField(config, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(config, "jwtExpiration", expiration);
        ReflectionTestUtils.setField(config, "temporaryJwtExpiration", temporaryExpiration);
        return config;
    }

    public static JwtService jwtService() {
        return new JwtService(key(), jwtConfig(EXPIRATION, TEMP_EXPIRATION));
    }

    /** Builds a token signed with the test key (HS512) with an explicit expiry offset from now. */
    public static String token(String email, long expiresInMillis) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(now - 5_000))
                .setExpiration(new Date(now + expiresInMillis))
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    public static String validToken(String email) {
        return token(email, EXPIRATION);
    }

    public static String expiredToken(String email) {
        return token(email, -1_000);
    }

    /** Token signed with a different key (same algorithm) so the signature check fails. */
    public static String tokenWithWrongKey(String email) {
        SecretKey other = Keys.hmacShaKeyFor(
                "another-secret-another-secret-another-secret-another-secret-another-secret-0000"
                        .getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(email)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(other, SignatureAlgorithm.HS512)
                .compact();
    }

    /** Unsigned token: parsing with parseClaimsJws raises UnsupportedJwtException. */
    public static String unsignedToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .compact();
    }
}
