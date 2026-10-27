package com.example.server.job.Controller;

import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.job.DTO.JobApplicationRequest;
import com.example.server.job.DTO.JobCreationRequest;
import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class JobControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void activeJobsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/job/active-jobs")).andExpect(status().isUnauthorized());

        givenUser(EMAIL);
        when(jobProxy.getAllActiveJobs()).thenReturn(ResponseEntity.ok("[jobs]"));
        mockMvc.perform(get("/api/job/active-jobs").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("[jobs]"));
    }

    @Test
    void applyPersistsAppliedJobOnTheUser() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(jobProxy.applyToAJob(any(JobApplicationRequest.class))).thenReturn(ResponseEntity.ok("applied"));

        mockMvc.perform(post("/api/job/j1/apply").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("applied"));

        verify(userRepository).save(user);
        assertThat(user.getAppliedJobs()).containsExactly("j1");
        assertThat(user.getNumberOfAppliedJobs()).isEqualTo(1);
    }

    @Test
    void saveAndUnsaveJob() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(jobProxy.getJobById("j1")).thenReturn(ResponseEntity.ok("job"));

        mockMvc.perform(post("/api/job/j1/save").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("job"));
        mockMvc.perform(post("/api/job/j1/save").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/job/j1/unsave").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk());
        assertThat(user.getSavedJobs()).isEmpty();
    }

    @Test
    void createJobLooksUpOrganizationAndEnrichesRequest() throws Exception {
        userEntity user = givenUser(EMAIL);
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        when(organizationRepository.findById(new ObjectId(org.getId()))).thenReturn(Optional.of(org));
        when(jobProxy.createJob(any(JobCreationRequest.class))).thenReturn(ResponseEntity.ok("created"));

        mockMvc.perform(post("/api/job/organization/{id}", org.getId()).header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk()).andExpect(content().string("created"));

        ArgumentCaptor<JobCreationRequest> captor = ArgumentCaptor.forClass(JobCreationRequest.class);
        verify(jobProxy).createJob(captor.capture());
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(user.getId().toString());
        assertThat(captor.getValue().getCompanyInfo().getOrganizationName()).isEqualTo("Acme");
    }

    @Test
    void shortlistResolvesCandidatesThroughUserService() throws Exception {
        givenUser(EMAIL);
        userEntity candidate = givenUser("cand@example.com");
        when(jobProxy.shortlistCandidatesOfAJob(eq("j1"), any())).thenReturn(ResponseEntity.ok("shortlisted"));

        mockMvc.perform(post("/api/job/j1/shortlist").header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateIds\":[\"" + candidate.getId().toHexString() + "\"]}"))
                .andExpect(status().isOk()).andExpect(content().string("shortlisted"));
    }

    @Test
    void unknownCandidateInShortlistIs404() throws Exception {
        givenUser(EMAIL);
        when(userRepository.findById(any(ObjectId.class))).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/job/j1/shortlist").header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateIds\":[\"" + new ObjectId().toHexString() + "\"]}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void suggestionsWithoutResumeAre404() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(get("/api/job/suggestions").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isNotFound());
    }
}
