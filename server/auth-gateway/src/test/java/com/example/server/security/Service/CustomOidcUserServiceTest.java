package com.example.server.security.Service;

import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * The registration has no user-info endpoint, so OidcUserService builds the user from the ID token alone
 * and never calls the network.
 */
@ExtendWith(MockitoExtension.class)
class CustomOidcUserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;

    private CustomOidcUserService service;

    @BeforeEach
    void setUp() {
        service = new CustomOidcUserService(userRepository, roleRepository);
    }

    private OidcUser load(Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "sub-1");
        claims.put("iss", "https://issuer.test");
        claims.putAll(extraClaims);
        OidcIdToken idToken = new OidcIdToken("id-token", Instant.now(), Instant.now().plusSeconds(60), claims);
        ClientRegistration registration = ClientRegistration.withRegistrationId("google")
                .clientId("client").clientSecret("secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost/callback")
                .authorizationUri("http://idp.test/auth")
                .tokenUri("http://idp.test/token")
                .scope("openid", "email")
                .clientName("Google")
                .build();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "tok",
                Instant.now(), Instant.now().plusSeconds(60));
        return service.loadUser(new OidcUserRequest(registration, accessToken, idToken));
    }

    @Test
    void newOidcUserIsCreatedWithDefaultRole() {
        Role userRole = TestDataFactory.role("USER");
        when(userRepository.findByEmail("o@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(userEntity.class))).thenAnswer(inv -> {
            userEntity u = inv.getArgument(0);
            u.setId(new ObjectId());
            return u;
        });

        OidcUser result = load(Map.of("email", "o@example.com", "name", "Olivia"));

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        userEntity saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("o@example.com");
        assertThat(saved.getName()).isEqualTo("Olivia");
        assertThat(saved.getUsername()).isEqualTo("o@example.com");
        assertThat(saved.getProvider()).isEqualTo("google");
        assertThat(saved.getProviderId()).isEqualTo("sub-1");
        assertThat(saved.isEnabled()).isTrue();
        assertThat(saved.isEmailVerified()).isTrue();
        assertThat(saved.getRoles()).containsExactly(userRole);

        assertThat(result.getName()).isEqualTo("sub-1");
        assertThat(result.getAuthorities()).extracting(Object::toString).containsExactly("ROLE_USER");
        assertThat(result.getIdToken().getTokenValue()).isEqualTo("id-token");
    }

    @Test
    void existingLocalUserIsLinkedToProvider() {
        userEntity existing = TestDataFactory.user("o@example.com", "USER");
        existing.setEmailVerified(false);
        when(userRepository.findByEmail("o@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(existing)).thenReturn(existing);

        load(Map.of("email", "o@example.com"));

        assertThat(existing.getProvider()).isEqualTo("google");
        assertThat(existing.getProviderId()).isEqualTo("sub-1");
        assertThat(existing.isEmailVerified()).isTrue();
        assertThat(existing.isEnabled()).isTrue();
        verifyNoInteractions(roleRepository);
    }

    @Test
    void existingProviderUserIsNotModified() {
        userEntity existing = TestDataFactory.user("o@example.com", "USER");
        existing.setProvider("github");
        when(userRepository.findByEmail("o@example.com")).thenReturn(Optional.of(existing));

        load(Map.of("email", "o@example.com"));

        verify(userRepository, never()).save(any());
        assertThat(existing.getProvider()).isEqualTo("github");
    }

    @Test
    void existingUserWithEmptyProviderIsLinked() {
        userEntity existing = TestDataFactory.user("o@example.com", "USER");
        existing.setProvider("");
        when(userRepository.findByEmail("o@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(existing)).thenReturn(existing);

        load(Map.of("email", "o@example.com"));

        assertThat(existing.getProvider()).isEqualTo("google");
    }

    @Test
    void missingEmailClaimIsRejected() {
        assertThatThrownBy(() -> load(Map.of("name", "NoEmail")))
                .isInstanceOf(InternalAuthenticationServiceException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void emptyEmailClaimIsRejected() {
        assertThatThrownBy(() -> load(Map.of("email", "")))
                .isInstanceOf(InternalAuthenticationServiceException.class);
    }

    @Test
    void missingDefaultRoleIsWrapped() {
        when(userRepository.findByEmail("o@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> load(Map.of("email", "o@example.com")))
                .isInstanceOf(InternalAuthenticationServiceException.class)
                .hasMessage("Default role not found");
    }
}
