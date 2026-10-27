package com.example.server.security.Controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OAuth2TestControllerTest {

    @Mock
    private ClientRegistrationRepository clientRegistrationRepository;
    @InjectMocks
    private OAuth2TestController controller;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void reportsConfiguredGoogleClient() throws Exception {
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId("gid")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost/cb")
                .authorizationUri("http://idp/auth")
                .tokenUri("http://idp/token")
                .build();
        when(clientRegistrationRepository.findByRegistrationId("google")).thenReturn(google);

        mvc.perform(get("/test-oauth2"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.startsWith("OAuth2 is configured! Google client found.")));
    }

    @Test
    void reportsMissingGoogleClient() throws Exception {
        when(clientRegistrationRepository.findByRegistrationId("google")).thenReturn(null);

        mvc.perform(get("/test-oauth2"))
                .andExpect(status().isOk())
                .andExpect(content().string("OAuth2 configuration issue: Google client registration not found"));
    }

    @Test
    void reportsRepositoryFailure() throws Exception {
        when(clientRegistrationRepository.findByRegistrationId("google")).thenThrow(new IllegalStateException("kaput"));

        mvc.perform(get("/test-oauth2"))
                .andExpect(status().isOk())
                .andExpect(content().string("OAuth2 configuration error: kaput"));
    }

    @Test
    void homeEndpointSaysBackendIsRunning() throws Exception {
        mvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running! Test OAuth2: /test-oauth2"));
    }
}
