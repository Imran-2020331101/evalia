package com.example.server.resume.Proxy;

import com.example.server.support.FakeHttpServer;
import com.example.server.support.FakeHttpServer.Recorded;
import feign.Feign;
import feign.FeignException;
import feign.form.spring.SpringFormEncoder;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ResumeProxy has a hard coded URL (http://localhost:5000), so the client is built by hand with the same contract
 * and form encoder as FeignMultipartSupportConfig, but targeted at the fake server.
 */
class ResumeProxyContractTest {

    private static FakeHttpServer server;
    private static ResumeProxy proxy;

    @BeforeAll
    static void start() {
        server = new FakeHttpServer();
        proxy = Feign.builder()
                .contract(new SpringMvcContract())
                .encoder(new SpringFormEncoder())
                .target(ResumeProxy.class, server.baseUrl() + "/api/resume");
    }

    @AfterAll
    static void stop() {
        server.close();
    }

    @Test
    void uploadsFileAndFieldsAsMultipartForm() {
        server.reply(200, "{\"success\":true}");
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", "PDFBYTES".getBytes());

        String response = proxy.forwardResumeToResumeService(file, "jane@x.com", "user-1");

        assertThat(response).isEqualTo("{\"success\":true}");
        Recorded request = server.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/resume/upload");
        assertThat(request.contentType()).startsWith("multipart/form-data");
        assertThat(request.body())
                .contains("name=\"file\"").contains("filename=\"cv.pdf\"").contains("PDFBYTES")
                .contains("name=\"userEmail\"").contains("jane@x.com")
                .contains("name=\"userId\"").contains("user-1");
    }

    @Test
    void serverErrorsSurfaceAsFeignException() {
        server.reply(500, "boom");
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[]{1});

        assertThatThrownBy(() -> proxy.forwardResumeToResumeService(file, "a@b.com", "u"))
                .isInstanceOf(FeignException.InternalServerError.class);
    }
}
