package com.example.server.job.Controller;

import com.example.server.UserProfile.Service.OrganizationService;
import com.example.server.UserProfile.Service.UserService;
import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.job.DTO.*;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.job.Service.JobService;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class JobControllerTest {

    private static final String EMAIL = TestDataFactory.EMAIL;
    private static final Principal PRINCIPAL = () -> EMAIL;

    @Mock
    private JobProxy jobProxy;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private UserService userService;
    @Mock
    private OrganizationService organizationService;
    @Mock
    private JobService jobService;

    private MockMvc mvc;
    private userEntity user;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new JobController(jobProxy, userDetailsService, userService,
                        organizationService, jobService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        user = TestDataFactory.user();
    }

    private void userExists() {
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(user);
    }

    private static ResponseEntity<String> ok(String body) {
        return ResponseEntity.ok(body);
    }

    @Test
    void activeJobs() throws Exception {
        when(jobProxy.getAllActiveJobs()).thenReturn(ok("[jobs]"));

        mvc.perform(get("/api/job/active-jobs").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[jobs]"));
    }

    @Test
    void organizationJobsForbiddenWithoutOrganization() throws Exception {
        userExists();

        mvc.perform(get("/api/job/organization/org1").principal(PRINCIPAL))
                .andExpect(status().isForbidden())
                .andExpect(content().string("User does not have any organization"));
        verifyNoInteractions(jobProxy);
    }

    @Test
    void organizationJobsForUserWithOrganization() throws Exception {
        user.setHasAnyOrganization(true);
        userExists();
        when(jobProxy.getAllJobsOfAnOrganization("org1")).thenReturn(ok("[org jobs]"));

        mvc.perform(get("/api/job/organization/org1").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[org jobs]"));
    }

    @Test
    void appliedJobsSendUsersAppliedIds() throws Exception {
        user.getAppliedJobs().add("j1");
        userExists();
        when(jobProxy.getAllJobsAppliedByUser(List.of("j1"))).thenReturn(ok("[applied]"));

        mvc.perform(get("/api/job/user/applied").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[applied]"));
    }

    @Test
    void savedJobsShortCircuitWhenNothingSaved() throws Exception {
        userExists();

        mvc.perform(get("/api/job/user/saved").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[]"));
        verifyNoInteractions(jobProxy);
    }

    @Test
    void savedJobsAreFetchedWhenPresent() throws Exception {
        user.getSavedJobs().add("j9");
        userExists();
        when(jobProxy.getAllJobsSavedByUser(List.of("j9"))).thenReturn(ok("[saved]"));

        mvc.perform(get("/api/job/user/saved").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[saved]"));
    }

    @Test
    void generateInterviewQuestionsForwardsRequest() throws Exception {
        when(jobProxy.generateInterviewQuestions(any(InterviewQuestionsGenerateRequest.class))).thenReturn(ok("[q]"));

        mvc.perform(post("/api/job/generate/interview-questions").principal(PRINCIPAL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"jobDescription\":\"Java dev\"}"))
                .andExpect(status().isOk()).andExpect(content().string("[q]"));
    }

    @Test
    void createJobEnrichesRequestWithCompanyInfoAndCreator() throws Exception {
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        when(organizationService.getOrganizationById("org1")).thenReturn(org);
        userExists();
        when(jobProxy.createJob(any(JobCreationRequest.class))).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body("created"));

        mvc.perform(post("/api/job/organization/org1").principal(PRINCIPAL)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isCreated()).andExpect(content().string("created"));

        ArgumentCaptor<JobCreationRequest> captor = ArgumentCaptor.forClass(JobCreationRequest.class);
        verify(jobProxy).createJob(captor.capture());
        JobCreationRequest sent = captor.getValue();
        assertThat(sent.getCreatedBy()).isEqualTo(user.getId().toString());
        assertThat(sent.getCompanyInfo().getOrganizationId()).isEqualTo("org1");
        assertThat(sent.getCompanyInfo().getOrganizationEmail()).isEqualTo(EMAIL);
        assertThat(sent.getCompanyInfo().getOrganizationName()).isEqualTo("Acme");
    }

    @Test
    void jobById() throws Exception {
        when(jobProxy.getJobById("j1")).thenReturn(ok("job"));

        mvc.perform(get("/api/job/j1")).andExpect(status().isOk()).andExpect(content().string("job"));
    }

    @Test
    void deleteJobPassesCallerEmail() throws Exception {
        when(jobProxy.deleteJobById("j1", EMAIL)).thenReturn(ok("deleted"));

        mvc.perform(delete("/api/job/j1").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("deleted"));
    }

    // ---------------------------------------------------------- apply / withdraw

    @Test
    void applyUpdatesUserOnSuccess() throws Exception {
        userExists();
        when(jobProxy.applyToAJob(new JobApplicationRequest("j1", EMAIL, user.getId().toString(), "Jane Doe")))
                .thenReturn(ok("applied"));

        mvc.perform(post("/api/job/j1/apply").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("applied"));

        assertThat(user.getNumberOfAppliedJobs()).isEqualTo(1);
        assertThat(user.getAppliedJobs()).containsExactly("j1");
        verify(userService).saveUpdatedUser(user);
    }

    @Test
    void applyDoesNotTouchUserWhenDownstreamRejects() throws Exception {
        userExists();
        when(jobProxy.applyToAJob(any())).thenReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST).body("closed"));

        mvc.perform(post("/api/job/j1/apply").principal(PRINCIPAL))
                .andExpect(status().isBadRequest()).andExpect(content().string("closed"));

        assertThat(user.getAppliedJobs()).isEmpty();
        verifyNoInteractions(userService);
    }

    @Test
    void withdrawRejectedWhenNotApplied() throws Exception {
        userExists();

        mvc.perform(post("/api/job/j1/withdraw").principal(PRINCIPAL))
                .andExpect(status().isBadRequest()).andExpect(content().string("Job not in applied list"));
        verifyNoInteractions(jobProxy);
    }

    @Test
    void withdrawUpdatesUserOnSuccess() throws Exception {
        user.getAppliedJobs().add("j1");
        user.setNumberOfAppliedJobs(1);
        userExists();
        when(jobProxy.withdrawApplicationFromAJob(any(JobApplicationRequest.class))).thenReturn(ok("withdrawn"));

        mvc.perform(post("/api/job/j1/withdraw").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("withdrawn"));

        assertThat(user.getNumberOfAppliedJobs()).isZero();
        assertThat(user.getAppliedJobs()).isEmpty();
        verify(userService).saveUpdatedUser(user);
    }

    @Test
    void withdrawKeepsUserUntouchedWhenDownstreamFails() throws Exception {
        user.getAppliedJobs().add("j1");
        userExists();
        when(jobProxy.withdrawApplicationFromAJob(any())).thenReturn(ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("x"));

        mvc.perform(post("/api/job/j1/withdraw").principal(PRINCIPAL)).andExpect(status().isBadGateway());

        assertThat(user.getAppliedJobs()).containsExactly("j1");
        verifyNoInteractions(userService);
    }

    // ----------------------------------------------------------- save / unsave

    @Test
    void saveAddsJobToUsersSavedList() throws Exception {
        userExists();
        when(jobProxy.getJobById("j1")).thenReturn(ok("job-json"));

        mvc.perform(post("/api/job/j1/save").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("job-json"));

        assertThat(user.getSavedJobs()).containsExactly("j1");
        verify(userService).saveUpdatedUser(user);
    }

    @Test
    void saveRejectsDuplicate() throws Exception {
        user.getSavedJobs().add("j1");
        userExists();
        when(jobProxy.getJobById("j1")).thenReturn(ok("job-json"));

        mvc.perform(post("/api/job/j1/save").principal(PRINCIPAL))
                .andExpect(status().isBadRequest()).andExpect(content().string("Job already saved"));
        verifyNoInteractions(userService);
    }

    @Test
    void unsaveRemovesJob() throws Exception {
        user.getSavedJobs().add("j1");
        userExists();

        mvc.perform(post("/api/job/j1/unsave").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("Job removed from saved list"));

        assertThat(user.getSavedJobs()).isEmpty();
        verify(userService).saveUpdatedUser(user);
    }

    @Test
    void unsaveRejectsJobNotSaved() throws Exception {
        userExists();

        mvc.perform(post("/api/job/j1/unsave").principal(PRINCIPAL))
                .andExpect(status().isBadRequest()).andExpect(content().string("Job not in saved list"));
    }

    // ------------------------------------------------ shortlist / finalist / reject

    private void candidatesMapped() {
        when(jobService.mapToCandidateInfo(any(ShortlistRequest.class)))
                .thenReturn(List.of(new candidateInfo("c1", "Cand", "c@x.com")));
    }

    @Test
    void shortlistForwardsMappedCandidates() throws Exception {
        candidatesMapped();
        when(jobProxy.shortlistCandidatesOfAJob(eq("j1"), any(ShortlistForwardWrapper.class))).thenReturn(ok("shortlisted"));

        mvc.perform(post("/api/job/j1/shortlist").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateIds\":[\"c1\"]}"))
                .andExpect(status().isOk()).andExpect(content().string("shortlisted"));

        ArgumentCaptor<ShortlistForwardWrapper> captor = ArgumentCaptor.forClass(ShortlistForwardWrapper.class);
        verify(jobProxy).shortlistCandidatesOfAJob(eq("j1"), captor.capture());
        assertThat(captor.getValue().candidates()).extracting(candidateInfo::candidateEmail).containsExactly("c@x.com");
    }

    @Test
    void finalistForwardsMappedCandidates() throws Exception {
        candidatesMapped();
        when(jobProxy.finalistCandidatesOfAJob(eq("j1"), any())).thenReturn(ok("finalists"));

        mvc.perform(post("/api/job/j1/finalist").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateIds\":[\"c1\"]}"))
                .andExpect(status().isOk()).andExpect(content().string("finalists"));
    }

    @Test
    void rejectForwardsStatusAndCandidates() throws Exception {
        candidatesMapped();
        when(jobProxy.rejectCandidatesOfAJob(eq("j1"), eq("SHORTLISTED"), any())).thenReturn(ok("rejected"));

        mvc.perform(post("/api/job/j1/reject/status/SHORTLISTED").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateIds\":[\"c1\"]}"))
                .andExpect(status().isOk()).andExpect(content().string("rejected"));
    }

    @Test
    void interviewQuestionsOfAJob() throws Exception {
        when(jobProxy.getInterviewQuestionsOfAJob("j1")).thenReturn(ok("[qs]"));

        mvc.perform(get("/api/job/j1/questions").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[qs]"));
    }

    // -------------------------------------------------------------- suggestions

    @Test
    void suggestionsRequireResume() throws Exception {
        userExists();

        mvc.perform(get("/api/job/suggestions").principal(PRINCIPAL))
                .andExpect(status().isNotFound());
        verifyNoInteractions(jobProxy);
    }

    @Test
    void suggestionsForCandidateWithResume() throws Exception {
        user.setHasResume(true);
        userExists();
        when(jobProxy.getJobSuggestionsForCandidate(user.getId().toString())).thenReturn(ok("[sugg]"));

        mvc.perform(get("/api/job/suggestions").principal(PRINCIPAL))
                .andExpect(status().isOk()).andExpect(content().string("[sugg]"));
    }
}
