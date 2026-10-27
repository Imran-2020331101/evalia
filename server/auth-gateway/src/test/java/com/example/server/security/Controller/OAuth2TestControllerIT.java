package com.example.server.security.Controller;

import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OAuth2TestControllerIT extends AbstractIntegrationTest {

    @Test
    void testEndpointIsPublicAndSeesTheConfiguredGoogleRegistration() throws Exception {
        mockMvc.perform(get("/test-oauth2"))
                .andExpect(status().isOk())
                .andExpect(content().string(startsWith("OAuth2 is configured! Google client found.")));
    }

    @Test
    void rootEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/")).andExpect(status().isUnauthorized());
    }

    @Test
    void rootEndpointWithJwtSaysBackendIsRunning() throws Exception {
        givenUser(TestDataFactory.EMAIL);

        mockMvc.perform(get("/").header("Authorization", bearer(TestDataFactory.EMAIL)))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running! Test OAuth2: /test-oauth2"));
    }
}
