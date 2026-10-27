package com.example.server.job.Controller;

import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CompatibilityControllerIT extends AbstractIntegrationTest {

    @Test
    void authenticatedUserGetsReview() throws Exception {
        givenUser(TestDataFactory.EMAIL);
        when(compatibilityProxy.getCompatibilityReviewById("r1")).thenReturn(ResponseEntity.ok("{\"score\":9}"));

        mockMvc.perform(get("/api/compatibility/r1").header("Authorization", bearer(TestDataFactory.EMAIL)))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"score\":9}"));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/compatibility/r1")).andExpect(status().isUnauthorized());
    }
}
