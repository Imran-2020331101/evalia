package com.example.server.security.JWT;

import com.example.server.support.JwtTestUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String EMAIL = "jane@example.com";

    private JwtService jwtService;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        jwtService = JwtTestUtil.jwtService();
        authentication = new UsernamePasswordAuthenticationToken(EMAIL, null, Collections.emptyList());
    }

    private Claims claims(String token) {
        return Jwts.parserBuilder().setSigningKey(JwtTestUtil.key()).build().parseClaimsJws(token).getBody();
    }

    @Test
    void generateTokenUsesEmailAsSubjectAndConfiguredExpiry() {
        String token = jwtService.generateToken(authentication);

        Claims claims = claims(token);
        assertThat(claims.getSubject()).isEqualTo(EMAIL);
        long lifetime = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertThat(lifetime).isBetween(JwtTestUtil.EXPIRATION - 2_000, JwtTestUtil.EXPIRATION + 2_000);
    }

    @Test
    void generateTemporaryTokenUsesTemporaryExpiry() {
        String token = jwtService.generateTemporaryToken(authentication);

        Claims claims = claims(token);
        assertThat(claims.getSubject()).isEqualTo(EMAIL);
        long lifetime = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertThat(lifetime).isBetween(JwtTestUtil.TEMP_EXPIRATION - 2_000, JwtTestUtil.TEMP_EXPIRATION + 2_000);
    }

    @Test
    void getEmailFromTokenReturnsSubject() {
        assertThat(jwtService.getEmailFromToken(jwtService.generateToken(authentication))).isEqualTo(EMAIL);
    }

    @Test
    void getEmailFromAuthHeaderStripsBearerPrefix() throws Exception {
        String token = jwtService.generateToken(authentication);

        assertThat(jwtService.getEmailFromAuthHeader("Bearer " + token)).isEqualTo(EMAIL);
    }

    @Test
    void getEmailFromAuthHeaderAcceptsRawToken() throws Exception {
        String token = jwtService.generateToken(authentication);

        assertThat(jwtService.getEmailFromAuthHeader(token)).isEqualTo(EMAIL);
    }

    @Test
    void getEmailFromAuthHeaderRejectsNull() {
        assertThatThrownBy(() -> jwtService.getEmailFromAuthHeader(null))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Authorization Header is null");
    }

    @Test
    void validateTokenAcceptsValidToken() {
        assertThat(jwtService.validateToken(jwtService.generateToken(authentication))).isTrue();
    }

    @Test
    void validateTokenRejectsExpiredToken() {
        assertThatThrownBy(() -> jwtService.validateToken(JwtTestUtil.expiredToken(EMAIL)))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("JWT has expired");
    }

    @Test
    void validateTokenRejectsBadSignature() {
        assertThatThrownBy(() -> jwtService.validateToken(JwtTestUtil.tokenWithWrongKey(EMAIL)))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("Invalid JWT signature");
    }

    @Test
    void validateTokenRejectsMalformedToken() {
        assertThatThrownBy(() -> jwtService.validateToken("not-a-jwt"))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("Invalid JWT token");
    }

    @Test
    void validateTokenRejectsUnsignedToken() {
        assertThatThrownBy(() -> jwtService.validateToken(JwtTestUtil.unsignedToken(EMAIL)))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("Unsupported JWT token");
    }

    @Test
    void validateTokenRejectsEmptyToken() {
        assertThatThrownBy(() -> jwtService.validateToken(""))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("JWT claims string is empty");
    }

    @Test
    void tokenIssuedWithShortKeyCannotBeSignedWithHs512() {
        // JwtConfig falls back to a 44 byte default secret (jwt.secret unset) which is too short for HS512.
        var shortKey = Keys.hmacShaKeyFor(
                "defaultSecretKeyThatIsAtLeast32CharactersLong".getBytes(StandardCharsets.UTF_8));
        JwtService weak = new JwtService(shortKey, JwtTestUtil.jwtConfig(1000, 1000));

        assertThatThrownBy(() -> weak.generateToken(authentication)).isInstanceOf(WeakKeyException.class);
    }
}
