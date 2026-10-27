package com.example.server.security.JWT;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthEntryPointTest {

    private final JwtAuthEntryPoint entryPoint = new JwtAuthEntryPoint();

    @Test
    void respondsWith401AndExceptionMessage() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(new MockHttpServletRequest("GET", "/api/x"), response,
                new BadCredentialsException("bad token"));

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getErrorMessage()).isEqualTo("bad token");
    }

    @Test
    void worksForAnyAuthenticationException() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(new MockHttpServletRequest(), response,
                new InsufficientAuthenticationException("Full authentication is required"));

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getErrorMessage()).contains("Full authentication");
    }
}
