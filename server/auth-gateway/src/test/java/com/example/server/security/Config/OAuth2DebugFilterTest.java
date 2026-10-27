package com.example.server.security.Config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OAuth2DebugFilterTest {

    private final OAuth2DebugFilter filter = new OAuth2DebugFilter();

    private String run(String uri, MockHttpServletResponse response, FilterChain chain) throws Exception {
        PrintStream original = System.out;
        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        System.setOut(new PrintStream(captured));
        try {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
            request.setQueryString("code=abc");
            request.addHeader("X-Test", "header-value");
            filter.doFilter(request, response, chain);
            verify(chain).doFilter(request, response);
        } finally {
            System.setOut(original);
        }
        return captured.toString();
    }

    @Test
    void logsOAuth2Requests() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setStatus(302);
        response.addHeader("Location", "http://idp");

        String out = run("/oauth2/authorization/google", response, mock(FilterChain.class));

        assertThat(out).contains("OAuth2 Debug Filter")
                .contains("Request URI: /oauth2/authorization/google")
                .contains("Query String: code=abc")
                .contains("X-Test: header-value")
                .contains("Response Status: 302")
                .contains("Location: http://idp");
    }

    @Test
    void logsLoginRequests() throws Exception {
        String out = run("/login/oauth2/code/github", new MockHttpServletResponse(), mock(FilterChain.class));

        assertThat(out).contains("Method: GET").contains("Response Status: 200");
    }

    @Test
    void doesNotLogOtherRequestsButStillForwardsThem() throws Exception {
        String out = run("/api/job/1", new MockHttpServletResponse(), mock(FilterChain.class));

        assertThat(out).isEmpty();
    }
}
