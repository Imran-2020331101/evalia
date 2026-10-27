package com.example.server.security.JWT;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.security.Service.CustomUserDetailsService;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailsService userDetailsService;
    @Mock
    private FilterChain chain;

    private JwtAuthenticationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtService, userDetailsService);
        request = new MockHttpServletRequest("GET", "/api/x");
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void bearerHeaderAuthenticatesUser() throws Exception {
        userEntity user = TestDataFactory.user();
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateToken("tok")).thenReturn(true);
        when(jwtService.getEmailFromToken("tok")).thenReturn(user.getEmail());
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);

        filter.doFilter(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isSameAs(user);
        assertThat(auth.getAuthorities()).extracting(Object::toString).containsExactly("USER");
        assertThat(auth.getDetails()).isNotNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void tokenCookieIsUsedWhenNoHeader() throws Exception {
        userEntity user = TestDataFactory.user();
        request.setCookies(new Cookie("other", "x"), new Cookie("token", "cookie-tok"));
        when(jwtService.validateToken("cookie-tok")).thenReturn(true);
        when(jwtService.getEmailFromToken("cookie-tok")).thenReturn(user.getEmail());
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void nonBearerHeaderFallsBackToCookie() throws Exception {
        request.addHeader("Authorization", "Basic abc");
        request.setCookies(new Cookie("token", "cookie-tok"));
        when(jwtService.validateToken("cookie-tok")).thenReturn(false);

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService).validateToken("cookie-tok");
        verify(chain).doFilter(request, response);
    }

    @Test
    void cookiesWithoutTokenCookieAreIgnored() throws Exception {
        request.setCookies(new Cookie("session", "x"));

        filter.doFilter(request, response, chain);

        verifyNoInteractions(jwtService, userDetailsService);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void noTokenAtAllJustContinuesTheChain() throws Exception {
        filter.doFilter(request, response, chain);

        verifyNoInteractions(jwtService, userDetailsService);
        verify(chain).doFilter(request, response);
    }

    @Test
    void blankBearerTokenIsNotValidated() throws Exception {
        request.addHeader("Authorization", "Bearer ");

        filter.doFilter(request, response, chain);

        verifyNoInteractions(jwtService);
        verify(chain).doFilter(request, response);
    }

    @Test
    void invalidTokenDoesNotAuthenticateButChainContinues() throws Exception {
        request.addHeader("Authorization", "Bearer bad");
        when(jwtService.validateToken("bad")).thenReturn(false);

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, never()).getEmailFromToken(any());
        verify(chain).doFilter(request, response);
    }

    @Test
    void validationExceptionIsSwallowedAndChainContinues() throws Exception {
        request.addHeader("Authorization", "Bearer expired");
        when(jwtService.validateToken("expired"))
                .thenThrow(new AuthenticationCredentialsNotFoundException("JWT has expired"));

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void unknownUserIsSwallowedAndChainContinues() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateToken("tok")).thenReturn(true);
        when(jwtService.getEmailFromToken("tok")).thenReturn("ghost@example.com");
        when(userDetailsService.loadUserByUsername("ghost@example.com"))
                .thenThrow(new UserNotFoundException("Email not found"));

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }
}
