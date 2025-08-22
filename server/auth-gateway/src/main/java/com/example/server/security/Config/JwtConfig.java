package com.example.server.security.Config;

import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret:defaultSecretKeyThatIsAtLeast32CharactersLong}")
    private String jwtSecret;

    @Getter
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Getter
    @Value("${jwt.expiration:600}")
    private long temporaryJwtExpiration;

    @Bean
    public SecretKey secretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

}
