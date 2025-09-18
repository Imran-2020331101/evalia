package com.example.server.job.Controller;

import com.example.server.UserProfile.Service.OrganizationService;
import com.example.server.UserProfile.Service.UserService;
import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.job.DTO.*;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.job.Service.JobService;
import com.example.server.resume.exception.ResumeNotFoundException;
import com.example.server.security.models.userEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/job")
public class JobController {

    private static final Logger             logger = Logger.getLogger(JobController.class.getName());
    private        final JobProxy           jobProxy;
    private        final UserDetailsService userDetailsService;
    private final UserService               userService;
    private final OrganizationService       organizationService;
    private final JobService jobService;


    public JobController(JobProxy            jobProxy,
                         UserDetailsService  userDetailsService,
                         UserService         userService,
                         OrganizationService organizationService,
                         JobService          jobService) {

        this.userDetailsService  = userDetailsService;
        this.jobProxy            = jobProxy;
        this.userService         = userService;
        this.organizationService = organizationService;
        this.jobService          = jobService;
    }

    @GetMapping("/active-jobs")
    public ResponseEntity<String> getAllActiveJobs(Principal principal) {
        logger.info("Received get job request from "+ principal.getName());
        ResponseEntity<String> response = jobProxy.getAllActiveJobs();

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/organization/{OrganizationId}")
    public ResponseEntity<String> getAllJobsOfAnOrganization(@PathVariable("OrganizationId") String OrganizationId,
                                                                                        Principal principal ) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(!user.isHasAnyOrganization()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                      .body("User does not have any organization");
        }
        ResponseEntity<String> response = jobProxy.getAllJobsOfAnOrganization(OrganizationId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/user/applied")
    public ResponseEntity<String> getAllJobsAppliedByUser(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        ResponseEntity<String> response = jobProxy.getAllJobsAppliedByUser(user.getAppliedJobs());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/user/saved")
    public ResponseEntity<String> getAllJobsSavedByUser(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(user.getSavedJobs().isEmpty()){
            return ResponseEntity.status(HttpStatus.OK)
                    .body("[]");
        }
        ResponseEntity<String> response = jobProxy.getAllJobsSavedByUser(user.getSavedJobs());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("generate/interview-questions")
    public ResponseEntity<String> generateInterviewQuestions(@RequestBody InterviewQuestionsGenerateRequest request,
                                                            Principal principal) {
        logger.info("Received generate interview questions request from "+ request.requirements());
        ResponseEntity<String> response = jobProxy.generateInterviewQuestions(request);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/organization/{OrganizationId}")
    public ResponseEntity<String> createJob(@PathVariable ("OrganizationId") String OrganizationId,
                                            @RequestBody   JobCreationRequest jobCreationRequest,
                                                           Principal principal ) {

        OrganizationEntity org = organizationService.getOrganizationById(OrganizationId);
        userEntity user        = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        jobCreationRequest.setCompanyInfo(
                new JobCreationRequest.CompanyInfo(OrganizationId, principal.getName(), org.getOrganizationName()));
        jobCreationRequest.setCreatedBy(user.getId().toString());

        logger.info(" Job creation request received from user: " + principal.getName() +
                " For the Organization: " + jobCreationRequest.getCompanyInfo());

        ResponseEntity<String> response = jobProxy.createJob(jobCreationRequest);

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }


    @GetMapping("/{jobId}")
    public ResponseEntity<String> getJobById(@PathVariable ("jobId") String jobId) {

        ResponseEntity<String> response = jobProxy.getJobById(jobId);
            return ResponseEntity.status(response.getStatusCode())
                    .body(response.getBody());
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJobById(@PathVariable ("jobId") String jobId, Principal principal) {
        ResponseEntity<String> response =jobProxy.deleteJobById(jobId, principal.getName());

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> applyToAJob(@PathVariable("jobId") String jobId, Principal principal) {

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        ResponseEntity<String> response = jobProxy.applyToAJob(
                new JobApplicationRequest(jobId, principal.getName(),user.getId().toString(), user.getDisplayName()));

        if(response.getStatusCode().equals(HttpStatus.OK)){
            logger.info("User: " + principal.getName() + " applied to job: " + jobId);
            user.setNumberOfAppliedJobs(user.getNumberOfAppliedJobs() + 1);
            user.getAppliedJobs().add(jobId);
            userService.saveUpdatedUser(user);
        }

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/withdraw")
    public ResponseEntity<String> withdrawApplicationFromAJob(@PathVariable("jobId") String jobId, Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(!user.getAppliedJobs().contains(jobId)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Job not in applied list");
        }
        ResponseEntity<String> response = jobProxy.withdrawApplicationFromAJob(
                new JobApplicationRequest(jobId, principal.getName(),user.getId().toString(), user.getDisplayName()));

        if(response.getStatusCode().equals(HttpStatus.OK)){
            logger.info("User: " + principal.getName() + " withdrew application from job: " + jobId);
            user.setNumberOfAppliedJobs(user.getNumberOfAppliedJobs() - 1);
            user.getAppliedJobs().remove(jobId);
            userService.saveUpdatedUser(user);
        }

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/save")
    public ResponseEntity<String> saveAJob(@PathVariable("jobId") String jobId, Principal principal) {

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        ResponseEntity<String> response = jobProxy.getJobById(jobId);

        if(user.getSavedJobs().contains(jobId)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Job already saved");
        }

        user.getSavedJobs().add(jobId);
        userService.saveUpdatedUser(user);
        return ResponseEntity.status(HttpStatus.OK)
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/unsave")
    public ResponseEntity<String> unsaveAJob(@PathVariable("jobId") String jobId, Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(!user.getSavedJobs().contains(jobId)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Job not in saved list");
        }
        user.getSavedJobs().remove(jobId);
        userService.saveUpdatedUser(user);
        return ResponseEntity.status(HttpStatus.OK)
                .body("Job removed from saved list");
    }

    @PostMapping("/{jobId}/shortlist")
    public ResponseEntity<String> shortlistCandidatesOfAJob(@PathVariable("jobId") String jobId, @RequestBody ShortlistRequest shortlistRequest) {

        List<candidateInfo> candidates  = jobService.mapToCandidateInfo(shortlistRequest);
        ResponseEntity<String> response = jobProxy.shortlistCandidatesOfAJob(jobId, new ShortlistForwardWrapper(candidates));

        logger.info(response.getBody());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/finalist")
    public ResponseEntity<String> finalistCandidatesOfAJob(@PathVariable("jobId") String jobId, @RequestBody ShortlistRequest shortlistRequest) {

        logger.info("finalistCandidatesOfAJob " + jobId + " " + shortlistRequest.toString());

        List<candidateInfo> candidates  = jobService.mapToCandidateInfo(shortlistRequest);
        ResponseEntity<String> response = jobProxy.finalistCandidatesOfAJob(jobId, new ShortlistForwardWrapper(candidates));

        logger.info(response.getBody());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/reject/status/{status}")
    public ResponseEntity<String> rejectCandidatesOfAJob(@PathVariable("jobId") String jobId,
                                                         @PathVariable("status") String status,
                                                         @RequestBody ShortlistRequest shortlistRequest) {

        logger.info("rejectCandidatesOfAJob " + jobId + " " + shortlistRequest.toString());

        List<candidateInfo> candidates  = jobService.mapToCandidateInfo(shortlistRequest);
        ResponseEntity<String> response = jobProxy.rejectCandidatesOfAJob(jobId,status, new ShortlistForwardWrapper(candidates));

        logger.info(response.getBody());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }



    @GetMapping("/{jobId}/questions")
    public ResponseEntity<String> getInterviewQuestionsOfAJob(@PathVariable("jobId") String jobId, Principal principal) {
        ResponseEntity<String> response = jobProxy.getInterviewQuestionsOfAJob(jobId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }


    @GetMapping("/suggestions")
    public ResponseEntity<String> getJobSuggestionsForCandidate(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if (!user.isHasResume()) {
           throw new ResumeNotFoundException("Complete profile by uploading resume to get suggestions");
        }
        ResponseEntity<String> response = jobProxy.getJobSuggestionsForCandidate(user.getId().toString());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }



}
