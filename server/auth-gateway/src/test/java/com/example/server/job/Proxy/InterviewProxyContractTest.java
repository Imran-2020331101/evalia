package com.example.server.job.Proxy;

import com.example.server.job.DTO.TranscriptDTO;
import com.example.server.job.DTO.TranscriptWrapperDTO;
import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class InterviewProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private InterviewProxy proxy;

    private void assertCall(String method, String path) {
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo(method);
        assertThat(request.path()).isEqualTo(path);
    }

    @Test
    void allInterviewsOfAUser() {
        SERVER.reply(200, "[1]");
        assertThat(proxy.getAllInterviewsOfAUser("u1").getBody()).isEqualTo("[1]");
        assertCall("GET", "/api/interview/user/u1");
    }

    @Test
    void allInterviews() {
        SERVER.reply(200, "[2]");
        assertThat(proxy.getAllInterviews().getBody()).isEqualTo("[2]");
        assertThat(SERVER.lastRequest().method()).isEqualTo("GET");
        assertThat(SERVER.lastRequest().path()).isEqualTo("/api/interview/");
    }

    @Test
    void interviewById() {
        SERVER.reply(200, "{}");
        proxy.getInterviewById("i1");
        assertCall("GET", "/api/interview/i1");
    }

    @Test
    void interviewByJobAndCandidate() {
        SERVER.reply(200, "{}");
        proxy.getInterviewByJobAndCandidate("j1", "c1");
        assertCall("GET", "/api/interview/job/j1/candidate/c1");
    }

    @Test
    void transcriptIsPutAsJson() {
        SERVER.reply(200, "ok");

        proxy.addTranscriptToInterview("i1", new TranscriptWrapperDTO(List.of(new TranscriptDTO("candidate", "hello"))));

        assertCall("PUT", "/api/interview/i1/transcript");
        assertThat(SERVER.lastRequest().contentType()).startsWith("application/json");
        assertThat(SERVER.lastRequest().body()).contains("\"transcript\"").contains("\"role\":\"candidate\"").contains("\"text\":\"hello\"");
    }

    @Test
    void evaluation() {
        SERVER.reply(200, "{\"score\":1}");
        assertThat(proxy.getEvaluationOfAnInterview("i1").getBody()).isEqualTo("{\"score\":1}");
        assertCall("GET", "/api/interview/i1/evaluation");
    }
}
