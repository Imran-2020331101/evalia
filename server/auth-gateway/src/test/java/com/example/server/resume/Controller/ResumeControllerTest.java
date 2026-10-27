package com.example.server.resume.Controller;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.GlobalSearchRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.resume.Proxy.ResumeProxy;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ResumeControllerTest {

    private static final String EMAIL = TestDataFactory.EMAIL;
    private static final Principal PRINCIPAL = () -> EMAIL;

    @Mock
    private ResumeProxy resumeProxy;
    @Mock
    private ResumeJsonProxy resumeJsonProxy;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private UserService userService;

    private MockMvc mvc;
    private userEntity user;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(
                        new ResumeController(resumeProxy, resumeJsonProxy, userDetailsService, userService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        user = TestDataFactory.user();
    }

    private void userExists() {
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(user);
    }

    private MockMultipartFile pdf() {
        return new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[]{1, 2});
    }

    // --------------------------------------------------------------- upload

    @Test
    void uploadMarksUserAsHavingResumeAndStoresDownloadUrl() throws Exception {
        userExists();
        String json = "{\"success\":true,\"data\":{\"downloadUrl\":\"https://files/cv.pdf\"}}";
        when(resumeProxy.forwardResumeToResumeService(any(MultipartFile.class), eq(EMAIL), eq(user.getId().toString())))
                .thenReturn(json);

        mvc.perform(multipart("/api/resume/upload").file(pdf()).principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string(json));

        assertThat(user.isHasResume()).isTrue();
        assertThat(user.getResumeUrl()).isEqualTo("https://files/cv.pdf");
        verify(userService).saveUpdatedUser(user);
    }

    @Test
    void uploadWithoutSuccessFlagIsTreatedAsSuccess() throws Exception {
        userExists();
        when(resumeProxy.forwardResumeToResumeService(any(), any(), any())).thenReturn("{\"data\":{}}");

        mvc.perform(multipart("/api/resume/upload").file(pdf()).principal(PRINCIPAL))
                .andExpect(status().isOk());

        assertThat(user.isHasResume()).isTrue();
        assertThat(user.getResumeUrl()).isEmpty();
    }

    @Test
    void uploadRejectedByResumeServiceReturns500AndDoesNotUpdateUser() throws Exception {
        userExists();
        when(resumeProxy.forwardResumeToResumeService(any(), any(), any()))
                .thenReturn("{\"success\":false,\"error\":\"unparseable\"}");

        mvc.perform(multipart("/api/resume/upload").file(pdf()).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("unparseable"));

        assertThat(user.isHasResume()).isFalse();
        verify(userService, never()).saveUpdatedUser(any());
    }

    @Test
    void uploadWithNonJsonResponseReturns500() throws Exception {
        userExists();
        when(resumeProxy.forwardResumeToResumeService(any(), any(), any())).thenReturn("not json");

        mvc.perform(multipart("/api/resume/upload").file(pdf()).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.startsWith("Failed to forward:")));
    }

    @Test
    void uploadWhenResumeServiceIsDownReturns500() throws Exception {
        userExists();
        when(resumeProxy.forwardResumeToResumeService(any(), any(), any())).thenThrow(new RuntimeException("refused"));

        mvc.perform(multipart("/api/resume/upload").file(pdf()).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to forward: refused"));
    }

    // -------------------------------------------------------------- extract

    @Test
    void extractWithoutResumeIs404() throws Exception {
        userExists();

        mvc.perform(get("/api/resume/extract").principal(PRINCIPAL))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No resume found for user: " + EMAIL));
        verifyNoInteractions(resumeJsonProxy);
    }

    @Test
    void extractForwardsResumeUrlAndUserIdentity() throws Exception {
        user.setHasResume(true);
        user.setResumeUrl("https://files/cv.pdf");
        userExists();
        when(resumeJsonProxy.extractDetailsFromResume(any())).thenReturn(ResponseEntity.ok("{\"skills\":[]}"));

        mvc.perform(get("/api/resume/extract").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"skills\":[]}"));

        ArgumentCaptor<ResumeForwardWrapper> captor = ArgumentCaptor.forClass(ResumeForwardWrapper.class);
        verify(resumeJsonProxy).extractDetailsFromResume(captor.capture());
        ResumeForwardWrapper wrapper = captor.getValue();
        assertThat(wrapper.getResumeURL()).isEqualTo("https://files/cv.pdf");
        assertThat(wrapper.getUserId()).isEqualTo(user.getId().toString());
        assertThat(wrapper.getUserEmail()).isEqualTo(EMAIL);
        assertThat(wrapper.getResumeData()).isNull();
    }

    // ----------------------------------------------------------------- save

    @Test
    void saveForwardsResumeDataWithUserDisplayName() throws Exception {
        userExists();
        when(resumeJsonProxy.saveResume(any())).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body("saved"));

        mvc.perform(post("/api/resume/save").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"filename\":\"cv.pdf\"}"))
                .andExpect(status().isCreated())
                .andExpect(content().string("saved"));

        ArgumentCaptor<ResumeForwardWrapper> captor = ArgumentCaptor.forClass(ResumeForwardWrapper.class);
        verify(resumeJsonProxy).saveResume(captor.capture());
        assertThat(captor.getValue().getResumeData().getFilename()).isEqualTo("cv.pdf");
        assertThat(captor.getValue().getUserName()).isEqualTo("Jane Doe");
        assertThat(captor.getValue().getResumeURL()).isNull();
    }

    // --------------------------------------------------------- basic search

    @Test
    void basicSearchParsesResponseIntoTypedBody() throws Exception {
        when(resumeJsonProxy.basicSearchResume(any(BasicSearchRequest.class)))
                .thenReturn(ResponseEntity.ok("{\"success\":true,\"candidates\":[],\"message\":\"done\"}"));

        mvc.perform(post("/api/resume/basic-search").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"job_description\":\"java dev\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("done"));
    }

    @Test
    void basicSearchReturns500WithFailureBodyOnBadResponse() throws Exception {
        when(resumeJsonProxy.basicSearchResume(any())).thenReturn(ResponseEntity.ok("garbage"));

        mvc.perform(post("/api/resume/basic-search").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"job_description\":\"x\"}"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.candidates").isEmpty())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.startsWith("Failed:")));
    }

    // ------------------------------------------------------------ shortlist

    @Test
    void topKResumesForJob() throws Exception {
        when(resumeJsonProxy.getTopKResumesForJob("j1", 5)).thenReturn(ResponseEntity.ok("top5"));

        mvc.perform(get("/api/resume/j1/shortlist/5").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("top5"));
    }

    @Test
    void topKWithNonNumericKIsReportedAs500BecauseCatchAllHandlerSwallowsTypeMismatch() throws Exception {
        // Finding: GlobalExceptionHandler#handleGeneral(Exception) also catches Spring MVC's own
        // MethodArgumentTypeMismatchException, so a client error (400) becomes a 500.
        mvc.perform(get("/api/resume/j1/shortlist/abc").principal(PRINCIPAL))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void globalSearchForwardsRequest() throws Exception {
        when(resumeJsonProxy.globalResumeSearch(eq(3), any(GlobalSearchRequest.class))).thenReturn(ResponseEntity.ok("hits"));

        mvc.perform(post("/api/resume/shortlist/3").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"job_description\":\"python\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("hits"));

        ArgumentCaptor<GlobalSearchRequest> captor = ArgumentCaptor.forClass(GlobalSearchRequest.class);
        verify(resumeJsonProxy).globalResumeSearch(eq(3), captor.capture());
        assertThat(captor.getValue().job_description()).isEqualTo("python");
    }
}
