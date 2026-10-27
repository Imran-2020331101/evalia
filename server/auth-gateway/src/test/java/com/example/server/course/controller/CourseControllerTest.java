package com.example.server.course.controller;

import com.example.server.course.dto.CourseDTO;
import com.example.server.course.proxy.CourseProxy;
import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.exception.handler.GlobalExceptionHandler;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    private static final Principal PRINCIPAL = () -> TestDataFactory.EMAIL;

    @Mock
    private CourseProxy courseProxy;
    @Mock
    private UserDetailsService userDetailsService;

    private MockMvc mvc;
    private userEntity user;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new CourseController(courseProxy, userDetailsService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        user = TestDataFactory.user();
    }

    private void userExists() {
        when(userDetailsService.loadUserByUsername(TestDataFactory.EMAIL)).thenReturn(user);
    }

    @Test
    void suggestionsAreFetchedByEmailAndPassedThrough() throws Exception {
        when(courseProxy.getCourseSuggestions(TestDataFactory.EMAIL)).thenReturn(ResponseEntity.ok("[{\"id\":1}]"));

        mvc.perform(get("/api/course/suggestions").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("[{\"id\":1}]"));
    }

    @Test
    void suggestionsPropagateDownstreamStatus() throws Exception {
        when(courseProxy.getCourseSuggestions(TestDataFactory.EMAIL))
                .thenReturn(ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("down"));

        mvc.perform(get("/api/course/suggestions").principal(PRINCIPAL))
                .andExpect(status().isBadGateway())
                .andExpect(content().string("down"));
    }

    @Test
    void saveForwardsCourseWithCandidateId() throws Exception {
        userExists();
        when(courseProxy.saveCourse(eq(user.getId().toString()), any(CourseDTO.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.CREATED).body("saved"));

        mvc.perform(post("/api/course/save").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"videoId\":\"v1\",\"title\":\"T\"}"))
                .andExpect(status().isCreated())
                .andExpect(content().string("saved"));

        ArgumentCaptor<CourseDTO> captor = ArgumentCaptor.forClass(CourseDTO.class);
        verify(courseProxy).saveCourse(eq(user.getId().toString()), captor.capture());
        assertThat(captor.getValue().getVideoId()).isEqualTo("v1");
    }

    @Test
    void savedAllUsesCandidateId() throws Exception {
        userExists();
        when(courseProxy.getAllSavedCourse(user.getId().toString())).thenReturn(ResponseEntity.ok("[]"));

        mvc.perform(get("/api/course/saved/all").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void deleteUsesVideoAndCandidateId() throws Exception {
        userExists();
        when(courseProxy.deleteCourse("v1", user.getId().toString())).thenReturn(ResponseEntity.ok("deleted"));

        mvc.perform(delete("/api/course/delete/v1").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("deleted"));
    }

    @Test
    void unknownUserIs404() throws Exception {
        when(userDetailsService.loadUserByUsername(TestDataFactory.EMAIL)).thenThrow(new UserNotFoundException("Email not found"));

        mvc.perform(get("/api/course/saved/all").principal(PRINCIPAL)).andExpect(status().isNotFound());
    }
}
