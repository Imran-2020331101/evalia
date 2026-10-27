package com.example.server.job.Controller;

import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.job.DTO.TranscriptWrapperDTO;
import com.example.server.job.Proxy.InterviewProxy;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InterviewControllerTest {

    private static final Principal PRINCIPAL = () -> TestDataFactory.EMAIL;

    @Mock
    private InterviewProxy interviewProxy;
    @Mock
    private UserDetailsService userDetailsService;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new InterviewController(interviewProxy, userDetailsService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void listsInterviewsOfCurrentUser() throws Exception {
        userEntity user = TestDataFactory.user();
        when(userDetailsService.loadUserByUsername(TestDataFactory.EMAIL)).thenReturn(user);
        when(interviewProxy.getAllInterviewsOfAUser(user.getId().toString())).thenReturn(ResponseEntity.ok("[1]"));

        mvc.perform(get("/api/interviews/").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("[1]"));
    }

    @Test
    void getsInterviewById() throws Exception {
        when(interviewProxy.getInterviewById("i1")).thenReturn(ResponseEntity.ok("{\"id\":\"i1\"}"));

        mvc.perform(get("/api/interviews/i1"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"id\":\"i1\"}"));
    }

    @Test
    void getsInterviewByJobAndCandidate() throws Exception {
        when(interviewProxy.getInterviewByJobAndCandidate("j1", "c1")).thenReturn(ResponseEntity.ok("found"));

        mvc.perform(get("/api/interviews/job/j1/candidate/c1"))
                .andExpect(status().isOk())
                .andExpect(content().string("found"));
    }

    @Test
    void forwardsTranscript() throws Exception {
        when(interviewProxy.addTranscriptToInterview(eq("i1"), any(TranscriptWrapperDTO.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.ACCEPTED).body("stored"));

        mvc.perform(post("/api/interviews/i1/transcript").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transcript\":[{\"role\":\"candidate\",\"text\":\"hello\"}]}"))
                .andExpect(status().isAccepted())
                .andExpect(content().string("stored"));

        ArgumentCaptor<TranscriptWrapperDTO> captor = ArgumentCaptor.forClass(TranscriptWrapperDTO.class);
        verify(interviewProxy).addTranscriptToInterview(eq("i1"), captor.capture());
        assertThat(captor.getValue().getTranscript()).hasSize(1);
        assertThat(captor.getValue().getTranscript().get(0).getText()).isEqualTo("hello");
    }

    @Test
    void emptyTranscriptCurrentlyCausesServerError() throws Exception {
        // The controller logs transcript.get(0) before forwarding: an empty transcript throws
        // IndexOutOfBounds and surfaces as 500 (reported as a finding; should be a 400).
        mvc.perform(post("/api/interviews/i1/transcript").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transcript\":[]}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getsEvaluation() throws Exception {
        when(interviewProxy.getEvaluationOfAnInterview("i1")).thenReturn(ResponseEntity.ok("eval"));

        mvc.perform(get("/api/interviews/i1/evaluation"))
                .andExpect(status().isOk())
                .andExpect(content().string("eval"));
    }
}
