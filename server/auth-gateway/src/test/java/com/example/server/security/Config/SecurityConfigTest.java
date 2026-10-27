package com.example.server.security.Config;

import com.example.server.security.JWT.JwtAuthEntryPoint;
import com.example.server.security.JWT.JwtAuthenticationFilter;
import com.example.server.security.Service.CustomOidcUserService;
import com.example.server.security.Service.OAuth2AuthenticationSuccessHandler;
import com.example.server.security.Service.OAuth2UserService;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.ObjectPostProcessor;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** The filter chain itself is exercised end to end in SecurityFilterChainIT. */
class SecurityConfigTest {

    private UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private SecurityConfig config;

    @BeforeEach
    void setUp() {
        userDetailsService = mock(UserDetailsService.class);
        config = new SecurityConfig(
                passwordEncoder,
                mock(AuthenticationProvider.class),
                userDetailsService,
                mock(JwtAuthEntryPoint.class),
                mock(JwtAuthenticationFilter.class),
                mock(OAuth2UserService.class),
                mock(CustomOidcUserService.class),
                mock(OAuth2AuthenticationSuccessHandler.class));
    }

    @Test
    void corsAllowsLocalFrontendsWithCredentials() {
        CorsConfigurationSource source = config.corsConfigurationSource();

        CorsConfiguration cors = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/anything"));

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOriginPatterns()).containsExactly("http://localhost:3000", "http://localhost:3001");
        assertThat(cors.getAllowedMethods()).containsExactly("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");
        assertThat(cors.getAllowedHeaders()).containsExactly("*");
        assertThat(cors.getAllowCredentials()).isTrue();
        assertThat(cors.getExposedHeaders()).containsExactly("Authorization");
    }

    @Test
    void modelMapperBeanIsCreated() {
        ModelMapper mapper = config.modelMapper();

        assertThat(mapper).isNotNull();
        assertThat(config.modelMapper()).isNotSameAs(mapper);
    }

    @Test
    void authenticationManagerUsesUserDetailsServiceAndPasswordEncoder() throws Exception {
        AuthenticationManagerBuilder builder = new AuthenticationManagerBuilder(new ObjectPostProcessor<Object>() {
            @Override
            public <O> O postProcess(O object) {
                return object;
            }
        });
        HttpSecurity http = mock(HttpSecurity.class);
        when(http.getSharedObject(AuthenticationManagerBuilder.class)).thenReturn(builder);
        var user = TestDataFactory.user("a@b.com", "USER");
        user.setPassword(passwordEncoder.encode("secret"));
        when(userDetailsService.loadUserByUsername("a@b.com")).thenReturn(user);

        AuthenticationManager manager = config.authenticationManager(http);

        Authentication ok = manager.authenticate(new UsernamePasswordAuthenticationToken("a@b.com", "secret"));
        assertThat(ok.isAuthenticated()).isTrue();
        assertThatThrownBy(() -> manager.authenticate(new UsernamePasswordAuthenticationToken("a@b.com", "nope")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
