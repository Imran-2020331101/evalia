package com.example.server.job.Controller;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.job.DTO.JobApplicationRequest;
import com.example.server.job.DTO.JobCreationRequest;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/job")
public class JobController {

    private static final Logger             logger = Logger.getLogger(JobController.class.getName());
    private        final JobProxy           jobProxy;
    private        final UserDetailsService userDetailsService;
    private final UserService userService;


    public JobController(JobProxy           jobProxy,
                         UserDetailsService userDetailsService, UserService userService) {

        this.userDetailsService = userDetailsService;
        this.jobProxy           = jobProxy;
        this.userService = userService;
    }

    @GetMapping("/active-jobs")
    public ResponseEntity<String> getAllActiveJobs(Principal principal) {
        logger.info("Received get job request from "+ principal.getName());
        return ResponseEntity.status(HttpStatus.OK)
                .body(jobProxy.getAllActiveJobs());
    }

    @GetMapping("/organization/{OrganizationId}")
    public ResponseEntity<String> getAllJobsOfAnOrganization(@PathVariable("OrganizationId") String OrganizationId,
                                                                                        Principal principal ) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(!user.isHasAnyOrganization()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                      .body("User does not have any organization");
        }
        return ResponseEntity.status(HttpStatus.OK)
                .body(jobProxy.getAllJobsOfAnOrganization(OrganizationId));
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
        ResponseEntity<String> response = jobProxy.getAllJobsSavedByUser(user.getSavedJobs());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }


    @PostMapping("/organization/{OrganizationId}")
    public ResponseEntity<String> createJob(@PathVariable ("OrganizationId") String OrganizationId,
                                            @RequestBody   JobCreationRequest jobCreationRequest,
                                                           Principal principal ) {

            jobCreationRequest.setCompanyInfo(
                    new JobCreationRequest.CompanyInfo(OrganizationId, principal.getName()));


            logger.info(" Job creation request received from user: " + principal.getName() +
                             " For the Organization: " + jobCreationRequest.getCompanyInfo());

            String response = jobProxy.createJob(jobCreationRequest);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(response);

    }


    @GetMapping("/{jobId}")
    public ResponseEntity<String> getJobById(@PathVariable ("jobId") String jobId) {

            return ResponseEntity.status(HttpStatus.OK)
                    .body(jobProxy.getJobById(jobId));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJobById(@PathVariable ("jobId") String jobId, Principal principal) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(jobProxy.deleteJobById(jobId, principal.getName()));
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> applyToAJob(@PathVariable("jobId") String jobId, Principal principal) {

        ResponseEntity<String> response = jobProxy.applyToAJob(
                new JobApplicationRequest(jobId, principal.getName()));

        if(response.getStatusCode().equals(HttpStatus.OK)){
            logger.info("User: " + principal.getName() + " applied to job: " + jobId);
            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            user.setNumberOfAppliedJobs(user.getNumberOfAppliedJobs() + 1);
            user.getAppliedJobs().add(jobId);
            userService.saveUpdatedUser(user);
        }

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{jobId}/save")
    public ResponseEntity<String> saveAJob(@PathVariable("jobId") String jobId, Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        if(user.getSavedJobs().contains(jobId)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Job already saved");
        }
        user.getSavedJobs().add(jobId);
        userService.saveUpdatedUser(user);
        return ResponseEntity.status(HttpStatus.OK)
                .body("Job saved successfully");
    }

    @PostMapping("/{jobId}/shortlist")
    public ResponseEntity<String> shortlistCandidatesOfAJob(@PathVariable("jobId") String jobId, Principal principal) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(jobProxy.shortlistCandidatesOfAJob(
                        new JobApplicationRequest(jobId, principal.getName())
                ));
    }

}
