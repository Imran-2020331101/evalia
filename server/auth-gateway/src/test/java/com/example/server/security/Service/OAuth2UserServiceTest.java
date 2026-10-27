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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * The provider call (DefaultOAuth2UserService#loadUser) is served by MockRestServiceServer, so no network is used.
 */
@ExtendWith(MockitoExtension.class)
class OAuth2UserServiceTest {

    private static final String USER_INFO_URI = "http://idp.test/userinfo";

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;

    private OAuth2UserService service;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        service = new OAuth2UserService(userRepository, roleRepository);
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        service.setRestOperations(restTemplate);
    }

    private OAuth2User load(String provider, String nameAttribute, String userInfoJson) {
        server.expect(requestTo(USER_INFO_URI)).andRespond(withSuccess(userInfoJson, MediaType.APPLICATION_JSON));
        ClientRegistration registration = ClientRegistration.withRegistrationId(provider)
                .clientId("client").clientSecret("secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost/callback")
                .authorizationUri("http://idp.test/auth")
                .tokenUri("http://idp.test/token")
                .userInfoUri(USER_INFO_URI)
                .userNameAttributeName(nameAttribute)
                .clientName(provider)
                .build();
        OAuth2AccessToken token = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "tok",
                Instant.now(), Instant.now().plusSeconds(60));
        return service.loadUser(new OAuth2UserRequest(registration, token));
    }

    private void saveReturnsArgument() {
        when(userRepository.save(any(userEntity.class))).thenAnswer(inv -> {
            userEntity u = inv.getArgument(0);
            if (u.getId() == null) {
                u.setId(new ObjectId());
            }
            return u;
        });
    }

    @Test
    void googleNewUserIsCreatedWithDefaultRole() {
        Role userRole = TestDataFactory.role("USER");
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        saveReturnsArgument();

        OAuth2User result = load("google", "sub",
                "{\"sub\":\"g-1\",\"email\":\"g@example.com\",\"name\":\"Gina\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        userEntity saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("g@example.com");
        assertThat(saved.getName()).isEqualTo("Gina");
        assertThat(saved.getUsername()).isEqualTo("g@example.com");
        assertThat(saved.getProvider()).isEqualTo("google");
        assertThat(saved.getProviderId()).isEqualTo("g-1");
        assertThat(saved.isEnabled()).isTrue();
        assertThat(saved.isEmailVerified()).isTrue();
        assertThat(saved.getRoles()).containsExactly(userRole);

        assertThat(result.getName()).isEqualTo("g-1");
        assertThat(result.getAuthorities()).extracting(Object::toString).containsExactly("ROLE_USER");
        assertThat(result.<Object>getAttribute("userId")).isEqualTo(saved.getId());
        assertThat(result.<String>getAttribute("email")).isEqualTo("g@example.com");
    }

    @Test
    void googleNameFallsBackToGivenAndFamilyName() {
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("google", "sub",
                "{\"sub\":\"g-1\",\"email\":\"g@example.com\",\"given_name\":\"Gina\",\"family_name\":\"Lee\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Gina Lee");
    }

    @Test
    void googleWithoutAnyNameLeavesNameNull() {
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("google", "sub", "{\"sub\":\"g-1\",\"email\":\"g@example.com\",\"given_name\":\"Gina\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isNull();
    }

    @Test
    void existingLocalUserIsLinkedToProviderAndVerified() {
        userEntity existing = TestDataFactory.user("g@example.com", "USER");
        existing.setEmailVerified(false);
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.of(existing));
        saveReturnsArgument();

        load("google", "sub", "{\"sub\":\"g-9\",\"email\":\"g@example.com\",\"name\":\"Gina\"}");

        assertThat(existing.getProvider()).isEqualTo("google");
        assertThat(existing.getProviderId()).isEqualTo("g-9");
        assertThat(existing.isEnabled()).isTrue();
        assertThat(existing.isEmailVerified()).isTrue();
        verify(userRepository).save(existing);
        verifyNoInteractions(roleRepository);
    }

    @Test
    void existingProviderUserIsLeftUntouched() {
        userEntity existing = TestDataFactory.user("g@example.com", "USER");
        existing.setProvider("google");
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.of(existing));

        OAuth2User result = load("google", "sub", "{\"sub\":\"g-9\",\"email\":\"g@example.com\"}");

        verify(userRepository, never()).save(any());
        assertThat(result.<Object>getAttribute("userId")).isEqualTo(existing.getId());
    }

    @Test
    void existingUserWithEmptyProviderStringIsLinked() {
        userEntity existing = TestDataFactory.user("g@example.com", "USER");
        existing.setProvider("");
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.of(existing));
        saveReturnsArgument();

        load("google", "sub", "{\"sub\":\"g-9\",\"email\":\"g@example.com\"}");

        assertThat(existing.getProvider()).isEqualTo("google");
    }

    @Test
    void githubUsesPublicEmailNameAndNumericId() {
        when(userRepository.findByEmail("octo@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("github", "id",
                "{\"id\":12345,\"login\":\"octocat\",\"email\":\"octo@example.com\",\"name\":\"Octo Cat\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Octo Cat");
        assertThat(captor.getValue().getProviderId()).isEqualTo("12345");
        assertThat(captor.getValue().getProvider()).isEqualTo("github");
    }

    @Test
    void githubPrivateEmailFallsBackToLoginAtGithubUser() {
        when(userRepository.findByEmail("octocat@github.user")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("github", "id", "{\"id\":7,\"login\":\"octocat\",\"email\":null,\"name\":null}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("octocat@github.user");
        assertThat(captor.getValue().getName()).isEqualTo("octocat"); // login used as name fallback
    }

    @Test
    void githubWithoutEmailAndLoginIsRejected() {
        assertThatThrownBy(() -> load("github", "id", "{\"id\":7}"))
                .isInstanceOf(InternalAuthenticationServiceException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void githubBlankEmailAndEmptyLoginIsRejected() {
        assertThatThrownBy(() -> load("github", "id", "{\"id\":7,\"login\":\"\",\"email\":\"\"}"))
                .isInstanceOf(InternalAuthenticationServiceException.class);
    }

    @Test
    void githubWithoutIdYieldsNullProviderIdButNameAttributeIsRequired() {
        // The name attribute ("id") must exist for DefaultOAuth2User; use login as the key to reach getIdFromAttributes.
        when(userRepository.findByEmail("octo@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("github", "login", "{\"login\":\"octocat\",\"email\":\"octo@example.com\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getProviderId()).isNull();
    }

    @Test
    void unknownProviderUsesGenericAttributes() {
        when(userRepository.findByEmail("x@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("custom", "id", "{\"id\":99,\"email\":\"x@example.com\",\"name\":\"Xavier\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Xavier");
        assertThat(captor.getValue().getProviderId()).isEqualTo("99");
    }

    @Test
    void unknownProviderWithoutIdHasNullProviderId() {
        when(userRepository.findByEmail("x@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        saveReturnsArgument();

        load("custom", "email", "{\"email\":\"x@example.com\"}");

        ArgumentCaptor<userEntity> captor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getProviderId()).isNull();
    }

    @Test
    void missingDefaultRoleIsWrappedInAuthenticationServiceException() {
        when(userRepository.findByEmail("g@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> load("google", "sub", "{\"sub\":\"g-1\",\"email\":\"g@example.com\"}"))
                .isInstanceOf(InternalAuthenticationServiceException.class)
                .hasMessage("Default role not found");
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleWithoutEmailIsRejected() {
        assertThatThrownBy(() -> load("google", "sub", "{\"sub\":\"g-1\",\"name\":\"Gina\"}"))
                .isInstanceOf(InternalAuthenticationServiceException.class);
    }
}
