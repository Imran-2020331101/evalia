package com.example.server.security;

import com.example.server.security.Service.OAuth2AuthenticationSuccessHandler;
import com.example.server.security.Config.OAuth2DebugFilter;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** OAuth2 login wiring. The external provider (token + user-info endpoints) is never contacted. */
class OAuth2LoginFlowIT extends AbstractIntegrationTest {

    @Autowired
    private OAuth2AuthenticationSuccessHandler successHandler;
    @Autowired
    private ClientRegistrationRepository registrations;
    @Autowired
    private OAuth2DebugFilter debugFilter;

    @Test
    void googleAuthorizationRequestRedirectsToGoogleWithConfiguredClientId() throws Exception {
        MvcResult result = mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        String location = result.getResponse().getHeader(HttpHeaders.LOCATION);
        assertThat(location).startsWith("https://accounts.google.com/o/oauth2/v2/auth")
                .contains("client_id=test-google-id")
                .contains("response_type=code")
                .contains("scope=openid%20profile%20email")
                .contains("redirect_uri=http://localhost/login/oauth2/code/google");
    }

    @Test
    void githubAuthorizationRequestRedirectsToGithub() throws Exception {
        MvcResult result = mockMvc.perform(get("/oauth2/authorization/github"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        assertThat(result.getResponse().getHeader(HttpHeaders.LOCATION))
                .startsWith("https://github.com/login/oauth/authorize")
                .contains("client_id=test-github-id");
    }

    @Test
    void callbackWithoutPriorAuthorizationRequestIsSentToLoginError() throws Exception {
        MvcResult result = mockMvc.perform(get("/login/oauth2/code/google").param("code", "abc").param("state", "xyz"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        assertThat(result.getResponse().getHeader(HttpHeaders.LOCATION)).contains("error");
    }

    @Test
    void bothProvidersAreRegistered() {
        assertThat(registrations.findByRegistrationId("google")).isNotNull();
        assertThat(registrations.findByRegistrationId("github")).isNotNull();
        assertThat(registrations.findByRegistrationId("unknown")).isNull();
    }

    @Test
    void successHandlerIssuesApplicationJwtAndRedirectsToFrontend() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        successHandler.onAuthenticationSuccess(new MockHttpServletRequest(), response,
                new UsernamePasswordAuthenticationToken(TestDataFactory.EMAIL, null, Collections.emptyList()));

        String redirect = response.getRedirectedUrl();
        assertThat(redirect).startsWith("http://localhost:3000/auth/callback?token=");
        String token = redirect.substring(redirect.indexOf("token=") + "token=".length());
        assertThat(jwtService.getEmailFromToken(token)).isEqualTo(TestDataFactory.EMAIL);
    }

    @Test
    void debugFilterIsRegisteredAsABean() {
        assertThat(debugFilter).isNotNull();
    }
}
