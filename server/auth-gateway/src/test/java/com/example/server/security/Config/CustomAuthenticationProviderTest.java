package com.example.server.security.Config;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomAuthenticationProviderTest {

    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private CustomAuthenticationProvider provider;

    @BeforeEach
    void setUp() {
        provider = new CustomAuthenticationProvider(userDetailsService, passwordEncoder);
    }

    @Test
    void authenticatesWhenPasswordMatches() {
        userEntity user = TestDataFactory.user("a@b.com", "ADMIN");
        when(userDetailsService.loadUserByUsername("a@b.com")).thenReturn(user);
        when(passwordEncoder.matches("raw", "encoded-password")).thenReturn(true);

        Authentication result = provider.authenticate(new UsernamePasswordAuthenticationToken("a@b.com", "raw"));

        assertThat(result.isAuthenticated()).isTrue();
        assertThat(result.getPrincipal()).isEqualTo("a@b.com");
        assertThat(result.getCredentials()).isNull();
        assertThat(result.getAuthorities()).extracting(Object::toString).containsExactly("ADMIN");
    }

    @Test
    void rejectsWrongPassword() {
        when(userDetailsService.loadUserByUsername("a@b.com")).thenReturn(TestDataFactory.user("a@b.com", "USER"));
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> provider.authenticate(new UsernamePasswordAuthenticationToken("a@b.com", "wrong")))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid password");
    }

    @Test
    void propagatesUnknownUser() {
        when(userDetailsService.loadUserByUsername("ghost@b.com")).thenThrow(new UserNotFoundException("Email not found"));

        assertThatThrownBy(() -> provider.authenticate(new UsernamePasswordAuthenticationToken("ghost@b.com", "x")))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void supportsOnlyUsernamePasswordTokens() {
        assertThat(provider.supports(UsernamePasswordAuthenticationToken.class)).isTrue();
        assertThat(provider.supports(TestingAuthenticationToken.class)).isFalse();
    }
}
