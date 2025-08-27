package com.example.server.job.Controller;

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

    private static final Logger logger = Logger.getLogger(JobController.class.getName());
    private        final JobProxy jobProxy;
    private        final UserDetailsService userDetailsService;


    public JobController(JobProxy           jobProxy,
                         UserDetailsService userDetailsService) {

        this.userDetailsService = userDetailsService;
        this.jobProxy           = jobProxy;
    }


    @GetMapping("/{OrganizationId}")
    public ResponseEntity<String> getAllJobsOfAnOrganization(@PathVariable("OrganizationId") String OrganizationId,
                                                                                       Principal principal ) {
        try {

            logger.info("Get all the jobs under a Organization request received from" + principal.getName());

            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            if(!user.isHasAnyOrganization()){
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("User does not have any organization");
            }

            return ResponseEntity.status(HttpStatus.OK)
                    .body(jobProxy.getAllJobsOfAnOrganization(OrganizationId));

        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }


    @PostMapping("/create")
    public ResponseEntity<String> createJob(@RequestBody JobCreationRequest jobCreationRequest,
                                                         Principal principal ) {
        try {
            logger.info(" Job creation request received from user: " + principal.getName() +
                             " For the Organization: " + jobCreationRequest.getCompanyInfo().getOrganizationId());

            String response = jobProxy.createJob(jobCreationRequest);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(response);

        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }


    @GetMapping("/{jobId}")
    public ResponseEntity<String> getJobById(@PathVariable ("jobId") String jobId, Principal principal) {
        try {
            logger.info("getJobById request received for jobId: " + jobId + " from user: " + principal.getName());

            return ResponseEntity.status(HttpStatus.OK)
                    .body(jobProxy.getJobById(jobId));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }



    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJobById(@PathVariable ("jobId") String jobId, Principal principal) {
        try {

            logger.info("deleteJobById request received for jobId: " + jobId + " from user: " + principal.getName());

            return ResponseEntity.status(HttpStatus.OK)
                    .body(jobProxy.deleteJobById(jobId, principal.getName()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }


}
