package com.example.server.job.Proxy;

import com.example.server.job.DTO.JobApplicationRequest;
import com.example.server.job.DTO.JobCreationRequest;
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
    String getAllActiveJobs();

    @GetMapping    (value = "/organization/{OrganizationId}")
    String getAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @PostMapping(value = "/user/applied")
    ResponseEntity<String> getAllJobsAppliedByUser(@RequestBody List<String> jobIds);

    @PostMapping(value = "/user/saved")
    ResponseEntity<String> getAllJobsSavedByUser(@RequestBody List<String> jobIds);

    @PostMapping   (value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    String createJob     ( @RequestBody   JobCreationRequest jobCreationRequest);

    @GetMapping    (value = "/{jobId}")
    ResponseEntity<String> getJobById    ( @PathVariable ("jobId") String jobId);

    @DeleteMapping (value = "/{jobId}")
    String deleteJobById ( @PathVariable ("jobId") String jobId,
                           @RequestParam ("email") String email);



    @DeleteMapping (value = "/organization/{OrganizationId}")
    String deleteAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @PostMapping   (value = "/apply", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> applyToAJob     (@RequestBody JobApplicationRequest jobApplicationRequest);

    @PostMapping   (value = "/shortlist", consumes = MediaType.APPLICATION_JSON_VALUE)
    String shortlistCandidatesOfAJob     ( @RequestBody JobApplicationRequest jobApplicationRequest);


}
