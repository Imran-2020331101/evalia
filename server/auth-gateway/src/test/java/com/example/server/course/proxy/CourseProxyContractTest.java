package com.example.server.course.proxy;

import com.example.server.course.dto.CourseDTO;
import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CourseProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private CourseProxy proxy;

    @Test
    void suggestionsAreRequestedWithEmailQueryParam() {
        SERVER.reply(200, "[{\"videoId\":\"v1\"}]");

        ResponseEntity<String> response = proxy.getCourseSuggestions("a@b.com");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("[{\"videoId\":\"v1\"}]");
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/course/suggestions");
        assertThat(URLDecoder.decode(request.query(), StandardCharsets.UTF_8)).isEqualTo("candidateEmail=a@b.com");
    }

    @Test
    void saveCoursePostsJsonToCandidatePath() {
        SERVER.reply(201, "saved");
        CourseDTO dto = new CourseDTO();
        dto.setVideoId("v1");
        dto.setTitle("Title");

        ResponseEntity<String> response = proxy.saveCourse("cand1", dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/api/course/candidate/cand1/save");
        assertThat(request.contentType()).startsWith("application/json");
        assertThat(request.body()).contains("\"videoId\":\"v1\"").contains("\"title\":\"Title\"");
    }

    @Test
    void getAllSavedCourse() {
        SERVER.reply(200, "[]");

        assertThat(proxy.getAllSavedCourse("cand1").getBody()).isEqualTo("[]");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/course/candidate/cand1/saved/all");
    }

    @Test
    void deleteCourse() {
        SERVER.reply(200, "deleted");

        assertThat(proxy.deleteCourse("v1", "cand1").getBody()).isEqualTo("deleted");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("DELETE");
        assertThat(request.path()).isEqualTo("/api/course/candidate/cand1/delete/v1");
    }

    @Test
    void downstreamErrorsSurfaceAsFeignException() {
        SERVER.reply(404, "nope");

        assertThatThrownBy(() -> proxy.getAllSavedCourse("cand1")).isInstanceOf(FeignException.NotFound.class);
    }
}
