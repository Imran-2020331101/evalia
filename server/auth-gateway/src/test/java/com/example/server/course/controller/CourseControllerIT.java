package com.example.server.course.controller;

import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CourseControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void suggestionsAreProxiedForTheAuthenticatedUser() throws Exception {
        givenUser(EMAIL);
        when(courseProxy.getCourseSuggestions(EMAIL)).thenReturn(ResponseEntity.ok("[{\"videoId\":\"v1\"}]"));

        mockMvc.perform(get("/api/course/suggestions").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(content().string("[{\"videoId\":\"v1\"}]"));
    }

    @Test
    void saveUsesUserIdResolvedFromTheDatabase() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(courseProxy.saveCourse(org.mockito.ArgumentMatchers.eq(user.getId().toString()), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.CREATED).body("saved"));

        mockMvc.perform(post("/api/course/save").header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"videoId\":\"v1\"}"))
                .andExpect(status().isCreated())
                .andExpect(content().string("saved"));
    }

    @Test
    void savedAndDelete() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(courseProxy.getAllSavedCourse(user.getId().toString())).thenReturn(ResponseEntity.ok("[]"));
        when(courseProxy.deleteCourse("v1", user.getId().toString())).thenReturn(ResponseEntity.ok("deleted"));

        mockMvc.perform(get("/api/course/saved/all").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("[]"));
        mockMvc.perform(delete("/api/course/delete/v1").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("deleted"));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/course/suggestions")).andExpect(status().isUnauthorized());

        verifyNoInteractions(courseProxy);
    }
}
