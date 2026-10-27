package com.example.server.resume.Proxy;

import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.GlobalSearchRequest;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ResumeJsonProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private ResumeJsonProxy proxy;

    private ResumeForwardWrapper wrapper() {
        ResumeDataRequest data = new ResumeDataRequest();
        data.setFilename("cv.pdf");
        return new ResumeForwardWrapper(data, "https://files/cv.pdf", new ObjectId(), "Jane", "jane@x.com");
    }

    @Test
    void extractPostsWrapperAsJson() {
        SERVER.reply(200, "{\"success\":true}");

        assertThat(proxy.extractDetailsFromResume(wrapper()).getBody()).isEqualTo("{\"success\":true}");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/resume/extract");
        assertThat(request.contentType()).startsWith("application/json");
        assertThat(request.body()).contains("\"userEmail\":\"jane@x.com\"").contains("\"resumeURL\":\"https://files/cv.pdf\"");
    }

    @Test
    void savePostsWrapperAsJson() {
        SERVER.reply(200, "saved");
        proxy.saveResume(wrapper());
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/resume/save");
        assertThat(request.body()).contains("\"filename\":\"cv.pdf\"");
    }

    @Test
    void basicSearchPostsJobDescription() {
        SERVER.reply(200, "{}");
        BasicSearchRequest body = new BasicSearchRequest();
        body.setJob_description("java dev");
        proxy.basicSearchResume(body);
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/resume/basic-search");
        assertThat(request.body()).contains("\"job_description\":\"java dev\"");
    }

    @Test
    void retrieveByEmailIsGetWithQueryParamAndJsonContentType() {
        SERVER.reply(200, "{}");
        proxy.getResumeByEmail("jane@x.com");
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/resume/retrieve");
        assertThat(URLDecoder.decode(request.query(), StandardCharsets.UTF_8)).isEqualTo("email=jane@x.com");
        assertThat(request.headers().get("Content-type")).anyMatch(v -> v.startsWith("application/json"));
    }

    @Test
    void topKForJob() {
        SERVER.reply(200, "[]");
        proxy.getTopKResumesForJob("j1", 5);
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/resume/j1/shortlist/5");
    }

    @Test
    void globalSearch() {
        SERVER.reply(200, "[]");
        proxy.globalResumeSearch(3, new GlobalSearchRequest("python"));
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/resume/shortlist/3");
        assertThat(request.body()).contains("\"job_description\":\"python\"");
    }
}
