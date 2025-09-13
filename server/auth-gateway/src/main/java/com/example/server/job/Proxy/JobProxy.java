package com.example.server.job.Proxy;

import com.example.server.job.DTO.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "jobClient",
             url  = "http://localhost:7000/api/jobs")
public interface JobProxy {

    @GetMapping(value = "/")
    ResponseEntity<String> getAllActiveJobs();

    @GetMapping    (value = "/organization/{OrganizationId}")
    ResponseEntity<String> getAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @PostMapping(value = "/user/applied")
    ResponseEntity<String> getAllJobsAppliedByUser(@RequestBody List<String> jobIds);

    @PostMapping(value = "/user/saved")
    ResponseEntity<String> getAllJobsSavedByUser(@RequestBody List<String> jobIds);

    @PostMapping(value = "/generate/interview-questions")
    ResponseEntity<String> generateInterviewQuestions(@RequestBody InterviewQuestionsGenerateRequest request);

    @PostMapping   (value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> createJob     ( @RequestBody   JobCreationRequest jobCreationRequest);

    @GetMapping    (value = "/{jobId}")
    ResponseEntity<String> getJobById    ( @PathVariable ("jobId") String jobId);

    @DeleteMapping (value = "/{jobId}")
    ResponseEntity<String> deleteJobById ( @PathVariable ("jobId") String jobId,
                           @RequestParam ("email") String email);


    @DeleteMapping (value = "/organization/{OrganizationId}")
    ResponseEntity<String> deleteAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @PostMapping   (value = "/apply", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> applyToAJob     (@RequestBody JobApplicationRequest jobApplicationRequest);

    @PostMapping   (value = "/withdraw", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> withdrawApplicationFromAJob(JobApplicationRequest jobApplicationRequest);

    @PostMapping   (value = "/{jobId}/shortlist", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> shortlistCandidatesOfAJob     (@PathVariable("jobId") String jobId,
                                                          @RequestBody ShortlistForwardWrapper shortlistForwardWrapper);

    @GetMapping(value = "/{jobId}/interview-questions")
    ResponseEntity<String> getInterviewQuestionsOfAJob(@PathVariable("jobId") String jobId);

    @GetMapping(value = "/candidates/{candidateId}/suggestions")
    public ResponseEntity<String> getJobSuggestionsForCandidate(@PathVariable("candidateId") String candidateId);
}
