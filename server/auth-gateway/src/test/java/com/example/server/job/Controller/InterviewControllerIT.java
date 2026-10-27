package com.example.server.job.Controller;

import com.example.server.job.DTO.TranscriptWrapperDTO;
import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InterviewControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void interviewEndpointsAreProxied() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(interviewProxy.getAllInterviewsOfAUser(user.getId().toString())).thenReturn(ResponseEntity.ok("[i]"));
        when(interviewProxy.getInterviewById("i1")).thenReturn(ResponseEntity.ok("one"));
        when(interviewProxy.getInterviewByJobAndCandidate("j1", "c1")).thenReturn(ResponseEntity.ok("jc"));
        when(interviewProxy.getEvaluationOfAnInterview("i1")).thenReturn(ResponseEntity.ok("eval"));
        when(interviewProxy.addTranscriptToInterview(eq("i1"), any(TranscriptWrapperDTO.class)))
                .thenReturn(ResponseEntity.ok("stored"));

        String auth = bearer(EMAIL);
        mockMvc.perform(get("/api/interviews/").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("[i]"));
        mockMvc.perform(get("/api/interviews/i1").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("one"));
        mockMvc.perform(get("/api/interviews/job/j1/candidate/c1").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("jc"));
        mockMvc.perform(get("/api/interviews/i1/evaluation").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("eval"));
        mockMvc.perform(post("/api/interviews/i1/transcript").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transcript\":[{\"role\":\"candidate\",\"text\":\"hi\"}]}"))
                .andExpect(status().isOk()).andExpect(content().string("stored"));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/interviews/i1")).andExpect(status().isUnauthorized());
    }
}
