package com.example.server.job.Controller;

import com.example.server.job.Proxy.CompatibilityProxy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CompatibilityControllerTest {

    @Mock
    private CompatibilityProxy proxy;
    @InjectMocks
    private CompatibilityController controller;

    @Test
    void returnsReviewFromDownstreamService() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
        when(proxy.getCompatibilityReviewById("r1")).thenReturn(ResponseEntity.ok("{\"score\":90}"));

        mvc.perform(get("/api/compatibility/r1"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"score\":90}"));
    }

    @Test
    void propagatesDownstreamStatus() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
        when(proxy.getCompatibilityReviewById("r2")).thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("none"));

        mvc.perform(get("/api/compatibility/r2"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("none"));
    }
}
