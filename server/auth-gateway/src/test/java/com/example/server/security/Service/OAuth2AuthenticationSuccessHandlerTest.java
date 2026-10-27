package com.example.server.security.Service;

import com.example.server.security.JWT.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private JwtService jwtService;

    private OAuth2AuthenticationSuccessHandler handler;
    private final Authentication authentication = new TestingAuthenticationToken("jane@example.com", "pw");

    @BeforeEach
    void setUp() {
        handler = new OAuth2AuthenticationSuccessHandler(jwtService);
        ReflectionTestUtils.setField(handler, "frontendUrl", "https://app.evalia.test");
    }

    @Test
    void redirectsToFrontendCallbackWithToken() throws Exception {
        when(jwtService.generateToken(authentication)).thenReturn("jwt-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);

        assertThat(response.getRedirectedUrl()).isEqualTo("https://app.evalia.test/auth/callback?token=jwt-123");
    }

    @Test
    void doesNothingWhenResponseAlreadyCommitted() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setCommitted(true);

        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);

        verifyNoInteractions(jwtService);
        assertThat(response.getRedirectedUrl()).isNull();
    }

    @Test
    void determineTargetUrlEncodesTokenAsQueryParam() {
        String url = handler.determineTargetUrl(new MockHttpServletRequest(), new MockHttpServletResponse(),
                authentication, "a.b.c");

        assertThat(url).isEqualTo("https://app.evalia.test/auth/callback?token=a.b.c");
    }
}
