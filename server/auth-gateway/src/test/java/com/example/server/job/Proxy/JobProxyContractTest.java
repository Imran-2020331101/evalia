package com.example.server.job.Proxy;

import com.example.server.job.DTO.*;
import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JobProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private JobProxy proxy;

    private Recorded assertCall(String method, String path) {
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo(method);
        assertThat(request.path()).isEqualTo(path);
        return request;
    }

    @Test
    void allActiveJobs() {
        SERVER.reply(200, "[]");
        assertThat(proxy.getAllActiveJobs().getBody()).isEqualTo("[]");
        assertCall("GET", "/api/jobs/");
    }

    @Test
    void jobsOfAnOrganization() {
        SERVER.reply(200, "[]");
        proxy.getAllJobsOfAnOrganization("org1");
        assertCall("GET", "/api/jobs/organization/org1");
    }

    @Test
    void appliedAndSavedJobsPostIdList() {
        SERVER.reply(200, "[]");
        proxy.getAllJobsAppliedByUser(List.of("j1", "j2"));
        assertThat(assertCall("POST", "/api/jobs/user/applied").body()).isEqualTo("[\"j1\",\"j2\"]");

        SERVER.reply(200, "[]");
        proxy.getAllJobsSavedByUser(List.of("j3"));
        assertThat(assertCall("POST", "/api/jobs/user/saved").body()).isEqualTo("[\"j3\"]");
    }

    @Test
    void generateInterviewQuestionsPostsRequest() {
        SERVER.reply(200, "[]");
        proxy.generateInterviewQuestions(new InterviewQuestionsGenerateRequest("desc", null, null, null));
        Recorded request = assertCall("POST", "/api/jobs/generate/interview-questions");
        assertThat(request.body()).contains("\"jobDescription\":\"desc\"");
    }

    @Test
    void createJobPostsJson() {
        SERVER.reply(201, "created");
        JobCreationRequest body = new JobCreationRequest();
        body.setCreatedBy("u1");

        proxy.createJob(body);

        Recorded request = assertCall("POST", "/api/jobs/");
        assertThat(request.contentType()).startsWith("application/json");
        assertThat(request.body()).contains("\"createdBy\":\"u1\"");
    }

    @Test
    void getJobById() {
        SERVER.reply(200, "{}");
        proxy.getJobById("j1");
        assertCall("GET", "/api/jobs/j1");
    }

    @Test
    void deleteJobSendsEmailQueryParam() {
        SERVER.reply(200, "ok");
        proxy.deleteJobById("j1", "o@x.com");
        Recorded request = assertCall("DELETE", "/api/jobs/j1");
        assertThat(URLDecoder.decode(request.query(), StandardCharsets.UTF_8)).isEqualTo("email=o@x.com");
    }

    @Test
    void deleteAllJobsOfAnOrganization() {
        SERVER.reply(200, "ok");
        proxy.deleteAllJobsOfAnOrganization("org1");
        assertCall("DELETE", "/api/jobs/organization/org1");
    }

    @Test
    void applyAndWithdrawPostApplicationAsJson() {
        SERVER.reply(200, "ok");
        proxy.applyToAJob(new JobApplicationRequest("j1", "c@x.com", "c1", "Cand"));
        Recorded apply = assertCall("POST", "/api/jobs/apply");
        assertThat(apply.body()).contains("\"jobId\":\"j1\"").contains("\"candidateName\":\"Cand\"");

        SERVER.reply(200, "ok");
        proxy.withdrawApplicationFromAJob(new JobApplicationRequest("j1", "c@x.com", "c1", "Cand"));
        Recorded withdraw = assertCall("POST", "/api/jobs/withdraw");
        assertThat(withdraw.body()).contains("\"jobId\":\"j1\"");
    }

    @Test
    void shortlistFinalistAndRejectPostCandidates() {
        ShortlistForwardWrapper wrapper = new ShortlistForwardWrapper(List.of(new candidateInfo("c1", "Cand", "c@x.com")));

        SERVER.reply(200, "ok");
        proxy.shortlistCandidatesOfAJob("j1", wrapper);
        assertThat(assertCall("POST", "/api/jobs/j1/shortlist").body()).contains("\"candidateEmail\":\"c@x.com\"");

        SERVER.reply(200, "ok");
        proxy.finalistCandidatesOfAJob("j1", wrapper);
        assertCall("POST", "/api/jobs/j1/finalist");

        SERVER.reply(200, "ok");
        proxy.rejectCandidatesOfAJob("j1", "SHORTLISTED", wrapper);
        assertCall("POST", "/api/jobs/j1/reject/status/SHORTLISTED");
    }

    @Test
    void interviewQuestionsAndSuggestions() {
        SERVER.reply(200, "[]");
        proxy.getInterviewQuestionsOfAJob("j1");
        assertCall("GET", "/api/jobs/j1/interview-questions");

        SERVER.reply(200, "[]");
        proxy.getJobSuggestionsForCandidate("c1");
        assertCall("GET", "/api/jobs/candidates/c1/suggestions");
    }
}
