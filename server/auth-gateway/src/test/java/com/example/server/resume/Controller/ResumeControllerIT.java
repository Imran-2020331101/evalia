package com.example.server.resume.Controller;

import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.JwtTestUtil;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ResumeControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;
    private static final MockMultipartFile PDF =
            new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[]{1, 2, 3});

    @Test
    void uploadIsPermittedWithTemporaryRegistrationTokenAndStoresResumeUrl() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(resumeProxy.forwardResumeToResumeService(any(), any(), any()))
                .thenReturn("{\"success\":true,\"data\":{\"downloadUrl\":\"https://files/cv.pdf\"}}");

        mockMvc.perform(multipart("/api/resume/upload").file(PDF).header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk());

        assertThat(user.isHasResume()).isTrue();
        assertThat(user.getResumeUrl()).isEqualTo("https://files/cv.pdf");
        verify(userRepository).save(user);
    }

    /** /api/resume/upload is permitAll in SecurityConfig but the handler dereferences the Principal. */
    @Test
    void uploadWithoutAnyTokenFailsWithServerErrorInsteadOfUnauthorized() throws Exception {
        mockMvc.perform(multipart("/api/resume/upload").file(PDF))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void uploadWithExpiredTokenAlsoFallsThroughToServerError() throws Exception {
        mockMvc.perform(multipart("/api/resume/upload").file(PDF)
                        .header("Authorization", "Bearer " + JwtTestUtil.expiredToken(EMAIL)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveAndExtractAndSearchAreProxied() throws Exception {
        userEntity user = givenUser(EMAIL);
        user.setHasResume(true);
        user.setResumeUrl("https://files/cv.pdf");
        when(resumeJsonProxy.saveResume(any())).thenReturn(ResponseEntity.ok("saved"));
        when(resumeJsonProxy.extractDetailsFromResume(any())).thenReturn(ResponseEntity.ok("extracted"));
        when(resumeJsonProxy.getTopKResumesForJob("j1", 2)).thenReturn(ResponseEntity.ok("top2"));
        when(resumeJsonProxy.basicSearchResume(any()))
                .thenReturn(ResponseEntity.ok("{\"success\":true,\"candidates\":[],\"message\":\"m\"}"));

        String auth = bearer(EMAIL);
        mockMvc.perform(post("/api/resume/save").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"filename\":\"cv.pdf\"}"))
                .andExpect(status().isOk()).andExpect(content().string("saved"));
        mockMvc.perform(get("/api/resume/extract").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("extracted"));
        mockMvc.perform(get("/api/resume/j1/shortlist/2").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(content().string("top2"));
        mockMvc.perform(post("/api/resume/basic-search").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"job_description\":\"x\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void extractWithoutResumeIs404() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(get("/api/resume/extract").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/resume/shortlist/3").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"job_description\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }
}
