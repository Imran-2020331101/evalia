package com.example.server.job.Controller;

import com.example.server.job.DTO.JobCreationRequest;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
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
    private final JobProxy jobProxy;
    private final UserDetailsService userDetailsService;


    public JobController(JobProxy jobProxy, UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.jobProxy = jobProxy;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createJob(@RequestBody JobCreationRequest jobCreationRequest, Principal principal) {
        try {
            logger.info("createJob request received from user: " + principal.getName());
            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            jobCreationRequest.setCompanyInfo(new JobCreationRequest.CompanyInfo(user.getId().toString(), principal.getName()));
            String response = jobProxy.createJob(jobCreationRequest);
            logger.info("Job created successfully: " + response);
            return ResponseEntity.ok(response);

        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }
}
