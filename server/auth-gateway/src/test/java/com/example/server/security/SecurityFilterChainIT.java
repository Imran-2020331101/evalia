package com.example.server.security;

import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.JwtTestUtil;
import com.example.server.support.TestDataFactory;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Exercises SecurityConfig's filter chain with the real JwtAuthenticationFilter / JwtAuthEntryPoint / CORS config. */
class SecurityFilterChainIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;
    private static final String PROTECTED = "/api/job/active-jobs";

    private void backendReturnsJobs() {
        when(jobProxy.getAllActiveJobs()).thenReturn(ResponseEntity.ok("[]"));
    }

    @Test
    void protectedEndpointWithoutTokenIs401() throws Exception {
        mockMvc.perform(get(PROTECTED)).andExpect(status().isUnauthorized());
    }

    @Test
    void validBearerTokenIsAccepted() throws Exception {
        givenUser(EMAIL);
        backendReturnsJobs();

        mockMvc.perform(get(PROTECTED).header("Authorization", bearer(EMAIL))).andExpect(status().isOk());
    }

    @Test
    void validTokenInCookieIsAccepted() throws Exception {
        givenUser(EMAIL);
        backendReturnsJobs();

        mockMvc.perform(get(PROTECTED).cookie(new Cookie("token", JwtTestUtil.validToken(EMAIL))))
                .andExpect(status().isOk());
    }

    @Test
    void expiredTokenIs401() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(get(PROTECTED).header("Authorization", "Bearer " + JwtTestUtil.expiredToken(EMAIL)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenSignedWithAnotherKeyIs401() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(get(PROTECTED).header("Authorization", "Bearer " + JwtTestUtil.tokenWithWrongKey(EMAIL)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void garbageTokenIs401() throws Exception {
        mockMvc.perform(get(PROTECTED).header("Authorization", "Bearer garbage")).andExpect(status().isUnauthorized());
    }

    @Test
    void validTokenForDeletedUserIs401() throws Exception {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        mockMvc.perform(get(PROTECTED).header("Authorization", bearer(EMAIL))).andExpect(status().isUnauthorized());
    }

    @Test
    void authPathsAreOpen() throws Exception {
        // reaches the controller (400 for the missing OTP) instead of being stopped by the security chain
        mockMvc.perform(post("/api/auth/verify").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/test-oauth2")).andExpect(status().isOk());
    }

    @Test
    void oauth2AuthorizationPathIsOpenAndRedirectsToTheProvider() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(HttpHeaders.LOCATION,
                        org.hamcrest.Matchers.startsWith("https://accounts.google.com/")));
    }

    @Test
    void corsPreflightFromLocalFrontendIsAllowed() throws Exception {
        mockMvc.perform(options(PROTECTED)
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void corsPreflightFromUnknownOriginIsRejected() throws Exception {
        mockMvc.perform(options(PROTECTED)
                        .header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void csrfIsDisabledSoPostsWithoutCsrfTokenWork() throws Exception {
        givenUser(EMAIL);
        when(jobProxy.getJobById("j1")).thenReturn(ResponseEntity.ok("job"));

        mockMvc.perform(post("/api/job/j1/save").header("Authorization", bearer(EMAIL))).andExpect(status().isOk());
    }
}
